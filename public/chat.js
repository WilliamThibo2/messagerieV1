const socket = io();

socket.emit('join', { token: localStorage.getItem('token') });

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

function sendMessage() {
    const toEmail = document.getElementById('toEmail').value;
    const message = document.getElementById('message').value;

    if (toEmail && message) {
        socket.emit('private_message', { to: toEmail, message });
        document.getElementById('messages').innerHTML += `<li>Vous: ${message}</li>`;
        document.getElementById('message').value = '';
    }
}

socket.on('receive_message', ({ from, message }) => {
    document.getElementById('messages').innerHTML += `<li>${from}: ${message}</li>`;
});

document.getElementById('signOutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    document.cookie.split(";").forEach(function(cookie) {
        const name = cookie.split("=")[0].trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    window.location.href = '/login';
});

function openSettings() {
    document.getElementById('deleteAccountModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('deleteAccountModal').style.display = 'none';
}

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
