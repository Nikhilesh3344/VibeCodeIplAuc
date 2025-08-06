const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from our React client
    methods: ["GET", "POST"]
  }
});

// --- In-memory state for simplicity (replace with DB for production) ---
let auctionState = {
  currentPlayer: null, // Will hold player object
  currentBid: 0,
  highestBidder: null, // Will hold team name
  timer: 30,
  isAuctionLive: false,
};

// --- TODO: Database Connection ---
// mongoose.connect('mongodb://localhost/ipl-auction')
//   .then(() => console.log('MongoDB connected...'))
//   .catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send the current auction state to the newly connected client
  socket.emit('auctionState', auctionState);

  // Listen for a bid from a client
  socket.on('placeBid', ({ team, bidAmount }) => {
    if (bidAmount > auctionState.currentBid) {
      auctionState.currentBid = bidAmount;
      auctionState.highestBidder = team;

      // Broadcast the new bid to all clients
      io.emit('bidUpdate', {
        currentBid: auctionState.currentBid,
        highestBidder: auctionState.highestBidder
      });
    }
  });

  // --- Admin actions (for a future admin panel) ---
  socket.on('startAuction', (player) => {
    auctionState = {
      currentPlayer: player,
      currentBid: player.basePrice,
      highestBidder: 'Unsold',
      timer: 30,
      isAuctionLive: true,
    };
    // Broadcast that a new player is up for auction
    io.emit('newPlayer', auctionState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('IPL Auction Server is running!');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});