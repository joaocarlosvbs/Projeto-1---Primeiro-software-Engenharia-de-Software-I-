const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Permite: localhost, qualquer subdominio vercel.app, e a URL customizada do .env
    const permitido =
      !origin ||
      origin.startsWith('http://localhost') ||
      origin.endsWith('.vercel.app') ||
      origin === process.env.FRONTEND_URL;

    if (permitido) {
      callback(null, true);
    } else {
      console.warn('CORS bloqueado para origem:', origin);
      callback(new Error('CORS: origem não permitida'));
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
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor em http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso.`);
    process.exit(1);
  }
});
