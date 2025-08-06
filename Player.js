const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skill: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'], required: true },
  basePrice: { type: Number, required: true },
  isSold: { type: Boolean, default: false },
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  sellingPrice: { type: Number }
});

module.exports = mongoose.model('Player', PlayerSchema);