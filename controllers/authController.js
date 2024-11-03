// controllers/authController.js

const User = require('../models/User'); // Import du modèle User
const bcrypt = require('bcryptjs');     // Pour le hachage des mots de passe
const jwt = require('jsonwebtoken');    // Pour la gestion des tokens JWT

// Fonction d'inscription
exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Vérifier que le mot de passe a une longueur minimale
        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }
        
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer un nouvel utilisateur
        const user = new User({ email, password: hashedPassword });
        
        // Sauvegarder l'utilisateur dans la base de données
        await user.save();
        
        // Répondre avec un statut de création réussie
        res.status(201).json({ message: 'Utilisateur créé' });
    } catch (error) {
        // Gérer les erreurs de duplication d'email
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

// Fonction de connexion
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        
        // Vérifier si l'utilisateur existe et si le mot de passe est correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        // Créer un token JWT avec une durée d'expiration de 1 heure
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Répondre avec le token JWT
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

// Middleware pour vérifier le token JWT
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Récupérer le token de l'en-tête d'autorisation
    
    // Vérifier si le token est présent
    if (!token) return res.status(403).json({ error: 'Accès refusé' });
    
    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attacher l'ID utilisateur décodé à la requête pour un usage futur
        req.userId = decoded.userId;
        
        // Passer au middleware suivant
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
};
