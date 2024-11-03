require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');

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
app.use('/api/auth', authRoutes);
app.use(express.static('public'));

let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    socket.on('join', ({ email }) => {
        connectedUsers[email] = socket.id;
        console.log(`${email} connecté avec l'ID ${socket.id}`);
    });

    socket.on('private_message', ({ to, message }) => {
        const recipientSocket = connectedUsers[to];
        if (recipientSocket) {
            io.to(recipientSocket).emit('receive_message', { from: socket.id, message });
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
