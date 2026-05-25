// produtos.controller.js — Lógica do catálogo de produtos
const pool = require('../config/db');

// UC04 — Portfólio público (sem login)
exports.listarPortfolio = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, categoria, preco_venda
       FROM Produto
       WHERE visivel_portfolio = true AND deleted_at IS NULL
       ORDER BY nome ASC`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar portfólio.' });
  }
};

// Listar todos os produtos (admin)
exports.listarTodos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, categoria, preco_venda, visivel_portfolio, estoque_atual, estoque_minimo
       FROM Produto WHERE deleted_at IS NULL ORDER BY nome ASC`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

// UC04 — Cadastrar produto (admin)
exports.criar = async (req, res) => {
  const { nome, categoria, preco_venda, visivel_portfolio } = req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO Produto (nome, categoria, preco_venda, visivel_portfolio)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, categoria, preco_venda, visivel_portfolio ?? true]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
};

// Atualizar produto (admin)
exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco_venda, visivel_portfolio } = req.body;
  try {
    const resultado = await pool.query(
      `UPDATE Produto SET nome=$1, categoria=$2, preco_venda=$3,
       visivel_portfolio=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [nome, categoria, preco_venda, visivel_portfolio, id]
    );
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
};
