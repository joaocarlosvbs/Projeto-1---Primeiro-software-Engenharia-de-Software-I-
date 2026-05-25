// clientes.controller.js — UC03 e UC17
const pool = require('../config/db');

// UC03 — Listar clientes (admin)
exports.listar = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT c.id, c.nome_completo, c.cpf_cnpj, c.telefone,
              c.aceitou_lgpd, c.created_at, u.email
       FROM Cliente c
       JOIN Usuario u ON u.id = c.usuario_id
       WHERE c.deleted_at IS NULL
       ORDER BY c.created_at DESC`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar clientes.' });
  }
};

// UC17 — Exclusão LGPD (soft delete + anonimização)
exports.excluirLGPD = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Anonimiza os dados pessoais do cliente
    await client.query(
      `UPDATE Cliente SET
        nome_completo = 'Cliente Anonimizado',
        cpf_cnpj = NULL,
        telefone = 'ANONIMIZADO',
        endereco = NULL,
        deleted_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Busca o usuario_id para também anonimizar o login
    const clienteRes = await client.query(
      'SELECT usuario_id FROM Cliente WHERE id = $1', [id]
    );
    const usuarioId = clienteRes.rows[0]?.usuario_id;

    if (usuarioId) {
      await client.query(
        `UPDATE Usuario SET
          nome = 'Cliente Anonimizado',
          email = CONCAT('anonimizado_', id, '@deletado.com'),
          deleted_at = NOW()
         WHERE id = $1`,
        [usuarioId]
      );
    }

    // UC15 — Registra no log de auditoria
    await client.query(
      `INSERT INTO LogsAuditoria (usuario_id, acao, detalhes)
       VALUES ($1, 'EXCLUSAO_LGPD', $2)`,
      [req.usuario.id, `Cliente ID ${id} anonimizado conforme LGPD`]
    );

    await client.query('COMMIT');
    res.json({ mensagem: 'Dados do cliente anonimizados com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao anonimizar cliente.' });
  } finally {
    client.release();
  }
};
