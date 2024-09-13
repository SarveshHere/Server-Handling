import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import authRoutes from './routes/AuthRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

app.use(express.json());
app.use('/auth', authRoutes);

io.on('connection', (socket) => {
  socket.on('join', (sessionId) => {
      socket.join(sessionId);
  });
});
export {io};

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
