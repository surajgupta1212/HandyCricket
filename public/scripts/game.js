const me = document.getElementById('me');
const myStatus = document.getElementById('my-status');
const opponent = document.getElementById('opponent');
const opponentStatus = document.getElementById('opponent-status');
const roomId = document.getElementById('room-id');
const scoreBoardTitle = document.getElementById('score-title');
const scoreBoard = document.getElementById('score-value');
const overs = document.getElementById('overs-value');
const gameContent = document.getElementById('game-content');
const userForm = document.getElementById('user-form');
const userModal = document.getElementById('user-modal');
const playModeModal = document.getElementById('play-mode-modal');
const playRandom = document.getElementById('random-player');
const createdRoomId = document.getElementById('created-room-id');
const createdRoomLink = document.getElementById('created-room-link');
const createRoom = document.getElementById('create-room');
const createRoomModal = document.getElementById('create-room-modal');
const joinRoom = document.getElementById('join-room');
const joinRoomForm = document.getElementById('join-room-form');
const joinRoomModal = document.getElementById('join-room-modal');
const info = document.getElementById('info-modal-message');
const infoModal = document.getElementById('info-modal');
const choiceModal = document.getElementById('choice-modal');
const gameOverMessage = document.getElementById('game-over-modal-message');
const gameOverModal = document.getElementById('game-over-modal');
const leftHand = document.getElementById('left-hand');
const rightHand = document.getElementById('right-hand');
const copyRoomIdBtn = document.getElementById('copy-room-id');
const copyRoomLinkBtn = document.getElementById('copy-room-link');
const joinRoomButton = document.getElementById('join-room');
const roomIDInput = document.getElementById('room-id');


const blueHands = [
  '/images/blue-fist.png',
  '/images/blue-one.png',
  '/images/blue-one.png',
  '/images/blue-one.png',
  '/images/blue-one.png',
  '/images/blue-one.png',
  '/images/blue-one.png',  
];
const redHands = [
  '/images/red-fist.png',
  '/images/red-one.png',
  '/images/red-one.png',
  '/images/red-one.png',
  '/images/red-one.png',
  '/images/red-one.png',
  '/images/red-one.png',  
  ];
  
class Game {
  constructor() {
    this.pause = false;
    this.roomId = null;
    this.me = { name: null, id: null };
    this.opponent = { name: null, id: null };
    this.score = { runs: 0, balls: 0, target: null, ballsPlayed: null };
    this.status = { batter: null, bowler: null, inning: 1, winner: null };
    this.selectedValue = null;
    gameContent.classList.add('blur');
    showModal(userModal);  
  }

  updateInfo(id, room) {
    this.me.id = id;
    this.roomId = room;
    roomId.innerText = room;  
  }

  updateOpponent(players) {
    hideModal(createRoomModal);
    const headButton = document.getElementById('button-1');
    const tailButton = document.getElementById('button-2');
    headButton.innerText = 'Head';
    tailButton.innerText = 'Tail';
    if (this.me.id === players[0].id) {
      this.opponent.id = players[1].id;
      this.opponent.name = players[1].name;
      opponent.innerText = players[1].name;
      document.getElementById('choice-modal-message').innerText =
        'Choose Head or Tail';
      tailButton.classList.remove('hide');  
      headButton.classList.remove('hide');
      tailButton.disabled = false;
      headButton.disabled = false;
      showModal(choiceModal);
      headButton.onclick = () => socket.emit('tossCall', this.roomId, 'heads');
      tailButton.onclick = () => socket.emit('tossCall', this.roomId, 'tails');  
    } else {
      this.opponent.id = players[0].id;
      this.opponent.name = players[0].name;
      opponent.innerText = players[0].name;
      document.getElementById('choice-modal-message').innerText =
        'Toss is happening!\nYour opponent is choosing.';
      tailButton.classList.add('hide');  
      headButton.classList.add('hide');
      tailButton.disabled = true;
      headButton.disabled = true;
      showModal(choiceModal);  
    }  
  }

  start(data) {
    hideModal(choiceModal);
    if (
      (data.id === this.me.id && data.choice === 'bat') ||
      (data.id === this.opponent.id && data.choice === 'ball')  
    ) {
      this.status.batter = this.me.id;
      this.status.bowler = this.opponent.id;  
    } else {
      this.status.batter = this.opponent.id;
      this.status.bowler = this.me.id;  
    }

    if (this.me.id === this.status.batter) {
      info.innerText = 'Batting';  
    } else {
      info.innerText = 'Bowling';  
    }
    showModal(infoModal);
    setTimeout(() => {
      hideModal(infoModal);
      leftHand.classList.add('left-hand-animation');
      rightHand.classList.add('right-hand-animation');  
    }, 2000);

    document
      .querySelectorAll('input[type="radio"]')
      .forEach(radioButton => (radioButton.checked = false));
    const bottomBox = document.getElementById('bottom-box');  
    bottomBox.addEventListener('change', e => {
      if (e.target.matches('input[type="radio"]')) {
        this.selectedValue = e.target.value;  
      }  
    });
    setTimeout(
      () => socket.emit('choice', this.roomId, this.selectedValue),
      8000  
    );  
  }

  updateScore(choices) {
    leftHand.classList.remove('left-hand-animation');
    rightHand.classList.remove('right-hand-animation');
    leftHand.src = blueHands[Number(choices[this.me.id] | 0)];
    rightHand.src = redHands[Number(choices[this.me.id] | 0)];
    if (choices[this.me.id] === null || choices[this.me.id] === null) {
      info.innerText = 'NO BALL';
      showModal(infoModal);
      setTimeout(() => {
        hideModal(infoModal);
        leftHand.src = blueHands[0];
        rightHand.src = redHands[0];  
      }, 1200);  
    } else if (this.status.inning === 1) {
      if (choices[this.me.id] === choices[this.opponent.id]) {
        info.innerText = 'OUT';
        showModal(infoModal);
        setTimeout(() => {
          hideModal(infoModal);
          leftHand.src = blueHands[0];
          rightHand.src = redHands[0];  
        }, 1200);
        this.pause = true;
        this.score.target = this.score.runs + 1;
        this.score.ballsPlayed = this.score.balls + 1;  
      } else {
        this.score.runs += Number(choices[this.status.batter]);
        this.score.balls += 1;
        info.innerText = `${choices[this.status.batter]} ${choices[this.status.batter] == 1 ? 'run' : 'runs'}`;
        showModal(infoModal);
        setTimeout(() => {
          hideModal(infoModal);
          leftHand.src = blueHands[0];
          rightHand.src = redHands[0];  
        }, 1200);  
      }  
    } else {
      if (choices[this.me.id] === choices[this.opponent.id]) {
        info.innerText = 'OUT';
        showModal(infoModal);
        setTimeout(() => {
          hideModal(infoModal);
          leftHand.src = blueHands[0];
          rightHand.src = redHands[0];  
        }, 1200);
        this.score.balls += 1;
        this.pause = true;
        if (this.score.runs + 1 === this.score.target)
          this.status.winner = 'draw';  
        else if (this.me.id === this.status.batter)
          this.status.winner = this.opponent.id;  
        else this.status.winner = this.me.id;  
      } else {
        this.score.runs += Number(choices[this.status.batter]);
        this.score.balls += 1;
        info.innerText = `${choices[this.status.batter]} ${choices[this.status.batter] == 1 ? 'run' : 'runs'}`;
        showModal(infoModal);
        setTimeout(() => {
          hideModal(infoModal);
          leftHand.src = blueHands[0];
          rightHand.src = redHands[0];  
        }, 1200);
        if (this.score.runs >= this.score.target) {
          this.pause = true;
          if (this.me.id === this.status.batter)
            this.status.winner = this.me.id;  
          else this.status.winner = this.opponent.id;  
        }  
      }  
    }
    this.showScore();  
  }

  showScore() {
    if (this.me.id === this.status.batter) {
      myStatus.innerText = `${this.score.runs} ${this.score.runs == 1 ? 'run' : 'runs'}`;
      opponentStatus.innerText = 'bowling';  
    } else {
      myStatus.innerText = 'bowling';
      opponentStatus.innerText = `${this.score.runs} ${this.score.runs == 1 ? 'run' : 'runs'}`;  
    }
    if (this.status.inning === 1) {
      scoreBoardTitle.innerText = 'Score:';
      scoreBoard.innerText = `${this.score.runs} ${this.score.runs == 1 ? 'run' : 'runs'}`;  
    } else {
      scoreBoardTitle.innerText = 'Target:';
      scoreBoard.innerText = `${this.score.target} ${this.score.runs == 1 ? 'run' : 'runs'}`;  
    }
    overs.innerText = `${(this.score.balls / 6) | 0}.${this.score.balls % 6}`;  
  }  
}

const socket = io();
let game = new Game();

// emitting events
socket.on('socketId', (id, room) => {
  game.updateInfo(id, room);  
});

socket.on('roomCreated', roomId => {
  createdRoomId.innerText = roomId;
  createdRoomLink.innerText = `${window.location.origin}?room=${roomId}`;  
});

socket.on('waiting', () => {
  info.innerText = 'Waiting for opponent to join ...';
  showModal(infoModal);  
});

socket.on('startToss', players => {
  hideModal(infoModal);
  game.updateOpponent(players);  
});

socket.on('tossResult', data => {
  hideModal(choiceModal);
  const batButton = document.getElementById('button-1');
  batButton.innerText = 'Bat';
  const ballButton = document.getElementById('button-2');
  ballButton.innerText = 'Ball';
  if (data.tossWinner === game.me.id) {
    document.getElementById('choice-modal-message').innerText =
      'You want to bat or ball?';
    batButton.classList.remove('hide');  
    ballButton.classList.remove('hide');
    batButton.disabled = false;
    ballButton.disabled = false;
    batButton.onclick = () => socket.emit('start', game.roomId, 'bat');
    ballButton.onclick = () => socket.emit('start', game.roomId, 'ball');
    showModal(choiceModal);  
  } else {
    document.getElementById('choice-modal-message').innerText =
      'Your opponent won the toss.';
    batButton.classList.add('hide');  
    ballButton.classList.add('hide');
    batButton.disabled = true;
    ballButton.disabled = true;
    showModal(choiceModal);  
  }  
});

socket.on('startGame', data => {
  game.start(data);  
});

socket.on('choose', () => {
  if (game.pause) {
    if (game.status.inning === 1) {
      game.status.inning = 2;
      game.score.runs = 0;
      game.score.balls = 0;
      [game.status.batter, game.status.bowler] = [
        game.status.bowler,
        game.status.batter,  
      ];
      info.innerText = 'Scorecard will shown [here]';
      showModal(infoModal);
      setTimeout(() => {
        game.showScore();
        hideModal(infoModal);
        leftHand.classList.add('left-hand-animation');
        rightHand.classList.add('right-hand-animation');
        setTimeout(
          () => socket.emit('choice', game.roomId, game.selectedValue),
          8000  
        );  
      }, 8000);
      game.pause = false;
      game.selectedValue = null;
      document
        .querySelectorAll('input[type="radio"]')
        .forEach(radioButton => (radioButton.checked = false));
      const bottomBox = document.getElementById('bottom-box');  
      bottomBox.addEventListener('change', e => {
        if (e.target.matches('input[type="radio"]')) {
          game.selectedValue = e.target.value;  
        }  
      });  
    } else {
      if (game.status.winner === 'draw') gameOverMessage.innerText = 'Draw!';
      else if (game.status.winner === game.me.id)
        gameOverMessage.innerText = 'You won the game!';  
      else gameOverMessage.innerText = 'You lose the game!';
      showModal(gameOverModal);
      document.getElementById('play-again').addEventListener('click', () => {
        hideModal(gameOverModal);
        game = new Game();  
      });  
    }  
  } else {
    game.selectedValue = null;
    document
      .querySelectorAll('input[type="radio"]')
      .forEach(radioButton => (radioButton.checked = false));
    const bottomBox = document.getElementById('bottom-box');  
    bottomBox.addEventListener('change', e => {
      if (e.target.matches('input[type="radio"]')) {
        game.selectedValue = e.target.value;  
      }  
    });
    leftHand.classList.add('left-hand-animation');
    rightHand.classList.add('right-hand-animation');
    setTimeout(
      () => socket.emit('choice', game.roomId, game.selectedValue),
      8000  
    );  
  }  
});

socket.on('choicesMade', choices => {
  game.updateScore(choices);  
});

socket.on('error', message => {
  console.log(`Error : ${message}`);  
});

socket.on('opponentDisconnected', () => {
  info.innerText = 'Your opponent has disconnected. The game is over.';
  showModal(infoModal);
  setTimeout(() => hideModal(infoModal), 5000);  
});

// eventlisteners
window.addEventListener('load', () => {
  const usernameInput = document.getElementById('username');
  usernameInput.focus();
  usernameInput.select();
  
});

// Function to show the modal and focus on the input field
joinRoomButton.addEventListener('click', () => {
  joinRoomModal.style.display = 'block';
  roomIDInput.focus();
  roomIDInput.select(); // This will select the text inside the input
});

// Close the modal when clicking outside of it 
window.addEventListener('click', (event) => {
  if (event.target == joinRoomModal) {
    joinRoomModal.style.display = 'none';
  }
});

userForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  game.me.name = data.get('username');
  me.innerText = game.me.name;
  const urlParams = new URLSearchParams(window.location.search);
  const roomID = urlParams.get('room');
  hideModal(userModal);
  if (roomID) {
    socket.emit('joinRoom', roomID);
    const baseUrl = window.location.href.split('?')[0];
    history.replaceState({}, document.title, baseUrl);  
  } else {
    showModal(playModeModal);  
  }
  userForm.reset();  
});

playRandom.addEventListener('click', () => {
  socket.emit('joinRandom', game.me.name);
  hideModal(playModeModal);
  gameContent.classList.remove('blur');  
});

createRoom.addEventListener('click', () => {
  socket.emit('createRoom', game.me.name);
  hideModal(playModeModal);
  showModal(createRoomModal);  
});

joinRoom.addEventListener('click', () => {
  hideModal(playModeModal);
  showModal(joinRoomModal);
    
});

joinRoomForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const roomId = data.get('room-id');
  socket.emit('joinRoom', roomId, game.me.name);
  hideModal(joinRoomModal);
  gameContent.classList.remove('blur');  
  joinRoomModal.style.display = 'none';

});

document.getElementById('start-game').addEventListener('click', () => {
  hideModal(createRoomModal);
  gameContent.classList.remove('blur');  
});

// functions
function toggleBackgroundEvents(enable) {
  if (enable) {
    document.body.classList.remove('modal-active');  
  } else {
    document.body.classList.add('modal-active');  
  }  
}

function showModal(modal) {
  modal.classList.add('active');
  toggleBackgroundEvents(false);  
}

function hideModal(modal) {
  modal.classList.remove('active');
  toggleBackgroundEvents(true);  
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard');  
  }).catch(err => {
    console.error('Failed to copy: ', err);  
  });  
}


copyRoomIdBtn.addEventListener('click', () => {
  copyToClipboard(createdRoomId.innerText);
});

copyRoomLinkBtn.addEventListener('click', () => {
  copyToClipboard(createdRoomLink.innerText);
});





