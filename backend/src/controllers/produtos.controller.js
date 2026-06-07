// produtos.controller.js — atualizar inclui estoque_atual
const pool = require('../config/db');
const { enviarParaSupabase, urlLocal, usarSupabase } = require('../middlewares/upload.middleware');

exports.listarPortfolio = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nome, categoria, preco_venda, imagem_url
       FROM Produto WHERE visivel_portfolio = true AND deleted_at IS NULL ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar portfólio.' }); }
};

exports.listarTodos = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nome, categoria, preco_venda, visivel_portfolio,
              estoque_atual, estoque_minimo, imagem_url
       FROM Produto WHERE deleted_at IS NULL ORDER BY nome ASC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar produtos.' }); }
};

exports.criar = async (req, res) => {
  const { nome, categoria, preco_venda, visivel_portfolio, estoque_atual, estoque_minimo } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO Produto (nome, categoria, preco_venda, visivel_portfolio, estoque_atual, estoque_minimo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nome, categoria, preco_venda, visivel_portfolio ?? true, estoque_atual || 0, estoque_minimo || 5]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao criar produto.' }); }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco_venda, visivel_portfolio, estoque_atual, estoque_minimo } = req.body;
  try {
    const r = await pool.query(
      `UPDATE Produto SET nome=$1, categoria=$2, preco_venda=$3, visivel_portfolio=$4,
       estoque_atual=$5, estoque_minimo=$6, updated_at=NOW()
       WHERE id=$7 AND deleted_at IS NULL RETURNING *`,
      [nome, categoria, preco_venda, visivel_portfolio,
       estoque_atual ?? 0, estoque_minimo ?? 5, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar produto.' }); }
};

exports.uploadImagem = async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  const { id } = req.params;
  try {
    let imagemUrl;
    if (usarSupabase) imagemUrl = await enviarParaSupabase(req.file);
    else              imagemUrl = urlLocal(req.file.filename);
    await pool.query('UPDATE Produto SET imagem_url=$1, updated_at=NOW() WHERE id=$2', [imagemUrl, id]);
    res.json({ mensagem: 'Imagem salva!', imagem_url: imagemUrl });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar imagem: ' + err.message });
  }
};

exports.removerImagem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE Produto SET imagem_url=NULL, updated_at=NOW() WHERE id=$1', [id]);
    res.json({ mensagem: 'Imagem removida.' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao remover imagem.' }); }
};

exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const pedidos = await pool.query('SELECT id FROM ItemPedido WHERE produto_id=$1 LIMIT 1', [id]);
    if (pedidos.rows.length > 0) {
      await pool.query(`UPDATE Produto SET visivel_portfolio=false, deleted_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
      return res.json({ mensagem: 'Produto desativado (histórico preservado).', desativado: true });
    }
    await pool.query('DELETE FROM Produto WHERE id=$1', [id]);
    res.json({ mensagem: 'Produto excluído.', excluido: true });
  } catch (err) { res.status(500).json({ erro: 'Erro ao excluir produto.' }); }
};
