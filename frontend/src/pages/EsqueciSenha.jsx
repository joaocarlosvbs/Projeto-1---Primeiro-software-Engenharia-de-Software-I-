// EsqueciSenha.jsx — Tela de recuperação de senha
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SITE } from '../config/site';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [etapa, setEtapa] = useState(1); // 1=email, 2=nova senha, 3=sucesso
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await api.post('/auth/verificar-email', { email });
      setEtapa(2);
    } catch (err) {
      setErro(err.response?.data?.erro || 'E-mail não encontrado no sistema.');
    } finally { setCarregando(false); }
  };

  const handleRedefinir = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.');
    setErro('');
    setCarregando(true);
    try {
      await api.post('/auth/redefinir-senha', { email, novaSenha });
      setEtapa(3);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao redefinir senha.');
    } finally { setCarregando(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icone}>🔑</div>
        <h1 style={s.titulo}>Recuperar Senha</h1>

        {etapa === 1 && (
          <>
            <p style={s.sub}>Informe seu e-mail cadastrado para redefinir sua senha.</p>
            <form onSubmit={handleEnviarEmail} style={s.form}>
              <label style={s.label}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required style={s.input} placeholder="seu@email.com"/>
              {erro && <p style={s.erro}>{erro}</p>}
              <button type="submit" disabled={carregando} style={s.btn}>
                {carregando ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          </>
        )}

        {etapa === 2 && (
          <>
            <p style={s.sub}>E-mail confirmado! Defina sua nova senha.</p>
            <form onSubmit={handleRedefinir} style={s.form}>
              <label style={s.label}>Nova Senha</label>
              <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                required style={s.input} placeholder="Mínimo 6 caracteres"/>
              {erro && <p style={s.erro}>{erro}</p>}
              <button type="submit" disabled={carregando} style={s.btn}>
                {carregando ? 'Salvando...' : 'Redefinir Senha'}
              </button>
            </form>
          </>
        )}

        {etapa === 3 && (
          <div style={{textAlign:'center'}}>
            <p style={{fontSize:'3rem', marginBottom:'1rem'}}>✅</p>
            <p style={{color:'#059669', fontWeight:'600', marginBottom:'1.5rem'}}>
              Senha redefinida com sucesso!
            </p>
            <Link to="/login" style={s.btn}>Ir para o Login</Link>
          </div>
        )}

        <p style={{textAlign:'center', marginTop:'1.25rem', fontSize:'0.9rem', color:'#64748b'}}>
          <Link to="/login" style={{color:'#1e3a8a', fontWeight:'600'}}>← Voltar ao login</Link>
        </p>

        {/* Instrução de contato alternativo */}
        <div style={s.ajuda}>
          <p style={{fontSize:'0.85rem', color:'#64748b', textAlign:'center'}}>
            Problemas com o acesso? Entre em contato pelo{' '}
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer"
              style={{color:'#25d366', fontWeight:'600'}}>WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f0f4ff', padding:'2rem' },
  card: { backgroundColor:'#fff', borderRadius:'20px', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' },
  icone: { fontSize:'2.5rem', textAlign:'center', marginBottom:'0.5rem' },
  titulo: { color:'#1e3a8a', textAlign:'center', marginBottom:'0.25rem', fontSize:'1.5rem' },
  sub: { color:'#64748b', textAlign:'center', marginBottom:'1.5rem', fontSize:'0.95rem', lineHeight:1.6 },
  form: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  label: { fontWeight:'600', color:'#374151', fontSize:'0.9rem' },
  input: { padding:'0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'1rem', outline:'none', width:'100%' },
  btn: { backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.85rem', borderRadius:'8px', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', textAlign:'center', display:'block' },
  erro: { backgroundColor:'#fee2e2', color:'#dc2626', padding:'0.65rem', borderRadius:'8px', fontSize:'0.88rem', margin:0 },
  ajuda: { marginTop:'1.25rem', paddingTop:'1rem', borderTop:'1px solid #f1f5f9' },
};
