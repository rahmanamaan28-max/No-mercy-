// ... existing code ...

// Add new mute state handler
socket.on('muteState', ({ isMuted, room }) => {
  socket.to(room).emit('remoteMuteState', { 
    playerId: socket.id, 
    isMuted 
  });
});

// ... rest of server.js ...
