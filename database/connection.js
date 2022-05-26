const { Pool } = require('pg');
require('dotenv/config');

const pool = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASSWORD,
  database: process.env.PGSQL_DATABASE_NAME,
  host: process.env.PGSQL_HOST,
  port: 5432 // Default port
});

module.exports = pool;