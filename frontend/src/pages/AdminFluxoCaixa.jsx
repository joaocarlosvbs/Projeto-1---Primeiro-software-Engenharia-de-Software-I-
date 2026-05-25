// AdminFluxoCaixa.jsx — UC13: Fluxo de Caixa
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminFluxoCaixa() {
  const [transacoes, setTransacoes] = useState([]);
  const [filtro, setFiltro] = useState({ inicio: '', fim: '' });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  const carregar = async (inicio, fim) => {
    setCarregando(true);
    const params = inicio && fim ? `?inicio=${inicio}&fim=${fim}` : '';
    try {
      const r = await api.get(`/financeiro/fluxo-caixa${params}`);
      setTransacoes(r.data);
    } finally { setCarregando(false); }
  };

  const handleFiltrar = (e) => { e.preventDefault(); carregar(filtro.inicio, filtro.fim); };
  const fmt = (v) => `R$ ${parseFloat(v||0).toFixed(2).replace('.', ',')}`;

  const totais = transacoes.reduce((acc, t) => {
    if (t.tipo === 'Receita') acc.receita += parseFloat(t.valor);
    else acc.despesa += parseFloat(t.valor);
    return acc;
  }, { receita: 0, despesa: 0 });

  return (
    <div style={s.container}>
      <h1 style={s.titulo}>💸 Fluxo de Caixa</h1>

      <form onSubmit={handleFiltrar} style={s.filtroRow}>
        <input type="date" value={filtro.inicio} onChange={e => setFiltro({...filtro,inicio:e.target.value})} style={s.inputData}/>
        <span>até</span>
        <input type="date" value={filtro.fim} onChange={e => setFiltro({...filtro,fim:e.target.value})} style={s.inputData}/>
        <button type="submit" style={s.btnFiltrar}>Filtrar</button>
        <button type="button" onClick={() => {setFiltro({inicio:'',fim:''}); carregar();}} style={s.btnLimpar}>Tudo</button>
      </form>

      {/* Resumo */}
      <div style={s.resumo}>
        <div style={{...s.resumoCard, backgroundColor:'#d1fae5'}}>
          <span style={{color:'#065f46', fontSize:'0.85rem'}}>Total Entradas</span>
          <strong style={{color:'#065f46', fontSize:'1.3rem'}}>{fmt(totais.receita)}</strong>
        </div>
        <div style={{...s.resumoCard, backgroundColor:'#fee2e2'}}>
          <span style={{color:'#dc2626', fontSize:'0.85rem'}}>Total Saídas</span>
          <strong style={{color:'#dc2626', fontSize:'1.3rem'}}>{fmt(totais.despesa)}</strong>
        </div>
        <div style={{...s.resumoCard, backgroundColor: totais.receita - totais.despesa >= 0 ? '#dbeafe' : '#fee2e2'}}>
          <span style={{fontSize:'0.85rem'}}>Saldo</span>
          <strong style={{fontSize:'1.3rem'}}>{fmt(totais.receita - totais.despesa)}</strong>
        </div>
      </div>

      {carregando ? <p>Carregando...</p> : (
        <table style={s.tabela}>
          <thead><tr style={{backgroundColor:'#1e3a8a', color:'#fff'}}>
            {['Data','Tipo','Descrição','Valor'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {transacoes.map(t => (
              <tr key={t.id} style={{backgroundColor: t.tipo==='Receita' ? '#f0fdf4' : '#fff5f5'}}>
                <td style={s.td}>{new Date(t.data_pagamento).toLocaleDateString('pt-BR')}</td>
                <td style={s.td}>
                  <span style={{padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600',
                    backgroundColor: t.tipo==='Receita' ? '#d1fae5' : '#fee2e2',
                    color: t.tipo==='Receita' ? '#065f46' : '#dc2626'}}>
                    {t.tipo==='Receita' ? '⬆️ Entrada' : '⬇️ Saída'}
                  </span>
                </td>
                <td style={s.td}>{t.descricao}</td>
                <td style={{...s.td, fontWeight:'bold', color: t.tipo==='Receita' ? '#065f46' : '#dc2626'}}>
                  {t.tipo==='Receita' ? '+' : '-'} {fmt(t.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const s = {
  container:{maxWidth:'1000px',margin:'0 auto',padding:'2rem'},
  titulo:{color:'#1e3a8a',marginBottom:'1.5rem'},
  filtroRow:{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap'},
  inputData:{padding:'0.5rem',borderRadius:'6px',border:'1.5px solid #d1d5db',fontSize:'0.9rem'},
  btnFiltrar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.5rem 1rem',borderRadius:'6px',cursor:'pointer'},
  btnLimpar:{backgroundColor:'#f3f4f6',color:'#374151',border:'1px solid #d1d5db',padding:'0.5rem 1rem',borderRadius:'6px',cursor:'pointer'},
  resumo:{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'},
  resumoCard:{flex:'1 1 180px',borderRadius:'10px',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.25rem'},
  tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},
  th:{padding:'0.75rem 1rem',textAlign:'left'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f3f4f6'},
};
