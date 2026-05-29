// logs.controller.js — UC15: Consultar logs de auditoria
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT l.id, l.acao, l.detalhes, l.data_hora,
              u.nome AS usuario_nome
       FROM LogsAuditoria l
       LEFT JOIN Usuario u ON u.id = l.usuario_id
       ORDER BY l.data_hora DESC
       LIMIT 500`
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar logs.' });
  }
};
