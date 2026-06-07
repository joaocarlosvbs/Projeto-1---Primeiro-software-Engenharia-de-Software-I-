// consumo.controller.js — UC09
// item_pedido_id é opcional — o sistema aceita registrar pelo pedido_id
const pool = require('../config/db');

exports.registrar = async (req, res) => {
  const { materia_prima_id, quantidade_usada, item_pedido_id, pedido_id } = req.body;

  if (!materia_prima_id || !quantidade_usada) {
    return res.status(400).json({ erro: 'Material e quantidade são obrigatórios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Busca o estoque atual para verificar
    const mpRes = await client.query(
      'SELECT quantidade_atual, nome, estoque_minimo FROM MateriaPrima WHERE id = $1',
      [materia_prima_id]
    );
    if (mpRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Matéria-prima não encontrada.' });
    }
    const mp = mpRes.rows[0];
    const estoqueInsuficiente = parseFloat(mp.quantidade_atual) < parseFloat(quantidade_usada);

    // Registra o consumo
    // item_pedido_id pode ser NULL quando chamado direto do pedido
    await client.query(
      `INSERT INTO ConsumoProducao
         (item_pedido_id, materia_prima_id, quantidade_usada)
       VALUES ($1, $2, $3)`,
      [item_pedido_id || null, materia_prima_id, quantidade_usada]
    );

    // Subtrai do estoque (permite ficar negativo — UC09 [E1])
    await client.query(
      `UPDATE MateriaPrima
       SET quantidade_atual = quantidade_atual - $1,
           updated_at = NOW()
       WHERE id = $2`,
      [quantidade_usada, materia_prima_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      mensagem: estoqueInsuficiente
        ? `⚠️ Registrado. Estoque de "${mp.nome}" ficou negativo — verifique.`
        : `✅ Consumo de "${mp.nome}" registrado e estoque atualizado.`,
      alerta: estoqueInsuficiente,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar consumo.' });
  } finally {
    client.release();
  }
};

exports.listarPorPedido = async (req, res) => {
  const { pedido_id } = req.params;
  try {
    const r = await pool.query(
      `SELECT cp.id, cp.quantidade_usada, cp.data_consumo,
              mp.nome AS materia_prima, mp.unidade_medida
       FROM ConsumoProducao cp
       JOIN MateriaPrima mp ON mp.id = cp.materia_prima_id
       WHERE cp.item_pedido_id IN (
         SELECT id FROM ItemPedido WHERE pedido_id = $1
       )
       ORDER BY cp.data_consumo DESC`,
      [pedido_id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar consumos.' });
  }
};
