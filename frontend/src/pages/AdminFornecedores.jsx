// AdminFornecedores.jsx — UC05
import { useState, useEffect } from 'react';
import api from '../services/api';

const VAZIO = { razao_social: '', telefone: '', email: '' };

export default function AdminFornecedores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/fornecedores').then(r => setLista(r.data));

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/fornecedores/${editId}`, form); }
      else { await api.post('/fornecedores', form); }
      setMsg('✅ Fornecedor salvo!'); setForm(VAZIO); setEditId(null); carregar();
    } catch { setMsg('❌ Erro ao salvar.'); }
  };

  const excluir = async (id) => {
    if (!window.confirm('Excluir fornecedor?')) return;
    try { await api.delete(`/fornecedores/${id}`); carregar(); }
    catch { alert('Erro ao excluir. Verifique se há compras vinculadas.'); }
  };

  return (
    <div style={s.container}>
      <h1 style={s.titulo}>🏭 Fornecedores</h1>
      <div style={s.formCard}>
        <h2 style={s.sub}>{editId ? `Editando #${editId}` : '+ Novo Fornecedor'}</h2>
        <form onSubmit={salvar} style={s.form}>
          <div style={s.grid}>
            {[['razao_social','Razão Social / Nome *','text',true],['telefone','Telefone','text',false],['email','E-mail','email',false]].map(([name,label,type,req]) => (
              <div key={name}>
                <label style={s.label}>{label}</label>
                <input type={type} name={name} value={form[name]} required={req}
                  onChange={e => setForm({...form,[e.target.name]:e.target.value})} style={s.input}/>
              </div>
            ))}
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
          {['Razão Social','Telefone','E-mail','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {lista.map(f => (
            <tr key={f.id}>
              <td style={s.td}><strong>{f.razao_social}</strong></td>
              <td style={s.td}>{f.telefone||'—'}</td>
              <td style={s.td}>{f.email||'—'}</td>
              <td style={s.td}>
                <button onClick={() => {setEditId(f.id);setForm({razao_social:f.razao_social,telefone:f.telefone||'',email:f.email||''}); window.scrollTo({top:0,behavior:'smooth'});}} style={s.btnEditar}>✏️</button>
                <button onClick={() => excluir(f.id)} style={s.btnExcluir}>🗑️</button>
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
  btnEditar:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.3rem 0.7rem',borderRadius:'6px',cursor:'pointer',marginRight:'0.5rem'},
  btnExcluir:{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'0.3rem 0.7rem',borderRadius:'6px',cursor:'pointer'},
};
