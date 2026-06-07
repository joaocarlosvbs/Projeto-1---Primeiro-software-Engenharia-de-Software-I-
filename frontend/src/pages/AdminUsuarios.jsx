// AdminUsuarios.jsx — com desativar/reativar usuário
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BotaoVoltar from '../components/BotaoVoltar';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [msg,      setMsg]      = useState('');
  const { usuario: eu } = useAuth();

  useEffect(() => { carregar(); }, []);
  const carregar = () => api.get('/usuarios').then(r => setUsuarios(r.data));

  const alterarNivel = async (id, nivel_acesso) => {
    try {
      await api.put(`/usuarios/${id}/nivel`, { nivel_acesso });
      setMsg(`✅ Nível alterado para ${nivel_acesso}.`);
      carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
  };

  const desativarReativar = async (u) => {
    const ativo = !u.deleted_at;
    const acao  = ativo ? 'desativar' : 'reativar';
    if (!window.confirm(`${ativo?'Desativar':'Reativar'} "${u.nome}"?`)) return;
    try {
      const r = await api.put(`/usuarios/${u.id}/desativar`);
      setMsg(`✅ ${r.data.mensagem}`);
      carregar();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
  };

  const NIVEL_COR = { 'Administrador':{bg:'#dbeafe',cor:'#1e40af'}, 'Vendedor':{bg:'#fef3c7',cor:'#92400e'}, 'Cliente':{bg:'#d1fae5',cor:'#065f46'} };

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>🔑 Gerenciar Permissões</h1>
      <p style={{color:'#64748b',marginBottom:'1.5rem',fontSize:'0.9rem'}}>Gerencie os níveis de acesso e o status das contas de usuário.</p>

      {msg && <p style={{padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem',backgroundColor:msg.startsWith('✅')?'#d1fae5':'#fee2e2',color:msg.startsWith('✅')?'#065f46':'#dc2626'}}>{msg}</p>}

      <div style={{overflowX:'auto'}}>
        <table style={s.tabela}>
          <thead><tr style={s.thead}>
            {['Nome','E-mail','Nível','Status','Alterar Nível','Ações'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {usuarios.map((u,i)=>{
              const cores = NIVEL_COR[u.nivel_acesso]||{};
              const souEu = u.id===eu?.id;
              const desativado = !!u.deleted_at;
              return (
                <tr key={u.id} style={{backgroundColor:desativado?'#f9fafb':souEu?'#fffbeb':i%2===0?'#fff':'#f8fafc',opacity:desativado?0.65:1}}>
                  <td style={{...s.td,fontWeight:'600'}}>
                    {u.nome}
                    {souEu && <span style={{marginLeft:'0.4rem',fontSize:'0.75rem',color:'#f97316'}}>(você)</span>}
                  </td>
                  <td style={{...s.td,fontSize:'0.88rem',color:'#64748b'}}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{padding:'0.2rem 0.7rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'600',backgroundColor:cores.bg,color:cores.cor}}>
                      {u.nivel_acesso}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{padding:'0.2rem 0.6rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'600',backgroundColor:desativado?'#fee2e2':'#d1fae5',color:desativado?'#dc2626':'#065f46'}}>
                      {desativado?'🔴 Inativo':'🟢 Ativo'}
                    </span>
                  </td>
                  <td style={s.td}>
                    {souEu ? <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>—</span> : (
                      <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                        {u.nivel_acesso!=='Administrador' && <button onClick={()=>alterarNivel(u.id,'Administrador')} style={s.btnAdmin}>→ Admin</button>}
                        {u.nivel_acesso!=='Vendedor'      && <button onClick={()=>alterarNivel(u.id,'Vendedor')}      style={s.btnVend}>→ Vendedor</button>}
                        {u.nivel_acesso!=='Cliente'       && <button onClick={()=>alterarNivel(u.id,'Cliente')}       style={s.btnCliente}>→ Cliente</button>}
                      </div>
                    )}
                  </td>
                  <td style={s.td}>
                    {!souEu && (
                      <button onClick={()=>desativarReativar(u)} style={desativado?s.btnReativar:s.btnDesativar}>
                        {desativado?'🔓 Reativar':'🔒 Desativar'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s={page:{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.5rem'},titulo:{color:'#1e3a8a',margin:'0 0 0.25rem',fontSize:'1.6rem',fontWeight:'700'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},btnAdmin:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem',fontWeight:'600'},btnVend:{backgroundColor:'#fef3c7',color:'#92400e',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem',fontWeight:'600'},btnCliente:{backgroundColor:'#d1fae5',color:'#065f46',border:'none',padding:'0.3rem 0.65rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem',fontWeight:'600'},btnDesativar:{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem'},btnReativar:{backgroundColor:'#d1fae5',color:'#065f46',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.82rem'}};
