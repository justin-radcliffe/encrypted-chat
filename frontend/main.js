import { apiCall } from './helper.js';

const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');

joinButton.addEventListener('click', () => {
  apiCall('POST', 'join', {}, data => {
    console.log(data);
    joinButton.style.display = 'none';
    document.getElementById('main-block').style.display = 'block';
  });
});

sendButton.addEventListener('click', () => {

});
