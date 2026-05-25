// Login.jsx — UC01: Tela de login real conectada ao backend
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
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
    setCarregando(true);

    try {
      // Chama o endpoint real do backend
      const resposta = await api.post('/auth/login', form);
      const { token, usuario } = resposta.data;

      // Salva no contexto global e no localStorage
      login(usuario, token);

      // Redireciona conforme o nível de acesso
      if (usuario.nivel === 'Administrador') {
        navigate('/admin');
      } else {
        navigate('/cliente');
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>🧵 Entrar</h1>
        <p style={styles.sub}>Acesse sua conta para acompanhar pedidos</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>E-mail</label>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} required
            style={styles.input} placeholder="seu@email.com"
          />

          <label style={styles.label}>Senha</label>
          <input
            type="password" name="senha" value={form.senha}
            onChange={handleChange} required
            style={styles.input} placeholder="••••••••"
          />

          {erro && <p style={styles.erro}>{erro}</p>}

          <button type="submit" disabled={carregando} style={styles.btn}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: '#1e3a8a', fontWeight: 'bold' }}>
            Cadastre-se
          </Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#666' }}>← Voltar ao início</Link>
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
    backgroundColor: '#1e3a8a', color: '#fff', padding: '0.85rem',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem',
  },
  erro: {
    backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem',
    borderRadius: '8px', fontSize: '0.9rem', margin: '0',
  },
};
