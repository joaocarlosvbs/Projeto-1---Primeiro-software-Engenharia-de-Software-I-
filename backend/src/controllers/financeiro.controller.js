// financeiro.controller.js — UC12 (Dashboard) e UC13 (Fluxo de Caixa)
const pool = require('../config/db');

// UC12 — Dashboard financeiro com filtro de período
exports.dashboard = async (req, res) => {
  const { inicio, fim } = req.query;
  const dataInicio = inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const dataFim = fim || new Date().toISOString();

  try {
    // Receita total do período
    const receitaRes = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total
       FROM TransacaoFinanceira
       WHERE tipo='Receita' AND data_pagamento BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Despesa total do período
    const despesaRes = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total
       FROM TransacaoFinanceira
       WHERE tipo='Despesa' AND data_pagamento BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Pedidos por status
    const pedidosRes = await pool.query(
      `SELECT status, COUNT(*) AS quantidade
       FROM Pedido GROUP BY status`
    );

    // Produtos mais vendidos (Top 5)
    const topProdutosRes = await pool.query(
      `SELECT pr.nome, SUM(ip.quantidade) AS total_vendido
       FROM ItemPedido ip
       JOIN Produto pr ON pr.id = ip.produto_id
       JOIN Pedido p ON p.id = ip.pedido_id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY pr.nome ORDER BY total_vendido DESC LIMIT 5`,
      [dataInicio, dataFim]
    );

    // Alertas de estoque crítico
    const alertasRes = await pool.query(
      `SELECT nome, quantidade_atual, estoque_minimo, unidade_medida
       FROM MateriaPrima
       WHERE quantidade_atual <= estoque_minimo
       ORDER BY (quantidade_atual - estoque_minimo) ASC`
    );

    const receita = parseFloat(receitaRes.rows[0].total);
    const despesa = parseFloat(despesaRes.rows[0].total);

    res.json({
      receita,
      despesa,
      lucro: receita - despesa,
      pedidos_por_status: pedidosRes.rows,
      top_produtos: topProdutosRes.rows,
      alertas_estoque: alertasRes.rows,
      periodo: { inicio: dataInicio, fim: dataFim }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao carregar dashboard.' });
  }
};

// UC13 — Fluxo de caixa (extrato cronológico)
exports.fluxoCaixa = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    let query = `
      SELECT id, tipo, descricao, valor, data_pagamento
      FROM TransacaoFinanceira`;
    const params = [];

    if (inicio && fim) {
      query += ' WHERE data_pagamento BETWEEN $1 AND $2';
      params.push(inicio, fim);
    }
    query += ' ORDER BY data_pagamento DESC';

    const r = await pool.query(query, params);

    // Calcula saldo acumulado
    let saldo = 0;
    const transacoes = r.rows.map(t => {
      saldo += t.tipo === 'Receita' ? parseFloat(t.valor) : -parseFloat(t.valor);
      return { ...t, saldo_acumulado: saldo };
    }).reverse(); // Mais recente por último para o saldo fazer sentido

    res.json(transacoes.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao carregar fluxo de caixa.' });
  }
};
