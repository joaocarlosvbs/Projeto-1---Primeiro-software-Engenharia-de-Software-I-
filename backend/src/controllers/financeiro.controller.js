// financeiro.controller.js — com lançamento manual (despesa avulsa)
const pool = require('../config/db');

exports.dashboard = async (req, res) => {
  const { inicio, fim } = req.query;
  const ini = inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const fim2 = fim || new Date().toISOString();
  try {
    const [rec, desp, ped, top, alertas] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(valor),0) AS total FROM TransacaoFinanceira WHERE tipo='Receita' AND data_pagamento BETWEEN $1 AND $2`, [ini, fim2]),
      pool.query(`SELECT COALESCE(SUM(valor),0) AS total FROM TransacaoFinanceira WHERE tipo='Despesa' AND data_pagamento BETWEEN $1 AND $2`, [ini, fim2]),
      pool.query(`SELECT status, COUNT(*) AS quantidade FROM Pedido GROUP BY status`),
      pool.query(`SELECT pr.nome, SUM(ip.quantidade) AS total_vendido FROM ItemPedido ip JOIN Produto pr ON pr.id=ip.produto_id JOIN Pedido p ON p.id=ip.pedido_id WHERE p.data_pedido BETWEEN $1 AND $2 GROUP BY pr.nome ORDER BY total_vendido DESC LIMIT 5`, [ini, fim2]),
      pool.query(`SELECT nome, quantidade_atual, estoque_minimo, unidade_medida FROM MateriaPrima WHERE quantidade_atual <= estoque_minimo ORDER BY (quantidade_atual - estoque_minimo) ASC`),
    ]);
    const receita = parseFloat(rec.rows[0].total);
    const despesa = parseFloat(desp.rows[0].total);
    res.json({ receita, despesa, lucro: receita - despesa, pedidos_por_status: ped.rows, top_produtos: top.rows, alertas_estoque: alertas.rows, periodo: { inicio: ini, fim: fim2 } });
  } catch (err) { res.status(500).json({ erro: 'Erro ao carregar dashboard.' }); }
};

exports.fluxoCaixa = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    let q = `SELECT id, tipo, descricao, valor, data_pagamento FROM TransacaoFinanceira`;
    const p = [];
    if (inicio && fim) { q += ' WHERE data_pagamento BETWEEN $1 AND $2'; p.push(inicio, fim); }
    q += ' ORDER BY data_pagamento DESC';
    const r = await pool.query(q, p);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao carregar fluxo.' }); }
};

// NOVO: Lançamento manual (despesa avulsa: aluguel, luz, etc.)
exports.lancarManual = async (req, res) => {
  const { tipo, descricao, valor } = req.body;
  if (!tipo || !descricao || !valor)
    return res.status(400).json({ erro: 'Tipo, descrição e valor são obrigatórios.' });
  const tiposValidos = ['Receita', 'Despesa'];
  if (!tiposValidos.includes(tipo))
    return res.status(400).json({ erro: 'Tipo deve ser "Receita" ou "Despesa".' });
  try {
    const r = await pool.query(
      `INSERT INTO TransacaoFinanceira(tipo, descricao, valor)
       VALUES($1,$2,$3) RETURNING *`,
      [tipo, descricao, valor]
    );
    await pool.query(
      `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'LANCAMENTO_MANUAL',$2)`,
      [req.usuario.id, `${tipo}: ${descricao} — R$ ${valor}`]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao lançar transação.' }); }
};
