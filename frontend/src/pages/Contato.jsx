// Contato.jsx — Página de contato pública
import { Link } from 'react-router-dom';

export default function Contato() {
  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Fale Conosco</h1>
      <p style={styles.sub}>Entre em contato para solicitar orçamentos ou tirar dúvidas</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.icone}>📱</span>
          <h3>WhatsApp</h3>
          <p style={{ color: '#555' }}>Mande uma mensagem e respondemos em breve</p>
          <a href="https://wa.me/55SEUNUMERO" target="_blank" rel="noreferrer" style={styles.btn}>
            Chamar no WhatsApp
          </a>
        </div>

        <div style={styles.card}>
          <span style={styles.icone}>📧</span>
          <h3>E-mail</h3>
          <p style={{ color: '#555' }}>bordados@email.com</p>
          <a href="mailto:bordados@email.com" style={styles.btn}>Enviar e-mail</a>
        </div>

        <div style={styles.card}>
          <span style={styles.icone}>🛍️</span>
          <h3>Fazer Encomenda</h3>
          <p style={{ color: '#555' }}>Crie uma conta e acompanhe seu pedido online</p>
          <Link to="/cadastro" style={styles.btn}>Criar conta</Link>
        </div>
      </div>

      <div style={styles.faq}>
        <h2 style={{ color: '#1e3a8a' }}>Perguntas Frequentes</h2>
        {[
          { p: 'Qual o prazo de entrega?', r: 'O prazo varia conforme a complexidade da peça, geralmente entre 7 e 21 dias úteis.' },
          { p: 'Posso personalizar com qualquer nome?', r: 'Sim! Bordamos nomes, frases e artes conforme sua solicitação.' },
          { p: 'Como acompanho meu pedido?', r: 'Após criar sua conta e fazer a encomenda, você pode acompanhar o status em tempo real na área do cliente.' },
          { p: 'É necessário pagar sinal?', r: 'Sim, pedimos um sinal de 50% para iniciar a produção. O restante é pago na entrega.' },
        ].map((item) => (
          <div key={item.p} style={styles.faqItem}>
            <strong style={{ color: '#1e3a8a' }}>❓ {item.p}</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#555' }}>{item.r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' },
  titulo: { color: '#1e3a8a', fontSize: '2rem', margin: '0 0 0.5rem' },
  sub: { color: '#666', marginBottom: '2.5rem' },
  grid: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' },
  card: {
    flex: '1 1 220px', maxWidth: '260px', backgroundColor: '#fff', borderRadius: '12px',
    padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
  },
  icone: { fontSize: '2.5rem' },
  btn: {
    backgroundColor: '#1e3a8a', color: '#fff', padding: '0.6rem 1.2rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginTop: '0.5rem',
  },
  faq: {
    backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '2rem', textAlign: 'left',
  },
  faqItem: {
    backgroundColor: '#fff', borderRadius: '8px', padding: '1rem',
    marginTop: '1rem', borderLeft: '4px solid #1e3a8a',
  },
};
