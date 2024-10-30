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

  // TODO: connect an id to a specific socket so that the messages can be styled depending on who sent the message
  // console.log(socket.handshake);

  /* Send message to all other cilents */
  socket.on('message', (msg) => {
    socket.broadcast.emit('message', msg);
  });
});

// app.put('/send', (req, res) => {
//   const { id, message } = req.body;
//   return res.json(sendMessage(id, message));
// });

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
