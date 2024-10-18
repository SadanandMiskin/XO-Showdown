// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = require('socket.io')(server, {
    cors: {
      origin: ['https://xoshowdown.vercel.app'], // Allow specific origin
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['polling', 'websocket']
  });
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('XO Game Server is running');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Create Room
  socket.on('create-room', async ({ roomId, playerName }) => {
    try {
      console.log('Creating room:', roomId, 'for player:', playerName);
      
      // Check if room already exists
      let room = await Room.findOne({ roomId });
      if (room) {
        socket.emit('room-error', { message: 'Room already exists' });
        return;
      }

      // Create new room
      room = new Room({
        roomId,
        players: [{
          id: socket.id,
          name: playerName,
          symbol: 'X'
        }],
        board: Array(3).fill(null).map(() => Array(3).fill(null)),
        currentTurn: socket.id,
        status: 'waiting'
      });
      
      await room.save();
      socket.join(roomId);
      socket.emit('room-joined', room);
      io.to(roomId).emit('room-update', room);
      
      console.log('Room created successfully:', roomId);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('room-error', { message: 'Failed to create room' });
    }
  });

  // Join Room
  socket.on('join-room', async ({ roomId, playerName }) => {
    try {
      console.log('Joining room:', roomId, 'for player:', playerName);
      
      const room = await Room.findOne({ roomId });
      
      if (!room) {
        socket.emit('room-error', { message: 'Room not found' });
        return;
      }

      if (room.players.length >= 2) {
        socket.emit('room-error', { message: 'Room is full' });
        return;
      }

      // Check if player is already in the room
      const existingPlayer = room.players.find(p => p.name === playerName);
      if (existingPlayer) {
        socket.emit('room-error', { message: 'Player name already taken in this room' });
        return;
      }

      // Add player to room
      room.players.push({
        id: socket.id,
        name: playerName,
        symbol: 'O'
      });
      
      if (room.players.length === 2) {
        room.status = 'playing';
      }
      
      await room.save();
      socket.join(roomId);
      socket.emit('room-joined', room);
      io.to(roomId).emit('room-update', room);
      
      console.log('Player joined room successfully:', roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('room-error', { message: 'Failed to join room' });
    }
  });

  // Make Move
  socket.on('make-move', async ({ roomId, row, col }) => {
    try {
      console.log('Move attempt:', { roomId, row, col, playerId: socket.id });
      
      const room = await Room.findOne({ roomId });
      if (!room || room.status !== 'playing') {
        console.log('Invalid move: Room not found or game not in playing state');
        return;
      }
      
      if (room.currentTurn === socket.id && !room.board[row][col]) {
        const player = room.players.find(p => p.id === socket.id);
        if (!player) {
          console.log('Invalid move: Player not found');
          return;
        }
  
        // Update board
        const newBoard = JSON.parse(JSON.stringify(room.board));
        newBoard[row][col] = player.symbol;
        room.board = newBoard;
        
        // Emit the updated room state to clients first (including the last move)
        await room.save();
        io.to(roomId).emit('room-update', room);
        
        // Delay to ensure clients render the last move
        setTimeout(async () => {
          // Check for winner
          if (checkWinner(room.board, player.symbol)) {
            room.status = 'finished';
            await room.save();
            io.to(roomId).emit('game-over', { winner: player.name });
            setTimeout(() => resetGame(room), 2000);
          } 
          // Check for draw
          else if (isBoardFull(room.board)) {
            room.status = 'finished';
            await room.save();
            io.to(roomId).emit('game-over', { winner: 'draw' });
            setTimeout(() => resetGame(room), 2000);
          } 
          // Continue game
          else {
            room.currentTurn = room.players.find(p => p.id !== socket.id).id;
            await room.save();
            io.to(roomId).emit('room-update', room);
          }
        }, 100); // Small delay to ensure the move is rendered before the game-over message
      } else {
        console.log('Invalid move: Not player\'s turn or cell already occupied');
      }
    } catch (error) {
      console.error('Error processing move:', error);
    }
  });
  

  // Leave Room
  socket.on('leave-room', async ({ roomId }) => {
    try {
      console.log('Player leaving room:', roomId);
      
      const room = await Room.findOne({ roomId });
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          await Room.deleteOne({ roomId });
          console.log('Room deleted:', roomId);
        } else {
          room.status = 'waiting';
          await room.save();
          io.to(roomId).emit('room-update', room);
        }
        socket.leave(roomId);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    try {
      console.log('Client disconnected:', socket.id);
      
      const rooms = await Room.find({ 'players.id': socket.id });
      for (const room of rooms) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          await Room.deleteOne({ roomId: room.roomId });
          console.log('Room deleted:', room.roomId);
        } else {
          room.status = 'waiting';
          await room.save();
          io.to(room.roomId).emit('room-update', room);
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Helper Functions
function checkWinner(board, symbol) {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i].every(cell => cell === symbol)) {
      return true;
    }
  }
  
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board.every(row => row[i] === symbol)) {
      return true;
    }
  }
  
  // Check diagonals
  if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
    return true;
  }
  if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
    return true;
  }
  
  return false;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== null));
}

async function resetGame(room) {
  try {
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId: room.roomId },
      {
        $set: {
          board: Array(3).fill(null).map(() => Array(3).fill(null)),
          currentTurn: room.players[0].id,
          status: 'playing'
        }
      },
      { new: true }
    );

    if (updatedRoom) {
      io.to(room.roomId).emit('room-update', updatedRoom);
    }
  } catch (error) {
    console.error('Error resetting game:', error);
  }
}

// Error handling for the Express app
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});