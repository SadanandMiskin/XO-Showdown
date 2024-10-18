import React from 'react';
import { io } from 'socket.io-client';
import Home from './components/Home';
import Room from './components/Room';
import './styles.css';
import { socketSeverUrl } from '../../inits';

console.log(socketSeverUrl)
const socket = io(socketSeverUrl);

function App() {
  const [playerName, setPlayerName] = React.useState('');
  const [roomId, setRoomId] = React.useState('');
  
  return (
    <div className="app">
      {!playerName ? (
        <Home 
          onJoin={(name) => setPlayerName(name)} 
        />
      ) : (
        <Room 
          socket={socket}
          playerName={playerName}
          roomId={roomId}
          setRoomId={setRoomId}
        />
      )}
    </div>
  );
}

export default App;