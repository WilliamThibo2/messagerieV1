const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware'); // Middleware pour vérifier le token
const { register, login } = require('../controllers/authController');

router.post('/register', register); 
router.post('/login', login);       

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route protégée pour vérifier le token
router.get('/verifyToken', verifyToken, authController.verifyToken);

// Nouvelle route pour supprimer le compte
router.delete('/deleteAccount', verifyToken, authController.deleteAccount);

module.exports = router;

module.exports = router;
