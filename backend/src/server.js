// server.js — Backend completo
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const permitidas = [
      'http://localhost:5173',
      'https://artesanato-c8myjyk6g-joaocarlosvbs-projects.vercel.app',
    ];
    if (!origin || permitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado: ' + origin));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => res.json({ mensagem: '✅ API funcionando!' }));

app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/produtos',     require('./routes/produtos.routes'));
app.use('/api/fornecedores', require('./routes/fornecedores.routes'));
app.use('/api/materiaprima', require('./routes/materiaprima.routes'));
app.use('/api/pedidos',      require('./routes/pedidos.routes'));
app.use('/api/compras',      require('./routes/compras.routes'));
app.use('/api/consumo',      require('./routes/consumo.routes'));
app.use('/api/clientes',     require('./routes/clientes.routes'));
app.use('/api/usuarios',     require('./routes/usuarios.routes'));
app.use('/api/financeiro',   require('./routes/financeiro.routes'));
app.use('/api/relatorios',   require('./routes/relatorios.routes'));
app.use('/api/logs',         require('./routes/logs.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor em http://localhost:${PORT}`));
