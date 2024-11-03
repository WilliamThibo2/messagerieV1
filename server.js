// server.js
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController');
const cors = require('cors');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://votre-domaine.com',  // Remplacez par votre domaine
        methods: ['GET', 'POST'],
    },
});

// Connexion à la base de données
connectDB();

// Configuration des middlewares
app.use(cors({
    origin: 'http://votre-domaine.com',  // Remplacez par votre domaine
    credentials: true,
}));
app.use(express.json());

// Configuration du middleware de session
const sessionMiddleware = session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

app.use(sessionMiddleware);

// Partager la session avec Socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/chat', authController.verifyToken);  // Protégez les routes de chat avec le middleware de vérification

// Route pour servir login.html à la racine
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Route pour accéder à index.html, protégée par une vérification côté client
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Gérer les utilisateurs connectés
let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    // Gérer la connexion avec vérification du token JWT
    socket.on('join', ({ token }) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.request.session.userEmail = decoded.email;
            socket.request.session.save();
            connectedUsers[decoded.email] = socket.id;
            console.log(`${decoded.email} connecté avec l'ID ${socket.id}`);
        } catch (error) {
            console.log("Token invalide");
            socket.disconnect();  // Déconnecter l'utilisateur si le token est invalide
        }
    });

    // Gérer les messages privés
    socket.on('private_message', ({ to, message }) => {
        const userEmail = socket.request.session.userEmail;
        if (userEmail) {
            const recipientSocket = connectedUsers[to];
            if (recipientSocket) {
                io.to(recipientSocket).emit('receive_message', { from: userEmail, message });
            }
        } else {
            console.log("Utilisateur non authentifié");
        }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
        for (let email in connectedUsers) {
            if (connectedUsers[email] === socket.id) {
                delete connectedUsers[email];
                break;
            }
        }
    });
});

// Démarrer le serveur
server.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
