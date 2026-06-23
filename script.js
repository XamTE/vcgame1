const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startButton = document.getElementById('startButton');
const mainMenuButton = document.getElementById('mainMenuButton');
const nicknameForm = document.getElementById('nicknameForm');
const nicknameInput = document.getElementById('nicknameInput');
const saveMessage = document.getElementById('saveMessage');
const rankingList = document.getElementById('rankingList');
const emptyRankingText = document.getElementById('emptyRankingText');
const clearRankingButton = document.getElementById('clearRankingButton');
const settingsButton = document.getElementById('settingsButton');
const menuSettingsButton = document.getElementById('menuSettingsButton');
const menuArtifactsButton = document.getElementById('menuArtifactsButton');
const artifactLayer = document.getElementById('artifactLayer');
const artifactStats = document.getElementById('artifactStats');
const artifactList = document.getElementById('artifactList');
const closeArtifactButton = document.getElementById('closeArtifactButton');
const pauseArtifactButton = document.getElementById('pauseArtifactButton');
const pauseArtifactIcon = document.getElementById('pauseArtifactIcon');
const pauseArtifactName = document.getElementById('pauseArtifactName');
const pauseArtifactEffect = document.getElementById('pauseArtifactEffect');
const soundSettingsPanel = document.getElementById('soundSettingsPanel');
const closeSettingsButton = document.getElementById('closeSettingsButton');
const muteToggleButton = document.getElementById('muteToggleButton');
const bgmVolumeInput = document.getElementById('bgmVolumeInput');
const bgmVolumeValue = document.getElementById('bgmVolumeValue');
const sfxVolumeInput = document.getElementById('sfxVolumeInput');
const sfxVolumeValue = document.getElementById('sfxVolumeValue');
const replayTutorialButton = document.getElementById('replayTutorialButton');
const tutorialLayer = document.getElementById('tutorialLayer');
const tutorialNpcName = document.getElementById('tutorialNpcName');
const tutorialText = document.getElementById('tutorialText');
const abilityLayer = document.getElementById('abilityLayer');
const abilityOptions = document.getElementById('abilityOptions');
const abilityMessage = document.getElementById('abilityMessage');

const GAME_TITLE = '악몽의 잔재';
const INFINITE_MODE_START_TIME = 30;
const PLAYER_SPEED = 360;
const MAX_DREAM_LEVEL = 10;
const EXPERIENCE_SPAWN_INTERVAL = 2.25;
const EXPERIENCE_SPAWN_CHANCE = 0.72;
const MAX_EXPERIENCE_ITEMS = 4;
const RANKING_STORAGE_KEY = 'dodgeGameRankings';
const SOUND_SETTINGS_STORAGE_KEY = 'dodgeGameSoundSettings';
const TUTORIAL_STORAGE_KEY = 'dodgeGameTutorialSeen';
const ARTIFACT_STORAGE_KEY = 'nightmareArtifactProgress';
const MAX_RANKING_COUNT = 10;
const MAX_LIFE_LIMIT = 3;
const MAX_SHIELD_COUNT = 1;
const ARTIFACT_UNLOCK_REQUIREMENT = 50;
const PLAYER_SIZE = 70;
const PLAYER_BOTTOM_MARGIN = 20;
const HUD_HEART_SIZE = 18;
const HUD_HEART_GAP = 5;
const TUTORIAL_TYPING_INTERVAL = 20;
const TUTORIAL_TYPING_CHARS_PER_TICK = 2;
const ABILITY_SELECTION_FLASH_DELAY = 300;
const ABILITY_MAX_LIFE_BONUS = 1;
const DEFAULT_BGM_VOLUME = 28;
const DEFAULT_SFX_VOLUME = 55;
const DEFAULT_OVERLAY_MESSAGE = '';

const FULL_HITBOX = {
  x: 0,
  y: 0,
  width: 1,
  height: 1
};

const HITBOX_RATIOS = {
  player: {
    x: 0.27,
    y: 0.142,
    width: 0.436,
    height: 0.698
  },
  obstacles: {
    normal: {
      x: 0.338,
      y: 0.162,
      width: 0.314,
      height: 0.61
    },
    wave: {
      x: 0.27,
      y: 0.104,
      width: 0.46,
      height: 0.78
    },
    glitch: {
      x: 0.248,
      y: 0.03,
      width: 0.486,
      height: 0.912
    }
  },
  items: {
    shield: {
      x: 0.258,
      y: 0.144,
      width: 0.482,
      height: 0.696
    },
    heal: {
      x: 0.214,
      y: 0.14,
      width: 0.56,
      height: 0.684
    },
    poison: {
      x: 0.206,
      y: 0.122,
      width: 0.59,
      height: 0.76
    },
    experience: {
      x: 0.25,
      y: 0.07,
      width: 0.5,
      height: 0.86
    }
  }
};

const gameAssets = {
  backgrounds: {
    stage: loadGameImage('asset/backgrounds/bg_stage.png'),
    endless: loadGameImage('asset/backgrounds/bg_endless.png'),
    gameoverGood: loadGameImage('asset/backgrounds/bg_gameover_good.png'),
    gameoverBad: loadGameImage('asset/backgrounds/bg_gameover_bad.png')
  },
  obstacles: {
    normal: loadGameImage('asset/obstacles/obstacle_normal.png'),
    wave: loadGameImage('asset/obstacles/obstacle_wobble.png'),
    glitch: loadGameImage('asset/obstacles/obstacle_glitch.png')
  },
  items: {
    shield: loadGameImage('asset/items/item_shield.png'),
    heal: loadGameImage('asset/items/item_heal.png'),
    poison: loadGameImage('asset/items/item_poison.png'),
    experience: loadGameImage('asset/items/item_experience.png'),
    lifeHeart: loadGameImage('asset/items/ui_heart.svg')
  },
  player: {
    flame: loadGameImage('asset/player/player_flame.png')
  },
  npc: {
    dreamManager: loadGameImage('asset/npc/npc_dream_manager_portrait.png')
  }
};

const TUTORIAL_DIALOGUES = [
  {
    name: '꿈 관리자',
    text: '어라, 일어났네.',
    demos: []
  },
  {
    name: '꿈 관리자',
    text: '깨어나기 전의 방에 온 걸 환영해.',
    demos: []
  },
  {
    name: '꿈 관리자',
    text: '너는 아직 완전히 깨어나지 못한 의식의 불꽃이야.',
    demos: [],
    highlightPlayer: true
  },
  {
    name: '꿈 관리자',
    text: '위에서 떨어지는 악몽의 잔재를 피해야 해. 방향키나 좌우를 터치하면 이동할 수 있어.',
    demos: [{ category: 'obstacles', type: 'normal' }]
  },
  {
    name: '꿈 관리자',
    text: '흔들리는 잔재는 좌우로 움직일거야.',
    demos: [{ category: 'obstacles', type: 'wave' }]
  },
  {
    name: '꿈 관리자',
    text: '뒤틀린 잔재는 중간에 갑자기 위치를 바꿀거고.',
    demos: [{ category: 'obstacles', type: 'glitch' }]
  },
  {
    name: '꿈 관리자',
    text: '방패는 한 번의 충돌을 막아주고, 회복은 목숨을 하나 되돌려줘.',
    demos: [
      { category: 'items', type: 'shield' },
      { category: 'items', type: 'heal' }
    ]
  },
  {
    name: '꿈 관리자',
    text: '깨진 검은 심장은 독극물이야. 닿으면 목숨을 잃어.',
    demos: [{ category: 'items', type: 'poison' }]
  },
  {
    name: '꿈 관리자',
    text: '30초를 버티면 기억하지 못하는 꿈으로 이어질 거야.',
    demos: []
  },
  {
    name: '꿈 관리자',
    text: '기억하지 못하는 꿈에서는 네 의식도, 악몽의 잔재도 더 강해질 거야.',
    demos: []
  },
  {
    name: '꿈 관리자',
    text: '꿈 파편을 얻고, 꿈 레벨을 올려서 오랫동안 타오르도록 해.',
    demos: [{ category: 'items', type: 'experience' }]
  },
  {
    name: '꿈 관리자',
    text: '오래 타오를수록 밝은 아침을 맞이할 수 있겠지.',
    demos: []
  },
  {
    name: '꿈 관리자',
    text: '간단하지? 피하고, 최대한 오래 버텨.',
    demos: []
  }
];

const PHASES = [
  {
    level: 1,
    label: '1',
    startTime: 0,
    spawnInterval: 0.95,
    speedMin: 160,
    speedMax: 260,
    widthMin: 32,
    widthMax: 64,
    heightMin: 20,
    heightMax: 40,
    extraSpawnChance: 0,
    itemSpawnInterval: 5.6,
    itemSpawnChance: 0.54,
    background: '#101723',
    obstacleColor: '#ff4d5e',
    obstacleWeights: {
      normal: 1,
      glitch: 0,
      wave: 0
    },
    itemWeights: {
      shield: 0.39,
      heal: 0.38,
      poison: 0.23
    }
  },
  {
    level: 2,
    label: '2',
    startTime: 10,
    spawnInterval: 0.78,
    speedMin: 190,
    speedMax: 320,
    widthMin: 34,
    widthMax: 72,
    heightMin: 22,
    heightMax: 44,
    extraSpawnChance: 0.08,
    itemSpawnInterval: 5.3,
    itemSpawnChance: 0.52,
    background: '#15162a',
    obstacleColor: '#ff8a3d',
    obstacleWeights: {
      normal: 0.74,
      glitch: 0,
      wave: 0.26
    },
    itemWeights: {
      shield: 0.36,
      heal: 0.36,
      poison: 0.28
    }
  },
  {
    level: 3,
    label: '3',
    startTime: 20,
    spawnInterval: 0.62,
    speedMin: 230,
    speedMax: 370,
    widthMin: 38,
    widthMax: 86,
    heightMin: 24,
    heightMax: 50,
    extraSpawnChance: 0.15,
    itemSpawnInterval: 5.0,
    itemSpawnChance: 0.48,
    background: '#201323',
    obstacleColor: '#ff3dd8',
    obstacleWeights: {
      normal: 0.55,
      glitch: 0.18,
      wave: 0.27
    },
    itemWeights: {
      shield: 0.34,
      heal: 0.33,
      poison: 0.33
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
    label: '독버섯',
    color: '#111111',
    size: 30,
    speed: 165
  },
  experience: {
    label: '꿈 파편',
    color: '#90f6ff',
    size: 34,
    speed: 178
  }
};

const ARTIFACT_STAT_LABELS = {
  items: {
    shield: '방패 획득',
    heal: '회복 획득',
    poison: '깨진 검은 심장 접촉',
    experience: '꿈 파편 획득'
  },
  obstacles: {
    normal: '악몽의 잔재 회피',
    wave: '흔들리는 잔재 회피',
    glitch: '뒤틀린 잔재 회피'
  }
};

const ARTIFACTS = [
  {
    id: 'emberStep',
    name: '잔재를 가르는 불씨',
    iconSrc: 'asset/artifacts/ember_step.svg',
    statGroup: 'obstacles',
    statKey: 'normal',
    condition: '악몽의 잔재 회피 50회 달성',
    effectText: '의식의 불꽃 이동속도 +5%',
    effect: { type: 'playerSpeedMultiplier', value: 1.05 }
  },
  {
    id: 'swayingCompass',
    name: '흔들림의 나침반',
    iconSrc: 'asset/artifacts/swaying_compass.svg',
    statGroup: 'obstacles',
    statKey: 'wave',
    condition: '흔들리는 잔재 회피 50회 달성',
    effectText: '떨어지는 잔재 속도 -5%',
    effect: { type: 'obstacleSpeedMultiplier', value: 0.95 }
  },
  {
    id: 'distortionLens',
    name: '뒤틀림의 렌즈',
    iconSrc: 'asset/artifacts/distortion_lens.svg',
    statGroup: 'obstacles',
    statKey: 'glitch',
    condition: '뒤틀린 잔재 회피 50회 달성',
    effectText: '의식의 불꽃 충돌 판정 -5%',
    effect: { type: 'playerHitboxScale', value: 0.95 }
  },
  {
    id: 'guardianCrest',
    name: '수호몽의 문장',
    iconSrc: 'asset/artifacts/guardian_crest.svg',
    statGroup: 'items',
    statKey: 'shield',
    condition: '방패 아이템 획득 50회 달성',
    effectText: '방패 최대 충전 횟수 +1',
    effect: { type: 'maxShieldBonus', value: 1 }
  },
  {
    id: 'morningHeart',
    name: '새벽의 심장',
    iconSrc: 'asset/artifacts/morning_heart.svg',
    statGroup: 'items',
    statKey: 'heal',
    condition: '회복 아이템 획득 50회 달성',
    effectText: '최대 목숨 +1',
    effect: { type: 'maxLifeBonus', value: 1 }
  },
  {
    id: 'blackHeartVow',
    name: '검은 심장의 맹세',
    iconSrc: 'asset/artifacts/black_heart_vow.svg',
    statGroup: 'items',
    statKey: 'poison',
    condition: '깨진 검은 심장 접촉 50회 달성',
    effectText: '깨진 검은 심장 피해 무효, 접촉 시 꿈 파편 경험치 +1',
    effect: { type: 'poisonToDreamXp', value: 1 }
  },
  {
    id: 'dreamShardPrism',
    name: '꿈 파편의 프리즘',
    iconSrc: 'asset/artifacts/dream_shard_prism.svg',
    statGroup: 'items',
    statKey: 'experience',
    condition: '꿈 파편 획득 50회 달성',
    effectText: '꿈 파편 흡수 범위 증가',
    effect: { type: 'experienceMagnetBonus', value: 70 }
  }
];

const ABILITIES = [
  {
    id: 'flameDash',
    name: '불꽃의 질주',
    tag: '이동',
    description: '플레이어 이동 속도가 8% 증가합니다.',
    weight: 1,
    maxStacks: 3
  },
  {
    id: 'dreamAfterimage',
    name: '몽환의 잔상',
    tag: '희귀',
    description: '플레이어의 충돌 판정이 한 번 작아집니다.',
    weight: 0.42,
    gameLimit: 1
  },
  {
    id: 'shardResonance',
    name: '꿈 파편의 공명',
    tag: '수집',
    description: '꿈 파편을 끌어당기는 범위가 넓어집니다.',
    weight: 1,
    maxStacks: 3
  },
  {
    id: 'consciousRekindle',
    name: '의식의 재점화',
    tag: '희귀',
    description: '방패가 없을 때 일정 시간마다 방패를 다시 얻습니다.',
    weight: 0.38,
    gameLimit: 1
  },
  {
    id: 'slowNightmare',
    name: '느린 악몽',
    tag: '방어',
    description: '떨어지는 장애물의 속도가 8% 느려집니다.',
    weight: 0.9,
    maxStacks: 3
  },
  {
    id: 'dawnPurification',
    name: '새벽의 정화',
    tag: '즉시',
    description: '화면 안의 악몽 잔재 대부분을 즉시 지웁니다.',
    weight: 0.95,
    maxStacks: 4
  },
  {
    id: 'undyingEmber',
    name: '꺼지지 않는 불씨',
    tag: '희귀',
    description: '최대 목숨이 1 증가하고 현재 목숨도 1 회복합니다.',
    weight: 0.55,
    gameLimit: 1
  },
  {
    id: 'lucidDream',
    name: '선명해진 꿈결',
    tag: '점수',
    description: '장애물을 피해서 얻는 점수가 25% 증가합니다.',
    weight: 1,
    maxStacks: 3
  }
];

const sounds = {
  start: new Audio('sounds/start.wav'),
  dodge: new Audio('sounds/dodge.wav'),
  hit: new Audio('sounds/hit.wav'),
  shield: new Audio('sounds/shield.mp3'),
  shieldBreak: new Audio('sounds/shield_break.mp3'),
  heal: new Audio('sounds/heal.mp3'),
  experience: new Audio('sounds/experience.mp3'),
  levelUp: new Audio('sounds/level_up.mp3'),
  poison: new Audio('sounds/poison.wav'),
  win: new Audio('sounds/win.wav'),
  lose: new Audio('sounds/lose.wav')
};

const backgroundMusic = new Audio('sounds/Background.mp3');
backgroundMusic.loop = true;
backgroundMusic.preload = 'auto';

const audioUseTokens = new WeakMap();

Object.values(sounds).forEach((sound) => {
  sound.preload = 'auto';
});

let soundSettings = getSavedSoundSettings();
applySoundSettings();
let artifactProgress = getSavedArtifactProgress();

let player;
let obstacles;
let items;
let experienceItems;
let keys;
let score;
let elapsedTime;
let obstacleSpawnTimer;
let itemSpawnTimer;
let experienceSpawnTimer;
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
let maxShieldCount;
let shieldCount;
let pointerDirection = 0;
let activePointerId = null;
let soundUnlocked = false;
let pendingRecord = null;
let recordSaved = false;
let tutorialIndex = 0;
let tutorialDemoEntities = [];
let dreamLevel;
let dreamXp;
let selectedAbilityChoices = [];
let abilityUseCounts = {};
let experienceMagnetRadius;
let obstacleSpeedMultiplier;
let scoreMultiplier;
let shieldRechargeEnabled;
let shieldRechargeTimer;
let shieldRechargeInterval;
let didSettingsPauseGame = false;
let poisonToDreamXpEnabled = false;
let tutorialTypingTimer = null;
let tutorialTypingText = '';
let tutorialTypingIndex = 0;
let isTutorialTyping = false;
let isAbilitySelectionResolving = false;
let abilitySelectionTimer = null;

function resetGame() {
  player = {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    x: canvas.width / 2 - PLAYER_SIZE / 2,
    y: canvas.height - PLAYER_SIZE - PLAYER_BOTTOM_MARGIN,
    speed: PLAYER_SPEED,
    hitbox: HITBOX_RATIOS.player,
    invincibleTimer: 0
  };

  obstacles = [];
  items = [];
  experienceItems = [];
  keys = {
    left: false,
    right: false
  };

  score = 0;
  elapsedTime = 0;
  obstacleSpawnTimer = 0;
  itemSpawnTimer = 0;
  experienceSpawnTimer = 0;
  lastTimestamp = 0;
  gameState = 'ready';
  currentLevel = 1;
  currentPhase = getPhaseConfig(1);
  maxReachedLevel = 1;
  isInfiniteMode = false;
  enteredInfiniteMode = false;
  maxLives = MAX_LIFE_LIMIT;
  lives = MAX_LIFE_LIMIT;
  maxShieldCount = MAX_SHIELD_COUNT;
  shieldCount = 0;
  resetPointerInput();
  pendingRecord = null;
  recordSaved = false;
  tutorialIndex = 0;
  tutorialDemoEntities = [];
  dreamLevel = 1;
  dreamXp = 0;
  selectedAbilityChoices = [];
  abilityUseCounts = {};
  isAbilitySelectionResolving = false;
  clearAbilitySelectionTimer();
  experienceMagnetRadius = 0;
  obstacleSpeedMultiplier = 1;
  scoreMultiplier = 1;
  shieldRechargeEnabled = false;
  shieldRechargeTimer = 0;
  shieldRechargeInterval = 15;
  poisonToDreamXpEnabled = false;

  applySelectedArtifactEffect();

  hideNicknameForm();
  hideAbilitySelection();
  hidePauseArtifactSummary();
  hideArtifactLayer();
  hidePauseButton();
  hideGameSettingsButton();
  showMenuSettingsButton();
  showMenuArtifactsButton();
  mainMenuButton.classList.add('hidden');
  replayTutorialButton.classList.remove('hidden');
  startButton.textContent = '게임 시작';
  overlayTitle.textContent = GAME_TITLE;
  overlayMessage.textContent = DEFAULT_OVERLAY_MESSAGE;
  drawMainMenuBackground();
}

function startGame(options = {}) {
  const shouldKeepBackgroundMusic = Boolean(options.keepBackgroundMusic);

  cancelAnimationFrame(animationId);
  unlockSounds();
  if (shouldKeepBackgroundMusic) {
    stopEffectSounds();
  } else {
    stopAllSounds();
  }
  resetGame();
  closeSettingsPanel();
  gameState = 'playing';
  playSound('start');
  if (shouldKeepBackgroundMusic) {
    resumeBackgroundMusic();
  } else {
    playBackgroundMusic();
  }
  overlay.classList.add('hidden');
  tutorialLayer.classList.add('hidden');
  showPauseButton();
  showGameSettingsButton();
  hideMenuSettingsButton();
  hideMenuArtifactsButton();
  hideArtifactLayer();
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  if (gameState !== 'playing') return;

  gameState = 'ended';
  cancelAnimationFrame(animationId);
  stopBackgroundMusic();
  playSound('lose');

  const result = enteredInfiniteMode ? 'infinite' : 'lose';

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
    overlayTitle.textContent = '기억하지 못하는 꿈 종료';
    overlayMessage.textContent = `기억하지 못하는 꿈에서 ${Number(elapsedTime).toFixed(1)}초까지 생존했습니다. 최종 점수: ${score}`;
  } else {
    overlayTitle.textContent = '패배';
    overlayMessage.textContent = `${getStageDisplayText(maxReachedLevel)}에서 목숨을 모두 잃었습니다. 최종 점수: ${score}`;
  }

  drawGameOverBackground(result);
  closeSettingsPanel();
  showNicknameForm();
  hidePauseButton();
  hideGameSettingsButton();
  hidePauseArtifactSummary();
  hideMenuSettingsButton();
  hideMenuArtifactsButton();
  hideArtifactLayer();
  mainMenuButton.classList.remove('hidden');
  replayTutorialButton.classList.add('hidden');
  startButton.textContent = '다시 시작';
  overlay.classList.remove('hidden');
}

function returnToMainMenu() {
  cancelAnimationFrame(animationId);
  stopAllSounds();
  closeSettingsPanel();
  closeTutorial();
  hideAbilitySelection();
  resetGame();
  overlay.classList.remove('hidden');
}

function handleStartButtonClick() {
  if (hasSeenTutorial()) {
    startGame();
    return;
  }

  openTutorial();
}

function openTutorial() {
  cancelAnimationFrame(animationId);
  unlockSounds();
  stopEffectSounds();
  playBackgroundMusic();
  resetGame();
  closeSettingsPanel();

  gameState = 'tutorial';
  overlay.classList.add('hidden');
  hidePauseButton();
  hideGameSettingsButton();
  hidePauseArtifactSummary();
  hideMenuSettingsButton();
  hideMenuArtifactsButton();
  hideArtifactLayer();
  tutorialLayer.classList.remove('hidden');
  tutorialLayer.focus({ preventScroll: true });
  setTutorialStep(0);
}

function closeTutorial() {
  cancelTutorialTyping();
  tutorialLayer.classList.add('hidden');
  tutorialDemoEntities = [];
}

function finishTutorial() {
  markTutorialSeen();
  closeTutorial();
  startGame({ keepBackgroundMusic: true });
}

function advanceTutorial() {
  if (tutorialIndex >= TUTORIAL_DIALOGUES.length - 1) {
    finishTutorial();
    return;
  }

  setTutorialStep(tutorialIndex + 1);
}

function setTutorialStep(index) {
  tutorialIndex = clamp(index, 0, TUTORIAL_DIALOGUES.length - 1);

  const dialogue = TUTORIAL_DIALOGUES[tutorialIndex];

  tutorialNpcName.textContent = dialogue.name;
  tutorialDemoEntities = createTutorialDemoEntities(dialogue.demos);
  drawTutorialFrame();
  startTutorialTyping(dialogue.text);
}

function handleTutorialAdvanceInput(event) {
  if (gameState !== 'tutorial') return;

  event.preventDefault();
  event.stopPropagation();

  if (isTutorialTyping) {
    completeTutorialTyping();
    return;
  }

  advanceTutorial();
}

function startTutorialTyping(text) {
  cancelTutorialTyping();

  tutorialTypingText = String(text || '');
  tutorialTypingIndex = 0;
  isTutorialTyping = tutorialTypingText.length > 0;
  tutorialText.textContent = '';

  if (!isTutorialTyping) return;

  typeNextTutorialChunk();
}

function typeNextTutorialChunk() {
  if (!isTutorialTyping) return;

  tutorialTypingIndex = Math.min(
    tutorialTypingText.length,
    tutorialTypingIndex + TUTORIAL_TYPING_CHARS_PER_TICK
  );
  tutorialText.textContent = tutorialTypingText.slice(0, tutorialTypingIndex);

  if (tutorialTypingIndex >= tutorialTypingText.length) {
    isTutorialTyping = false;
    tutorialTypingTimer = null;
    return;
  }

  tutorialTypingTimer = window.setTimeout(typeNextTutorialChunk, TUTORIAL_TYPING_INTERVAL);
}

function completeTutorialTyping() {
  if (!isTutorialTyping) return;

  if (tutorialTypingTimer) {
    clearTimeout(tutorialTypingTimer);
  }

  tutorialText.textContent = tutorialTypingText;
  tutorialTypingIndex = tutorialTypingText.length;
  tutorialTypingTimer = null;
  isTutorialTyping = false;
}

function cancelTutorialTyping() {
  if (tutorialTypingTimer) {
    clearTimeout(tutorialTypingTimer);
  }

  tutorialTypingTimer = null;
  tutorialTypingText = '';
  tutorialTypingIndex = 0;
  isTutorialTyping = false;
}

function createTutorialDemoEntities(demos) {
  if (!Array.isArray(demos) || demos.length === 0) return [];

  return demos.map((demo, index) => createTutorialDemoEntity(demo, index, demos.length));
}

function createTutorialDemoEntity(demo, index, totalCount) {
  const isItemDemo = demo.category === 'items';
  const size = totalCount > 1 ? 58 : (isItemDemo ? 62 : 90);
  const spacing = totalCount > 1 ? 82 : 0;
  const centerX = canvas.width / 2 + (index - (totalCount - 1) / 2) * spacing;
  const centerY = canvas.height * 0.46;
  const x = clamp(centerX - size / 2, 18, canvas.width - size - 18);
  const y = clamp(centerY - size / 2, 48, canvas.height - size - 170);

  return {
    category: demo.category,
    type: demo.type,
    x,
    y,
    width: size,
    height: size,
    size,
    level: currentLevel,
    color: isItemDemo ? ITEM_TYPES[demo.type].color : currentPhase.obstacleColor,
    age: 0,
    baseX: x,
    waveAmplitude: 0,
    waveFrequency: 4.6,
    wavePhase: 0,
    teleportY: canvas.height * 0.42,
    teleported: false,
    glitchFlashTimer: 0
  };
}

function drawTutorialFrame() {
  drawGame();
  drawTutorialHighlight();
  drawTutorialDemo();
}

function drawTutorialDemo() {
  tutorialDemoEntities.forEach(drawTutorialDemoEntity);
}

function drawTutorialDemoEntity(tutorialDemoEntity) {
  if (tutorialDemoEntity.category === 'items') {
    if (drawItemAsset(tutorialDemoEntity)) return;

    if (tutorialDemoEntity.type === 'shield') {
      drawShieldItem(tutorialDemoEntity);
      return;
    }

    drawHeartItem(tutorialDemoEntity, tutorialDemoEntity.type === 'poison');
    return;
  }

  if (drawObstacleAsset(tutorialDemoEntity)) return;

  if (tutorialDemoEntity.type === 'glitch') {
    drawGlitchObstacle(tutorialDemoEntity);
    return;
  }

  if (tutorialDemoEntity.type === 'wave') {
    drawWaveObstacle(tutorialDemoEntity);
    return;
  }

  drawNormalObstacle(tutorialDemoEntity);
}

function drawTutorialHighlight() {
  const dialogue = TUTORIAL_DIALOGUES[tutorialIndex];

  if (!dialogue.highlightPlayer) return;

  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const radius = Math.max(player.width, player.height) * 0.64;

  ctx.save();
  ctx.strokeStyle = 'rgba(143, 214, 255, 0.95)';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(143, 214, 255, 0.95)';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.64)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function hasSeenTutorial() {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch (error) {
    // 저장소를 사용할 수 없어도 현재 튜토리얼 진행은 유지합니다.
  }
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
  experienceSpawnTimer += deltaTime;

  if (player.invincibleTimer > 0) {
    player.invincibleTimer = Math.max(0, player.invincibleTimer - deltaTime);
  }

  updateCurrentPhase();
  updateShieldRecharge(deltaTime);
  movePlayer(deltaTime);
  updateObstacleSpawning(deltaTime);
  updateItemSpawning(deltaTime);
  updateExperienceSpawning();
  updateObstacles(deltaTime);
  updateItems(deltaTime);
  updateExperienceItems(deltaTime);
  handleObstacleCollisions();
  if (gameState !== 'playing') {
    return;
  }

  handleItemCollisions();
  if (gameState !== 'playing') {
    return;
  }

  handleExperienceCollisions();
}

function updateCurrentPhase() {
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
}

function updateObstacleSpawning() {
  if (obstacleSpawnTimer < currentPhase.spawnInterval) return;

  spawnObstacle(currentPhase);

  if (Math.random() < currentPhase.extraSpawnChance) {
    spawnObstacle(currentPhase);
  }

  const infiniteBonusSpawnChance = currentLevel === 4
    ? clamp((elapsedTime - INFINITE_MODE_START_TIME) / 240, 0, 0.22)
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

function updateExperienceSpawning() {
  if (currentLevel !== 4 || dreamLevel >= MAX_DREAM_LEVEL) return;
  if (experienceSpawnTimer < EXPERIENCE_SPAWN_INTERVAL) return;

  if (experienceItems.length < MAX_EXPERIENCE_ITEMS && Math.random() < EXPERIENCE_SPAWN_CHANCE) {
    spawnExperienceItem();
  }

  experienceSpawnTimer = 0;
}

function updateObstacles(deltaTime) {
  obstacles.forEach((obstacle) => {
    obstacle.age += deltaTime;
    obstacle.y += obstacle.speed * obstacleSpeedMultiplier * deltaTime;

    if (obstacle.type === 'wave') {
      obstacle.x = obstacle.baseX + Math.sin(obstacle.age * obstacle.waveFrequency + obstacle.wavePhase) * obstacle.waveAmplitude;
      obstacle.x = clamp(obstacle.x, 0, canvas.width - obstacle.width);
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
      recordObstacleDodge(obstacle.type);
      addScore(getScoreValue(obstacle.level));
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

function updateExperienceItems(deltaTime) {
  const playerCenter = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2
  };

  experienceItems.forEach((item) => {
    item.y += item.speed * deltaTime;
    item.age += deltaTime;

    if (experienceMagnetRadius <= 0) return;

    const itemCenter = {
      x: item.x + item.size / 2,
      y: item.y + item.size / 2
    };
    const distanceX = playerCenter.x - itemCenter.x;
    const distanceY = playerCenter.y - itemCenter.y;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance <= 0 || distance > experienceMagnetRadius) return;

    const pullSpeed = 280 + experienceMagnetRadius * 0.7;
    item.x += (distanceX / distance) * pullSpeed * deltaTime;
    item.y += (distanceY / distance) * pullSpeed * deltaTime;
  });

  experienceItems = experienceItems.filter((item) => item.y < canvas.height + item.size);
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
      recordItemCollection(item.type);
      applyItemEffect(item.type);
    }
  });

  items = items.filter((_, index) => !collectedIndexes.includes(index));
}

function handleExperienceCollisions() {
  const collectedIndexes = [];

  experienceItems.forEach((item, index) => {
    if (isCollidingWithPlayer(item)) {
      collectedIndexes.push(index);
      recordItemCollection('experience');
      collectExperience(item.value);
    }
  });

  experienceItems = experienceItems.filter((_, index) => !collectedIndexes.includes(index));
}

function applyDamage() {
  if (shieldCount > 0) {
    shieldCount -= 1;
    player.invincibleTimer = 0.9;
    playSound('shieldBreak');
    return;
  }

  lives -= 1;
  player.invincibleTimer = 1.1;
  playSound('hit');

  if (lives <= 0) {
    lives = 0;
    endGame();
  }
}

function applyItemEffect(itemType) {
  if (itemType === 'shield') {
    shieldCount = Math.min(maxShieldCount, shieldCount + 1);
    playSound('shield');
    return;
  }

  if (itemType === 'heal') {
    lives = Math.min(maxLives, lives + 1);
    playSound('heal');
    return;
  }

  if (itemType === 'poison') {
    if (poisonToDreamXpEnabled) {
      player.invincibleTimer = 0.8;
      collectExperience(1);
      return;
    }

    lives -= 1;
    player.invincibleTimer = 0.8;
    playSound('poison');

    if (lives <= 0) {
      lives = 0;
      endGame();
    }
  }
}

function updateShieldRecharge(deltaTime) {
  if (!shieldRechargeEnabled) return;

  if (shieldCount >= maxShieldCount) {
    shieldRechargeTimer = 0;
    return;
  }

  shieldRechargeTimer += deltaTime;

  if (shieldRechargeTimer < shieldRechargeInterval) return;

  shieldCount = Math.min(maxShieldCount, shieldCount + 1);
  shieldRechargeTimer = 0;
  playSound('shield');
}

function collectExperience(value) {
  if (dreamLevel >= MAX_DREAM_LEVEL) return;

  dreamXp += value;
  playSound('experience');

  const requiredXp = getDreamXpRequirement(dreamLevel);
  if (dreamXp < requiredXp) return;

  dreamXp -= requiredXp;
  dreamLevel = Math.min(MAX_DREAM_LEVEL, dreamLevel + 1);

  if (dreamLevel >= MAX_DREAM_LEVEL) {
    dreamXp = 0;
  }

  openAbilitySelection();
}

function getDreamXpRequirement(level) {
  if (level >= MAX_DREAM_LEVEL) return 0;
  return level + 2;
}

function openAbilitySelection() {
  selectedAbilityChoices = getRandomAbilityChoices();

  if (selectedAbilityChoices.length === 0) {
    resumeGameAfterAbilitySelection();
    return;
  }

  gameState = 'leveling';
  resetPointerInput();
  closeSettingsPanel();
  hidePauseButton();
  hideGameSettingsButton();
  hidePauseArtifactSummary();
  abilityMessage.textContent = `꿈 레벨 ${dreamLevel}에 도달했습니다. 강화할 힘을 하나 선택하세요.`;
  renderAbilityOptions();
  abilityLayer.classList.remove('hidden');
}

function hideAbilitySelection() {
  clearAbilitySelectionTimer();
  isAbilitySelectionResolving = false;
  abilityLayer.classList.add('hidden');
  abilityOptions.innerHTML = '';
  selectedAbilityChoices = [];
}

function clearAbilitySelectionTimer() {
  if (!abilitySelectionTimer) return;

  clearTimeout(abilitySelectionTimer);
  abilitySelectionTimer = null;
}

function resumeGameAfterAbilitySelection() {
  hideAbilitySelection();
  showPauseButton();
  showGameSettingsButton();
  lastTimestamp = 0;
  gameState = 'playing';
  animationId = requestAnimationFrame(gameLoop);
}

function showPauseButton() {
  showGameSettingsButton();
  setGameSettingsButtonState(false);
}

function hidePauseButton() {
  hideGameSettingsButton();
  setGameSettingsButtonState(false);
}

function showGameSettingsButton() {
  settingsButton.classList.remove('hidden');
}

function hideGameSettingsButton() {
  settingsButton.classList.add('hidden');
}

function showMenuSettingsButton() {
  menuSettingsButton.classList.remove('hidden');
}

function hideMenuSettingsButton() {
  menuSettingsButton.classList.add('hidden');
}

function showMenuArtifactsButton() {
  menuArtifactsButton.classList.remove('hidden');
}

function hideMenuArtifactsButton() {
  menuArtifactsButton.classList.add('hidden');
}

function openArtifactLayer() {
  closeSettingsPanel();
  renderArtifacts();
  artifactLayer.classList.remove('hidden');
}

function hideArtifactLayer() {
  artifactLayer.classList.add('hidden');
}

function showPauseArtifactSummary() {
  const selectedArtifact = getSelectedArtifact();

  if (!selectedArtifact) {
    hidePauseArtifactSummary();
    return;
  }

  pauseArtifactIcon.src = selectedArtifact.iconSrc;
  pauseArtifactIcon.alt = selectedArtifact.name;
  pauseArtifactName.textContent = selectedArtifact.name;
  pauseArtifactEffect.textContent = selectedArtifact.effectText;
  pauseArtifactEffect.classList.add('hidden');
  pauseArtifactButton.classList.remove('hidden');
}

function hidePauseArtifactSummary() {
  pauseArtifactButton.classList.add('hidden');
  pauseArtifactEffect.classList.add('hidden');
}

function togglePauseArtifactEffect() {
  if (pauseArtifactButton.classList.contains('hidden')) return;

  pauseArtifactEffect.classList.toggle('hidden');
}

function setGameSettingsButtonState(isPaused) {
  settingsButton.classList.toggle('is-paused', isPaused);
  settingsButton.setAttribute('aria-label', isPaused ? '설정 닫고 게임 계속하기' : '사운드 설정 열기');
}

function openGameplaySettings() {
  if (gameState === 'playing') {
    didSettingsPauseGame = true;
    pauseGame();
  }

  openSettingsPanel();
}

function pauseGame() {
  if (gameState !== 'playing') return;

  gameState = 'paused';
  cancelAnimationFrame(animationId);
  resetPointerInput();
  keys.left = false;
  keys.right = false;
  setGameSettingsButtonState(true);
  drawGame();
  drawPauseMessage();
  showPauseArtifactSummary();
}

function resumePausedGame() {
  if (gameState !== 'paused') return;

  gameState = 'playing';
  lastTimestamp = 0;
  setGameSettingsButtonState(false);
  hidePauseArtifactSummary();
  resumeBackgroundMusic();
  animationId = requestAnimationFrame(gameLoop);
}

function renderAbilityOptions() {
  abilityOptions.innerHTML = '';

  selectedAbilityChoices.forEach((ability, index) => {
    const button = document.createElement('button');
    const currentStack = abilityUseCounts[ability.id] || 0;

    button.className = 'ability-option';
    button.type = 'button';
    button.dataset.abilityId = ability.id;
    button.innerHTML = `
      <span class="ability-shortcut">${index + 1}</span>
      <span class="ability-copy">
        <strong>${ability.name}</strong>
        <span class="ability-tag">${ability.tag}${currentStack > 0 ? ` Lv.${currentStack + 1}` : ''}</span>
        <p>${ability.description}</p>
      </span>
    `;

    abilityOptions.appendChild(button);
  });
}

function getRandomAbilityChoices() {
  const choices = [];
  let availableAbilities = getAvailableAbilities();

  while (choices.length < 3 && availableAbilities.length > 0) {
    const selectedAbility = chooseWeightedAbility(availableAbilities);
    choices.push(selectedAbility);
    availableAbilities = availableAbilities.filter((ability) => ability.id !== selectedAbility.id);
  }

  return choices;
}

function getAvailableAbilities() {
  return ABILITIES.filter((ability) => {
    const useCount = abilityUseCounts[ability.id] || 0;

    if (ability.gameLimit && useCount >= ability.gameLimit) return false;
    if (ability.maxStacks && useCount >= ability.maxStacks) return false;

    return true;
  });
}

function chooseWeightedAbility(abilities) {
  const totalWeight = abilities.reduce((total, ability) => total + ability.weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const ability of abilities) {
    randomValue -= ability.weight;
    if (randomValue <= 0) return ability;
  }

  return abilities[0];
}

function selectAbility(abilityId) {
  const ability = selectedAbilityChoices.find((choice) => choice.id === abilityId);

  if (!ability || isAbilitySelectionResolving) return;

  isAbilitySelectionResolving = true;

  const selectedButton = Array.from(abilityOptions.querySelectorAll('.ability-option'))
    .find((button) => button.dataset.abilityId === ability.id);

  abilityOptions.querySelectorAll('.ability-option').forEach((button) => {
    button.disabled = true;
  });

  if (selectedButton) {
    selectedButton.classList.add('is-selected');
  }

  playSound('levelUp');

  abilitySelectionTimer = setTimeout(() => {
    abilitySelectionTimer = null;
    abilityUseCounts[ability.id] = (abilityUseCounts[ability.id] || 0) + 1;
    applyAbilityEffect(ability.id);
    resumeGameAfterAbilitySelection();
  }, ABILITY_SELECTION_FLASH_DELAY);
}

function selectAbilityByShortcut(event) {
  if (gameState !== 'leveling' || event.ctrlKey || event.altKey || event.metaKey) return false;

  const shortcutCodes = ['Digit1', 'Digit2', 'Digit3'];
  const shortcutIndex = shortcutCodes.indexOf(event.code);

  if (shortcutIndex < 0 || shortcutIndex >= selectedAbilityChoices.length) return false;

  event.preventDefault();
  selectAbility(selectedAbilityChoices[shortcutIndex].id);
  return true;
}

function applyAbilityEffect(abilityId) {
  if (abilityId === 'flameDash') {
    player.speed *= 1.08;
    return;
  }

  if (abilityId === 'dreamAfterimage') {
    player.hitbox = scaleHitboxRatio(player.hitbox, 0.82);
    return;
  }

  if (abilityId === 'shardResonance') {
    experienceMagnetRadius += 82;
    return;
  }

  if (abilityId === 'consciousRekindle') {
    shieldRechargeEnabled = true;
    shieldRechargeTimer = 0;
    shieldCount = Math.min(maxShieldCount, shieldCount + 1);
    return;
  }

  if (abilityId === 'slowNightmare') {
    obstacleSpeedMultiplier *= 0.92;
    return;
  }

  if (abilityId === 'dawnPurification') {
    cleanseNightmares();
    return;
  }

  if (abilityId === 'undyingEmber') {
    maxLives += ABILITY_MAX_LIFE_BONUS;
    lives = Math.min(maxLives, lives + ABILITY_MAX_LIFE_BONUS);
    return;
  }

  if (abilityId === 'lucidDream') {
    scoreMultiplier += 0.25;
  }
}

function scaleHitboxRatio(hitbox, scale) {
  const nextWidth = hitbox.width * scale;
  const nextHeight = hitbox.height * scale;

  return {
    x: hitbox.x + (hitbox.width - nextWidth) / 2,
    y: hitbox.y + (hitbox.height - nextHeight) / 2,
    width: nextWidth,
    height: nextHeight
  };
}

function cleanseNightmares() {
  obstacles = obstacles.filter((_, index) => index % 3 === 0);
  playSound('win');
}

function addScore(value) {
  score += Math.max(1, Math.ceil(value * scoreMultiplier));
}

function movePlayer(deltaTime) {
  const keyboardDirection = Number(keys.right) - Number(keys.left);
  const movementDirection = pointerDirection || keyboardDirection;

  player.x += movementDirection * player.speed * deltaTime;

  player.x = clamp(player.x, 0, canvas.width - player.width);
}

function spawnObstacle(phaseConfig) {
  const type = chooseWeighted(phaseConfig.obstacleWeights);
  const size = randomNumber(phaseConfig.widthMin, phaseConfig.widthMax);
  const width = size;
  const height = size;
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
    hitbox: HITBOX_RATIOS.obstacles[type] || FULL_HITBOX,
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
    hitbox: HITBOX_RATIOS.items[type] || FULL_HITBOX,
    age: 0,
    color: itemConfig.color
  });
}

function spawnExperienceItem() {
  const itemConfig = ITEM_TYPES.experience;
  const size = itemConfig.size;

  experienceItems.push({
    type: 'experience',
    x: randomNumber(14, canvas.width - size - 14),
    y: -size,
    width: size,
    height: size,
    size,
    speed: itemConfig.speed + randomNumber(-14, 26),
    hitbox: HITBOX_RATIOS.items.experience,
    age: 0,
    color: itemConfig.color,
    value: 1
  });
}

function getPhaseConfig(level) {
  return PHASES.find((phase) => phase.level === level) || PHASES[0];
}

function getInfinitePhaseConfig() {
  const infiniteTime = Math.max(0, elapsedTime - INFINITE_MODE_START_TIME);
  const speedBonus = Math.min(infiniteTime * 2.8, 220);
  const spawnReduction = Math.min(infiniteTime * 0.0016, 0.16);

  return {
    level: 4,
    label: '∞',
    startTime: INFINITE_MODE_START_TIME,
    spawnInterval: Math.max(0.36, 0.56 - spawnReduction),
    speedMin: 260 + speedBonus,
    speedMax: 420 + speedBonus,
    widthMin: 40,
    widthMax: 92,
    heightMin: 24,
    heightMax: 54,
    extraSpawnChance: clamp(0.18 + infiniteTime * 0.0015, 0.18, 0.45),
    itemSpawnInterval: Math.max(4.2, 5.0 - infiniteTime * 0.004),
    itemSpawnChance: 0.44,
    background: '#160f22',
    obstacleColor: '#b95cff',
    obstacleWeights: {
      normal: 0.46,
      glitch: 0.24,
      wave: 0.3
    },
    itemWeights: {
      shield: 0.31,
      heal: 0.29,
      poison: 0.4
    }
  };
}

function getObstacleColor(type, fallbackColor) {
  const colors = {
    normal: fallbackColor,
    glitch: '#54f5ff',
    wave: '#ffe066'
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
  const playerHitbox = getEntityHitbox(player);
  const targetHitbox = getEntityHitbox(target);

  return !(
    playerHitbox.x + playerHitbox.width < targetHitbox.x ||
    playerHitbox.x > targetHitbox.x + targetHitbox.width ||
    playerHitbox.y + playerHitbox.height < targetHitbox.y ||
    playerHitbox.y > targetHitbox.y + targetHitbox.height
  );
}

function getEntityHitbox(entity) {
  const hitbox = entity.hitbox || FULL_HITBOX;

  return {
    x: entity.x + entity.width * hitbox.x,
    y: entity.y + entity.height * hitbox.y,
    width: entity.width * hitbox.width,
    height: entity.height * hitbox.height
  };
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawItems();
  drawExperienceItems();
  drawPlayer();
  drawObstacles();
  drawLevelGuide();
  drawHudMessage();
  drawScoreHud();
  drawLifeHud();
  drawDreamLevelHud();
  drawDreamXpGauge();
}

function drawBackground() {
  ctx.fillStyle = currentPhase.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const backgroundImage = currentLevel === 4
    ? gameAssets.backgrounds.endless
    : gameAssets.backgrounds.stage;

  if (drawCoverImage(backgroundImage, 0, 0, canvas.width, canvas.height)) {
    if (currentLevel !== 4) return;
  }

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

function drawMainMenuBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#101723';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCoverImage(gameAssets.backgrounds.gameoverBad, 0, 0, canvas.width, canvas.height);
}

function drawGameOverBackground(result) {
  const fallbackColor = result === 'infinite' ? '#160f22' : '#101723';
  const backgroundImage = result === 'infinite'
    ? gameAssets.backgrounds.gameoverGood
    : gameAssets.backgrounds.gameoverBad;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fallbackColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCoverImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function loadGameImage(src) {
  const image = new Image();

  image.addEventListener('load', () => {
    if (gameState === 'ended' && pendingRecord) {
      drawGameOverBackground(pendingRecord.result);
      return;
    }

    if (gameState === 'tutorial') {
      drawTutorialFrame();
      return;
    }

    if (gameState === 'ready') {
      drawMainMenuBackground();
      return;
    }

    if (gameState === 'playing') {
      drawGame();
    }
  });

  image.src = src;
  return image;
}

function isImageReady(image) {
  return image && image.complete && image.naturalWidth > 0;
}

function drawCoverImage(image, x, y, width, height) {
  if (!isImageReady(image)) return false;

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else if (imageRatio < targetRatio) {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  return true;
}

function drawSpriteImage(image, x, y, width, height) {
  if (!isImageReady(image)) return false;

  ctx.drawImage(image, x, y, width, height);
  return true;
}

function drawPlayer() {
  const shouldBlink = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 14) % 2 === 0;

  if (shouldBlink) {
    ctx.globalAlpha = 0.45;
  }

  const didDrawPlayerAsset = drawSpriteImage(
    gameAssets.player.flame,
    player.x,
    player.y,
    player.width,
    player.height
  );

  if (!didDrawPlayerAsset) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#9aa6bc';
    ctx.fillRect(player.x + 8, player.y + 6, player.width - 16, 6);
  }

  if (shieldCount > 0) {
    const hitbox = getEntityHitbox(player);
    const isOverchargedShield = shieldCount >= 2;

    ctx.strokeStyle = isOverchargedShield ? 'rgba(255, 95, 131, 0.95)' : 'rgba(100, 210, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawRoundedRect(hitbox.x - 8, hitbox.y - 8, hitbox.width + 16, hitbox.height + 16, 14);
    ctx.stroke();

    if (isOverchargedShield) {
      ctx.strokeStyle = 'rgba(255, 217, 228, 0.74)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawRoundedRect(hitbox.x - 14, hitbox.y - 14, hitbox.width + 28, hitbox.height + 28, 18);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    if (drawObstacleAsset(obstacle)) return;

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

function drawObstacleAsset(obstacle) {
  const image = gameAssets.obstacles[obstacle.type];

  if (!isImageReady(image)) return false;

  const jitterOffset = obstacle.type === 'glitch'
    ? Math.sin(obstacle.age * 42) * (obstacle.glitchFlashTimer > 0 ? 5 : 2)
    : 0;

  drawSpriteImage(image, obstacle.x + jitterOffset, obstacle.y, obstacle.width, obstacle.height);
  return true;
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


function drawItems() {
  items.forEach((item) => {
    if (drawItemAsset(item)) return;

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

function drawExperienceItems() {
  experienceItems.forEach((item) => {
    if (drawItemAsset(item)) return;
    drawExperienceItem(item);
  });
}

function drawItemAsset(item) {
  const image = gameAssets.items[item.type];
  return drawSpriteImage(image, item.x, item.y, item.size, item.size);
}

function drawExperienceItem(item) {
  const cx = item.x + item.size / 2;
  const cy = item.y + item.size / 2;
  const r = item.size / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(144, 246, 255, 0.9)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#90f6ff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.62, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.62, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.58);
  ctx.lineTo(cx + r * 0.24, cy);
  ctx.lineTo(cx, cy + r * 0.58);
  ctx.lineTo(cx - r * 0.24, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
    { label: '기억하지 못하는 꿈', active: currentLevel === 4 }
  ];
  const guideWidth = canvas.width / guideItems.length;

  guideItems.forEach((guide, index) => {
    const x = index * guideWidth;
    const fontSize = guide.label.length > 4 ? 10 : 13;

    ctx.fillStyle = guide.active ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x + 7, 12, guideWidth - 14, 8);

    ctx.fillStyle = guide.active ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
    ctx.font = `700 ${fontSize}px Arial`;
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
  ctx.fillText('기억하지 못하는 꿈', canvas.width / 2, 74);
}

function drawPauseMessage() {
  ctx.save();
  ctx.fillStyle = 'rgba(3, 6, 13, 0.42)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
  ctx.shadowBlur = 10;
  ctx.fillText('일시정지', canvas.width / 2, canvas.height / 2 - 126);
  ctx.restore();
}

function drawScoreHud() {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = 6;
  ctx.fillText(`점수 ${score}`, canvas.width - 16, 52);
  ctx.restore();
}

function drawLifeHud() {
  const heartCount = Math.max(1, maxLives);
  const totalWidth = heartCount * HUD_HEART_SIZE + (heartCount - 1) * HUD_HEART_GAP;
  const startX = canvas.width - 16 - totalWidth;
  const y = 76;

  for (let index = 0; index < heartCount; index += 1) {
    const x = startX + index * (HUD_HEART_SIZE + HUD_HEART_GAP);
    const isActive = index < lives;

    ctx.save();
    ctx.globalAlpha = isActive ? 1 : 0.28;
    ctx.shadowColor = isActive ? 'rgba(255, 95, 131, 0.72)' : 'transparent';
    ctx.shadowBlur = isActive ? 8 : 0;

    if (!drawSpriteImage(gameAssets.items.lifeHeart, x, y, HUD_HEART_SIZE, HUD_HEART_SIZE)) {
      drawHudHeartFallback(x, y, HUD_HEART_SIZE, isActive);
    }

    ctx.restore();
  }
}

function drawDreamLevelHud() {
  ctx.save();
  ctx.fillStyle = '#d7b6ff';
  ctx.font = '800 12px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = 6;
  ctx.fillText(`Dream Level  ${toRomanNumeral(dreamLevel)}`, canvas.width - 16, 101);
  ctx.restore();
}

function drawHudHeartFallback(x, y, size, isActive) {
  const cx = x + size / 2;
  const cy = y + size / 2 + 1;
  const scale = size / 30;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = isActive ? '#ff5f83' : '#5b6274';
  ctx.strokeStyle = isActive ? '#ffd9e4' : 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-20, -4, -12, -20, 0, -10);
  ctx.bezierCurveTo(12, -20, 20, -4, 0, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDreamXpGauge() {
  const barX = 16;
  const barY = canvas.height - 14;
  const barWidth = canvas.width - barX * 2;
  const barHeight = 8;
  const requiredXp = getDreamXpRequirement(dreamLevel);
  const progress = dreamLevel >= MAX_DREAM_LEVEL
    ? 1
    : clamp(requiredXp > 0 ? dreamXp / requiredXp : 0, 0, 1);
  const fillWidth = Math.max(barHeight, barWidth * progress);
  const fillGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);

  fillGradient.addColorStop(0, '#6edfff');
  fillGradient.addColorStop(0.58, '#b691ff');
  fillGradient.addColorStop(1, '#ff7bd5');

  ctx.save();
  ctx.fillStyle = 'rgba(4, 8, 16, 0.68)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  drawRoundedRect(barX, barY, barWidth, barHeight, barHeight / 2);
  ctx.fill();
  ctx.stroke();

  if (progress > 0) {
    ctx.shadowColor = 'rgba(144, 246, 255, 0.72)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = fillGradient;
    ctx.beginPath();
    drawRoundedRect(barX, barY, fillWidth, barHeight, barHeight / 2);
    ctx.fill();
  }

  ctx.restore();
}

function getStageDisplayText(level) {
  if (Number(level) >= 4 || level === 'infinite') return '기억하지 못하는 꿈';
  return `${level}단계`;
}

function toRomanNumeral(value) {
  const romanNumerals = [
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X'
  ];

  return romanNumerals[clamp(Math.round(value), 1, MAX_DREAM_LEVEL)] || 'I';
}

function createDefaultArtifactProgress() {
  return {
    items: {
      shield: 0,
      heal: 0,
      poison: 0,
      experience: 0
    },
    obstacles: {
      normal: 0,
      wave: 0,
      glitch: 0
    },
    selectedArtifactId: ''
  };
}

function getSavedArtifactProgress() {
  try {
    const savedProgress = localStorage.getItem(ARTIFACT_STORAGE_KEY);
    return normalizeArtifactProgress(savedProgress ? JSON.parse(savedProgress) : null);
  } catch (error) {
    return createDefaultArtifactProgress();
  }
}

function normalizeArtifactProgress(progress) {
  const defaultProgress = createDefaultArtifactProgress();
  const normalizedProgress = createDefaultArtifactProgress();

  Object.keys(defaultProgress.items).forEach((key) => {
    normalizedProgress.items[key] = normalizeArtifactCount(progress?.items?.[key]);
  });

  Object.keys(defaultProgress.obstacles).forEach((key) => {
    normalizedProgress.obstacles[key] = normalizeArtifactCount(progress?.obstacles?.[key]);
  });

  normalizedProgress.selectedArtifactId = ARTIFACTS.some((artifact) => artifact.id === progress?.selectedArtifactId)
    ? progress.selectedArtifactId
    : '';

  return normalizedProgress;
}

function normalizeArtifactCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) return 0;

  return Math.floor(numericValue);
}

function saveArtifactProgress() {
  try {
    localStorage.setItem(ARTIFACT_STORAGE_KEY, JSON.stringify(artifactProgress));
  } catch (error) {
    // 저장소를 사용할 수 없어도 현재 세션의 유물 진행은 유지합니다.
  }
}

function recordItemCollection(itemType) {
  recordArtifactStat('items', itemType);
}

function recordObstacleDodge(obstacleType) {
  recordArtifactStat('obstacles', obstacleType);
}

function recordArtifactStat(groupName, statKey) {
  if (!artifactProgress[groupName] || typeof artifactProgress[groupName][statKey] !== 'number') return;

  artifactProgress[groupName][statKey] += 1;
  saveArtifactProgress();
}

function getArtifactCount(artifact) {
  return artifactProgress[artifact.statGroup]?.[artifact.statKey] || 0;
}

function isArtifactUnlocked(artifact) {
  return getArtifactCount(artifact) >= ARTIFACT_UNLOCK_REQUIREMENT;
}

function getSelectedArtifact() {
  const selectedArtifact = ARTIFACTS.find((artifact) => artifact.id === artifactProgress.selectedArtifactId);

  if (!selectedArtifact || !isArtifactUnlocked(selectedArtifact)) return null;

  return selectedArtifact;
}

function applySelectedArtifactEffect() {
  const selectedArtifact = getSelectedArtifact();

  if (!selectedArtifact) return;

  const { effect } = selectedArtifact;

  if (effect.type === 'playerSpeedMultiplier') {
    player.speed *= effect.value;
    return;
  }

  if (effect.type === 'obstacleSpeedMultiplier') {
    obstacleSpeedMultiplier *= effect.value;
    return;
  }

  if (effect.type === 'playerHitboxScale') {
    player.hitbox = scaleHitboxRatio(player.hitbox, effect.value);
    return;
  }

  if (effect.type === 'maxShieldBonus') {
    maxShieldCount += effect.value;
    return;
  }

  if (effect.type === 'maxLifeBonus') {
    maxLives += effect.value;
    lives += effect.value;
    return;
  }

  if (effect.type === 'poisonToDreamXp') {
    poisonToDreamXpEnabled = true;
    return;
  }

  if (effect.type === 'experienceMagnetBonus') {
    experienceMagnetRadius += effect.value;
  }
}

function renderArtifacts() {
  const selectedArtifact = getSelectedArtifact();

  if (artifactProgress.selectedArtifactId && !selectedArtifact) {
    artifactProgress.selectedArtifactId = '';
    saveArtifactProgress();
  }

  renderArtifactStats();
  renderArtifactCards();
}

function renderArtifactStats() {
  artifactStats.innerHTML = '';

  Object.entries(ARTIFACT_STAT_LABELS.items).forEach(([key, label]) => {
    artifactStats.appendChild(createArtifactStatElement(label, artifactProgress.items[key]));
  });

  Object.entries(ARTIFACT_STAT_LABELS.obstacles).forEach(([key, label]) => {
    artifactStats.appendChild(createArtifactStatElement(label, artifactProgress.obstacles[key]));
  });
}

function createArtifactStatElement(label, count) {
  const stat = document.createElement('div');
  stat.className = 'artifact-stat';

  const statLabel = document.createElement('span');
  statLabel.textContent = label;

  const statValue = document.createElement('strong');
  statValue.textContent = `${count || 0}회`;

  stat.append(statLabel, statValue);
  return stat;
}

function renderArtifactCards() {
  artifactList.innerHTML = '';

  ARTIFACTS.forEach((artifact) => {
    const count = getArtifactCount(artifact);
    const isUnlocked = isArtifactUnlocked(artifact);
    const isSelected = artifactProgress.selectedArtifactId === artifact.id && isUnlocked;
    const progressRatio = clamp(count / ARTIFACT_UNLOCK_REQUIREMENT, 0, 1);
    const card = document.createElement('article');
    card.className = `artifact-card${isUnlocked ? '' : ' is-locked'}${isSelected ? ' is-selected' : ''}`;

    const header = document.createElement('div');
    header.className = 'artifact-card-header';

    const copy = document.createElement('div');
    copy.className = 'artifact-card-copy';

    const title = document.createElement('h3');
    title.textContent = artifact.name;

    const icon = document.createElement('img');
    icon.className = 'artifact-icon';
    icon.src = artifact.iconSrc;
    icon.alt = artifact.name;

    const condition = document.createElement('p');
    condition.textContent = `${artifact.condition} (${Math.min(count, ARTIFACT_UNLOCK_REQUIREMENT)} / ${ARTIFACT_UNLOCK_REQUIREMENT})`;

    const effect = document.createElement('p');
    effect.textContent = artifact.effectText;

    copy.append(title, condition, effect);
    header.append(copy, icon);

    const progress = document.createElement('div');
    progress.className = 'artifact-progress';

    const progressFill = document.createElement('span');
    progressFill.style.width = `${progressRatio * 100}%`;
    progress.appendChild(progressFill);

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.dataset.artifactId = artifact.id;
    selectButton.disabled = !isUnlocked || isSelected;
    selectButton.textContent = isSelected ? '선택 중' : (isUnlocked ? '선택' : '잠김');

    card.append(header, progress, selectButton);
    artifactList.appendChild(card);
  });
}

function selectArtifact(artifactId) {
  const artifact = ARTIFACTS.find((candidate) => candidate.id === artifactId);

  if (!artifact || !isArtifactUnlocked(artifact)) return;

  artifactProgress.selectedArtifactId = artifact.id;
  saveArtifactProgress();
  renderArtifacts();
}

function getSavedSoundSettings() {
  try {
    const savedSettings = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (!savedSettings) {
      return {
        bgm: DEFAULT_BGM_VOLUME,
        sfx: DEFAULT_SFX_VOLUME,
        muted: false
      };
    }

    const parsedSettings = JSON.parse(savedSettings);

    return {
      bgm: normalizeVolumeValue(parsedSettings.bgm, DEFAULT_BGM_VOLUME),
      sfx: normalizeVolumeValue(parsedSettings.sfx, DEFAULT_SFX_VOLUME),
      muted: Boolean(parsedSettings.muted)
    };
  } catch (error) {
    return {
      bgm: DEFAULT_BGM_VOLUME,
      sfx: DEFAULT_SFX_VOLUME,
      muted: false
    };
  }
}

function normalizeVolumeValue(value, fallbackValue) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallbackValue;
  }

  return Math.round(clamp(numericValue, 0, 100));
}

function saveSoundSettings() {
  try {
    localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(soundSettings));
  } catch (error) {
    // 저장소를 사용할 수 없어도 현재 세션의 볼륨 변경은 그대로 적용합니다.
  }
}

function applySoundSettings() {
  applyBackgroundMusicSettings();

  Object.values(sounds).forEach((sound) => {
    applyEffectSoundSettings(sound);
  });

  syncSoundSettingsControls();
}

function applyBackgroundMusicSettings() {
  backgroundMusic.muted = soundSettings.muted;
  backgroundMusic.volume = soundSettings.muted ? 0 : soundSettings.bgm / 100;
}

function applyEffectSoundSettings(sound) {
  sound.muted = soundSettings.muted;
  sound.volume = soundSettings.muted ? 0 : soundSettings.sfx / 100;
}

function syncSoundSettingsControls() {
  bgmVolumeInput.value = soundSettings.bgm;
  bgmVolumeValue.textContent = soundSettings.bgm;
  sfxVolumeInput.value = soundSettings.sfx;
  sfxVolumeValue.textContent = soundSettings.sfx;
  muteToggleButton.textContent = soundSettings.muted ? '음소거 ON' : '음소거 OFF';
  muteToggleButton.classList.toggle('is-muted', soundSettings.muted);
  muteToggleButton.setAttribute('aria-pressed', String(soundSettings.muted));
}

function updateSoundSetting(settingName, value) {
  soundSettings = {
    ...soundSettings,
    [settingName]: normalizeVolumeValue(value, soundSettings[settingName])
  };

  applySoundSettings();
  saveSoundSettings();
}

function toggleMuteSetting() {
  soundSettings = {
    ...soundSettings,
    muted: !soundSettings.muted
  };

  applySoundSettings();
  saveSoundSettings();
}

function openSettingsPanel() {
  soundSettingsPanel.classList.remove('hidden');
  settingsButton.setAttribute('aria-expanded', 'true');
  menuSettingsButton.setAttribute('aria-expanded', 'true');
}

function closeSettingsPanel() {
  const shouldResumeGame = didSettingsPauseGame && gameState === 'paused';

  soundSettingsPanel.classList.add('hidden');
  settingsButton.setAttribute('aria-expanded', 'false');
  menuSettingsButton.setAttribute('aria-expanded', 'false');
  didSettingsPauseGame = false;

  if (shouldResumeGame) {
    resumePausedGame();
  }
}

function toggleSettingsPanel() {
  if (soundSettingsPanel.classList.contains('hidden')) {
    openSettingsPanel();
    return;
  }

  closeSettingsPanel();
}

function playSound(soundName) {
  const sound = sounds[soundName];

  if (!sound) return;

  markAudioElementInUse(sound);
  applyEffectSoundSettings(sound);
  sound.currentTime = 0;
  sound.play().catch(() => {
    // 브라우저 자동 재생 정책으로 막히면 게임 진행은 그대로 유지합니다.
  });
}

function playBackgroundMusic() {
  markAudioElementInUse(backgroundMusic);
  applyBackgroundMusicSettings();
  backgroundMusic.currentTime = 0;
  backgroundMusic.play().catch(() => {
    // 브라우저 자동 재생 정책으로 막히면 게임 진행은 그대로 유지합니다.
  });
}

function resumeBackgroundMusic() {
  markAudioElementInUse(backgroundMusic);
  applyBackgroundMusicSettings();
  backgroundMusic.play().catch(() => {
    // 브라우저 자동 재생 정책으로 막히면 게임 진행은 그대로 유지합니다.
  });
}

function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

function stopEffectSounds() {
  Object.values(sounds).forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
}

function stopAllSounds() {
  stopEffectSounds();
  stopBackgroundMusic();
}

function unlockSounds() {
  if (soundUnlocked) return;

  Object.values(sounds).forEach((sound) => {
    primeAudioElement(sound);
  });
  primeAudioElement(backgroundMusic);

  soundUnlocked = true;
}

function markAudioElementInUse(audioElement) {
  audioUseTokens.set(audioElement, getAudioElementToken(audioElement) + 1);
}

function getAudioElementToken(audioElement) {
  return audioUseTokens.get(audioElement) || 0;
}

function primeAudioElement(audioElement) {
  const unlockToken = getAudioElementToken(audioElement);
  const previousMuted = audioElement.muted;
  const previousVolume = audioElement.volume;

  audioElement.load();
  audioElement.muted = true;
  audioElement.volume = 0;

  let playPromise;

  try {
    playPromise = audioElement.play();
  } catch (error) {
    audioElement.muted = previousMuted;
    audioElement.volume = previousVolume;
    return;
  }

  const finishPrime = () => {
    if (getAudioElementToken(audioElement) === unlockToken) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    audioElement.muted = previousMuted;
    audioElement.volume = previousVolume;
  };

  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.then(finishPrime).catch(() => {
      audioElement.muted = previousMuted;
      audioElement.volume = previousVolume;
    });
    return;
  }

  finishPrime();
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
  if (record.enteredInfiniteMode || record.result === 'infinite') return '기억하지 못하는 꿈';
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

function updatePointerDirection(event) {
  const rect = canvas.getBoundingClientRect();
  pointerDirection = event.clientX < rect.left + rect.width / 2 ? -1 : 1;
}

function resetPointerInput(event) {
  const pointerId = event?.pointerId ?? activePointerId;

  if (
    pointerId !== null
    && pointerId !== undefined
    && typeof canvas.hasPointerCapture === 'function'
    && canvas.hasPointerCapture(pointerId)
  ) {
    canvas.releasePointerCapture(pointerId);
  }

  pointerDirection = 0;
  activePointerId = null;
}

function startPointerInput(event) {
  if (gameState !== 'playing') return;
  if (activePointerId !== null && activePointerId !== event.pointerId) return;

  activePointerId = event.pointerId;
  updatePointerDirection(event);

  if (typeof canvas.setPointerCapture === 'function') {
    canvas.setPointerCapture(event.pointerId);
  }

  event.preventDefault();
}

function movePointerInput(event) {
  if (event.pointerId !== activePointerId) return;

  updatePointerDirection(event);
  event.preventDefault();
}

function endPointerInput(event) {
  if (event.pointerId !== activePointerId) return;

  resetPointerInput(event);
  event.preventDefault();
}

function cancelPointerInputOnExit(event) {
  if (event.pointerId !== activePointerId) return;

  resetPointerInput(event);
}

function isLeftMoveKey(event) {
  return event.key === 'ArrowLeft' || event.code === 'KeyA' || event.key.toLowerCase() === 'a';
}

function isRightMoveKey(event) {
  return event.key === 'ArrowRight' || event.code === 'KeyD' || event.key.toLowerCase() === 'd';
}

window.addEventListener('keydown', (event) => {
  if (gameState !== 'playing') return;

  if (isLeftMoveKey(event)) {
    keys.left = true;
    event.preventDefault();
  }

  if (isRightMoveKey(event)) {
    keys.right = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (!keys) return;

  if (isLeftMoveKey(event)) {
    keys.left = false;
  }

  if (isRightMoveKey(event)) {
    keys.right = false;
  }
});

canvas.addEventListener('pointerdown', startPointerInput);
canvas.addEventListener('pointermove', movePointerInput);
canvas.addEventListener('pointerup', endPointerInput);
canvas.addEventListener('pointercancel', endPointerInput);
canvas.addEventListener('lostpointercapture', endPointerInput);
canvas.addEventListener('pointerleave', cancelPointerInputOnExit);
canvas.addEventListener('pointerout', cancelPointerInputOnExit);
window.addEventListener('blur', resetPointerInput);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resetPointerInput();
  }
});

document.addEventListener('pointerdown', unlockSounds, { capture: true, once: true });
document.addEventListener('touchstart', unlockSounds, { capture: true, once: true, passive: true });
document.addEventListener('keydown', unlockSounds, { capture: true, once: true });

settingsButton.addEventListener('click', (event) => {
  event.stopPropagation();
  if (gameState === 'playing' || gameState === 'paused') {
    if (soundSettingsPanel.classList.contains('hidden')) {
      openGameplaySettings();
      return;
    }

    closeSettingsPanel();
    return;
  }

  toggleSettingsPanel();
});

menuSettingsButton.addEventListener('click', (event) => {
  event.stopPropagation();
  hideArtifactLayer();
  toggleSettingsPanel();
});

menuArtifactsButton.addEventListener('click', (event) => {
  event.stopPropagation();
  openArtifactLayer();
});

closeArtifactButton.addEventListener('click', hideArtifactLayer);

pauseArtifactButton.addEventListener('click', (event) => {
  event.stopPropagation();
  togglePauseArtifactEffect();
});

artifactLayer.addEventListener('click', (event) => {
  if (event.target === artifactLayer) {
    hideArtifactLayer();
  }
});

artifactList.addEventListener('click', (event) => {
  const selectButton = event.target.closest('button[data-artifact-id]');

  if (!selectButton) return;

  selectArtifact(selectButton.dataset.artifactId);
});

closeSettingsButton.addEventListener('click', closeSettingsPanel);

soundSettingsPanel.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.addEventListener('click', closeSettingsPanel);

document.addEventListener('keydown', (event) => {
  if (selectAbilityByShortcut(event)) {
    return;
  }

  if (gameState === 'tutorial' && (event.key === 'Enter' || event.key === ' ')) {
    handleTutorialAdvanceInput(event);
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();

    if (gameState === 'playing') {
      openGameplaySettings();
      return;
    }

    if (gameState === 'paused') {
      toggleSettingsPanel();
      return;
    }

    closeSettingsPanel();
    hideArtifactLayer();
  }
});

bgmVolumeInput.addEventListener('input', (event) => {
  updateSoundSetting('bgm', event.target.value);
});

sfxVolumeInput.addEventListener('input', (event) => {
  updateSoundSetting('sfx', event.target.value);
});

muteToggleButton.addEventListener('click', toggleMuteSetting);

abilityOptions.addEventListener('click', (event) => {
  const optionButton = event.target.closest('.ability-option');

  if (!optionButton) return;

  selectAbility(optionButton.dataset.abilityId);
});

startButton.addEventListener('click', handleStartButtonClick);
mainMenuButton.addEventListener('click', returnToMainMenu);
replayTutorialButton.addEventListener('click', openTutorial);
tutorialLayer.addEventListener('pointerup', handleTutorialAdvanceInput);
nicknameForm.addEventListener('submit', saveCurrentRecord);
clearRankingButton.addEventListener('click', clearRankings);

resetGame();
renderRankings();
