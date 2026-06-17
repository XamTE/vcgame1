const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const timeText = document.getElementById('timeText');
const scoreText = document.getElementById('scoreText');
const levelText = document.getElementById('levelText');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startButton = document.getElementById('startButton');
const nicknameForm = document.getElementById('nicknameForm');
const nicknameInput = document.getElementById('nicknameInput');
const saveMessage = document.getElementById('saveMessage');
const rankingList = document.getElementById('rankingList');
const emptyRankingText = document.getElementById('emptyRankingText');
const clearRankingButton = document.getElementById('clearRankingButton');

const GAME_TIME = 30;
const PLAYER_SPEED = 6;
const RANKING_STORAGE_KEY = 'dodgeGameRankings';
const MAX_RANKING_COUNT = 10;

const LEVELS = [
  {
    level: 1,
    startTime: 0,
    spawnInterval: 0.85,
    speedMin: 185,
    speedMax: 300,
    widthMin: 34,
    widthMax: 72,
    heightMin: 22,
    heightMax: 44,
    extraSpawnChance: 0,
    background: '#101723',
    obstacleColor: '#ff4d5e'
  },
  {
    level: 2,
    startTime: 10,
    spawnInterval: 0.6,
    speedMin: 235,
    speedMax: 375,
    widthMin: 40,
    widthMax: 88,
    heightMin: 26,
    heightMax: 52,
    extraSpawnChance: 0.18,
    background: '#15162a',
    obstacleColor: '#ff8a3d'
  },
  {
    level: 3,
    startTime: 20,
    spawnInterval: 0.42,
    speedMin: 295,
    speedMax: 460,
    widthMin: 46,
    widthMax: 104,
    heightMin: 30,
    heightMax: 60,
    extraSpawnChance: 0.32,
    background: '#201323',
    obstacleColor: '#ff3dd8'
  }
];

const sounds = {
  dodge: new Audio('sounds/dodge.wav'),
  win: new Audio('sounds/win.wav'),
  lose: new Audio('sounds/lose.wav')
};

Object.values(sounds).forEach((sound) => {
  sound.preload = 'auto';
  sound.volume = 0.55;
});

let player;
let obstacles;
let keys;
let score;
let elapsedTime;
let obstacleSpawnTimer;
let animationId;
let lastTimestamp;
let gameState;
let currentLevel;
let maxReachedLevel;
let soundUnlocked = false;
let pendingRecord = null;
let recordSaved = false;

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
  lastTimestamp = 0;
  gameState = 'ready';
  currentLevel = 1;
  maxReachedLevel = 1;
  pendingRecord = null;
  recordSaved = false;

  hideNicknameForm();
  updateStatus();
  drawGame();
}

function startGame() {
  cancelAnimationFrame(animationId);
  unlockSounds();
  stopAllSounds();
  resetGame();
  gameState = 'playing';
  overlay.classList.add('hidden');
  animationId = requestAnimationFrame(gameLoop);
}

function endGame(result) {
  gameState = result;
  cancelAnimationFrame(animationId);

  pendingRecord = {
    result,
    score,
    maxLevel: maxReachedLevel,
    survivalTime: Number(elapsedTime.toFixed(1)),
    createdAt: new Date().toISOString()
  };
  recordSaved = false;

  if (result === 'win') {
    playSound('win');
    overlayTitle.textContent = '승리!';
    overlayMessage.textContent = `3단계까지 버티고 30초 생존 성공. 최종 점수: ${score}`;
  } else {
    playSound('lose');
    overlayTitle.textContent = '패배';
    overlayMessage.textContent = `${maxReachedLevel}단계에서 장애물에 충돌했습니다. 최종 점수: ${score}`;
  }

  showNicknameForm();
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

  updateCurrentLevel();
  movePlayer();

  const levelConfig = getLevelConfig(currentLevel);

  if (obstacleSpawnTimer >= levelConfig.spawnInterval) {
    spawnObstacle(levelConfig);

    if (Math.random() < levelConfig.extraSpawnChance) {
      spawnObstacle(levelConfig);
    }

    obstacleSpawnTimer = 0;
  }

  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed * deltaTime;
  });

  obstacles = obstacles.filter((obstacle) => {
    if (obstacle.y > canvas.height) {
      score += obstacle.level;
      playSound('dodge');
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
    currentLevel = 3;
    maxReachedLevel = 3;
    updateStatus();
    endGame('win');
    return;
  }

  updateStatus();
}

function updateCurrentLevel() {
  const levelConfig = LEVELS.reduce((selectedLevel, level) => {
    return elapsedTime >= level.startTime ? level : selectedLevel;
  }, LEVELS[0]);

  currentLevel = levelConfig.level;
  maxReachedLevel = Math.max(maxReachedLevel, currentLevel);
}

function getLevelConfig(level) {
  return LEVELS.find((levelConfig) => levelConfig.level === level) || LEVELS[0];
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

function spawnObstacle(levelConfig) {
  const width = randomNumber(levelConfig.widthMin, levelConfig.widthMax);
  const height = randomNumber(levelConfig.heightMin, levelConfig.heightMax);
  const x = randomNumber(0, canvas.width - width);
  const speed = randomNumber(levelConfig.speedMin, levelConfig.speedMax);

  obstacles.push({
    x,
    y: -height,
    width,
    height,
    speed,
    level: levelConfig.level,
    color: levelConfig.obstacleColor
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
  drawLevelGuide();
}

function drawBackground() {
  const levelConfig = getLevelConfig(currentLevel);

  ctx.fillStyle = levelConfig.background;
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
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(obstacle.x + 6, obstacle.y + 5, obstacle.width - 12, 5);
  });
}

function drawLevelGuide() {
  const levelWidth = canvas.width / 3;

  LEVELS.forEach((levelConfig, index) => {
    const x = index * levelWidth;
    const isActive = levelConfig.level === currentLevel;

    ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x + 8, 12, levelWidth - 16, 8);

    ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
    ctx.font = '700 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${levelConfig.level}단계`, x + levelWidth / 2, 38);
  });
}

function updateStatus() {
  const remainingTime = Math.max(0, GAME_TIME - elapsedTime);
  timeText.textContent = remainingTime.toFixed(1);
  scoreText.textContent = score;
  levelText.textContent = currentLevel;
}

function playSound(soundName) {
  const sound = sounds[soundName];

  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {
    // 브라우저 자동 재생 정책으로 막히면 게임 진행은 그대로 유지합니다.
  });
}

function stopAllSounds() {
  Object.values(sounds).forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
}

function unlockSounds() {
  if (soundUnlocked) return;

  Object.values(sounds).forEach((sound) => {
    sound.load();
  });

  soundUnlocked = true;
}

function showNicknameForm() {
  nicknameForm.classList.remove('hidden');
  nicknameInput.value = '';
  saveMessage.textContent = '';

  requestAnimationFrame(() => {
    nicknameInput.focus();
  });
}

function hideNicknameForm() {
  nicknameForm.classList.add('hidden');
  nicknameInput.value = '';
  saveMessage.textContent = '';
}

function saveCurrentRecord(event) {
  event.preventDefault();

  if (!pendingRecord || recordSaved) return;

  const nickname = sanitizeNickname(nicknameInput.value);
  const newRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    nickname,
    result: pendingRecord.result,
    score: pendingRecord.score,
    maxLevel: pendingRecord.maxLevel,
    survivalTime: pendingRecord.survivalTime,
    createdAt: pendingRecord.createdAt
  };

  const rankings = getRankings();
  rankings.push(newRecord);

  const sortedRankings = sortRankings(rankings).slice(0, MAX_RANKING_COUNT);
  setRankings(sortedRankings);

  recordSaved = true;
  nicknameForm.classList.add('hidden');
  saveMessage.textContent = '기록이 저장되었습니다.';
  renderRankings();
}

function sanitizeNickname(value) {
  const nickname = value.trim().replace(/\s+/g, ' ');

  if (!nickname) {
    return '익명 플레이어';
  }

  return nickname.slice(0, 12);
}

function getRankings() {
  try {
    const savedRankings = localStorage.getItem(RANKING_STORAGE_KEY);
    return savedRankings ? JSON.parse(savedRankings) : [];
  } catch (error) {
    return [];
  }
}

function setRankings(rankings) {
  try {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(rankings));
  } catch (error) {
    saveMessage.textContent = '브라우저 저장소 문제로 기록 저장에 실패했습니다.';
  }
}

function clearRankings() {
  const shouldClear = confirm('저장된 플레이 로그를 모두 삭제할까요?');

  if (!shouldClear) return;

  localStorage.removeItem(RANKING_STORAGE_KEY);
  renderRankings();
}

function sortRankings(rankings) {
  return [...rankings].sort((a, b) => {
    const resultDiff = getResultPriority(b.result) - getResultPriority(a.result);
    if (resultDiff !== 0) return resultDiff;

    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;

    const levelDiff = getRecordLevel(b) - getRecordLevel(a);
    if (levelDiff !== 0) return levelDiff;

    const timeDiff = b.survivalTime - a.survivalTime;
    if (timeDiff !== 0) return timeDiff;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function getResultPriority(result) {
  return result === 'win' ? 1 : 0;
}

function getRecordLevel(record) {
  return Number(record.maxLevel || record.level || 1);
}

function renderRankings() {
  const rankings = sortRankings(getRankings()).slice(0, MAX_RANKING_COUNT);

  rankingList.innerHTML = '';
  emptyRankingText.classList.toggle('hidden', rankings.length > 0);

  rankings.forEach((record, index) => {
    const item = document.createElement('li');
    item.className = 'ranking-item';

    const rankNumber = document.createElement('span');
    rankNumber.className = 'rank-number';
    rankNumber.textContent = index + 1;

    const rankMain = document.createElement('div');
    rankMain.className = 'rank-main';

    const rankName = document.createElement('span');
    rankName.className = 'rank-name';
    rankName.textContent = record.nickname;

    const rankMeta = document.createElement('span');
    rankMeta.className = 'rank-meta';
    rankMeta.textContent = `${formatDate(record.createdAt)} · ${getRecordLevel(record)}단계 도달 · 생존 ${Number(record.survivalTime).toFixed(1)}초`;

    const rankScore = document.createElement('div');
    rankScore.className = 'rank-score';

    const rankResult = document.createElement('span');
    rankResult.className = 'rank-result';
    rankResult.textContent = record.result === 'win' ? '승리' : '패배';

    const scoreValue = document.createElement('span');
    scoreValue.textContent = `${record.score}점`;

    rankMain.append(rankName, rankMeta);
    rankScore.append(rankResult, scoreValue);
    item.append(rankNumber, rankMain, rankScore);
    rankingList.appendChild(item);
  });
}

function formatDate(dateText) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '날짜 없음';
  }

  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
nicknameForm.addEventListener('submit', saveCurrentRecord);
clearRankingButton.addEventListener('click', clearRankings);

resetGame();
renderRankings();
