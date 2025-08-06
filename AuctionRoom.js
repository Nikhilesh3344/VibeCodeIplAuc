import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the server. The URL should match your backend server address.
const socket = io('http://localhost:4000');

const AuctionRoom = () => {
  const [auctionState, setAuctionState] = useState({
    currentPlayer: null,
    currentBid: 0,
    highestBidder: null,
  });

  // This team name would come from props or context in a real app
  const myTeam = "Team A";

  useEffect(() => {
    // Listen for the initial state when connecting
    socket.on('auctionState', (initialState) => {
      setAuctionState(initialState);
    });

    // Listen for a new player being put up for auction
    socket.on('newPlayer', (state) => {
      setAuctionState(state);
    });

    // Listen for bid updates
    socket.on('bidUpdate', ({ currentBid, highestBidder }) => {
      setAuctionState(prevState => ({ ...prevState, currentBid, highestBidder }));
    });

    // Cleanup on component unmount
    return () => {
      socket.off('auctionState');
      socket.off('newPlayer');
      socket.off('bidUpdate');
    };
  }, []);

  const handlePlaceBid = () => {
    const newBid = auctionState.currentBid + 100000; // Example bid increment
    socket.emit('placeBid', { team: myTeam, bidAmount: newBid });
  };

  if (!auctionState.currentPlayer) {
    return <div>Waiting for the auction to start...</div>;
  }

  return (
    <div>
      <h1>{auctionState.currentPlayer.name} ({auctionState.currentPlayer.skill})</h1>
      <h2>Current Bid: ${auctionState.currentBid.toLocaleString()}</h2>
      <h3>Highest Bidder: {auctionState.highestBidder}</h3>
      <button onClick={handlePlaceBid}>Place Bid for {myTeam}</button>
    </div>
  );
};

export default AuctionRoom;