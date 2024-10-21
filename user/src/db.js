

// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db',  // Use the service name defined in your Docker Compose
  database: 'mydatabase',
  password: 'pass',
  port: 5432,
});

module.exports = { pool };


