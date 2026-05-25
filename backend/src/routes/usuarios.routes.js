const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarios.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.use(verificarToken, apenasAdmin);
router.get('/', ctrl.listar);
router.put('/:id/nivel', ctrl.alterarNivel);
module.exports = router;
