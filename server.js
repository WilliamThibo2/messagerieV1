const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { registerUser, authenticateUser, generateToken, createConversation, saveMessage, getMessagesByConversation } = require("./database");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static("public"));

const validateUserData = (username, email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return username.length >= 3 && emailRegex.test(email) && passwordRegex.test(password);
};

// Route for signup
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    if (!validateUserData(username, email, password)) {
        return res.status(400).json({ message: "Invalid data" });
    }
    registerUser(username, email, password, (err) => {
        if (err) {
            res.status(400).json({ message: "Signup failed. User or email already exists." });
        } else {
            res.json({ message: "Signup successful. You can log in now." });
        }
    });
});

// Route for signin
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    authenticateUser(email, password, (err, user) => {
        if (err || !user) {
            res.status(400).json({ message: "Login failed. Incorrect email or password." });
        } else {
            const token = generateToken(user);
            res.json({ message: "Login successful", username: user.username, token });
        }
    });
});

// Middleware to authenticate users with sockets
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.username = decoded.username;
            next();
        });
    } else {
        next(new Error("Authentication error"));
    }
}).on("connection", (socket) => {
    console.log(`${socket.username} est connecté`);

    // Charger les messages d'une conversation existante
    socket.on("load_conversation", (conversation_id) => {
        getMessagesByConversation(conversation_id, (err, messages) => {
            if (!err) {
                socket.emit("load_messages", messages);
            }
        });
    });

    // Événement pour créer ou rejoindre une conversation
    socket.on("start_conversation", ({ user1, user2 }) => {
        createConversation(user1, user2, (err, conversation_id) => {
            if (err) return socket.emit("error", { message: "Erreur de conversation" });
            
            socket.join(`conversation_${conversation_id}`);
            socket.emit("conversation_started", { conversation_id });
        });
    });

    // Envoyer un message privé dans une conversation
    socket.on("send_private_message", ({ conversation_id, message }) => {
        saveMessage(conversation_id, socket.username, message);
        io.to(`conversation_${conversation_id}`).emit("receive_private_message", {
            conversation_id,
            sender: socket.username,
            message,
            timestamp: new Date()
        });
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
    });

    socket.on("stop_typing", () => {
        socket.broadcast.emit("stop_typing");
    });

    socket.on("disconnect", () => {
        console.log(`${socket.username} s'est déconnecté`);
        io.emit("user_disconnected", socket.username);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

