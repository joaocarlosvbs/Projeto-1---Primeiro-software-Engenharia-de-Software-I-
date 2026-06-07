const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    const ok = !origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app');
    ok ? cb(null,true) : cb(new Error('CORS bloqueado'));
  },
  credentials: true,
}));
app.use(express.json());

// Serve imagens locais (apenas em desenvolvimento)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => res.json({ mensagem: '✅ API Vitrine Bordados!' }));

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
