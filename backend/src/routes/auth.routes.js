const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
router.post('/cadastro',        ctrl.cadastro);
router.post('/login',           ctrl.login);
router.post('/verificar-email', ctrl.verificarEmail);
router.post('/redefinir-senha', ctrl.redefinirSenha);
module.exports = router;
