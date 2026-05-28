// Cadastro.jsx — UC02: Tela de cadastro de novo usuário
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (form.senha !== form.confirmarSenha) {
      return setErro('As senhas não coincidem.');
    }
    if (form.senha.length < 6) {
      return setErro('A senha deve ter pelo menos 6 caracteres.');
    }

    setCarregando(true);
    try {
      // Cadastra o usuário (nível padrão: Cliente)
      await api.post('/auth/cadastro', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        nivel_acesso: 'Cliente',
      });

      // Já faz login automático após o cadastro
      const resposta = await api.post('/auth/login', {
        email: form.email,
        senha: form.senha,
      });
      login(resposta.data.usuario, resposta.data.token);
      navigate('/cliente');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>🧵 Criar Conta</h1>
        <p style={styles.sub}>Cadastre-se para fazer suas encomendas</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Nome completo</label>
          <input
            type="text" name="nome" value={form.nome}
            onChange={handleChange} required
            style={styles.input} placeholder="Seu nome"
          />

          <label style={styles.label}>E-mail</label>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} required
            style={styles.input} placeholder="seu@email.com"
          />

          <label style={styles.label}>Telefone</label>
          <input
          type="tel" name="telefone" value={form.telefone || ''}
          onChange={handleChange}
          style={styles.input} placeholder="(11) 99999-9999"
          />

          <label style={styles.label}>Senha</label>
          <input
            type="password" name="senha" value={form.senha}
            onChange={handleChange} required
            style={styles.input} placeholder="Mínimo 6 caracteres"
          />

          <label style={styles.label}>Confirmar senha</label>
          <input
            type="password" name="confirmarSenha" value={form.confirmarSenha}
            onChange={handleChange} required
            style={styles.input} placeholder="Repita a senha"
          />

          {erro && <p style={styles.erro}>{erro}</p>}

          <button type="submit" disabled={carregando} style={styles.btn}>
            {carregando ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#f0f4ff', padding: '2rem',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  titulo: { color: '#1e3a8a', margin: '0 0 0.25rem', textAlign: 'center' },
  sub: { color: '#666', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
  input: {
    padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #d1d5db',
    fontSize: '1rem', outline: 'none', marginBottom: '0.5rem',
  },
  btn: {
    backgroundColor: '#f97316', color: '#fff', padding: '0.85rem',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem',
  },
  erro: {
    backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem',
    borderRadius: '8px', fontSize: '0.9rem', margin: 0,
  },
};
