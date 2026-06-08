// AdminEstoque.jsx — fix filtro: 'Produtos' comparava com 'Produto' (singular)
import { useState, useEffect } from 'react';
import api from '../services/api';

const FILTROS = ['Todos','Produtos','Matéria-Prima'];

function ModalAjuste({ item, onSalvar, onFechar }) {
  const [qtd,    setQtd]     = useState(parseFloat(item.qtd_atual).toFixed(2));
  const [motivo, setMotivo]  = useState('');
  const [salvando,setSalvando]= useState(false);
  const [erro,   setErro]    = useState('');

  const salvar = async (e) => {
    e.preventDefault(); setSalvando(true); setErro('');
    try {
      if (item.tipo === 'Produto') {
        await api.put(`/produtos/${item.id}`, {
          nome: item.nome, categoria: item.categoria,
          preco_venda: item.preco_venda,
          visivel_portfolio: item.visivel_portfolio,
          estoque_atual: parseFloat(qtd),
          estoque_minimo: item.qtd_minima,
        });
      } else {
        await api.put(`/materiaprima/${item.id}/estoque`, {
          quantidade_atual: parseFloat(qtd), motivo,
        });
      }
      onSalvar();
    } catch (err) { setErro(err.response?.data?.erro || 'Erro ao ajustar.'); }
    finally { setSalvando(false); }
  };

  const diff = parseFloat(qtd) - parseFloat(item.qtd_atual);

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.mH}>
          <h2 style={s.mT}>📦 Ajustar Estoque</h2>
          <button onClick={onFechar} style={s.btnX}>✕</button>
        </div>
        <p style={s.mInfo}>
          <strong>{item.nome}</strong> — {item.tipo}<br/>
          Atual: <strong>{parseFloat(item.qtd_atual).toFixed(2)} {item.unidade}</strong> | Mín: {parseFloat(item.qtd_minima).toFixed(2)} {item.unidade}
        </p>
        <form onSubmit={salvar} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div>
            <label style={s.label}>Nova quantidade ({item.unidade})</label>
            <input type="number" step="0.01" min="0" value={qtd}
              onChange={e=>setQtd(e.target.value)} required style={s.input}/>
            {qtd !== '' && !isNaN(diff) && diff !== 0 && (
              <p style={{fontSize:'0.85rem',color:diff>0?'#059669':'#dc2626',marginTop:'0.25rem'}}>
                {diff>0?`▲ +${diff.toFixed(2)}`:`▼ ${diff.toFixed(2)}`} {item.unidade}
              </p>
            )}
          </div>
          {item.tipo === 'Matéria-Prima' && (
            <div>
              <label style={s.label}>Motivo (opcional)</label>
              <input type="text" value={motivo} onChange={e=>setMotivo(e.target.value)}
                style={s.input} placeholder="Ex: inventário, quebra, correção..."/>
            </div>
          )}
          {erro && <p style={s.erro}>{erro}</p>}
          <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
            <button type="button" onClick={onFechar} style={s.btnCan}>Cancelar</button>
            <button type="submit" disabled={salvando} style={s.btnSal}>
              {salvando?'Salvando...':'✅ Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminEstoque() {
  const [itens,    setItens]    = useState([]);
  const [filtro,   setFiltro]   = useState('Todos');
  const [busca,    setBusca]    = useState('');
  const [ajustando,setAjustando]= useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/materiaprima'),
      ]);
      const produtos = pRes.data.map(p => ({
        id: p.id, tipo: 'Produto', nome: p.nome,
        categoria: p.categoria, preco_venda: p.preco_venda,
        visivel_portfolio: p.visivel_portfolio,
        qtd_atual: p.estoque_atual, qtd_minima: p.estoque_minimo,
        unidade: 'un',
        alerta: parseInt(p.estoque_atual) <= parseInt(p.estoque_minimo),
      }));
      const materiais = mRes.data.map(m => ({
        id: m.id, tipo: 'Matéria-Prima', nome: m.nome,
        qtd_atual: m.quantidade_atual, qtd_minima: m.estoque_minimo,
        unidade: m.unidade_medida, alerta: m.alerta_estoque,
      }));
      setItens([...produtos, ...materiais]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  // ── CORREÇÃO DO FILTRO ───────────────────────────────────
  // 'Produtos' (plural no botão) vs 'Produto' (singular no tipo)
  const filtrados = itens.filter(i => {
    const okTipo =
      filtro === 'Todos' ||
      (filtro === 'Produtos'      && i.tipo === 'Produto') ||
      (filtro === 'Matéria-Prima' && i.tipo === 'Matéria-Prima');
    const okBusca = i.nome.toLowerCase().includes(busca.toLowerCase());
    return okTipo && okBusca;
  });

  const criticos = filtrados.filter(i => i.alerta).length;

  return (
    <div>
      {ajustando && (
        <ModalAjuste item={ajustando}
          onSalvar={() => { setAjustando(null); carregar(); }}
          onFechar={() => setAjustando(null)}/>
      )}

      <h1 style={s.titulo}>📦 Controle de Estoque</h1>

      {criticos > 0 && (
        <div style={s.alerta}>
          ⚠️ <strong>{criticos} item(ns)</strong> com estoque abaixo do mínimo!
        </div>
      )}

      {/* Filtros */}
      <div style={s.filtroBar}>
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
          {FILTROS.map(f => (
            <button key={f} onClick={()=>setFiltro(f)} style={{
              ...s.btnFiltro,
              backgroundColor: filtro===f?'#1e3a8a':'#fff',
              color: filtro===f?'#fff':'#374151',
              borderColor: filtro===f?'#1e3a8a':'#e2e8f0',
            }}>
              {f}
              <span style={{marginLeft:'0.4rem',fontSize:'0.78rem',opacity:0.8}}>
                ({filtro===f ? filtrados.length : itens.filter(i=>(
                  f==='Todos'||(f==='Produtos'&&i.tipo==='Produto')||(f==='Matéria-Prima'&&i.tipo==='Matéria-Prima')
                )).length})
              </span>
            </button>
          ))}
        </div>
        <input type="text" placeholder="🔍 Buscar..." value={busca}
          onChange={e=>setBusca(e.target.value)} style={s.inputBusca}/>
      </div>

      {/* Sumário */}
      <div style={s.sumRow}>
        {[
          {label:'Total',cor:'#1e3a8a',val:filtrados.length},
          {label:'OK',   cor:'#059669',val:filtrados.filter(i=>!i.alerta).length},
          {label:'Crítico',cor:'#dc2626',val:filtrados.filter(i=>i.alerta).length},
        ].map(c=>(
          <div key={c.label} style={s.sumCard}>
            <div style={{fontSize:'1.4rem',fontWeight:'800',color:c.cor}}>{c.val}</div>
            <div style={{fontSize:'0.82rem',color:'#64748b'}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      {loading ? <p style={{color:'#94a3b8',textAlign:'center',padding:'2rem'}}>Carregando...</p> : (
        <div style={{overflowX:'auto'}}>
          <table style={s.tabela}>
            <thead><tr style={s.thead}>
              {['Tipo','Nome','Qtd Atual','Mínimo','Status','Ajustar'].map(h=>
                <th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtrados.length===0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>
                  Nenhum item encontrado.
                </td></tr>
              ) : filtrados.map((item,i)=>(
                <tr key={`${item.tipo}-${item.id}`}
                  style={{backgroundColor:item.alerta?'#fff7ed':i%2===0?'#fff':'#f8fafc'}}>
                  <td style={s.td}>
                    <span style={{padding:'0.2rem 0.6rem',borderRadius:'20px',fontSize:'0.78rem',fontWeight:'600',
                      backgroundColor:item.tipo==='Produto'?'#dbeafe':'#fef3c7',
                      color:item.tipo==='Produto'?'#1e40af':'#92400e'}}>
                      {item.tipo==='Produto'?'🧵 Produto':'🔮 Mat. Prima'}
                    </span>
                  </td>
                  <td style={{...s.td,fontWeight:'600'}}>{item.nome}</td>
                  <td style={{...s.td,fontWeight:'bold',fontSize:'1rem',
                    color:item.alerta?'#dc2626':'#059669'}}>
                    {parseFloat(item.qtd_atual).toFixed(2)} {item.unidade}
                  </td>
                  <td style={{...s.td,color:'#64748b'}}>
                    {parseFloat(item.qtd_minima).toFixed(2)} {item.unidade}
                  </td>
                  <td style={s.td}>
                    <span style={{padding:'0.2rem 0.6rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'600',
                      backgroundColor:item.alerta?'#fee2e2':'#d1fae5',
                      color:item.alerta?'#dc2626':'#065f46'}}>
                      {item.alerta?'⚠️ Crítico':'✅ OK'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button onClick={()=>setAjustando(item)} style={s.btnAj}>✏️ Ajustar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s={titulo:{color:'#1e3a8a',margin:'0 0 1.5rem',fontSize:'1.6rem',fontWeight:'700'},alerta:{backgroundColor:'#fff7ed',border:'1px solid #fed7aa',borderRadius:'10px',padding:'0.875rem 1.25rem',marginBottom:'1.25rem',color:'#92400e',fontWeight:'600'},filtroBar:{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem',marginBottom:'1rem'},btnFiltro:{padding:'0.45rem 1rem',borderRadius:'8px',border:'1.5px solid',cursor:'pointer',fontWeight:'600',fontSize:'0.88rem'},inputBusca:{padding:'0.5rem 0.875rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem',width:'220px'},sumRow:{display:'flex',gap:'1rem',marginBottom:'1.25rem',flexWrap:'wrap'},sumCard:{flex:'1 1 120px',backgroundColor:'#fff',borderRadius:'10px',padding:'0.875rem 1.25rem',boxShadow:'0 1px 6px rgba(0,0,0,0.05)',textAlign:'center'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem',backgroundColor:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},btnAj:{backgroundColor:'#fef3c7',color:'#92400e',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontWeight:'600',fontSize:'0.85rem'},
overlay:{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'},modal:{backgroundColor:'#fff',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'460px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'},mH:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'},mT:{color:'#1e3a8a',margin:0,fontSize:'1.1rem',fontWeight:'700'},btnX:{backgroundColor:'transparent',border:'none',fontSize:'1.3rem',cursor:'pointer',color:'#64748b'},mInfo:{backgroundColor:'#f0f4ff',borderRadius:'8px',padding:'0.875rem',fontSize:'0.9rem',color:'#374151',marginBottom:'1rem',lineHeight:1.6},label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.88rem',marginBottom:'0.3rem'},input:{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.95rem'},erro:{backgroundColor:'#fee2e2',color:'#dc2626',padding:'0.75rem',borderRadius:'8px',fontSize:'0.88rem'},btnSal:{backgroundColor:'#059669',color:'#fff',border:'none',padding:'0.7rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'},btnCan:{backgroundColor:'#f1f5f9',color:'#374151',border:'1px solid #e2e8f0',padding:'0.7rem 1.25rem',borderRadius:'8px',cursor:'pointer'}};
