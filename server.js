const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration de la session
app.use(session({
    secret: 'votreSecretSession', // Changez pour un secret plus sûr
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettez `secure: true` si vous utilisez HTTPS
}));

app.use('/api/auth', authRoutes);

// Déclaration des utilisateurs connectés en session
let connectedUsers = {};

// Gestion des connexions socket.io
io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    socket.on('join', ({ email }) => {
        // Associer l'e-mail à l'ID de session
        socket.request.session.userEmail = email;
        connectedUsers[email] = socket.id;
        console.log(`${email} connecté avec l'ID ${socket.id}`);
    });

    socket.on('private_message', ({ to, message }) => {
        const userEmail = socket.request.session.userEmail; // Utiliser l'e-mail stocké en session
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
