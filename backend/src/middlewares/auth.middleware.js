// auth.middleware.js — Proteção de rotas privadas
// Verifica se o token JWT enviado pelo frontend é válido.
// Rotas que usarem este middleware só funcionam para usuários logados.

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // O token vem no header "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Decodifica o token e coloca os dados do usuário em req.usuario
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados;
    next(); // Segue para a rota protegida
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Middleware adicional: verifica se o usuário é Administrador
const apenasAdmin = (req, res, next) => {
  if (req.usuario.nivel !== 'Administrador') {
    return res.status(403).json({ erro: 'Acesso restrito ao Administrador.' });
  }
  next();
};

module.exports = { verificarToken, apenasAdmin };
