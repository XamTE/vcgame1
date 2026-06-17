const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const timeText = document.getElementById('timeText');
const scoreText = document.getElementById('scoreText');
const levelText = document.getElementById('levelText');
const lifeText = document.getElementById('lifeText');
const shieldText = document.getElementById('shieldText');
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

const INFINITE_MODE_START_TIME = 30;
const PLAYER_SPEED = 6;
const RANKING_STORAGE_KEY = 'dodgeGameRankings';
const MAX_RANKING_COUNT = 10;
const MAX_LIFE_LIMIT = 3;
const MAX_SHIELD_COUNT = 1;

const PHASES = [
  {
    level: 1,
    label: '1',
    startTime: 0,
    spawnInterval: 0.85,
    speedMin: 185,
    speedMax: 300,
    widthMin: 34,
    widthMax: 72,
    heightMin: 22,
    heightMax: 44,
    extraSpawnChance: 0,
    itemSpawnInterval: 5.8,
    itemSpawnChance: 0.52,
    background: '#101723',
    obstacleColor: '#ff4d5e',
    obstacleWeights: {
      normal: 1,
      glitch: 0,
      wave: 0,
      diagonal: 0
    },
    itemWeights: {
      shield: 0.38,
      heal: 0.36,
      poison: 0.26
    }
  },
  {
    level: 2,
    label: '2',
    startTime: 10,
    spawnInterval: 0.6,
    speedMin: 235,
    speedMax: 375,
    widthMin: 40,
    widthMax: 88,
    heightMin: 26,
    heightMax: 52,
    extraSpawnChance: 0.18,
    itemSpawnInterval: 5.2,
    itemSpawnChance: 0.48,
    background: '#15162a',
    obstacleColor: '#ff8a3d',
    obstacleWeights: {
      normal: 0.62,
      glitch: 0.1,
      wave: 0.16,
      diagonal: 0.12
    },
    itemWeights: {
      shield: 0.34,
      heal: 0.32,
      poison: 0.34
    }
  },
  {
    level: 3,
    label: '3',
    startTime: 20,
    spawnInterval: 0.42,
    speedMin: 295,
    speedMax: 460,
    widthMin: 46,
    widthMax: 104,
    heightMin: 30,
    heightMax: 60,
    extraSpawnChance: 0.32,
    itemSpawnInterval: 4.8,
    itemSpawnChance: 0.44,
    background: '#201323',
    obstacleColor: '#ff3dd8',
    obstacleWeights: {
      normal: 0.46,
      glitch: 0.17,
      wave: 0.19,
      diagonal: 0.18
    },
    itemWeights: {
      shield: 0.31,
      heal: 0.29,
      poison: 0.4
    }
  }
];

const ITEM_TYPES = {
  shield: {
    label: '방패',
    color: '#64d2ff',
    size: 32,
    speed: 145
  },
  heal: {
    label: '회복',
    color: '#ff5f7f',
    size: 30,
    speed: 155
  },
  poison: {
    label: '독극물',
    color: '#111111',
    size: 30,
    speed: 165
  }
};

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
let items;
let keys;
let score;
let elapsedTime;
let obstacleSpawnTimer;
let itemSpawnTimer;
let animationId;
let lastTimestamp;
let gameState;
let currentLevel;
let currentPhase;
let maxReachedLevel;
let isInfiniteMode;
let enteredInfiniteMode;
let maxLives;
let lives;
let shieldCount;
let soundUnlocked = false;
let pendingRecord = null;
let recordSaved = false;

function resetGame() {
  player = {
    width: 52,
    height: 26,
    x: canvas.width / 2 - 26,
    y: canvas.height - 58,
    speed: PLAYER_SPEED,
    invincibleTimer: 0
  };

  obstacles = [];
  items = [];
  keys = {
    left: false,
    right: false
  };

  score = 0;
  elapsedTime = 0;
  obstacleSpawnTimer = 0;
  itemSpawnTimer = 0;
  lastTimestamp = 0;
  gameState = 'ready';
  currentLevel = 1;
  currentPhase = getPhaseConfig(1);
  maxReachedLevel = 1;
  isInfiniteMode = false;
  enteredInfiniteMode = false;
  maxLives = 1;
  lives = 1;
  shieldCount = 0;
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

function endGame() {
  if (gameState !== 'playing') return;

  gameState = 'ended';
  cancelAnimationFrame(animationId);
  playSound('lose');

  const result = elapsedTime >= INFINITE_MODE_START_TIME ? 'infinite' : 'lose';

  pendingRecord = {
    result,
    score,
    maxLevel: maxReachedLevel,
    survivalTime: Number(elapsedTime.toFixed(1)),
    enteredInfiniteMode,
    createdAt: new Date().toISOString()
  };
  recordSaved = false;

  if (result === 'infinite') {
    overlayTitle.textContent = '무한모드 종료';
    overlayMessage.textContent = `무한모드에서 ${Number(elapsedTime).toFixed(1)}초까지 생존했습니다. 최종 점수: ${score}`;
  } else {
    overlayTitle.textContent = '패배';
    overlayMessage.textContent = `${getStageDisplayText(maxReachedLevel)}에서 목숨을 모두 잃었습니다. 최종 점수: ${score}`;
  }

  showNicknameForm();
  startButton.textContent = '다시 시작';
  overlay.classList.remove('hidden');
}

function gameLoop(timestamp) {
  if (gameState !== 'playing') return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  updateGame(deltaTime);
  drawGame();

  if (gameState === 'playing') {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function updateGame(deltaTime) {
  elapsedTime += deltaTime;
  obstacleSpawnTimer += deltaTime;
  itemSpawnTimer += deltaTime;

  if (player.invincibleTimer > 0) {
    player.invincibleTimer = Math.max(0, player.invincibleTimer - deltaTime);
  }

  updateCurrentPhase();
  movePlayer();
  updateObstacleSpawning(deltaTime);
  updateItemSpawning(deltaTime);
  updateObstacles(deltaTime);
  updateItems(deltaTime);
  handleObstacleCollisions();
  handleItemCollisions();
  updateStatus();
}

function updateCurrentPhase() {
  const previousLevel = currentLevel;

  if (elapsedTime >= INFINITE_MODE_START_TIME) {
    currentLevel = 4;
    currentPhase = getInfinitePhaseConfig();
    maxReachedLevel = 4;

    if (!enteredInfiniteMode) {
      enteredInfiniteMode = true;
      isInfiniteMode = true;
      playSound('win');
    }
  } else {
    const levelConfig = PHASES.reduce((selectedLevel, phase) => {
      return elapsedTime >= phase.startTime ? phase : selectedLevel;
    }, PHASES[0]);

    currentLevel = levelConfig.level;
    currentPhase = levelConfig;
    maxReachedLevel = Math.max(maxReachedLevel, currentLevel);
  }

  if (currentLevel > previousLevel && currentLevel <= 3) {
    grantStageLife();
  }
}

function grantStageLife() {
  maxLives = Math.min(MAX_LIFE_LIMIT, maxLives + 1);
  lives = Math.min(maxLives, lives + 1);
}

function updateObstacleSpawning() {
  if (obstacleSpawnTimer < currentPhase.spawnInterval) return;

  spawnObstacle(currentPhase);

  if (Math.random() < currentPhase.extraSpawnChance) {
    spawnObstacle(currentPhase);
  }

  const infiniteBonusSpawnChance = currentLevel === 4
    ? clamp((elapsedTime - INFINITE_MODE_START_TIME) / 120, 0, 0.35)
    : 0;

  if (Math.random() < infiniteBonusSpawnChance) {
    spawnObstacle(currentPhase);
  }

  obstacleSpawnTimer = 0;
}

function updateItemSpawning() {
  if (itemSpawnTimer < currentPhase.itemSpawnInterval) return;

  if (Math.random() < currentPhase.itemSpawnChance) {
    spawnItem(currentPhase);
  }

  itemSpawnTimer = 0;
}

function updateObstacles(deltaTime) {
  obstacles.forEach((obstacle) => {
    obstacle.age += deltaTime;
    obstacle.y += obstacle.speed * deltaTime;

    if (obstacle.type === 'wave') {
      obstacle.x = obstacle.baseX + Math.sin(obstacle.age * obstacle.waveFrequency + obstacle.wavePhase) * obstacle.waveAmplitude;
      obstacle.x = clamp(obstacle.x, 0, canvas.width - obstacle.width);
    }

    if (obstacle.type === 'diagonal') {
      obstacle.x += obstacle.horizontalSpeed * deltaTime;

      if (obstacle.x <= 0 || obstacle.x + obstacle.width >= canvas.width) {
        obstacle.horizontalSpeed *= -1;
        obstacle.x = clamp(obstacle.x, 0, canvas.width - obstacle.width);
      }
    }

    if (obstacle.type === 'glitch' && !obstacle.teleported && obstacle.y >= obstacle.teleportY) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      obstacle.x += direction * randomNumber(58, 118);
      obstacle.x = clamp(obstacle.x, 0, canvas.width - obstacle.width);
      obstacle.teleported = true;
      obstacle.glitchFlashTimer = 0.35;
    }

    if (obstacle.glitchFlashTimer > 0) {
      obstacle.glitchFlashTimer = Math.max(0, obstacle.glitchFlashTimer - deltaTime);
    }
  });

  obstacles = obstacles.filter((obstacle) => {
    if (obstacle.y > canvas.height) {
      score += getScoreValue(obstacle.level);
      playSound('dodge');
      return false;
    }
    return true;
  });
}

function updateItems(deltaTime) {
  items.forEach((item) => {
    item.y += item.speed * deltaTime;
    item.age += deltaTime;
  });

  items = items.filter((item) => item.y < canvas.height + item.size);
}

function handleObstacleCollisions() {
  if (player.invincibleTimer > 0) return;

  const hitIndex = obstacles.findIndex(isCollidingWithPlayer);
  if (hitIndex === -1) return;

  obstacles.splice(hitIndex, 1);
  applyDamage();
}

function handleItemCollisions() {
  const collectedIndexes = [];

  items.forEach((item, index) => {
    if (isCollidingWithPlayer(item)) {
      collectedIndexes.push(index);
      applyItemEffect(item.type);
    }
  });

  items = items.filter((_, index) => !collectedIndexes.includes(index));
}

function applyDamage() {
  if (shieldCount > 0) {
    shieldCount -= 1;
    player.invincibleTimer = 0.9;
    playSound('dodge');
    return;
  }

  lives -= 1;
  player.invincibleTimer = 1.1;

  if (lives <= 0) {
    lives = 0;
    updateStatus();
    endGame();
  }
}

function applyItemEffect(itemType) {
  if (itemType === 'shield') {
    shieldCount = Math.min(MAX_SHIELD_COUNT, shieldCount + 1);
    playSound('dodge');
    return;
  }

  if (itemType === 'heal') {
    lives = Math.min(maxLives, lives + 1);
    playSound('dodge');
    return;
  }

  if (itemType === 'poison') {
    lives -= 1;
    player.invincibleTimer = 0.8;

    if (lives <= 0) {
      lives = 0;
      updateStatus();
      endGame();
    }
  }
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

function spawnObstacle(phaseConfig) {
  const type = chooseWeighted(phaseConfig.obstacleWeights);
  const width = randomNumber(phaseConfig.widthMin, phaseConfig.widthMax);
  const height = randomNumber(phaseConfig.heightMin, phaseConfig.heightMax);
  const x = randomNumber(0, canvas.width - width);
  const speed = randomNumber(phaseConfig.speedMin, phaseConfig.speedMax);

  const obstacle = {
    type,
    x,
    y: -height,
    width,
    height,
    speed,
    level: phaseConfig.level,
    color: getObstacleColor(type, phaseConfig.obstacleColor),
    age: 0,
    baseX: x,
    horizontalSpeed: 0,
    waveAmplitude: 0,
    waveFrequency: 0,
    wavePhase: 0,
    teleportY: canvas.height * randomNumber(0.45, 0.55),
    teleported: false,
    glitchFlashTimer: 0
  };

  if (type === 'wave') {
    obstacle.waveAmplitude = randomNumber(34, 72);
    obstacle.waveFrequency = randomNumber(4.2, 6.8);
    obstacle.wavePhase = randomNumber(0, Math.PI * 2);
  }

  if (type === 'diagonal') {
    obstacle.horizontalSpeed = randomNumber(45, 105) * (Math.random() < 0.5 ? -1 : 1);
  }

  obstacles.push(obstacle);
}

function spawnItem(phaseConfig) {
  const type = chooseWeighted(phaseConfig.itemWeights);
  const itemConfig = ITEM_TYPES[type];
  const size = itemConfig.size;

  items.push({
    type,
    x: randomNumber(10, canvas.width - size - 10),
    y: -size,
    width: size,
    height: size,
    size,
    speed: itemConfig.speed + randomNumber(-10, 24),
    age: 0,
    color: itemConfig.color
  });
}

function getPhaseConfig(level) {
  return PHASES.find((phase) => phase.level === level) || PHASES[0];
}

function getInfinitePhaseConfig() {
  const infiniteTime = Math.max(0, elapsedTime - INFINITE_MODE_START_TIME);
  const speedBonus = Math.min(infiniteTime * 5.5, 310);
  const spawnReduction = Math.min(infiniteTime * 0.004, 0.14);

  return {
    level: 4,
    label: '∞',
    startTime: INFINITE_MODE_START_TIME,
    spawnInterval: Math.max(0.24, 0.36 - spawnReduction),
    speedMin: 340 + speedBonus,
    speedMax: 540 + speedBonus * 1.25,
    widthMin: 46,
    widthMax: 112,
    heightMin: 30,
    heightMax: 64,
    extraSpawnChance: clamp(0.42 + infiniteTime * 0.003, 0.42, 0.72),
    itemSpawnInterval: Math.max(3.8, 4.6 - infiniteTime * 0.01),
    itemSpawnChance: 0.42,
    background: '#160f22',
    obstacleColor: '#b95cff',
    obstacleWeights: {
      normal: 0.34,
      glitch: 0.23,
      wave: 0.22,
      diagonal: 0.21
    },
    itemWeights: {
      shield: 0.28,
      heal: 0.24,
      poison: 0.48
    }
  };
}

function getObstacleColor(type, fallbackColor) {
  const colors = {
    normal: fallbackColor,
    glitch: '#54f5ff',
    wave: '#ffe066',
    diagonal: '#b983ff'
  };

  return colors[type] || fallbackColor;
}

function getScoreValue(level) {
  if (level >= 4) {
    return 4 + Math.floor((elapsedTime - INFINITE_MODE_START_TIME) / 15);
  }

  return level;
}

function isCollidingWithPlayer(target) {
  return !(
    player.x + player.width < target.x ||
    player.x > target.x + target.width ||
    player.y + player.height < target.y ||
    player.y > target.y + target.height
  );
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawItems();
  drawPlayer();
  drawObstacles();
  drawLevelGuide();
  drawHudMessage();
}

function drawBackground() {
  ctx.fillStyle = currentPhase.background;
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

  if (currentLevel === 4) {
    ctx.fillStyle = 'rgba(185, 92, 255, 0.08)';
    for (let i = 0; i < 16; i += 1) {
      const x = (i * 47 + elapsedTime * 18) % canvas.width;
      ctx.fillRect(x, 0, 2, canvas.height);
    }
  }
}

function drawPlayer() {
  const shouldBlink = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 14) % 2 === 0;

  if (shouldBlink) {
    ctx.globalAlpha = 0.45;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#9aa6bc';
  ctx.fillRect(player.x + 8, player.y + 6, player.width - 16, 6);

  if (shieldCount > 0) {
    ctx.strokeStyle = 'rgba(100, 210, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawRoundedRect(player.x - 7, player.y - 7, player.width + 14, player.height + 14, 12);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    if (obstacle.type === 'diagonal') {
      drawDiagonalObstacle(obstacle);
      return;
    }

    if (obstacle.type === 'glitch') {
      drawGlitchObstacle(obstacle);
      return;
    }

    if (obstacle.type === 'wave') {
      drawWaveObstacle(obstacle);
      return;
    }

    drawNormalObstacle(obstacle);
  });
}


function drawRoundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawNormalObstacle(obstacle) {
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(obstacle.x + 6, obstacle.y + 5, Math.max(4, obstacle.width - 12), 5);
}

function drawGlitchObstacle(obstacle) {
  const jitter = obstacle.glitchFlashTimer > 0 ? 8 : 3;
  const offsetA = Math.sin(obstacle.age * 42) * jitter;
  const offsetB = Math.cos(obstacle.age * 37) * jitter;

  ctx.fillStyle = 'rgba(84, 245, 255, 0.85)';
  ctx.fillRect(obstacle.x + offsetA, obstacle.y, obstacle.width, obstacle.height);

  ctx.fillStyle = 'rgba(255, 61, 216, 0.75)';
  ctx.fillRect(obstacle.x + offsetB, obstacle.y + 4, obstacle.width, obstacle.height - 8);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i += 1) {
    const lineY = obstacle.y + randomNumber(3, obstacle.height - 3);
    ctx.fillRect(obstacle.x - 5, lineY, obstacle.width + 10, 2);
  }
}

function drawWaveObstacle(obstacle) {
  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  drawRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 10);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 8, obstacle.y + obstacle.height / 2);
  ctx.quadraticCurveTo(
    obstacle.x + obstacle.width / 2,
    obstacle.y + 2,
    obstacle.x + obstacle.width - 8,
    obstacle.y + obstacle.height / 2
  );
  ctx.stroke();
}

function drawDiagonalObstacle(obstacle) {
  ctx.save();
  ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
  ctx.rotate(obstacle.horizontalSpeed > 0 ? 0.34 : -0.34);
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(-obstacle.width / 2 + 6, -obstacle.height / 2 + 5, Math.max(4, obstacle.width - 12), 5);
  ctx.restore();
}

function drawItems() {
  items.forEach((item) => {
    if (item.type === 'shield') {
      drawShieldItem(item);
      return;
    }

    if (item.type === 'heal') {
      drawHeartItem(item, false);
      return;
    }

    drawHeartItem(item, true);
  });
}

function drawShieldItem(item) {
  const cx = item.x + item.size / 2;
  const cy = item.y + item.size / 2;
  const r = item.size / 2;

  ctx.fillStyle = 'rgba(100, 210, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = item.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r + 5);
  ctx.lineTo(cx + r - 7, cy - r / 4);
  ctx.quadraticCurveTo(cx + r - 7, cy + r / 2, cx, cy + r - 4);
  ctx.quadraticCurveTo(cx - r + 7, cy + r / 2, cx - r + 7, cy - r / 4);
  ctx.closePath();
  ctx.stroke();
}

function drawHeartItem(item, broken) {
  const cx = item.x + item.size / 2;
  const cy = item.y + item.size / 2 + 2;
  const scale = item.size / 30;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.fillStyle = broken ? '#050505' : item.color;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-20, -4, -12, -20, 0, -10);
  ctx.bezierCurveTo(12, -20, 20, -4, 0, 10);
  ctx.fill();

  if (broken) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(3, -3);
    ctx.lineTo(-4, 2);
    ctx.lineTo(2, 9);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLevelGuide() {
  const guideItems = [
    { label: '1단계', active: currentLevel === 1 },
    { label: '2단계', active: currentLevel === 2 },
    { label: '3단계', active: currentLevel === 3 },
    { label: '무한', active: currentLevel === 4 }
  ];
  const guideWidth = canvas.width / guideItems.length;

  guideItems.forEach((guide, index) => {
    const x = index * guideWidth;

    ctx.fillStyle = guide.active ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x + 7, 12, guideWidth - 14, 8);

    ctx.fillStyle = guide.active ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
    ctx.font = '700 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(guide.label, x + guideWidth / 2, 38);
  });
}

function drawHudMessage() {
  if (currentLevel !== 4) return;

  ctx.fillStyle = 'rgba(185, 92, 255, 0.18)';
  ctx.fillRect(118, 54, 244, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('무한모드 진행 중', canvas.width / 2, 74);
}

function updateStatus() {
  timeText.textContent = elapsedTime.toFixed(1);
  scoreText.textContent = score;
  levelText.textContent = getLevelLabel(currentLevel);
  lifeText.textContent = `${lives} / ${maxLives}`;
  shieldText.textContent = shieldCount;
}

function getLevelLabel(level) {
  if (level >= 4 || level === 'infinite') return '무한';
  return String(level);
}

function getStageDisplayText(level) {
  if (Number(level) >= 4 || level === 'infinite') return '무한모드';
  return `${level}단계`;
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
    id: getUniqueId(),
    nickname,
    result: pendingRecord.result,
    score: pendingRecord.score,
    maxLevel: pendingRecord.maxLevel,
    survivalTime: pendingRecord.survivalTime,
    enteredInfiniteMode: pendingRecord.enteredInfiniteMode,
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
    const resultDiff = getResultPriority(b) - getResultPriority(a);
    if (resultDiff !== 0) return resultDiff;

    const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;

    const levelDiff = getRecordLevel(b) - getRecordLevel(a);
    if (levelDiff !== 0) return levelDiff;

    const timeDiff = Number(b.survivalTime || 0) - Number(a.survivalTime || 0);
    if (timeDiff !== 0) return timeDiff;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function getResultPriority(record) {
  if (record.enteredInfiniteMode || record.result === 'infinite') return 2;
  if (record.result === 'win') return 1;
  return 0;
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
    rankMeta.textContent = `${formatDate(record.createdAt)} · ${getStageDisplayText(getRecordLevel(record))} 도달 · 생존 ${Number(record.survivalTime || 0).toFixed(1)}초`;

    const rankScore = document.createElement('div');
    rankScore.className = 'rank-score';

    const rankResult = document.createElement('span');
    rankResult.className = 'rank-result';
    rankResult.textContent = getResultText(record);

    const scoreValue = document.createElement('span');
    scoreValue.textContent = `${record.score || 0}점`;

    rankMain.append(rankName, rankMeta);
    rankScore.append(rankResult, scoreValue);
    item.append(rankNumber, rankMain, rankScore);
    rankingList.appendChild(item);
  });
}

function getResultText(record) {
  if (record.enteredInfiniteMode || record.result === 'infinite') return '무한모드';
  if (record.result === 'win') return '승리';
  return '패배';
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

function chooseWeighted(weights) {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const [key, weight] of entries) {
    randomValue -= weight;
    if (randomValue <= 0) return key;
  }

  return entries[0][0];
}

function getUniqueId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
