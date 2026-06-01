// db.js — Conexão com o PostgreSQL
// Pool reutiliza conexões abertas em vez de abrir uma nova a cada requisição
const { Pool } = require('pg');
require('dotenv').config();

// Usa SSL apenas se estiver conectando ao Supabase (produção)
// No PostgreSQL local o SSL não é necessário e causa erro
const usarSSL = process.env.DB_HOST && process.env.DB_HOST.includes('supabase.com');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: usarSSL ? { rejectUnauthorized: false } : false,
});

pool.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err.message);
  } else {
    console.log('✅ Banco de dados conectado!');
  }
});

module.exports = pool;
