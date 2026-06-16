const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 5000,
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));


// ── State ──────────────────────────────────────────────────────────
const waitingQueue = [];           // { socketId, interests }
const activeRooms  = new Map();    // roomId -> { users, createdAt }
const socketToRoom = new Map();    // socketId -> roomId
const socketMeta   = new Map();    // socketId -> { interests }
let onlineCount    = 0;

// ── Helpers ────────────────────────────────────────────────────────

function findPartner(socketId, interests) {
  // Try interest-based match first
  if (interests && interests.length > 0) {
    for (let i = 0; i < waitingQueue.length; i++) {
      const candidate = waitingQueue[i];
      if (candidate.socketId === socketId) continue;
      if (socketToRoom.has(candidate.socketId)) { waitingQueue.splice(i, 1); i--; continue; }
      const sock = io.sockets.sockets.get(candidate.socketId);
      if (!sock) { waitingQueue.splice(i, 1); i--; continue; }

      // Check interest overlap
      if (candidate.interests && candidate.interests.length > 0) {
        const shared = interests.filter(t => candidate.interests.includes(t));
        if (shared.length > 0) {
          waitingQueue.splice(i, 1);
          return { partnerId: candidate.socketId, sharedInterests: shared };
        }
      }
    }
  }

  // Fallback: random match
  while (waitingQueue.length > 0) {
    const candidate = waitingQueue.shift();
    if (candidate.socketId === socketId) continue;
    if (socketToRoom.has(candidate.socketId)) continue;
    const sock = io.sockets.sockets.get(candidate.socketId);
    if (!sock) continue;
    return { partnerId: candidate.socketId, sharedInterests: [] };
  }
  return null;
}

function createRoom(id1, id2) {
  const roomId = uuidv4();
  activeRooms.set(roomId, { users: [id1, id2], createdAt: Date.now() });
  socketToRoom.set(id1, roomId);
  socketToRoom.set(id2, roomId);
  return roomId;
}

function destroyRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return [];
  room.users.forEach(id => socketToRoom.delete(id));
  activeRooms.delete(roomId);
  return room.users;
}

function getPartner(socketId) {
  const roomId = socketToRoom.get(socketId);
  if (!roomId) return null;
  const room = activeRooms.get(roomId);
  if (!room) return null;
  return room.users.find(id => id !== socketId) || null;
}

function removeFromQueue(socketId) {
  const idx = waitingQueue.findIndex(w => w.socketId === socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
}

function disconnectPartner(socketId) {
  const roomId = socketToRoom.get(socketId);
  if (!roomId) return;
  const partnerId = getPartner(socketId);
  destroyRoom(roomId);
  if (partnerId) {
    const ps = io.sockets.sockets.get(partnerId);
    if (ps) ps.emit('partner-left');
  }
}

function broadcast() {
  io.emit('stats', { online: onlineCount });
}

// ── Socket.IO ──────────────────────────────────────────────────────

io.on('connection', (socket) => {
  onlineCount++;
  broadcast();
  console.log(`+ ${socket.id} (${onlineCount} online)`);

  socket.on('find-partner', (data) => {
    const interests = (data && Array.isArray(data.interests)) ? data.interests.map(s => s.toLowerCase().trim()).filter(Boolean).slice(0, 5) : [];
    socketMeta.set(socket.id, { interests });

    // Clean up existing session
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);

    const match = findPartner(socket.id, interests);
    if (match) {
      const roomId = createRoom(socket.id, match.partnerId);
      console.log(`⚡ ${socket.id} <-> ${match.partnerId} (shared: ${match.sharedInterests.join(', ') || 'none'})`);
      socket.emit('matched', { roomId, isInitiator: true, sharedInterests: match.sharedInterests });
      io.to(match.partnerId).emit('matched', { roomId, isInitiator: false, sharedInterests: match.sharedInterests });
    } else {
      waitingQueue.push({ socketId: socket.id, interests });
      socket.emit('waiting');
    }
  });

  // WebRTC signaling
  socket.on('signal-offer', (d)     => { const p = getPartner(socket.id); if (p) io.to(p).emit('signal-offer', d); });
  socket.on('signal-answer', (d)    => { const p = getPartner(socket.id); if (p) io.to(p).emit('signal-answer', d); });
  socket.on('signal-candidate', (d) => { const p = getPartner(socket.id); if (p) io.to(p).emit('signal-candidate', d); });

  // Chat
  socket.on('msg', (text) => {
    if (typeof text !== 'string' || !text.trim()) return;
    const clean = text.trim().slice(0, 500);
    const p = getPartner(socket.id);
    if (p) {
      io.to(p).emit('msg', { text: clean, from: 'stranger' });
      socket.emit('msg', { text: clean, from: 'you' });
    }
  });

  socket.on('typing', (isTyping) => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('typing', isTyping);
  });

  socket.on('skip', () => {
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);
  });

  socket.on('stop', () => {
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);
  });

  socket.on('report', () => {
    const p = getPartner(socket.id);
    console.log(`🚩 ${socket.id} reported ${p || 'nobody'}`);
    // In production: log to DB, auto-ban repeat offenders
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);
    socket.emit('reported');
  });

  socket.on('disconnect', () => {
    onlineCount = Math.max(0, onlineCount - 1);
    broadcast();
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);
    socketMeta.delete(socket.id);
    console.log(`- ${socket.id} (${onlineCount} online)`);
  });
});

// Health
app.get('/health', (_, res) => res.json({ ok: true, online: onlineCount, rooms: activeRooms.size }));

// Fallback to React index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`\n  MeetRandom → http://localhost:${PORT}\n`));
