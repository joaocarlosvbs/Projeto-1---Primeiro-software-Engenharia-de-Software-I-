// usuarios.controller.js — UC16: Gerenciar permissões de usuários
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nome, email, nivel_acesso, created_at
       FROM Usuario WHERE deleted_at IS NULL ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar usuários.' }); }
};

// UC16 — Alterar nível de acesso
exports.alterarNivel = async (req, res) => {
  const { id } = req.params;
  const { nivel_acesso } = req.body;
  const niveisValidos = ['Administrador', 'Cliente'];

  if (!niveisValidos.includes(nivel_acesso)) {
    return res.status(400).json({ erro: 'Nível de acesso inválido.' });
  }
  // Impede que o admin remova seu próprio acesso
  if (parseInt(id) === req.usuario.id) {
    return res.status(400).json({ erro: 'Você não pode alterar seu próprio nível de acesso.' });
  }

  try {
    await pool.query(
      `UPDATE Usuario SET nivel_acesso=$1, updated_at=NOW() WHERE id=$2`,
      [nivel_acesso, id]
    );

    // UC15 — Log de auditoria
    await pool.query(
      `INSERT INTO LogsAuditoria (usuario_id, acao, detalhes)
       VALUES ($1, 'ALTERAR_PERMISSAO', $2)`,
      [req.usuario.id, `Usuário ID ${id} teve permissão alterada para ${nivel_acesso}`]
    );

    res.json({ mensagem: `Permissão alterada para ${nivel_acesso} com sucesso.` });
  } catch (err) { res.status(500).json({ erro: 'Erro ao alterar permissão.' }); }
};
