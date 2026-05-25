// Navbar.jsx — Barra de navegação do site
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🧵 Vitrine Bordados</Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Início</Link>
        <Link to="/portfolio" style={styles.link}>Portfólio</Link>
        <Link to="/contato" style={styles.link}>Contato</Link>

        {!usuario ? (
          <Link to="/login" style={styles.btnLogin}>Entrar</Link>
        ) : (
          <>
            {usuario.nivel === 'Administrador' && (
              <Link to="/admin" style={styles.link}>Painel Admin</Link>
            )}
            <Link to="/cliente" style={styles.link}>Meus Pedidos</Link>
            <span style={styles.nomeUsuario}>Olá, {usuario.nome.split(' ')[0]}</span>
            <button onClick={handleLogout} style={styles.btnLogout}>Sair</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 2rem', backgroundColor: '#1e3a8a', color: '#fff',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  logo: {
    color: '#fff', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 'bold',
  },
  links: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '0.95rem' },
  btnLogin: {
    backgroundColor: '#f97316', color: '#fff', padding: '0.4rem 1rem',
    borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold',
  },
  btnLogout: {
    backgroundColor: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5',
    padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
  },
  nomeUsuario: { color: '#bfdbfe', fontSize: '0.9rem' },
};
