document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let currentUser = '';
    let currentRoom = '';
    const joinScreen = document.getElementById('join-screen');
    const chatScreen = document.getElementById('chat-screen');
    const joinForm = document.getElementById('join-form');
    const usernameInput = document.getElementById('username');
    const roomCodeInput = document.getElementById('room-code');
    const currentRoomDisplay = document.getElementById('current-room');
    const leaveBtn = document.getElementById('leave-btn');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    function addMessageToUI(type, message, username = '', timestamp = null) {
        const msgDiv = document.createElement('div'); ``
        if (type === 'system') {
            msgDiv.className = 'system-message';
            msgDiv.textContent = message;
        } else {

            const isSentByMe = username === currentUser;
            msgDiv.className = `message ${isSentByMe ? 'msg-sent' : 'msg-received'}`;

            const headerDiv = document.createElement('div');
            headerDiv.className = 'msg-header';

            const senderSpan = document.createElement('span');
            senderSpan.className = 'msg-sender';
            senderSpan.textContent = isSentByMe ? 'You' : username;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'msg-time';
            const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeSpan.textContent = timeStr;
            headerDiv.appendChild(senderSpan);
            headerDiv.appendChild(timeSpan);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'msg-content';
            contentDiv.textContent = message;

            msgDiv.appendChild(headerDiv);
            msgDiv.appendChild(contentDiv);
        }

        messagesContainer.appendChild(msgDiv);
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- Event Listeners ---

    // Join Room
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const roomCode = roomCodeInput.value.trim();

        if (username && roomCode) {
            currentUser = username;
            currentRoom = roomCode;

            // Notify server
            socket.emit('join_room', { username, roomCode });

            // Update UI
            currentRoomDisplay.textContent = roomCode;
            showScreen('chat-screen');
            messagesContainer.innerHTML = '<div class="system-message">Welcome to the secret vault. Messages are not stored permanently.</div>';
        }
    });

    // Send Message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = messageInput.value.trim();

        if (message) {
            const timestamp = new Date().toISOString();

            // Send to server
            socket.emit('send_message', {
                roomCode: currentRoom,
                username: currentUser,
                message: message
            });

            // Display locally immediately
            addMessageToUI('user', message, currentUser, timestamp);

            // Clear input
            messageInput.value = '';
            messageInput.focus();
        }
    });

    // Leave Room
    leaveBtn.addEventListener('click', () => {
        // Just reload the page to clear state entirely (simplest way to ensure clean exit)
        window.location.reload();
    });

    // --- Socket Listeners ---

    socket.on('receive_message', (data) => {
        addMessageToUI(data.type, data.message, data.username, data.timestamp);
    });
});
