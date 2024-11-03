import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { PORT } from './config.js';
import { clientJoin, sendMessage } from './service.js';

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

app.post('/join', (req, res) => {
  return res.json(clientJoin());
});

io.on('connection', (socket) => {
  console.log('Received a connection from client');

  /* Send public key to client */
  socket.on('public-key', (publicKeyJWK) => {
    socket.broadcast.emit('public-key', publicKeyJWK);
  });

  /* Send message to all other cilents */
  socket.on('message', (msg) => {
    socket.broadcast.emit('message', msg, socket.handshake.auth.id);
  });
});

// app.put('/send', (req, res) => {
//   const { id, message } = req.body;
//   return res.json(sendMessage(id, message));
// });

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
