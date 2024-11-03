// controllers/messageController.js

const Message = require('../models/Message');
const User = require('../models/User');

// Envoyer un message privé
exports.sendMessage = async (req, res) => {
    const { to, content } = req.body;
    const from = req.userId; // Utilisateur authentifié

    try {
        // Trouver le destinataire par email
        const recipient = await User.findOne({ email: to });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable" });
        }

        // Créer et enregistrer le message
        const message = new Message({ from, to: recipient._id, content });
        await message.save();

        res.status(201).json({ message: "Message envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
};

// Récupérer l'historique des messages privés entre deux utilisateurs
exports.getMessages = async (req, res) => {
    const { userId } = req;
    const { toEmail } = req.params;

    try {
        // Trouver l'utilisateur correspondant à l'email destinataire
        const recipient = await User.findOne({ email: toEmail });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable" });
        }

        // Récupérer les messages échangés entre les deux utilisateurs
        const messages = await Message.find({
            $or: [
                { from: userId, to: recipient._id },
                { from: recipient._id, to: userId }
            ]
        }).sort({ timestamp: 1 }); // Tri par date

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
};
