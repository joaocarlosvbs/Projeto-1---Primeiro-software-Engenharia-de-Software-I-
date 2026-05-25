// Portfolio.jsx — UC04: Vitrine pública de produtos (sem login)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Portfolio() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    // Busca produtos do backend — rota pública, sem token
    api.get('/produtos/portfolio')
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error('Erro ao carregar portfólio:', err))
      .finally(() => setCarregando(false));
  }, []);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Nosso Portfólio</h1>
        <p style={styles.sub}>Conheça os produtos disponíveis para encomenda personalizada</p>
        <input
          type="text" placeholder="🔍 Buscar produto ou categoria..."
          value={busca} onChange={(e) => setBusca(e.target.value)}
          style={styles.busca}
        />
      </div>

      {carregando ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Carregando produtos...
        </p>
      ) : produtosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          {busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
        </p>
      ) : (
        <div style={styles.grid}>
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} style={styles.card}>
              <div style={styles.cardIcone}>🧵</div>
              {produto.categoria && (
                <span style={styles.badge}>{produto.categoria}</span>
              )}
              <h3 style={styles.cardTitulo}>{produto.nome}</h3>
              <p style={styles.preco}>
                R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}
              </p>
              <Link to="/cadastro" style={styles.btnEncomendar}>
                Encomendar
              </Link>
            </div>
          ))}
        </div>
      )}

      <div style={styles.cta}>
        <p style={{ margin: '0 0 1rem', color: '#555' }}>
          Para fazer uma encomenda, crie sua conta ou faça login.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/cadastro" style={styles.btnPrimario}>Criar conta</Link>
          <Link to="/login" style={styles.btnSecundario}>Entrar</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  titulo: { color: '#1e3a8a', fontSize: '2rem', margin: '0 0 0.5rem' },
  sub: { color: '#666', marginBottom: '1.5rem' },
  busca: {
    padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #d1d5db',
    fontSize: '1rem', width: '100%', maxWidth: '400px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.5rem', marginBottom: '3rem',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem',
  },
  cardIcone: { fontSize: '3rem', marginBottom: '0.5rem' },
  badge: {
    backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.7rem',
    borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
  },
  cardTitulo: { margin: 0, color: '#1e3a8a', fontSize: '1.1rem' },
  preco: { color: '#f97316', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 },
  btnEncomendar: {
    backgroundColor: '#1e3a8a', color: '#fff', padding: '0.6rem 1.2rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
    marginTop: '0.5rem', fontSize: '0.9rem',
  },
  cta: {
    backgroundColor: '#f0f4ff', borderRadius: '12px',
    padding: '2rem', textAlign: 'center',
  },
  btnPrimario: {
    backgroundColor: '#f97316', color: '#fff', padding: '0.7rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
  },
  btnSecundario: {
    backgroundColor: '#1e3a8a', color: '#fff', padding: '0.7rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
  },
};
