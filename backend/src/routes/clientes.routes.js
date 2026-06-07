const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clientes.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken);
router.get('/',                 apenasAdmin, ctrl.listar);
router.put('/:id',              apenasAdmin, ctrl.editar);
router.put('/:id/aniversario',  apenasAdmin, ctrl.atualizarAniversario);
router.delete('/:id/lgpd',      apenasAdmin, ctrl.excluirLGPD);
module.exports = router;
