const path = require('path');
const dotenv = require('dotenv');
const { runner } = require('node-pg-migrate');

const ROOT_DIR = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const env = (process.argv[2] || 'dev').toLowerCase();
const direction = (process.argv[3] || 'up').toLowerCase();

if (!['dev', 'prod'].includes(env)) {
  console.error("Invalid environment. Use 'dev' or 'prod'.");
  process.exit(1);
}

if (!['up', 'down'].includes(direction)) {
  console.error("Invalid direction. Use 'up' or 'down'.");
  process.exit(1);
}

const databaseUrl = env === 'prod' ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;
if (!databaseUrl) {
  console.error(`Missing database URL for ${env}. Please set ${env === 'prod' ? 'DATABASE_URL_PROD' : 'DATABASE_URL_DEV'}.`);
  process.exit(1);
}

(async () => {
  try {
    const results = await runner({
      databaseUrl,
      dir: path.join(ROOT_DIR, 'migrations'),
      direction,
      migrationsTable: 'pgmigrations',
      createMigrationsSchema: true,
      createMigrationsTable: true,
      log: () => undefined,
      noLock: false,
      verbose: true,
      checkOrder: false,
      ignorePattern: '(?:^\\.|~$|\\.sql$)',
    });

    if (!results.length) {
      console.log(`No migrations to run for ${env} (${direction}).`);
      return;
    }

    console.log(`Migration ${direction} on ${env} completed:`);
    for (const item of results) {
      console.log(`- ${item.name}`);
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
})();
