// auth.controller.js — UC01, UC02 + recuperação de senha
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// UC02 — Cadastro (cria Usuario + perfil Cliente automaticamente)
exports.cadastro = async (req, res) => {
  const { nome, email, senha, nivel_acesso, telefone } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existe = await client.query('SELECT id FROM Usuario WHERE email=$1', [email]);
    if (existe.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const nivel = nivel_acesso || 'Cliente';
    const usuarioRes = await client.query(
      `INSERT INTO Usuario (nome, email, senha_hash, nivel_acesso)
       VALUES ($1,$2,$3,$4) RETURNING id, nome, email, nivel_acesso`,
      [nome, email, senhaHash, nivel]
    );
    const usuario = usuarioRes.rows[0];
    if (nivel === 'Cliente') {
      await client.query(
        `INSERT INTO Cliente (usuario_id, nome_completo, telefone, aceitou_lgpd, data_aceite_lgpd)
         VALUES ($1,$2,$3,true,NOW())`,
        [usuario.id, nome, telefone || 'A preencher']
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  } finally { client.release(); }
};

// UC01 — Login
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await pool.query(
      'SELECT * FROM Usuario WHERE email=$1 AND deleted_at IS NULL', [email]
    );
    if (r.rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    const usuario = r.rows[0];
    const ok = await bcrypt.compare(senha, usuario.senha_hash);
    if (!ok) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, nivel: usuario.nivel_acesso },
      process.env.JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({ mensagem:'Login realizado!', token, usuario:{ id:usuario.id, nome:usuario.nome, email:usuario.email, nivel:usuario.nivel_acesso } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Recuperação — Etapa 1: verificar se e-mail existe
exports.verificarEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const r = await pool.query(
      'SELECT id FROM Usuario WHERE email=$1 AND deleted_at IS NULL', [email]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'E-mail não encontrado.' });
    res.json({ mensagem: 'E-mail confirmado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
};

// Recuperação — Etapa 2: redefinir senha
exports.redefinirSenha = async (req, res) => {
  const { email, novaSenha } = req.body;
  if (!novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  try {
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    const r = await pool.query(
      `UPDATE Usuario SET senha_hash=$1, updated_at=NOW()
       WHERE email=$2 AND deleted_at IS NULL RETURNING id`,
      [senhaHash, email]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
};
