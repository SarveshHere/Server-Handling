import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/SlackAuthRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

app.use(express.json());
app.use('/auth', authRoutes);

const sessions =new Map();

io.on('connection', (socket) => {

  const sessionId = socket.handshake.query.sessionId;
  const userScope = socket.handshake.query.userScope;

  if (sessionId && sessions.has(sessionId)) {

    sessions.set(sessionId, {socket, userScope});

    console.log(`Client connected with sessionID: ${sessionId}`);

    if(userScope){
      socket.emit('authBegin', userScope);
    }

    socket.on('disconnect', () => {
        sessions.delete(sessionId);
        console.log(`Client disconnected with sessionID: ${sessionId}`);
    });
    
  } else {
    socket.disconnect();
  }

});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { io, sessions };