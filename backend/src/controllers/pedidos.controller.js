// pedidos.controller.js — Lógica de pedidos e encomendas
const pool = require('../config/db');

// UC11 — Cliente vê seus próprios pedidos
exports.meusPedidos = async (req, res) => {
  try {
    // Busca o cliente vinculado ao usuário logado
    const clienteRes = await pool.query(
      'SELECT id FROM Cliente WHERE usuario_id = $1', [req.usuario.id]
    );
    if (clienteRes.rows.length === 0) {
      return res.json([]);
    }
    const clienteId = clienteRes.rows[0].id;

    const pedidos = await pool.query(
      `SELECT p.id, p.data_pedido, p.data_entrega, p.status,
              p.valor_total, p.valor_pago_sinal,
              json_agg(json_build_object(
                'produto', pr.nome,
                'quantidade', ip.quantidade,
                'personalizacao', ip.personalizacao,
                'subtotal', ip.subtotal
              )) AS itens
       FROM Pedido p
       JOIN ItemPedido ip ON ip.pedido_id = p.id
       JOIN Produto pr ON pr.id = ip.produto_id
       WHERE p.cliente_id = $1
       GROUP BY p.id
       ORDER BY p.data_pedido DESC`,
      [clienteId]
    );
    res.json(pedidos.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
  }
};

// UC07 — Fazer encomenda
exports.criar = async (req, res) => {
  const { itens, data_entrega } = req.body;
  // itens: [{ produto_id, quantidade, personalizacao }]

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Busca ou cria o cliente vinculado ao usuário
    let clienteRes = await client.query(
      'SELECT id FROM Cliente WHERE usuario_id = $1', [req.usuario.id]
    );
    if (clienteRes.rows.length === 0) {
      return res.status(400).json({ erro: 'Perfil de cliente não encontrado. Complete seu cadastro.' });
    }
    const clienteId = clienteRes.rows[0].id;

    // Calcula o valor total
    let valorTotal = 0;
    for (const item of itens) {
      const prod = await client.query(
        'SELECT preco_venda FROM Produto WHERE id = $1', [item.produto_id]
      );
      valorTotal += prod.rows[0].preco_venda * item.quantidade;
    }

    // Cria o pedido
    const pedidoRes = await client.query(
      `INSERT INTO Pedido (cliente_id, usuario_id, data_entrega, status, valor_total)
       VALUES ($1, $2, $3, 'Aguardando', $4) RETURNING id`,
      [clienteId, req.usuario.id, data_entrega, valorTotal]
    );
    const pedidoId = pedidoRes.rows[0].id;

    // Insere os itens do pedido
    for (const item of itens) {
      const prod = await client.query(
        'SELECT preco_venda FROM Produto WHERE id = $1', [item.produto_id]
      );
      const subtotal = prod.rows[0].preco_venda * item.quantidade;
      await client.query(
        `INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedidoId, item.produto_id, item.quantidade, item.personalizacao, subtotal]
      );
    }

    // Registra a receita no financeiro
    await client.query(
      `INSERT INTO TransacaoFinanceira (tipo, descricao, valor, pedido_id)
       VALUES ('Receita', $1, $2, $3)`,
      [`Venda - Pedido #${pedidoId}`, valorTotal, pedidoId]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Pedido criado com sucesso!', pedido_id: pedidoId, valor_total: valorTotal });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar pedido.' });
  } finally {
    client.release();
  }
};

// Admin — Lista todos os pedidos
exports.listarTodos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT p.id, c.nome_completo AS cliente, p.data_pedido,
              p.data_entrega, p.status, p.valor_total, p.valor_pago_sinal
       FROM Pedido p
       JOIN Cliente c ON c.id = p.cliente_id
       ORDER BY p.data_pedido DESC`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar pedidos.' });
  }
};

// UC08 — Atualizar status do pedido (admin)
exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status, valor_pago_sinal } = req.body;
  try {
    const resultado = await pool.query(
      `UPDATE Pedido SET status=$1, valor_pago_sinal=COALESCE($2, valor_pago_sinal),
       updated_at=NOW() WHERE id=$3 RETURNING *`,
      [status, valor_pago_sinal, id]
    );

    // UC15 — Registra no log de auditoria
    await pool.query(
      `INSERT INTO LogsAuditoria (usuario_id, acao, detalhes)
       VALUES ($1, 'ATUALIZAR_PEDIDO', $2)`,
      [req.usuario.id, `Pedido #${id} atualizado para status: ${status}`]
    );

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
};
