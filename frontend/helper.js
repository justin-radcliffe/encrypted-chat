import { PORT } from './config.js';

export const socket = io(`http://localhost:${PORT}`);

export const displayError = err => {
  console.log(err);
  alert(err);
}

export const apiCall = (method, path, payload, successHandler) => {
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

  return fetch(url, req)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    } else {
      return successHandler(data);
    }
  });
};

export const appendMessage = (msg, myMessage) => {
  const textBox = document.createElement('div');
  textBox.classList.add('text-box');
  textBox.classList.add(myMessage ? 'text-box-a' : 'text-box-b');
  textBox.innerText = msg;
  document.getElementById('chat-box').appendChild(textBox);
};
