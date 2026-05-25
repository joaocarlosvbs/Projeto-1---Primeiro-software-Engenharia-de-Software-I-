// fornecedores.controller.js — UC05
const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM Fornecedor ORDER BY razao_social ASC');
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar fornecedores.' }); }
};

exports.criar = async (req, res) => {
  const { razao_social, telefone, email } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO Fornecedor (razao_social, telefone, email)
       VALUES ($1, $2, $3) RETURNING *`,
      [razao_social, telefone, email]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao criar fornecedor.' }); }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { razao_social, telefone, email } = req.body;
  try {
    const r = await pool.query(
      `UPDATE Fornecedor SET razao_social=$1, telefone=$2, email=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [razao_social, telefone, email, id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar fornecedor.' }); }
};

exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Fornecedor WHERE id=$1', [id]);
    res.json({ mensagem: 'Fornecedor removido.' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao excluir fornecedor.' }); }
};
