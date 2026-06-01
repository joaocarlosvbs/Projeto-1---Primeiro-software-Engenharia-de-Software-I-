// AdminDashboard.jsx — Painel Admin com gráficos (recharts)
// Para instalar recharts: npm install recharts (na pasta frontend)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

// ── Cores dos gráficos ──────────────────────────────────────
const COR_STATUS = {
  'Aguardando':  '#f59e0b',
  'Em Produção': '#3b82f6',
  'Finalizado':  '#10b981',
  'Entregue':    '#6b7280',
};
const COR_BARRAS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

// ── Atalhos do menu admin ───────────────────────────────────
const ATALHOS = [
  { to: '/admin/produtos',     label: 'Produtos',       icone: '🧵' },
  { to: '/admin/fornecedores', label: 'Fornecedores',   icone: '🏭' },
  { to: '/admin/materiaprima', label: 'Matéria-Prima',  icone: '📦' },
  { to: '/admin/compras',      label: 'Compras',        icone: '🛒' },
  { to: '/admin/clientes',     label: 'Clientes',       icone: '👤' },
  { to: '/admin/usuarios',     label: 'Permissões',     icone: '🔑' },
  { to: '/admin/financeiro',   label: 'Fluxo de Caixa', icone: '💸' },
  { to: '/admin/relatorios',   label: 'Relatórios',     icone: '📊' },
  { to: '/admin/logs',         label: 'Logs',           icone: '📋' },
];

const STATUS_OPCOES = ['Aguardando', 'Em Produção', 'Finalizado', 'Entregue'];

const fmt = (v) =>
  `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

// ── Tooltip customizado para o gráfico de pizza ─────────────
const TooltipPizza = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={s.tooltip}>
        <strong>{payload[0].name}</strong>
        <br />
        {payload[0].value} pedido(s)
      </div>
    );
  }
  return null;
};

// ── Tooltip customizado para o gráfico de barras ────────────
const TooltipBarra = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={s.tooltip}>
        <strong>{label}</strong>
        <br />
        {payload[0].value} unidade(s) vendida(s)
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);
  const [filtro, setFiltro] = useState({ inicio: '', fim: '' });

  useEffect(() => { carregar(); }, []);

  const carregar = async (ini, fim) => {
    setCarregando(true);
    try {
      // Corrige o horário para capturar o dia inteiro
      const params = ini && fim
        ? `?inicio=${ini}T00:00:00&fim=${fim}T23:59:59`
        : '';
      const [dashRes, pedidosRes] = await Promise.all([
        api.get(`/financeiro/dashboard${params}`),
        api.get('/pedidos'),
      ]);
      setDados(dashRes.data);
      setPedidos(pedidosRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    if (filtro.inicio && filtro.fim) carregar(filtro.inicio, filtro.fim);
  };

  const atualizarStatus = async (id, novoStatus) => {
    setAtualizando(id);
    try {
      await api.put(`/pedidos/${id}/status`, { status: novoStatus });
      carregar(filtro.inicio, filtro.fim);
    } catch {
      alert('Erro ao atualizar status.');
    } finally {
      setAtualizando(null);
    }
  };

  // Dados para o gráfico de pizza (status dos pedidos)
  const dadosPizza = dados?.pedidos_por_status?.map(p => ({
    name: p.status,
    value: parseInt(p.quantidade),
  })) || [];

  // Dados para o gráfico de barras (top produtos)
  const dadosBarras = (dados?.top_produtos || []).map(p => ({
    nome: p.nome.length > 18 ? p.nome.slice(0, 16) + '…' : p.nome,
    vendas: parseInt(p.total_vendido),
  }));

  return (
    <div style={s.page}>

      {/* ── Cabeçalho ─────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>⚙️ Painel Administrativo</h1>
          <p style={s.sub}>Visão geral do negócio em tempo real</p>
        </div>

        {/* Filtro de período */}
        <form onSubmit={handleFiltrar} style={s.filtroRow}>
          <input type="date" value={filtro.inicio}
            onChange={e => setFiltro({ ...filtro, inicio: e.target.value })}
            style={s.inputData} />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>até</span>
          <input type="date" value={filtro.fim}
            onChange={e => setFiltro({ ...filtro, fim: e.target.value })}
            style={s.inputData} />
          <button type="submit" style={s.btnFiltrar}>Filtrar</button>
          <button type="button" style={s.btnLimpar}
            onClick={() => { setFiltro({ inicio: '', fim: '' }); carregar(); }}>
            Limpar
          </button>
        </form>
      </div>

      {carregando ? (
        <div style={s.loading}><div style={s.spinner} />Carregando...</div>
      ) : (
        <>
          {/* ── Cards KPI ─────────────────────────────────── */}
          <div style={s.kpiRow}>
            {[
              { label: 'Receita',       valor: fmt(dados?.receita),  cor: '#10b981', bg: '#d1fae5', icone: '💰' },
              { label: 'Despesas',      valor: fmt(dados?.despesa),  cor: '#ef4444', bg: '#fee2e2', icone: '📤' },
              { label: 'Lucro Líquido', valor: fmt(dados?.lucro),
                cor: (dados?.lucro || 0) >= 0 ? '#1d4ed8' : '#dc2626',
                bg:  (dados?.lucro || 0) >= 0 ? '#dbeafe' : '#fee2e2', icone: '📈' },
              { label: 'Total Pedidos', valor: pedidos.length,       cor: '#7c3aed', bg: '#ede9fe', icone: '📦' },
            ].map(k => (
              <div key={k.label} style={{ ...s.kpiCard, borderTop: `4px solid ${k.cor}` }}>
                <div style={s.kpiTop}>
                  <span style={s.kpiIcone}>{k.icone}</span>
                  <span style={{ ...s.kpiValor, color: k.cor }}>{k.valor}</span>
                </div>
                <span style={s.kpiLabel}>{k.label}</span>
              </div>
            ))}
          </div>

          {/* ── Alertas de estoque ────────────────────────── */}
          {dados?.alertas_estoque?.length > 0 && (
            <div style={s.alerta}>
              <span style={s.alertaTitulo}>⚠️ Estoque Crítico:</span>
              {dados.alertas_estoque.map(a => (
                <span key={a.nome} style={s.alertaBadge}>
                  {a.nome}: {parseFloat(a.quantidade_atual).toFixed(1)} / {parseFloat(a.estoque_minimo).toFixed(1)} {a.unidade_medida}
                </span>
              ))}
            </div>
          )}

          {/* ── Gráficos ──────────────────────────────────── */}
          <div style={s.graficosRow}>

            {/* Pizza — Pedidos por status */}
            <div style={s.graficoCard}>
              <h3 style={s.graficoTitulo}>Pedidos por Status</h3>
              {dadosPizza.length === 0 ? (
                <p style={s.semDados}>Sem pedidos registrados</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${value}`}
                    >
                      {dadosPizza.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={COR_STATUS[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipPizza />} />
                    <Legend
                      formatter={(v) => (
                        <span style={{ fontSize: '0.8rem', color: '#374151' }}>{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Barras — Top Produtos */}
            <div style={s.graficoCard}>
              <h3 style={s.graficoTitulo}>Produtos Mais Vendidos</h3>
              {dadosBarras.length === 0 ? (
                <p style={s.semDados}>Sem vendas no período</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dadosBarras} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<TooltipBarra />} />
                    <Bar dataKey="vendas" radius={[6, 6, 0, 0]}>
                      {dadosBarras.map((_, i) => (
                        <Cell key={i} fill={COR_BARRAS[i % COR_BARRAS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Atalhos rápidos ───────────────────────────── */}
          <div style={s.atalhos}>
            {ATALHOS.map(a => (
              <Link key={a.to} to={a.to} style={s.atalho}>
                <span style={s.atalhoIcone}>{a.icone}</span>
                <span style={s.atalhoLabel}>{a.label}</span>
              </Link>
            ))}
          </div>

          {/* ── Fila de Pedidos ───────────────────────────── */}
          <div style={s.tabelaCard}>
            <h2 style={s.secaoTitulo}>📋 Fila de Pedidos</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.tabela}>
                <thead>
                  <tr style={s.thead}>
                    {['#', 'Cliente', 'Data', 'Valor Total', 'Status', 'Alterar Status'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Nenhum pedido registrado ainda.
                      </td>
                    </tr>
                  ) : pedidos.map((p, i) => (
                    <tr key={p.id}
                      style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={s.td}>
                        <span style={s.pedidoNum}>#{p.id}</span>
                      </td>
                      <td style={s.td}>{p.cliente}</td>
                      <td style={s.td}>
                        {new Date(p.data_pedido).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ ...s.td, fontWeight: 'bold', color: '#f97316' }}>
                        {fmt(p.valor_total)}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusBadge,
                          backgroundColor: (COR_STATUS[p.status] || '#94a3b8') + '22',
                          color: COR_STATUS[p.status] || '#94a3b8',
                          border: `1px solid ${COR_STATUS[p.status] || '#94a3b8'}44`,
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <select
                          value={p.status}
                          disabled={atualizando === p.id}
                          onChange={e => atualizarStatus(p.id, e.target.value)}
                          style={s.select}
                        >
                          {STATUS_OPCOES.map(op => (
                            <option key={op}>{op}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Estilos ─────────────────────────────────────────────────
const s = {
  page:     { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' },
  titulo:   { color: '#1e3a8a', margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: '700' },
  sub:      { color: '#64748b', margin: 0, fontSize: '0.9rem' },
  filtroRow:{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  inputData:{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#374151' },
  btnFiltrar:{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  btnLimpar: { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  loading:  { textAlign: 'center', padding: '4rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  spinner:  { width: '36px', height: '36px', border: '3px solid #dbeafe', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  kpiRow:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' },
  kpiCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  kpiTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  kpiIcone: { fontSize: '1.75rem' },
  kpiValor: { fontSize: '1.5rem', fontWeight: '800' },
  kpiLabel: { color: '#64748b', fontSize: '0.85rem', fontWeight: '600' },

  alerta:      { backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  alertaTitulo:{ fontWeight: '700', color: '#92400e', whiteSpace: 'nowrap' },
  alertaBadge: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.82rem', color: '#92400e' },

  graficosRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' },
  graficoCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  graficoTitulo:{ color: '#1e3a8a', margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: '700' },
  semDados:    { color: '#94a3b8', textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' },
  tooltip:     { backgroundColor: '#1e3a8a', color: '#fff', padding: '0.5rem 0.875rem', borderRadius: '8px', fontSize: '0.85rem' },

  atalhos:  { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  atalho:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', textDecoration: 'none', minWidth: '80px', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  atalhoIcone:{ fontSize: '1.4rem' },
  atalhoLabel:{ fontSize: '0.78rem', color: '#374151', fontWeight: '600', textAlign: 'center' },

  tabelaCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  secaoTitulo: { color: '#1e3a8a', margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700' },
  tabela:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  thead:       { backgroundColor: '#1e3a8a' },
  th:          { padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  td:          { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
  pedidoNum:   { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' },
  statusBadge: { padding: '0.25rem 0.7rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  select:      { padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff' },
};
