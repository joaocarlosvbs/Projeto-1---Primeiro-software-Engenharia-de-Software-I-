// auth.middleware.js — com suporte ao nível Vendedor
const jwt = require('jsonwebtoken');

// Verifica se o token JWT é válido
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }
  try {
    const dados    = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario    = dados;
    next();
  } catch {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Apenas Administrador
const apenasAdmin = (req, res, next) => {
  if (req.usuario.nivel !== 'Administrador') {
    return res.status(403).json({ erro: 'Acesso restrito ao Administrador.' });
  }
  next();
};

// Administrador OU Vendedor (operações comerciais)
const adminOuVendedor = (req, res, next) => {
  const niveisPermitidos = ['Administrador', 'Vendedor'];
  if (!niveisPermitidos.includes(req.usuario.nivel)) {
    return res.status(403).json({ erro: 'Acesso restrito a Administrador ou Vendedor.' });
  }
  next();
};

module.exports = { verificarToken, apenasAdmin, adminOuVendedor };
