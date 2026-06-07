// AdminProdutos.jsx — UC04 com BotaoVoltar e Calculadora de Preço
import { useState, useEffect } from 'react';
import api from '../services/api';
import { CATEGORIAS } from '../config/site';
import BotaoVoltar from '../components/BotaoVoltar';

const VAZIO = { nome: '', categoria: '', preco_venda: '', visivel_portfolio: true };
const CALC_VAZIO = { custo_material: '', horas: '', valor_hora: '', margem: '30' };

export default function AdminProdutos() {
  const [produtos,   setProdutos]   = useState([]);
  const [form,       setForm]       = useState(VAZIO);
  const [editId,     setEditId]     = useState(null);
  const [msg,        setMsg]        = useState('');
  const [salvando,   setSalvando]   = useState(false);
  const [mostrarCalc, setMostrarCalc] = useState(false);
  const [calc,       setCalc]       = useState(CALC_VAZIO);

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
      setMsg(editId ? '✅ Produto atualizado!' : '✅ Produto cadastrado!');
      setForm(VAZIO); setEditId(null); carregar();
    } catch { setMsg('❌ Erro ao salvar produto.'); }
    finally { setSalvando(false); }
  };

  const handleEditar = p => {
    setEditId(p.id);
    setForm({ nome: p.nome, categoria: p.categoria||'', preco_venda: p.preco_venda, visivel_portfolio: p.visivel_portfolio });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVisibilidade = async p => {
    try {
      await api.put(`/produtos/${p.id}`, { ...p, visivel_portfolio: !p.visivel_portfolio });
      carregar();
    } catch { alert('Erro ao alterar visibilidade.'); }
  };

  // ── Calculadora de Preço ─────────────────────────────────
  const calcChange = e => setCalc({ ...calc, [e.target.name]: e.target.value });

  const precoSugerido = (() => {
    const cm = parseFloat(calc.custo_material) || 0;
    const mo = (parseFloat(calc.horas) || 0) * (parseFloat(calc.valor_hora) || 0);
    const mg = parseFloat(calc.margem) || 0;
    const base = cm + mo;
    return base > 0 ? (base * (1 + mg / 100)).toFixed(2) : null;
  })();

  const aplicarPreco = () => {
    if (precoSugerido) {
      setForm({ ...form, preco_venda: precoSugerido });
      setMostrarCalc(false);
    }
  };

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>🧵 Gerenciar Produtos</h1>

      {/* ── Formulário de Cadastro ──────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitulo}>
          {editId ? `✏️ Editando Produto #${editId}` : '+ Novo Produto'}
        </h2>
        <form onSubmit={handleSalvar} style={s.form}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Nome do Produto *</label>
              <input name="nome" value={form.nome} onChange={handleChange}
                required style={s.input} placeholder="Ex: Toalha de Batizado Bordada" />
            </div>
            <div>
              <label style={s.label}>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} style={s.input}>
                <option value="">Selecione...</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>
                Preço de Venda (R$) *
                <button type="button" onClick={() => setMostrarCalc(!mostrarCalc)} style={s.btnCalc}>
                  🧮 {mostrarCalc ? 'Fechar calculadora' : 'Calculadora de preço'}
                </button>
              </label>
              <input name="preco_venda" type="number" step="0.01" min="0"
                value={form.preco_venda} onChange={handleChange}
                required style={s.input} placeholder="0,00" />
            </div>
            <div style={s.checkboxRow}>
              <input type="checkbox" name="visivel_portfolio" id="visivel"
                checked={form.visivel_portfolio} onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="visivel" style={{ cursor: 'pointer', fontWeight: '600', color: '#374151' }}>
                Visível no Portfólio
              </label>
            </div>
          </div>

          {/* ── Calculadora de Preço ───────────────────── */}
          {mostrarCalc && (
            <div style={s.calcBox}>
              <h3 style={s.calcTitulo}>🧮 Calculadora de Preço</h3>
              <p style={s.calcSub}>
                Preencha os custos abaixo para calcular um preço sugerido.
                O preço final é sempre sua decisão.
              </p>
              <div style={s.calcGrid}>
                {[
                  { name: 'custo_material', label: 'Custo de Materiais (R$)', placeholder: 'Ex: 15,00' },
                  { name: 'horas',          label: 'Horas de Trabalho',       placeholder: 'Ex: 3' },
                  { name: 'valor_hora',     label: 'Valor por Hora (R$)',     placeholder: 'Ex: 20,00' },
                  { name: 'margem',         label: 'Margem de Lucro (%)',     placeholder: 'Ex: 30' },
                ].map(c => (
                  <div key={c.name}>
                    <label style={s.label}>{c.label}</label>
                    <input type="number" step="0.01" min="0"
                      name={c.name} value={calc[c.name]} onChange={calcChange}
                      style={s.input} placeholder={c.placeholder} />
                  </div>
                ))}
              </div>

              {precoSugerido && (
                <div style={s.calcResultado}>
                  <div style={s.calcDetalhe}>
                    <span>Materiais: R$ {parseFloat(calc.custo_material || 0).toFixed(2)}</span>
                    <span>Mão de obra: R$ {((parseFloat(calc.horas)||0) * (parseFloat(calc.valor_hora)||0)).toFixed(2)}</span>
                    <span>Margem ({calc.margem}%): aplicada</span>
                  </div>
                  <div style={s.calcPreco}>
                    Preço sugerido: <strong style={{ color: '#059669' }}>R$ {precoSugerido}</strong>
                  </div>
                  <button type="button" onClick={aplicarPreco} style={s.btnAplicar}>
                    ✅ Usar este preço
                  </button>
                </div>
              )}
            </div>
          )}

          {msg && (
            <p style={{ ...s.mensagem, backgroundColor: msg.startsWith('✅') ? '#d1fae5' : '#fee2e2', color: msg.startsWith('✅') ? '#065f46' : '#dc2626' }}>
              {msg}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={salvando} style={s.btnSalvar}>
              {salvando ? 'Salvando...' : editId ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(VAZIO); setMsg(''); }} style={s.btnCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Tabela de Produtos ──────────────────────────── */}
      <h2 style={s.secaoTitulo}>Produtos Cadastrados ({produtos.length})</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.tabela}>
          <thead><tr style={s.thead}>
            {['Nome','Categoria','Preço','Estoque','Portfólio','Ações'].map(h =>
              <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>
                Nenhum produto cadastrado ainda.
              </td></tr>
            ) : produtos.map((p, i) => (
              <tr key={p.id} style={{ backgroundColor: i%2===0?'#fff':'#f8fafc' }}>
                <td style={{...s.td, fontWeight:'600'}}>{p.nome}</td>
                <td style={s.td}>{p.categoria || '—'}</td>
                <td style={{...s.td, color:'#f97316', fontWeight:'bold'}}>
                  R$ {parseFloat(p.preco_venda).toFixed(2).replace('.',',')}
                </td>
                <td style={s.td}>
                  <span style={{
                    padding:'0.2rem 0.5rem', borderRadius:'6px', fontSize:'0.82rem',
                    backgroundColor: p.estoque_atual <= p.estoque_minimo ? '#fee2e2' : '#d1fae5',
                    color: p.estoque_atual <= p.estoque_minimo ? '#dc2626' : '#065f46',
                  }}>
                    {p.estoque_atual} un.
                  </span>
                </td>
                <td style={s.td}>
                  <button onClick={() => toggleVisibilidade(p)} style={{
                    padding:'0.2rem 0.6rem', borderRadius:'20px', cursor:'pointer', border:'none',
                    backgroundColor: p.visivel_portfolio ? '#d1fae5' : '#f3f4f6',
                    color: p.visivel_portfolio ? '#065f46' : '#6b7280', fontSize:'0.82rem',
                  }}>
                    {p.visivel_portfolio ? '✅ Visível' : '🙈 Oculto'}
                  </button>
                </td>
                <td style={s.td}>
                  <button onClick={() => handleEditar(p)} style={s.btnEditar}>✏️ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' },
  titulo:     { color:'#1e3a8a', margin:'0 0 1.5rem', fontSize:'1.6rem', fontWeight:'700' },
  card:       { backgroundColor:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:'2rem' },
  cardTitulo: { color:'#1e3a8a', margin:'0 0 1.25rem', fontSize:'1.05rem', fontWeight:'700' },
  form:       { display:'flex', flexDirection:'column', gap:'1.25rem' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1rem', alignItems:'end' },
  label:      { display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:'600', color:'#374151', fontSize:'0.88rem', marginBottom:'0.3rem' },
  input:      { width:'100%', padding:'0.7rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.95rem' },
  checkboxRow:{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'1.75rem' },
  btnCalc:    { backgroundColor:'transparent', border:'none', color:'#1e3a8a', fontSize:'0.78rem', cursor:'pointer', fontWeight:'600', padding:'0' },
  calcBox:    { backgroundColor:'#f0f4ff', borderRadius:'10px', padding:'1.25rem', border:'1px solid #bfdbfe' },
  calcTitulo: { color:'#1e3a8a', margin:'0 0 0.25rem', fontSize:'1rem' },
  calcSub:    { color:'#64748b', fontSize:'0.85rem', margin:'0 0 1rem' },
  calcGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:'0.75rem', marginBottom:'1rem' },
  calcResultado:{ backgroundColor:'#fff', borderRadius:'8px', padding:'1rem', border:'1px solid #bfdbfe', display:'flex', flexDirection:'column', gap:'0.75rem' },
  calcDetalhe:{ display:'flex', gap:'1.5rem', flexWrap:'wrap', fontSize:'0.85rem', color:'#64748b' },
  calcPreco:  { fontSize:'1rem', color:'#374151' },
  btnAplicar: { backgroundColor:'#059669', color:'#fff', border:'none', padding:'0.6rem 1.25rem', borderRadius:'8px', cursor:'pointer', fontWeight:'700', alignSelf:'flex-start' },
  mensagem:   { padding:'0.75rem', borderRadius:'8px', fontSize:'0.9rem' },
  btnSalvar:  { backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.75rem 1.5rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' },
  btnCancelar:{ backgroundColor:'#f1f5f9', color:'#374151', border:'1px solid #e2e8f0', padding:'0.75rem 1.5rem', borderRadius:'8px', cursor:'pointer' },
  secaoTitulo:{ color:'#1e3a8a', margin:'0 0 1rem', fontSize:'1.05rem', fontWeight:'700', borderBottom:'2px solid #dbeafe', paddingBottom:'0.5rem' },
  tabela:     { width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' },
  thead:      { backgroundColor:'#1e3a8a' },
  th:         { padding:'0.75rem 1rem', textAlign:'left', color:'#fff', fontWeight:'600', fontSize:'0.85rem' },
  td:         { padding:'0.75rem 1rem', borderBottom:'1px solid #f1f5f9' },
  btnEditar:  { backgroundColor:'#dbeafe', color:'#1e40af', border:'none', padding:'0.35rem 0.75rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
};
