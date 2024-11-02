import { PORT } from './config.js';
import { displayError, apiCall, appendMessage, generateKey } from './helper.js';

const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

let socket;

/* Join the chat room */
joinButton.addEventListener('click', () => {
  apiCall('POST', 'join', {}, data => {
    console.log(data);
    sessionStorage.setItem('messenger', data.messenger);
    sessionStorage.setItem('id', data.id);

    /* Establish connection to server */
    socket = io(`http://localhost:${PORT}`, {
      auth: {
        id: sessionStorage.getItem('id'),
      },
    });
    
    joinButton.style.display = 'none';
    document.getElementById('main-block').style.display = 'block';
    
    /* Only let messengers send messages, otherwise they only spectate */
    if (data.messenger) {
      document.getElementById('message-box').style.display = 'flex';
    } else {
      document.getElementById('spectating-message').style.display = 'block';
    }

    /* Handle incoming messages */
    socket.on('message', (msg, senderId) => appendMessage(msg, senderId));
  })
  .then(() => generateKey())
  .then(key => {

  })
  .catch(err => displayError(err));
});

/* Send message by clicking */
sendButton.addEventListener('click', () => {
  socket.emit('message', messageInput.value);
  appendMessage(messageInput.value, sessionStorage.getItem('id'));
  messageInput.value = '';
});

/* Send message with enter key */
messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    sendButton.click();
  }
});
