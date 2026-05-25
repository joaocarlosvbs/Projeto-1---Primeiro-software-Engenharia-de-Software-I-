// materiaprima.controller.js — UC06
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, (quantidade_atual <= estoque_minimo) AS alerta_estoque
       FROM MateriaPrima ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar matérias-primas.' }); }
};

exports.criar = async (req, res) => {
  const { nome, unidade_medida, estoque_minimo } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO MateriaPrima (nome, unidade_medida, estoque_minimo, quantidade_atual)
       VALUES ($1, $2, $3, 0) RETURNING *`,
      [nome, unidade_medida, estoque_minimo || 5]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao criar matéria-prima.' }); }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, estoque_minimo } = req.body;
  try {
    // UC06 — bloqueia alteração de unidade_medida se já houver movimentação
    const movimentacoes = await pool.query(
      'SELECT id FROM ConsumoProducao WHERE materia_prima_id=$1 LIMIT 1', [id]
    );
    const dados = req.body;
    if (movimentacoes.rows.length > 0 && dados.unidade_medida) {
      delete dados.unidade_medida; // Ignora tentativa de alterar a unidade
    }
    const r = await pool.query(
      `UPDATE MateriaPrima SET nome=$1, estoque_minimo=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [nome, estoque_minimo, id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar matéria-prima.' }); }
};
