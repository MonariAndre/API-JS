const { Pool } = require('pg');
require('dotenv').config();

// Singleton pattern implementado pelo próprio pacote 'pg' no Pool
// Delegação simples para o método query mantendo a interface transparente e encapsulando o pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};
