// Portfolio.jsx — Portfólio público com redirecionamento correto para logados
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIAS } from '../config/site';

export default function Portfolio() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/produtos/portfolio')
      .then(r => setProdutos(r.data))
      .finally(() => setCarregando(false));
  }, []);

  const handleEncomendar = (produtoId) => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    // Usuário logado → vai direto para encomendar com produto pré-selecionado
    navigate('/encomendar', { state: { produtoId } });
  };

  const filtrados = produtos.filter(p => {
    const buscaOk = p.nome.toLowerCase().includes(busca.toLowerCase());
    const catOk = !categoriaFiltro || p.categoria === categoriaFiltro;
    return buscaOk && catOk;
  });

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.titulo}>Nosso Portfólio</h1>
        <p style={s.sub}>Conheça os produtos disponíveis para encomenda personalizada</p>

        {/* Filtros */}
        <div style={s.filtros}>
          <input type="text" placeholder="🔍 Buscar produto..."
            value={busca} onChange={e => setBusca(e.target.value)} style={s.inputBusca}/>
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} style={s.select}>
            <option value="">Todas as categorias</option>
            {categoriasExistentes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de produtos */}
      <div style={s.container}>
        {carregando ? (
          <div style={s.central}><div style={s.spinner}></div><p>Carregando...</p></div>
        ) : filtrados.length === 0 ? (
          <div style={s.central}>
            <p style={{fontSize:'3rem'}}>🔍</p>
            <p style={{color:'#64748b'}}>{busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtrados.map(produto => (
              <div key={produto.id} style={s.card}>
                <div style={s.cardImg}>🧵</div>
                <div style={s.cardBody}>
                  {produto.categoria && <span style={s.badge}>{produto.categoria}</span>}
                  <h3 style={s.cardTitulo}>{produto.nome}</h3>
                  <p style={s.preco}>R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}</p>
                  <button onClick={() => handleEncomendar(produto.id)} style={s.btnEncomendar}>
                    {usuario ? 'Encomendar' : 'Entrar para encomendar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA para não logados */}
        {!usuario && (
          <div style={s.cta}>
            <h3 style={{color:'#1e3a8a', margin:'0 0 0.5rem'}}>Quer fazer uma encomenda?</h3>
            <p style={{color:'#64748b', margin:'0 0 1.25rem', fontSize:'0.95rem'}}>
              Crie sua conta gratuitamente para personalizar e acompanhar seus pedidos.
            </p>
            <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
              <Link to="/cadastro" style={s.btnPrimario}>Criar conta grátis</Link>
              <Link to="/login" style={s.btnSecundario}>Já tenho conta</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh' },
  header: { background:'linear-gradient(135deg, #1e3a8a, #1e40af)', padding:'3rem 1.5rem 2rem', textAlign:'center' },
  titulo: { color:'#fff', fontSize:'2rem', fontWeight:'700', margin:'0 0 0.5rem' },
  sub: { color:'#bfdbfe', marginBottom:'1.75rem' },
  filtros: { display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' },
  inputBusca: { padding:'0.65rem 1rem', borderRadius:'8px', border:'none', fontSize:'0.95rem', width:'260px', maxWidth:'100%' },
  select: { padding:'0.65rem 1rem', borderRadius:'8px', border:'none', fontSize:'0.95rem', backgroundColor:'#fff' },
  container: { maxWidth:'1200px', margin:'0 auto', padding:'2.5rem 1.5rem' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.5rem', marginBottom:'2.5rem' },
  card: { backgroundColor:'#fff', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', transition:'transform 0.2s, box-shadow 0.2s' },
  cardImg: { backgroundColor:'#f0f4ff', height:'140px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' },
  cardBody: { padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem', flex:1 },
  badge: { backgroundColor:'#dbeafe', color:'#1e40af', padding:'0.15rem 0.6rem', borderRadius:'20px', fontSize:'0.78rem', fontWeight:'600', alignSelf:'flex-start' },
  cardTitulo: { color:'#1e293b', fontWeight:'700', fontSize:'1rem', margin:0 },
  preco: { color:'#f97316', fontWeight:'800', fontSize:'1.2rem', margin:0 },
  btnEncomendar: { marginTop:'auto', backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.65rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'0.9rem' },
  central: { textAlign:'center', padding:'4rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', color:'#64748b' },
  spinner: { width:'40px', height:'40px', border:'4px solid #dbeafe', borderTopColor:'#1e3a8a', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  cta: { backgroundColor:'#f0f4ff', borderRadius:'16px', padding:'2.5rem', textAlign:'center', border:'1px solid #bfdbfe' },
  btnPrimario: { backgroundColor:'#f97316', color:'#fff', padding:'0.7rem 1.5rem', borderRadius:'8px', fontWeight:'bold', display:'inline-block' },
  btnSecundario: { backgroundColor:'#1e3a8a', color:'#fff', padding:'0.7rem 1.5rem', borderRadius:'8px', fontWeight:'bold', display:'inline-block' },
};
