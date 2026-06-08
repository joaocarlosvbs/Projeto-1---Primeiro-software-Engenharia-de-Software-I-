// SecaoBordados.jsx — Seção de detalhamentos e acabamentos de bordados
// Importe e use em Home.jsx: <SecaoBordados />

const FUNDOS = [
  {
    nome: 'Aida 14ct Branco',
    desc: 'Ideal para ponto cruz. Malha regular que facilita a contagem dos pontos.',
    cor: '#FAFAFA',
    borda: '#e2e8f0',
    textura: 'grid',
  },
  {
    nome: 'Aida 14ct Creme',
    desc: 'Tom quente e elegante. Realça bordados em tons dourados e pastéis.',
    cor: '#FDF8F0',
    borda: '#e8d5b7',
    textura: 'grid',
  },
  {
    nome: 'Toalha de Algodão',
    desc: 'Base para enxovais e presente de bebê. Macia, absorvente e durável.',
    cor: '#F0F8FF',
    borda: '#bfdbfe',
    textura: 'waffle',
  },
  {
    nome: 'Tecido de Linho',
    desc: 'Sofisticado e resistente. Perfeito para quadros e decoração.',
    cor: '#F5F0E8',
    borda: '#d4b896',
    textura: 'linho',
  },
];

const ESTILOS_LETRA = [
  { nome: 'Cursiva Elegante', exemplo: 'Maria', estilo: { fontFamily: "'Dancing Script', cursive, 'Brush Script MT', cursive", fontSize: '1.8rem', color: '#7c3a5e' } },
  { nome: 'Bastão',           exemplo: 'PEDRO', estilo: { fontFamily: 'Arial Black, sans-serif', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.1em', color: '#1e3a8a' } },
  { nome: 'Script Clássico',  exemplo: 'Ana',   estilo: { fontFamily: "'Pacifico', cursive, Georgia, serif", fontSize: '1.9rem', color: '#3d6b4f', fontStyle: 'italic' } },
  { nome: 'Serifada',         exemplo: 'Lucas', estilo: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '1.6rem', fontWeight: 'bold', color: '#5b0a2a', letterSpacing: '0.05em' } },
];

const ACABAMENTOS = [
  { icone: '🎨', nome: 'Cores Personalizadas', desc: 'Escolha a cor exata do bordado — combinamos com roupas, decoração ou identidade visual.' },
  { icone: '✨', nome: 'Contorno em Relevo',   desc: 'Efeito 3D com pontos cheios que dão profundidade e beleza ao bordado.' },
  { icone: '🌸', nome: 'Motivos Decorativos',  desc: 'Flores, corações, estrelinhas e arabescos ao redor da personalização.' },
  { icone: '📏', nome: 'Tamanho Flexível',      desc: 'Do pequenininho (3 cm) ao grande destaque — adaptamos ao espaço disponível.' },
  { icone: '🔤', nome: 'Fonte Exclusiva',       desc: 'Mais de 10 estilos de letra disponíveis. Escolha o que combina com você.' },
  { icone: '🎀', nome: 'Ornamentos e Laços',   desc: 'Detalhes decorativos opcionais que valorizam ainda mais a peça.' },
];

// SVG simples de textura para cada tipo de fundo
function TexturaFundo({ tipo, cor, borda }) {
  const base = { width: 100, height: 70, rx: 8, fill: cor, stroke: borda, strokeWidth: 1.5 };
  if (tipo === 'grid') return (
    <svg width="100" height="70" viewBox="0 0 100 70">
      <rect {...base}/>
      {[10,20,30,40,50,60,70,80,90].map(x=>(
        <line key={x} x1={x} y1={2} x2={x} y2={68} stroke={borda} strokeWidth={0.5} opacity={0.5}/>
      ))}
      {[10,20,30,40,50,60].map(y=>(
        <line key={y} x1={2} y1={y} x2={98} y2={y} stroke={borda} strokeWidth={0.5} opacity={0.5}/>
      ))}
    </svg>
  );
  if (tipo === 'waffle') return (
    <svg width="100" height="70" viewBox="0 0 100 70">
      <rect {...base}/>
      {[6,18,30,42,54,66,78,90].map(x=>(
        <rect key={x} x={x} y={6} width={8} height={8} rx={1} fill="none" stroke={borda} strokeWidth={0.8} opacity={0.6}/>
      ))}
      {[6,18,30,42,54,66,78,90].map(x=>(
        <rect key={x+'b'} x={x} y={22} width={8} height={8} rx={1} fill="none" stroke={borda} strokeWidth={0.8} opacity={0.6}/>
      ))}
      {[6,18,30,42,54,66,78,90].map(x=>(
        <rect key={x+'c'} x={x} y={38} width={8} height={8} rx={1} fill="none" stroke={borda} strokeWidth={0.8} opacity={0.6}/>
      ))}
      {[6,18,30,42,54,66,78,90].map(x=>(
        <rect key={x+'d'} x={x} y={54} width={8} height={8} rx={1} fill="none" stroke={borda} strokeWidth={0.8} opacity={0.6}/>
      ))}
    </svg>
  );
  // linho
  return (
    <svg width="100" height="70" viewBox="0 0 100 70">
      <rect {...base}/>
      {[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95].map(x=>(
        <line key={x} x1={x} y1={2} x2={x} y2={68} stroke={borda} strokeWidth={0.6} opacity={0.4}/>
      ))}
      {[5,11,17,23,29,35,41,47,53,59,65].map(y=>(
        <line key={y} x1={2} y1={y} x2={98} y2={y} stroke={borda} strokeWidth={1} opacity={0.3}/>
      ))}
    </svg>
  );
}

export default function SecaoBordados() {
  return (
    <section style={s.section}>
      <div style={s.container}>

        {/* Título da seção */}
        <div style={s.tituloWrap}>
          <span style={s.badge}>🧵 Detalhamentos e Acabamentos</span>
          <h2 style={s.titulo}>Personalize cada detalhe do seu bordado</h2>
          <p style={s.subtitulo}>
            Cada peça é única. Escolha o fundo, o estilo da letra e os acabamentos que combinam
            com o seu gosto. Trabalhamos com precisão e carinho em cada ponto.
          </p>
        </div>

        {/* Fundos / Bases disponíveis */}
        <div style={s.blocoTitulo}>
          <span style={s.dot}/>
          <h3 style={s.blocoH}>Fundos e Bases Disponíveis</h3>
        </div>
        <div style={s.gridFundos}>
          {FUNDOS.map(f => (
            <div key={f.nome} style={{...s.cardFundo, borderColor: f.borda}}>
              <div style={s.texturaWrap}>
                <TexturaFundo tipo={f.textura} cor={f.cor} borda={f.borda}/>
              </div>
              <div style={s.cardFundoBody}>
                <strong style={s.cardFundoNome}>{f.nome}</strong>
                <p style={s.cardFundoDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Estilos de letra */}
        <div style={s.blocoTitulo}>
          <span style={s.dot}/>
          <h3 style={s.blocoH}>Estilos de Letra para Nomes e Frases</h3>
        </div>
        <div style={s.gridLetras}>
          {ESTILOS_LETRA.map(e => (
            <div key={e.nome} style={s.cardLetra}>
              <div style={s.exemploLetra}>
                <span style={e.estilo}>{e.exemplo}</span>
              </div>
              <div style={s.cardLetraLabel}>{e.nome}</div>
            </div>
          ))}
        </div>
        <p style={s.notaLetras}>
          * Outros estilos sob consulta. Envie uma mensagem pelo WhatsApp para ver mais opções!
        </p>

        {/* Acabamentos */}
        <div style={s.blocoTitulo}>
          <span style={s.dot}/>
          <h3 style={s.blocoH}>Acabamentos e Personalizações Especiais</h3>
        </div>
        <div style={s.gridAcabamentos}>
          {ACABAMENTOS.map(a => (
            <div key={a.nome} style={s.cardAcab}>
              <div style={s.acabIcone}>{a.icone}</div>
              <div>
                <div style={s.acabNome}>{a.nome}</div>
                <div style={s.acabDesc}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={s.cta}>
          <p style={s.ctaTexto}>
            Tem alguma ideia especial em mente? Entre em contato e vamos criar juntos!
          </p>
          <a
            href={`https://wa.me/55${import.meta.env.VITE_WHATSAPP||'18999999999'}?text=${encodeURIComponent('Olá! Gostaria de encomendar um bordado personalizado. 🧵')}`}
            target="_blank" rel="noreferrer" style={s.btnWpp}>
            💬 Falar no WhatsApp
          </a>
        </div>

      </div>
    </section>
  );
}

const s = {
  section:     { backgroundColor: '#fff', padding: '5rem 1.5rem' },
  container:   { maxWidth: '1100px', margin: '0 auto' },
  tituloWrap:  { textAlign: 'center', marginBottom: '3rem' },
  badge:       { display: 'inline-block', backgroundColor: '#fdf5f9', color: '#7c3a5e', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1rem', border: '1px solid #f3d0e0' },
  titulo:      { fontSize: '2rem', fontWeight: '700', color: '#1e3a8a', margin: '0 0 1rem' },
  subtitulo:   { color: '#64748b', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 },
  blocoTitulo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', marginTop: '3rem' },
  dot:         { width: '8px', height: '8px', backgroundColor: '#7c3a5e', borderRadius: '50%', flexShrink: 0 },
  blocoH:      { fontSize: '1.1rem', fontWeight: '700', color: '#1e3a8a', margin: 0 },
  gridFundos:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.5rem' },
  cardFundo:   { borderRadius: '12px', border: '1.5px solid', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  texturaWrap: { display: 'flex', justifyContent: 'center', padding: '1rem 1rem 0.5rem', backgroundColor: '#fafafa' },
  cardFundoBody:{ padding: '0.875rem' },
  cardFundoNome:{ display: 'block', fontSize: '0.9rem', color: '#1e3a8a', marginBottom: '0.3rem' },
  cardFundoDesc:{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 },
  gridLetras:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  cardLetra:   { backgroundColor: '#fdf5f9', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', border: '1.5px solid #f3d0e0' },
  exemploLetra:{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' },
  cardLetraLabel:{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' },
  notaLetras:  { fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.75rem', textAlign: 'center' },
  gridAcabamentos:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  cardAcab:    { backgroundColor: '#f8faff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid #e2e8f0' },
  acabIcone:   { fontSize: '1.75rem', flexShrink: 0 },
  acabNome:    { fontWeight: '700', color: '#1e3a8a', fontSize: '0.9rem', marginBottom: '0.25rem' },
  acabDesc:    { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 },
  cta:         { backgroundColor: 'linear-gradient(135deg, #7c3a5e, #1e3a8a)', background: 'linear-gradient(135deg, #7c3a5e 0%, #1e3a8a 100%)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', marginTop: '3rem' },
  ctaTexto:    { color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.95 },
  btnWpp:      { display: 'inline-block', backgroundColor: '#25d366', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem' },
};
