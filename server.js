// ===================== // server.js // =====================

const express = require('express'); const http = require('http'); const { Server } = require('socket.io'); const app = express(); const server = http.createServer(app); const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

function generateRoomCode() { return Math.random().toString(36).substr(2, 5).toUpperCase(); }

function createDeck() { const colors = ['red', 'green', 'blue', 'yellow']; const values = ['0','1','2','3','4','5','6','7','8','9','skip','reverse','+2']; let deck = []; for (const color of colors) { for (const value of values) { deck.push({ color, value }); if (value !== '0') deck.push({ color, value }); } } for (let i = 0; i < 4; i++) { deck.push({ color: 'wild', value: 'wild' }); deck.push({ color: 'wild', value: '+4' }); } return deck.sort(() => Math.random() - 0.5); }

function isPlayable(card, topCard, currentColor) { return card.color === 'wild' || card.color === currentColor || card.value === topCard.value; }

io.on('connection', socket => { console.log('User connected:', socket.id);

socket.on('createRoom', ({ name, avatar }) => { const roomCode = generateRoomCode(); rooms[roomCode] = { players: [{ id: socket.id, name, avatar, hand: [], score: 0 }], deck: [], discard: [], turn: 0, color: null, direction: 1, stacking: 0, stackType: null }; socket.join(roomCode); socket.emit('roomCreated', roomCode); });

socket.on('joinRoom', ({ roomCode, name, avatar }) => { const room = rooms[roomCode]; if (!room) return socket.emit('error', 'Room not found'); room.players.push({ id: socket.id, name, avatar, hand: [], score: 0 }); socket.join(roomCode); io.to(roomCode).emit('playersUpdate', room.players.map(p => ({ name: p.name, avatar: p.avatar }))); });

socket.on('startGame', (roomCode) => { const room = rooms[roomCode]; if (!room) return;

room.deck = createDeck();
room.players.forEach(p => p.hand = room.deck.splice(0, 7));
room.discard = [room.deck.pop()];
room.turn = 0;
room.color = room.discard[0].color;
room.stacking = 0;
room.stackType = null;

room.players.forEach(p => {
  io.to(p.id).emit('gameStarted', {
    hand: p.hand,
    players: room.players.map(pl => ({ name: pl.name, avatar: pl.avatar, handSize: pl.hand.length, score: pl.score })),
    topCard: room.discard[room.discard.length - 1],
    currentTurn: room.players[room.turn].name,
    color: room.color
  });
});

});

socket.on('playCard', ({ roomCode, card, newColor }) => { const room = rooms[roomCode]; const playerIndex = room.players.findIndex(p => p.id === socket.id); if (playerIndex !== room.turn) return; const player = room.players[playerIndex];

const topCard = room.discard[room.discard.length - 1];
if (!isPlayable(card, topCard, room.color)) return;

const cardIndex = player.hand.findIndex(c => c.color === card.color && c.value === card.value);
if (cardIndex === -1) return;
player.hand.splice(cardIndex, 1);
room.discard.push(card);
room.color = card.color === 'wild' ? newColor : card.color;

if (card.value === 'reverse') room.direction *= -1;
if (card.value === 'skip') room.turn = (room.turn + room.direction + room.players.length) % room.players.length;
if (card.value === '+2') {
  room.stacking += 2;
  room.stackType = '+2';
}
if (card.value === '+4') {
  room.stacking += 4;
  room.stackType = '+4';
}

if (player.hand.length === 0) {
  player.score += 10;
  room.players.forEach(p => {
    if (p.id !== player.id) player.score += p.hand.length;
  });
  io.to(roomCode).emit('roundOver', {
    winner: player.name,
    scores: room.players.map(p => ({ name: p.name, score: p.score }))
  });
  return;
}

room.turn = (room.turn + room.direction + room.players.length) % room.players.length;
updateGameState(roomCode);

});

socket.on('drawCard', (roomCode) => { const room = rooms[roomCode]; const player = room.players[room.turn]; const card = room.deck.pop(); player.hand.push(card); io.to(player.id).emit('handUpdate', player.hand); });

function updateGameState(roomCode) { const room = rooms[roomCode]; room.players.forEach(p => { io.to(p.id).emit('gameStateUpdate', { players: room.players.map(pl => ({ name: pl.name, avatar: pl.avatar, handSize: pl.hand.length, score: pl.score })), topCard: room.discard[room.discard.length - 1], currentTurn: room.players[room.turn].name, color: room.color }); }); } });

server.listen(3000, () => console.log('UNO No Mercy running on http://localhost:3000'));

