const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: String,
  players: [{
    id: String,
    name: String,
    symbol: String
  }],
  board: [[String]],
  currentTurn: String,
  status: String
});

module.exports = mongoose.model('Room', roomSchema);