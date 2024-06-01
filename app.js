const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

// io logic
io.on("connection", (socket) => {
  console.log("New connection ...");
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});