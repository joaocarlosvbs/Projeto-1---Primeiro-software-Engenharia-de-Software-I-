// AdminDashboard.jsx — Painel do administrador
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = () => {
    api.get('/pedidos')
      .then((res) => setPedidos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
  };

  const atualizarStatus = async (id, novoStatus) => {
    setAtualizando(id);
    try {
      await api.put(`/pedidos/${id}/status`, { status: novoStatus });
      carregarPedidos(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao atualizar status.');
    } finally {
      setAtualizando(null);
    }
  };

  const STATUS_OPCOES = ['Aguardando', 'Em Produção', 'Finalizado', 'Entregue'];
  const STATUS_CORES = {
    'Aguardando':  '#fef3c7',
    'Em Produção': '#dbeafe',
    'Finalizado':  '#d1fae5',
    'Entregue':    '#f3f4f6',
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>⚙️ Painel Administrativo</h1>

      {/* Cards de atalho */}
      <div style={styles.cards}>
        {[
          { label: 'Total de Pedidos', valor: pedidos.length, icone: '📦' },
          { label: 'Aguardando', valor: pedidos.filter(p => p.status === 'Aguardando').length, icone: '⏳' },
          { label: 'Em Produção', valor: pedidos.filter(p => p.status === 'Em Produção').length, icone: '🧵' },
          { label: 'Finalizados', valor: pedidos.filter(p => p.status === 'Finalizado' || p.status === 'Entregue').length, icone: '✅' },
        ].map((card) => (
          <div key={card.label} style={styles.card}>
            <span style={{ fontSize: '2rem' }}>{card.icone}</span>
            <strong style={{ fontSize: '1.8rem', color: '#1e3a8a' }}>{card.valor}</strong>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>{card.label}</span>
          </div>
        ))}
      </div>

      {/* Atalhos rápidos */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/admin/produtos" style={styles.btnAcao}>🧵 Gerenciar Produtos</Link>
        <Link to="/admin/clientes" style={styles.btnAcao}>👤 Gerenciar Clientes</Link>
      </div>

      {/* Lista de pedidos */}
      <h2 style={styles.secaoTitulo}>Fila de Pedidos — UC08</h2>

      {carregando ? (
        <p style={{ color: '#666' }}>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum pedido registrado ainda.</p>
      ) : (
        <div style={styles.tabela}>
          <div style={styles.cabecalho}>
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Data</span>
            <span>Valor</span>
            <span>Status Atual</span>
            <span>Alterar Status</span>
          </div>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={{ ...styles.linha, backgroundColor: STATUS_CORES[pedido.status] || '#fff' }}>
              <span>#{pedido.id}</span>
              <span>{pedido.cliente}</span>
              <span>{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</span>
              <span>R$ {parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}</span>
              <span><strong>{pedido.status}</strong></span>
              <select
                value={pedido.status}
                disabled={atualizando === pedido.id}
                onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                style={styles.select}
              >
                {STATUS_OPCOES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  titulo: { color: '#1e3a8a', marginBottom: '1.5rem' },
  cards: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  card: {
    flex: '1 1 180px', backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '0.3rem', textAlign: 'center',
  },
  secaoTitulo: { color: '#1e3a8a', borderBottom: '2px solid #dbeafe', paddingBottom: '0.5rem' },
  btnAcao: {
    backgroundColor: '#1e3a8a', color: '#fff', padding: '0.6rem 1.2rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: '600',
  },
  tabela: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cabecalho: {
    display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 130px 150px',
    gap: '1rem', padding: '0.75rem 1rem', backgroundColor: '#1e3a8a',
    color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
  },
  linha: {
    display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 130px 150px',
    gap: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
    alignItems: 'center', fontSize: '0.9rem',
  },
  select: {
    padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db',
    fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff',
  },
};
