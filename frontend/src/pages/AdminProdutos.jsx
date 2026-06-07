// AdminProdutos.jsx — CRUD completo com upload de imagem e excluir
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { CATEGORIAS } from '../config/site';
import BotaoVoltar from '../components/BotaoVoltar';

const VAZIO = { nome:'', categoria:'', preco_venda:'', visivel_portfolio:true };
const CALC  = { custo_material:'', horas:'', valor_hora:'', margem:'30' };

export default function AdminProdutos() {
  const [produtos,   setProdutos]   = useState([]);
  const [form,       setForm]       = useState(VAZIO);
  const [editId,     setEditId]     = useState(null);
  const [msg,        setMsg]        = useState('');
  const [salvando,   setSalvando]   = useState(false);
  const [calc,       setCalc]       = useState(CALC);
  const [mostrarCalc,setMostrarCalc]= useState(false);
  const [uploadMsg,  setUploadMsg]  = useState('');
  const [uploadingId,setUploadingId]= useState(null);
  const fileRefs = useRef({});

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/produtos').then(r => setProdutos(r.data));

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSalvar = async e => {
    e.preventDefault(); setSalvando(true); setMsg('');
    try {
      if (editId) await api.put(`/produtos/${editId}`, form);
      else        await api.post('/produtos', form);
      setMsg(editId ? '✅ Atualizado!' : '✅ Cadastrado!');
      setForm(VAZIO); setEditId(null); carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
    finally { setSalvando(false); }
  };

  const handleEditar = p => {
    setEditId(p.id);
    setForm({ nome:p.nome, categoria:p.categoria||'', preco_venda:p.preco_venda, visivel_portfolio:p.visivel_portfolio });
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleExcluir = async p => {
    if (!window.confirm(`Excluir "${p.nome}"?`)) return;
    try {
      const r = await api.delete(`/produtos/${p.id}`);
      setMsg(r.data.desativado ? `⚠️ "${p.nome}" desativado.` : `✅ "${p.nome}" excluído.`);
      carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro ao excluir.')); }
  };

  const toggleVisibilidade = async p => {
    await api.put(`/produtos/${p.id}`, { ...p, visivel_portfolio: !p.visivel_portfolio });
    carregar();
  };

  const handleUpload = async (produtoId, file) => {
    if (!file) return;
    setUploadingId(produtoId); setUploadMsg('Enviando...');
    const fd = new FormData();
    fd.append('imagem', file);
    try {
      await api.post(`/produtos/${produtoId}/imagem`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setUploadMsg('✅ Imagem salva!');
      carregar();
    } catch (err) { setUploadMsg('❌ ' + (err.response?.data?.erro || 'Erro no upload.')); }
    finally { setUploadingId(null); }
  };

  const handleRemoverImagem = async id => {
    if (!window.confirm('Remover imagem?')) return;
    await api.delete(`/produtos/${id}/imagem`);
    carregar();
  };

  const precoSugerido = (() => {
    const cm = parseFloat(calc.custo_material)||0;
    const mo = (parseFloat(calc.horas)||0)*(parseFloat(calc.valor_hora)||0);
    const base = cm + mo;
    return base > 0 ? (base*(1+(parseFloat(calc.margem)||0)/100)).toFixed(2) : null;
  })();

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>🧵 Gerenciar Produtos</h1>

      <div style={s.card}>
        <h2 style={s.cardT}>{editId ? `✏️ Editando #${editId}` : '+ Novo Produto'}</h2>
        <form onSubmit={handleSalvar} style={s.form}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required style={s.input} placeholder="Ex: Toalha de Batizado"/>
            </div>
            <div>
              <label style={s.label}>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} style={s.input}>
                <option value="">Selecione...</option>
                {CATEGORIAS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>
                Preço (R$) *
                <button type="button" onClick={()=>setMostrarCalc(!mostrarCalc)} style={s.btnCalc}>🧮 Calculadora</button>
              </label>
              <input name="preco_venda" type="number" step="0.01" min="0" value={form.preco_venda} onChange={handleChange} required style={s.input}/>
            </div>
            <div style={s.checkRow}>
              <input type="checkbox" name="visivel_portfolio" id="vis" checked={form.visivel_portfolio} onChange={handleChange} style={{width:'18px',height:'18px'}}/>
              <label htmlFor="vis" style={{fontWeight:'600',cursor:'pointer'}}>Visível no Portfólio</label>
            </div>
          </div>

          {mostrarCalc && (
            <div style={s.calcBox}>
              <div style={s.calcGrid}>
                {[['custo_material','Materiais (R$)'],['horas','Horas'],['valor_hora','R$/Hora'],['margem','Margem (%)']].map(([n,l])=>(
                  <div key={n}><label style={s.label}>{l}</label>
                  <input type="number" step="0.01" min="0" name={n} value={calc[n]} onChange={e=>setCalc({...calc,[n]:e.target.value})} style={s.input}/></div>
                ))}
              </div>
              {precoSugerido && (
                <div style={{display:'flex',gap:'1rem',alignItems:'center',marginTop:'0.75rem'}}>
                  <span>Sugerido: <strong style={{color:'#059669'}}>R$ {precoSugerido}</strong></span>
                  <button type="button" onClick={()=>{setForm({...form,preco_venda:precoSugerido});setMostrarCalc(false);}} style={s.btnAplicar}>✅ Usar</button>
                </div>
              )}
            </div>
          )}

          {msg && <p style={{padding:'0.75rem',borderRadius:'8px',backgroundColor:msg.startsWith('✅')?'#d1fae5':msg.startsWith('⚠️')?'#fffbeb':'#fee2e2',color:msg.startsWith('✅')?'#065f46':msg.startsWith('⚠️')?'#92400e':'#dc2626'}}>{msg}</p>}
          <div style={{display:'flex',gap:'1rem'}}>
            <button type="submit" disabled={salvando} style={s.btnSalvar}>{salvando?'Salvando...':editId?'Atualizar':'Cadastrar'}</button>
            {editId && <button type="button" onClick={()=>{setEditId(null);setForm(VAZIO);setMsg('');}} style={s.btnCancel}>Cancelar</button>}
          </div>
        </form>
      </div>

      <h2 style={s.secTitulo}>Produtos ({produtos.length})</h2>
      {uploadMsg && <p style={{marginBottom:'0.75rem',fontSize:'0.85rem',color:uploadMsg.startsWith('✅')?'#065f46':'#dc2626'}}>{uploadMsg}</p>}
      <div style={{overflowX:'auto'}}>
        <table style={s.tabela}>
          <thead><tr style={s.thead}>
            {['Foto','Nome','Categoria','Preço','Estoque','Portfólio','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {produtos.length===0?(
              <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>Nenhum produto.</td></tr>
            ):produtos.map((p,i)=>(
              <tr key={p.id} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                <td style={{...s.td,textAlign:'center'}}>
                  {p.imagem_url?(
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                      <img src={p.imagem_url} alt={p.nome} style={{width:'50px',height:'50px',objectFit:'cover',borderRadius:'8px',border:'1px solid #e2e8f0'}}/>
                      <button onClick={()=>handleRemoverImagem(p.id)} style={s.btnRemImg} title="Remover">🗑️</button>
                    </div>
                  ):(
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                      <div style={{width:'50px',height:'50px',backgroundColor:'#f0f4ff',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>🧵</div>
                      <label style={s.btnAddImg} title="Adicionar foto">
                        + Foto
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}}
                          onChange={e=>handleUpload(p.id,e.target.files[0])} disabled={uploadingId===p.id}/>
                      </label>
                    </div>
                  )}
                </td>
                <td style={{...s.td,fontWeight:'600'}}>{p.nome}</td>
                <td style={s.td}>{p.categoria||'—'}</td>
                <td style={{...s.td,color:'#f97316',fontWeight:'bold'}}>R$ {parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
                <td style={s.td}>
                  <span style={{padding:'0.2rem 0.5rem',borderRadius:'6px',fontSize:'0.82rem',backgroundColor:p.estoque_atual<=p.estoque_minimo?'#fee2e2':'#d1fae5',color:p.estoque_atual<=p.estoque_minimo?'#dc2626':'#065f46'}}>
                    {p.estoque_atual} un.
                  </span>
                </td>
                <td style={s.td}>
                  <button onClick={()=>toggleVisibilidade(p)} style={{padding:'0.2rem 0.6rem',borderRadius:'20px',cursor:'pointer',border:'none',backgroundColor:p.visivel_portfolio?'#d1fae5':'#f3f4f6',color:p.visivel_portfolio?'#065f46':'#6b7280',fontSize:'0.82rem'}}>
                    {p.visivel_portfolio?'✅ Visível':'🙈 Oculto'}
                  </button>
                </td>
                <td style={s.td}>
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <button onClick={()=>handleEditar(p)} style={s.btnEdit}>✏️</button>
                    <button onClick={()=>handleExcluir(p)} style={s.btnDel}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s={page:{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.5rem'},titulo:{color:'#1e3a8a',margin:'0 0 1.5rem',fontSize:'1.6rem',fontWeight:'700'},card:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'2rem'},cardT:{color:'#1e3a8a',margin:'0 0 1.25rem',fontSize:'1.05rem',fontWeight:'700'},form:{display:'flex',flexDirection:'column',gap:'1.25rem'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem',alignItems:'end'},label:{display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:'600',color:'#374151',fontSize:'0.88rem',marginBottom:'0.3rem'},input:{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.95rem'},checkRow:{display:'flex',alignItems:'center',gap:'0.5rem',paddingTop:'1.75rem'},btnCalc:{backgroundColor:'transparent',border:'none',color:'#1e3a8a',fontSize:'0.78rem',cursor:'pointer',fontWeight:'600'},calcBox:{backgroundColor:'#f0f4ff',borderRadius:'10px',padding:'1.25rem',border:'1px solid #bfdbfe'},calcGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'0.75rem'},btnAplicar:{backgroundColor:'#059669',color:'#fff',border:'none',padding:'0.45rem 1rem',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'0.88rem'},btnSalvar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'},btnCancel:{backgroundColor:'#f1f5f9',color:'#374151',border:'1px solid #e2e8f0',padding:'0.75rem 1.5rem',borderRadius:'8px',cursor:'pointer'},secTitulo:{color:'#1e3a8a',margin:'0 0 1rem',fontSize:'1.05rem',fontWeight:'700',borderBottom:'2px solid #dbeafe',paddingBottom:'0.5rem'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},btnEdit:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.35rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'},btnDel:{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'0.35rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'},btnAddImg:{backgroundColor:'#f0f4ff',border:'1px dashed #bfdbfe',padding:'0.2rem 0.5rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.75rem',fontWeight:'600',color:'#1e3a8a',display:'inline-block'},btnRemImg:{backgroundColor:'transparent',border:'none',cursor:'pointer',fontSize:'0.8rem',color:'#dc2626'}};
