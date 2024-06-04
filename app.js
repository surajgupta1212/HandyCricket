const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

const queue = [];
const rooms = {};

function generateRoomId(id) {
  return crypto.createHash("sha256").update(id).digest("hex").substring(0, 8);
}

io.on("connection", (socket) => {
  console.log(`[connected] : ${socket.id}`);

  socket.on("createRoom", () => {
    const roomId = generateRoomId(socket.id);
    socket.join(roomId);
    socket.emit("socketId", socket.id, roomId);
    rooms[roomId] = { players: [socket.id], choices: {} };
    socket.emit("roomCreated", roomId);
    console.log(`[room created] : ${roomId}`);
  });

  socket.on("joinRoom", (roomId) => {
    if (rooms[roomId] && rooms[roomId].players.length === 1) {
      socket.join(roomId);
      socket.emit("socketId", socket.id, roomId);
      rooms[roomId].players.push(socket.id);
      console.log(`[room joined] : ${socket.id} joined ${roomId}`);
      io.to(roomId).emit("startToss", rooms[roomId].players);
    } else if (rooms[roomId]) {
      socket.emit("error", "Room is full");
    } else {
      socket.emit("error", "Room doesn't exist");
    }
  });

  socket.on("joinRandom", () => {
    if (queue.length > 0) {
      const { socketId, roomId } = queue.shift();
      socket.join(roomId);
      socket.emit("socketId", socket.id, roomId);
      console.log(`[room joined] : ${socket.id} joined ${roomId}`);
      rooms[roomId].players.push(socket.id);
      io.to(roomId).emit("startToss", rooms[roomId].players);
    } else {
      const roomId = generateRoomId(socket.id);
      socket.join(roomId);
      socket.emit("socketId", socket.id, roomId);
      console.log(`[waiting] : ${socket.id} is waiting in ${roomId}`);
      rooms[roomId] = { players: [socket.id], choices: {} };
      queue.push({ socketId: socket.id, roomId });
      socket.emit("waiting");
    }
  });

  socket.on("tossCall", (roomId, call) => {
    const tossResult = Math.random() < 0.5 ? "heads" : "tails";
    const winner =
      call === tossResult
        ? socket.id
        : rooms[roomId].players[0] === socket.id
        ? rooms[roomId].players[1]
        : rooms[roomId].players[0];
    io.to(roomId).emit("tossResult", { tossResult, tossWinner: winner });
  });

  socket.on("start", (roomId, choice) => {
    io.to(roomId).emit("startGame", { id: socket.id, choice });
  });

  socket.on("choice", (roomId, choice) => {
    const room = rooms[roomId];
    if (room && room.players.includes(socket.id)) {
      room.choices[socket.id] = choice;
      if (Object.keys(room.choices).length === 2) {
        io.to(roomId).emit("choicesMade", room.choices);
        room.choices = {};
        setTimeout(() => {
          io.to(roomId).emit("choose");
        }, 2000);
      }
    }
  });

  socket.on("disconnect", () => {
    const roomIndex = queue.findIndex((room) => room.socketId === socket.id);
    if (roomIndex !== -1) {
      queue.splice(roomIndex, 1);
      console.log(
        `[disconnected] : ${socket.id} is disconnected - ${queue[roomIndex]?.roomId}`
      );
    } else {
      for (const room in rooms) {
        if (
          rooms.hasOwnProperty(room) &&
          rooms[room].players.includes(socket.id)
        ) {
          console.log(
            `[disconnected] : ${socket.id} is disconnected - ${room}`
          );
          io.to(room).emit("opponentDisconnected");
          delete rooms[room];
          break;
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`>> Server is running on port http://localhost:${PORT}`);
});
