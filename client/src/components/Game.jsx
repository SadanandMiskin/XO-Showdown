import React from 'react';
import Board from './Board';

function Game({ socket, room, playerName }) {
  const [winner, setWinner] = React.useState(null);
  
  React.useEffect(() => {
    socket.on('game-over', ({ winner }) => {
      setWinner(winner);
      setTimeout(() => setWinner(null), 2000);
    });
    
    return () => {
      socket.off('game-over');
    };
  }, [socket]);
  
  const handleMove = (row, col) => {
    socket.emit('make-move', { roomId: room.roomId, row, col });
  };
  
  const player = room.players.find(p => p.name === playerName);
  const isMyTurn = room.currentTurn === player?.id;
  
  return (
    <div className="game">
      <div className="game-info">
        <div className="players">
          {room.players.map((p, i) => (
            <div 
              key={p.id} 
              className={`player ${p.id === room.currentTurn ? 'active' : ''}`}
            >
              {p.name} ({p.symbol})
            </div>
          ))}
        </div>
        {room.status === 'waiting' && (
          <div className="waiting">
            Waiting for opponent...
          </div>
        )}
        {winner && (
          <div className="winner">
            {winner === 'draw' ? "It's a draw!" : `${winner} wins!`}
          </div>
        )}
      </div>
      <Board
        board={room.board}
        onMove={handleMove}
        disabled={!isMyTurn || room.status !== 'playing'}
      />
    </div>
  );
}

export default Game;