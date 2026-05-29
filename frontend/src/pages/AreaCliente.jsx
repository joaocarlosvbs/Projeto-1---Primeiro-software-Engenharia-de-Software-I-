// AreaCliente.jsx — UC11: Área do cliente logado (meus pedidos)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CORES = {
  'Aguardando':   { bg: '#fef3c7', cor: '#92400e' },
  'Em Produção':  { bg: '#dbeafe', cor: '#1e40af' },
  'Finalizado':   { bg: '#d1fae5', cor: '#065f46' },
  'Entregue':     { bg: '#f3f4f6', cor: '#374151' },
};

export default function AreaCliente() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/pedidos/meus')
      .then((res) => setPedidos(res.data))
      .catch((err) => console.error('Erro ao buscar pedidos:', err))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Olá, {usuario?.nome?.split(' ')[0]}! 👋</h1>
      <p style={styles.sub}>Acompanhe aqui o status das suas encomendas</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/portfolio" style={styles.btnAcao}>🧵 Ver Portfólio</Link>
        <Link to="/encomendar" style={styles.btnDestaque}>+ Nova Encomenda</Link>
      </div>

      <h2 style={styles.secaoTitulo}>Meus Pedidos</h2>

      {carregando ? (
        <p style={styles.mensagem}>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div style={styles.vazio}>
          <p style={{ fontSize: '3rem', margin: 0 }}>📦</p>
          <p>Você ainda não fez nenhuma encomenda.</p>
          <Link to="/portfolio" style={styles.btnDestaque}>Ver Portfólio</Link>
        </div>
      ) : (
        <div style={styles.lista}>
          {pedidos.map((pedido) => {
            const cores = STATUS_CORES[pedido.status] || STATUS_CORES['Aguardando'];
            return (
              <div key={pedido.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.pedidoNum}>Pedido #{pedido.id}</span>
                  <span style={{ ...styles.badge, backgroundColor: cores.bg, color: cores.cor }}>
                    {pedido.status}
                  </span>
                </div>

                <div style={styles.info}>
                  <span>📅 Pedido em: {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</span>
                  {pedido.data_entrega && (
                    <span>🚚 Entrega prevista: {new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}</span>
                  )}
                  <span>💰 Total: R$ {parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}</span>
                </div>

                {pedido.itens && (
                  <div style={styles.itens}>
                    <strong>Itens:</strong>
                    {pedido.itens.map((item, i) => (
                      <div key={i} style={styles.item}>
                        <span>{item.produto} × {item.quantidade}</span>
                        {item.personalizacao && (
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            ✏️ {item.personalizacao}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  titulo: { color: '#1e3a8a', margin: '0 0 0.25rem' },
  sub: { color: '#666', marginBottom: '1.5rem' },
  secaoTitulo: { color: '#1e3a8a', borderBottom: '2px solid #dbeafe', paddingBottom: '0.5rem' },
  btnAcao: {
    backgroundColor: '#f0f4ff', color: '#1e3a8a', padding: '0.6rem 1.2rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: '600', border: '1px solid #bfdbfe',
  },
  btnDestaque: {
    backgroundColor: '#f97316', color: '#fff', padding: '0.6rem 1.2rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
  },
  mensagem: { textAlign: 'center', color: '#666', padding: '2rem' },
  vazio: {
    textAlign: 'center', padding: '3rem', color: '#666',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pedidoNum: { fontWeight: 'bold', color: '#1e3a8a', fontSize: '1.1rem' },
  badge: { padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem' },
  info: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.95rem', color: '#444' },
  itens: {
    backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem',
  },
  item: { display: 'flex', flexDirection: 'column', paddingLeft: '0.5rem', borderLeft: '3px solid #bfdbfe' },
};
