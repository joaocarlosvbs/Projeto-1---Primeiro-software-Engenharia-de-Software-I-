// AdminDashboard.jsx — UC12: Dashboard financeiro completo
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);
  const [filtro, setFiltro] = useState({ inicio: '', fim: '' });

  useEffect(() => { carregar(); }, []);

  const carregar = async (inicio, fim) => {
    setCarregando(true);
    try {
      const params = inicio && fim ? `?inicio=${inicio}&fim=${fim}` : '';
      const [dashRes, pedidosRes] = await Promise.all([
        api.get(`/financeiro/dashboard${params}`),
        api.get('/pedidos'),
      ]);
      setDados(dashRes.data);
      setPedidos(pedidosRes.data);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregar(filtro.inicio, filtro.fim);
  };

  const atualizarStatus = async (id, novoStatus) => {
    setAtualizando(id);
    try {
      await api.put(`/pedidos/${id}/status`, { status: novoStatus });
      carregar(filtro.inicio, filtro.fim);
    } catch { alert('Erro ao atualizar status.'); }
    finally { setAtualizando(null); }
  };

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;
  const STATUS_CORES = { 'Aguardando': '#fef3c7', 'Em Produção': '#dbeafe', 'Finalizado': '#d1fae5', 'Entregue': '#f3f4f6' };
  const STATUS_OPCOES = ['Aguardando', 'Em Produção', 'Finalizado', 'Entregue'];

  return (
    <div style={s.container}>
      <h1 style={s.titulo}>⚙️ Painel Administrativo</h1>

      {/* Filtro de período */}
      <form onSubmit={handleFiltrar} style={s.filtroRow}>
        <input type="date" value={filtro.inicio} onChange={e => setFiltro({...filtro, inicio: e.target.value})} style={s.inputData} />
        <span style={{color:'#666'}}>até</span>
        <input type="date" value={filtro.fim} onChange={e => setFiltro({...filtro, fim: e.target.value})} style={s.inputData} />
        <button type="submit" style={s.btnFiltrar}>Filtrar</button>
        <button type="button" onClick={() => { setFiltro({inicio:'',fim:''}); carregar(); }} style={s.btnLimpar}>Mês atual</button>
      </form>

      {carregando ? <p style={{color:'#666'}}>Carregando...</p> : dados && (
        <>
          {/* Cards financeiros — UC12 */}
          <div style={s.cards}>
            {[
              { label: 'Receita Total', valor: fmt(dados.receita), bg: '#d1fae5', cor: '#065f46', icone: '💰' },
              { label: 'Despesas', valor: fmt(dados.despesa), bg: '#fee2e2', cor: '#dc2626', icone: '📤' },
              { label: 'Lucro Líquido', valor: fmt(dados.lucro), bg: dados.lucro >= 0 ? '#dbeafe' : '#fee2e2', cor: dados.lucro >= 0 ? '#1e40af' : '#dc2626', icone: '📊' },
              { label: 'Total Pedidos', valor: pedidos.length, bg: '#f0f4ff', cor: '#1e3a8a', icone: '📦' },
            ].map(c => (
              <div key={c.label} style={{...s.card, backgroundColor: c.bg}}>
                <span style={{fontSize:'2rem'}}>{c.icone}</span>
                <strong style={{fontSize:'1.5rem', color: c.cor}}>{c.valor}</strong>
                <span style={{color:'#555', fontSize:'0.9rem'}}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Alertas de estoque */}
          {dados.alertas_estoque?.length > 0 && (
            <div style={s.alerta}>
              <strong>⚠️ Alertas de Estoque Crítico:</strong>
              {dados.alertas_estoque.map(a => (
                <span key={a.nome} style={s.alertaItem}>
                  {a.nome}: {a.quantidade_atual}/{a.estoque_minimo} {a.unidade_medida}
                </span>
              ))}
            </div>
          )}

          {/* Top produtos */}
          {dados.top_produtos?.length > 0 && (
            <div style={s.secao}>
              <h2 style={s.secaoTitulo}>🏆 Produtos Mais Vendidos</h2>
              <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                {dados.top_produtos.map((p, i) => (
                  <div key={p.nome} style={s.topItem}>
                    <span style={s.topNum}>#{i+1}</span>
                    <span style={{fontWeight:'600'}}>{p.nome}</span>
                    <span style={{color:'#f97316'}}>{p.total_vendido} un</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Atalhos */}
      <div style={s.atalhos}>
        {[
          {to:'/admin/produtos', label:'🧵 Produtos'},
          {to:'/admin/fornecedores', label:'🏭 Fornecedores'},
          {to:'/admin/materiaprima', label:'📦 Matéria-Prima'},
          {to:'/admin/compras', label:'🛒 Compras'},
          {to:'/admin/clientes', label:'👤 Clientes'},
          {to:'/admin/usuarios', label:'🔑 Permissões'},
          {to:'/admin/financeiro', label:'💸 Fluxo de Caixa'},
          {to:'/admin/relatorios', label:'📊 Relatórios'},
        ].map(a => <Link key={a.to} to={a.to} style={s.btnAtalho}>{a.label}</Link>)}
      </div>

      {/* Fila de pedidos — UC08 */}
      <h2 style={s.secaoTitulo}>📋 Fila de Pedidos</h2>
      <div style={{overflowX:'auto'}}>
        <table style={s.tabela}>
          <thead>
            <tr style={{backgroundColor:'#1e3a8a', color:'#fff'}}>
              {['#','Cliente','Data','Valor','Status','Alterar'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} style={{backgroundColor: STATUS_CORES[p.status] || '#fff'}}>
                <td style={s.td}>#{p.id}</td>
                <td style={s.td}>{p.cliente}</td>
                <td style={s.td}>{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td style={{...s.td, color:'#f97316', fontWeight:'bold'}}>{fmt(p.valor_total)}</td>
                <td style={{...s.td, fontWeight:'600'}}>{p.status}</td>
                <td style={s.td}>
                  <select value={p.status} disabled={atualizando === p.id}
                    onChange={e => atualizarStatus(p.id, e.target.value)} style={s.select}>
                    {STATUS_OPCOES.map(op => <option key={op}>{op}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  container: {maxWidth:'1200px', margin:'0 auto', padding:'2rem'},
  titulo: {color:'#1e3a8a', marginBottom:'1.5rem'},
  filtroRow: {display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap'},
  inputData: {padding:'0.5rem', borderRadius:'6px', border:'1.5px solid #d1d5db', fontSize:'0.9rem'},
  btnFiltrar: {backgroundColor:'#1e3a8a', color:'#fff', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'},
  btnLimpar: {backgroundColor:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'},
  cards: {display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'1.5rem'},
  card: {flex:'1 1 180px', borderRadius:'12px', padding:'1.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem', textAlign:'center'},
  alerta: {backgroundColor:'#fef3c7', border:'1px solid #f59e0b', borderRadius:'8px', padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center'},
  alertaItem: {backgroundColor:'#fef9c3', border:'1px solid #fcd34d', borderRadius:'6px', padding:'0.25rem 0.6rem', fontSize:'0.85rem'},
  secao: {marginBottom:'1.5rem'},
  secaoTitulo: {color:'#1e3a8a', borderBottom:'2px solid #dbeafe', paddingBottom:'0.5rem', marginBottom:'1rem'},
  topItem: {backgroundColor:'#f0f4ff', borderRadius:'8px', padding:'0.75rem 1rem', display:'flex', gap:'0.5rem', alignItems:'center'},
  topNum: {backgroundColor:'#1e3a8a', color:'#fff', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'bold'},
  atalhos: {display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'2rem'},
  btnAtalho: {backgroundColor:'#f0f4ff', color:'#1e3a8a', padding:'0.5rem 1rem', borderRadius:'8px', textDecoration:'none', fontWeight:'600', border:'1px solid #bfdbfe', fontSize:'0.9rem'},
  tabela: {width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'},
  th: {padding:'0.75rem 1rem', textAlign:'left', fontWeight:'600'},
  td: {padding:'0.75rem 1rem', borderBottom:'1px solid #f3f4f6'},
  select: {padding:'0.3rem', borderRadius:'6px', border:'1px solid #d1d5db', fontSize:'0.85rem', cursor:'pointer'},
};
