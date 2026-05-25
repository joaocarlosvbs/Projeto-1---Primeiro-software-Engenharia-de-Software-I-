// consumo.controller.js — UC09: Registrar consumo de produção (baixa de estoque)
// Acionado quando o status do pedido muda para "Finalizado".
// Permite que a artesã informe exatamente quanto material gastou.
// Mesmo com estoque insuficiente, a gravação é permitida (sinalizada em vermelho).

const pool = require('../config/db');

exports.registrar = async (req, res) => {
  const { item_pedido_id, materia_prima_id, quantidade_usada } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verifica estoque atual
    const mpRes = await client.query(
      'SELECT quantidade_atual, nome FROM MateriaPrima WHERE id=$1', [materia_prima_id]
    );
    const mp = mpRes.rows[0];
    const estoqueInsuficiente = mp.quantidade_atual < quantidade_usada;

    // Registra o consumo (mesmo se insuficiente — UC09 [E1])
    await client.query(
      `INSERT INTO ConsumoProducao (item_pedido_id, materia_prima_id, quantidade_usada)
       VALUES ($1, $2, $3)`,
      [item_pedido_id, materia_prima_id, quantidade_usada]
    );

    // Subtrai do estoque (pode ficar negativo — alerta visual)
    await client.query(
      `UPDATE MateriaPrima
       SET quantidade_atual = quantidade_atual - $1, updated_at = NOW()
       WHERE id = $2`,
      [quantidade_usada, materia_prima_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      mensagem: estoqueInsuficiente
        ? `⚠️ Baixa registrada, mas estoque de "${mp.nome}" ficou negativo. Corrija quando possível.`
        : '✅ Consumo registrado e estoque atualizado.',
      alerta: estoqueInsuficiente
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
              mp.nome AS materia_prima, mp.unidade_medida,
              ip.personalizacao, pr.nome AS produto
       FROM ConsumoProducao cp
       JOIN MateriaPrima mp ON mp.id = cp.materia_prima_id
       JOIN ItemPedido ip ON ip.id = cp.item_pedido_id
       JOIN Produto pr ON pr.id = ip.produto_id
       WHERE ip.pedido_id = $1`,
      [pedido_id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar consumos.' }); }
};
