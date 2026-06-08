const pool = require('../config/db');

exports.meusPedidos = async (req, res) => {
  try {
    const cRes = await pool.query('SELECT id FROM Cliente WHERE usuario_id=$1',[req.usuario.id]);
    if (!cRes.rows.length) return res.json([]);
    const r = await pool.query(
      `SELECT p.id, p.data_pedido, p.data_entrega, p.status, p.valor_total,
              json_agg(json_build_object('nome',pr.nome,'quantidade',ip.quantidade,
              'personalizacao',ip.personalizacao,'subtotal',ip.subtotal)) AS itens
       FROM Pedido p JOIN ItemPedido ip ON ip.pedido_id=p.id
       JOIN Produto pr ON pr.id=ip.produto_id
       WHERE p.cliente_id=$1 GROUP BY p.id ORDER BY p.data_pedido DESC`,
      [cRes.rows[0].id]);
    res.json(r.rows);
  } catch(e){ res.status(500).json({erro:'Erro.'}); }
};

exports.criar = async (req,res) => {
  const {itens,data_entrega}=req.body;
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const cRes=await client.query('SELECT id FROM Cliente WHERE usuario_id=$1',[req.usuario.id]);
    if(!cRes.rows.length){ await client.query('ROLLBACK'); return res.status(400).json({erro:'Perfil não encontrado.'}); }
    const cid=cRes.rows[0].id;
    let total=0;
    for(const i of itens){ const p=await client.query('SELECT preco_venda FROM Produto WHERE id=$1',[i.produto_id]); total+=parseFloat(p.rows[0].preco_venda)*i.quantidade; }
    const pr=await client.query(`INSERT INTO Pedido(cliente_id,usuario_id,data_entrega,status,valor_total) VALUES($1,$2,$3,'Aguardando',$4) RETURNING id`,[cid,req.usuario.id,data_entrega,total]);
    const pid=pr.rows[0].id;
    for(const i of itens){
      const p=await client.query('SELECT preco_venda FROM Produto WHERE id=$1',[i.produto_id]);
      await client.query(`INSERT INTO ItemPedido(pedido_id,produto_id,quantidade,personalizacao,subtotal) VALUES($1,$2,$3,$4,$5)`,[pid,i.produto_id,i.quantidade,i.personalizacao,parseFloat(p.rows[0].preco_venda)*i.quantidade]);
    }
    await client.query(`INSERT INTO TransacaoFinanceira(tipo,descricao,valor,pedido_id) VALUES('Receita',$1,$2,$3)`,['Pedido #'+pid,total,pid]);
    await client.query('COMMIT');
    res.status(201).json({mensagem:'Pedido criado!',pedido_id:pid,valor_total:total});
  } catch(e){ await client.query('ROLLBACK'); res.status(500).json({erro:'Erro ao criar.'}); }
  finally{ client.release(); }
};

exports.listarTodos = async (req,res) => {
  try {
    const r=await pool.query(
      `SELECT p.id, c.nome_completo AS cliente, c.telefone,
              p.data_pedido, p.data_entrega, p.status, p.valor_total
       FROM Pedido p JOIN Cliente c ON c.id=p.cliente_id
       WHERE p.status NOT IN ('Finalizado','Entregue','Cancelado')
       ORDER BY p.data_pedido DESC`);
    res.json(r.rows);
  } catch(e){ res.status(500).json({erro:'Erro.'}); }
};

exports.historico = async (req,res) => {
  const {inicio,fim,status}=req.query;
  try {
    const params=[];
    let cond=`WHERE p.status IN ('Finalizado','Entregue','Cancelado')`;
    if(inicio&&fim){ params.push(inicio,fim); cond+=` AND p.data_pedido BETWEEN $${params.length-1} AND $${params.length}`; }
    if(status&&status!=='Todos'){ params.push(status); cond+=` AND p.status=$${params.length}`; }
    const peds=await pool.query(
      `SELECT p.id, c.nome_completo AS cliente, c.telefone,
              p.data_pedido, p.data_entrega, p.status, p.valor_total
       FROM Pedido p JOIN Cliente c ON c.id=p.cliente_id ${cond} ORDER BY p.data_pedido DESC`,params);
    for(const ped of peds.rows){
      const iRes=await pool.query(
        `SELECT pr.nome AS produto, ip.quantidade, ip.personalizacao, ip.subtotal
         FROM ItemPedido ip JOIN Produto pr ON pr.id=ip.produto_id WHERE ip.pedido_id=$1`,[ped.id]);
      const cRes=await pool.query(
        `SELECT mp.nome AS material, mp.unidade_medida, SUM(cp.quantidade_usada) AS total_usado
         FROM ConsumoProducao cp JOIN MateriaPrima mp ON mp.id=cp.materia_prima_id
         WHERE cp.item_pedido_id IN (SELECT id FROM ItemPedido WHERE pedido_id=$1)
         GROUP BY mp.nome,mp.unidade_medida`,[ped.id]);
      ped.itens=iRes.rows; ped.consumo=cRes.rows;
    }
    res.json(peds.rows);
  } catch(e){ console.error(e); res.status(500).json({erro:'Erro.'}); }
};

exports.detalhe = async (req,res) => {
  const {id}=req.params;
  try {
    const pRes=await pool.query(`SELECT p.id,c.nome_completo AS cliente,c.telefone,p.data_pedido,p.data_entrega,p.status,p.valor_total FROM Pedido p JOIN Cliente c ON c.id=p.cliente_id WHERE p.id=$1`,[id]);
    if(!pRes.rows.length) return res.status(404).json({erro:'Não encontrado.'});
    const iRes=await pool.query(`SELECT ip.id,pr.nome AS produto,pr.imagem_url,ip.quantidade,ip.personalizacao,ip.subtotal FROM ItemPedido ip JOIN Produto pr ON pr.id=ip.produto_id WHERE ip.pedido_id=$1`,[id]);
    const cRes=await pool.query(`SELECT mp.nome AS material,mp.unidade_medida,SUM(cp.quantidade_usada) AS total_usado FROM ConsumoProducao cp JOIN MateriaPrima mp ON mp.id=cp.materia_prima_id WHERE cp.item_pedido_id IN (SELECT id FROM ItemPedido WHERE pedido_id=$1) GROUP BY mp.nome,mp.unidade_medida`,[id]);
    res.json({...pRes.rows[0],itens:iRes.rows,consumo:cRes.rows});
  } catch(e){ res.status(500).json({erro:'Erro.'}); }
};

exports.atualizarStatus = async (req,res) => {
  const {id}=req.params; const {status}=req.body;
  try {
    const r=await pool.query(`UPDATE Pedido SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *`,[status,id]);
    await pool.query(`INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'ATUALIZAR_PEDIDO',$2)`,[req.usuario.id,`Pedido #${id} → ${status}`]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({erro:'Erro.'}); }
};

exports.cancelar = async (req,res) => {
  const {id}=req.params;
  try {
    const p=await pool.query('SELECT status FROM Pedido WHERE id=$1',[id]);
    if(!p.rows.length) return res.status(404).json({erro:'Não encontrado.'});
    if(['Finalizado','Entregue'].includes(p.rows[0].status)) return res.status(400).json({erro:`Não é possível cancelar "${p.rows[0].status}".`});
    await pool.query(`UPDATE Pedido SET status='Cancelado',updated_at=NOW() WHERE id=$1`,[id]);
    await pool.query(`UPDATE TransacaoFinanceira SET tipo='Estorno',descricao=CONCAT('Cancelamento #',$1) WHERE pedido_id=$1`,[id]);
    await pool.query(`INSERT INTO LogsAuditoria(usuario_id,acao,detalhes) VALUES($1,'CANCELAR_PEDIDO',$2)`,[req.usuario.id,`Pedido #${id} cancelado`]);
    res.json({mensagem:'Pedido cancelado.'});
  } catch(e){ res.status(500).json({erro:'Erro.'}); }
};
