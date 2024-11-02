const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = new sqlite3.Database("./database.sqlite");

// Création des tables utilisateurs, conversations et messages
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // Nouvelle table pour gérer les conversations privées
    db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1 TEXT,
        user2 TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        sender TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id)
    )`);
});

// Fonction pour créer une conversation entre deux utilisateurs
const createConversation = (user1, user2, callback) => {
    db.run(
        `INSERT INTO conversations (user1, user2) VALUES (?, ?)`,
        [user1, user2],
        function (err) {
            if (err) return callback(err);
            callback(null, this.lastID); // retourne l'ID de la conversation
        }
    );
};

// Fonction pour sauvegarder un message avec l'ID de conversation
const saveMessage = (conversation_id, sender, message) => {
    db.run(
        `INSERT INTO messages (conversation_id, sender, message) VALUES (?, ?, ?)`,
        [conversation_id, sender, message]
    );
};

// Fonction pour récupérer les messages d'une conversation
const getMessagesByConversation = (conversation_id, callback) => {
    db.all(
        `SELECT sender, message, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`,
        [conversation_id],
        callback
    );
};

module.exports = { registerUser, authenticateUser, generateToken, createConversation, saveMessage, getMessagesByConversation };
