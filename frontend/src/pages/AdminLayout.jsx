// AdminLayout.jsx — Sidebar fixa à esquerda para todas as páginas admin
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config/site';

const MENU = [
  { to: '/admin',                label: 'Dashboard',      icone: '📊' },
  { to: '/admin/estoque',        label: 'Estoque',        icone: '📦', destaque: true },
  { to: '/admin/produtos',       label: 'Produtos',       icone: '🧵' },
  { to: '/admin/materiaprima',   label: 'Matéria-Prima',  icone: '🪡' },
  { to: '/admin/compras',        label: 'Compras',        icone: '🛒' },
  { to: '/admin/pedidos',        label: 'Pedidos',        icone: '📋', separador: true },
  { to: '/admin/clientes',       label: 'Clientes',       icone: '👤' },
  { to: '/admin/fornecedores',   label: 'Fornecedores',   icone: '🏭' },
  { to: '/admin/financeiro',     label: 'Fluxo de Caixa', icone: '💸', separador: true },
  { to: '/admin/relatorios',     label: 'Relatórios',     icone: '📈' },
  { to: '/admin/usuarios',       label: 'Permissões',     icone: '🔑' },
  { to: '/admin/logs',           label: 'Logs',           icone: '🔍' },
];

export default function AdminLayout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { usuario, logout } = useAuth();
  const [aberta, setAberta] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isAtivo = (to) =>
    to === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(to);

  return (
    <div style={s.wrapper}>

      {/* ── Overlay mobile ─────────────────────────────── */}
      {aberta && (
        <div style={s.overlay} onClick={() => setAberta(false)} />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside style={{ ...s.sidebar, transform: aberta ? 'translateX(0)' : undefined }}>
        {/* Cabeçalho da sidebar */}
        <div style={s.sidebarHeader}>
          <span style={s.sidebarLogo}>🧵</span>
          <div>
            <div style={s.sidebarNomeSite}>{SITE.nome}</div>
            <div style={s.sidebarPainel}>Painel Admin</div>
          </div>
        </div>

        {/* Usuário logado */}
        <div style={s.usuarioBox}>
          <div style={s.usuarioAvatar}>
            {(usuario?.nome || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={s.usuarioNome}>{usuario?.nome?.split(' ')[0]}</div>
            <div style={s.usuarioNivel}>{usuario?.nivel}</div>
          </div>
        </div>

        {/* Links de navegação */}
        <nav style={s.nav}>
          {MENU.map(item => (
            <div key={item.to}>
              {item.separador && <div style={s.separador} />}
              <Link
                to={item.to}
                onClick={() => setAberta(false)}
                style={{
                  ...s.navLink,
                  ...(isAtivo(item.to) ? s.navLinkAtivo : {}),
                  ...(item.destaque ? s.navLinkDestaque : {}),
                }}
              >
                <span style={s.navIcone}>{item.icone}</span>
                <span>{item.label}</span>
                {item.destaque && !isAtivo(item.to) && (
                  <span style={s.badgeNovo}>✦</span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* Rodapé da sidebar */}
        <div style={s.sidebarFooter}>
          <Link to="/" style={s.linkSite}>🌐 Ver site</Link>
          <button onClick={handleLogout} style={s.btnSair}>Sair</button>
        </div>
      </aside>

      {/* ── Conteúdo principal ─────────────────────────── */}
      <main style={s.main}>
        {/* Barra superior mobile */}
        <div style={s.topbarMobile}>
          <button onClick={() => setAberta(!aberta)} style={s.btnMenu}>☰</button>
          <span style={s.topbarTitulo}>{SITE.nome}</span>
        </div>

        {/* Conteúdo da página */}
        <div style={s.conteudo}>
          {children}
        </div>
      </main>
    </div>
  );
}

const SIDEBAR_W = '224px';

const s = {
  wrapper:       { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4ff' },
  overlay:       { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 199, display: 'none' },

  sidebar: {
    width: SIDEBAR_W, minWidth: SIDEBAR_W, backgroundColor: '#1e3a8a',
    display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
    height: '100vh', overflowY: 'auto', zIndex: 200,
    boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
    // Mobile: sidebar desliza de cima
    '@media (max-width: 768px)': {
      position: 'fixed', left: 0, top: 0, transform: 'translateX(-100%)',
      transition: 'transform 0.25s',
    },
  },

  sidebarHeader: { padding: '1.25rem 1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarLogo:   { fontSize: '1.75rem', lineHeight: 1 },
  sidebarNomeSite:{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', lineHeight: 1.2 },
  sidebarPainel: { color: '#93c5fd', fontSize: '0.75rem', marginTop: '0.1rem' },

  usuarioBox:    { margin: '0.75rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  usuarioAvatar: { width: '34px', height: '34px', backgroundColor: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem', flexShrink: 0 },
  usuarioNome:   { color: '#fff', fontWeight: '600', fontSize: '0.88rem' },
  usuarioNivel:  { color: '#93c5fd', fontSize: '0.72rem' },

  nav:           { flex: 1, padding: '0.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' },
  separador:     { height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.4rem 0.5rem' },

  navLink: {
    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem',
    borderRadius: '8px', color: '#bfdbfe', textDecoration: 'none', fontSize: '0.88rem',
    fontWeight: '500', transition: 'all 0.15s', cursor: 'pointer',
  },
  navLinkAtivo: {
    backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '700',
  },
  navLinkDestaque: {
    backgroundColor: 'rgba(249,115,22,0.15)', color: '#fed7aa', border: '1px solid rgba(249,115,22,0.3)',
  },
  navIcone:      { fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 },
  badgeNovo:     { marginLeft: 'auto', color: '#f97316', fontSize: '0.7rem' },

  sidebarFooter: { padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' },
  linkSite:      { flex: 1, color: '#93c5fd', textDecoration: 'none', fontSize: '0.82rem', padding: '0.4rem 0.5rem', borderRadius: '6px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  btnSair:       { color: '#fca5a5', backgroundColor: 'transparent', border: '1px solid rgba(252,165,165,0.3)', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },

  main:          { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbarMobile:  { display: 'none', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#1e3a8a', position: 'sticky', top: 0, zIndex: 100 },
  btnMenu:       { backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0.1rem 0.25rem' },
  topbarTitulo:  { color: '#fff', fontWeight: '700', fontSize: '1rem' },
  conteudo:      { flex: 1, padding: '0', overflowX: 'hidden' },
};
