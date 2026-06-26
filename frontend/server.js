import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { URL } from 'url';
import 'dotenv/config';

const dev = process.env.NODE_ENV !== 'production';

// FE URL lấy từ env
const frontendUrl = process.env.NEXT_PUBLIC_PORT_URL || 'http://localhost:3001';
const url = new URL(frontendUrl);

const hostname = url.hostname; // localhost
const port = parseInt(url.port || '3001', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on ${frontendUrl}`);
    });
});
