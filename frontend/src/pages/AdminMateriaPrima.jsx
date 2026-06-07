// AdminMateriaPrima.jsx — UC06 com ajuste manual de estoque e histórico de consumo
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const VAZIO = { nome:'', unidade_medida:'un', estoque_minimo:5 };
const UNIDADES = ['un','metros','rolos','kg','gramas','litros'];

// ── Modal: Ajuste Manual de Estoque ─────────────────────────
function ModalAjuste({ mp, onSalvar, onFechar }) {
  const [novaQtd, setNovaQtd] = useState(parseFloat(mp.quantidade_atual).toFixed(2));
  const [motivo,  setMotivo]  = useState('');
  const [salvando,setSalvando]= useState(false);
  const [erro,    setErro]    = useState('');

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true); setErro('');
    try {
      await api.put(`/materiaprima/${mp.id}/estoque`, {
        quantidade_atual: parseFloat(novaQtd),
        motivo,
      });
      onSalvar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao ajustar estoque.');
    } finally { setSalvando(false); }
  };

  const diferenca = parseFloat(novaQtd) - parseFloat(mp.quantidade_atual);

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitulo}>📦 Ajustar Estoque</h2>
          <button onClick={onFechar} style={s.btnFechar}>✕</button>
        </div>

        <p style={s.modalInfo}>
          Material: <strong>{mp.nome}</strong><br/>
          Estoque atual: <strong>{parseFloat(mp.quantidade_atual).toFixed(2)} {mp.unidade_medida}</strong>
        </p>

        <form onSubmit={handleSalvar} style={s.form}>
          <div>
            <label style={s.label}>Nova quantidade ({mp.unidade_medida})</label>
            <input type="number" step="0.01" min="0" value={novaQtd}
              onChange={e => setNovaQtd(e.target.value)} required style={s.input}/>
            {novaQtd !== '' && !isNaN(diferenca) && diferenca !== 0 && (
              <p style={{fontSize:'0.85rem', color: diferenca > 0 ? '#059669' : '#dc2626', marginTop:'0.25rem'}}>
                {diferenca > 0 ? `▲ Acréscimo de +${diferenca.toFixed(2)}` : `▼ Redução de ${diferenca.toFixed(2)}`} {mp.unidade_medida}
              </p>
            )}
          </div>
          <div>
            <label style={s.label}>Motivo do ajuste (opcional)</label>
            <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)}
              style={s.input} placeholder="Ex: Inventário, quebra, correção de entrada..."/>
          </div>

          {erro && <p style={s.erro}>{erro}</p>}

          <div style={{display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
            <button type="button" onClick={onFechar} style={s.btnCancelar}>Cancelar</button>
            <button type="submit" disabled={salvando} style={s.btnSalvar}>
              {salvando ? 'Salvando...' : '✅ Confirmar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Histórico de Consumo ──────────────────────────────
function ModalConsumo({ mp, onFechar }) {
  const [consumos,   setConsumos]   = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get(`/materiaprima/${mp.id}/consumos`)
      .then(r => setConsumos(r.data))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div style={s.overlay}>
      <div style={{...s.modal, maxWidth:'600px'}}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitulo}>📋 Histórico de Consumo — {mp.nome}</h2>
          <button onClick={onFechar} style={s.btnFechar}>✕</button>
        </div>

        {carregando ? (
          <p style={{color:'#94a3b8', textAlign:'center', padding:'2rem'}}>Carregando...</p>
        ) : consumos.length === 0 ? (
          <div style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>
            <p style={{fontSize:'2rem'}}>📭</p>
            <p>Nenhum consumo registrado para este material ainda.</p>
            <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>O consumo é registrado ao finalizar um pedido (UC09).</p>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'1rem'}}>
              Total registrado: <strong>{consumos.reduce((a,c) => a + parseFloat(c.quantidade_usada), 0).toFixed(2)} {mp.unidade_medida}</strong>
            </p>
            <table style={s.tabela}>
              <thead><tr style={s.thead}>
                {['Data','Qtd Usada','Pedido/Item'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {consumos.map((c, i) => (
                  <tr key={c.id} style={{backgroundColor: i%2===0?'#fff':'#f8fafc'}}>
                    <td style={s.td}>{new Date(c.data_consumo).toLocaleDateString('pt-BR')}</td>
                    <td style={{...s.td, fontWeight:'600', color:'#dc2626'}}>
                      −{parseFloat(c.quantidade_usada).toFixed(2)} {mp.unidade_medida}
                    </td>
                    <td style={s.td}>{c.referencia || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────
export default function AdminMateriaPrima() {
  const [lista,      setLista]      = useState([]);
  const [form,       setForm]       = useState(VAZIO);
  const [editId,     setEditId]     = useState(null);
  const [msg,        setMsg]        = useState('');
  const [modalAjuste,setModalAjuste]= useState(null);
  const [modalConsumo,setModalConsumo]=useState(null);

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/materiaprima').then(r => setLista(r.data));

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/materiaprima/${editId}`, form);
      else        await api.post('/materiaprima', form);
      setMsg('✅ Insumo salvo!');
      setForm(VAZIO); setEditId(null); carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
  };

  const excluir = async (m) => {
    if (!window.confirm(`Excluir "${m.nome}"?`)) return;
    try {
      await api.delete(`/materiaprima/${m.id}`);
      setMsg('✅ Material excluído.');
      carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
  };

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>📦 Matérias-Primas</h1>

      {modalAjuste && (
        <ModalAjuste mp={modalAjuste}
          onSalvar={() => { setModalAjuste(null); carregar(); }}
          onFechar={() => setModalAjuste(null)}/>
      )}
      {modalConsumo && (
        <ModalConsumo mp={modalConsumo} onFechar={() => setModalConsumo(null)}/>
      )}

      {/* Formulário */}
      <div style={s.card}>
        <h2 style={s.cardT}>{editId ? `✏️ Editando #${editId}` : '+ Cadastrar Insumo'}</h2>
        <form onSubmit={salvar} style={s.form}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Nome do Material *</label>
              <input type="text" value={form.nome} required
                onChange={e => setForm({...form, nome:e.target.value})} style={s.input} placeholder="Ex: Linha Azul"/>
            </div>
            <div>
              <label style={s.label}>Unidade de Medida</label>
              <select value={form.unidade_medida} disabled={!!editId}
                onChange={e => setForm({...form, unidade_medida:e.target.value})} style={s.input}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
              {editId && <small style={{color:'#f97316', fontSize:'0.78rem'}}>⚠️ Não é possível alterar após movimentações</small>}
            </div>
            <div>
              <label style={s.label}>Estoque Mínimo</label>
              <input type="number" min="0" step="0.01" value={form.estoque_minimo}
                onChange={e => setForm({...form, estoque_minimo:e.target.value})} style={s.input}/>
            </div>
          </div>
          {msg && <p style={{padding:'0.75rem',borderRadius:'8px',backgroundColor:msg.startsWith('✅')?'#d1fae5':'#fee2e2',color:msg.startsWith('✅')?'#065f46':'#dc2626'}}>{msg}</p>}
          <div style={{display:'flex', gap:'1rem'}}>
            <button type="submit" style={s.btnSalvar}>Salvar</button>
            {editId && <button type="button" onClick={() => {setEditId(null);setForm(VAZIO);}} style={s.btnCancelar}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Tabela */}
      <h2 style={s.secTitulo}>Insumos Cadastrados ({lista.length})</h2>
      <div style={{overflowX:'auto'}}>
        <table style={s.tabela}>
          <thead><tr style={s.thead}>
            {['Material','Unidade','Qtd Atual','Estoque Mín.','Status','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {lista.length===0?(
              <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>Nenhum material cadastrado.</td></tr>
            ):lista.map((m,i)=>(
              <tr key={m.id} style={{backgroundColor:m.alerta_estoque?'#fff7ed':i%2===0?'#fff':'#f8fafc'}}>
                <td style={{...s.td, fontWeight:'600'}}>{m.nome}</td>
                <td style={s.td}>{m.unidade_medida}</td>
                <td style={{...s.td, fontWeight:'bold', color:m.alerta_estoque?'#dc2626':'#059669', fontSize:'1rem'}}>
                  {parseFloat(m.quantidade_atual).toFixed(2)}
                </td>
                <td style={s.td}>{parseFloat(m.estoque_minimo).toFixed(2)}</td>
                <td style={s.td}>
                  <span style={{padding:'0.2rem 0.6rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'600',
                    backgroundColor:m.alerta_estoque?'#fee2e2':'#d1fae5',
                    color:m.alerta_estoque?'#dc2626':'#065f46'}}>
                    {m.alerta_estoque?'⚠️ Crítico':'✅ OK'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
                    <button onClick={()=>setModalAjuste(m)} style={s.btnAjuste} title="Ajustar estoque manualmente">
                      ✏️ Estoque
                    </button>
                    <button onClick={()=>setModalConsumo(m)} style={s.btnHistorico} title="Ver histórico de consumo">
                      📋 Consumo
                    </button>
                    <button onClick={()=>{setEditId(m.id);setForm({nome:m.nome,unidade_medida:m.unidade_medida,estoque_minimo:m.estoque_minimo});window.scrollTo({top:0,behavior:'smooth'});}} style={s.btnEditar}>
                      ✏️
                    </button>
                    <button onClick={()=>excluir(m)} style={s.btnDel}>🗑️</button>
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

const s={page:{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.5rem'},titulo:{color:'#1e3a8a',margin:'0 0 1.5rem',fontSize:'1.6rem',fontWeight:'700'},card:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'2rem'},cardT:{color:'#1e3a8a',margin:'0 0 1.25rem',fontSize:'1.05rem',fontWeight:'700'},form:{display:'flex',flexDirection:'column',gap:'1rem'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem'},label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.88rem',marginBottom:'0.3rem'},input:{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.95rem'},btnSalvar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'},btnCancelar:{backgroundColor:'#f1f5f9',color:'#374151',border:'1px solid #e2e8f0',padding:'0.75rem 1.5rem',borderRadius:'8px',cursor:'pointer'},secTitulo:{color:'#1e3a8a',margin:'0 0 1rem',fontSize:'1.05rem',fontWeight:'700',borderBottom:'2px solid #dbeafe',paddingBottom:'0.5rem'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},btnAjuste:{backgroundColor:'#fef3c7',color:'#92400e',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem',fontWeight:'600'},btnHistorico:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem',fontWeight:'600'},btnEditar:{backgroundColor:'#f0f4ff',color:'#1e3a8a',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'},btnDel:{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'},
// Modal
overlay:{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'},modal:{backgroundColor:'#fff',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'460px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',maxHeight:'90vh',overflowY:'auto'},modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'},modalTitulo:{color:'#1e3a8a',margin:0,fontSize:'1.1rem',fontWeight:'700'},btnFechar:{backgroundColor:'transparent',border:'none',fontSize:'1.3rem',cursor:'pointer',color:'#64748b'},modalInfo:{backgroundColor:'#f0f4ff',borderRadius:'8px',padding:'0.875rem',fontSize:'0.9rem',color:'#374151',marginBottom:'1rem',lineHeight:1.6},erro:{backgroundColor:'#fee2e2',color:'#dc2626',padding:'0.75rem',borderRadius:'8px',fontSize:'0.88rem'}};
