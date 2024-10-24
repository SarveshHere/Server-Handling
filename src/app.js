import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/SlackAuthRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/auth', authRoutes);

const sessions = new Map();

io.on('connection', (socket) => {

  const { sessionId, userScope } = socket.handshake.query;

  if (sessionId && sessions.has(sessionId)) {

    sessions.set(sessionId, { socket, userScope });

    console.log(`Client connected with sessionID: ${sessionId}`);

    if (userScope) {
      socket.emit('authBegin', userScope);
    } else {
      socket.emit('message', { type: 'error', message: 'User Scope is not found' });
    }

    socket.on('disconnect', () => {
      sessions.delete(sessionId);
      console.log(`Client disconnected with sessionID: ${sessionId}`);
    });

  } else {
    socket.emit('message', { type: 'error', message: "Invalid session Id" });
    socket.disconnect();
  }

});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok' });
});


const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { io, sessions, app };
