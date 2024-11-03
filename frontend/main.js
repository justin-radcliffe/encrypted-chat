import { PORT } from './config.js';
import { displayError, apiCall, appendMessage } from './helper.js';
import { generateECDHKeyPair, exportPublicKey, importPublicKey, deriveSharedKey, /*generateKey,*/ encryptMessage, decryptMessage } from './encryption.js';

const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

let socket, privateKey, sharedKey;

/* Join the chat room */
joinButton.addEventListener('click', () => {
  apiCall(
    'POST',
    'join',
    {},
    data => {
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
      socket.on('message', (encryptedMessage, iv, senderId) => {
        if (sharedKey === undefined) {
          appendMessage(encryptedMessage, senderId);
        } else {
          decryptMessage(sharedKey, base64ToArrayBuffer(encryptedMessage), base64ToArrayBuffer(iv))
          .then(decryptedMessage => {
            appendMessage(decryptedMessage, senderId);
          })
          .catch(err => displayError(err));
        }
      });
    }
  )
  .then(() => generateECDHKeyPair())
  .then(keyPair => {
    privateKey = keyPair.privateKey;
    return exportPublicKey(keyPair.publicKey);
  })
  .then(publicKeyJWK => {
    /* Handle incoming ECDH public key */
    socket.on('public-key', (otherPublicKeyJWK) => {
      importPublicKey(otherPublicKeyJWK)
      .then(otherPublicKey => {
        if (sessionStorage.getItem('id') === '2') {
          console.log('ECDH keys successfully shared');
        }
        return otherPublicKey;
      })
      .then(otherPublicKey => {
        deriveSharedKey(privateKey, otherPublicKey)
        .then(derivedKey => {
          console.log(derivedKey);
          sharedKey = derivedKey;
        });
      })
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
  .catch(err => displayError(err));
});

function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

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
