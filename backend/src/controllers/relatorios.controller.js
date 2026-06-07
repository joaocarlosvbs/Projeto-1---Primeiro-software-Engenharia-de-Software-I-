// relatorios.controller.js — UC14A–E com aniversariantes por mês
const pool = require('../config/db');

// UC14A — Vendas por período
exports.vendasPeriodo = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT DATE(p.data_pedido)      AS data,
              COUNT(p.id)              AS total_pedidos,
              SUM(p.valor_total)       AS receita
       FROM Pedido p
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY DATE(p.data_pedido)
       ORDER BY data ASC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// UC14B — Lucro por produto
exports.lucroPorProduto = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT pr.nome,
              SUM(ip.quantidade)   AS unidades_vendidas,
              SUM(ip.subtotal)     AS receita_total
       FROM ItemPedido ip
       JOIN Produto pr ON pr.id = ip.produto_id
       JOIN Pedido  p  ON p.id  = ip.pedido_id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY pr.nome
       ORDER BY receita_total DESC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// UC14C — Mais vendidos (Curva ABC)
exports.maisVendidos = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT pr.nome, pr.categoria,
              SUM(ip.quantidade)  AS total_vendido,
              SUM(ip.subtotal)    AS receita_total
       FROM ItemPedido ip
       JOIN Produto pr ON pr.id = ip.produto_id
       JOIN Pedido  p  ON p.id  = ip.pedido_id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY pr.nome, pr.categoria
       ORDER BY total_vendido DESC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// UC14D — Vendas por cliente
exports.vendasPorCliente = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT c.nome_completo, c.telefone,
              COUNT(p.id)        AS total_pedidos,
              SUM(p.valor_total) AS valor_total,
              MAX(p.data_pedido) AS ultimo_pedido
       FROM Pedido p
       JOIN Cliente c ON c.id = p.cliente_id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY c.nome_completo, c.telefone
       ORDER BY valor_total DESC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// UC14E — Aniversariantes do mês (filtra por mês de nascimento)
// Se nenhum mês for passado, usa o mês atual.
exports.aniversariantes = async (req, res) => {
  const mes = req.query.mes || (new Date().getMonth() + 1);
  try {
    const r = await pool.query(
      `SELECT c.id, c.nome_completo, c.telefone,
              TO_CHAR(c.data_nascimento, 'DD/MM') AS aniversario
       FROM Cliente c
       WHERE c.deleted_at IS NULL
         AND c.data_nascimento IS NOT NULL
         AND EXTRACT(MONTH FROM c.data_nascimento) = $1
       ORDER BY EXTRACT(DAY FROM c.data_nascimento) ASC`,
      [mes]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};
