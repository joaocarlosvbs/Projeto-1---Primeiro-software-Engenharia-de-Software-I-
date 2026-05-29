const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/logs.controller');
const { verificarToken, apenasAdmin } = require('../middlewares/auth.middleware');
router.get('/', verificarToken, apenasAdmin, ctrl.listar);
module.exports = router;
