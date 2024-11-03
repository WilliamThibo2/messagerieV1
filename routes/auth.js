const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register); // Inscription
router.post('/login', login);       // Connexion

module.exports = router;
