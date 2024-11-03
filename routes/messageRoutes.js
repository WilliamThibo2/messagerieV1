// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

// Route pour envoyer un message privé
router.post('/send', authController.verifyToken, messageController.sendMessage);

// Route pour récupérer l'historique des messages avec un autre utilisateur
router.get('/:toEmail', authController.verifyToken, messageController.getMessages);

module.exports = router;
