import React, { useState } from 'react';
import '../Home.css';

function Home({ onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
    }
  };

  return (
    <div className="home1">
      <div className="pixel-bg" />
      <h1>XO Showdown</h1>
      <p>Ready to play 1 vs 1 random or Play with Friends?</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Gamer Tag"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">PRESS START</button>
      </form>
      <div className="how-to-play">
        <h2>How to Play</h2>
        <ul>
          <li>🎮 Create a room or join a room</li>
          <li>👉 Send the room ID to your friend</li>
          <li>🕒️ Play a realtime 1v1 Tic Tac Toe showdown</li>
          <li>🏆 Compete and have fun!</li>
        </ul>
      </div>
      
      <div className="logo">❌⭕</div>
      <div className="call-to-action">
        <h2>Get Ready to Play!</h2>
        <p>Enter your name and join the battle!</p>
        <button className="play-btn">Playyyy!</button>
      </div>
    </div>
  );
}

export default Home;