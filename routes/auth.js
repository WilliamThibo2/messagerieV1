const express = require('express');
const router = express.Router();
const { register, login, deleteAccount } = require('../controllers/authController');
const { verifyToken } = require('../controllers/authController'); // Assurez-vous que la vérification du token est importée

router.post('/register', register); 
router.post('/login', login);
router.delete('/delete', verifyToken, deleteAccount); // Route de suppression avec vérification du token

module.exports = router;
