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

app.use('/api/auth', authRoutes);
app.use('/api/chat', authController.verifyToken);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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
