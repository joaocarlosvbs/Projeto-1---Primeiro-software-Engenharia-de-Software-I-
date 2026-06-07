// upload.middleware.js — Detecta ambiente e salva imagem no local correto
// LOCAL (pgAdmin + localhost): salva em backend/uploads/ servido pelo Express
// PRODUÇÃO (Supabase + Render): envia para Supabase Storage (bucket público)

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const usarSupabase = process.env.DB_HOST?.includes('supabase.com');

// ── Armazenamento LOCAL ──────────────────────────────────────
const localDisk = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `produto_${Date.now()}${ext}`);
  },
});

// ── Armazenamento PRODUÇÃO (memória antes de enviar ao Supabase) ──
const memoryStore = multer.memoryStorage();

// ── Filtro de tipo de arquivo ────────────────────────────────
const filtroImagem = (req, file, cb) => {
  const tipos = /jpeg|jpg|png|webp/;
  if (tipos.test(file.mimetype)) cb(null, true);
  else cb(new Error('Apenas imagens JPG, PNG ou WebP são aceitas.'));
};

// ── Instância do multer ──────────────────────────────────────
const upload = multer({
  storage:    usarSupabase ? memoryStore : localDisk,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: filtroImagem,
});

// ── Envia arquivo para o Supabase Storage ───────────────────
// Requer bucket "produto-imagens" criado como público no Supabase
const enviarParaSupabase = async (file) => {
  const nome = `produto_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const resp = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/produto-imagens/${nome}`,
    {
      method: 'POST',
      headers: {
        'Authorization':  `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type':   file.mimetype,
        'x-upsert':       'false',
      },
      body: file.buffer,
    }
  );

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Supabase Storage: ${erro}`);
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/produto-imagens/${nome}`;
};

// ── URL local para desenvolvimento ──────────────────────────
const urlLocal = (filename) =>
  `http://localhost:${process.env.PORT || 3001}/uploads/${filename}`;

module.exports = { upload, enviarParaSupabase, urlLocal, usarSupabase };
