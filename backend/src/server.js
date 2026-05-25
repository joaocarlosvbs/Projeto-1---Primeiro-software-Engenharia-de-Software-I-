// server.js — Ponto de entrada do backend
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: '✅ API Vitrine Bordados funcionando!' });
});

// Rotas da aplicação
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/produtos', require('./routes/produtos.routes'));
app.use('/api/pedidos', require('./routes/pedidos.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
