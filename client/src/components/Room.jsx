// client/src/components/Room.js
import React from 'react';
import Game from './Game';
// import '../css/Room.css'

function Room({ socket, playerName, roomId, setRoomId }) {
  const [room, setRoom] = React.useState(null);
  const [error, setError] = React.useState('');
  
  React.useEffect(() => {
    // Listen for room updates
    socket.on('room-update', (updatedRoom) => {
      console.log('Room updated:', updatedRoom);
      setRoom(updatedRoom);
    });

    // Listen for room creation errors
    socket.on('room-error', (error) => {
      console.error('Room error:', error);
      setError(error.message);
    });

    // Listen for successful room join
    socket.on('room-joined', (roomData) => {
      console.log('Joined room:', roomData);
      setRoom(roomData);
    });
    
    return () => {
      socket.off('room-update');
      socket.off('room-error');
      socket.off('room-joined');
    };
  }, [socket]);
  
  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 6);
    console.log('Creating room:', newRoomId);
    socket.emit('create-room', { roomId: newRoomId, playerName });
    setRoomId(newRoomId);
    setError('');
  };
  
  const joinRoom = (id) => {
    if (!id.trim()) {
      setError('Please enter a room ID');
      return;
    }
    console.log('Joining room:', id);
    socket.emit('join-room', { roomId: id, playerName });
    setError('');
  };
  
  const leaveRoom = () => {
    console.log('Leaving room:', roomId);
    socket.emit('leave-room', { roomId });
    setRoom(null);
    setRoomId('');
    window.location.href  = '/'
  };

  console.log('Current room state:', room); // Debug log
  
  if (room) {
    return (
      <div className="room">
        <div className="room-info">
          <h2>Room: {room.roomId}</h2>
          <div className="player-list">
            Players:
            {room.players.map((p, i) => (
              <span key={p.id} className="player-name">
                {p.name} ({p.symbol})
              </span>
            ))}
          </div>
          <button onClick={leaveRoom} className='leave'>Leave Room</button>
        </div>
        <Game 
          socket={socket}
          room={room}
          playerName={playerName}
        />
      </div>
    );
  }
  
  return (
    <div className="room-select">
      <h2 className='wel'>Welcome, {playerName}!</h2>
      <div className="room-actions">
        <button onClick={createRoom} className="create-room-btn">
          Create New Room
        </button>
        <div className="join-room">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="room-input"
          />
          <button onClick={() => joinRoom(roomId)} className="join-room-btn">
            Join Room
          </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Room;
