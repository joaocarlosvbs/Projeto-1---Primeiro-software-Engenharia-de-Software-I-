// Cadastro.jsx — UC02 com campo de telefone
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config/site';

export default function Cadastro() {
  const [form, setForm] = useState({ nome:'', email:'', telefone:'', senha:'', confirmar:'' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro('');
    if (form.senha !== form.confirmar) return setErro('As senhas não coincidem.');
    if (form.senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.');
    setCarregando(true);
    try {
      await api.post('/auth/cadastro', { nome:form.nome, email:form.email, telefone:form.telefone, senha:form.senha });
      const r = await api.post('/auth/login', { email:form.email, senha:form.senha });
      login(r.data.usuario, r.data.token);
      navigate('/cliente');
    } catch (err) { setErro(err.response?.data?.erro || 'Erro ao cadastrar.'); }
    finally { setCarregando(false); }
  };

  const campos = [
    { name:'nome',     label:'Nome completo',     type:'text',     placeholder:'Seu nome completo' },
    { name:'email',    label:'E-mail',             type:'email',    placeholder:'seu@email.com' },
    { name:'telefone', label:'Telefone',           type:'tel',      placeholder:'(18) 99999-9999' },
    { name:'senha',    label:'Senha',              type:'password', placeholder:'Mínimo 6 caracteres' },
    { name:'confirmar',label:'Confirmar senha',    type:'password', placeholder:'Repita a senha' },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icone}>🧵</div>
        <h1 style={s.titulo}>Criar Conta</h1>
        <p style={s.sub}>{SITE.nome} — Cadastro gratuito</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {campos.map(c => (
            <div key={c.name}>
              <label style={s.label}>{c.label}</label>
              <input type={c.type} name={c.name} value={form[c.name]} required={c.name !== 'telefone'}
                onChange={e => setForm({...form, [c.name]:e.target.value})}
                style={s.input} placeholder={c.placeholder}/>
            </div>
          ))}
          {erro && <div style={s.erro}>{erro}</div>}
          <button type="submit" disabled={carregando} style={s.btn}>
            {carregando ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p style={s.rodape}>
          Já tem conta? <Link to="/login" style={s.link}>Entrar</Link>
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
  icone: { fontSize:'2.5rem', textAlign:'center' },
  titulo: { color:'#1e3a8a', textAlign:'center', fontSize:'1.5rem', margin:'0.25rem 0' },
  sub: { color:'#64748b', textAlign:'center', marginBottom:'1.5rem', fontSize:'0.9rem' },
  form: { display:'flex', flexDirection:'column', gap:'0.85rem' },
  label: { display:'block', fontWeight:'600', color:'#374151', fontSize:'0.88rem', marginBottom:'0.25rem' },
  input: { width:'100%', padding:'0.7rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.95rem' },
  btn: { backgroundColor:'#f97316', color:'#fff', border:'none', padding:'0.875rem', borderRadius:'10px', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', marginTop:'0.25rem' },
  erro: { backgroundColor:'#fee2e2', color:'#dc2626', padding:'0.75rem', borderRadius:'8px', fontSize:'0.88rem', textAlign:'center' },
  rodape: { textAlign:'center', marginTop:'0.75rem', fontSize:'0.9rem', color:'#64748b' },
  link: { color:'#1e3a8a', fontWeight:'700' },
  linkSuave: { color:'#64748b', fontSize:'0.85rem' },
};
