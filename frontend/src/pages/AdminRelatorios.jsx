// AdminRelatorios.jsx — com fix do relatório de clientes e filtro de aniversariantes por mês
import { useState } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const hoje = new Date().toISOString().split('T')[0];
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const mesAtual = String(new Date().getMonth() + 1).padStart(2,'0');

const MESES = ['01-Janeiro','02-Fevereiro','03-Março','04-Abril','05-Maio','06-Junho',
               '07-Julho','08-Agosto','09-Setembro','10-Outubro','11-Novembro','12-Dezembro'];

const TIPOS = [
  { id:'vendas-periodo', label:'📅 Vendas por Período',        precisaPeriodo:true,  colunas:['Data','Pedidos','Receita'] },
  { id:'lucro-produto',  label:'💰 Lucro por Produto',         precisaPeriodo:true,  colunas:['Produto','Qtd Vendida','Receita Total'] },
  { id:'mais-vendidos',  label:'🏆 Mais Vendidos (ABC)',        precisaPeriodo:true,  colunas:['Produto','Categoria','Qtd Vendida','Receita'] },
  { id:'vendas-cliente', label:'👤 Vendas por Cliente',         precisaPeriodo:true,  colunas:['Cliente','Telefone','Pedidos','Total Gasto','Último Pedido'] },
  { id:'aniversariantes',label:'📋 Clientes Cadastrados',       precisaPeriodo:false, colunas:['Nome','Telefone','Aniversário'] },
  { id:'aniversariantes-mes', label:'🎂 Aniversariantes do Mês', precisaPeriodo:false, colunas:['Nome','Telefone','Aniversário'] },
];

const fmt = v => v!=null ? `R$ ${parseFloat(v||0).toFixed(2).replace('.',',')}` : '—';

export default function AdminRelatorios() {
  const [tipo,      setTipo]      = useState('');
  const [filtro,    setFiltro]    = useState({ inicio:primeiroDiaMes, fim:hoje });
  const [mesSel,    setMesSel]    = useState(mesAtual);
  const [dados,     setDados]     = useState([]);
  const [carregando,setCarregando]= useState(false);
  const [gerado,    setGerado]    = useState(false);
  const [erro,      setErro]      = useState('');

  const gerar = async () => {
    if (!tipo) return setErro('Selecione o tipo de relatório.');
    setErro(''); setCarregando(true); setGerado(false);
    try {
      let url;
      if (tipo === 'aniversariantes') {
        // UC14E: todos os clientes, sem filtro de mês
        url = '/relatorios/aniversariantes';
      } else if (tipo === 'aniversariantes-mes') {
        // Aniversariantes de um mês específico
        url = `/relatorios/aniversariantes?mes=${parseInt(mesSel)}`;
      } else {
        // Relatórios com período — adiciona T00:00:00/T23:59:59 para capturar dia inteiro
        url = `/relatorios/${tipo}?inicio=${filtro.inicio}T00:00:00&fim=${filtro.fim}T23:59:59`;
      }
      const r = await api.get(url);
      setDados(r.data);
      setGerado(true);
    } catch (err) {
      setErro('Erro ao gerar relatório.');
    } finally { setCarregando(false); }
  };

  const tipoAtual = TIPOS.find(t => t.id === tipo);

  const renderCelula = (row, col) => {
    const c = col.toLowerCase();
    if (c==='data')          return row.data ? new Date(row.data).toLocaleDateString('pt-BR') : '—';
    if (c==='pedidos')       return row.total_pedidos ?? row.quantidade ?? '—';
    if (c==='receita')       return fmt(row.receita_total ?? row.receita);
    if (c==='receita total') return fmt(row.receita_total);
    if (c==='total gasto')   return fmt(row.valor_total);
    if (c.includes('qtd'))   return row.total_vendido ?? row.unidades_vendidas ?? '—';
    if (c==='produto')       return row.nome ?? '—';
    if (c==='categoria')     return row.categoria ?? '—';
    if (c==='cliente' || c==='nome') return row.nome_completo ?? '—';
    if (c==='telefone')      return row.telefone ?? '—';
    if (c==='aniversário')   return row.aniversario ?? '—';
    if (c.includes('último'))return row.ultimo_pedido ? new Date(row.ultimo_pedido).toLocaleDateString('pt-BR') : '—';
    return '—';
  };

  return (
    <div>
      <h1 style={s.titulo}>📊 Relatórios Gerenciais</h1>

      {/* Filtros */}
      <div style={s.painel}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Tipo de Relatório</label>
          <select value={tipo} style={s.select}
            onChange={e=>{setTipo(e.target.value);setDados([]);setGerado(false);}}>
            <option value="">Selecione...</option>
            {TIPOS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {/* Filtro de período (apenas para relatórios que precisam) */}
        {tipoAtual?.precisaPeriodo && (
          <>
            <div style={s.filtroGrupo}>
              <label style={s.label}>Data Inicial</label>
              <input type="date" value={filtro.inicio} style={s.inputData}
                onChange={e=>setFiltro({...filtro,inicio:e.target.value})}/>
            </div>
            <div style={s.filtroGrupo}>
              <label style={s.label}>Data Final</label>
              <input type="date" value={filtro.fim} style={s.inputData}
                onChange={e=>setFiltro({...filtro,fim:e.target.value})}/>
            </div>
          </>
        )}

        {/* Filtro de mês (apenas para aniversariantes do mês) */}
        {tipo === 'aniversariantes-mes' && (
          <div style={s.filtroGrupo}>
            <label style={s.label}>Mês</label>
            <select value={mesSel} style={s.inputData}
              onChange={e=>setMesSel(e.target.value)}>
              {MESES.map(m=>(
                <option key={m.split('-')[0]} value={m.split('-')[0]}>
                  {m.split('-')[1]}
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={gerar} disabled={carregando} style={s.btnGerar}>
          {carregando ? 'Gerando...' : '🔍 Gerar'}
        </button>
      </div>

      {erro && <div style={s.alerta}>{erro}</div>}

      {/* Resultado */}
      {gerado && (
        <div style={s.resultado}>
          <div style={s.resultHeader}>
            <div>
              <h2 style={s.resultTitulo}>{tipoAtual?.label}</h2>
              <p style={s.resultSub}>{dados.length} registro(s)</p>
            </div>
          </div>

          {dados.length === 0 ? (
            <div style={s.vazio}>
              <p style={{fontSize:'2.5rem'}}>📭</p>
              <p>Nenhum dado encontrado.</p>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.tabela}>
                <thead><tr style={s.thead}>
                  {tipoAtual?.colunas.map(c=><th key={c} style={s.th}>{c}</th>)}
                </tr></thead>
                <tbody>
                  {dados.map((row,i)=>(
                    <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                      {tipoAtual?.colunas.map(col=>(
                        <td key={col} style={s.td}>{renderCelula(row,col)}</td>
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

const s={titulo:{color:'#1e3a8a',margin:'0 0 1.5rem',fontSize:'1.6rem',fontWeight:'700'},painel:{display:'flex',gap:'1rem',alignItems:'flex-end',backgroundColor:'#fff',padding:'1.5rem',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'1.5rem',flexWrap:'wrap'},filtroGrupo:{display:'flex',flexDirection:'column',gap:'0.3rem'},label:{fontWeight:'600',color:'#374151',fontSize:'0.85rem'},select:{padding:'0.65rem 1rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem',minWidth:'240px'},inputData:{padding:'0.65rem 0.875rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'},btnGerar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.7rem 1.5rem',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'0.9rem',alignSelf:'flex-end'},alerta:{backgroundColor:'#fee2e2',color:'#dc2626',padding:'0.875rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.9rem'},resultado:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'},resultHeader:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'},resultTitulo:{color:'#1e3a8a',margin:'0 0 0.25rem',fontSize:'1.1rem',fontWeight:'700'},resultSub:{color:'#64748b',margin:0,fontSize:'0.85rem'},vazio:{textAlign:'center',padding:'3rem',color:'#64748b',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem',whiteSpace:'nowrap'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9',color:'#374151'}};
