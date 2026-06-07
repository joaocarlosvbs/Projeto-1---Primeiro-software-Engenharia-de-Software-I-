// pedidos.controller.js — com detalhe de itens e cancelamento
const pool = require('../config/db');

exports.meusPedidos = async (req, res) => {
  try {
    const cRes = await pool.query('SELECT id FROM Cliente WHERE usuario_id=$1', [req.usuario.id]);
    if (cRes.rows.length === 0) return res.json([]);
    const clienteId = cRes.rows[0].id;
    const pedidos = await pool.query(
      `SELECT p.id, p.data_pedido, p.data_entrega, p.status, p.valor_total,
              json_agg(json_build_object(
                'produto', pr.nome, 'quantidade', ip.quantidade,
                'personalizacao', ip.personalizacao, 'subtotal', ip.subtotal
              )) AS itens
       FROM Pedido p
       JOIN ItemPedido ip ON ip.pedido_id = p.id
       JOIN Produto pr ON pr.id = ip.produto_id
       WHERE p.cliente_id=$1
       GROUP BY p.id ORDER BY p.data_pedido DESC`,
      [clienteId]
    );
    res.json(pedidos.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar pedidos.' }); }
};

exports.criar = async (req, res) => {
  const { itens, data_entrega } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let clienteRes = await client.query('SELECT id FROM Cliente WHERE usuario_id=$1', [req.usuario.id]);
    if (clienteRes.rows.length === 0)
      return res.status(400).json({ erro: 'Perfil de cliente não encontrado.' });
    const clienteId = clienteRes.rows[0].id;
    let valorTotal = 0;
    for (const item of itens) {
      const p = await client.query('SELECT preco_venda FROM Produto WHERE id=$1', [item.produto_id]);
      valorTotal += parseFloat(p.rows[0].preco_venda) * item.quantidade;
    }
    const pedidoRes = await client.query(
      `INSERT INTO Pedido(cliente_id,usuario_id,data_entrega,status,valor_total)
       VALUES($1,$2,$3,'Aguardando',$4) RETURNING id`,
      [clienteId, req.usuario.id, data_entrega, valorTotal]
    );
    const pedidoId = pedidoRes.rows[0].id;
    for (const item of itens) {
      const p = await client.query('SELECT preco_venda FROM Produto WHERE id=$1', [item.produto_id]);
      const subtotal = parseFloat(p.rows[0].preco_venda) * item.quantidade;
      await client.query(
        `INSERT INTO ItemPedido(pedido_id,produto_id,quantidade,personalizacao,subtotal)
         VALUES($1,$2,$3,$4,$5)`,
        [pedidoId, item.produto_id, item.quantidade, item.personalizacao, subtotal]
      );
    }
    await client.query(
      `INSERT INTO TransacaoFinanceira(tipo,descricao,valor,pedido_id)
       VALUES('Receita',$1,$2,$3)`,
      [`Venda - Pedido #${pedidoId}`, valorTotal, pedidoId]
    );
    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Pedido criado!', pedido_id: pedidoId, valor_total: valorTotal });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: 'Erro ao criar pedido.' });
  } finally { client.release(); }
};

exports.listarTodos = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id, c.nome_completo AS cliente, p.data_pedido,
              p.data_entrega, p.status, p.valor_total
       FROM Pedido p JOIN Cliente c ON c.id=p.cliente_id
       ORDER BY p.data_pedido DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao listar.' }); }
};

exports.detalhe = async (req, res) => {
  const { id } = req.params;
  try {
    const pedidoRes = await pool.query(
      `SELECT p.id, c.nome_completo AS cliente, c.telefone,
              p.data_pedido, p.data_entrega, p.status, p.valor_total
       FROM Pedido p JOIN Cliente c ON c.id=p.cliente_id WHERE p.id=$1`, [id]
    );
    if (pedidoRes.rows.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado.' });

    const itensRes = await pool.query(
      `SELECT ip.id, pr.nome AS produto, pr.imagem_url, ip.quantidade,
              ip.personalizacao, ip.subtotal
       FROM ItemPedido ip JOIN Produto pr ON pr.id=ip.produto_id
       WHERE ip.pedido_id=$1`, [id]
    );
    res.json({ ...pedidoRes.rows[0], itens: itensRes.rows });
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar detalhe.' }); }
};

exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const r = await pool.query(
      `UPDATE Pedido SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    await pool.query(
      `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'ATUALIZAR_PEDIDO',$2)`,
      [req.usuario.id, `Pedido #${id} → ${status}`]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ erro: 'Erro ao atualizar status.' }); }
};

exports.cancelar = async (req, res) => {
  const { id } = req.params;
  try {
    const pedRes = await pool.query('SELECT status FROM Pedido WHERE id=$1', [id]);
    if (pedRes.rows.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    if (pedRes.rows[0].status === 'Finalizado' || pedRes.rows[0].status === 'Entregue') {
      return res.status(400).json({ erro: `Não é possível cancelar um pedido com status "${pedRes.rows[0].status}".` });
    }
    await pool.query(
      `UPDATE Pedido SET status='Cancelado', updated_at=NOW() WHERE id=$1`, [id]
    );
    // Estorna a receita no financeiro
    await pool.query(
      `UPDATE TransacaoFinanceira SET tipo='Estorno', descricao=CONCAT('Cancelamento Pedido #',$1)
       WHERE pedido_id=$1`, [id]
    );
    await pool.query(
      `INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'CANCELAR_PEDIDO',$2)`,
      [req.usuario.id, `Pedido #${id} cancelado`]
    );
    res.json({ mensagem: 'Pedido cancelado.' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao cancelar.' }); }
};
