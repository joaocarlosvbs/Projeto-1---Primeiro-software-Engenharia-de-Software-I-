// usuarios.controller.js — com desativar usuário
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nome, email, nivel_acesso, created_at, deleted_at FROM Usuario ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar.' }); }
};

exports.alterarNivel = async (req, res) => {
  const { id } = req.params;
  const { nivel_acesso } = req.body;
  if (!['Administrador','Vendedor','Cliente'].includes(nivel_acesso))
    return res.status(400).json({ erro: 'Nível inválido.' });
  if (parseInt(id) === req.usuario.id)
    return res.status(400).json({ erro: 'Não é possível alterar seu próprio nível.' });
  try {
    await pool.query('UPDATE Usuario SET nivel_acesso=$1, updated_at=NOW() WHERE id=$2', [nivel_acesso, id]);
    await pool.query(
      `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'ALTERAR_PERMISSAO',$2)`,
      [req.usuario.id, `Usuário ${id} → ${nivel_acesso}`]
    );
    res.json({ mensagem: `Nível alterado para ${nivel_acesso}.` });
  } catch (err) { res.status(500).json({ erro: 'Erro ao alterar nível.' }); }
};

exports.desativar = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.usuario.id)
    return res.status(400).json({ erro: 'Não é possível desativar sua própria conta.' });
  try {
    const r = await pool.query('SELECT deleted_at FROM Usuario WHERE id=$1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    const jaDesativado = r.rows[0].deleted_at !== null;
    if (jaDesativado) {
      await pool.query('UPDATE Usuario SET deleted_at=NULL, updated_at=NOW() WHERE id=$1', [id]);
      res.json({ mensagem: 'Usuário reativado.' });
    } else {
      await pool.query('UPDATE Usuario SET deleted_at=NOW(), updated_at=NOW() WHERE id=$1', [id]);
      await pool.query(
        `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'DESATIVAR_USUARIO',$2)`,
        [req.usuario.id, `Usuário ${id} desativado`]
      );
      res.json({ mensagem: 'Usuário desativado.' });
    }
  } catch (err) { res.status(500).json({ erro: 'Erro ao desativar/reativar.' }); }
};
