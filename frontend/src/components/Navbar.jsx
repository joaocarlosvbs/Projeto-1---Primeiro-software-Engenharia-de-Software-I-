// Navbar.jsx — Responsiva com menu hamburguer e config central
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config/site';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuAberto(false); };
  const fechar = () => setMenuAberto(false);
  const isAdmin = usuario?.nivel === 'Administrador';

  const LinkNav = ({ to, children }) => (
    <Link to={to} onClick={fechar}
      style={{ ...s.link, ...(location.pathname === to ? s.linkAtivo : {}) }}>
      {children}
    </Link>
  );

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo} onClick={fechar}>🧵 {SITE.nome}</Link>

      <button style={s.hamburguer} onClick={() => setMenuAberto(!menuAberto)} aria-label="Menu">
        <span>{menuAberto ? '✕' : '☰'}</span>
      </button>

      <div style={menuAberto ? s.menuAberto : s.menu}>
        <LinkNav to="/">Início</LinkNav>
        <LinkNav to="/portfolio">Portfólio</LinkNav>
        <LinkNav to="/contato">Contato</LinkNav>

        {!usuario ? (
          <Link to="/login" style={s.btnDestaque} onClick={fechar}>Entrar</Link>
        ) : (
          <>
            {isAdmin
              ? <LinkNav to="/admin">⚙️ Painel Admin</LinkNav>
              : <LinkNav to="/cliente">📦 Meus Pedidos</LinkNav>
            }
            <div style={s.usuarioInfo}>
              <span style={s.nome}>👤 {usuario.nome.split(' ')[0]}</span>
              <button onClick={handleLogout} style={s.btnSair}>Sair</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 1.5rem', height:'64px', backgroundColor:'#1e3a8a', position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 12px rgba(0,0,0,0.25)' },
  logo: { color:'#fff', textDecoration:'none', fontSize:'1.15rem', fontWeight:'bold', letterSpacing:'-0.3px', whiteSpace:'nowrap' },
  hamburguer: { display:'none', background:'none', border:'none', color:'#fff', fontSize:'1.6rem', cursor:'pointer', lineHeight:1, padding:'0.25rem' },
  menu: { display:'flex', alignItems:'center', gap:'0.25rem' },
  menuAberto: { display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.5rem', position:'absolute', top:'64px', left:0, width:'100%', backgroundColor:'#1e3a8a', padding:'1.25rem 1.5rem', boxShadow:'0 4px 16px rgba(0,0,0,0.3)', zIndex:999 },
  link: { color:'#bfdbfe', textDecoration:'none', padding:'0.45rem 0.8rem', borderRadius:'6px', fontSize:'0.95rem' },
  linkAtivo: { color:'#fff', backgroundColor:'rgba(255,255,255,0.15)', fontWeight:'600' },
  btnDestaque: { backgroundColor:'#f97316', color:'#fff', padding:'0.45rem 1.1rem', borderRadius:'8px', textDecoration:'none', fontWeight:'bold', fontSize:'0.9rem', marginLeft:'0.5rem' },
  usuarioInfo: { display:'flex', alignItems:'center', gap:'0.5rem', marginLeft:'0.5rem' },
  nome: { color:'#bfdbfe', fontSize:'0.88rem' },
  btnSair: { backgroundColor:'transparent', color:'#fca5a5', border:'1px solid #fca5a5', padding:'0.3rem 0.65rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.82rem' },
};
