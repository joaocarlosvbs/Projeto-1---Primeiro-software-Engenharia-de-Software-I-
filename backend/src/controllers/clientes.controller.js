// clientes.controller.js — CRUD completo com edição e aniversário
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.id, c.nome_completo, c.cpf_cnpj, c.telefone, c.endereco,
              c.aceitou_lgpd, c.created_at, c.data_nascimento, u.email
       FROM Cliente c JOIN Usuario u ON u.id = c.usuario_id
       WHERE c.deleted_at IS NULL ORDER BY c.created_at DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar clientes.' }); }
};

exports.editar = async (req, res) => {
  const { id } = req.params;
  const { nome_completo, telefone, endereco, cpf_cnpj } = req.body;
  try {
    const r = await pool.query(
      `UPDATE Cliente SET nome_completo=$1, telefone=$2, endereco=$3, cpf_cnpj=$4, updated_at=NOW()
       WHERE id=$5 AND deleted_at IS NULL RETURNING *`,
      [nome_completo, telefone, endereco, cpf_cnpj, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao editar cliente.' }); }
};

exports.atualizarAniversario = async (req, res) => {
  const { id } = req.params;
  const { data_nascimento } = req.body;
  try {
    await pool.query(
      'UPDATE Cliente SET data_nascimento=$1, updated_at=NOW() WHERE id=$2',
      [data_nascimento || null, id]
    );
    res.json({ mensagem: 'Data de nascimento atualizada.' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar aniversário.' }); }
};

exports.excluirLGPD = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE Cliente SET nome_completo='Cliente Anonimizado', cpf_cnpj=NULL,
       telefone='ANONIMIZADO', endereco=NULL, data_nascimento=NULL, deleted_at=NOW() WHERE id=$1`, [id]
    );
    const cRes = await client.query('SELECT usuario_id FROM Cliente WHERE id=$1', [id]);
    const uid  = cRes.rows[0]?.usuario_id;
    if (uid) await client.query(
      `UPDATE Usuario SET nome='Cliente Anonimizado', email=CONCAT('anonimizado_',$1,'@deletado.com'), deleted_at=NOW() WHERE id=$1`, [uid]
    );
    await client.query(
      `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'EXCLUSAO_LGPD',$2)`,
      [req.usuario.id, `Cliente ID ${id} anonimizado (LGPD)`]
    );
    await client.query('COMMIT');
    res.json({ mensagem: 'Dados anonimizados.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: 'Erro ao anonimizar.' });
  } finally { client.release(); }
};
