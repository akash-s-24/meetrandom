const { io } = require('socket.io-client');

const socket1 = io('http://localhost:3000');
const socket2 = io('http://localhost:3000');

socket1.on('connect', () => {
  console.log('Socket 1 connected:', socket1.id);
  socket1.emit('find-partner', { gender: '', targetGender: '' });
});

socket2.on('connect', () => {
  console.log('Socket 2 connected:', socket2.id);
  setTimeout(() => {
    socket2.emit('find-partner', { gender: '', targetGender: '' });
  }, 500);
});

socket1.on('matched', (data) => console.log('Socket 1 matched!', data));
socket2.on('matched', (data) => {
  console.log('Socket 2 matched!', data);
  process.exit(0);
});
socket1.on('waiting', () => console.log('Socket 1 waiting...'));
socket2.on('waiting', () => console.log('Socket 2 waiting...'));
