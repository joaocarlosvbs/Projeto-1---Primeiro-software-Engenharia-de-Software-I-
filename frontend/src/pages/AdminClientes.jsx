// AdminClientes.jsx — UC03 com BotaoVoltar, aniversário e botão WhatsApp
import { useState, useEffect } from 'react';
import api from '../services/api';
import { SITE } from '../config/site';
import BotaoVoltar from '../components/BotaoVoltar';

// Verifica se hoje é aniversário (ignora o ano)
const ehAniversariante = (dataNasc) => {
  if (!dataNasc) return false;
  const hoje = new Date();
  const nasc  = new Date(dataNasc + 'T12:00:00'); // evita problema de fuso
  return nasc.getDate() === hoje.getDate() && nasc.getMonth() === hoje.getMonth();
};

// Formata data de nascimento para exibição
const fmtData = (d) => {
  if (!d) return '—';
  const [, m, dd] = d.split('-');
  return `${dd}/${m}`;
};

// Monta link do WhatsApp com mensagem de aniversário
const linkAniversario = (nome, tel) => {
  const num = tel?.replace(/\D/g, '');
  if (!num || num.length < 10) return null;
  const msg = encodeURIComponent(
    `Olá ${nome.split(' ')[0]}! 🎂🎉\n\nA equipe do ${SITE.nome} deseja um feliz aniversário! Que seja um dia muito especial.\n\nConte conosco para seus próximos bordados! 🧵`
  );
  return `https://wa.me/55${num}?text=${msg}`;
};

export default function AdminClientes() {
  const [clientes,   setClientes]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca,      setBusca]      = useState('');
  const [editando,   setEditando]   = useState(null); // id do cliente sendo editado
  const [dataNasc,   setDataNasc]   = useState('');

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/clientes').then(r => setClientes(r.data)).finally(() => setCarregando(false));

  const handleExcluirLGPD = async (id, nome) => {
    if (!window.confirm(`⚠️ LGPD — Anonimizar "${nome}"?\n\nEsta ação é IRREVERSÍVEL.`)) return;
    try {
      await api.delete(`/clientes/${id}/lgpd`);
      carregar();
    } catch { alert('Erro ao anonimizar.'); }
  };

  const salvarAniversario = async (id) => {
    try {
      await api.put(`/clientes/${id}/aniversario`, { data_nascimento: dataNasc || null });
      setEditando(null);
      setDataNasc('');
      carregar();
    } catch { alert('Erro ao salvar data de nascimento.'); }
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

      {/* ── Banner de Aniversariantes de Hoje ─────────── */}
      {aniversariantesHoje.length > 0 && (
        <div style={s.banner}>
          <span style={{ fontSize: '1.5rem' }}>🎂</span>
          <div>
            <strong>Aniversariante(s) hoje:</strong>{' '}
            {aniversariantesHoje.map(c => c.nome_completo.split(' ')[0]).join(', ')}
          </div>
          {aniversariantesHoje.map(c => {
            const link = linkAniversario(c.nome_completo, c.telefone);
            return link ? (
              <a key={c.id} href={link} target="_blank" rel="noreferrer" style={s.btnWpp}>
                💬 Parabenizar {c.nome_completo.split(' ')[0]}
              </a>
            ) : null;
          })}
        </div>
      )}

      {/* ── Filtro ────────────────────────────────────── */}
      <input type="text" placeholder="🔍 Buscar por nome ou telefone..."
        value={busca} onChange={e => setBusca(e.target.value)} style={s.inputBusca} />

      {/* ── Tabela ────────────────────────────────────── */}
      {carregando ? (
        <p style={s.loading}>Carregando clientes...</p>
      ) : filtrados.length === 0 ? (
        <p style={s.loading}>{busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={s.tabela}>
            <thead><tr style={s.thead}>
              {['Nome','Telefone','Aniversário','LGPD','Cadastro','Ações'].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtrados.map((c, i) => {
                const aniv = ehAniversariante(c.data_nascimento);
                return (
                  <tr key={c.id}
                    style={{ backgroundColor: aniv ? '#fffbeb' : i%2===0 ? '#fff' : '#f8fafc' }}>
                    <td style={{...s.td, fontWeight:'600'}}>
                      {c.nome_completo}
                      {aniv && <span style={s.badgeAniv}>🎂 Hoje!</span>}
                    </td>
                    <td style={s.td}>{c.telefone || '—'}</td>

                    {/* ── Célula de Aniversário (editável) ── */}
                    <td style={s.td}>
                      {editando === c.id ? (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <input type="date" value={dataNasc}
                            onChange={e => setDataNasc(e.target.value)}
                            style={{ ...s.inputPeq }}
                            placeholder="dd/mm"
                          />
                          <button onClick={() => salvarAniversario(c.id)} style={s.btnSalvar}>✅</button>
                          <button onClick={() => setEditando(null)} style={s.btnCancelar}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span>{c.data_nascimento ? fmtData(c.data_nascimento) : '—'}</span>
                          <button onClick={() => {
                            setEditando(c.id);
                            setDataNasc(c.data_nascimento || '');
                          }} style={s.btnEditar} title="Editar aniversário">
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>

                    <td style={s.td}>
                      <span style={{
                        padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600',
                        backgroundColor: c.aceitou_lgpd ? '#d1fae5' : '#fee2e2',
                        color: c.aceitou_lgpd ? '#065f46' : '#dc2626',
                      }}>
                        {c.aceitou_lgpd ? '✅ Aceito' : '❌ Pendente'}
                      </span>
                    </td>
                    <td style={{...s.td, fontSize:'0.85rem', color:'#94a3b8'}}>
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={s.td}>
                      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                        {/* Botão WhatsApp */}
                        {c.telefone && c.telefone !== 'ANONIMIZADO' && (
                          <a href={`https://wa.me/55${c.telefone.replace(/\D/g,'')}`}
                            target="_blank" rel="noreferrer" style={s.btnWppPeq}
                            title="Abrir WhatsApp">
                            💬
                          </a>
                        )}
                        {/* Botão LGPD */}
                        {!c.nome_completo.includes('Anonimizado') && (
                          <button onClick={() => handleExcluirLGPD(c.id, c.nome_completo)}
                            style={s.btnLGPD} title="Anonimizar dados (LGPD)">
                            🗑️ LGPD
                          </button>
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
  btnWppPeq:  { backgroundColor:'#25d366', color:'#fff', padding:'0.3rem 0.55rem', borderRadius:'6px', fontSize:'0.85rem', textDecoration:'none' },
  inputBusca: { padding:'0.7rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', width:'100%', maxWidth:'380px', marginBottom:'1.25rem', display:'block' },
  loading:    { color:'#94a3b8', textAlign:'center', padding:'2rem' },
  tabela:     { width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' },
  thead:      { backgroundColor:'#1e3a8a' },
  th:         { padding:'0.75rem 1rem', textAlign:'left', color:'#fff', fontWeight:'600', fontSize:'0.85rem', whiteSpace:'nowrap' },
  td:         { padding:'0.75rem 1rem', borderBottom:'1px solid #f1f5f9', verticalAlign:'middle' },
  badgeAniv:  { backgroundColor:'#fef3c7', color:'#92400e', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem', marginLeft:'0.5rem', fontWeight:'600' },
  inputPeq:   { padding:'0.35rem 0.5rem', borderRadius:'6px', border:'1px solid #e2e8f0', fontSize:'0.85rem', width:'130px' },
  btnEditar:  { backgroundColor:'transparent', border:'none', cursor:'pointer', fontSize:'0.85rem', padding:'0 0.2rem' },
  btnSalvar:  { backgroundColor:'#059669', color:'#fff', border:'none', padding:'0.3rem 0.5rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  btnCancelar:{ backgroundColor:'#f1f5f9', border:'1px solid #e2e8f0', padding:'0.3rem 0.5rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  btnLGPD:    { backgroundColor:'#fee2e2', color:'#dc2626', border:'none', padding:'0.3rem 0.6rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem' },
};
