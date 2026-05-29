// AdminLogs.jsx — UC15: Consultar Logs de Auditoria
import { useState, useEffect } from 'react';
import api from '../services/api';
import BotaoVoltar from '../components/BotaoVoltar';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async (params = '') => {
    setCarregando(true);
    try {
      const r = await api.get(`/logs${params}`);
      setLogs(r.data);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  const ACOES = [...new Set(logs.map(l => l.acao))];

  const filtrados = logs.filter(l => {
    const buscaOk = !busca ||
      l.detalhes.toLowerCase().includes(busca.toLowerCase()) ||
      (l.usuario_nome || '').toLowerCase().includes(busca.toLowerCase());
    const acaoOk = !filtroAcao || l.acao === filtroAcao;
    return buscaOk && acaoOk;
  });

  const COR_ACAO = {
    'LOGIN':             { bg:'#dbeafe', cor:'#1e40af' },
    'ATUALIZAR_PEDIDO':  { bg:'#d1fae5', cor:'#065f46' },
    'EXCLUSAO_LGPD':     { bg:'#fee2e2', cor:'#dc2626' },
    'ALTERAR_PERMISSAO': { bg:'#fef3c7', cor:'#92400e' },
    'CADASTRO':          { bg:'#f0fdf4', cor:'#166534' },
  };

  return (
    <div style={s.container}>
      <BotaoVoltar para="/admin" />
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>📋 Logs de Auditoria</h1>
          <p style={s.sub}>Histórico completo de ações realizadas no sistema</p>
        </div>
        <button onClick={() => carregar()} style={s.btnAtualizar}>🔄 Atualizar</button>
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        <input type="text" placeholder="🔍 Buscar por usuário ou detalhe..."
          value={busca} onChange={e => setBusca(e.target.value)} style={s.inputBusca}/>
        <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)} style={s.select}>
          <option value="">Todas as ações</option>
          {ACOES.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Contadores */}
      <div style={s.contadores}>
        <span style={s.contador}>{filtrados.length} registro(s)</span>
        {busca || filtroAcao
          ? <button onClick={() => { setBusca(''); setFiltroAcao(''); }} style={s.btnLimpar}>Limpar filtros</button>
          : null}
      </div>

      {carregando ? (
        <p style={s.msg}>Carregando logs...</p>
      ) : filtrados.length === 0 ? (
        <div style={s.vazio}>
          <p style={{fontSize:'2.5rem'}}>📭</p>
          <p>Nenhum log encontrado.</p>
        </div>
      ) : (
        <div style={s.lista}>
          {filtrados.map(log => {
            const cores = COR_ACAO[log.acao] || { bg:'#f3f4f6', cor:'#374151' };
            return (
              <div key={log.id} style={s.logItem}>
                <div style={s.logTopo}>
                  <span style={{ ...s.badgeAcao, backgroundColor:cores.bg, color:cores.cor }}>
                    {log.acao}
                  </span>
                  <span style={s.logData}>
                    {new Date(log.data_hora).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p style={s.logDetalhe}>{log.detalhes}</p>
                {log.usuario_nome && (
                  <p style={s.logUsuario}>👤 {log.usuario_nome}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth:'1000px', margin:'0 auto', padding:'2rem 1.5rem' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  titulo: { color:'#1e3a8a', margin:'0 0 0.25rem' },
  sub: { color:'#64748b', fontSize:'0.95rem', margin:0 },
  btnAtualizar: { backgroundColor:'#f0f4ff', color:'#1e3a8a', border:'1.5px solid #bfdbfe', padding:'0.5rem 1rem', borderRadius:'8px', fontWeight:'600', cursor:'pointer' },
  filtros: { display:'flex', gap:'0.75rem', marginBottom:'1rem', flexWrap:'wrap' },
  inputBusca: { padding:'0.65rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', flex:'1', minWidth:'200px' },
  select: { padding:'0.65rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', backgroundColor:'#fff' },
  contadores: { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' },
  contador: { fontSize:'0.9rem', color:'#64748b' },
  btnLimpar: { backgroundColor:'transparent', color:'#f97316', border:'1px solid #fed7aa', borderRadius:'6px', padding:'0.25rem 0.75rem', cursor:'pointer', fontSize:'0.85rem' },
  msg: { color:'#64748b', textAlign:'center', padding:'2rem' },
  vazio: { textAlign:'center', padding:'3rem', color:'#64748b', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' },
  lista: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  logItem: { backgroundColor:'#fff', borderRadius:'10px', padding:'1rem 1.25rem', boxShadow:'0 1px 6px rgba(0,0,0,0.06)', borderLeft:'3px solid #1e3a8a' },
  logTopo: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.5rem' },
  badgeAcao: { padding:'0.2rem 0.7rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'700', letterSpacing:'0.3px' },
  logData: { fontSize:'0.83rem', color:'#94a3b8' },
  logDetalhe: { color:'#374151', fontSize:'0.92rem', margin:'0 0 0.25rem' },
  logUsuario: { color:'#64748b', fontSize:'0.83rem', margin:0 },
};
