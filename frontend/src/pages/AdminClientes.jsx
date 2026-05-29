// AdminClientes.jsx — UC03: Admin gerencia clientes
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => { carregarClientes(); }, []);

  const carregarClientes = () => {
    api.get('/clientes')
      .then((res) => setClientes(res.data))
      .finally(() => setCarregando(false));
  };

  const handleExcluirLGPD = async (id, nome) => {
    if (!window.confirm(
      `⚠️ ATENÇÃO — Conformidade LGPD\n\nDeseja anonimizar os dados de "${nome}"?\n\nEsta ação é IRREVERSÍVEL. Os dados pessoais serão substituídos por "Cliente Anonimizado", mas o histórico de pedidos será mantido.`
    )) return;

    try {
      await api.delete(`/clientes/${id}/lgpd`);
      carregarClientes();
    } catch (err) {
      alert('Erro ao anonimizar cliente: ' + (err.response?.data?.erro || ''));
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca)
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>👤 Gerenciar Clientes</h1>

      <input
        type="text" placeholder="🔍 Buscar por nome ou telefone..."
        value={busca} onChange={(e) => setBusca(e.target.value)}
        style={styles.busca}
      />

      {carregando ? (
        <p style={{ color: '#666' }}>Carregando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <p style={{ color: '#666' }}>
          {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
        </p>
      ) : (
        <div style={styles.tabela}>
          <div style={styles.cabecalho}>
            <span>Nome</span>
            <span>Telefone</span>
            <span>CPF/CNPJ</span>
            <span>LGPD</span>
            <span>Cadastro</span>
            <span>Ação</span>
          </div>
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} style={styles.linha}>
              <span style={{ fontWeight: '600' }}>{cliente.nome_completo}</span>
              <span>{cliente.telefone || '—'}</span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>{cliente.cpf_cnpj || '—'}</span>
              <span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem',
                  backgroundColor: cliente.aceitou_lgpd ? '#d1fae5' : '#fee2e2',
                  color: cliente.aceitou_lgpd ? '#065f46' : '#dc2626',
                }}>
                  {cliente.aceitou_lgpd ? '✅ Aceito' : '❌ Pendente'}
                </span>
              </span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
              </span>
              {!cliente.nome_completo.includes('Anonimizado') ? (
                <button
                  onClick={() => handleExcluirLGPD(cliente.id, cliente.nome_completo)}
                  style={styles.btnLGPD}
                  title="Anonimizar dados (LGPD)"
                >
                  🗑️ LGPD
                </button>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Anonimizado</span>
              )}
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
  busca: {
    padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #d1d5db',
    fontSize: '1rem', width: '100%', maxWidth: '400px', marginBottom: '1.5rem',
  },
  tabela: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cabecalho: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    gap: '1rem', padding: '0.75rem 1rem', backgroundColor: '#1e3a8a',
    color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
  },
  linha: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    gap: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fff',
    borderRadius: '8px', alignItems: 'center', fontSize: '0.9rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  btnLGPD: {
    backgroundColor: '#fee2e2', color: '#dc2626', border: 'none',
    padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
  },
};
