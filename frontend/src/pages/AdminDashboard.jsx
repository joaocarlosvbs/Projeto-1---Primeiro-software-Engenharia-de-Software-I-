// AdminDashboard.jsx — com botão de detalhes por pedido na fila
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import api from '../services/api';

const COR_STATUS = {
  'Aguardando':'#f59e0b','Em Produção':'#3b82f6',
  'Finalizado':'#10b981','Entregue':'#6b7280','Cancelado':'#ef4444'
};
const COR_BARRAS = ['#1e3a8a','#2563eb','#3b82f6','#60a5fa','#93c5fd'];
const STATUS_OPCOES = ['Aguardando','Em Produção','Finalizado','Entregue'];
const fmt = v => `R$ ${parseFloat(v||0).toFixed(2).replace('.',',')}`;

// ── Modal UC09 — Consumo de Produção ────────────────────────
function ModalConsumo({ pedidoId, onConfirmar, onPular }) {
  const [materiais,  setMateriais]  = useState([]);
  const [itens,      setItens]      = useState([{materia_prima_id:'',quantidade:''}]);
  const [carregando, setCarregando] = useState(false);
  const [salvando,   setSalvando]   = useState(false);
  const [msg,        setMsg]        = useState('');

  useEffect(() => {
    setCarregando(true);
    api.get('/materiaprima').then(r=>setMateriais(r.data)).finally(()=>setCarregando(false));
  },[]);

  const addLinha = () => setItens([...itens,{materia_prima_id:'',quantidade:''}]);
  const removeLinha = i => setItens(itens.filter((_,idx)=>idx!==i));
  const atualizarLinha = (i,campo,valor) => {
    const novo=[...itens]; novo[i][campo]=valor; setItens(novo);
  };

  const handleSalvar = async () => {
    const validos = itens.filter(it=>it.materia_prima_id && it.quantidade>0);
    if (!validos.length){setMsg('Adicione pelo menos um material ou clique em Pular.');return;}
    setSalvando(true);
    try {
      for(const it of validos){
        await api.post('/consumo',{
          item_pedido_id:null,materia_prima_id:it.materia_prima_id,
          quantidade_usada:parseFloat(it.quantidade),pedido_id:pedidoId
        });
      }
      onConfirmar();
    } catch(err){setMsg(err.response?.data?.erro||'Erro ao registrar.');}
    finally{setSalvando(false);}
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.mH}>
          <h2 style={s.mT}>📦 Consumo de Produção — Pedido #{pedidoId}</h2>
        </div>
        <p style={s.mInfo}>Informe os materiais utilizados. Clique em <strong>Pular</strong> se não quiser registrar agora.</p>
        {carregando?<p style={{color:'#94a3b8',textAlign:'center'}}>Carregando...</p>:(
          <>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1rem'}}>
              {itens.map((item,i)=>{
                const mp=materiais.find(m=>m.id===parseInt(item.materia_prima_id));
                return(
                  <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
                    <select value={item.materia_prima_id}
                      onChange={e=>atualizarLinha(i,'materia_prima_id',e.target.value)}
                      style={{flex:1,minWidth:'180px',padding:'0.55rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'}}>
                      <option value="">Selecione o material...</option>
                      {materiais.map(m=>(
                        <option key={m.id} value={m.id}>
                          {m.nome} (estoque: {parseFloat(m.quantidade_atual).toFixed(1)} {m.unidade_medida})
                        </option>
                      ))}
                    </select>
                    <input type="number" min="0.01" step="0.01" placeholder="Qtd"
                      value={item.quantidade}
                      onChange={e=>atualizarLinha(i,'quantidade',e.target.value)}
                      style={{width:'80px',padding:'0.55rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem',textAlign:'center'}}/>
                    {mp&&<span style={{fontSize:'0.82rem',color:'#64748b'}}>{mp.unidade_medida}</span>}
                    {itens.length>1&&<button onClick={()=>removeLinha(i)} style={{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',fontWeight:'bold'}}>✕</button>}
                  </div>
                );
              })}
            </div>
            <button onClick={addLinha} style={{backgroundColor:'transparent',color:'#1e3a8a',border:'1.5px dashed #bfdbfe',padding:'0.5rem 1rem',borderRadius:'8px',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600',width:'100%',marginBottom:'1rem'}}>
              + Adicionar outro material
            </button>
            {msg&&<p style={{backgroundColor:'#fee2e2',color:'#dc2626',padding:'0.75rem',borderRadius:'8px',fontSize:'0.88rem',marginBottom:'0.75rem'}}>{msg}</p>}
          </>
        )}
        <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid #f1f5f9'}}>
          <button onClick={onPular} style={{backgroundColor:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',padding:'0.7rem 1.25rem',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'0.9rem'}}>Pular</button>
          <button onClick={handleSalvar} disabled={salvando} style={{backgroundColor:'#059669',color:'#fff',border:'none',padding:'0.7rem 1.5rem',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'0.9rem'}}>
            {salvando?'Salvando...':'✅ Registrar e Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de Detalhes do Pedido ──────────────────────────────
function ModalDetalhe({ pedidoId, onFechar }) {
  const [detalhe, setDetalhe] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState('');

  useEffect(() => {
    api.get(`/pedidos/${pedidoId}`)
      .then(r => setDetalhe(r.data))
      .catch(() => setErro('Erro ao carregar detalhes.'))
      .finally(() => setLoading(false));
  }, [pedidoId]);

  return (
    <div style={s.overlay}>
      <div style={{...s.modal, maxWidth:'580px'}}>
        <div style={s.mH}>
          <div>
            <h2 style={s.mT}>📋 Pedido #{pedidoId}</h2>
            {detalhe && (
              <p style={{color:'#64748b',margin:'0.2rem 0 0',fontSize:'0.85rem'}}>
                Cliente: <strong>{detalhe.cliente}</strong>
                {detalhe.telefone && ` | ${detalhe.telefone}`}
              </p>
            )}
          </div>
          <button onClick={onFechar} style={{backgroundColor:'transparent',border:'none',fontSize:'1.3rem',cursor:'pointer',color:'#64748b'}}>✕</button>
        </div>

        {loading && <p style={{color:'#94a3b8',textAlign:'center',padding:'2rem'}}>Carregando...</p>}
        {erro    && <p style={{color:'#dc2626',padding:'1rem'}}>{erro}</p>}

        {detalhe && (
          <>
            {/* Info geral */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1.25rem'}}>
              {[
                {label:'Data do pedido',  valor: new Date(detalhe.data_pedido).toLocaleDateString('pt-BR')},
                {label:'Entrega prevista',valor: detalhe.data_entrega ? new Date(detalhe.data_entrega+'T12:00:00').toLocaleDateString('pt-BR') : '—'},
                {label:'Status',          valor: detalhe.status},
              ].map(info=>(
                <div key={info.label} style={{backgroundColor:'#f8fafc',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>{info.label}</div>
                  <div style={{fontWeight:'700',color:'#1e3a8a',fontSize:'0.9rem'}}>{info.valor}</div>
                </div>
              ))}
            </div>

            {/* Itens do pedido */}
            <h3 style={{color:'#1e3a8a',fontSize:'0.95rem',fontWeight:'700',margin:'0 0 0.75rem'}}>Itens Encomendados</h3>
            <div style={{overflowX:'auto',marginBottom:'1.25rem'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.88rem'}}>
                <thead>
                  <tr style={{backgroundColor:'#1e3a8a'}}>
                    {['Produto','Qtd','Personalização','Subtotal'].map(h=>(
                      <th key={h} style={{padding:'0.6rem 0.875rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.82rem'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalhe.itens?.map((item,i)=>(
                    <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                      <td style={{padding:'0.6rem 0.875rem',fontWeight:'600',borderBottom:'1px solid #f1f5f9'}}>{item.produto}</td>
                      <td style={{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9',textAlign:'center'}}>{item.quantidade}x</td>
                      <td style={{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9',color:item.personalizacao?'#374151':'#94a3b8',fontStyle:item.personalizacao?'normal':'italic',maxWidth:'180px'}}>
                        {item.personalizacao || '—'}
                      </td>
                      <td style={{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9',fontWeight:'bold',color:'#f97316'}}>
                        {fmt(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{backgroundColor:'#f0f4ff'}}>
                    <td colSpan={3} style={{padding:'0.6rem 0.875rem',fontWeight:'700',textAlign:'right'}}>Total do Pedido:</td>
                    <td style={{padding:'0.6rem 0.875rem',fontWeight:'800',color:'#1e3a8a',fontSize:'1rem'}}>{fmt(detalhe.valor_total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Consumo registrado */}
            {detalhe.consumo?.length > 0 && (
              <>
                <h3 style={{color:'#1e3a8a',fontSize:'0.95rem',fontWeight:'700',margin:'0 0 0.75rem'}}>🔮 Matéria-Prima Consumida</h3>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.88rem'}}>
                    <thead>
                      <tr style={{backgroundColor:'#1e3a8a'}}>
                        {['Material','Total Utilizado'].map(h=>(
                          <th key={h} style={{padding:'0.6rem 0.875rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.82rem'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detalhe.consumo.map((c,i)=>(
                        <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                          <td style={{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9',fontWeight:'600'}}>{c.material}</td>
                          <td style={{padding:'0.6rem 0.875rem',borderBottom:'1px solid #f1f5f9'}}>
                            {parseFloat(c.total_usado).toFixed(2)} {c.unidade_medida}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Tooltips dos gráficos ────────────────────────────────────
const TTPizza = ({active,payload}) => active&&payload?.length?(
  <div style={s.tooltip}><strong>{payload[0].name}</strong><br/>{payload[0].value} pedido(s)</div>
):null;
const TTBarra = ({active,payload,label}) => active&&payload?.length?(
  <div style={s.tooltip}><strong>{label}</strong><br/>{payload[0].value} unidade(s)</div>
):null;

// ── Componente Principal ─────────────────────────────────────
export default function AdminDashboard() {
  const [dados,       setDados]       = useState(null);
  const [pedidos,     setPedidos]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [atualizando, setAtualizando] = useState(null);
  const [filtro,      setFiltro]      = useState({inicio:'',fim:''});
  const [modalConsumo,setModalConsumo]= useState(null);
  const [pendente,    setPendente]    = useState(null);
  const [modalDetalhe,setModalDetalhe]= useState(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async (ini,fim) => {
    setLoading(true);
    try {
      const params = ini&&fim?`?inicio=${ini}T00:00:00&fim=${fim}T23:59:59`:'';
      const [dRes,pRes] = await Promise.all([
        api.get(`/financeiro/dashboard${params}`),
        api.get('/pedidos'),
      ]);
      setDados(dRes.data); setPedidos(pRes.data);
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  const handleMudarStatus = (pedidoId,novoStatus) => {
    if(novoStatus==='Finalizado'){setPendente({id:pedidoId,status:novoStatus});setModalConsumo({pedidoId});}
    else{aplicarStatus(pedidoId,novoStatus);}
  };

  const aplicarStatus = async (pedidoId,novoStatus) => {
    setAtualizando(pedidoId);
    try{ await api.put(`/pedidos/${pedidoId}/status`,{status:novoStatus}); carregar(filtro.inicio,filtro.fim); }
    catch{ alert('Erro ao atualizar status.'); }
    finally{ setAtualizando(null); }
  };

  const handleConsumoConfirmado = async () => {
    setModalConsumo(null);
    if(pendente){ await aplicarStatus(pendente.id,pendente.status); setPendente(null); }
  };

  const dadosPizza = dados?.pedidos_por_status?.map(p=>({name:p.status,value:parseInt(p.quantidade)}))||[];
  const dadosBarras = (dados?.top_produtos||[]).map(p=>({
    nome:p.nome.length>16?p.nome.slice(0,14)+'…':p.nome,
    vendas:parseInt(p.total_vendido)
  }));

  return (
    <div style={s.page}>
      {modalConsumo&&<ModalConsumo pedidoId={modalConsumo.pedidoId} onConfirmar={handleConsumoConfirmado} onPular={()=>{setModalConsumo(null);if(pendente){aplicarStatus(pendente.id,pendente.status);setPendente(null);}}}/>}
      {modalDetalhe&&<ModalDetalhe pedidoId={modalDetalhe} onFechar={()=>setModalDetalhe(null)}/>}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>⚙️ Painel Administrativo</h1>
          <p style={s.sub}>Visão geral do negócio em tempo real</p>
        </div>
        <form onSubmit={e=>{e.preventDefault();carregar(filtro.inicio,filtro.fim);}} style={s.filtroRow}>
          <input type="date" value={filtro.inicio} style={s.inputData} onChange={e=>setFiltro({...filtro,inicio:e.target.value})}/>
          <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>até</span>
          <input type="date" value={filtro.fim} style={s.inputData} onChange={e=>setFiltro({...filtro,fim:e.target.value})}/>
          <button type="submit" style={s.btnFiltrar}>Filtrar</button>
          <button type="button" style={s.btnLimpar} onClick={()=>{setFiltro({inicio:'',fim:''});carregar();}}>Limpar</button>
        </form>
      </div>

      {loading?(
        <div style={s.loading}><div style={s.spinner}/>Carregando...</div>
      ):(
        <>
          {/* KPIs */}
          <div style={s.kpiRow}>
            {[
              {label:'Receita',       valor:fmt(dados?.receita),  cor:'#10b981',icone:'💰'},
              {label:'Despesas',      valor:fmt(dados?.despesa),  cor:'#ef4444',icone:'📤'},
              {label:'Lucro Líquido', valor:fmt(dados?.lucro),    cor:(dados?.lucro||0)>=0?'#1d4ed8':'#dc2626',icone:'📈'},
              {label:'Total Pedidos', valor:pedidos.length,       cor:'#7c3aed',icone:'📦'},
            ].map(k=>(
              <div key={k.label} style={{...s.kpiCard,borderTop:`4px solid ${k.cor}`}}>
                <div style={s.kpiTop}><span style={s.kpiIcone}>{k.icone}</span><span style={{...s.kpiValor,color:k.cor}}>{k.valor}</span></div>
                <span style={s.kpiLabel}>{k.label}</span>
              </div>
            ))}
          </div>

          {/* Alertas */}
          {dados?.alertas_estoque?.length>0&&(
            <div style={s.alerta}>
              <span style={s.alertaT}>⚠️ Estoque Crítico:</span>
              {dados.alertas_estoque.map(a=>(
                <span key={a.nome} style={s.alertaB}>{a.nome}: {parseFloat(a.quantidade_atual).toFixed(1)} / {parseFloat(a.estoque_minimo).toFixed(1)} {a.unidade_medida}</span>
              ))}
            </div>
          )}

          {/* Gráficos */}
          <div style={s.grafRow}>
            <div style={s.grafCard}>
              <h3 style={s.grafT}>Pedidos por Status</h3>
              {dadosPizza.length===0?<p style={s.semD}>Sem pedidos</p>:(
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({value})=>value}>
                      {dadosPizza.map(e=><Cell key={e.name} fill={COR_STATUS[e.name]||'#94a3b8'}/>)}
                    </Pie>
                    <Tooltip content={<TTPizza/>}/>
                    <Legend formatter={v=><span style={{fontSize:'0.8rem',color:'#374151'}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={s.grafCard}>
              <h3 style={s.grafT}>Produtos Mais Vendidos</h3>
              {dadosBarras.length===0?<p style={s.semD}>Sem vendas no período</p>:(
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dadosBarras} margin={{top:5,right:10,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="nome" tick={{fontSize:11}}/>
                    <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                    <Tooltip content={<TTBarra/>}/>
                    <Bar dataKey="vendas" radius={[6,6,0,0]}>
                      {dadosBarras.map((_,i)=><Cell key={i} fill={COR_BARRAS[i%COR_BARRAS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Fila de Pedidos */}
          <div style={s.tabelaCard}>
            <h2 style={s.secT}>📋 Fila de Pedidos</h2>
            <div style={{overflowX:'auto'}}>
              <table style={s.tabela}>
                <thead><tr style={s.thead}>
                  {['#','Cliente','Data','Valor Total','Status','Alterar Status','Detalhes'].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {pedidos.length===0?(
                    <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>Nenhum pedido na fila.</td></tr>
                  ):pedidos.map((p,i)=>(
                    <tr key={p.id} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                      <td style={s.td}><span style={s.pedNum}>#{p.id}</span></td>
                      <td style={s.td}>{p.cliente}</td>
                      <td style={s.td}>{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                      <td style={{...s.td,fontWeight:'bold',color:'#f97316'}}>{fmt(p.valor_total)}</td>
                      <td style={s.td}>
                        <span style={{...s.badge,backgroundColor:(COR_STATUS[p.status]||'#94a3b8')+'22',color:COR_STATUS[p.status]||'#94a3b8',border:`1px solid ${(COR_STATUS[p.status]||'#94a3b8')}44`}}>
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <select value={p.status} disabled={atualizando===p.id}
                          onChange={e=>handleMudarStatus(p.id,e.target.value)} style={s.select}>
                          {STATUS_OPCOES.map(op=><option key={op}>{op}</option>)}
                        </select>
                      </td>
                      {/* ── BOTÃO DE DETALHES ── */}
                      <td style={s.td}>
                        <button
                          onClick={()=>setModalDetalhe(p.id)}
                          style={s.btnDetalhe}
                          title="Ver itens e personalizações">
                          🔍 Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s={page:{maxWidth:'1200px',margin:'0 auto',padding:'2rem 1.5rem'},header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1.75rem'},titulo:{color:'#1e3a8a',margin:'0 0 0.25rem',fontSize:'1.6rem',fontWeight:'700'},sub:{color:'#64748b',margin:0,fontSize:'0.9rem'},filtroRow:{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'},inputData:{padding:'0.5rem 0.75rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'},btnFiltrar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.5rem 1rem',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'0.9rem'},btnLimpar:{backgroundColor:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',padding:'0.5rem 1rem',borderRadius:'8px',cursor:'pointer',fontSize:'0.9rem'},loading:{textAlign:'center',padding:'4rem',color:'#64748b',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'},spinner:{width:'36px',height:'36px',border:'3px solid #dbeafe',borderTopColor:'#1e3a8a',borderRadius:'50%'},kpiRow:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.25rem'},kpiCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.25rem 1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',gap:'0.5rem'},kpiTop:{display:'flex',justifyContent:'space-between',alignItems:'center'},kpiIcone:{fontSize:'1.75rem'},kpiValor:{fontSize:'1.5rem',fontWeight:'800'},kpiLabel:{color:'#64748b',fontSize:'0.85rem',fontWeight:'600'},alerta:{backgroundColor:'#fffbeb',border:'1px solid #fcd34d',borderRadius:'10px',padding:'0.875rem 1.25rem',marginBottom:'1.25rem',display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'},alertaT:{fontWeight:'700',color:'#92400e',whiteSpace:'nowrap'},alertaB:{backgroundColor:'#fef3c7',border:'1px solid #fde68a',borderRadius:'6px',padding:'0.2rem 0.6rem',fontSize:'0.82rem',color:'#92400e'},grafRow:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.25rem',marginBottom:'1.25rem'},grafCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.25rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'},grafT:{color:'#1e3a8a',margin:'0 0 0.75rem',fontSize:'1rem',fontWeight:'700'},semD:{color:'#94a3b8',textAlign:'center',padding:'3rem 0',fontSize:'0.9rem'},tooltip:{backgroundColor:'#1e3a8a',color:'#fff',padding:'0.5rem 0.875rem',borderRadius:'8px',fontSize:'0.85rem'},tabelaCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'},secT:{color:'#1e3a8a',margin:'0 0 1rem',fontSize:'1.1rem',fontWeight:'700'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},pedNum:{backgroundColor:'#dbeafe',color:'#1e40af',padding:'0.2rem 0.5rem',borderRadius:'6px',fontWeight:'700',fontSize:'0.85rem'},badge:{padding:'0.25rem 0.7rem',borderRadius:'20px',fontWeight:'600',fontSize:'0.8rem',whiteSpace:'nowrap'},select:{padding:'0.35rem 0.6rem',borderRadius:'6px',border:'1.5px solid #e2e8f0',fontSize:'0.85rem',cursor:'pointer',backgroundColor:'#fff'},btnDetalhe:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},
overlay:{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'},modal:{backgroundColor:'#fff',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'},mH:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'},mT:{color:'#1e3a8a',margin:0,fontSize:'1.1rem',fontWeight:'700'},mInfo:{backgroundColor:'#f0f4ff',border:'1px solid #bfdbfe',borderRadius:'8px',padding:'0.875rem',fontSize:'0.9rem',color:'#374151',marginBottom:'1.25rem',lineHeight:1.6}};
