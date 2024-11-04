// Initialisation de la connexion Socket.IO
const socket = io();

// Connexion de l'utilisateur avec un token JWT stocké dans le localStorage
socket.emit('join', { token: localStorage.getItem('token') });

// Vérifie si l'utilisateur est authentifié
const token = localStorage.getItem('token');
if (!token) {
    // Redirige vers login.html si l'utilisateur n'est pas connecté
    window.location.href = '/login';
}

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

// Fonction de déconnexion
document.getElementById('signOutButton').addEventListener('click', function() {
    // Supprime le token JWT du localStorage
    localStorage.removeItem('token');

    // Réinitialise les cookies
    document.cookie.split(";").forEach(function(cookie) {
        const name = cookie.split("=")[0].trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });

    // Redirige vers la page de connexion
    window.location.href = '/login';
});

// Ouvre la boîte de dialogue de suppression du compte
function openSettings() {
    document.getElementById('deleteAccountModal').style.display = 'block';
}

// Ferme la boîte de dialogue
function closeModal() {
    document.getElementById('deleteAccountModal').style.display = 'none';
}

// Fonction pour supprimer le compte
async function deleteAccount() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/auth/deleteAccount', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("Votre compte a été supprimé.");
            localStorage.removeItem('token');
            window.location.href = '/register';
        } else {
            alert("Échec de la suppression du compte. Veuillez réessayer.");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        alert("Erreur lors de la suppression du compte");
    }
}
