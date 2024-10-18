import React from 'react';

function Board({ board, onMove, disabled }) {
  return (
    <div className="board">
      {board.map((row, i) => (
        <div key={i} className="row">
          {row.map((cell, j) => (
            <button
              key={`${i}-${j}`}
              className={`cell ${cell || ''}`}
              onClick={() => onMove(i, j)}
              disabled={disabled || cell !== null}
            >
              {cell}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;