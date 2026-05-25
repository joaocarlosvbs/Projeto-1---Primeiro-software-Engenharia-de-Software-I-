const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/compras.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.use(verificarToken, apenasAdmin);
router.get('/', ctrl.listar);
router.post('/', ctrl.registrar);
module.exports = router;
