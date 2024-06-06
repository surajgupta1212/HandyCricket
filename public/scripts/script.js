document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const userModal = document.getElementById('user-modal');
  const playModeModal = document.getElementById('play-mode-modal');
  const joinRoomModal = document.getElementById('join-room-modal');
  const createRoomModal = document.getElementById('create-room-modal');
  const gameContent = document.getElementById('game-content');

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

  gameContent.classList.add('blur');

  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideModal(userModal);
    showModal(playModeModal);
  });

  document.getElementById('random-player').addEventListener('click', () => {
    hideModal(playModeModal);
    gameContent.classList.remove('blur');
  });

  document.getElementById('create-room').addEventListener('click', () => {
    hideModal(playModeModal);
    showModal(createRoomModal);
    document.getElementById('created-room-id').textContent = generateRoomId();
  });

  document.getElementById('join-room').addEventListener('click', () => {
    hideModal(playModeModal);
    showModal(joinRoomModal);
  });

  document.getElementById('join-room-form').addEventListener('submit', (e) => {
    e.preventDefault();
    hideModal(joinRoomModal);
    gameContent.classList.remove('blur');
  });

  document.getElementById('start-game').addEventListener('click', () => {
    hideModal(createRoomModal);
    gameContent.classList.remove('blur');
  });

  function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});
