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

app.get("/", function(req,res){
  res.send("Server Start Point");
})

io.on('connection', (socket) => {
  socket.on('join', (sessionId) => {
      socket.join(sessionId);
  });
});
export {io};

const port= process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server Started at Port ${port}`);
});
