const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

router.post('/send', authController.verifyToken, messageController.sendMessage);
router.get('/:toEmail', authController.verifyToken, messageController.getMessages);

module.exports = router;
