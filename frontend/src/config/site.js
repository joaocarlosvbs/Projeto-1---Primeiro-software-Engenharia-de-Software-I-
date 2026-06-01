// ============================================================
// frontend/src/config/site.js
// ARQUIVO DE CONFIGURAÇÃO CENTRAL DO SITE
// ============================================================
// Para alterar qualquer texto, cor ou dado do site,
// edite APENAS este arquivo. Nenhuma outra página precisa
// ser tocada para mudanças visuais básicas.
// ============================================================

// ── IDENTIDADE DO SITE ──────────────────────────────────────
// Nome que aparece na Navbar, título das páginas e rodapé
export const SITE = {
  nome:      'Ateliê Bordados',        // ← Mude o nome aqui
  slogan:    'Arte bordada com amor',  // ← Frase principal do Hero
  descricao: 'Peças artesanais únicas feitas à mão com carinho e dedicação.',
  // ↑ Subtítulo abaixo do slogan na página inicial

  // Contato (aparece no botão WhatsApp e na página de Contato)
  whatsapp:  '551896284388',          // ← DDI + DDD + número (sem espaços)
  email:     'contato@bordados.com',   // ← E-mail de contato público
  instagram: 'https://instagram.com/seuperfil',
  cidade:    'Cândido Mota — SP',             // ← Aparece no rodapé
};

// ── CATEGORIAS DE PRODUTO ────────────────────────────────────
// Lista de categorias disponíveis no cadastro de produtos (Admin)
// Para adicionar uma nova categoria: basta incluir na lista
// Para remover: apague a linha correspondente
export const CATEGORIAS = [
  'Enxoval Bebê',
  'Decoração',
  'Uniformes',
  'Casa',
  'Vestuário',
  'Acessórios',
  'Kits Presente',
  'Outros',
];

// ── PALETA DE CORES ──────────────────────────────────────────
// Cores principais do sistema.
// Para mudar o visual inteiro: altere os valores hex abaixo.
//
// Dica — sites para escolher cores:
//   coolors.co         → gera paletas completas
//   htmlcolorcodes.com → escolha visual + código hex
//   colorhunt.co       → paletas prontas com bom contraste
//
// COMO FUNCIONA:
//   primaria   → Navbar, cabeçalhos, botões principais
//   secundaria → Botões de destaque (CTA), preços, badges
//   sucesso    → Mensagens de OK, status "Finalizado"
//   erro       → Mensagens de erro, status crítico
//   fundo      → Cor de fundo geral das páginas

export const CORES = {
  primaria:   '#1e3a8a',  // ← Azul escuro (padrão)
  secundaria: '#f97316',  // ← Laranja
  sucesso:    '#059669',  // ← Verde
  erro:       '#dc2626',  // ← Vermelho
  fundo:      '#f0f4ff',  // ← Azul bem claro (fundo das páginas)
};

// ── EXEMPLOS DE PALETAS PRONTAS ──────────────────────────────
// Descomente uma das opções abaixo e comente a atual para testar:

// OPÇÃO VERDE ELEGANTE:
// export const CORES = {
//   primaria:   '#14532d',  // Verde escuro
//   secundaria: '#eab308',  // Amarelo dourado
//   sucesso:    '#059669',
//   erro:       '#dc2626',
//   fundo:      '#f0fdf4',
// };

// OPÇÃO ROXO MODERNO:
// export const CORES = {
//   primaria:   '#4c1d95',  // Roxo escuro
//   secundaria: '#ec4899',  // Rosa
//   sucesso:    '#059669',
//   erro:       '#dc2626',
//   fundo:      '#faf5ff',
// };

// OPÇÃO MARROM ARTESANAL:
// export const CORES = {
//   primaria:   '#78350f',  // Marrom escuro
//   secundaria: '#d97706',  // Âmbar
//   sucesso:    '#059669',
//   erro:       '#dc2626',
//   fundo:      '#fffbeb',
// };
