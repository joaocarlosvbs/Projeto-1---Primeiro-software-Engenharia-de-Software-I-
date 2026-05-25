const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/materiaprima.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.use(verificarToken, apenasAdmin);
router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
module.exports = router;
