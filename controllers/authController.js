const User = require('../models/User'); // Modèle utilisateur
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'email est déjà utilisé
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Inscription réussie" });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Connexion
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Rechercher l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        // Créer un token JWT
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Vérifier le token
exports.verifyToken = (req, res) => {
    res.status(200).json({ message: "Token valide" });
};

// Supprimer le compte
exports.deleteAccount = async (req, res) => {
    try {
        // Supprimer l'utilisateur basé sur l'email du token
        const user = await User.findOneAndDelete({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }
};

