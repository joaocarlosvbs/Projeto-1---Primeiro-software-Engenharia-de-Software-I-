// AdminProdutos.jsx — UC04: Admin cadastra e gerencia produtos
import { useState, useEffect } from 'react';
import api from '../services/api';

const FORM_VAZIO = { nome: '', categoria: '', preco_venda: '', visivel_portfolio: true };

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => { carregarProdutos(); }, []);

  const carregarProdutos = () => {
    api.get('/produtos')
      .then((res) => setProdutos(res.data))
      .finally(() => setCarregando(false));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      if (editandoId) {
        await api.put(`/produtos/${editandoId}`, form);
        setMensagem('✅ Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', form);
        setMensagem('✅ Produto cadastrado com sucesso!');
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregarProdutos();
    } catch (err) {
      setMensagem('❌ ' + (err.response?.data?.erro || 'Erro ao salvar produto.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (produto) => {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria || '',
      preco_venda: produto.preco_venda,
      visivel_portfolio: produto.visivel_portfolio,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setMensagem('');
  };

  const toggleVisibilidade = async (produto) => {
    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        visivel_portfolio: !produto.visivel_portfolio,
      });
      carregarProdutos();
    } catch (err) {
      alert('Erro ao alterar visibilidade.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>🧵 Gerenciar Produtos</h1>

      {/* Formulário */}
      <div style={styles.formCard}>
        <h2 style={styles.formTitulo}>
          {editandoId ? `✏️ Editando Produto #${editandoId}` : '+ Novo Produto'}
        </h2>
        <form onSubmit={handleSalvar} style={styles.form}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Nome do Produto *</label>
              <input name="nome" value={form.nome} onChange={handleChange}
                required style={styles.input} placeholder="Ex: Toalha de Batizado" />
            </div>
            <div>
              <label style={styles.label}>Categoria</label>
              <input name="categoria" value={form.categoria} onChange={handleChange}
                style={styles.input} placeholder="Ex: Enxoval, Uniformes, Quadros" />
            </div>
            <div>
              <label style={styles.label}>Preço de Venda (R$) *</label>
              <input name="preco_venda" type="number" step="0.01" min="0"
                value={form.preco_venda} onChange={handleChange}
                required style={styles.input} placeholder="0,00" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" name="visivel_portfolio" id="visivel"
                checked={form.visivel_portfolio} onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="visivel" style={{ cursor: 'pointer', fontWeight: '600' }}>
                Visível no Portfólio
              </label>
            </div>
          </div>

          {mensagem && (
            <p style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
              backgroundColor: mensagem.startsWith('✅') ? '#d1fae5' : '#fee2e2',
              color: mensagem.startsWith('✅') ? '#065f46' : '#dc2626',
            }}>{mensagem}</p>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={salvando} style={styles.btnSalvar}>
              {salvando ? 'Salvando...' : editandoId ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </button>
            {editandoId && (
              <button type="button" onClick={handleCancelar} style={styles.btnCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela de produtos */}
      <h2 style={styles.secaoTitulo}>Produtos Cadastrados ({produtos.length})</h2>

      {carregando ? (
        <p style={{ color: '#666' }}>Carregando...</p>
      ) : produtos.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <div style={styles.tabela}>
          <div style={styles.cabecalho}>
            <span>Nome</span>
            <span>Categoria</span>
            <span>Preço</span>
            <span>Estoque</span>
            <span>Portfólio</span>
            <span>Ações</span>
          </div>
          {produtos.map((produto) => (
            <div key={produto.id} style={styles.linha}>
              <span style={{ fontWeight: '600' }}>{produto.nome}</span>
              <span style={{ color: '#666' }}>{produto.categoria || '—'}</span>
              <span style={{ color: '#f97316', fontWeight: 'bold' }}>
                R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}
              </span>
              <span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem',
                  backgroundColor: produto.estoque_atual <= produto.estoque_minimo ? '#fee2e2' : '#d1fae5',
                  color: produto.estoque_atual <= produto.estoque_minimo ? '#dc2626' : '#065f46',
                }}>
                  {produto.estoque_atual} un
                </span>
              </span>
              <span>
                <button onClick={() => toggleVisibilidade(produto)} style={{
                  padding: '0.25rem 0.6rem', borderRadius: '20px', cursor: 'pointer', border: 'none',
                  backgroundColor: produto.visivel_portfolio ? '#d1fae5' : '#f3f4f6',
                  color: produto.visivel_portfolio ? '#065f46' : '#6b7280', fontSize: '0.8rem',
                }}>
                  {produto.visivel_portfolio ? '✅ Visível' : '🙈 Oculto'}
                </button>
              </span>
              <button onClick={() => handleEditar(produto)} style={styles.btnEditar}>
                ✏️ Editar
              </button>
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
  formCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem',
  },
  formTitulo: { color: '#1e3a8a', marginBottom: '1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem',
  },
  label: { display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.9rem', marginBottom: '0.25rem' },
  input: {
    width: '100%', padding: '0.7rem', borderRadius: '8px',
    border: '1.5px solid #d1d5db', fontSize: '0.95rem',
  },
  btnSalvar: {
    backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '0.75rem 1.5rem',
    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem',
  },
  btnCancelar: {
    backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
    padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
  },
  secaoTitulo: { color: '#1e3a8a', borderBottom: '2px solid #dbeafe', paddingBottom: '0.5rem', marginBottom: '1rem' },
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
  btnEditar: {
    backgroundColor: '#dbeafe', color: '#1e40af', border: 'none',
    padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
};
