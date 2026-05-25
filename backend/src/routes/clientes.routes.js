// clientes.routes.js — Endpoints de clientes
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', apenasAdmin, clientesController.listar);           // UC03 — Admin lista clientes
router.delete('/:id/lgpd', apenasAdmin, clientesController.excluirLGPD); // UC17 — LGPD

module.exports = router;
