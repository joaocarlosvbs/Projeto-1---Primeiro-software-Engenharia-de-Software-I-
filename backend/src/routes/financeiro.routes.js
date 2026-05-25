const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financeiro.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.use(verificarToken, apenasAdmin);
router.get('/dashboard', ctrl.dashboard);
router.get('/fluxo-caixa', ctrl.fluxoCaixa);
module.exports = router;
