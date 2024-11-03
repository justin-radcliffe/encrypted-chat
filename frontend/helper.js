import { PORT } from './config.js';
import { importPublicKey, deriveSharedKey, decryptMessage } from './encryption.js';

/* Display an error message (console and alert) */
export const displayError = err => {
  console.error(err);
  alert(err);
};

export const apiCall = async (method, path, payload, successHandler) => {
  let url = `http://localhost:${PORT}/${path}`;
  const req = {
    method: method,
    headers: {
      'Content-type': 'application/json',
    },
  };

  if (['POST', 'PUT'].includes(method)) {
    req.body = JSON.stringify(payload);
  } else {
    url += `?${payload}`;
  }

  const res = await fetch(url, req);
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  } else {
    return successHandler(data);
  }
};

/* Display the sent or received message in the chat box */
export const appendMessage = (msg, senderId) => {
  const textBox = document.createElement('div');
  textBox.classList.add('text-box');
  
  const myId = sessionStorage.getItem('id');

  /* I am a sender */
  if (myId === '1' || myId === '2') {
    if (senderId === myId) {
      textBox.classList.add('text-box-right');
      textBox.classList.add('text-box-me');
    } else {
      textBox.classList.add('text-box-left');
    }
  } else /* I am a spectator */ {
    textBox.classList.add(senderId === '1' ? 'text-box-left' : 'text-box-right');
  }
  
  textBox.innerText = msg;
  document.getElementById('chat-box').appendChild(textBox);
};

/* Convert an ArrayBuffer to a base 64 string for socket transfer */
export const bufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/* Convert a base 64 string to an ArrayBuffer for decryption after socket transfer */
export const base64ToArrayBuffer = (base64) => {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};
