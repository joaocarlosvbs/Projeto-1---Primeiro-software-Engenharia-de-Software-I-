// AdminFluxoCaixa.jsx — com lançamento manual de despesas/receitas
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

const hoje = new Date().toISOString().split('T')[0];
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const fmt = v => `R$ ${parseFloat(v||0).toFixed(2).replace('.',',')}`;

export default function AdminFluxoCaixa() {
  const [transacoes, setTransacoes] = useState([]);
  const [filtro,     setFiltro]     = useState({ inicio: primeiroDiaMes, fim: hoje });
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm,setMostrarForm]= useState(false);
  const [novaT,      setNovaT]      = useState({ tipo:'Despesa', descricao:'', valor:'' });
  const [salvando,   setSalvando]   = useState(false);
  const [msg,        setMsg]        = useState('');

  useEffect(() => { carregar(primeiroDiaMes, hoje); }, []);

  const carregar = async (ini, fim) => {
    setCarregando(true);
    try {
      const params = ini && fim ? `?inicio=${ini}T00:00:00&fim=${fim}T23:59:59` : '';
      const r = await api.get(`/financeiro/fluxo-caixa${params}`);
      setTransacoes(r.data);
    } finally { setCarregando(false); }
  };

  const handleFiltrar = e => { e.preventDefault(); carregar(filtro.inicio, filtro.fim); };

  const handleLancar = async e => {
    e.preventDefault(); setSalvando(true); setMsg('');
    try {
      await api.post('/financeiro/lancamento', novaT);
      setMsg('✅ Lançamento registrado!');
      setNovaT({ tipo:'Despesa', descricao:'', valor:'' });
      setMostrarForm(false);
      carregar(filtro.inicio, filtro.fim);
    } catch (err) { setMsg('❌ ' + (err.response?.data?.erro || 'Erro.')); }
    finally { setSalvando(false); }
  };

  const totais = transacoes.reduce(
    (acc, t) => { if(t.tipo==='Receita') acc.receita+=parseFloat(t.valor); else if(t.tipo==='Despesa') acc.despesa+=parseFloat(t.valor); return acc; },
    { receita:0, despesa:0 }
  );
  const saldo = totais.receita - totais.despesa;

  return (
    <div style={s.page}>
      <BotaoVoltar para="/admin" />
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
        <h1 style={s.titulo}>💸 Fluxo de Caixa</h1>
        <button onClick={()=>{setMostrarForm(!mostrarForm);setMsg('');}} style={s.btnLancar}>
          {mostrarForm ? 'Cancelar' : '+ Lançamento Manual'}
        </button>
      </div>

      {/* Formulário de lançamento manual */}
      {mostrarForm && (
        <div style={s.formCard}>
          <h3 style={{color:'#1e3a8a',margin:'0 0 1rem',fontSize:'1rem'}}>Novo Lançamento Manual</h3>
          <p style={{color:'#64748b',fontSize:'0.85rem',margin:'0 0 1rem'}}>Use para registrar despesas avulsas (aluguel, energia, compras pessoais) ou receitas extras não vinculadas a pedidos.</p>
          <form onSubmit={handleLancar} style={s.formRow}>
            <div>
              <label style={s.label}>Tipo</label>
              <select value={novaT.tipo} onChange={e=>setNovaT({...novaT,tipo:e.target.value})} style={s.input}>
                <option>Despesa</option>
                <option>Receita</option>
              </select>
            </div>
            <div style={{flex:2}}>
              <label style={s.label}>Descrição *</label>
              <input type="text" value={novaT.descricao} onChange={e=>setNovaT({...novaT,descricao:e.target.value})} required style={s.input} placeholder="Ex: Conta de luz de maio"/>
            </div>
            <div>
              <label style={s.label}>Valor (R$) *</label>
              <input type="number" step="0.01" min="0.01" value={novaT.valor} onChange={e=>setNovaT({...novaT,valor:e.target.value})} required style={s.input} placeholder="0,00"/>
            </div>
            <button type="submit" disabled={salvando} style={{...s.btnSalvar,alignSelf:'flex-end'}}>
              {salvando?'Salvando...':'Registrar'}
            </button>
          </form>
          {msg && <p style={{marginTop:'0.5rem',fontSize:'0.85rem',color:msg.startsWith('✅')?'#065f46':'#dc2626'}}>{msg}</p>}
        </div>
      )}

      {/* Filtro */}
      <form onSubmit={handleFiltrar} style={s.filtroRow}>
        <input type="date" value={filtro.inicio} style={s.inputData} onChange={e=>setFiltro({...filtro,inicio:e.target.value})}/>
        <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>até</span>
        <input type="date" value={filtro.fim} style={s.inputData} onChange={e=>setFiltro({...filtro,fim:e.target.value})}/>
        <button type="submit" style={s.btnFiltrar}>Filtrar</button>
        <button type="button" style={s.btnLimpar} onClick={()=>{setFiltro({inicio:primeiroDiaMes,fim:hoje});carregar(primeiroDiaMes,hoje);}}>Mês Atual</button>
      </form>

      {/* Cards resumo */}
      <div style={s.resumo}>
        {[
          {label:'Entradas',valor:fmt(totais.receita),cor:'#059669',bg:'#d1fae5',icone:'⬆️'},
          {label:'Saídas',  valor:fmt(totais.despesa),cor:'#dc2626',bg:'#fee2e2',icone:'⬇️'},
          {label:'Saldo',   valor:fmt(saldo),cor:saldo>=0?'#1d4ed8':'#dc2626',bg:saldo>=0?'#dbeafe':'#fee2e2',icone:saldo>=0?'📈':'📉'},
        ].map(c=>(
          <div key={c.label} style={{...s.resumoCard,backgroundColor:c.bg,borderLeft:`4px solid ${c.cor}`}}>
            <span style={{fontSize:'1.5rem'}}>{c.icone}</span>
            <div>
              <div style={{fontSize:'1.3rem',fontWeight:'800',color:c.cor}}>{c.valor}</div>
              <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#374151'}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Extrato */}
      <div style={s.tabelaCard}>
        {carregando ? <p style={s.loading}>Carregando...</p> : transacoes.length===0 ? (
          <div style={s.vazio}><p style={{fontSize:'2rem'}}>📭</p><p>Nenhuma transação no período.</p></div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={s.tabela}>
              <thead><tr style={s.thead}>
                {['Data','Tipo','Descrição','Valor'].map(h=><th key={h} style={s.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {transacoes.map((t,i)=>(
                  <tr key={t.id} style={{backgroundColor:i%2===0?'#fff':'#f8fafc'}}>
                    <td style={s.td}>{new Date(t.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    <td style={s.td}>
                      <span style={{padding:'0.25rem 0.65rem',borderRadius:'20px',fontWeight:'600',fontSize:'0.8rem',backgroundColor:t.tipo==='Receita'?'#d1fae5':t.tipo==='Despesa'?'#fee2e2':'#f3f4f6',color:t.tipo==='Receita'?'#065f46':t.tipo==='Despesa'?'#dc2626':'#374151'}}>
                        {t.tipo==='Receita'?'⬆️ Entrada':t.tipo==='Despesa'?'⬇️ Saída':'↩️ Estorno'}
                      </span>
                    </td>
                    <td style={s.td}>{t.descricao}</td>
                    <td style={{...s.td,fontWeight:'bold',color:t.tipo==='Receita'?'#059669':t.tipo==='Despesa'?'#dc2626':'#374151'}}>
                      {t.tipo==='Receita'?'+':t.tipo==='Despesa'?'−':''} {fmt(t.valor)}
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

const s={page:{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.5rem'},titulo:{color:'#1e3a8a',margin:0,fontSize:'1.6rem',fontWeight:'700'},btnLancar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.6rem 1.25rem',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'0.9rem'},formCard:{backgroundColor:'#fff',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'1.25rem',border:'1px solid #bfdbfe'},formRow:{display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'flex-start'},label:{display:'block',fontWeight:'600',color:'#374151',fontSize:'0.88rem',marginBottom:'0.3rem'},input:{width:'100%',padding:'0.65rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'},btnSalvar:{backgroundColor:'#059669',color:'#fff',border:'none',padding:'0.65rem 1.25rem',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'0.9rem'},filtroRow:{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap',backgroundColor:'#fff',padding:'1rem',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'1.25rem'},inputData:{padding:'0.55rem 0.75rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'},btnFiltrar:{backgroundColor:'#1e3a8a',color:'#fff',border:'none',padding:'0.6rem 1rem',borderRadius:'8px',cursor:'pointer',fontWeight:'600'},btnLimpar:{backgroundColor:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',padding:'0.6rem 1rem',borderRadius:'8px',cursor:'pointer'},resumo:{display:'flex',gap:'1rem',marginBottom:'1.25rem',flexWrap:'wrap'},resumoCard:{flex:'1 1 180px',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',gap:'1rem',alignItems:'center'},tabelaCard:{backgroundColor:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'},loading:{textAlign:'center',padding:'2rem',color:'#64748b'},vazio:{textAlign:'center',padding:'3rem',color:'#64748b',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'},tabela:{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'},thead:{backgroundColor:'#1e3a8a'},th:{padding:'0.75rem 1rem',textAlign:'left',color:'#fff',fontWeight:'600',fontSize:'0.85rem'},td:{padding:'0.75rem 1rem',borderBottom:'1px solid #f1f5f9'}};
