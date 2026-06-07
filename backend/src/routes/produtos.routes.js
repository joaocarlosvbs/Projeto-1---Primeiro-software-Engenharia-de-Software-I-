const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/produtos.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.get('/portfolio', ctrl.listarPortfolio);
router.get('/',          verificarToken, apenasAdmin, ctrl.listarTodos);
router.post('/',         verificarToken, apenasAdmin, ctrl.criar);
router.put('/:id',       verificarToken, apenasAdmin, ctrl.atualizar);
router.delete('/:id',    verificarToken, apenasAdmin, ctrl.excluir);

// Imagem
router.post('/:id/imagem',   verificarToken, apenasAdmin, upload.single('imagem'), ctrl.uploadImagem);
router.delete('/:id/imagem', verificarToken, apenasAdmin, ctrl.removerImagem);

module.exports = router;
