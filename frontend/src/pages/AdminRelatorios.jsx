// AdminRelatorios.jsx — UC14: Relatórios gerenciais
import { useState } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const TIPOS = [
  { id: 'vendas-periodo', label: '📅 Vendas por Período', colunas: ['Data','Pedidos','Receita'] },
  { id: 'lucro-produto', label: '💰 Lucro por Produto', colunas: ['Produto','Unidades Vendidas','Receita Total'] },
  { id: 'mais-vendidos', label: '🏆 Produtos Mais Vendidos', colunas: ['Produto','Categoria','Qtd Vendida','Receita'] },
  { id: 'vendas-cliente', label: '👤 Vendas por Cliente', colunas: ['Cliente','Telefone','Pedidos','Total Gasto','Último Pedido'] },
  { id: 'aniversariantes', label: '🎂 Clientes Cadastrados', colunas: ['Nome','Telefone'] },
];

export default function AdminRelatorios() {
  const [tipo, setTipo] = useState('');
  const [filtro, setFiltro] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fim: new Date().toISOString().split('T')[0],
  });
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [gerado, setGerado] = useState(false);

  const gerar = async () => {
    if (!tipo) return alert('Selecione o tipo de relatório.');
    setCarregando(true); setGerado(false);
    try {
      const r = await api.get(`/relatorios/${tipo}?inicio=${filtro.inicio}&fim=${filtro.fim}`);
      setDados(r.data); setGerado(true);
    } catch { alert('Erro ao gerar relatório.'); }
    finally { setCarregando(false); }
  };

  const tipoAtual = TIPOS.find(t => t.id === tipo);
  const fmt = (v) => v !== undefined ? `R$ ${parseFloat(v||0).toFixed(2).replace('.',',' )}` : '';

  const renderCelula = (row, col) => {
    const colLower = col.toLowerCase();
    if (colLower.includes('data') || colLower.includes('pedido') && row.ultimo_pedido) {
      const val = row.data || row.ultimo_pedido;
      if (val) return new Date(val).toLocaleDateString('pt-BR');
    }
    if (colLower.includes('receita') || colLower.includes('total gasto')) {
      const val = row.receita_total || row.receita || row.valor_total;
      return val !== undefined ? fmt(val) : '—';
    }
    if (colLower.includes('pedidos')) return row.total_pedidos || row.total_pedidos;
    if (colLower.includes('unidades') || colLower.includes('qtd')) return row.unidades_vendidas || row.total_vendido;
    if (colLower.includes('produto')) return row.nome || row.produto;
    if (colLower.includes('cliente')) return row.nome_completo;
    if (colLower.includes('telefone')) return row.telefone || '—';
    if (colLower.includes('categoria')) return row.categoria || '—';
    if (colLower.includes('lucro')) return fmt(row.lucro_estimado);
    return '—';
  };

  return (
    <div style={s.container}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>📊 Relatórios Gerenciais</h1>

      <div style={s.painel}>
        <div>
          <label style={s.label}>Tipo de Relatório</label>
          <select value={tipo} onChange={e => {setTipo(e.target.value); setDados([]); setGerado(false);}} style={s.select}>
            <option value="">Selecione...</option>
            {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Data Inicial</label>
          <input type="date" value={filtro.inicio} onChange={e => setFiltro({...filtro,inicio:e.target.value})} style={s.inputData}/>
        </div>
        <div>
          <label style={s.label}>Data Final</label>
          <input type="date" value={filtro.fim} onChange={e => setFiltro({...filtro,fim:e.target.value})} style={s.inputData}/>
        </div>
        <button onClick={gerar} disabled={carregando} style={s.btnGerar}>
          {carregando ? 'Gerando...' : '🔍 Gerar Relatório'}
        </button>
      </div>

      {gerado && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <h2 style={s.secaoTitulo}>{tipoAtual?.label} — {dados.length} registro(s)</h2>
          </div>

          {dados.length === 0 ? (
            <div style={s.vazio}>
              <p style={{fontSize:'2rem'}}>📭</p>
              <p>Nenhum dado encontrado para este período.</p>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.tabela}>
                <thead><tr style={{backgroundColor:'#1e3a8a',color:'#fff'}}>
                  {tipoAtual?.colunas.map(c=><th key={c} style={s.th}>{c}</th>)}
                </tr></thead>
                <tbody>
                  {dados.map((row, i) => (
                    <tr key={i} style={{backgroundColor: i%2===0 ? '#fff' : '#f8fafc'}}>
                      {tipoAtual?.colunas.map(col => (
                        <td key={col} style={s.td}>{renderCelula(row, col)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  container:{maxWidth:'1100px',margin:'0 auto',padding:'2rem'},
  titulo:{color:'#1e3a8a',marginBottom:'1.5rem'},
  painel:{display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'flex-end',backgroundColor:'#fff',padding:'1.5rem',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',marginBottom:'2rem'},
  label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.9rem',marginBottom:'0.25rem'},
  select:{padding:'0.65rem',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'0.95rem',minWidth:'240px'},
  inputData:{padding:'0.65rem',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'0.95rem'},
  btnGerar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',alignSelf:'flex-end'},
  secaoTitulo:{color:'#1e3a8a'},
  vazio:{textAlign:'center',padding:'3rem',color:'#666',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'},
  tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},
  th:{padding:'0.75rem 1rem',textAlign:'left'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f3f4f6'},
};
