import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Render.com 24/7 uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'JJMM Romantic 3D Museum'
  });
});

// Self-ping endpoint to keep Render server awake (24/7)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Store active rooms and players
// rooms: { [roomId]: { [socketId]: playerObject } }
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentPlayerId = socket.id;

  // Player joins a museum room
  socket.on('join-room', (data) => {
    const roomId = data.roomId || 'romantic-hall';
    const playerName = (data.playerName || 'Mehmon').trim().slice(0, 24);
    const role = data.role || 'boy'; // 'boy' or 'girl'
    const color = data.color || (role === 'boy' ? '#2563eb' : '#ec4899');

    currentRoom = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const roomPlayers = rooms.get(roomId);

    const newPlayer = {
      id: socket.id,
      name: playerName,
      role: role,
      color: color,
      x: data.x || 0,
      y: data.y || 1.6,
      z: data.z || 30,
      rotY: data.rotY || 0,
      isMoving: false,
      isSitting: false
    };

    // Send existing players in room to the newly joined player
    const existingList = Array.from(roomPlayers.values());
    socket.emit('current-players', existingList);

    // Add new player to room
    roomPlayers.set(socket.id, newPlayer);

    // Broadcast new player to all others in the room
    socket.to(roomId).emit('player-joined', newPlayer);

    console.log(`[+] ${playerName} (${role}) joined room: ${roomId} [Total: ${roomPlayers.size}]`);
  });

  // Player movement update (position, rotation, movement state)
  socket.on('player-move', (posData) => {
    if (!currentRoom || !rooms.has(currentRoom)) return;
    const roomPlayers = rooms.get(currentRoom);
    const player = roomPlayers.get(socket.id);
    if (!player) return;

    player.x = posData.x;
    player.y = posData.y;
    player.z = posData.z;
    player.rotY = posData.rotY;
    player.isMoving = posData.isMoving;
    player.isSitting = posData.isSitting;

    socket.to(currentRoom).emit('player-moved', {
      id: socket.id,
      x: posData.x,
      y: posData.y,
      z: posData.z,
      rotY: posData.rotY,
      isMoving: posData.isMoving,
      isSitting: posData.isSitting
    });
  });

  // Player sends heart reaction
  socket.on('send-heart', (heartData) => {
    if (!currentRoom) return;
    io.in(currentRoom).emit('heart-received', {
      senderId: socket.id,
      senderName: heartData.senderName || 'Oshiq',
      x: heartData.x,
      y: heartData.y,
      z: heartData.z
    });
  });

  // Player sends chat message
  socket.on('send-chat', (chatData) => {
    if (!currentRoom) return;
    const text = (chatData.text || '').trim().slice(0, 160);
    if (!text) return;

    io.in(currentRoom).emit('chat-received', {
      senderId: socket.id,
      senderName: chatData.senderName || 'Oshiq',
      text: text,
      timestamp: Date.now()
    });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const roomPlayers = rooms.get(currentRoom);
      const player = roomPlayers.get(socket.id);
      if (player) {
        console.log(`[-] ${player.name} left room: ${currentRoom}`);
        roomPlayers.delete(socket.id);
        socket.to(currentRoom).emit('player-left', { id: socket.id, name: player.name });

        if (roomPlayers.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });
});

// Self-ping routine every 10 minutes to prevent Render free instance from sleeping
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(async () => {
    try {
      const res = await fetch(`${process.env.RENDER_EXTERNAL_URL}/ping`);
      console.log(`[Keep-Alive Ping] ${new Date().toLocaleTimeString()} -> ${res.status}`);
    } catch (e) {
      console.log('[Keep-Alive Ping Error]', e.message);
    }
  }, 10 * 60 * 1000);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏛️  JJMM Romantic Museum 3D server running on http://localhost:${PORT}`);
  console.log(`❤️  Multiplayer WebSockets ready for 2 lovers & visitors.`);
});

