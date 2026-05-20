const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// UC02 — Cadastro
exports.cadastro = async (req, res) => {
  const { nome, email, senha, nivel_acesso } = req.body;
  try {
    const existe = await pool.query(
      'SELECT id FROM Usuario WHERE email = $1', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO Usuario (nome, email, senha_hash, nivel_acesso)
       VALUES ($1, $2, $3, $4) RETURNING id, nome, email, nivel_acesso`,
      [nome, email, senhaHash, nivel_acesso || 'Cliente']
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: resultado.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// UC01 — Login
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const resultado = await pool.query(
      'SELECT * FROM Usuario WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, nivel: usuario.nivel_acesso },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel_acesso
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};