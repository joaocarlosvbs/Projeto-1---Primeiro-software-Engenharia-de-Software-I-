// Encomendar.jsx — UC07: Fazer encomenda (cliente logado)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Encomendar() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [dataEntrega, setDataEntrega] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/produtos/portfolio')
      .then((res) => setProdutos(res.data))
      .finally(() => setCarregando(false));
  }, []);

  const adicionarAoCarrinho = (produto) => {
    const existente = carrinho.find((i) => i.produto_id === produto.id);
    if (existente) {
      setCarrinho(carrinho.map((i) =>
        i.produto_id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco: produto.preco_venda,
        quantidade: 1,
        personalizacao: '',
      }]);
    }
  };

  const removerDoCarrinho = (produto_id) => {
    setCarrinho(carrinho.filter((i) => i.produto_id !== produto_id));
  };

  const atualizarPersonalizacao = (produto_id, texto) => {
    setCarrinho(carrinho.map((i) =>
      i.produto_id === produto_id ? { ...i, personalizacao: texto } : i
    ));
  };

  const atualizarQuantidade = (produto_id, quantidade) => {
    if (quantidade < 1) return;
    setCarrinho(carrinho.map((i) =>
      i.produto_id === produto_id ? { ...i, quantidade: Number(quantidade) } : i
    ));
  };

  const totalCarrinho = carrinho.reduce(
    (acc, i) => acc + i.preco * i.quantidade, 0
  );

  const handleFinalizar = async () => {
    if (carrinho.length === 0) return setErro('Adicione pelo menos um produto.');
    setErro('');
    setEnviando(true);
    try {
      await api.post('/pedidos', {
        itens: carrinho.map(({ produto_id, quantidade, personalizacao }) => ({
          produto_id, quantidade, personalizacao
        })),
        data_entrega: dataEntrega || null,
      });
      navigate('/cliente', { state: { sucesso: true } });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao finalizar encomenda.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>🛍️ Nova Encomenda</h1>
      <p style={styles.sub}>Selecione os produtos e informe as personalizações desejadas</p>

      <div style={styles.layout}>
        {/* Catálogo */}
        <div style={styles.catalogo}>
          <h2 style={styles.secaoTitulo}>Catálogo de Produtos</h2>
          {carregando ? (
            <p style={{ color: '#666' }}>Carregando produtos...</p>
          ) : (
            <div style={styles.gridProdutos}>
              {produtos.map((produto) => (
                <div key={produto.id} style={styles.cardProduto}>
                  <span style={{ fontSize: '2rem' }}>🧵</span>
                  {produto.categoria && (
                    <span style={styles.badge}>{produto.categoria}</span>
                  )}
                  <h3 style={{ margin: '0.25rem 0', color: '#1e3a8a', fontSize: '1rem' }}>
                    {produto.nome}
                  </h3>
                  <p style={{ color: '#f97316', fontWeight: 'bold', margin: 0 }}>
                    R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}
                  </p>
                  <button
                    onClick={() => adicionarAoCarrinho(produto)}
                    style={styles.btnAdicionar}
                  >
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div style={styles.carrinho}>
          <h2 style={styles.secaoTitulo}>Seu Pedido</h2>

          {carrinho.length === 0 ? (
            <div style={styles.carrinhoVazio}>
              <p style={{ fontSize: '2rem' }}>🛒</p>
              <p style={{ color: '#666' }}>Nenhum item adicionado ainda</p>
            </div>
          ) : (
            <>
              {carrinho.map((item) => (
                <div key={item.produto_id} style={styles.itemCarrinho}>
                  <div style={styles.itemHeader}>
                    <span style={{ fontWeight: '600', color: '#1e3a8a' }}>{item.nome}</span>
                    <button onClick={() => removerDoCarrinho(item.produto_id)} style={styles.btnRemover}>✕</button>
                  </div>

                  <div style={styles.itemControles}>
                    <label style={styles.labelPequeno}>Qtd:</label>
                    <input
                      type="number" min="1" value={item.quantidade}
                      onChange={(e) => atualizarQuantidade(item.produto_id, e.target.value)}
                      style={styles.inputQtd}
                    />
                    <span style={{ color: '#f97316', fontWeight: 'bold' }}>
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <label style={styles.labelPequeno}>Personalização:</label>
                  <input
                    type="text"
                    placeholder='Ex: "Bordar nome Maria em azul cursivo"'
                    value={item.personalizacao}
                    onChange={(e) => atualizarPersonalizacao(item.produto_id, e.target.value)}
                    style={styles.inputPersonalizacao}
                  />
                </div>
              ))}

              <div style={styles.total}>
                <span>Total estimado:</span>
                <strong style={{ color: '#f97316', fontSize: '1.2rem' }}>
                  R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                </strong>
              </div>

              <label style={styles.labelPequeno}>Data de entrega desejada (opcional):</label>
              <input
                type="date" value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                style={{ ...styles.inputPersonalizacao, marginBottom: '1rem' }}
              />

              {erro && <p style={styles.erro}>{erro}</p>}

              <button
                onClick={handleFinalizar}
                disabled={enviando}
                style={styles.btnFinalizar}
              >
                {enviando ? 'Enviando...' : '✅ Finalizar Encomenda'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  titulo: { color: '#1e3a8a', margin: '0 0 0.25rem' },
  sub: { color: '#666', marginBottom: '2rem' },
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  catalogo: { flex: '2 1 400px' },
  carrinho: {
    flex: '1 1 300px', backgroundColor: '#fff', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    position: 'sticky', top: '80px',
  },
  secaoTitulo: { color: '#1e3a8a', borderBottom: '2px solid #dbeafe', paddingBottom: '0.5rem', marginBottom: '1rem' },
  gridProdutos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' },
  cardProduto: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center',
  },
  badge: {
    backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.6rem',
    borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
  },
  btnAdicionar: {
    backgroundColor: '#1e3a8a', color: '#fff', border: 'none',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 'bold', marginTop: '0.5rem', fontSize: '0.85rem',
  },
  carrinhoVazio: { textAlign: 'center', padding: '2rem', color: '#999' },
  itemCarrinho: {
    backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem',
    marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemControles: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  btnRemover: {
    background: 'none', border: 'none', color: '#dc2626',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
  },
  labelPequeno: { fontSize: '0.85rem', fontWeight: '600', color: '#555' },
  inputQtd: {
    width: '60px', padding: '0.3rem', borderRadius: '6px',
    border: '1px solid #d1d5db', textAlign: 'center',
  },
  inputPersonalizacao: {
    width: '100%', padding: '0.5rem', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '0.85rem',
  },
  total: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 0', borderTop: '2px solid #e5e7eb', margin: '0.5rem 0',
  },
  btnFinalizar: {
    width: '100%', backgroundColor: '#f97316', color: '#fff',
    border: 'none', padding: '0.9rem', borderRadius: '8px',
    fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
  },
  erro: {
    backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem',
    borderRadius: '8px', fontSize: '0.9rem', marginBottom: '0.5rem',
  },
};
