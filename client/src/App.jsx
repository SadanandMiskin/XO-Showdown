import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Home from './components/Home';
import Room from './components/Room';
import './styles.css';
import { socketSeverUrl } from '../inits';
import Loading from './components/Loading';

const socket = io(socketSeverUrl, {
  transports: ['polling', 'websocket'],
  upgrade: false,
  rejectUnauthorized: false,
  withCredentials: true
});

function App() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      setLoading(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

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