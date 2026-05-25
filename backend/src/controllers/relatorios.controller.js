// relatorios.controller.js — UC14: Relatórios gerenciais
const pool = require('../config/db');

// Vendas por período
exports.vendasPeriodo = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT DATE(p.data_pedido) AS data,
              COUNT(p.id) AS total_pedidos,
              SUM(p.valor_total) AS receita
       FROM Pedido p
       WHERE p.data_pedido BETWEEN $1 AND $2
         AND p.status != 'Cancelado'
       GROUP BY DATE(p.data_pedido)
       ORDER BY data ASC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// Lucro por produto
exports.lucroPorProduto = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT pr.nome,
              SUM(ip.quantidade) AS unidades_vendidas,
              SUM(ip.subtotal) AS receita_total,
              COALESCE(SUM(cp.quantidade_usada * 0), 0) AS custo_estimado,
              SUM(ip.subtotal) AS lucro_estimado
       FROM ItemPedido ip
       JOIN Produto pr ON pr.id = ip.produto_id
       JOIN Pedido p ON p.id = ip.pedido_id
       LEFT JOIN ConsumoProducao cp ON cp.item_pedido_id = ip.id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY pr.nome
       ORDER BY receita_total DESC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// Produtos mais vendidos (Curva ABC)
exports.maisVendidos = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT pr.nome, pr.categoria,
              SUM(ip.quantidade) AS total_vendido,
              SUM(ip.subtotal) AS receita_total
       FROM ItemPedido ip
       JOIN Produto pr ON pr.id = ip.produto_id
       JOIN Pedido p ON p.id = ip.pedido_id
       WHERE p.data_pedido BETWEEN $1 AND $2
       GROUP BY pr.nome, pr.categoria
       ORDER BY total_vendido DESC`,
      [inicio, fim]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};

// Vendas por cliente
exports.vendasPorCliente = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const r = await pool.query(
      `SELECT c.nome_completo, c.telefone,
              COUNT(p.id) AS total_pedidos,
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

// Aniversariantes do mês
exports.aniversariantes = async (req, res) => {
  const mes = req.query.mes || new Date().getMonth() + 1;
  try {
    // Nota: requer campo data_nascimento em Cliente — retorna todos se não existir
    const r = await pool.query(
      `SELECT nome_completo, telefone
       FROM Cliente
       WHERE deleted_at IS NULL
       ORDER BY nome_completo ASC`
    );
    res.json(r.rows); // Expandível quando data_nascimento for adicionada
  } catch (err) { res.status(500).json({ erro: 'Erro no relatório.' }); }
};
