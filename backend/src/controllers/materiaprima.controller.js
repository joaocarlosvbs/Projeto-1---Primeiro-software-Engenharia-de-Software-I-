// materiaprima.controller.js — com ajuste manual de estoque e histórico de consumo
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, (quantidade_atual <= estoque_minimo) AS alerta_estoque
       FROM MateriaPrima ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar.' }); }
};

exports.criar = async (req, res) => {
  const { nome, unidade_medida, estoque_minimo } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO MateriaPrima(nome, unidade_medida, estoque_minimo, quantidade_atual)
       VALUES($1,$2,$3,0) RETURNING *`,
      [nome, unidade_medida, estoque_minimo || 5]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao criar.' }); }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, estoque_minimo } = req.body;
  try {
    const r = await pool.query(
      `UPDATE MateriaPrima SET nome=$1, estoque_minimo=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [nome, estoque_minimo, id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar.' }); }
};

// NOVO: Ajuste manual do estoque (inventário, quebra, correção)
exports.ajustarEstoque = async (req, res) => {
  const { id } = req.params;
  const { quantidade_atual, motivo } = req.body;
  if (quantidade_atual === undefined || isNaN(quantidade_atual)) {
    return res.status(400).json({ erro: 'Quantidade inválida.' });
  }
  try {
    const antes = await pool.query('SELECT quantidade_atual, nome FROM MateriaPrima WHERE id=$1', [id]);
    const qtdAntes = parseFloat(antes.rows[0]?.quantidade_atual || 0);

    await pool.query(
      'UPDATE MateriaPrima SET quantidade_atual=$1, updated_at=NOW() WHERE id=$2',
      [quantidade_atual, id]
    );

    // Registra no log de auditoria
    await pool.query(
      `INSERT INTO LogsAuditoria(usuario_id, acao, detalhes)
       VALUES($1,'AJUSTE_ESTOQUE',$2)`,
      [req.usuario.id,
       `${antes.rows[0].nome}: ${qtdAntes.toFixed(2)} → ${parseFloat(quantidade_atual).toFixed(2)}${motivo ? ` (${motivo})` : ''}`]
    );

    res.json({ mensagem: 'Estoque ajustado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao ajustar estoque.' });
  }
};

// NOVO: Histórico de consumo de um material específico
exports.historicoConsumo = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query(
      `SELECT
         cp.id,
         cp.quantidade_usada,
         cp.data_consumo,
         CASE
           WHEN cp.item_pedido_id IS NOT NULL THEN CONCAT('Pedido #', ip.pedido_id, ' — ', pr.nome)
           ELSE 'Lançamento avulso'
         END AS referencia
       FROM ConsumoProducao cp
       LEFT JOIN ItemPedido ip ON ip.id = cp.item_pedido_id
       LEFT JOIN Produto    pr ON pr.id = ip.produto_id
       WHERE cp.materia_prima_id = $1
       ORDER BY cp.data_consumo DESC
       LIMIT 100`,
      [id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
};

exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const mov    = await pool.query('SELECT id FROM ConsumoProducao WHERE materia_prima_id=$1 LIMIT 1', [id]);
    const compras= await pool.query('SELECT id FROM RegistroCompra   WHERE materia_prima_id=$1 LIMIT 1', [id]);
    if (mov.rows.length > 0 || compras.rows.length > 0) {
      return res.status(400).json({ erro: 'Não é possível excluir: há compras ou consumos vinculados.' });
    }
    await pool.query('DELETE FROM MateriaPrima WHERE id=$1', [id]);
    res.json({ mensagem: 'Matéria-prima excluída.' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao excluir.' }); }
};
