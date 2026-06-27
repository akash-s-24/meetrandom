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
const activeRooms  = new Map();    // roomId -> { users, createdAt, friendRequests }
const socketToRoom = new Map();    // socketId -> roomId
const socketMeta   = new Map();    // socketId -> { userId, nickname, gender, country, interests, targetGender, targetCountry }
let onlineCount    = 0;

// ── Helpers ────────────────────────────────────────────────────────

function findPartner(socketId, meta) {
  const { interests, targetGender, targetCountry, reconnectUserId } = meta;

  // Try to reconnect if requested
  if (reconnectUserId) {
    for (let [sId, m] of socketMeta.entries()) {
      if (m.userId === reconnectUserId && !socketToRoom.has(sId) && sId !== socketId) {
        removeFromQueue(sId);
        return { partnerId: sId, sharedInterests: [] };
      }
    }
  }

  // Iterate over waiting queue
  for (let i = 0; i < waitingQueue.length; i++) {
    const candidate = waitingQueue[i];
    if (candidate.socketId === socketId) continue;
    if (socketToRoom.has(candidate.socketId)) { waitingQueue.splice(i, 1); i--; continue; }
    
    const candidateMeta = socketMeta.get(candidate.socketId);
    if (!candidateMeta) { waitingQueue.splice(i, 1); i--; continue; }
    
    // Check filters
    if (targetGender && candidateMeta.gender !== targetGender) continue;
    if (targetCountry && candidateMeta.country !== targetCountry) continue;
    if (candidateMeta.targetGender && meta.gender !== candidateMeta.targetGender) continue;
    if (candidateMeta.targetCountry && meta.country !== candidateMeta.targetCountry) continue;

    // Check interest overlap
    if (interests && interests.length > 0 && candidateMeta.interests && candidateMeta.interests.length > 0) {
      const shared = interests.filter(t => candidateMeta.interests.includes(t));
      if (shared.length > 0) {
        waitingQueue.splice(i, 1);
        return { partnerId: candidate.socketId, sharedInterests: shared };
      }
    }
  }

  // Fallback: random match that satisfies filters
  for (let i = 0; i < waitingQueue.length; i++) {
    const candidate = waitingQueue[i];
    if (candidate.socketId === socketId) continue;
    if (socketToRoom.has(candidate.socketId)) continue;
    
    const candidateMeta = socketMeta.get(candidate.socketId);
    if (!candidateMeta) continue;

    // Check filters again
    if (targetGender && candidateMeta.gender !== targetGender) continue;
    if (targetCountry && candidateMeta.country !== targetCountry) continue;
    if (candidateMeta.targetGender && meta.gender !== candidateMeta.targetGender) continue;
    if (candidateMeta.targetCountry && meta.country !== candidateMeta.targetCountry) continue;

    waitingQueue.splice(i, 1);
    return { partnerId: candidate.socketId, sharedInterests: [] };
  }
  
  return null;
}

function createRoom(id1, id2) {
  const roomId = uuidv4();
  activeRooms.set(roomId, { users: [id1, id2], createdAt: Date.now(), friendRequests: new Set() });
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
    const meta = {
      userId: data?.userId || socket.id,
      nickname: data?.nickname || 'Anonymous',
      gender: data?.gender || null,
      country: data?.country || null,
      interests: interests,
      targetGender: data?.targetGender || null,
      targetCountry: data?.targetCountry || null,
      reconnectUserId: data?.reconnectUserId || null
    };
    
    socketMeta.set(socket.id, meta);

    // Clean up existing session
    disconnectPartner(socket.id);
    removeFromQueue(socket.id);

    const match = findPartner(socket.id, meta);
    if (match) {
      const roomId = createRoom(socket.id, match.partnerId);
      const partnerMeta = socketMeta.get(match.partnerId) || {};
      
      console.log(`⚡ ${socket.id} <-> ${match.partnerId} (shared: ${match.sharedInterests.join(', ') || 'none'})`);
      
      socket.emit('matched', { 
        roomId, 
        isInitiator: true, 
        sharedInterests: match.sharedInterests,
        partner: partnerMeta
      });
      
      io.to(match.partnerId).emit('matched', { 
        roomId, 
        isInitiator: false, 
        sharedInterests: match.sharedInterests,
        partner: meta
      });
    } else {
      waitingQueue.push({ socketId: socket.id, interests: meta.interests });
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
    let clean = text.trim().slice(0, 500);
    
    // Simple text moderation (profanity filter)
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick'];
    const regex = new RegExp(badWords.join('|'), 'gi');
    clean = clean.replace(regex, '***');

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

  // ── Emoji Reactions ─────────────────────────────────────────────
  socket.on('reaction', (emoji) => {
    if (typeof emoji !== 'string' || emoji.length > 4) return;
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('reaction', emoji);
  });

  // ── Icebreaker ──────────────────────────────────────────────────
  socket.on('icebreaker', (question) => {
    if (typeof question !== 'string' || question.length > 200) return;
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('icebreaker', question);
  });

  // ── Mini Games: Tic-Tac-Toe ─────────────────────────────────────
  socket.on('game-start', (gameType) => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('game-start', gameType);
  });

  socket.on('game-move', (data) => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('game-move', data);
  });

  socket.on('game-reset', () => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('game-reset');
  });

  // ── Mini Games: Would You Rather ────────────────────────────────
  socket.on('wyr-question', (question) => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('wyr-question', question);
  });

  socket.on('wyr-pick', (pick) => {
    const p = getPartner(socket.id);
    if (p) io.to(p).emit('wyr-pick', pick);
  });

  // ── Friend System ───────────────────────────────────────────────
  socket.on('friend-request', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = activeRooms.get(roomId);
    if (!room) return;
    const p = getPartner(socket.id);
    if (!p) return;

    room.friendRequests.add(socket.id);

    // Check if both users sent friend requests (mutual)
    if (room.friendRequests.has(p)) {
      // Both want to be friends! Generate a shared room code
      const friendCode = uuidv4().slice(0, 8).toUpperCase();
      socket.emit('friend-accepted', { roomCode: friendCode });
      io.to(p).emit('friend-accepted', { roomCode: friendCode });
      console.log(`💚 Friends: ${socket.id} <-> ${p} (code: ${friendCode})`);
    } else {
      // Notify partner about the request
      io.to(p).emit('friend-request-received');
    }
  });

  // ── Skip with Reason ────────────────────────────────────────────
  socket.on('skip-reason', (reason) => {
    const validReasons = ['inappropriate', 'not-interested', 'afk', 'browsing'];
    if (reason && validReasons.includes(reason)) {
      console.log(`📊 Skip reason from ${socket.id}: ${reason}`);
      // In production: store in DB for analytics
    }
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
