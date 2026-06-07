// AdminClientes.jsx — Correção do aniversário + modal de edição completo
import { useState, useEffect } from 'react';
import api from '../services/api';
import { SITE } from '../config/site';
import BotaoVoltar from '../components/BotaoVoltar';

// ── Helpers de data ──────────────────────────────────────────
// Pega apenas os primeiros 10 chars "YYYY-MM-DD" para evitar
// problemas com o timezone ISO que o banco retorna (Z, +00:00, etc.)
const soData = (d) => d ? d.substring(0, 10) : null;

const fmtAniversario = (d) => {
  if (!d) return '—';
  const [, m, dd] = soData(d).split('-');
  return `${dd}/${m}`;
};

const ehAniversariante = (d) => {
  if (!d) return false;
  const hoje = new Date();
  const nasc = new Date(soData(d) + 'T12:00:00'); // T12 evita problema de fuso
  return nasc.getDate() === hoje.getDate() && nasc.getMonth() === hoje.getMonth();
};

const linkWpp = (nome, tel) => {
  const num = tel?.replace(/\D/g, '');
  if (!num || num.length < 10) return null;
  const msg = encodeURIComponent(
    `Olá ${nome.split(' ')[0]}! 🎂🎉\n\nA equipe do ${SITE.nome} deseja um feliz aniversário!\n\nConte conosco para seus próximos bordados! 🧵`
  );
  return `https://wa.me/55${num}?text=${msg}`;
};

// ── Modal de Edição Completa ─────────────────────────────────
function ModalEditar({ cliente, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    nome_completo: cliente.nome_completo,
    telefone:      cliente.telefone || '',
    endereco:      cliente.endereco || '',
    cpf_cnpj:      cliente.cpf_cnpj || '',
    data_nascimento: soData(cliente.data_nascimento) || '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true); setErro('');
    try {
      // Salva dados gerais
      await api.put(`/clientes/${cliente.id}`, {
        nome_completo: form.nome_completo,
        telefone:      form.telefone,
        endereco:      form.endereco,
        cpf_cnpj:      form.cpf_cnpj,
      });
      // Salva aniversário separadamente
      await api.put(`/clientes/${cliente.id}/aniversario`, {
        data_nascimento: form.data_nascimento || null,
      });
      onSalvar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar.');
    } finally { setSalvando(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitulo}>✏️ Editar Cliente</h2>
          <button onClick={onFechar} style={s.btnFechar}>✕</button>
        </div>

        <form onSubmit={handleSalvar} style={s.form}>
          {[
            { name:'nome_completo', label:'Nome Completo *', type:'text',     required:true,  placeholder:'Nome completo do cliente' },
            { name:'telefone',      label:'Telefone *',       type:'tel',      required:true,  placeholder:'(18) 99999-9999' },
            { name:'cpf_cnpj',      label:'CPF / CNPJ',       type:'text',     required:false, placeholder:'000.000.000-00' },
            { name:'endereco',      label:'Endereço',          type:'text',     required:false, placeholder:'Rua, número, bairro, cidade' },
            { name:'data_nascimento', label:'Data de Nascimento (Aniversário)', type:'date', required:false, placeholder:'' },
          ].map(f => (
            <div key={f.name}>
              <label style={s.label}>{f.label}</label>
              <input
                type={f.type} name={f.name} required={f.required}
                value={form[f.name]} placeholder={f.placeholder}
                onChange={e => setForm({...form, [f.name]: e.target.value})}
                style={s.input}
              />
            </div>
          ))}

          {erro && <p style={s.erro}>{erro}</p>}

          <div style={{display:'flex', gap:'1rem', justifyContent:'flex-end', paddingTop:'0.5rem'}}>
            <button type="button" onClick={onFechar} style={s.btnCancelar}>Cancelar</button>
            <button type="submit" disabled={salvando} style={s.btnSalvar}>
              {salvando ? 'Salvando...' : '✅ Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────
export default function AdminClientes() {
  const [clientes,   setClientes]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca,      setBusca]      = useState('');
  const [editando,   setEditando]   = useState(null); // cliente sendo editado

  useEffect(() => { carregar(); }, []);

  const carregar = () =>
    api.get('/clientes').then(r => setClientes(r.data)).finally(() => setCarregando(false));

  const handleExcluirLGPD = async (id, nome) => {
    if (!window.confirm(`⚠️ LGPD — Anonimizar "${nome}"?\n\nEsta ação é IRREVERSÍVEL.`)) return;
    try {
      await api.delete(`/clientes/${id}/lgpd`);
      carregar();
    } catch { alert('Erro ao anonimizar.'); }
  };

  const filtrados = clientes.filter(c =>
    c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca)
  );

  const aniversariantesHoje = filtrados.filter(c => ehAniversariante(c.data_nascimento));

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>👤 Gerenciar Clientes</h1>

      {/* Modal de edição */}
      {editando && (
        <ModalEditar
          cliente={editando}
          onSalvar={() => { setEditando(null); carregar(); }}
          onFechar={() => setEditando(null)}
        />
      )}

      {/* Banner de aniversariantes */}
      {aniversariantesHoje.length > 0 && (
        <div style={s.banner}>
          <span style={{fontSize:'1.5rem'}}>🎂</span>
          <div>
            <strong>Aniversariante(s) hoje:</strong>{' '}
            {aniversariantesHoje.map(c => c.nome_completo.split(' ')[0]).join(', ')}
          </div>
          {aniversariantesHoje.map(c => {
            const link = linkWpp(c.nome_completo, c.telefone);
            return link ? (
              <a key={c.id} href={link} target="_blank" rel="noreferrer" style={s.btnWpp}>
                💬 Parabenizar {c.nome_completo.split(' ')[0]}
              </a>
            ) : null;
          })}
        </div>
      )}

      {/* Busca */}
      <input type="text" placeholder="🔍 Buscar por nome ou telefone..."
        value={busca} onChange={e => setBusca(e.target.value)} style={s.inputBusca} />

      {/* Tabela */}
      {carregando ? (
        <p style={s.loading}>Carregando clientes...</p>
      ) : filtrados.length === 0 ? (
        <p style={s.loading}>{busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={s.tabela}>
            <thead><tr style={s.thead}>
              {['Nome','E-mail','Telefone','Aniversário','LGPD','Cadastro','Ações'].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {filtrados.map((c, i) => {
                const aniv = ehAniversariante(c.data_nascimento);
                const anonimizado = c.nome_completo.includes('Anonimizado');
                return (
                  <tr key={c.id}
                    style={{backgroundColor: aniv ? '#fffbeb' : i%2===0 ? '#fff' : '#f8fafc'}}>
                    <td style={{...s.td, fontWeight:'600'}}>
                      {c.nome_completo}
                      {aniv && <span style={s.badgeAniv}>🎂 Hoje!</span>}
                    </td>
                    <td style={{...s.td, fontSize:'0.85rem', color:'#64748b'}}>{c.email}</td>
                    <td style={s.td}>{c.telefone || '—'}</td>
                    <td style={s.td}>
                      <span style={{fontWeight: aniv ? '700' : 'normal', color: aniv ? '#92400e' : 'inherit'}}>
                        {fmtAniversario(c.data_nascimento)}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600',
                        backgroundColor: c.aceitou_lgpd ? '#d1fae5' : '#fee2e2',
                        color: c.aceitou_lgpd ? '#065f46' : '#dc2626'}}>
                        {c.aceitou_lgpd ? '✅ Aceito' : '❌ Pendente'}
                      </span>
                    </td>
                    <td style={{...s.td, fontSize:'0.85rem', color:'#94a3b8'}}>
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={s.td}>
                      <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
                        {/* Editar */}
                        {!anonimizado && (
                          <button onClick={() => setEditando(c)} style={s.btnEditar} title="Editar">
                            ✏️
                          </button>
                        )}
                        {/* WhatsApp */}
                        {c.telefone && c.telefone !== 'ANONIMIZADO' && (
                          <a href={`https://wa.me/55${c.telefone.replace(/\D/g,'')}`}
                            target="_blank" rel="noreferrer" style={s.btnWppPeq} title="WhatsApp">
                            💬
                          </a>
                        )}
                        {/* LGPD */}
                        {!anonimizado && (
                          <button onClick={() => handleExcluirLGPD(c.id, c.nome_completo)}
                            style={s.btnLGPD} title="Anonimizar (LGPD)">
                            🗑️
                          </button>
                        )}
                        {anonimizado && (
                          <span style={{color:'#9ca3af', fontSize:'0.8rem'}}>Anonimizado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' },
  titulo:     { color:'#1e3a8a', margin:'0 0 1.5rem', fontSize:'1.6rem', fontWeight:'700' },
  banner:     { backgroundColor:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'10px', padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' },
  btnWpp:     { backgroundColor:'#25d366', color:'#fff', padding:'0.4rem 0.9rem', borderRadius:'8px', fontWeight:'600', fontSize:'0.85rem', textDecoration:'none', whiteSpace:'nowrap' },
  btnWppPeq:  { backgroundColor:'#25d366', color:'#fff', padding:'0.3rem 0.55rem', borderRadius:'6px', fontSize:'0.9rem', textDecoration:'none' },
  inputBusca: { padding:'0.7rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', width:'100%', maxWidth:'380px', marginBottom:'1.25rem', display:'block' },
  loading:    { color:'#94a3b8', textAlign:'center', padding:'2rem' },
  tabela:     { width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' },
  thead:      { backgroundColor:'#1e3a8a' },
  th:         { padding:'0.75rem 1rem', textAlign:'left', color:'#fff', fontWeight:'600', fontSize:'0.85rem', whiteSpace:'nowrap' },
  td:         { padding:'0.75rem 1rem', borderBottom:'1px solid #f1f5f9', verticalAlign:'middle' },
  badgeAniv:  { backgroundColor:'#fef3c7', color:'#92400e', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem', marginLeft:'0.5rem', fontWeight:'600' },
  btnEditar:  { backgroundColor:'#dbeafe', color:'#1e40af', border:'none', padding:'0.3rem 0.6rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
  btnLGPD:    { backgroundColor:'#fee2e2', color:'#dc2626', border:'none', padding:'0.3rem 0.6rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem' },

  // Modal
  overlay:    { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' },
  modal:      { backgroundColor:'#fff', borderRadius:'16px', padding:'2rem', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', maxHeight:'90vh', overflowY:'auto' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  modalTitulo:{ color:'#1e3a8a', margin:0, fontSize:'1.2rem', fontWeight:'700' },
  btnFechar:  { backgroundColor:'transparent', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'#64748b', lineHeight:1 },
  form:       { display:'flex', flexDirection:'column', gap:'1rem' },
  label:      { display:'block', fontWeight:'600', color:'#374151', fontSize:'0.88rem', marginBottom:'0.3rem' },
  input:      { width:'100%', padding:'0.7rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.95rem' },
  erro:       { backgroundColor:'#fee2e2', color:'#dc2626', padding:'0.75rem', borderRadius:'8px', fontSize:'0.88rem', margin:0 },
  btnSalvar:  { backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.75rem 1.5rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' },
  btnCancelar:{ backgroundColor:'#f1f5f9', color:'#374151', border:'1px solid #e2e8f0', padding:'0.75rem 1.5rem', borderRadius:'8px', cursor:'pointer' },
};
