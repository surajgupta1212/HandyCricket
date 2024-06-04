const playerName = prompt("HandyCricket\nEnter your name : ");
let myId,
  opponentId,
  roomId,
  batter,
  baller,
  score = 0,
  target = 0,
  inning = 1;
console.log(`Your name = ${playerName}`);

const socket = io();

document.getElementById("createRoom").addEventListener("click", () => {
  socket.emit("createRoom");
});

document.getElementById("joinRoom").addEventListener("click", () => {
  const roomID = prompt("Enter Room ID:");
  socket.emit("joinRoom", roomID);
});

document.getElementById("joinRandom").addEventListener("click", () => {
  socket.emit("joinRandom");
});

const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get("room");
if (roomID) {
  socket.emit("joinRoom", roomID);
  const baseUrl = window.location.href.split("?")[0];
  history.replaceState({}, document.title, baseUrl);
}

socket.on("roomCreated", (roomID) => {
  console.log(
    `Room created. Share this link with your friend to join: ${window.location.origin}?room=${roomID}`
  );
});

socket.on("socketId", (id, room) => {
  myId = id;
  roomId = room;
});

socket.on("waiting", () => {
  console.log("waiting...");
});

socket.on("startToss", (players) => {
  if (myId === players[0]) {
    opponentId = players[1];
    const tossCall = prompt("heads/tails:");
    socket.emit("tossCall", roomId, tossCall);
  } else {
    opponentId = players[0];
    console.log("[TOSS] opponent is choosing!");
  }
});

socket.on("tossResult", (data) => {
  console.log(`It's a ${data.tossResult}`);
  console.log(data.tossWinner);
  if (data.tossWinner === myId) {
    console.log(`you won the toss.`);
    const choice = prompt("choose bat/ball:");
    console.log(`I choose to ${choice}`);
    socket.emit("start", roomId, choice);
  } else {
    console.log(`opponent won the toss.`);
  }
});

socket.on("startGame", (data) => {
  if (
    (data.id === myId && data.choice === "bat") ||
    (data.id === opponentId && data.choice === "ball")
  ) {
    batter = myId;
    baller = opponentId;
  } else {
    batter = opponentId;
    baller = myId;
  }
  const choice = prompt("[1-6]:");
  socket.emit("choice", roomId, choice);
});

socket.on("choose", () => {
  const choice = prompt("[1-6]:");
  socket.emit("choice", roomId, choice);
});

socket.on("choicesMade", (choices) => {
  console.log(
    `Your choice: ${choices[myId]}, Opponent's choice: ${choices[opponentId]}`
  );
  if (inning === 1) {
    if (choices[myId] === choices[opponentId]) {
      console.log("[OUT]");
      console.log("[Target] : ", score);
      target = score;
      score = 0;
      [batter, baller] = [baller, batter];
      inning = 2;
    } else {
      score += Number(choices[batter]);
      console.log(`>> score : ${score}`);
    }
  } else {
    if (choices[myId] === choices[opponentId]) {
      console.log("[OUT]");
      console.log(`>> target : ${target}`);
      console.log(`>> score : ${score}`);
      if (myId === batter) alert("GameOver! You lose");
      else alert("GameOver! You won");
    } else {
      score += Number(choices[batter]);
      console.log(`>> target : ${target}`);
      console.log(`>> score : ${score}`);
      if (score >= target) {
        if (myId === batter) alert("GameOver! You won");
        else alert("GameOver! You lose");
      }
    }
  }
});

socket.on("error", (message) => {
  console.log(`Error : ${message}`);
});

socket.on("opponentDisconnected", () => {
  alert("Your opponent has disconnected. The game is over.");
});
