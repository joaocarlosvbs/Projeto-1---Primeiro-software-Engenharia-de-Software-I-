// Login.jsx — UC01 com link para recuperação de senha
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config/site';

export default function Login() {
  const [form, setForm] = useState({ email:'', senha:'' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setCarregando(true);
    try {
      const r = await api.post('/auth/login', form);
      login(r.data.usuario, r.data.token);
      navigate(r.data.usuario.nivel === 'Administrador' ? '/admin' : '/cliente');
    } catch (err) { setErro(err.response?.data?.erro || 'Erro ao fazer login.'); }
    finally { setCarregando(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icone}>🧵</div>
        <h1 style={s.titulo}>{SITE.nome}</h1>
        <p style={s.sub}>Acesse sua conta</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div>
            <label style={s.label}>E-mail</label>
            <input type="email" name="email" value={form.email} required
              onChange={e => setForm({...form, email:e.target.value})}
              style={s.input} placeholder="seu@email.com" autoFocus/>
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <label style={s.label}>Senha</label>
              <Link to="/esqueci-senha" style={s.linkSuave}>Esqueci a senha</Link>
            </div>
            <input type="password" name="senha" value={form.senha} required
              onChange={e => setForm({...form, senha:e.target.value})}
              style={s.input} placeholder="••••••••"/>
          </div>

          {erro && <div style={s.erro}>{erro}</div>}

          <button type="submit" disabled={carregando} style={s.btn}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={s.rodape}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={s.link}>Cadastre-se grátis</Link>
        </p>
        <p style={s.rodape}>
          <Link to="/" style={s.linkSuave}>← Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f0f4ff', padding:'2rem' },
  card: { backgroundColor:'#fff', borderRadius:'20px', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' },
  icone: { fontSize:'2.5rem', textAlign:'center', marginBottom:'0.25rem' },
  titulo: { color:'#1e3a8a', textAlign:'center', fontSize:'1.5rem', margin:'0 0 0.25rem' },
  sub: { color:'#64748b', textAlign:'center', marginBottom:'1.75rem', fontSize:'0.95rem' },
  form: { display:'flex', flexDirection:'column', gap:'1rem' },
  label: { display:'block', fontWeight:'600', color:'#374151', fontSize:'0.88rem', marginBottom:'0.3rem' },
  input: { width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'1rem', outline:'none', transition:'border 0.15s' },
  btn: { backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.875rem', borderRadius:'10px', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', marginTop:'0.25rem' },
  erro: { backgroundColor:'#fee2e2', color:'#dc2626', padding:'0.75rem', borderRadius:'8px', fontSize:'0.9rem', textAlign:'center' },
  rodape: { textAlign:'center', marginTop:'1rem', fontSize:'0.9rem', color:'#64748b' },
  link: { color:'#1e3a8a', fontWeight:'700' },
  linkSuave: { color:'#64748b', fontSize:'0.85rem' },
};
