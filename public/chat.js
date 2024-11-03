// Initialisation de la connexion Socket.IO
const socket = io();

// Connexion de l'utilisateur avec un token JWT stocké dans le localStorage
socket.emit('join', { token: localStorage.getItem('token') });

// Fonction pour envoyer un message privé
function sendMessage() {
    const toEmail = document.getElementById('toEmail').value;  // Récupère l'email du destinataire
    const message = document.getElementById('message').value;  // Récupère le contenu du message

    if (toEmail && message) {
        // Émet un message privé vers le serveur
        socket.emit('private_message', { to: toEmail, message });
        
        // Affiche le message envoyé dans l'interface
        document.getElementById('messages').innerHTML += `<li>Vous: ${message}</li>`;
        document.getElementById('message').value = ''; // Vide le champ de saisie
    }
}

// Réception des messages privés de la part du serveur
socket.on('receive_message', ({ from, message }) => {
    // Affiche le message reçu dans l'interface avec l'expéditeur
    document.getElementById('messages').innerHTML += `<li>${from}: ${message}</li>`;
});
