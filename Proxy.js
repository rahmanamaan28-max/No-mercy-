// ... existing code ...

// Voice chat handlers
socket.on('getVoicePeers', (room) => {
  const roomSockets = io.sockets.adapter.rooms.get(room);
  if (roomSockets) {
    const peers = Array.from(roomSockets);
    socket.emit('voicePeers', peers);
    
    // Notify others about new peer
    socket.to(room).emit('newVoicePeer', socket.id);
  }
});

// ... rest of server.js ...
