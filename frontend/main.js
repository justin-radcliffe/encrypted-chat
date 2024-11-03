import { PORT } from './config.js';
import { displayError, apiCall, appendMessage, bufferToBase64, base64ToArrayBuffer } from './helper.js';
import { generateECDHKeyPair, exportPublicKey, importPublicKey, deriveSharedKey, encryptMessage, decryptMessage } from './encryption.js';

const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const selectEncryption = document.getElementById('select-encryption');

let socket, privateKey, sharedKey;

/* Join the chat room */
joinButton.addEventListener('click', () => {
  apiCall(
    'POST',
    'join',
    {},
    data => {
      /* Store session data */
      sessionStorage.setItem('messenger', data.messenger);
      sessionStorage.setItem('id', data.id);

      /* Establish connection to server */
      socket = io(`http://localhost:${PORT}`, {
        auth: {
          id: sessionStorage.getItem('id'),
        },
      });
    }
  )
  .then(() => generateECDHKeyPair())
  .then(keyPair => {
    privateKey = keyPair.privateKey;
    return exportPublicKey(keyPair.publicKey);
  })
  .then(publicKeyJWK => {
    /* Handle incoming messages */
    socket.on('message', (encryptedMessage, iv, senderId) => {
      if (sharedKey === undefined) {
        appendMessage(encryptedMessage, senderId);
      } else {
        decryptMessage(sharedKey, base64ToArrayBuffer(encryptedMessage), base64ToArrayBuffer(iv))
        .then(decryptedMessage => appendMessage(decryptedMessage, senderId))
        .catch(err => displayError(err));
      }
    });

    /* Handle incoming ECDH public key */
    socket.on('public-key', (otherPublicKeyJWK) => {
      importPublicKey(otherPublicKeyJWK)
      .then(otherPublicKey => deriveSharedKey(privateKey, otherPublicKey))
      .then(derivedKey => sharedKey = derivedKey)
      .catch(err => displayError(err));

      /* Send my public key if I have not yet since I was first to join */
      if (sessionStorage.getItem('id') === '1') {
        socket.emit('public-key', publicKeyJWK);
      }
    });

    /* Send my public key if I am second to join */
    if (sessionStorage.getItem('id') === '2') {
      socket.emit('public-key', publicKeyJWK);
    }
  })
  .then(() => {
    joinButton.style.display = 'none';
    document.getElementById('main-block').style.display = 'block';
    
    /* Only let messengers send messages, otherwise they only spectate */
    if (sessionStorage.getItem('messenger') === 'true') {
      document.getElementById('message-box').style.display = 'flex';
      selectEncryption.style.display = 'block';
      console.log(selectEncryption.value);
    } else {
      document.getElementById('spectating-message').style.display = 'block';
    }
  })
  .catch(err => displayError(err));
});

/* Send message by clicking */
sendButton.addEventListener('click', () => {
  encryptMessage(sharedKey, messageInput.value)
  .then(data => {
    socket.emit('message', bufferToBase64(data.encryptedMessage), bufferToBase64(data.iv));
    appendMessage(messageInput.value, sessionStorage.getItem('id'));
    messageInput.value = '';
  })
  .catch(err => displayError(err));
});

/* Send message with enter key */
messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    sendButton.click();
  }
});

/* Select encryption method */
selectEncryption.addEventListener('onchange', () => {
  if (selectEncryption.value !== '') {
    messageInput.disabled = false;
    sendButton.disabled = false;
  }
});
