// AdminFluxoCaixa.jsx — UC13 com filtro de data corrigido
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const hoje = new Date().toISOString().split('T')[0];
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

export default function AdminFluxoCaixa() {
  const [transacoes, setTransacoes] = useState([]);
  const [filtro, setFiltro]   = useState({ inicio: primeiroDiaMes, fim: hoje });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(primeiroDiaMes, hoje); }, []);

  const carregar = async (ini, fim) => {
    setCarregando(true);
    try {
      // ── CORREÇÃO DO FILTRO DE DATA ────────────────────────
      // Adiciona T00:00:00 e T23:59:59 para capturar o dia inteiro
      // Sem isso, registros do final do dia ficavam fora do filtro
      const params = ini && fim
        ? `?inicio=${ini}T00:00:00&fim=${fim}T23:59:59`
        : '';
      const r = await api.get(`/financeiro/fluxo-caixa${params}`);
      setTransacoes(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregar(filtro.inicio, filtro.fim);
  };

  const totais = transacoes.reduce(
    (acc, t) => {
      if (t.tipo === 'Receita') acc.receita += parseFloat(t.valor);
      else acc.despesa += parseFloat(t.valor);
      return acc;
    },
    { receita: 0, despesa: 0 }
  );
  const saldo = totais.receita - totais.despesa;

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <h1 style={s.titulo}>💸 Fluxo de Caixa</h1>

      {/* ── Filtro ───────────────────────────────────────── */}
      <form onSubmit={handleFiltrar} style={s.filtroRow}>
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
        <button type="submit" style={s.btnFiltrar}>Filtrar</button>
        <button type="button" style={s.btnLimpar}
          onClick={() => {
            setFiltro({ inicio: primeiroDiaMes, fim: hoje });
            carregar(primeiroDiaMes, hoje);
          }}>
          Mês Atual
        </button>
      </form>

      {/* ── Cards de Resumo ───────────────────────────────── */}
      <div style={s.resumo}>
        {[
          { label: 'Total Entradas', valor: fmt(totais.receita), cor: '#059669', bg: '#d1fae5', icone: '⬆️' },
          { label: 'Total Saídas',   valor: fmt(totais.despesa), cor: '#dc2626', bg: '#fee2e2', icone: '⬇️' },
          { label: 'Saldo do Período', valor: fmt(saldo),
            cor: saldo >= 0 ? '#1d4ed8' : '#dc2626',
            bg:  saldo >= 0 ? '#dbeafe' : '#fee2e2', icone: saldo >= 0 ? '📈' : '📉' },
        ].map(c => (
          <div key={c.label} style={{ ...s.resumoCard, backgroundColor: c.bg, borderLeft: `4px solid ${c.cor}` }}>
            <span style={{ fontSize: '1.5rem' }}>{c.icone}</span>
            <div>
              <div style={{ ...s.resumoValor, color: c.cor }}>{c.valor}</div>
              <div style={s.resumoLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Extrato ───────────────────────────────────────── */}
      <div style={s.tabelaCard}>
        {carregando ? (
          <p style={s.loading}>Carregando transações...</p>
        ) : transacoes.length === 0 ? (
          <div style={s.vazio}>
            <p style={{ fontSize: '2.5rem' }}>📭</p>
            <p>Nenhuma transação encontrada no período selecionado.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.tabela}>
              <thead>
                <tr style={s.thead}>
                  {['Data', 'Tipo', 'Descrição', 'Valor'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t, i) => (
                  <tr key={t.id}
                    style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={s.td}>
                      {new Date(t.data_pagamento).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        backgroundColor: t.tipo === 'Receita' ? '#d1fae5' : '#fee2e2',
                        color:           t.tipo === 'Receita' ? '#065f46' : '#dc2626',
                      }}>
                        {t.tipo === 'Receita' ? '⬆️ Entrada' : '⬇️ Saída'}
                      </span>
                    </td>
                    <td style={s.td}>{t.descricao}</td>
                    <td style={{
                      ...s.td,
                      fontWeight: 'bold',
                      color: t.tipo === 'Receita' ? '#059669' : '#dc2626',
                    }}>
                      {t.tipo === 'Receita' ? '+' : '−'} {fmt(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:      { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' },
  titulo:    { color: '#1e3a8a', margin: '0 0 1.5rem', fontSize: '1.6rem', fontWeight: '700' },
  filtroRow: { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem' },
  filtroGrupo:{ display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label:     { fontWeight: '600', color: '#374151', fontSize: '0.85rem' },
  inputData: { padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#374151' },
  btnFiltrar:{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', alignSelf: 'flex-end' },
  btnLimpar: { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', alignSelf: 'flex-end' },
  resumo:    { display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  resumoCard:{ flex: '1 1 200px', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' },
  resumoValor:{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1.2 },
  resumoLabel:{ fontSize: '0.82rem', color: '#374151', fontWeight: '600', marginTop: '0.15rem' },
  tabelaCard:{ backgroundColor: '#fff', borderRadius: '12px', padding: '0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' },
  loading:   { textAlign: 'center', padding: '2rem', color: '#64748b' },
  vazio:     { textAlign: 'center', padding: '3rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  tabela:    { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  thead:     { backgroundColor: '#1e3a8a' },
  th:        { padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  td:        { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#374151' },
  badge:     { padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem', whiteSpace: 'nowrap' },
};
