// produtos.routes.js — Endpoints do catálogo de produtos
const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');

// Rota PÚBLICA — qualquer visitante pode ver o portfólio (UC04)
router.get('/portfolio', produtosController.listarPortfolio);

// Rotas PRIVADAS — apenas usuários logados
router.get('/', verificarToken, produtosController.listarTodos);
router.post('/', verificarToken, apenasAdmin, produtosController.criar);
router.put('/:id', verificarToken, apenasAdmin, produtosController.atualizar);

module.exports = router;
