// Home.jsx — Página inicial com textos configuráveis via site.js
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { usuario } = useAuth();

  return (
    <div>
      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroContent} className="fade-in">
          <span style={s.badge}>✨ Artesanato com qualidade</span>
          <h1 style={s.heroTitulo}>{SITE.slogan}</h1>
          <p style={s.heroSub}>{SITE.descricao}</p>
          <div style={s.heroAcoes}>
            <Link to="/portfolio" style={s.btnPrimario}>Ver Portfólio</Link>
            {!usuario
              ? <Link to="/cadastro" style={s.btnSecundario}>Criar conta grátis</Link>
              : <Link to={usuario.nivel === 'Administrador' ? '/admin' : '/cliente'} style={s.btnSecundario}>
                  Minha área →
                </Link>
            }
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={s.secao}>
        <h2 style={s.secaoTitulo}>Por que escolher nossos bordados?</h2>
        <div style={s.grid3}>
          {[
            { icone:'✋', titulo:'Feito à Mão', desc:'Cada peça é bordada com atenção e cuidado artesanal nos mínimos detalhes.' },
            { icone:'🎨', titulo:'Personalização Total', desc:'Seu nome, suas cores, seu estilo. Criamos exatamente do jeito que você imagina.' },
            { icone:'📱', titulo:'Acompanhe Online', desc:'Crie uma conta e acompanhe cada etapa da produção do seu pedido em tempo real.' },
          ].map(item => (
            <div key={item.titulo} style={s.card}>
              <div style={s.cardIcone}>{item.icone}</div>
              <h3 style={s.cardTitulo}>{item.titulo}</h3>
              <p style={s.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section style={s.secaoCinza}>
        <div style={{...s.secao, paddingTop:'3rem', paddingBottom:'3rem'}}>
          <h2 style={s.secaoTitulo}>O que bordamos</h2>
          <div style={s.grid4}>
            {[
              { icone:'👶', label:'Enxoval Bebê' },
              { icone:'🏠', label:'Decoração' },
              { icone:'👔', label:'Uniformes' },
              { icone:'🎁', label:'Kits Presente' },
              { icone:'🍽️', label:'Artigos para Casa' },
              { icone:'✏️', label:'Personalizados' },
            ].map(c => (
              <Link to="/portfolio" key={c.label} style={s.categoria}>
                <span style={{fontSize:'2rem'}}>{c.icone}</span>
                <span style={{fontWeight:'600', fontSize:'0.9rem', color:'#1e3a8a'}}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={s.secao}>
        <h2 style={s.secaoTitulo}>Como fazer sua encomenda</h2>
        <div style={s.grid3}>
          {[
            { num:'1', titulo:'Crie sua conta', desc:'Cadastro gratuito, rápido e seguro.' },
            { num:'2', titulo:'Escolha o produto', desc:'Navegue no portfólio e adicione ao pedido com suas personalizações.' },
            { num:'3', titulo:'Acompanhe tudo online', desc:'Receba atualizações do status e retire quando estiver pronto.' },
          ].map(p => (
            <div key={p.num} style={s.passo}>
              <div style={s.passoNum}>{p.num}</div>
              <h3 style={s.cardTitulo}>{p.titulo}</h3>
              <p style={s.cardDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={{color:'#fff', marginBottom:'0.75rem', fontSize:'1.8rem'}}>
          Pronto para encomendar?
        </h2>
        <p style={{color:'#bfdbfe', marginBottom:'2rem', fontSize:'1rem'}}>
          Fale conosco pelo WhatsApp ou crie sua conta para fazer pedidos online.
        </p>
        <div style={s.heroAcoes}>
          <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" style={s.btnWpp}>
            💬 WhatsApp
          </a>
          {!usuario && <Link to="/cadastro" style={s.btnSecundario}>Criar conta grátis</Link>}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} {SITE.nome} — {SITE.cidade}</p>
        <p style={{fontSize:'0.85rem', color:'#94a3b8', marginTop:'0.25rem'}}>{SITE.email}</p>
      </footer>
    </div>
  );
}

const s = {
  hero: { background:'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #1d4ed8 100%)', padding:'5rem 1.5rem 4rem', textAlign:'center', position:'relative', overflow:'hidden' },
  heroContent: { maxWidth:'680px', margin:'0 auto', position:'relative' },
  badge: { display:'inline-block', backgroundColor:'rgba(255,255,255,0.15)', color:'#bfdbfe', padding:'0.3rem 1rem', borderRadius:'20px', fontSize:'0.85rem', marginBottom:'1.25rem', border:'1px solid rgba(255,255,255,0.2)' },
  heroTitulo: { color:'#fff', fontSize:'2.8rem', fontWeight:'800', margin:'0 0 1rem', lineHeight:1.2, letterSpacing:'-0.5px' },
  heroSub: { color:'#bfdbfe', fontSize:'1.1rem', marginBottom:'2.25rem', lineHeight:1.7 },
  heroAcoes: { display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' },
  btnPrimario: { backgroundColor:'#f97316', color:'#fff', padding:'0.8rem 1.75rem', borderRadius:'10px', fontWeight:'bold', fontSize:'1rem', display:'inline-block', boxShadow:'0 4px 12px rgba(249,115,22,0.4)' },
  btnSecundario: { backgroundColor:'transparent', color:'#fff', padding:'0.8rem 1.75rem', borderRadius:'10px', fontWeight:'bold', fontSize:'1rem', display:'inline-block', border:'2px solid rgba(255,255,255,0.5)' },
  btnWpp: { backgroundColor:'#25d366', color:'#fff', padding:'0.8rem 1.75rem', borderRadius:'10px', fontWeight:'bold', fontSize:'1rem', display:'inline-block' },
  secao: { maxWidth:'1100px', margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' },
  secaoCinza: { backgroundColor:'#f8fafc' },
  secaoTitulo: { color:'#1e3a8a', fontSize:'1.7rem', fontWeight:'700', marginBottom:'2.5rem' },
  grid3: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1.5rem' },
  grid4: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1rem' },
  card: { backgroundColor:'#fff', borderRadius:'16px', padding:'2rem 1.5rem', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', transition:'transform 0.2s' },
  cardIcone: { fontSize:'2.5rem', width:'60px', height:'60px', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f0f4ff', borderRadius:'50%' },
  cardTitulo: { color:'#1e3a8a', fontWeight:'700', fontSize:'1.05rem', margin:0 },
  cardDesc: { color:'#64748b', fontSize:'0.95rem', margin:0, lineHeight:1.6 },
  categoria: { backgroundColor:'#fff', borderRadius:'12px', padding:'1.25rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all 0.2s' },
  passo: { backgroundColor:'#f0f4ff', borderRadius:'16px', padding:'2rem 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' },
  passoNum: { width:'48px', height:'48px', backgroundColor:'#1e3a8a', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'1.3rem' },
  cta: { backgroundColor:'#1e3a8a', padding:'4.5rem 1.5rem', textAlign:'center' },
  footer: { backgroundColor:'#0f172a', color:'#94a3b8', padding:'2rem', textAlign:'center', fontSize:'0.9rem' },
};
