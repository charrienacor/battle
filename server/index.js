import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, join } from "path"; // Import path methods

const app = express();
const server = createServer(app);
const io = new Server(server);

// Get the current directory from import.meta.url
const __filename = fileURLToPath(import.meta.url); // Get the file's URL path
const __dirname = dirname(__filename); // Get the directory name from the file

// Serve static files from the 'client' directory
app.use(express.static(join(__dirname, "../client")));

// When a player connects
let players = {}; // Store player scores and ids

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Initialize player with default score
  players[socket.id] = { score: 0 };

  // Listen for score updates from the client
  socket.on("updateScore", (score) => {
    players[socket.id].score = score;

    // Find the player with the highest score
    let highestScorePlayer = Object.entries(players).reduce((maxPlayer, [id, player]) => {
      return player.score > maxPlayer.score ? player : maxPlayer;
    });

    // Emit the highest score player to all clients
    io.emit("leaderboardUpdate", highestScorePlayer);
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id]; // Remove player from the list
  });
});

// Set up the server to listen on port 3000
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
