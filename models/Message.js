// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'expéditeur
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Référence au destinataire
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
