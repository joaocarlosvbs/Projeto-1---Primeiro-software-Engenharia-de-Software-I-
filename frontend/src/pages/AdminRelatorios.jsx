// AdminRelatorios.jsx — UC14A–E com filtro de data corrigido
import { useState } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const hoje = new Date().toISOString().split('T')[0];
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

const TIPOS = [
  { id: 'vendas-periodo',  label: '📅 Vendas por Período',          colunas: ['Data','Pedidos','Receita'] },
  { id: 'lucro-produto',   label: '💰 Lucro por Produto',           colunas: ['Produto','Qtd Vendida','Receita Total'] },
  { id: 'mais-vendidos',   label: '🏆 Mais Vendidos (Curva ABC)',   colunas: ['Produto','Categoria','Qtd Vendida','Receita'] },
  { id: 'vendas-cliente',  label: '👤 Vendas por Cliente',          colunas: ['Cliente','Telefone','Pedidos','Total Gasto','Último Pedido'] },
  { id: 'aniversariantes', label: '📋 Clientes Cadastrados',        colunas: ['Nome','Telefone'] },
];

const fmt = (v) => v != null ? `R$ ${parseFloat(v||0).toFixed(2).replace('.', ',')}` : '—';

export default function AdminRelatorios() {
  const [tipo, setTipo] = useState('');
  const [filtro, setFiltro] = useState({ inicio: primeiroDiaMes, fim: hoje });
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [gerado, setGerado] = useState(false);
  const [erro, setErro] = useState('');

  const gerar = async () => {
    if (!tipo) return setErro('Selecione o tipo de relatório.');
    setErro(''); setCarregando(true); setGerado(false);
    try {
      // ── CORREÇÃO DO FILTRO DE DATA ────────────────────────
      // Adiciona horário para capturar o dia inteiro:
      // início: 00:00:00 (começo do dia)
      // fim:    23:59:59 (final do dia, incluindo registros da tarde/noite)
      const params = `?inicio=${filtro.inicio}T00:00:00&fim=${filtro.fim}T23:59:59`;
      const r = await api.get(`/relatorios/${tipo}${params}`);
      setDados(r.data);
      setGerado(true);
    } catch (err) {
      setErro('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setCarregando(false); }
  };

  const tipoAtual = TIPOS.find(t => t.id === tipo);

  // Renderiza o valor correto de cada célula conforme a coluna
  const renderCelula = (row, col) => {
    const c = col.toLowerCase();
    if (c === 'data')          return row.data ? new Date(row.data).toLocaleDateString('pt-BR') : '—';
    if (c === 'pedidos')       return row.total_pedidos ?? row.quantidade ?? '—';
    if (c === 'receita')       return fmt(row.receita_total ?? row.receita);
    if (c === 'receita total') return fmt(row.receita_total);
    if (c === 'total gasto')   return fmt(row.valor_total);
    if (c.includes('qtd'))     return row.total_vendido ?? row.unidades_vendidas ?? '—';
    if (c === 'produto')       return row.nome ?? '—';
    if (c === 'categoria')     return row.categoria ?? '—';
    if (c === 'cliente')       return row.nome_completo ?? '—';
    if (c === 'nome')          return row.nome_completo ?? '—';
    if (c === 'telefone')      return row.telefone ?? '—';
    if (c.includes('último'))  return row.ultimo_pedido ? new Date(row.ultimo_pedido).toLocaleDateString('pt-BR') : '—';
    return '—';
  };

  const totalReceita = dados
    .reduce((acc, row) => acc + parseFloat(row.receita_total ?? row.receita ?? row.valor_total ?? 0), 0);

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>📊 Relatórios Gerenciais</h1>

      {/* ── Painel de filtros ────────────────────────────── */}
      <div style={s.painel}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Tipo de Relatório</label>
          <select value={tipo} style={s.select}
            onChange={e => { setTipo(e.target.value); setDados([]); setGerado(false); }}>
            <option value="">Selecione...</option>
            {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div style={s.filtroGrupo}>
          <label style={s.label}>Data Inicial</label>
          <input type="date" value={filtro.inicio} style={s.inputData}
            onChange={e => setFiltro({ ...filtro, inicio: e.target.value })} />
        </div>

        <div style={s.filtroGrupo}>
          <label style={s.label}>Data Final</label>
          <input type="date" value={filtro.fim} style={s.inputData}
            onChange={e => setFiltro({ ...filtro, fim: e.target.value })} />
        </div>

        <button onClick={gerar} disabled={carregando} style={s.btnGerar}>
          {carregando ? 'Gerando...' : '🔍 Gerar Relatório'}
        </button>
      </div>

      {erro && <div style={s.alerta}>{erro}</div>}

      {/* ── Resultado ─────────────────────────────────────── */}
      {gerado && (
        <div style={s.resultado}>
          <div style={s.resultadoHeader}>
            <div>
              <h2 style={s.resultadoTitulo}>{tipoAtual?.label}</h2>
              <p style={s.resultadoSub}>
                {filtro.inicio} até {filtro.fim} — {dados.length} registro(s)
                {totalReceita > 0 && ` — Total: ${fmt(totalReceita)}`}
              </p>
            </div>
          </div>

          {dados.length === 0 ? (
            <div style={s.vazio}>
              <p style={{ fontSize: '2.5rem' }}>📭</p>
              <p>Nenhum dado encontrado para este período.</p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Verifique se existem registros entre {filtro.inicio} e {filtro.fim}.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.tabela}>
                <thead>
                  <tr style={s.thead}>
                    {tipoAtual?.colunas.map(c => (
                      <th key={c} style={s.th}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.map((row, i) => (
                    <tr key={i}
                      style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      {tipoAtual?.colunas.map(col => (
                        <td key={col} style={s.td}>
                          {renderCelula(row, col)}
                        </td>
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
  page:    { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  titulo:  { color: '#1e3a8a', margin: '0 0 1.5rem', fontSize: '1.6rem', fontWeight: '700' },
  painel:  { display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filtroGrupo: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label:   { fontWeight: '600', color: '#374151', fontSize: '0.85rem' },
  select:  { padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', backgroundColor: '#fff', minWidth: '240px' },
  inputData:{ padding: '0.65rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#374151' },
  btnGerar:{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', alignSelf: 'flex-end' },
  alerta:  { backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.875rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  resultado:{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  resultadoHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' },
  resultadoTitulo:{ color: '#1e3a8a', margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: '700' },
  resultadoSub:   { color: '#64748b', margin: 0, fontSize: '0.85rem' },
  vazio:   { textAlign: 'center', padding: '3rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  tabela:  { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  thead:   { backgroundColor: '#1e3a8a' },
  th:      { padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  td:      { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#374151' },
};
