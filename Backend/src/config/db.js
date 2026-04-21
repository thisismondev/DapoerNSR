const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(1082, (val) => val);

const appEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'dev').toLowerCase();
const selectedDatabaseUrl = appEnv === 'prod' || appEnv === 'production' ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;

const connectionString = selectedDatabaseUrl || process.env.DB_URL;

if (!connectionString) {
  throw new Error(`Database URL is missing for APP_ENV='${appEnv}'. Set DATABASE_URL_DEV/DATABASE_URL_PROD or DB_URL.`);
}


const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
