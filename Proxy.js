// ... existing code ...

// Update voice participants display
function updateVoiceParticipants() {
  const container = document.getElementById('voice-participants');
  container.innerHTML = '';
  
  // Add yourself
  const you = document.createElement('div');
  you.className = `participant participant-you ${isMuted ? 'participant-muted' : ''}`;
  you.innerHTML = `<i class="fas fa-user"></i> ${myName} (You) ${isMuted ? '<i class="fas fa-microphone-slash"></i>' : ''}`;
  container.appendChild(you);
  
  // Add other participants
  Object.entries(voiceConnections).forEach(([id, conn]) => {
    const participant = document.createElement('div');
    participant.className = `participant ${conn.isMuted ? 'participant-muted' : ''}`;
    participant.innerHTML = `<i class="fas fa-user"></i> ${id} ${conn.isMuted ? '<i class="fas fa-microphone-slash"></i>' : ''}`;
    container.appendChild(participant);
  });
}

// Add new event for remote mute states
socket.on('remoteMuteState', ({ playerId, isMuted }) => {
  if (voiceConnections[playerId]) {
    voiceConnections[playerId].isMuted = isMuted;
    updateVoiceParticipants();
  }
});

// Update mute button handler
document.getElementById('mute-mic-btn').onclick = () => {
  isMuted = !isMuted;
  
  if (voiceStream) {
    voiceStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }
  
  // Broadcast mute state to others
  socket.emit('muteState', { isMuted, room: myRoom });
  
  // ... rest of mute button code ...
};
