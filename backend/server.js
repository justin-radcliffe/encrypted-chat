import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { PORT } from './config.js';
import { clientJoin } from './service.js';

/* Server setup */
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  }
});

app.use(cors());
app.use(express.json());

/* Join the chat */
app.post('/join', (req, res) => {
  return res.json(clientJoin());
});

io.on('connection', (socket) => {
  console.log('Received a connection from client');

  /* Send public key to client */
  socket.on('public-key', (publicKeyJWK) => {
    socket.broadcast.emit('public-key', publicKeyJWK);
  });

  /* Send encryption strategy to client */
  socket.on('encrypt-strategy', (encryptStrategy) => {
    socket.broadcast.emit('encrypt-strategy', encryptStrategy);
  });

  /* Send message to all other cilents */
  socket.on('message', (encryptedMessage, iv) => {
    console.log(`encryptedMessage: ${encryptedMessage} | iv: ${iv}`);
    socket.broadcast.emit('message', encryptedMessage, iv, socket.handshake.auth.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
