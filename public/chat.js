const socket = io();

// Envoyer un message privé
function sendMessage() {
    const toEmail = document.getElementById('toEmail').value;
    const message = document.getElementById('message').value;

    socket.emit('private_message', { to: toEmail, message });
    
    document.getElementById('messages').innerHTML += `<li>Vous: ${message}</li>`;
    document.getElementById('message').value = '';
}

socket.on('receive_message', ({ from, message }) => {
    document.getElementById('messages').innerHTML += `<li>${from}: ${message}</li>`;
});
