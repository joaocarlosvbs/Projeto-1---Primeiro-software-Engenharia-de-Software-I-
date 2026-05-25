// auth.routes.js — Endpoints públicos de autenticação
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/cadastro', authController.cadastro); // UC02
router.post('/login', authController.login);        // UC01

module.exports = router;
