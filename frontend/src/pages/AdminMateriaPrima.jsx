// AdminMateriaPrima.jsx — UC06
import { useState, useEffect } from 'react';
import api from '../services/api';

const VAZIO = { nome: '', unidade_medida: 'un', estoque_minimo: 5 };
const UNIDADES = ['un', 'metros', 'rolos', 'kg', 'gramas', 'litros'];

export default function AdminMateriaPrima() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/materiaprima').then(r => setLista(r.data));

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/materiaprima/${editId}`, form); }
      else { await api.post('/materiaprima', form); }
      setMsg('✅ Insumo salvo!'); setForm(VAZIO); setEditId(null); carregar();
    } catch { setMsg('❌ Erro ao salvar.'); }
  };

  return (
    <div style={s.container}>
      <h1 style={s.titulo}>📦 Matérias-Primas</h1>
      <div style={s.formCard}>
        <h2 style={s.sub}>{editId ? `Editando #${editId}` : '+ Cadastrar Insumo'}</h2>
        <form onSubmit={salvar} style={s.form}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Nome do Material *</label>
              <input type="text" value={form.nome} required
                onChange={e => setForm({...form, nome: e.target.value})} style={s.input} placeholder="Ex: Linha Azul"/>
            </div>
            <div>
              <label style={s.label}>Unidade de Medida</label>
              <select value={form.unidade_medida} disabled={!!editId}
                onChange={e => setForm({...form, unidade_medida: e.target.value})} style={s.input}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
              {editId && <small style={{color:'#f97316'}}>⚠️ Unidade não pode ser alterada após movimentações</small>}
            </div>
            <div>
              <label style={s.label}>Estoque Mínimo</label>
              <input type="number" min="0" value={form.estoque_minimo}
                onChange={e => setForm({...form, estoque_minimo: e.target.value})} style={s.input}/>
            </div>
          </div>
          {msg && <p style={{color: msg.startsWith('✅') ? '#065f46' : '#dc2626'}}>{msg}</p>}
          <div style={{display:'flex', gap:'1rem'}}>
            <button type="submit" style={s.btnSalvar}>Salvar</button>
            {editId && <button type="button" onClick={() => {setEditId(null);setForm(VAZIO);}} style={s.btnCancelar}>Cancelar</button>}
          </div>
        </form>
      </div>

      <table style={s.tabela}>
        <thead><tr style={{backgroundColor:'#1e3a8a',color:'#fff'}}>
          {['Material','Unidade','Qtd Atual','Estoque Mín.','Status','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {lista.map(m => (
            <tr key={m.id} style={{backgroundColor: m.alerta_estoque ? '#fff7ed' : '#fff'}}>
              <td style={s.td}><strong>{m.nome}</strong></td>
              <td style={s.td}>{m.unidade_medida}</td>
              <td style={{...s.td, fontWeight:'bold', color: m.alerta_estoque ? '#dc2626' : '#065f46'}}>
                {parseFloat(m.quantidade_atual).toFixed(2)}
              </td>
              <td style={s.td}>{parseFloat(m.estoque_minimo).toFixed(2)}</td>
              <td style={s.td}>
                <span style={{padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.8rem',
                  backgroundColor: m.alerta_estoque ? '#fee2e2' : '#d1fae5',
                  color: m.alerta_estoque ? '#dc2626' : '#065f46'}}>
                  {m.alerta_estoque ? '⚠️ Crítico' : '✅ OK'}
                </span>
              </td>
              <td style={s.td}>
                <button onClick={() => {setEditId(m.id);setForm({nome:m.nome,unidade_medida:m.unidade_medida,estoque_minimo:m.estoque_minimo});window.scrollTo({top:0,behavior:'smooth'});}} style={s.btnEditar}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  container:{maxWidth:'900px',margin:'0 auto',padding:'2rem'},
  titulo:{color:'#1e3a8a',marginBottom:'1.5rem'},
  formCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',marginBottom:'2rem'},
  sub:{color:'#1e3a8a',marginBottom:'1rem',fontSize:'1rem'},
  form:{display:'flex',flexDirection:'column',gap:'1rem'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem'},
  label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.9rem',marginBottom:'0.25rem'},
  input:{width:'100%',padding:'0.65rem',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'0.95rem'},
  btnSalvar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.7rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'},
  btnCancelar:{backgroundColor:'#f3f4f6',color:'#374151',border:'1px solid #d1d5db',padding:'0.7rem 1.5rem',borderRadius:'8px',cursor:'pointer'},
  tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},
  th:{padding:'0.75rem 1rem',textAlign:'left'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f3f4f6'},
  btnEditar:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.3rem 0.7rem',borderRadius:'6px',cursor:'pointer'},
};
