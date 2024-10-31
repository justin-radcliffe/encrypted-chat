import { socket, displayError, apiCall, appendMessage } from './helper.js';

const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

joinButton.addEventListener('click', () => {
  apiCall('POST', 'join', {}, data => {
    console.log(data);
    sessionStorage.setItem('messenger', data.messenger);
    sessionStorage.setItem('id', data.id);

    joinButton.style.display = 'none';
    document.getElementById('main-block').style.display = 'block';
    
    /* Only let messengers send messages, otherwise they only spectate */
    if (data.messenger) {
      document.getElementById('message-box').style.display = 'flex';
    } else {
      document.getElementById('spectating-message').style.display = 'block';
    }
  })
  .catch(err => displayError(err));
});

sendButton.addEventListener('click', () => {
  socket.emit('message', messageInput.value);
  appendMessage(messageInput.value, true);
  messageInput.value = '';
});

messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    sendButton.click();
  }
});

socket.on('message', msg => appendMessage(msg, false));
