// pedidos.routes.js — Endpoints de pedidos
const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');

// Todas as rotas de pedido exigem login
router.use(verificarToken);

router.get('/meus', pedidosController.meusPedidos);          // UC11 — Cliente vê seus pedidos
router.post('/', pedidosController.criar);                    // UC07 — Fazer encomenda
router.get('/', apenasAdmin, pedidosController.listarTodos); // Admin vê todos
router.put('/:id/status', apenasAdmin, pedidosController.atualizarStatus); // UC08

module.exports = router;
