const me = document.getElementById("me");
const myStatus = document.getElementById("my-status");
const opponent = document.getElementById("opponent");
const opponentStatus = document.getElementById("opponent-status");
const roomId = document.getElementById("room-id");
const scoreBoardTitle = document.getElementById("score-title");
const scoreBoard = document.getElementById("score-value");
const overs = document.getElementById("overs-value");

class Game {
  constructor() {
    this.pause = false;
    this.roomId = null;
    this.me = { name: null, id: null };
    this.opponent = { name: null, id: null };
    this.score = { runs: 0, balls: 0, target: null, ballsPlayed: null };
    this.status = { batter: null, bowler: null, inning: 1 };
  }

  init() {
    this.me.name = prompt("HandyCricket\n\nEnter your name : ");
    me.innerText = this.me.name;

    const urlParams = new URLSearchParams(window.location.search);
    const roomID = urlParams.get("room");
    if (roomID) {
      socket.emit("joinRoom", roomID);
      const baseUrl = window.location.href.split("?")[0];
      history.replaceState({}, document.title, baseUrl);
    }

    socket.on("socketId", (id, room) => {
      this.updateInfo(id, room);
    });

    socket.on("roomCreated", (roomId) => {
      console.log(
        `Room created. Share this link with your friend to join: ${window.location.origin}?room=${roomId}`
      );
    });

    socket.on("waiting", () => {
      console.log("waiting...");
    });

    socket.on("startToss", (players) => {
      this.updateOpponent(players);
    });

    socket.on("tossResult", (data) => {
      console.log(`It's a ${data.tossResult}`);
      console.log(data.tossWinner);
      if (data.tossWinner === this.me.id) {
        console.log(`you won the toss.`);
        const choice = prompt("choose bat/ball:");
        console.log(`I choose to ${choice}`);
        socket.emit("start", this.roomId, choice);
      } else {
        console.log(`opponent won the toss.`);
      }
    });

    socket.on("startGame", (data) => {
      this.start(data);
    });

    socket.on("choose", () => {
      if (this.pause) {
        if (this.status.inning === 1) {
          // half inning
          // scoreboard with 10 s timer
          const choice = prompt("[1-6]:");
          socket.emit("choice", this.roomId, choice);
        }
      } else {
        const choice = prompt("[1-6]:");
        setTimeout(() => {
          socket.emit("choice", this.roomId, choice);
        }, 8000);
      }
    });

    socket.on("choicesMade", (choices) => {
      this.updateScore(choices);
    });

    socket.on("error", (message) => {
      console.log(`Error : ${message}`);
    });

    socket.on("opponentDisconnected", () => {
      alert("Your opponent has disconnected. The game is over.");
    });
  }

  updateInfo(id, room) {
    this.me.id = id;
    this.roomId = room;
    roomId.innerText = room;
  }

  updateOpponent(players) {
    if (this.me.id === players[0].id) {
      this.opponent.id = players[1].id;
      this.opponent.name = players[1].name;
      opponent.innerText = players[1].name;
      setTimeout(() => {
        const tossCall = prompt("heads/tails:");
        socket.emit("tossCall", this.roomId, tossCall);
      }, 2000);
    } else {
      this.opponent.id = players[0].id;
      this.opponent.name = players[0].name;
      opponent.innerText = players[0].name;
      console.log("[TOSS] opponent is choosing!");
    }
  }

  start(data) {
    if (
      (data.id === this.me.id && data.choice === "bat") ||
      (data.id === this.opponent.id && data.choice === "ball")
    ) {
      this.status.batter = this.me.id;
      this.status.bowler = this.opponent.id;
    } else {
      this.status.batter = this.opponent.id;
      this.status.bowler = this.me.id;
    }
    if (this.me.id === this.status.batter) {
      alert("Batting");
    } else {
      alert("Bowling");
    }
    const choice = prompt("[1-6]:");
    setTimeout(() => {
      socket.emit("choice", this.roomId, choice);
    }, 8000);
  }

  updateScore(choices) {
    console.log(
      `Your choice: ${choices[this.me.id]}, Opponent's choice: ${
        choices[this.opponent.id]
      }`
    );
    if (this.status.inning === 1) {
      if (choices[this.me.id] === choices[this.opponent.id]) {
        console.log(">> [OUT]");
        this.pause = true;
        this.score.target = this.score.runs;
        this.score.ballsPlayed = this.score.balls + 1;
        this.score.runs = 0;
        this.score.balls = 0;
        [this.status.batter, this.status.bowler] = [this.status.bowler, this.status.batter];
        this.status.inning = 2;
      } else {
        this.score.runs += Number(choices[this.status.batter]);
        this.score.balls += 1;
      }
    } else {
      if (choices[this.me.id] === choices[this.opponent.id]) {
        console.log(">> [OUT]");
        this.pause = true;
        this.score.balls += 1;
        if (this.me.id === this.status.batter) alert("GameOver! You lose");
        else alert("GameOver! You won");
      } else {
        this.score.runs += Number(choices[this.status.batter]);
        this.score.balls += 1;
        if (this.score.runs >= this.score.target) {
          this.pause = true;
          if (this.me.id === this.status.batter) alert("GameOver! You won");
          else alert("GameOver! You lose");
        }
      }
    }
    this.showScore();
  }

  showScore() {
    if (this.me.id === this.status.batter) {
      myStatus.innerText = `${this.score.runs} runs`;
      opponentStatus.innerText = "bowling";
    } else {
      myStatus.innerText = "bowling";
      opponentStatus.innerText = `${this.score.runs} runs`;
    }
    if (this.status.inning === 1) {
      scoreBoardTitle.innerText = "Score:";
      scoreBoard.innerText = `${this.score.runs} runs`;
    } else {
      scoreBoardTitle.innerText = "Target:";
      scoreBoard.innerText = `${this.score.target} runs`;
    }
    overs.innerText = `${(this.score.balls / 6)|0}.${this.score.balls % 6}`;
  }
}

const socket = io();
const game = new Game();
game.init();

// eventlistener
document.getElementById("createRoom").addEventListener("click", () => {
  socket.emit("createRoom", game.me.name);
});

document.getElementById("joinRoom").addEventListener("click", () => {
  const roomId = prompt("Enter Room ID:");
  socket.emit("joinRoom", roomId, game.me.name);
});

document.getElementById("joinRandom").addEventListener("click", () => {
  socket.emit("joinRandom", game.me.name);
});
