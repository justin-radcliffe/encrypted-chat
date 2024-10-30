import express from 'express';
import cors from 'cors';

import { PORT } from '../config/config.js';
import { clientJoin } from './service.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/join', (req, res) => {
  return res.json(clientJoin());
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
