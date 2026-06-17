const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const timeText = document.getElementById('timeText');
const scoreText = document.getElementById('scoreText');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startButton = document.getElementById('startButton');

const GAME_TIME = 30;
const PLAYER_SPEED = 6;

let player;
let obstacles;
let keys;
let score;
let elapsedTime;
let obstacleSpawnTimer;
let obstacleSpawnInterval;
let animationId;
let lastTimestamp;
let gameState;

function resetGame() {
  player = {
    width: 52,
    height: 26,
    x: canvas.width / 2 - 26,
    y: canvas.height - 58,
    speed: PLAYER_SPEED
  };

  obstacles = [];
  keys = {
    left: false,
    right: false
  };

  score = 0;
  elapsedTime = 0;
  obstacleSpawnTimer = 0;
  obstacleSpawnInterval = 0.85;
  lastTimestamp = 0;
  gameState = 'ready';

  updateStatus();
  drawGame();
}

function startGame() {
  cancelAnimationFrame(animationId);
  resetGame();
  gameState = 'playing';
  overlay.classList.add('hidden');
  animationId = requestAnimationFrame(gameLoop);
}

function endGame(result) {
  gameState = result;
  cancelAnimationFrame(animationId);

  if (result === 'win') {
    overlayTitle.textContent = '승리!';
    overlayMessage.textContent = `30초 생존 성공. 최종 점수: ${score}`;
  } else {
    overlayTitle.textContent = '패배';
    overlayMessage.textContent = `장애물에 충돌했습니다. 최종 점수: ${score}`;
  }

  startButton.textContent = '다시 시작';
  overlay.classList.remove('hidden');
}

function gameLoop(timestamp) {
  if (gameState !== 'playing') return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  updateGame(deltaTime);
  drawGame();

  animationId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  elapsedTime += deltaTime;
  obstacleSpawnTimer += deltaTime;

  movePlayer();

  const difficultyBonus = Math.min(elapsedTime / 30, 1.2);
  const currentSpawnInterval = Math.max(0.32, obstacleSpawnInterval - difficultyBonus * 0.35);

  if (obstacleSpawnTimer >= currentSpawnInterval) {
    spawnObstacle();
    obstacleSpawnTimer = 0;
  }

  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed * deltaTime;
  });

  obstacles = obstacles.filter((obstacle) => {
    if (obstacle.y > canvas.height) {
      score += 1;
      return false;
    }
    return true;
  });

  if (obstacles.some(isCollidingWithPlayer)) {
    updateStatus();
    endGame('lose');
    return;
  }

  if (elapsedTime >= GAME_TIME) {
    elapsedTime = GAME_TIME;
    updateStatus();
    endGame('win');
    return;
  }

  updateStatus();
}

function movePlayer() {
  if (keys.left) {
    player.x -= player.speed;
  }

  if (keys.right) {
    player.x += player.speed;
  }

  player.x = clamp(player.x, 0, canvas.width - player.width);
}

function spawnObstacle() {
  const minWidth = 34;
  const maxWidth = 76;
  const width = randomNumber(minWidth, maxWidth);
  const height = randomNumber(22, 48);
  const x = randomNumber(0, canvas.width - width);
  const speed = randomNumber(185, 310) + elapsedTime * 6;

  obstacles.push({
    x,
    y: -height,
    width,
    height,
    speed
  });
}

function isCollidingWithPlayer(obstacle) {
  return !(
    player.x + player.width < obstacle.x ||
    player.x > obstacle.x + obstacle.width ||
    player.y + player.height < obstacle.y ||
    player.y > obstacle.y + obstacle.height
  );
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
}

function drawBackground() {
  ctx.fillStyle = '#101723';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#9aa6bc';
  ctx.fillRect(player.x + 8, player.y + 6, player.width - 16, 6);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = '#ff4d5e';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(obstacle.x + 6, obstacle.y + 5, obstacle.width - 12, 5);
  });
}

function updateStatus() {
  const remainingTime = Math.max(0, GAME_TIME - elapsedTime);
  timeText.textContent = remainingTime.toFixed(1);
  scoreText.textContent = score;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    keys.left = true;
    event.preventDefault();
  }

  if (event.key === 'ArrowRight') {
    keys.right = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft') {
    keys.left = false;
  }

  if (event.key === 'ArrowRight') {
    keys.right = false;
  }
});

startButton.addEventListener('click', startGame);

resetGame();
