const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/consumo.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.use(verificarToken, apenasAdmin);
router.post('/', ctrl.registrar);
router.get('/pedido/:pedido_id', ctrl.listarPorPedido);
module.exports = router;
