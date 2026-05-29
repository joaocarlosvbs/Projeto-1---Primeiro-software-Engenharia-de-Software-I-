// AdminUsuarios.jsx — UC16: Gerenciar permissões
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';
import { useAuth } from '../context/AuthContext';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [msg, setMsg] = useState('');
  const { usuario: eu } = useAuth();

  useEffect(() => { api.get('/usuarios').then(r => setUsuarios(r.data)); }, []);

  const alterarNivel = async (id, nivel_acesso) => {
    try {
      await api.put(`/usuarios/${id}/nivel`, { nivel_acesso });
      setMsg(`✅ Permissão alterada para ${nivel_acesso}.`);
      api.get('/usuarios').then(r => setUsuarios(r.data));
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.erro || 'Erro ao alterar.'));
    }
  };

  const NIVEL_CORES = {
    'Administrador': { bg:'#dbeafe', cor:'#1e40af' },
    'Cliente':       { bg:'#f0fdf4', cor:'#065f46' },
  };

  return (
    <div style={s.container}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>🔑 Gerenciar Permissões</h1>
      <p style={{color:'#666', marginBottom:'1.5rem'}}>
        Altere o nível de acesso dos usuários cadastrados. As alterações têm efeito imediato na próxima sessão do usuário.
      </p>

      {msg && (
        <p style={{padding:'0.75rem', borderRadius:'8px', marginBottom:'1rem',
          backgroundColor: msg.startsWith('✅') ? '#d1fae5' : '#fee2e2',
          color: msg.startsWith('✅') ? '#065f46' : '#dc2626'}}>
          {msg}
        </p>
      )}

      <table style={s.tabela}>
        <thead><tr style={{backgroundColor:'#1e3a8a',color:'#fff'}}>
          {['Nome','E-mail','Nível Atual','Alterar Para','Cadastro'].map(h=><th key={h} style={s.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {usuarios.map(u => {
            const cores = NIVEL_CORES[u.nivel_acesso] || {};
            const souEu = u.id === eu?.id;
            return (
              <tr key={u.id} style={{backgroundColor: souEu ? '#fffbeb' : '#fff'}}>
                <td style={s.td}>
                  <strong>{u.nome}</strong>
                  {souEu && <span style={{marginLeft:'0.5rem', fontSize:'0.75rem', color:'#f97316'}}>(você)</span>}
                </td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>
                  <span style={{padding:'0.2rem 0.7rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600', backgroundColor:cores.bg, color:cores.cor}}>
                    {u.nivel_acesso}
                  </span>
                </td>
                <td style={s.td}>
                  {souEu ? (
                    <span style={{color:'#9ca3af', fontSize:'0.85rem'}}>Não é possível alterar seu próprio nível</span>
                  ) : (
                    <div style={{display:'flex', gap:'0.5rem'}}>
                      {u.nivel_acesso !== 'Administrador' && (
                        <button onClick={() => alterarNivel(u.id, 'Administrador')} style={s.btnAdmin}>
                          → Administrador
                        </button>
                      )}
                      {u.nivel_acesso !== 'Cliente' && (
                        <button onClick={() => alterarNivel(u.id, 'Cliente')} style={s.btnCliente}>
                          → Cliente
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td style={{...s.td, fontSize:'0.85rem', color:'#666'}}>
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  container:{maxWidth:'1000px',margin:'0 auto',padding:'2rem'},
  titulo:{color:'#1e3a8a',marginBottom:'0.5rem'},
  tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},
  th:{padding:'0.75rem 1rem',textAlign:'left'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f3f4f6'},
  btnAdmin:{backgroundColor:'#dbeafe',color:'#1e40af',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600'},
  btnCliente:{backgroundColor:'#d1fae5',color:'#065f46',border:'none',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600'},
};
