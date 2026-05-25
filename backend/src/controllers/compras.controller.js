// compras.controller.js — UC10: Registrar compra de insumos
// Ao finalizar uma compra, o sistema:
// 1. Registra na tabela RegistroCompra
// 2. Soma a quantidade em MateriaPrima (entrada no estoque)
// 3. Lança automaticamente uma Despesa na TransacaoFinanceira

const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT rc.id, rc.quantidade, rc.valor_custo_total, rc.data_compra,
              f.razao_social AS fornecedor, mp.nome AS materia_prima, mp.unidade_medida
       FROM RegistroCompra rc
       JOIN Fornecedor f ON f.id = rc.fornecedor_id
       JOIN MateriaPrima mp ON mp.id = rc.materia_prima_id
       ORDER BY rc.data_compra DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar compras.' }); }
};

exports.registrar = async (req, res) => {
  const { fornecedor_id, materia_prima_id, quantidade, valor_custo_total } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Registra a compra
    const compraRes = await client.query(
      `INSERT INTO RegistroCompra (fornecedor_id, materia_prima_id, quantidade, valor_custo_total)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [fornecedor_id, materia_prima_id, quantidade, valor_custo_total]
    );
    const compraId = compraRes.rows[0].id;

    // 2. Soma a quantidade ao estoque da matéria-prima
    await client.query(
      `UPDATE MateriaPrima
       SET quantidade_atual = quantidade_atual + $1, updated_at = NOW()
       WHERE id = $2`,
      [quantidade, materia_prima_id]
    );

    // 3. Lança despesa automaticamente no financeiro
    const mpRes = await client.query('SELECT nome FROM MateriaPrima WHERE id=$1', [materia_prima_id]);
    await client.query(
      `INSERT INTO TransacaoFinanceira (tipo, descricao, valor, compra_id)
       VALUES ('Despesa', $1, $2, $3)`,
      [`Compra de insumo: ${mpRes.rows[0].nome}`, valor_custo_total, compraId]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Compra registrada e estoque atualizado!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar compra.' });
  } finally {
    client.release();
  }
};
