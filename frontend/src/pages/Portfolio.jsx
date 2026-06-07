// Portfolio.jsx — com imagens reais dos produtos
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIAS } from '../config/site';

export default function Portfolio() {
  const [produtos,      setProdutos]      = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [busca,         setBusca]         = useState('');
  const [categoriaFilt, setCategoriaFilt] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/produtos/portfolio')
      .then(r => setProdutos(r.data))
      .finally(() => setCarregando(false));
  }, []);

  const handleEncomendar = (produtoId) => {
    if (!usuario) { navigate('/login'); return; }
    navigate('/encomendar', { state: { produtoId } });
  };

  const filtrados = produtos.filter(p => {
    const ok1 = p.nome.toLowerCase().includes(busca.toLowerCase());
    const ok2 = !categoriaFilt || p.categoria === categoriaFilt;
    return ok1 && ok2;
  });

  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.titulo}>Nosso Portfólio</h1>
        <p style={s.sub}>Conheça os produtos disponíveis para encomenda personalizada</p>
        <div style={s.filtros}>
          <input type="text" placeholder="🔍 Buscar produto..." value={busca}
            onChange={e => setBusca(e.target.value)} style={s.inputBusca}/>
          <select value={categoriaFilt} onChange={e => setCategoriaFilt(e.target.value)} style={s.select}>
            <option value="">Todas as categorias</option>
            {categoriasExistentes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={s.container}>
        {carregando ? (
          <div style={s.central}><div style={s.spinner}/><p>Carregando...</p></div>
        ) : filtrados.length===0 ? (
          <div style={s.central}><p style={{fontSize:'3rem'}}>🔍</p><p style={{color:'#64748b'}}>{busca?'Nenhum produto encontrado.':'Nenhum produto no catálogo ainda.'}</p></div>
        ) : (
          <div style={s.grid}>
            {filtrados.map(produto => (
              <div key={produto.id} style={s.card}>
                {/* Imagem do produto */}
                <div style={s.imgWrap}>
                  {produto.imagem_url ? (
                    <img src={produto.imagem_url} alt={produto.nome} style={s.img}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
                  ) : null}
                  <div style={{...s.imgPlaceholder, display: produto.imagem_url ? 'none' : 'flex'}}>🧵</div>
                </div>
                <div style={s.cardBody}>
                  {produto.categoria && <span style={s.badge}>{produto.categoria}</span>}
                  <h3 style={s.cardTitulo}>{produto.nome}</h3>
                  <p style={s.preco}>R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.',',')}</p>
                  <button onClick={() => handleEncomendar(produto.id)} style={s.btnEnc}>
                    {usuario ? 'Encomendar' : 'Entrar para encomendar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s={page:{minHeight:'100vh'},header:{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',padding:'3rem 1.5rem 2rem',textAlign:'center'},titulo:{color:'#fff',fontSize:'2rem',fontWeight:'700',margin:'0 0 0.5rem'},sub:{color:'#bfdbfe',marginBottom:'1.75rem'},filtros:{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap'},inputBusca:{padding:'0.65rem 1rem',borderRadius:'8px',border:'none',fontSize:'0.95rem',width:'260px',maxWidth:'100%'},select:{padding:'0.65rem 1rem',borderRadius:'8px',border:'none',fontSize:'0.95rem',backgroundColor:'#fff'},container:{maxWidth:'1200px',margin:'0 auto',padding:'2.5rem 1.5rem'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:'1.5rem'},card:{backgroundColor:'#fff',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 16px rgba(0,0,0,0.08)',display:'flex',flexDirection:'column'},imgWrap:{height:'180px',overflow:'hidden',position:'relative',backgroundColor:'#f0f4ff'},img:{width:'100%',height:'100%',objectFit:'cover'},imgPlaceholder:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem',backgroundColor:'#f0f4ff'},cardBody:{padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.5rem',flex:1},badge:{backgroundColor:'#dbeafe',color:'#1e40af',padding:'0.15rem 0.6rem',borderRadius:'20px',fontSize:'0.78rem',fontWeight:'600',alignSelf:'flex-start'},cardTitulo:{color:'#1e293b',fontWeight:'700',fontSize:'1rem',margin:0},preco:{color:'#f97316',fontWeight:'800',fontSize:'1.2rem',margin:0},btnEnc:{marginTop:'auto',backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.65rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',fontSize:'0.9rem'},central:{textAlign:'center',padding:'4rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem',color:'#64748b'},spinner:{width:'40px',height:'40px',border:'4px solid #dbeafe',borderTopColor:'#1e3a8a',borderRadius:'50%'}};
