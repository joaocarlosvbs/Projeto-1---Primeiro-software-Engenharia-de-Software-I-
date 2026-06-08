// AdminPedidosHistorico.jsx — Histórico de pedidos com itens e consumo
import { useState, useEffect } from 'react';
import api from '../services/api';

const hoje = new Date().toISOString().split('T')[0];
const STATUS = ['Todos','Finalizado','Entregue','Cancelado'];
const fmt = v => `R$ ${parseFloat(v||0).toFixed(2).replace('.',',')}`;
const COR = { 'Finalizado':'#10b981','Entregue':'#6b7280','Cancelado':'#ef4444' };

export default function AdminPedidosHistorico() {
  const [pedidos,   setPedidos]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [filtro,    setFiltro]    = useState({ inicio:'', fim:hoje, status:'Todos' });
  const [buscado,   setBuscado]   = useState(false);

  const buscar = async () => {
    setLoading(true); setBuscado(true);
    try {
      const params = new URLSearchParams({ status: filtro.status });
      if (filtro.inicio) params.append('inicio', filtro.inicio+'T00:00:00');
      if (filtro.fim)    params.append('fim',    filtro.fim+'T23:59:59');
      const r = await api.get(`/pedidos/historico?${params}`);
      setPedidos(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { buscar(); }, []);

  const totalReceita = pedidos
    .filter(p=>p.status!=='Cancelado')
    .reduce((a,p)=>a+parseFloat(p.valor_total||0),0);

  return (
    <div>
      <h1 style={s.titulo}>🗂️ Histórico de Pedidos</h1>

      {/* Filtros */}
      <div style={s.filtroCard}>
        <div style={s.filtroRow}>
          <div>
            <label style={s.label}>Período início</label>
            <input type="date" value={filtro.inicio} style={s.input}
              onChange={e=>setFiltro({...filtro,inicio:e.target.value})}/>
          </div>
          <div>
            <label style={s.label}>Período fim</label>
            <input type="date" value={filtro.fim} style={s.input}
              onChange={e=>setFiltro({...filtro,fim:e.target.value})}/>
          </div>
          <div>
            <label style={s.label}>Status</label>
            <select value={filtro.status} style={s.input}
              onChange={e=>setFiltro({...filtro,status:e.target.value})}>
              {STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={buscar} style={s.btnBuscar}>🔍 Buscar</button>
        </div>
      </div>

      {/* Resumo */}
      {buscado && (
        <div style={s.resumoRow}>
          <div style={s.resumoCard}><div style={s.resumoNum}>{pedidos.length}</div><div style={s.resumoLabel}>Pedidos</div></div>
          <div style={s.resumoCard}><div style={{...s.resumoNum,color:'#059669'}}>{fmt(totalReceita)}</div><div style={s.resumoLabel}>Receita Total</div></div>
          <div style={s.resumoCard}><div style={{...s.resumoNum,color:'#f97316'}}>{pedidos.filter(p=>p.consumo?.length>0).length}</div><div style={s.resumoLabel}>Com consumo registrado</div></div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p style={{color:'#94a3b8',textAlign:'center',padding:'3rem'}}>Carregando...</p>
      ) : !buscado ? null : pedidos.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',color:'#64748b'}}>
          <p style={{fontSize:'2.5rem'}}>📭</p>
          <p>Nenhum pedido encontrado no período.</p>
        </div>
      ) : pedidos.map(p => (
        <div key={p.id} style={s.pedidoCard}>
          {/* Cabeçalho do pedido */}
          <div style={s.pedidoHeader} onClick={()=>setExpandido(expandido===p.id?null:p.id)}>
            <div style={s.pedidoInfo}>
              <span style={s.pedidoNum}>#{p.id}</span>
              <div>
                <div style={s.pedidoCliente}>{p.cliente}</div>
                <div style={s.pedidoData}>
                  {new Date(p.data_pedido).toLocaleDateString('pt-BR')}
                  {p.data_entrega && ` → entrega: ${new Date(p.data_entrega).toLocaleDateString('pt-BR')}`}
                </div>
              </div>
            </div>
            <div style={s.pedidoDireita}>
              <span style={{...s.badge,backgroundColor:(COR[p.status]||'#94a3b8')+'22',color:COR[p.status]||'#94a3b8'}}>
                {p.status}
              </span>
              <span style={s.pedidoValor}>{fmt(p.valor_total)}</span>
              <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>{expandido===p.id?'▲':'▼'}</span>
            </div>
          </div>

          {/* Detalhes expansíveis */}
          {expandido === p.id && (
            <div style={s.detalhes}>
              {/* Itens do pedido */}
              <h4 style={s.secTitulo}>📋 Itens do Pedido</h4>
              <table style={s.tabela}>
                <thead><tr style={s.thead}>
                  {['Produto','Qtd','Personalização','Subtotal'].map(h=><th key={h} style={s.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {p.itens?.map((item,i)=>(
                    <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                      <td style={{...s.td,fontWeight:'600'}}>{item.produto}</td>
                      <td style={s.td}>{item.quantidade}x</td>
                      <td style={{...s.td,color:'#64748b',fontStyle:item.personalizacao?'normal':'italic'}}>
                        {item.personalizacao||'—'}
                      </td>
                      <td style={{...s.td,fontWeight:'bold',color:'#f97316'}}>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                  <tr style={{backgroundColor:'#f0f4ff'}}>
                    <td colSpan={3} style={{...s.td,fontWeight:'700',textAlign:'right'}}>Total do Pedido</td>
                    <td style={{...s.td,fontWeight:'800',color:'#1e3a8a',fontSize:'1rem'}}>{fmt(p.valor_total)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Consumo de matéria-prima */}
              <h4 style={{...s.secTitulo,marginTop:'1.25rem'}}>🔮 Matéria-Prima Consumida</h4>
              {!p.consumo?.length ? (
                <p style={{color:'#94a3b8',fontSize:'0.88rem',fontStyle:'italic'}}>
                  Nenhum consumo registrado para este pedido.
                </p>
              ) : (
                <table style={s.tabela}>
                  <thead><tr style={s.thead}>
                    {['Material','Total Usado'].map(h=><th key={h} style={s.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {p.consumo.map((c,i)=>(
                      <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                        <td style={{...s.td,fontWeight:'600'}}>{c.material}</td>
                        <td style={s.td}>{parseFloat(c.total_usado).toFixed(2)} {c.unidade_medida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const s={titulo:{color:'#1e3a8a',margin:'0 0 1.5rem',fontSize:'1.6rem',fontWeight:'700'},filtroCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.25rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'1.25rem'},filtroRow:{display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'},label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.88rem',marginBottom:'0.3rem'},input:{padding:'0.6rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem',width:'100%'},btnBuscar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.65rem 1.25rem',borderRadius:'8px',cursor:'pointer',fontWeight:'700',alignSelf:'flex-end'},resumoRow:{display:'flex',gap:'1rem',marginBottom:'1.25rem',flexWrap:'wrap'},resumoCard:{flex:'1 1 140px',backgroundColor:'#fff',borderRadius:'10px',padding:'1rem',boxShadow:'0 1px 6px rgba(0,0,0,0.05)',textAlign:'center'},resumoNum:{fontSize:'1.4rem',fontWeight:'800',color:'#1e3a8a'},resumoLabel:{fontSize:'0.82rem',color:'#64748b',fontWeight:'600'},pedidoCard:{backgroundColor:'#fff',borderRadius:'12px',marginBottom:'0.75rem',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',overflow:'hidden'},pedidoHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 1.25rem',cursor:'pointer',flexWrap:'wrap',gap:'0.5rem'},pedidoInfo:{display:'flex',gap:'0.75rem',alignItems:'center'},pedidoNum:{backgroundColor:'#dbeafe',color:'#1e40af',padding:'0.2rem 0.6rem',borderRadius:'6px',fontWeight:'700',fontSize:'0.85rem',whiteSpace:'nowrap'},pedidoCliente:{fontWeight:'700',color:'#1e293b',fontSize:'0.95rem'},pedidoData:{fontSize:'0.82rem',color:'#64748b'},pedidoDireita:{display:'flex',gap:'1rem',alignItems:'center'},badge:{padding:'0.25rem 0.7rem',borderRadius:'20px',fontWeight:'600',fontSize:'0.8rem',border:'1px solid transparent'},pedidoValor:{fontWeight:'800',color:'#f97316'},detalhes:{borderTop:'1px solid #f1f5f9',padding:'1.25rem'},secTitulo:{color:'#1e3a8a',margin:'0 0 0.75rem',fontSize:'0.95rem',fontWeight:'700'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.6rem 0.875rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.82rem'},td:{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9'}};
