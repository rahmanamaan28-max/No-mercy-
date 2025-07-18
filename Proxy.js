// ... existing code ...

async function startVoiceChat() {
  try {
    document.getElementById('voice-chat-overlay').classList.remove('hidden');
    document.getElementById('voice-chat-status').textContent = 'Connecting...';
    
    // Get user media
    voiceStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    
    // Request peers from server
    socket.emit('getVoicePeers', myRoom);
    
    document.getElementById('voice-chat-status').textContent = 'Connected';
  } catch (err) {
    console.error('Error starting voice chat:', err);
    document.getElementById('voice-chat-status').textContent = 'Error: ' + err.message;
  }
}

function createPeerConnection(peerId, isInitiator) {
  const peer = new SimplePeer({
    initiator: isInitiator,
    trickle: true, // Changed to true for better NAT traversal
    stream: voiceStream,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  });

  // ... rest of createPeerConnection ...
}

// Add this new socket event handler
socket.on('voicePeers', (peerIds) => {
  document.getElementById('voice-chat-status').textContent = 'Connected';
  
  peerIds.forEach(peerId => {
    if (!voiceConnections[peerId] && peerId !== socket.id) {
      const isInitiator = socket.id < peerId;
      const peer = createPeerConnection(peerId, isInitiator);
      voiceConnections[peerId] = { peer };
    }
  });
});

// ... rest of client.js ...
