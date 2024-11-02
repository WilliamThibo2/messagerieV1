const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = new sqlite3.Database("./database.sqlite");

// Création des tables utilisateurs et messages
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

const registerUser = (username, email, password, callback) => {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, hash], callback);
    });
};

const authenticateUser = (email, password, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) return callback(err || new Error("User not found"));
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (isMatch) callback(null, user);
            else callback(new Error("Password incorrect"));
        });
    });
};

const generateToken = (user) => {
    const payload = { id: user.id, username: user.username };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const saveMessage = (username, message) => {
    db.run(`INSERT INTO messages (username, message) VALUES (?, ?)`, [username, message]);
};

const getMessages = (callback) => {
    db.all(`SELECT * FROM messages ORDER BY timestamp ASC`, [], callback);
};

module.exports = { registerUser, authenticateUser, generateToken, saveMessage, getMessages };
