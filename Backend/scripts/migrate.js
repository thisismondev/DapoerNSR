require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';
const ADVISORY_LOCK_KEY = 64017021;
const LOCK_TIMEOUT_MS = Number(process.env.MIGRATION_LOCK_TIMEOUT_MS || 15000);
const LOCK_RETRY_MS = Number(process.env.MIGRATION_LOCK_RETRY_MS || 500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function acquireAdvisoryLock(client) {
  const timeoutAt = Date.now() + LOCK_TIMEOUT_MS;

  while (Date.now() < timeoutAt) {
    const result = await client.query('SELECT pg_try_advisory_lock($1) AS acquired', [ADVISORY_LOCK_KEY]);
    if (result.rows[0].acquired) {
      return true;
    }

    await sleep(LOCK_RETRY_MS);
  }

  throw new Error(`Failed to acquire migration advisory lock within ${LOCK_TIMEOUT_MS}ms`);
}

async function releaseAdvisoryLock(client) {
  await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id BIGSERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(`
    SELECT version, checksum
    FROM ${MIGRATIONS_TABLE};
  `);

  return new Map(result.rows.map((row) => [row.version, row.checksum]));
}

async function executeMigration(client, version, sql, checksum) {
  await client.query('BEGIN');

  try {
    await client.query(sql);
    await client.query(
      `
      INSERT INTO ${MIGRATIONS_TABLE} (version, checksum)
      VALUES ($1, $2);
      `,
      [version, checksum],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function runMigrations() {
  let client;
  let lockAcquired = false;

  try {
    client = await pool.connect();
    await acquireAdvisoryLock(client);
    lockAcquired = true;

    await ensureMigrationsTable(client);

    const appliedMigrations = await getAppliedMigrations(client);
    const migrationFiles = getMigrationFiles();

    console.log(`[migrate] Found ${migrationFiles.length} migration file(s)`);

    for (const fileName of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, fileName);
      const sql = fs.readFileSync(filePath, 'utf8');
      const checksum = calculateChecksum(sql);

      if (appliedMigrations.has(fileName)) {
        const storedChecksum = appliedMigrations.get(fileName);
        if (storedChecksum !== checksum) {
          throw new Error(`Checksum mismatch for applied migration ${fileName}. ` + 'Create a new migration file instead of changing existing history.');
        }

        console.log(`[migrate] Skip ${fileName} (already applied)`);
        continue;
      }

      console.log(`[migrate] Apply ${fileName}`);
      await executeMigration(client, fileName, sql, checksum);
      console.log(`[migrate] Applied ${fileName}`);
    }

    console.log('[migrate] All migrations are up to date');
  } catch (error) {
    console.error('[migrate] Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      if (lockAcquired) {
        try {
          await releaseAdvisoryLock(client);
        } catch (unlockError) {
          console.error('[migrate] Failed to release advisory lock:', unlockError.message);
          if (!process.exitCode) {
            process.exitCode = 1;
          }
        }
      }

      client.release();
    }

    await pool.end();
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

runMigrations();
