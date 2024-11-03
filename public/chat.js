const socket = io();

// Gestion de la connexion avec l'email de l'utilisateur
document.getElementById('email').addEventListener('change', (event) => {
    // Envoyer l'adresse e-mail une fois pour démarrer la session côté serveur
    socket.emit('join', { email: event.target.value });
    console.log(`Connecté en tant que ${event.target.value}`);
    
    // Désactiver le champ e-mail après connexion
    event.target.disabled = true;
});

// Fonction pour envoyer un message privé
function sendMessage() {
    const toEmail = document.getElementById('toEmail').value;
    const message = document.getElementById('message').value;

    // Envoyer uniquement l'e-mail du destinataire et le message, l'e-mail de l'expéditeur est géré par le serveur
    socket.emit('private_message', { to: toEmail, message });
    
    // Afficher le message dans la liste des messages
    document.getElementById('messages').innerHTML += `<li>Vous: ${message}</li>`;
    document.getElementById('message').value = ''; // Réinitialiser le champ de message
}

// Gestion de la réception des messages
socket.on('receive_message', ({ from, message }) => {
    document.getElementById('messages').innerHTML += `<li>${from}: ${message}</li>`;
});
