document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const userModal = document.getElementById('user-modal');
    const playModeModal = document.getElementById('play-mode-modal');
    const joinRoomModal = document.getElementById('join-room-modal');
    const createRoomModal = document.getElementById('create-room-modal');
    const gameContent = document.getElementById('game-content');
    
    gameContent.classList.add('blur');
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      userModal.classList.remove('active');
      playModeModal.classList.add('active');
    });
  
    document.getElementById('random-player').addEventListener('click', () => {
      playModeModal.classList.remove('active');
      gameContent.classList.remove('blur');
    });
  
    document.getElementById('create-room').addEventListener('click', () => {
      playModeModal.classList.remove('active');
      createRoomModal.classList.add('active');
      document.getElementById('created-room-id').textContent = generateRoomId(); // Generate and display the room ID
    });
  
    document.getElementById('join-room').addEventListener('click', () => {
      playModeModal.classList.remove('active');
      joinRoomModal.classList.add('active');
    });
  
    document.getElementById('join-room-form').addEventListener('submit', (e) => {
      e.preventDefault();
      joinRoomModal.classList.remove('active');
      gameContent.classList.remove('blur');
    });
  
    document.getElementById('start-game').addEventListener('click', () => {
      createRoomModal.classList.remove('active');
      gameContent.classList.remove('blur');
    });
  
    function generateRoomId() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  });
  