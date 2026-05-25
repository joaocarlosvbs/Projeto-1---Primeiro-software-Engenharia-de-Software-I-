// server.js — Backend completo com todos os UCs
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ mensagem: '✅ API Vitrine Bordados funcionando!' }));

// Autenticação
app.use('/api/auth',         require('./routes/auth.routes'));

// Catálogo e Cadastros
app.use('/api/produtos',     require('./routes/produtos.routes'));
app.use('/api/fornecedores', require('./routes/fornecedores.routes'));
app.use('/api/materiaprima', require('./routes/materiaprima.routes'));

// Operação
app.use('/api/pedidos',      require('./routes/pedidos.routes'));
app.use('/api/compras',      require('./routes/compras.routes'));
app.use('/api/consumo',      require('./routes/consumo.routes'));

// Gestão
app.use('/api/clientes',     require('./routes/clientes.routes'));
app.use('/api/usuarios',     require('./routes/usuarios.routes'));

// Financeiro e Relatórios
app.use('/api/financeiro',   require('./routes/financeiro.routes'));
app.use('/api/relatorios',   require('./routes/relatorios.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
