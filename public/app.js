const socket = io("http://localhost:3000", { auth: { token: localStorage.getItem('token') } });

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const result = await response.json();
    alert(result.message);
});

document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const response = await fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const result = await response.json();

    if (response.ok) {
        localStorage.setItem('token', result.token);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        socket.username = result.username;
    } else {
        alert(result.message);
    }
});

document.getElementById('message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('message-input').value;

    if (message.trim() !== "") {
        socket.emit('send_message', message);
        document.getElementById('message-input').value = '';
    }
});

socket.on('receive_message', (data) => {
    const messageElem = document.createElement('div');
    messageElem.classList.add('message');
    messageElem.classList.add(data.sender === socket.username ? 'sender' : 'receiver');
    messageElem.textContent = `${data.sender}: ${data.message}`;
    document.getElementById('messages').appendChild(messageElem);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

socket.on('typing', (username) => {
    document.getElementById('typing-indicator').textContent = `${username} est en train d'écrire...`;
});

socket.on('stop_typing', () => {
    document.getElementById('typing-indicator').textContent = '';
});

socket.on('user_connected', (username) => {
    const infoElem = document.createElement('div');
    infoElem.classList.add('message', 'info');
    infoElem.textContent = `${username} s'est connecté`;
    document.getElementById('messages').appendChild(infoElem);
});

socket.on('user_disconnected', (username) => {
    const infoElem = document.createElement('div');
    infoElem.classList.add('message', 'info');
    infoElem.textContent = `${username} s'est déconnecté`;
    document.getElementById('messages').appendChild(infoElem);
});

const toggleDarkMode = document.getElementById("toggle-dark-mode");
toggleDarkMode.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleDarkMode.textContent = document.body.classList.contains("dark-mode") ? "Mode Clair" : "Mode Sombre";
});
document.getElementById('message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const recipient = document.getElementById('recipient-input').value;
    const message = document.getElementById('message-input').value;

    if (message.trim() !== "" && recipient.trim() !== "") {
        socket.emit('send_private_message', { recipient, message });
        document.getElementById('message-input').value = '';
        document.getElementById('recipient-input').value = '';
    }
});

socket.on('receive_private_message', (data) => {
    const messageElem = document.createElement('div');
    messageElem.classList.add('message');
    messageElem.classList.add(data.sender === socket.username ? 'sender' : 'receiver');
    messageElem.textContent = `${data.sender} à ${data.recipient}: ${data.message}`;
    document.getElementById('messages').appendChild(messageElem);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

