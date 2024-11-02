import crypto from 'crypto';
import { PORT } from './config.js';

export const displayError = err => {
  console.log(err);
  alert(err);
}

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
