const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const path = require('path');  // Ajout du module 'path' pour gérer les chemins de fichiers

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://messagerie2-1.onrender.com/', 
        methods: ['GET', 'POST'],
    },
});

connectDB();

app.use(cors({
    origin: 'https://messagerie2-1.onrender.com/',  
    credentials: true,
}));

app.use(express.json());

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

const sessionMiddleware = session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
});

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Utilisation des routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/chat', authController.verifyToken);

// Redirection vers la page de connexion
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route pour afficher la page de chat après connexion
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html'));
});

// Nouvelle route pour supprimer le compte utilisateur
app.delete('/auth/deleteAccount', async (req, res) => {
    try {
        const userId = req.user.id; // Assurez-vous que l'utilisateur est connecté
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.json({ success: false, error: "Erreur lors de la suppression du compte." });
    }
});

let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    socket.on('join', ({ token }) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.request.session.userEmail = decoded.email;
            socket.request.session.save();
            connectedUsers[decoded.email] = socket.id;
            console.log(`${decoded.email} connecté avec l'ID ${socket.id}`);
        } catch (error) {
            console.log("Token invalide");
            socket.disconnect();
        }
    });

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

server.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
