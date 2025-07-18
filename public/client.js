// ===================== // client.js // =====================

const socket = io(); let currentRoom = ''; let playerName = ''; let playerAvatar = '';

function createRoom() { playerName = document.getElementById('username').value; playerAvatar = document.getElementById('avatar').value; socket.emit('createRoom', { name: playerName, avatar: playerAvatar }); }

function joinRoom() { playerName = document.getElementById('username').value; playerAvatar = document.getElementById('avatar').value; const code = document.getElementById('roomCode').value.toUpperCase(); socket.emit('joinRoom', { roomCode: code, name: playerName, avatar: playerAvatar }); }

function drawCard() { socket.emit('drawCard', currentRoom); }

function playCard(card, newColor = null) { socket.emit('playCard', { roomCode: currentRoom, card, newColor }); }

socket.on('roomCreated', (roomCode) => { currentRoom = roomCode; document.getElementById('lobby').style.display = 'none'; document.getElementById('game').style.display = 'block'; document.getElementById('roomLabel').textContent = Room Code: ${roomCode}; });

socket.on('playersUpdate', (players) => { const board = document.getElementById('playerBoard'); board.innerHTML = ''; players.forEach(p => { const div = document.createElement('div'); div.textContent = ${p.avatar} ${p.name}; board.appendChild(div); }); });

socket.on('gameStarted', (data) => { updateHand(data.hand); updateGameState(data); });

socket.on('gameStateUpdate', (data) => { updateGameState(data); });

socket.on('handUpdate', (hand) => { updateHand(hand); });

socket.on('roundOver', (data) => { document.getElementById('game').style.display = 'none'; document.getElementById('roundOver').style.display = 'block'; document.getElementById('winnerMsg').textContent = ${data.winner} wins the round!; const board = document.getElementById('scoreBoard'); board.innerHTML = ''; data.scores.forEach(p => { const div = document.createElement('div'); div.textContent = ${p.name}: ${p.score}; board.appendChild(div); }); });

function updateGameState(data) { document.getElementById('topCard').textContent = ${data.topCard.color} ${data.topCard.value}; document.getElementById('currentColor').textContent = data.color; document.getElementById('turnLabel').textContent = Current Turn: ${data.currentTurn}; const board = document.getElementById('playerBoard'); board.innerHTML = ''; data.players.forEach(p => { const div = document.createElement('div'); div.textContent = ${p.avatar} ${p.name} (${p.handSize} cards) - ${p.score} pts; board.appendChild(div); }); }

function updateHand(hand) { const container = document.getElementById('hand'); container.innerHTML = ''; hand.forEach(card => { const div = document.createElement('div'); div.className = 'card'; div.textContent = ${card.color} ${card.value}; div.onclick = () => { if (card.color === 'wild') { const chosenColor = prompt('Choose a color: red, green, blue, yellow'); if (chosenColor) playCard(card, chosenColor); } else { playCard(card); } }; container.appendChild(div); }); }

