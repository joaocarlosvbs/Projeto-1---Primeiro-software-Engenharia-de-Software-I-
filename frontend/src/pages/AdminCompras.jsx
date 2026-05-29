// AdminCompras.jsx — UC10: Registrar compra de insumos
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

export default function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [form, setForm] = useState({ fornecedor_id: '', materia_prima_id: '', quantidade: '', valor_custo_total: '' });
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/compras').then(r => setCompras(r.data)),
      api.get('/fornecedores').then(r => setFornecedores(r.data)),
      api.get('/materiaprima').then(r => setMateriais(r.data)),
    ]);
  }, []);

  const carregar = () => api.get('/compras').then(r => setCompras(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post('/compras', form);
      setMsg('✅ Compra registrada! Estoque atualizado e despesa lançada no financeiro.');
      setForm({ fornecedor_id:'', materia_prima_id:'', quantidade:'', valor_custo_total:'' });
      carregar();
      api.get('/materiaprima').then(r => setMateriais(r.data));
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.erro || 'Erro ao registrar compra.'));
    } finally { setEnviando(false); }
  };

  const fmt = (v) => `R$ ${parseFloat(v||0).toFixed(2).replace('.', ',')}`;

  return (
    <div style={s.container}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>🛒 Registrar Compra de Insumos</h1>
      <p style={{color:'#666', marginBottom:'1.5rem'}}>
        Ao registrar uma compra, o sistema atualiza o estoque da matéria-prima e lança a despesa no fluxo de caixa automaticamente.
      </p>

      <div style={s.formCard}>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Fornecedor *</label>
              <select value={form.fornecedor_id} required
                onChange={e => setForm({...form, fornecedor_id: e.target.value})} style={s.input}>
                <option value="">Selecione...</option>
                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Matéria-Prima *</label>
              <select value={form.materia_prima_id} required
                onChange={e => setForm({...form, materia_prima_id: e.target.value})} style={s.input}>
                <option value="">Selecione...</option>
                {materiais.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.unidade_medida}) — Estoque: {m.quantidade_atual}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Quantidade *</label>
              <input type="number" step="0.01" min="0.01" value={form.quantidade} required
                onChange={e => setForm({...form, quantidade: e.target.value})} style={s.input}/>
            </div>
            <div>
              <label style={s.label}>Valor Total Pago (R$) *</label>
              <input type="number" step="0.01" min="0.01" value={form.valor_custo_total} required
                onChange={e => setForm({...form, valor_custo_total: e.target.value})} style={s.input}/>
            </div>
          </div>
          {msg && <p style={{padding:'0.75rem', borderRadius:'8px', backgroundColor: msg.startsWith('✅')?'#d1fae5':'#fee2e2', color: msg.startsWith('✅')?'#065f46':'#dc2626'}}>{msg}</p>}
          <button type="submit" disabled={enviando} style={s.btnSalvar}>
            {enviando ? 'Registrando...' : '✅ Finalizar Compra'}
          </button>
        </form>
      </div>

      <h2 style={s.secaoTitulo}>Histórico de Compras</h2>
      <table style={s.tabela}>
        <thead><tr style={{backgroundColor:'#1e3a8a',color:'#fff'}}>
          {['Data','Fornecedor','Material','Qtd','Valor'].map(h=><th key={h} style={s.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {compras.map(c => (
            <tr key={c.id}>
              <td style={s.td}>{new Date(c.data_compra).toLocaleDateString('pt-BR')}</td>
              <td style={s.td}>{c.fornecedor}</td>
              <td style={s.td}>{c.materia_prima}</td>
              <td style={s.td}>{c.quantidade} {c.unidade_medida}</td>
              <td style={{...s.td, color:'#dc2626', fontWeight:'bold'}}>{fmt(c.valor_custo_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  container:{maxWidth:'1000px',margin:'0 auto',padding:'2rem'},
  titulo:{color:'#1e3a8a',marginBottom:'0.5rem'},
  formCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',marginBottom:'2rem'},
  form:{display:'flex',flexDirection:'column',gap:'1rem'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem'},
  label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.9rem',marginBottom:'0.25rem'},
  input:{width:'100%',padding:'0.65rem',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'0.95rem'},
  btnSalvar:{backgroundColor:'#f97316',color:'#fff',border:'none',padding:'0.8rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',alignSelf:'flex-start'},
  secaoTitulo:{color:'#1e3a8a',borderBottom:'2px solid #dbeafe',paddingBottom:'0.5rem',marginBottom:'1rem'},
  tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},
  th:{padding:'0.75rem 1rem',textAlign:'left'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f3f4f6'},
};
