// Home.jsx — Página pública inicial
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitulo}>Bordados Artesanais com<br />Alma e Dedicação</h1>
          <p style={styles.heroSub}>
            Peças únicas feitas à mão com amor. Toalhas, kits batizado,
            uniformes personalizados e muito mais.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/portfolio" style={styles.btnPrimario}>Ver Portfólio</Link>
            <Link to="/contato" style={styles.btnSecundario}>Solicitar Orçamento</Link>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section style={styles.secao}>
        <h2 style={styles.secaoTitulo}>Por que escolher nossos bordados?</h2>
        <div style={styles.cards}>
          {[
            { icone: '✋', titulo: 'Feito à Mão', desc: 'Cada peça é bordada com cuidado artesanal e atenção aos detalhes.' },
            { icone: '🎨', titulo: 'Personalização', desc: 'Seu nome, suas cores, seu estilo. Criamos do jeito que você imagina.' },
            { icone: '📦', titulo: 'Acompanhe seu Pedido', desc: 'Com login, você acompanha cada etapa da produção em tempo real.' },
          ].map((item) => (
            <div key={item.titulo} style={styles.card}>
              <span style={{ fontSize: '2.5rem' }}>{item.icone}</span>
              <h3 style={{ margin: '0.5rem 0' }}>{item.titulo}</h3>
              <p style={{ color: '#555', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={{ color: '#fff', margin: '0 0 1rem' }}>Pronto para encomendar?</h2>
        <p style={{ color: '#bfdbfe', margin: '0 0 1.5rem' }}>
          Crie sua conta, veja o portfólio completo e faça sua encomenda personalizada.
        </p>
        <Link to="/cadastro" style={styles.btnPrimario}>Criar conta grátis</Link>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    padding: '5rem 2rem', textAlign: 'center',
  },
  heroContent: { maxWidth: '700px', margin: '0 auto' },
  heroTitulo: { color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem' },
  heroSub: { color: '#bfdbfe', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 },
  btnPrimario: {
    backgroundColor: '#f97316', color: '#fff', padding: '0.75rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block',
  },
  btnSecundario: {
    backgroundColor: 'transparent', color: '#fff', padding: '0.75rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', border: '2px solid #fff', display: 'inline-block',
  },
  secao: { padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
  secaoTitulo: { fontSize: '1.8rem', color: '#1e3a8a', marginBottom: '2.5rem' },
  cards: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    flex: '1 1 250px', maxWidth: '300px', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center', backgroundColor: '#fff',
  },
  cta: {
    backgroundColor: '#1e3a8a', padding: '4rem 2rem', textAlign: 'center',
  },
};
