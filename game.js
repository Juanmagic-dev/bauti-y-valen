// ===== Valentina y las Kpops — Motor multi-nivel, multi-personaje =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const chocoCountEl = document.getElementById('chocoCount');
const chocoTotalEl = document.getElementById('chocoTotal');
const livesEl = document.getElementById('livesDisplay');
const messageEl = document.getElementById('message');
const messageTextEl = document.getElementById('messageText');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');
const switchCharBtn = document.getElementById('switchCharBtn');
const transformBtn = document.getElementById('transformBtn');
const charBadgeEl = document.getElementById('charBadge');
const subtitleEl = document.getElementById('subtitle');
const levelBtns = document.querySelectorAll('.levelBtn');

const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const DOUBLE_JUMP_FORCE = -11;
const FLAP_FORCE = -7;
const MOVE_SPEED = 4;
const GROUND_Y = 460;
const PROJECTILE_SPEED = 11;
const PROJECTILE_COOLDOWN = 350; // ms
const CRUMBLE_SHAKE_FRAMES = 27;
const CRUMBLE_GONE_FRAMES = 110;
const STAND_HEIGHT = 50;
const DUCK_HEIGHT = 28;
const PLAYER_WIDTH = 34;

// =====================================================
// ---- Personajes ----
// Las habilidades de movimiento (agacharse, doble salto, volar) van con la
// persona base y se mantienen al transformarse; la transformación (tecla T)
// solo cambia el look y el proyectil.
// =====================================================
const ABILITIES = {
  valentina: { canDoubleJump: true, canDuck: true, canFly: false },
  bauti: { canDoubleJump: true, canDuck: false, canFly: true },
};

const FORMS = {
  valentina: {
    normal: {
      label: 'Valentina', letter: 'V', emoji: '👧',
      projectileKind: 'heart',
      hairTop: '#ffe066', hairBottom: '#ffc93b', hairStroke: '#e8ac1f',
      outfitTop: '#ff8fb8', outfitBottom: '#d6336c',
    },
    transformed: {
      label: 'Rumi', letter: '♪', emoji: '🎤',
      projectileKind: 'sword',
      hairTop: '#c084f5', hairBottom: '#7a3fc7', hairStroke: '#5a2a9c',
      outfitTop: '#4a2a5a', outfitBottom: '#1a0a24',
      sparkle: true,
    },
  },
  bauti: {
    normal: {
      label: 'Bauti', letter: 'B', emoji: '👦',
      projectileKind: 'soccerball',
      hairTop: '#ffdb4d', hairBottom: '#e8ac1f', hairStroke: '#c98a10',
      outfitTop: '#8fd3ff', outfitBottom: '#3f9dd6',
    },
    transformed: {
      label: 'Messi', letter: '10', emoji: '⚽',
      projectileKind: 'goldball',
      hairTop: '#3a3a3a', hairBottom: '#161616', hairStroke: '#000000',
      outfitTop: '#8ecbf2', outfitBottom: '#ffffff',
    },
  },
};

function getCharDef() {
  const form = player.transformed ? 'transformed' : 'normal';
  return { ...ABILITIES[player.character], ...FORMS[player.character][form] };
}

// =====================================================
// ---- Definición de niveles ----
// =====================================================
const LEVELS = [
  {
    name: 'Nivel 1',
    subtitle: 'El patio de los dulces',
    worldWidth: 3200,
    startX: 50,
    startY: GROUND_Y - 50,
    theme: {
      skyTop: '#8fd8ff', skyMid: '#bdeaff', skyBottom: '#e8fbff',
      farColor: '#f3b6d3', midColor: '#c9edb0',
      groundTop: '#c98a4d', groundBottom: '#8a5a2b',
      topStripTop: '#8fe06b', topStripBottom: '#5fb83f', stripStyle: 'grass',
      platformTop: '#ffe3c2', platformBottom: '#e2a86a', platformBorder: '#b97a3f',
      glowColor: 'rgba(255,244,180,0.9)', lightColor: '#fff3b0',
      hazardFill: '#c9c9d4', hazardStroke: '#8a8a99',
    },
    groundSegments: [
      { x: 0, width: 500 }, { x: 580, width: 300 }, { x: 960, width: 260 },
      { x: 1300, width: 400 }, { x: 1780, width: 300 }, { x: 2160, width: 500 },
      { x: 2740, width: 460 },
    ],
    hazards: [],
    platforms: [
      { x: 650, y: 340, width: 120, height: 20, type: 'static' },
      { x: 1000, y: 300, width: 100, height: 20, type: 'static' },
      { x: 1150, y: 380, width: 100, height: 20, type: 'static' },
      { x: 1450, y: 320, width: 140, height: 20, type: 'static' },
      { x: 1850, y: 350, width: 100, height: 20, type: 'static' },
      { x: 2000, y: 260, width: 100, height: 20, type: 'static' },
      { x: 2220, y: 340, width: 120, height: 20, type: 'static' },
      { x: 2450, y: 280, width: 100, height: 20, type: 'static' },
    ],
    chocolateSpots: [
      [200, 400], [260, 400], [320, 400], [700, 300], [740, 300],
      [1020, 260], [1180, 340], [1350, 400], [1400, 400], [1470, 280],
      [1500, 400], [1550, 400], [1880, 310], [2020, 220], [2250, 300],
      [2280, 300], [2480, 240], [2820, 400], [2870, 400], [2920, 400],
    ],
    enemyDefs: [
      { type: 'broccoli', x: 620, y: GROUND_Y - 30, minX: 590, maxX: 850, speed: 1.4 },
      { type: 'broccoli', x: 1350, y: GROUND_Y - 30, minX: 1310, maxX: 1650, speed: 1.6 },
      { type: 'broccoli', x: 2200, y: 340 - 30, minX: 2170, maxX: 2340, speed: 1.3 },
      { type: 'broccoli', x: 2780, y: GROUND_Y - 30, minX: 2760, maxX: 3050, speed: 1.5 },
    ],
    goal: { x: 3080, y: GROUND_Y - 70, width: 50, height: 70 },
    hints: [],
  },
  {
    name: 'Nivel 2',
    subtitle: 'La fábrica de chocolate',
    worldWidth: 3700,
    startX: 50,
    startY: GROUND_Y - 50,
    theme: {
      skyTop: '#4a2f4a', skyMid: '#6d4463', skyBottom: '#9a6a82',
      farColor: '#3a2540', midColor: '#5a3a52',
      groundTop: '#6b5344', groundBottom: '#382a20',
      topStripTop: '#e2b23c', topStripBottom: '#b8860b', stripStyle: 'belt',
      platformTop: '#d9b3ff', platformBottom: '#8a5ec4', platformBorder: '#5a3a8a',
      glowColor: 'rgba(255,220,150,0.7)', lightColor: '#ffd98a',
      hazardFill: '#c9c9d4', hazardStroke: '#8a8a99',
    },
    groundSegments: [
      { x: 0, width: 460 }, { x: 540, width: 220 }, { x: 900, width: 250 },
      { x: 1230, width: 270 }, { x: 1600, width: 250 }, { x: 1950, width: 350 },
      { x: 2470, width: 280 }, { x: 2850, width: 300 }, { x: 3260, width: 440 },
    ],
    hazards: [
      { x: 260, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 960, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 1660, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 2520, y: GROUND_Y - 16, width: 60, height: 16 },
    ],
    platforms: [
      { x: 780, y: 400, width: 90, height: 20, type: 'moving', axis: 'x', min: 770, max: 890, speed: 1.5, dir: 1 },
      { x: 1280, y: 380, width: 100, height: 20, type: 'static' },
      { x: 1430, y: 320, width: 100, height: 20, type: 'static' },
      { x: 2010, y: 400, width: 70, height: 18, type: 'crumble' },
      { x: 2110, y: 400, width: 70, height: 18, type: 'crumble' },
      { x: 2210, y: 400, width: 70, height: 18, type: 'crumble' },
      { x: 2540, y: 260, width: 90, height: 20, type: 'moving', axis: 'y', min: 260, max: 420, speed: 1.1, dir: 1 },
      { x: 3330, y: 340, width: 120, height: 20, type: 'static' },
    ],
    chocolateSpots: [
      [150, 400], [190, 400], [700, 300], [820, 350],
      [1300, 340], [1450, 280], [1650, 400], [1690, 400],
      [2020, 360], [2120, 360], [2220, 360],
      [2540, 220], [2570, 220], [2600, 220],
      [2900, 400], [2950, 400], [3000, 400],
      [3350, 300], [3560, 400], [3600, 400],
    ],
    enemyDefs: [
      { type: 'broccoli', x: 600, y: GROUND_Y - 30, minX: 560, maxX: 740, speed: 1.6 },
      { type: 'wasp', x: 1000, y: 350, minX: 920, maxX: 1140, speed: 1.8, baseY: 340, amplitude: 60 },
      { type: 'superBroccoli', x: 1300, y: GROUND_Y - 42, minX: 1240, maxX: 1480, speed: 1.8, hp: 2, shooter: true, shootInterval: 150, shootSpeed: 5, shootTimer: 70 },
      { type: 'wasp', x: 1700, y: 300, minX: 1620, maxX: 1840, speed: 2, baseY: 300, amplitude: 80 },
      { type: 'broccoli', x: 2010, y: GROUND_Y - 30, minX: 1970, maxX: 2280, speed: 1.7 },
      { type: 'superBroccoli', x: 2500, y: GROUND_Y - 42, minX: 2480, maxX: 2740, speed: 2, hp: 2, shooter: true, shootInterval: 150, shootSpeed: 5, shootTimer: 30 },
      { type: 'wasp', x: 2900, y: 350, minX: 2860, maxX: 3130, speed: 1.9, baseY: 340, amplitude: 70 },
    ],
    goal: { x: 3620, y: GROUND_Y - 70, width: 50, height: 70 },
    hints: [],
  },
  {
    name: 'Nivel 3',
    subtitle: 'El iceberg congelado',
    worldWidth: 4000,
    startX: 50,
    startY: GROUND_Y - 50,
    slippery: true,
    theme: {
      skyTop: '#bfe9ff', skyMid: '#e6f7ff', skyBottom: '#ffffff',
      farColor: '#9fd3e8', midColor: '#cdeffa',
      groundTop: '#eaf9ff', groundBottom: '#a8d8e8',
      topStripTop: '#ffffff', topStripBottom: '#bfe9ff', stripStyle: 'ice',
      platformTop: '#eaffff', platformBottom: '#8fd3e8', platformBorder: '#4a90a4',
      glowColor: 'rgba(220,245,255,0.9)', lightColor: '#eafcff',
      hazardFill: '#dff6ff', hazardStroke: '#5a9db3',
    },
    groundSegments: [
      { x: 0, width: 420 }, { x: 500, width: 200 }, { x: 800, width: 250 },
      { x: 1150, width: 200 }, { x: 1460, width: 190 }, { x: 1880, width: 220 },
      { x: 2190, width: 260 }, { x: 2600, width: 250 }, { x: 2950, width: 250 },
      { x: 3300, width: 300 }, { x: 3700, width: 300 },
    ],
    hazards: [
      { x: 560, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 1520, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 2700, y: GROUND_Y - 16, width: 60, height: 16 },
      { x: 3400, y: GROUND_Y - 16, width: 60, height: 16 },
    ],
    platforms: [
      { x: 950, y: 340, width: 90, height: 20, type: 'static' },
      { x: 2000, y: 320, width: 100, height: 20, type: 'static' },
      { x: 2455, y: 400, width: 50, height: 18, type: 'crumble' },
      { x: 2515, y: 400, width: 50, height: 18, type: 'crumble' },
      { x: 2575, y: 400, width: 50, height: 18, type: 'crumble' },
      { x: 3050, y: 240, width: 90, height: 20, type: 'moving', axis: 'y', min: 240, max: 420, speed: 1.3, dir: 1 },
      { x: 2940, y: 220, width: 150, height: 20, type: 'static' },
      { x: 3350, y: 260, width: 110, height: 20, type: 'static' },
    ],
    chocolateSpots: [
      [150, 400], [190, 400], [230, 400],
      [520, 400], [650, 400],
      [860, 300], [980, 300],
      [1200, 400], [1280, 400],
      [1520, 400], [1580, 400],
      [1740, 380], [1780, 340],
      [1950, 400], [2020, 280],
      [2300, 400], [2380, 400],
      [2470, 360], [2530, 360], [2590, 360],
      [2650, 400], [2750, 400],
      [2960, 190], [3010, 190], [3060, 190],
      [3350, 220],
      [3720, 400], [3760, 400], [3800, 400], [3850, 400],
    ],
    enemyDefs: [
      { type: 'penguin', x: 900, y: GROUND_Y - 30, minX: 820, maxX: 1020, speed: 1.5, shooter: true, shootInterval: 110, shootSpeed: 6, shootTimer: 40 },
      { type: 'broccoli', x: 1220, y: GROUND_Y - 30, minX: 1180, maxX: 1330, speed: 2.0 },
      { type: 'superBroccoli', x: 2280, y: GROUND_Y - 42, minX: 2220, maxX: 2420, speed: 2.0, hp: 2, shooter: true, shootInterval: 150, shootSpeed: 5, shootTimer: 60 },
      { type: 'penguin', x: 2650, y: GROUND_Y - 30, minX: 2600, maxX: 2760, speed: 1.6, shooter: true, shootInterval: 100, shootSpeed: 6, shootTimer: 20 },
      { type: 'penguin', x: 2760, y: GROUND_Y - 30, minX: 2680, maxX: 2830, speed: 1.7, shooter: true, shootInterval: 100, shootSpeed: 6, shootTimer: 80 },
      { type: 'wasp', x: 3450, y: 300, minX: 3350, maxX: 3580, speed: 2.0, baseY: 300, amplitude: 70, shooter: true, shootInterval: 130, shootSpeed: 6, shootTimer: 50 },
    ],
    goal: { x: 3950, y: GROUND_Y - 70, width: 50, height: 70 },
    hints: [
      { x: 60, y: 380, text: 'C = Cambiar personaje' },
      { x: 830, y: 380, text: '¡Agáchate para esquivar! ⬇️' },
      { x: 1680, y: 370, text: '¡Doble salto de Bauti! 🦘🦘' },
    ],
  },
  {
    name: 'Nivel 4',
    subtitle: 'La Copa del Mundo 2026',
    worldWidth: 4200,
    startX: 50,
    startY: GROUND_Y - 50,
    theme: {
      skyTop: '#6ec6ff', skyMid: '#a8e0ff', skyBottom: '#eaf8ff',
      farColor: '#3a5f8a', midColor: '#5c85ad',
      groundTop: '#2d6b2d', groundBottom: '#1e4a1e',
      topStripTop: '#4fae4f', topStripBottom: '#3e8f3e', stripStyle: 'pitch',
      platformTop: '#eaf4ff', platformBottom: '#7fb8e8', platformBorder: '#2b5a8a',
      glowColor: 'rgba(255,255,255,0.6)', lightColor: '#ffffff',
      hazardFill: '#c9c9d4', hazardStroke: '#8a8a99',
    },
    groundSegments: [
      { x: 0, width: 450 }, { x: 540, width: 240 }, { x: 880, width: 270 },
      { x: 1260, width: 290 }, { x: 1650, width: 300 }, { x: 2070, width: 280 },
      { x: 2470, width: 280 }, { x: 2850, width: 300 }, { x: 3260, width: 340 },
      { x: 3700, width: 500 },
    ],
    hazards: [],
    rollingHazards: [
      { x: 600, y: GROUND_Y - 18, radius: 18, min: 560, max: 740, speed: 2.2 },
      { x: 1350, y: GROUND_Y - 18, radius: 18, min: 1290, max: 1500, speed: 2.6 },
      { x: 2550, y: GROUND_Y - 18, radius: 18, min: 2500, max: 2700, speed: 2.8 },
      { x: 3850, y: GROUND_Y - 18, radius: 18, min: 3760, max: 4050, speed: 3.0 },
    ],
    platforms: [
      { x: 1000, y: 340, width: 100, height: 20, type: 'static' },
      { x: 1700, y: 320, width: 120, height: 20, type: 'static' },
      { x: 1960, y: 400, width: 80, height: 20, type: 'moving', axis: 'x', min: 1955, max: 2065, speed: 1.4, dir: 1 },
      { x: 2365, y: 400, width: 55, height: 18, type: 'crumble' },
      { x: 2430, y: 400, width: 55, height: 18, type: 'crumble' },
      { x: 3400, y: 240, width: 90, height: 20, type: 'moving', axis: 'y', min: 240, max: 420, speed: 1.3, dir: 1 },
      { x: 3320, y: 220, width: 160, height: 20, type: 'static' },
    ],
    chocolateSpots: [
      [150, 400], [200, 400], [250, 400],
      [600, 400],
      [950, 300], [1050, 300],
      [1350, 400],
      [1700, 280], [1750, 280],
      [2100, 400], [2150, 400],
      [2380, 360], [2440, 360],
      [2550, 400],
      [2900, 400], [2950, 400], [3000, 400],
      [3340, 190], [3390, 190], [3440, 190],
      [3480, 400],
      [3750, 400], [3800, 400],
      [4000, 400], [4050, 400], [4100, 400], [4150, 400],
    ],
    enemyDefs: [
      { type: 'fan', x: 700, y: GROUND_Y - 30, minX: 650, maxX: 760, speed: 1.8 },
      { type: 'keeper', x: 1000, y: GROUND_Y - 30, minX: 950, maxX: 1130, speed: 1.5, shooter: true, shootInterval: 110, shootSpeed: 6, shootTimer: 30 },
      { type: 'fan', x: 1400, y: GROUND_Y - 30, minX: 1300, maxX: 1520, speed: 2.0 },
      { type: 'keeper', x: 1800, y: GROUND_Y - 30, minX: 1700, maxX: 1930, speed: 1.6, shooter: true, shootInterval: 100, shootSpeed: 6, shootTimer: 70 },
      { type: 'wasp', x: 2600, y: 300, minX: 2500, maxX: 2730, speed: 2.0, baseY: 300, amplitude: 70, shooter: true, shootInterval: 130, shootSpeed: 6, shootTimer: 50 },
      { type: 'keeper', x: 2950, y: GROUND_Y - 42, minX: 2880, maxX: 3120, speed: 1.8, hp: 3, shooter: true, shootInterval: 90, shootSpeed: 7, shootTimer: 40, boss: true },
      { type: 'fan', x: 3750, y: GROUND_Y - 30, minX: 3700, maxX: 3900, speed: 2.2 },
    ],
    goal: { x: 4150, y: GROUND_Y - 70, width: 50, height: 70 },
    hints: [
      { x: 60, y: 380, text: 'T = Transformarse' },
      { x: 520, y: 380, text: '¡Cuidado, pelota rodando! ⚽' },
      { x: 2860, y: 380, text: '¡Transformate para el jefe! 🔥' },
    ],
  },
];

// =====================================================
// ---- Estado en tiempo real (se recarga por nivel) ----
// =====================================================
let currentLevelIndex = 0;
let level = null;
let groundSegments = [];
let platforms = [];
let hazards = [];
let chocolates = [];
let enemies = [];
let goal = null;
let worldWidth = 0;
let hints = [];
let rollingHazards = [];
let birds = [];
let flightFrames = 0;
const BIRD_INTERVAL = 150; // ~2.5s de vuelo continuo entre pájaros

const player = {
  x: 50, y: GROUND_Y - 50,
  width: PLAYER_WIDTH, height: STAND_HEIGHT,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1,
  lives: 3,
  invulnerable: 0,
  walkCycle: 0,
  blinkTimer: 120 + Math.random() * 120,
  ridingPlatform: null,
  character: 'valentina',
  transformed: false,
  ducking: false,
  jumpsUsed: 0,
};

let playerProjectiles = [];
let enemyProjectiles = [];
let particles = [];
let lastProjectileTime = -Infinity;

let cameraX = 0;
let gameOver = false;
let levelComplete = false;
let frameCount = 0;

// =====================================================
// ---- Sonido (Web Audio API, sintetizado, sin archivos) ----
// =====================================================
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playBeep({ freq = 440, freqEnd = null, duration = 0.15, type = 'sine', volume = 0.2, delay = 0 }) {
  if (!audioCtx) return;
  const startTime = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

const sfx = {
  jump: () => playBeep({ freq: 300, freqEnd: 620, duration: 0.14, type: 'square', volume: 0.14 }),
  doubleJump: () => playBeep({ freq: 500, freqEnd: 900, duration: 0.13, type: 'square', volume: 0.15 }),
  collect: () => {
    playBeep({ freq: 700, freqEnd: 1000, duration: 0.09, type: 'sine', volume: 0.18 });
    playBeep({ freq: 1100, freqEnd: 1400, duration: 0.09, type: 'sine', volume: 0.14, delay: 0.06 });
  },
  shootHeart: () => {
    playBeep({ freq: 850, freqEnd: 1200, duration: 0.11, type: 'sine', volume: 0.15 });
    playBeep({ freq: 1200, freqEnd: 1500, duration: 0.08, type: 'sine', volume: 0.1, delay: 0.05 });
  },
  shootSword: () => playBeep({ freq: 950, freqEnd: 250, duration: 0.12, type: 'sawtooth', volume: 0.13 }),
  shootSoccer: () => playBeep({ freq: 180, freqEnd: 90, duration: 0.1, type: 'square', volume: 0.15 }),
  shootGold: () => {
    playBeep({ freq: 1000, freqEnd: 1500, duration: 0.12, type: 'triangle', volume: 0.16 });
    playBeep({ freq: 1500, freqEnd: 1900, duration: 0.08, type: 'sine', volume: 0.1, delay: 0.06 });
  },
  flap: () => playBeep({ freq: 420, freqEnd: 600, duration: 0.08, type: 'sine', volume: 0.09 }),
  birdCry: () => {
    playBeep({ freq: 1400, freqEnd: 1800, duration: 0.07, type: 'triangle', volume: 0.13 });
    playBeep({ freq: 1300, freqEnd: 1700, duration: 0.07, type: 'triangle', volume: 0.1, delay: 0.09 });
  },
  transform: () => {
    playBeep({ freq: 200, freqEnd: 1000, duration: 0.35, type: 'sine', volume: 0.18 });
    [1200, 1500, 1800].forEach((f, i) => playBeep({ freq: f, duration: 0.12, type: 'triangle', volume: 0.12, delay: 0.15 + i * 0.08 }));
  },
  enemyShoot: () => playBeep({ freq: 1200, freqEnd: 1600, duration: 0.08, type: 'triangle', volume: 0.12 }),
  enemyHit: () => playBeep({ freq: 500, freqEnd: 350, duration: 0.08, type: 'square', volume: 0.14 }),
  enemyDefeat: () => playBeep({ freq: 220, freqEnd: 40, duration: 0.2, type: 'square', volume: 0.18 }),
  hit: () => playBeep({ freq: 180, freqEnd: 70, duration: 0.3, type: 'sawtooth', volume: 0.22 }),
  victory: () => {
    [523, 659, 784, 1046].forEach((f, i) => playBeep({ freq: f, duration: 0.18, type: 'triangle', volume: 0.2, delay: i * 0.13 }));
  },
  gameOver: () => {
    [400, 320, 240, 160].forEach((f, i) => playBeep({ freq: f, duration: 0.25, type: 'sawtooth', volume: 0.18, delay: i * 0.15 }));
  },
};

// =====================================================
// ---- Carga de nivel ----
// =====================================================
function loadLevel(index) {
  currentLevelIndex = index;
  level = LEVELS[index];
  worldWidth = level.worldWidth;
  groundSegments = level.groundSegments.map(s => ({ ...s }));
  hazards = level.hazards.map(h => ({ ...h }));
  hints = (level.hints || []).map(h => ({ ...h }));
  rollingHazards = (level.rollingHazards || []).map(r => ({ ...r, dir: 1 }));
  platforms = level.platforms.map(p => ({
    ...p,
    baseX: p.x, baseY: p.y,
    deltaX: 0, deltaY: 0,
    state: 'idle', timer: 0,
  }));
  chocolates = level.chocolateSpots.map(([x, y]) => ({ x, y, width: 22, height: 22, collected: false, bob: Math.random() * Math.PI * 2 }));
  enemies = level.enemyDefs.map(e => ({
    ...e,
    width: (e.type === 'superBroccoli' || e.boss) ? 44 : 30,
    height: (e.type === 'superBroccoli' || e.boss) ? 44 : 30,
    dir: 1,
    alive: true,
    hp: e.hp || 1,
    hitFlash: 0,
    phase: Math.random() * Math.PI * 2,
    shooter: e.shooter || false,
    shootInterval: e.shootInterval || 120,
    shootTimer: e.shootTimer !== undefined ? e.shootTimer : (e.shootInterval || 120),
    charging: false,
  }));
  goal = { ...level.goal };

  playerProjectiles = [];
  enemyProjectiles = [];
  particles = [];
  birds = [];
  flightFrames = 0;
  player.lives = 3;
  player.ridingPlatform = null;
  player.ducking = false;
  player.height = STAND_HEIGHT;
  player.jumpsUsed = 0;
  player.transformed = false;
  gameOver = false;
  levelComplete = false;
  resetPlayer(false);
  chocoTotalEl.textContent = chocolates.length;
  updateHUD();
  hideMessage();
  subtitleEl.textContent = `${level.name} — ${level.subtitle}`;
  levelBtns.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.level) === index));
}

function setCharacter(name) {
  if (player.character === name) return;
  player.character = name;
  player.transformed = false;
  if (!ABILITIES[name].canDuck && player.ducking) {
    player.ducking = false;
    player.y -= (STAND_HEIGHT - DUCK_HEIGHT);
    player.height = STAND_HEIGHT;
  }
  updateHUD();
}

// ---- Input ----
const keys = {};
let jumpKeyDownPrev = false;
let charKeyDownPrev = false;
let transformKeyDownPrev = false;
window.addEventListener('keydown', (e) => {
  initAudio();
  keys[e.code] = true;
  if (['ArrowUp', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'KeyX', 'KeyC', 'KeyT'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ---- Controles táctiles (iPad / celular): los botones simulan las teclas ----
document.querySelectorAll('.touchBtn').forEach(btn => {
  const code = btn.dataset.key;
  const press = (e) => { e.preventDefault(); initAudio(); keys[code] = true; };
  const release = (e) => { e.preventDefault(); keys[code] = false; };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
});

restartBtn.addEventListener('click', () => { initAudio(); loadLevel(currentLevelIndex); });
nextLevelBtn.addEventListener('click', () => {
  initAudio();
  if (currentLevelIndex < LEVELS.length - 1) loadLevel(currentLevelIndex + 1);
});
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => { initAudio(); loadLevel(Number(btn.dataset.level)); });
});
switchCharBtn.addEventListener('click', () => {
  initAudio();
  setCharacter(player.character === 'valentina' ? 'bauti' : 'valentina');
});
transformBtn.addEventListener('click', () => {
  initAudio();
  if (gameOver || levelComplete) return;
  player.transformed = !player.transformed;
  sfx.transform();
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2,
    player.character === 'valentina' ? '#c084f5' : '#ffd43b', 14, { spread: 6, power: 4, size: 3 });
});

function aabb(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function resetPlayer(keepInvuln = true) {
  player.x = level.startX;
  player.y = level.startY;
  player.vx = 0;
  player.vy = 0;
  player.ridingPlatform = null;
  player.jumpsUsed = 0;
  if (player.ducking) {
    player.ducking = false;
    player.height = STAND_HEIGHT;
  }
  player.invulnerable = keepInvuln ? 60 : 0;
}

function loseLife() {
  if (player.invulnerable > 0) return;
  loseLifeNow();
}

// Caerse a un pozo siempre debe costar una vida y reubicar al jugador,
// aunque tenga una invulnerabilidad breve activa de un golpe anterior
// (si no, se queda cayendo fuera de pantalla sin reaccionar hasta que
// esa invulnerabilidad expire, lo que parecía "no perder vida").
function fallIntoVoid() {
  loseLifeNow();
}

function loseLifeNow() {
  player.lives -= 1;
  updateHUD();
  sfx.hit();
  if (player.lives <= 0) {
    gameOver = true;
    sfx.gameOver();
    showMessage('💔 ¡Se acabaron las vidas! Presiona R o el botón Reiniciar.', false);
  } else {
    resetPlayer();
  }
}

function updateHUD() {
  chocoCountEl.textContent = chocolates.filter(c => c.collected).length;
  livesEl.textContent = '❤️'.repeat(Math.max(player.lives, 0));
  const def = getCharDef();
  charBadgeEl.textContent = `${def.emoji} ${def.label}`;
}

function showMessage(text, showNext) {
  messageTextEl.textContent = text;
  messageEl.classList.remove('hidden');
  nextLevelBtn.classList.toggle('hidden', !showNext);
}
function hideMessage() {
  messageEl.classList.add('hidden');
}

function getGroundAt(x) {
  for (const seg of groundSegments) {
    if (x >= seg.x && x <= seg.x + seg.width) return GROUND_Y;
  }
  return null;
}

// ---- Partículas ----
function spawnParticles(x, y, color, count, opts = {}) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * (opts.spread || 4),
      vy: -Math.random() * (opts.power || 4) - 1,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: (opts.size || 4) + Math.random() * 2,
      color,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += 0.25;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - cameraX, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- Plataformas dinámicas (móviles / que se caen) ----
function updatePlatforms() {
  for (const p of platforms) {
    p.deltaX = 0;
    p.deltaY = 0;

    if (p.type === 'moving') {
      if (p.axis === 'x') {
        const prev = p.x;
        p.x += p.speed * p.dir;
        if (p.x < p.min) { p.x = p.min; p.dir = 1; }
        if (p.x > p.max) { p.x = p.max; p.dir = -1; }
        p.deltaX = p.x - prev;
      } else {
        const prev = p.y;
        p.y += p.speed * p.dir;
        if (p.y < p.min) { p.y = p.min; p.dir = 1; }
        if (p.y > p.max) { p.y = p.max; p.dir = -1; }
        p.deltaY = p.y - prev;
      }
    } else if (p.type === 'crumble') {
      if (p.state === 'shaking') {
        p.timer--;
        if (p.timer <= 0) { p.state = 'gone'; p.timer = CRUMBLE_GONE_FRAMES; }
      } else if (p.state === 'gone') {
        p.timer--;
        if (p.timer <= 0) { p.state = 'idle'; p.timer = 0; }
      }
    }
  }
}

function isPlatformSolid(p) {
  return p.type !== 'crumble' || p.state !== 'gone';
}

// ---- Pájaros (atacan a Bauti si se queda volando mucho tiempo) ----
function spawnBird() {
  const fromLeft = Math.random() < 0.5;
  const y = player.y + (Math.random() * 60 - 30);
  birds.push({
    x: fromLeft ? cameraX - 40 : cameraX + canvas.width + 40,
    y: Math.max(20, y),
    vx: (fromLeft ? 1 : -1) * (2.5 + Math.random()),
    width: 20, height: 14,
    phase: Math.random() * Math.PI * 2,
  });
  sfx.birdCry();
}

function updateBirds() {
  for (let i = birds.length - 1; i >= 0; i--) {
    const b = birds[i];
    b.x += b.vx;
    if (b.x < cameraX - 200 || b.x > cameraX + canvas.width + 200) {
      birds.splice(i, 1);
      continue;
    }
    if (aabb(player, b)) {
      birds.splice(i, 1);
      loseLife();
      continue;
    }
    let shot = false;
    for (let j = playerProjectiles.length - 1; j >= 0; j--) {
      if (aabb(b, playerProjectiles[j])) {
        spawnParticles(b.x + b.width / 2, b.y + b.height / 2, '#8a6a4a', 8, { spread: 4, power: 4, size: 3 });
        playerProjectiles.splice(j, 1);
        shot = true;
        break;
      }
    }
    if (shot) birds.splice(i, 1);
  }
}

// ---- Pelotas rodantes (obstáculo del Nivel 4) ----
function updateRollingHazards() {
  for (const b of rollingHazards) {
    b.x += b.speed * b.dir;
    if (b.x < b.min) { b.x = b.min; b.dir = 1; }
    if (b.x > b.max) { b.x = b.max; b.dir = -1; }
  }
}

// =====================================================
// ---- Update principal ----
// =====================================================
function update() {
  frameCount++;

  if (gameOver || levelComplete) {
    updateParticles();
    if (keys['KeyR']) loadLevel(currentLevelIndex);
    return;
  }

  if (player.invulnerable > 0) player.invulnerable--;

  const charDef = getCharDef();

  // Cambio de personaje (tecla C, con detección de flanco)
  const charKeyDown = !!keys['KeyC'];
  if (charKeyDown && !charKeyDownPrev) {
    setCharacter(player.character === 'valentina' ? 'bauti' : 'valentina');
  }
  charKeyDownPrev = charKeyDown;

  // Transformación (tecla T, con detección de flanco)
  const transformKeyDown = !!keys['KeyT'];
  if (transformKeyDown && !transformKeyDownPrev) {
    player.transformed = !player.transformed;
    sfx.transform();
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2,
      player.character === 'valentina' ? '#c084f5' : '#ffd43b', 14, { spread: 6, power: 4, size: 3 });
  }
  transformKeyDownPrev = transformKeyDown;

  if (player.transformed && player.character === 'valentina' && frameCount % 12 === 0) {
    spawnParticles(player.x + player.width / 2, player.y + 10, '#e0b3ff', 1, { spread: 2, power: 1, size: 2 });
  }

  // Agacharse (solo Valentina, solo en el suelo)
  if (charDef.canDuck) {
    const wantsDuck = (keys['ArrowDown'] || keys['KeyS']) && player.onGround;
    if (wantsDuck && !player.ducking) {
      player.ducking = true;
      player.y += (STAND_HEIGHT - DUCK_HEIGHT);
      player.height = DUCK_HEIGHT;
    } else if (!wantsDuck && player.ducking) {
      player.ducking = false;
      player.y -= (STAND_HEIGHT - DUCK_HEIGHT);
      player.height = STAND_HEIGHT;
    }
  }

  // Movimiento horizontal
  let targetVx = 0;
  if (!player.ducking) {
    if (keys['ArrowLeft'] || keys['KeyA']) {
      targetVx = -MOVE_SPEED;
      player.facing = -1;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
      targetVx = MOVE_SPEED;
      player.facing = 1;
    }
  }
  if (level.slippery) {
    player.vx += (targetVx - player.vx) * 0.12;
    if (Math.abs(player.vx) < 0.05) player.vx = 0;
  } else {
    player.vx = targetVx;
  }

  if (player.vx !== 0 && player.onGround && !player.ducking) {
    player.walkCycle += 0.25;
  } else if (player.onGround) {
    player.walkCycle = 0;
  }

  player.blinkTimer--;
  if (player.blinkTimer <= 0) player.blinkTimer = -6;
  if (player.blinkTimer < -6) player.blinkTimer = 150 + Math.random() * 150;

  // Salto (con detección de flanco) + doble salto de Bauti
  const jumpKeyDown = !!(keys['ArrowUp'] || keys['Space'] || keys['KeyW']);
  const jumpPressed = jumpKeyDown && !jumpKeyDownPrev;
  if (jumpPressed && !player.ducking) {
    if (player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      player.ridingPlatform = null;
      player.jumpsUsed = 1;
      sfx.jump();
      spawnParticles(player.x + player.width / 2, player.y + player.height, '#e8d4b8', 5, { spread: 3, power: 2, size: 3 });
    } else if (charDef.canDoubleJump && player.jumpsUsed < 2) {
      player.vy = DOUBLE_JUMP_FORCE;
      player.jumpsUsed = 2;
      sfx.doubleJump();
      spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#c9f0ff', 8, { spread: 5, power: 3, size: 3 });
    } else if (charDef.canFly) {
      // Vuelo tipo Flappy Bird: cada toque, ya gastados los saltos, da un aleteo
      player.vy = FLAP_FORCE;
      sfx.flap();
      spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#eaf6ff', 3, { spread: 3, power: 2, size: 2 });
    }
  }
  jumpKeyDownPrev = jumpKeyDown;

  // Disparo (corazón / espada / pelota / balón de oro, según personaje y forma)
  if (keys['KeyX'] && Date.now() - lastProjectileTime > PROJECTILE_COOLDOWN) {
    lastProjectileTime = Date.now();
    const kind = charDef.projectileKind;
    playerProjectiles.push({
      x: player.x + (player.facing === 1 ? player.width : -14),
      y: player.y + player.height / 2 - 6,
      vx: PROJECTILE_SPEED * player.facing,
      width: kind === 'sword' ? 22 : 18,
      height: kind === 'sword' ? 6 : 14,
      dir: player.facing,
      kind,
    });
    if (kind === 'heart') sfx.shootHeart();
    else if (kind === 'sword') sfx.shootSword();
    else if (kind === 'goldball') sfx.shootGold();
    else sfx.shootSoccer();
  }

  // Plataformas dinámicas
  updatePlatforms();
  updateRollingHazards();

  // Física del jugador
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // Si va montada en una plataforma móvil, la acompaña
  if (player.ridingPlatform) {
    const p = player.ridingPlatform;
    const stillOn = isPlatformSolid(p) &&
      player.x + player.width > p.x - 6 && player.x < p.x + p.width + 6;
    if (stillOn) {
      player.x += p.deltaX;
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.ridingPlatform = null;
    }
  }

  player.x = Math.max(0, Math.min(player.x, worldWidth - player.width));

  // Colisión con suelo (segmentos con pozos)
  if (!player.ridingPlatform) player.onGround = false;
  const groundY = getGroundAt(player.x + player.width / 2);
  if (groundY !== null && player.y + player.height >= groundY && player.vy >= 0) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
    player.ridingPlatform = null;
  }

  // Colisión con plataformas (solo desde arriba, y solo si son sólidas)
  for (const p of platforms) {
    if (!isPlatformSolid(p)) continue;
    if (
      player.x + player.width > p.x && player.x < p.x + p.width &&
      player.vy >= 0 &&
      player.y + player.height <= p.y + 12 &&
      player.y + player.height + player.vy >= p.y
    ) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
      if (p.type === 'moving') player.ridingPlatform = p;
      if (p.type === 'crumble' && p.state === 'idle') { p.state = 'shaking'; p.timer = CRUMBLE_SHAKE_FRAMES; }
    }
  }

  if (player.onGround) player.jumpsUsed = 0;

  // Techo: no se puede salir de la pantalla volando (Bauti)
  if (player.y < 4) {
    player.y = 4;
    if (player.vy < 0) player.vy = 0;
  }

  // Caída al vacío
  if (player.y > canvas.height + 100) {
    fallIntoVoid();
  }

  // Pájaros: si Bauti vuela mucho rato, empiezan a pasar y a atacar
  if (charDef.canFly && !player.onGround) {
    flightFrames++;
  } else {
    flightFrames = 0;
  }
  if (flightFrames > 0 && flightFrames % BIRD_INTERVAL === 0) {
    spawnBird();
  }
  updateBirds();

  // Pinches / pozos con espinas
  for (const hz of hazards) {
    if (aabb(player, hz)) loseLife();
  }

  // Pelotas rodantes
  for (const b of rollingHazards) {
    const box = { x: b.x - b.radius, y: b.y - b.radius, width: b.radius * 2, height: b.radius * 2 };
    if (aabb(player, box)) loseLife();
  }

  // Chocolates
  for (const c of chocolates) {
    if (!c.collected && aabb(player, c)) {
      c.collected = true;
      updateHUD();
      sfx.collect();
      spawnParticles(c.x + c.width / 2, c.y + c.height / 2, '#8a5a3b', 8, { spread: 5, power: 4, size: 3 });
    }
  }

  // Proyectiles del jugador: movimiento y colisión con enemigos
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const s = playerProjectiles[i];
    s.x += s.vx;
    if (frameCount % 4 === 0) {
      const trailColors = { heart: '#ff9dc4', sword: '#d9b3ff', soccerball: '#cfd8e0', goldball: '#ffe27a' };
      spawnParticles(s.x + s.width / 2, s.y + s.height / 2, trailColors[s.kind] || '#cccccc', 1, { spread: 1, power: 0.5, size: 2 });
    }
    if (s.x < -50 || s.x > worldWidth + 50) {
      playerProjectiles.splice(i, 1);
      continue;
    }
    let hitEnemy = false;
    for (const en of enemies) {
      if (en.alive && aabb(s, en)) {
        damageEnemy(en);
        hitEnemy = true;
        break;
      }
    }
    if (hitEnemy) { playerProjectiles.splice(i, 1); continue; }
  }

  // Proyectiles enemigos: movimiento, colisión con jugador y con proyectiles del jugador
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = enemyProjectiles[i];
    ep.x += ep.vx;
    if (ep.x < -50 || ep.x > worldWidth + 50) {
      enemyProjectiles.splice(i, 1);
      continue;
    }
    if (aabb(player, ep)) {
      enemyProjectiles.splice(i, 1);
      loseLife();
      continue;
    }
    let cancelled = false;
    for (let j = playerProjectiles.length - 1; j >= 0; j--) {
      if (aabb(ep, playerProjectiles[j])) {
        spawnParticles(ep.x, ep.y, '#cfeeff', 6, { spread: 4, power: 3, size: 2 });
        playerProjectiles.splice(j, 1);
        cancelled = true;
        break;
      }
    }
    if (cancelled) enemyProjectiles.splice(i, 1);
  }

  // Enemigos
  for (const en of enemies) {
    if (!en.alive) continue;
    if (en.hitFlash > 0) en.hitFlash--;

    en.x += en.speed * en.dir;
    if (en.x < en.minX || en.x + en.width > en.maxX) en.dir *= -1;
    if (en.type === 'wasp') {
      en.y = en.baseY + Math.sin(frameCount * 0.05 + en.phase) * en.amplitude;
    }

    if (en.shooter) {
      en.shootTimer--;
      en.charging = en.shootTimer <= 20 && en.shootTimer > 0;
      if (en.shootTimer <= 0) {
        spawnEnemyProjectile(en);
        en.shootTimer = en.shootInterval;
      }
    }

    if (aabb(player, en)) {
      const playerBottom = player.y + player.height;
      const stomping = player.vy > 0 && playerBottom - en.y < 18;
      if (stomping) {
        player.vy = JUMP_FORCE * 0.6;
        damageEnemy(en);
      } else {
        loseLife();
      }
    }
  }

  updateParticles();

  // Meta
  if (aabb(player, goal)) {
    levelComplete = true;
    sfx.victory();
    const hasNext = currentLevelIndex < LEVELS.length - 1;
    const text = hasNext
      ? '🎉 ¡Encontraron a un Capibara amigable! Nivel completado 🪙✨'
      : '🏆 ¡Completaste todos los niveles! Son campeones junto a todos los capibaras 🪙👑';
    showMessage(text, hasNext);
  }

  // Cámara sigue al jugador
  cameraX = Math.max(0, Math.min(player.x - canvas.width / 2, worldWidth - canvas.width));
}

function damageEnemy(en) {
  en.hp -= 1;
  if (en.hp <= 0) {
    en.alive = false;
    sfx.enemyDefeat();
    spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#3f9d3f', 10, { spread: 5, power: 5, size: 4 });
  } else {
    en.hitFlash = 12;
    en.dir *= -1;
    sfx.enemyHit();
  }
}

function spawnEnemyProjectile(en) {
  const dir = en.dir;
  let y, height, width;
  if (en.type === 'wasp') {
    y = en.y + en.height / 2 - 4;
    height = 8; width = 10;
  } else {
    y = GROUND_Y - 45;
    height = 10; width = 14;
  }
  enemyProjectiles.push({
    x: en.x + (dir === 1 ? en.width : -width),
    y, width, height,
    vx: (en.shootSpeed || 6) * dir,
    dir,
  });
  sfx.enemyShoot();
}

// =====================================================
// ---- Texturas (patrones tileables generados en un canvas offscreen) ----
// =====================================================
function makePatternCanvas(w, h, drawFn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  drawFn(c.getContext('2d'), w, h);
  return ctx.createPattern(c, 'repeat');
}

function buildDirtPattern(topColor, bottomColor) {
  return makePatternCanvas(48, 48, (c2, w, h) => {
    const grad = c2.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    c2.fillStyle = grad;
    c2.fillRect(0, 0, w, h);
    c2.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 10; i++) {
      const px = Math.random() * w, py = Math.random() * h, r = 1 + Math.random() * 2;
      c2.beginPath(); c2.arc(px, py, r, 0, Math.PI * 2); c2.fill();
    }
    c2.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 8; i++) {
      const px = Math.random() * w, py = Math.random() * h, r = 1 + Math.random() * 1.5;
      c2.beginPath(); c2.arc(px, py, r, 0, Math.PI * 2); c2.fill();
    }
  });
}

function buildGrassPattern(topColor, bottomColor, bladeColor) {
  return makePatternCanvas(40, 20, (c2, w, h) => {
    const grad = c2.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    c2.fillStyle = grad;
    c2.fillRect(0, 0, w, h);
    c2.strokeStyle = bladeColor;
    c2.lineWidth = 1.3;
    c2.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const bx = (i * 2.5 + Math.random() * 1.4) % w;
      const bh = 4 + Math.random() * 7;
      const lean = (Math.random() - 0.5) * 4;
      c2.beginPath();
      c2.moveTo(bx, h);
      c2.quadraticCurveTo(bx + lean * 0.6, h - bh * 0.6, bx + lean, h - bh);
      c2.stroke();
    }
  });
}

function buildIcePattern(topColor, bottomColor) {
  return makePatternCanvas(50, 24, (c2, w, h) => {
    const grad = c2.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    c2.fillStyle = grad;
    c2.fillRect(0, 0, w, h);
    c2.strokeStyle = 'rgba(255,255,255,0.65)';
    c2.lineWidth = 2;
    c2.beginPath();
    c2.moveTo(4, h); c2.lineTo(16, 2);
    c2.moveTo(30, h); c2.lineTo(42, 4);
    c2.stroke();
    c2.strokeStyle = 'rgba(120,170,190,0.5)';
    c2.lineWidth = 1;
    c2.beginPath();
    c2.moveTo(0, h * 0.5); c2.lineTo(18, h * 0.3); c2.lineTo(28, h * 0.6);
    c2.moveTo(35, h * 0.2); c2.lineTo(48, h * 0.5);
    c2.stroke();
    c2.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) {
      const px = Math.random() * w, py = Math.random() * h * 0.7;
      c2.beginPath(); c2.arc(px, py, 0.8, 0, Math.PI * 2); c2.fill();
    }
  });
}

function buildSkyNoisePattern() {
  return makePatternCanvas(120, 120, (c2, w, h) => {
    c2.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 14; i++) {
      const px = Math.random() * w, py = Math.random() * h, r = 0.6 + Math.random() * 1.4;
      c2.beginPath(); c2.arc(px, py, r, 0, Math.PI * 2); c2.fill();
    }
    c2.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 10; i++) {
      const px = Math.random() * w, py = Math.random() * h, r = 1 + Math.random() * 3;
      c2.beginPath(); c2.arc(px, py, r, 0, Math.PI * 2); c2.fill();
    }
  });
}

function ensureThemePatterns(th) {
  if (th._patterns) return th._patterns;
  const patterns = { dirt: buildDirtPattern(th.groundTop, th.groundBottom), sky: buildSkyNoisePattern() };
  if (th.stripStyle === 'ice') {
    patterns.top = buildIcePattern(th.topStripTop, th.topStripBottom);
  } else if (th.stripStyle === 'pitch') {
    patterns.top = buildGrassPattern(th.topStripTop, th.topStripBottom, 'rgba(255,255,255,0.3)');
  } else if (th.stripStyle !== 'belt') {
    patterns.top = buildGrassPattern(th.topStripTop, th.topStripBottom, th.topStripBottom);
  }
  th._patterns = patterns;
  return patterns;
}

function scrollPattern(pattern) {
  if (pattern && pattern.setTransform && typeof DOMMatrix !== 'undefined') {
    pattern.setTransform(new DOMMatrix().translate(-cameraX, 0));
  }
}

// =====================================================
// ---- Dibujo ----
// =====================================================
function drawBackground() {
  const th = level.theme;
  const patterns = ensureThemePatterns(th);
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(0.6, th.skyMid);
  sky.addColorStop(1, th.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (patterns.sky) {
    ctx.fillStyle = patterns.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const sunX = canvas.width - 120;
  const sunY = 90;
  const glow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 70);
  glow.addColorStop(0, th.glowColor);
  glow.addColorStop(1, 'rgba(255,244,180,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 70, sunY - 70, 140, 140);
  ctx.fillStyle = th.lightColor;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = th.farColor;
  drawParallaxRange(0.08, 220, 60);
  ctx.fillStyle = th.midColor;
  drawParallaxRange(0.18, 260, 40);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 9; i++) {
    const worldX = i * 420;
    const sx = worldX - cameraX * 0.4;
    const wrapped = ((sx % (canvas.width + 400)) + (canvas.width + 400)) % (canvas.width + 400) - 200;
    drawCloud(wrapped, 55 + (i % 3) * 45);
  }
}

function drawParallaxRange(speedFactor, baseY, amplitude) {
  const offset = -cameraX * speedFactor;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  const step = 80;
  for (let x = -step; x <= canvas.width + step; x += step) {
    const worldX = x - offset;
    const y = baseY + Math.sin(worldX * 0.006) * amplitude + amplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 10, 24, 0, Math.PI * 2);
  ctx.arc(x + 46, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  const th = level.theme;
  const patterns = ensureThemePatterns(th);
  scrollPattern(patterns.dirt);
  scrollPattern(patterns.top);

  for (const seg of groundSegments) {
    const sx = seg.x - cameraX;
    if (sx + seg.width < -20 || sx > canvas.width + 20) continue;

    ctx.fillStyle = patterns.dirt || th.groundTop;
    ctx.fillRect(sx, GROUND_Y, seg.width, canvas.height - GROUND_Y);

    if (th.stripStyle === 'belt') {
      ctx.fillStyle = th.topStripTop;
      ctx.fillRect(sx, GROUND_Y, seg.width, 14);
      ctx.fillStyle = th.topStripBottom;
      for (let bx = 0; bx < seg.width; bx += 20) {
        ctx.fillRect(sx + bx, GROUND_Y, 10, 14);
      }
    } else if (th.stripStyle === 'pitch') {
      const stripeW = 50;
      for (let bx = 0; bx < seg.width; bx += stripeW) {
        const isEven = Math.floor((seg.x + bx) / stripeW) % 2 === 0;
        ctx.fillStyle = isEven ? th.topStripTop : th.topStripBottom;
        ctx.fillRect(sx + bx, GROUND_Y, Math.min(stripeW, seg.width - bx), canvas.height - GROUND_Y);
      }
      ctx.fillStyle = patterns.top;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(sx, GROUND_Y, seg.width, 18);
      ctx.globalAlpha = 1;
    } else if (th.stripStyle === 'ice') {
      ctx.fillStyle = patterns.top;
      ctx.fillRect(sx, GROUND_Y, seg.width, 20);
    } else {
      ctx.fillStyle = patterns.top;
      ctx.fillRect(sx, GROUND_Y, seg.width, 18);
      ctx.strokeStyle = th.topStripBottom;
      ctx.lineWidth = 2;
      for (let gx = 6; gx < seg.width; gx += 14) {
        ctx.beginPath();
        ctx.moveTo(sx + gx, GROUND_Y + 6);
        ctx.lineTo(sx + gx - 3, GROUND_Y - 3);
        ctx.moveTo(sx + gx, GROUND_Y + 6);
        ctx.lineTo(sx + gx + 3, GROUND_Y - 3);
        ctx.stroke();
      }
    }
  }
}

function drawHazards() {
  const th = level.theme;
  for (const hz of hazards) {
    const sx = hz.x - cameraX;
    if (sx + hz.width < -20 || sx > canvas.width + 20) continue;
    ctx.fillStyle = th.hazardFill || '#c9c9d4';
    const spikeCount = Math.floor(hz.width / 12);
    for (let i = 0; i < spikeCount; i++) {
      const bx = sx + i * 12;
      ctx.beginPath();
      ctx.moveTo(bx, hz.y + hz.height);
      ctx.lineTo(bx + 6, hz.y);
      ctx.lineTo(bx + 12, hz.y + hz.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = th.hazardStroke || '#8a8a99';
    ctx.lineWidth = 1;
    for (let i = 0; i < spikeCount; i++) {
      const bx = sx + i * 12;
      ctx.beginPath();
      ctx.moveTo(bx, hz.y + hz.height);
      ctx.lineTo(bx + 6, hz.y);
      ctx.lineTo(bx + 12, hz.y + hz.height);
      ctx.stroke();
    }
  }
}

function drawRollingHazards() {
  for (const b of rollingHazards) {
    const sx = b.x - cameraX;
    if (sx < -50 || sx > canvas.width + 50) continue;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, GROUND_Y + 3, b.radius * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, b.y);
    ctx.rotate(frameCount * 0.15 * b.dir);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#222';
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * b.radius * 0.5, Math.sin(ang) * b.radius * 0.5, b.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawPlatforms() {
  const th = level.theme;
  for (const p of platforms) {
    if (p.type === 'crumble' && p.state === 'gone') continue;
    const shake = p.type === 'crumble' && p.state === 'shaking' ? (Math.random() - 0.5) * 3 : 0;
    const sx = p.x - cameraX + shake;
    if (sx + p.width < -20 || sx > canvas.width + 20) continue;

    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(sx + 4, p.y + p.height, p.width - 4, 6);

    const grad = ctx.createLinearGradient(0, p.y, 0, p.y + p.height);
    if (p.type === 'crumble' && p.state === 'shaking') {
      grad.addColorStop(0, '#ff9d9d');
      grad.addColorStop(1, '#c94a4a');
    } else if (p.type === 'moving') {
      grad.addColorStop(0, '#c9f7ff');
      grad.addColorStop(1, '#5ac8dd');
    } else {
      grad.addColorStop(0, th.platformTop);
      grad.addColorStop(1, th.platformBottom);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(sx, p.y, p.width, p.height);
    ctx.strokeStyle = th.platformBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, p.y, p.width, p.height);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < p.width; i += 18) {
      ctx.beginPath();
      ctx.arc(sx + 9 + i, p.y + p.height / 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawChocolates() {
  for (const c of chocolates) {
    if (c.collected) continue;
    const sx = c.x - cameraX;
    if (sx < -30 || sx > canvas.width + 30) continue;
    const bobY = c.y + Math.sin(frameCount * 0.08 + c.bob) * 4;
    const cx = sx + c.width / 2, cy = bobY + c.height / 2;
    const r = c.width / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, c.y + c.height + 14, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // giro tipo moneda de Mario Bros: se achica horizontalmente y muestra el canto
    const spin = Math.sin(frameCount * 0.09 + c.bob);
    const squash = Math.max(Math.abs(spin), 0.12);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(squash, 1);

    if (squash < 0.3) {
      // de canto: se ve como una barrita metálica
      ctx.fillStyle = '#d4a017';
      ctx.fillRect(-r * 0.4, -r, r * 0.8, r * 2);
    } else {
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
      grad.addColorStop(0, '#fff6c9');
      grad.addColorStop(0.6, '#ffd43b');
      grad.addColorStop(1, '#d4a017');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a8790a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(120,80,0,0.75)';
      ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
  }
}

function drawHints() {
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  for (const h of hints) {
    const sx = h.x - cameraX;
    if (sx < -100 || sx > canvas.width + 100) continue;
    const w = ctx.measureText(h.text).width + 16;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = '#d6336c';
    ctx.lineWidth = 1.5;
    roundRect(sx - w / 2, h.y - 22, w, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5a3e2b';
    ctx.fillText(h.text, sx, h.y - 4);
  }
  ctx.textAlign = 'left';
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawEnemies() {
  for (const en of enemies) {
    if (!en.alive) continue;
    const sx = en.x - cameraX;
    if (sx < -50 || sx > canvas.width + 50) continue;
    const cx = sx + en.width / 2;
    const cy = en.y + en.height / 2;
    const flashing = en.hitFlash > 0 && Math.floor(en.hitFlash / 3) % 2 === 0;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, (en.type === 'wasp' ? GROUND_Y : en.y + en.height + 4), en.width / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (en.type === 'wasp') {
      drawWasp(sx, en, cx, cy, flashing);
    } else if (en.type === 'penguin') {
      drawPenguin(sx, en, cx, cy, flashing);
    } else if (en.type === 'fan') {
      drawFan(sx, en, cx, cy, flashing);
    } else if (en.type === 'keeper') {
      drawKeeper(sx, en, cx, cy, flashing);
    } else {
      drawBroccoli(sx, en, cx, cy, flashing, en.type === 'superBroccoli');
    }

    if (en.charging) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(cx, en.y - 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d6336c';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', cx, en.y - 10);
      ctx.textAlign = 'left';
    }
  }
}

function drawBroccoli(sx, en, cx, cy, flashing, isSuper) {
  const grad = ctx.createRadialGradient(cx - 6, cy - 6, 3, cx, cy, en.width / 2 + 4);
  if (flashing) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#cfcfcf');
  } else if (isSuper) {
    grad.addColorStop(0, '#a97ee0');
    grad.addColorStop(1, '#4a2f7d');
  } else {
    grad.addColorStop(0, '#7ee06a');
    grad.addColorStop(1, '#2f7d2f');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, en.width / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isSuper ? 'rgba(60,0,90,0.35)' : 'rgba(0,90,0,0.35)';
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ang) * (en.width * 0.27), cy + Math.sin(ang) * (en.width * 0.27), en.width * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isSuper) {
    ctx.fillStyle = '#ffd43b';
    ctx.beginPath();
    ctx.moveTo(cx - 10, en.y - 2);
    ctx.lineTo(cx - 4, en.y - 12);
    ctx.lineTo(cx, en.y - 2);
    ctx.lineTo(cx + 4, en.y - 12);
    ctx.lineTo(cx + 10, en.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2540';
    ctx.font = '10px sans-serif';
    ctx.fillText('HP ' + en.hp, cx - 12, en.y + en.height + 14);
  }

  ctx.strokeStyle = isSuper ? '#2a1a4a' : '#123d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - en.width * 0.33, cy - en.height * 0.13);
  ctx.lineTo(cx - en.width * 0.1, cy - en.height * 0.03);
  ctx.moveTo(cx + en.width * 0.33, cy - en.height * 0.13);
  ctx.lineTo(cx + en.width * 0.1, cy - en.height * 0.03);
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.fillRect(sx + en.width * 0.2, en.y + en.height * 0.27, en.width * 0.2, en.width * 0.2);
  ctx.fillRect(sx + en.width * 0.6, en.y + en.height * 0.27, en.width * 0.2, en.width * 0.2);
  ctx.fillStyle = 'black';
  ctx.fillRect(sx + en.width * 0.27, en.y + en.height * 0.33, en.width * 0.1, en.width * 0.1);
  ctx.fillRect(sx + en.width * 0.67, en.y + en.height * 0.33, en.width * 0.1, en.width * 0.1);
}

function drawWasp(sx, en, cx, cy, flashing) {
  const wingFlap = Math.sin(frameCount * 0.6) * 8;

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy - 4 + wingFlap * 0.2, 10, 5, 0.4, 0, Math.PI * 2);
  ctx.ellipse(cx + 6, cy - 4 - wingFlap * 0.2, 10, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(sx, en.y, sx, en.y + en.height);
  if (flashing) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#dddddd');
  } else {
    grad.addColorStop(0, '#ffd43b');
    grad.addColorStop(1, '#e8890b');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, en.width / 2, en.height / 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2b1a05';
  ctx.fillRect(sx + en.width * 0.1, cy - 4, en.width * 0.8, 4);
  ctx.fillRect(sx + en.width * 0.35, cy + 2, en.width * 0.3, 4);

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(cx + en.width * 0.3, cy - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + en.width * 0.15, cy - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.moveTo(cx - en.width / 2, cy);
  ctx.lineTo(cx - en.width / 2 - 6, cy);
  ctx.stroke();
}

function drawPenguin(sx, en, cx, cy, flashing) {
  const grad = ctx.createLinearGradient(sx, en.y, sx, en.y + en.height);
  if (flashing) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#dddddd');
  } else {
    grad.addColorStop(0, '#3a3a4a');
    grad.addColorStop(1, '#15151f');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, en.width / 2.4, en.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = flashing ? '#eee' : '#f2f2f2';
  ctx.beginPath();
  ctx.ellipse(cx, cy + en.height * 0.12, en.width / 3.6, en.height / 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5a623';
  ctx.beginPath();
  ctx.moveTo(cx + (en.dir >= 0 ? en.width * 0.28 : -en.width * 0.28), cy - 2);
  ctx.lineTo(cx + (en.dir >= 0 ? en.width * 0.5 : -en.width * 0.5), cy);
  ctx.lineTo(cx + (en.dir >= 0 ? en.width * 0.28 : -en.width * 0.28), cy + 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(cx + en.width * 0.1 * en.dir, cy - en.height * 0.18, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFan(sx, en, cx, cy, flashing) {
  const grad = ctx.createLinearGradient(sx, en.y, sx, en.y + en.height);
  if (flashing) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#dddddd');
  } else {
    grad.addColorStop(0, '#8ecbf2');
    grad.addColorStop(1, '#4a90c2');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, en.width / 2, en.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 4;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 8, cy - en.height / 2 + 3);
    ctx.lineTo(cx + i * 8, cy + en.height / 2 - 3);
    ctx.stroke();
  }

  ctx.strokeStyle = '#1a3a5a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - en.width * 0.33, cy - en.height * 0.13);
  ctx.lineTo(cx - en.width * 0.1, cy - en.height * 0.03);
  ctx.moveTo(cx + en.width * 0.33, cy - en.height * 0.13);
  ctx.lineTo(cx + en.width * 0.1, cy - en.height * 0.03);
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.fillRect(sx + en.width * 0.2, en.y + en.height * 0.27, en.width * 0.2, en.width * 0.2);
  ctx.fillRect(sx + en.width * 0.6, en.y + en.height * 0.27, en.width * 0.2, en.width * 0.2);
  ctx.fillStyle = 'black';
  ctx.fillRect(sx + en.width * 0.27, en.y + en.height * 0.33, en.width * 0.1, en.width * 0.1);
  ctx.fillRect(sx + en.width * 0.67, en.y + en.height * 0.33, en.width * 0.1, en.width * 0.1);
}

function drawKeeper(sx, en, cx, cy, flashing) {
  const bodyGrad = ctx.createLinearGradient(sx, en.y, sx, en.y + en.height);
  if (flashing) {
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(1, '#dddddd');
  } else {
    bodyGrad.addColorStop(0, '#ffe066');
    bodyGrad.addColorStop(1, '#e8a200');
  }
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(sx + en.width * 0.15, en.y + en.height * 0.35, en.width * 0.7, en.height * 0.65);

  ctx.fillStyle = flashing ? '#eee' : '#f2c9a0';
  ctx.beginPath();
  ctx.arc(cx, en.y + en.height * 0.22, en.width * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3fae3f';
  ctx.beginPath();
  ctx.arc(sx + en.width * 0.05, en.y + en.height * 0.6, en.width * 0.16, 0, Math.PI * 2);
  ctx.arc(sx + en.width * 0.95, en.y + en.height * 0.6, en.width * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.fillRect(cx - en.width * 0.1, en.y + en.height * 0.18, en.width * 0.06, en.width * 0.06);
  ctx.fillRect(cx + en.width * 0.04, en.y + en.height * 0.18, en.width * 0.06, en.width * 0.06);

  if (en.boss) {
    ctx.fillStyle = '#3a2540';
    ctx.font = '10px sans-serif';
    ctx.fillText('HP ' + en.hp, cx - 14, en.y + en.height + 14);
  }
}

function drawPlayerProjectiles() {
  for (const s of playerProjectiles) {
    const sx = s.x - cameraX;
    if (s.kind === 'heart') {
      ctx.save();
      ctx.translate(sx + s.width / 2, s.y + s.height / 2);
      ctx.fillStyle = '#ff5d8f';
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-9, -3, -9, -9, 0, -6);
      ctx.bezierCurveTo(9, -9, 9, -3, 0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c2246a';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    } else if (s.kind === 'sword') {
      ctx.save();
      ctx.translate(sx + s.width / 2, s.y + s.height / 2);
      if (s.dir === -1) ctx.scale(-1, 1);
      const grad = ctx.createLinearGradient(-s.width / 2, 0, s.width / 2, 0);
      grad.addColorStop(0, '#f0f0f0');
      grad.addColorStop(0.5, '#c9c9c9');
      grad.addColorStop(1, '#8a8a8a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-s.width / 2, -1);
      ctx.lineTo(s.width / 2 - 6, -3);
      ctx.lineTo(s.width / 2, 0);
      ctx.lineTo(s.width / 2 - 6, 3);
      ctx.lineTo(-s.width / 2, 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a066d6';
      ctx.fillRect(-s.width / 2 - 4, -2.5, 6, 5);
      ctx.restore();
    } else {
      drawBallProjectile(sx, s, s.kind === 'goldball');
    }
  }
}

function drawBallProjectile(sx, s, gold) {
  ctx.save();
  ctx.translate(sx + s.width / 2, s.y + s.height / 2);
  ctx.rotate(frameCount * 0.4 * (s.dir || 1));
  const r = s.width / 2;
  const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, r);
  if (gold) {
    grad.addColorStop(0, '#fff6c9');
    grad.addColorStop(1, '#d4a017');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#cfcfcf');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = gold ? '#8a6a10' : '#333';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const px = Math.cos(ang) * r * 0.5, py = Math.sin(ang) * r * 0.5;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = gold ? 'rgba(138,106,16,0.5)' : 'rgba(0,0,0,0.6)';
  ctx.fill();
  ctx.restore();
}

function drawEnemyProjectiles() {
  for (const ep of enemyProjectiles) {
    const sx = ep.x - cameraX;
    ctx.save();
    ctx.translate(sx + ep.width / 2, ep.y + ep.height / 2);
    ctx.rotate(frameCount * 0.3);
    ctx.fillStyle = '#cdeffa';
    ctx.strokeStyle = '#4a90a4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const r = ep.width / 2;
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const px = Math.cos(ang) * r, py = Math.sin(ang) * r * 0.7;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawBirds() {
  for (const b of birds) {
    const sx = b.x - cameraX;
    const flap = Math.sin(frameCount * 0.5 + b.phase) * 6;
    ctx.save();
    ctx.translate(sx + b.width / 2, b.y + b.height / 2);
    if (b.vx < 0) ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2a20';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, -flap * 0.4);
    ctx.quadraticCurveTo(-4, -6 - flap, 0, 0);
    ctx.quadraticCurveTo(4, -6 + flap, 9, -flap * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#4a3626';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(9, -1.5);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawGoal() {
  const sx = goal.x - cameraX;
  const bob = Math.sin(frameCount * 0.05) * 3;

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(sx + 25, goal.y + 72, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // cuerpo del capibara (sentado, relajado)
  const bodyGrad = ctx.createLinearGradient(sx, goal.y + 28, sx, goal.y + 70);
  bodyGrad.addColorStop(0, '#c9a06a');
  bodyGrad.addColorStop(1, '#8a6a3f');
  ctx.fillStyle = bodyGrad;
  roundRect(sx + 2, goal.y + 28 + bob, 46, 42, 16);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,244,220,0.5)';
  roundRect(sx + 10, goal.y + 48 + bob, 30, 20, 12);
  ctx.fill();

  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(sx + 8, goal.y + 62 + bob, 8, 8);
  ctx.fillRect(sx + 34, goal.y + 62 + bob, 8, 8);

  // cabeza achatada tipo capibara
  const headGrad = ctx.createRadialGradient(sx + 18, goal.y + 12 + bob, 2, sx + 25, goal.y + 16 + bob, 20);
  headGrad.addColorStop(0, '#d9b17f');
  headGrad.addColorStop(1, '#a67f4f');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(sx + 25, goal.y + 16 + bob, 19, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c9a06a';
  ctx.beginPath();
  ctx.ellipse(sx + 25, goal.y + 24 + bob, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8a6a3f';
  ctx.beginPath();
  ctx.arc(sx + 12, goal.y + 3 + bob, 4, 0, Math.PI * 2);
  ctx.arc(sx + 38, goal.y + 3 + bob, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2b1810';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx + 15, goal.y + 13 + bob); ctx.lineTo(sx + 20, goal.y + 13 + bob);
  ctx.moveTo(sx + 30, goal.y + 13 + bob); ctx.lineTo(sx + 35, goal.y + 13 + bob);
  ctx.stroke();

  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.ellipse(sx + 25, goal.y + 25 + bob, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // florcita en la cabeza
  ctx.fillStyle = '#ffe066';
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(sx + 36 + Math.cos(ang) * 4, goal.y - 2 + bob + Math.sin(ang) * 4, 3, 2, ang, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8890b';
  ctx.beginPath();
  ctx.arc(sx + 36, goal.y - 2 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffd43b';
  ctx.font = '18px sans-serif';
  ctx.fillText('⭐', sx + 2, goal.y - 4 + bob);
}

function drawPlayer() {
  if (player.invulnerable > 0 && Math.floor(player.invulnerable / 4) % 2 === 0) return;

  const sx = player.x - cameraX;
  const sy = player.y;
  const charDef = getCharDef();

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  const groundY = getGroundAt(player.x + player.width / 2);
  const shadowY = groundY !== null ? groundY : sy + player.height + 4;
  ctx.ellipse(sx + player.width / 2, shadowY, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (player.ducking) {
    drawPlayerDucking(sx, sy, charDef);
  } else {
    drawPlayerStanding(sx, sy, charDef);
  }
}

function drawPlayerStanding(sx, sy, charDef) {
  const legSwing = player.onGround ? Math.sin(player.walkCycle) * 6 : 0;

  ctx.fillStyle = '#ffe0bd';
  ctx.fillRect(sx + 6, sy + player.height - 10 + Math.max(legSwing, 0) * 0.3, 6, 10);
  ctx.fillRect(sx + player.width - 12, sy + player.height - 10 + Math.max(-legSwing, 0) * 0.3, 6, 10);

  const dressGrad = ctx.createLinearGradient(sx, sy + 20, sx, sy + player.height);
  dressGrad.addColorStop(0, charDef.outfitTop);
  dressGrad.addColorStop(1, charDef.outfitBottom);
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(sx + 6, sy + 20);
  ctx.lineTo(sx + player.width - 6, sy + 20);
  ctx.lineTo(sx + player.width, sy + player.height - 8);
  ctx.lineTo(sx, sy + player.height - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + player.width / 2, sy + 22);
  ctx.lineTo(sx + player.width / 2, sy + player.height - 10);
  ctx.stroke();

  // letra en el pecho
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(charDef.letter, sx + player.width / 2, sy + 34);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#ffe0bd';
  const armSwing = player.onGround ? Math.sin(player.walkCycle + Math.PI) * 4 : 0;
  ctx.fillRect(sx - 2, sy + 24 + armSwing * 0.4, 5, 14);
  ctx.fillRect(sx + player.width - 3, sy + 24 - armSwing * 0.4, 5, 14);

  const skinGrad = ctx.createRadialGradient(sx + player.width / 2 - 4, sy + 8, 2, sx + player.width / 2, sy + 12, 14);
  skinGrad.addColorStop(0, '#ffe9d2');
  skinGrad.addColorStop(1, '#f2c9a0');
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(sx + player.width / 2, sy + 12, 13, 0, Math.PI * 2);
  ctx.fill();

  drawHair(sx, sy, charDef);

  const blinking = player.blinkTimer <= 0;
  ctx.fillStyle = 'black';
  const eyeOffset = player.facing === 1 ? 3 : -3;
  if (blinking) {
    ctx.fillRect(sx + player.width / 2 - 5 + eyeOffset, sy + 11, 3, 1);
    ctx.fillRect(sx + player.width / 2 + 2 + eyeOffset, sy + 11, 3, 1);
  } else {
    ctx.fillRect(sx + player.width / 2 - 5 + eyeOffset, sy + 10, 3, 3);
    ctx.fillRect(sx + player.width / 2 + 2 + eyeOffset, sy + 10, 3, 3);
  }

  ctx.strokeStyle = '#a5583a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(sx + player.width / 2 + eyeOffset * 0.3, sy + 15, 3, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,140,150,0.35)';
  ctx.beginPath();
  ctx.arc(sx + player.width / 2 - 8, sy + 14, 2.5, 0, Math.PI * 2);
  ctx.arc(sx + player.width / 2 + 8, sy + 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHair(sx, sy, charDef) {
  const hairGrad = ctx.createLinearGradient(sx, sy - 4, sx, sy + 16);
  hairGrad.addColorStop(0, charDef.hairTop);
  hairGrad.addColorStop(1, charDef.hairBottom);
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(sx + player.width / 2, sy + 8, 15, Math.PI, 0);
  ctx.fill();

  if (charDef.canDuck) {
    // pelo largo con colitas (Valentina)
    ctx.beginPath();
    ctx.arc(sx + 1, sy + 14, 7, 0, Math.PI * 2);
    ctx.arc(sx + player.width - 1, sy + 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = charDef.hairStroke;
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + player.width / 2 + i * 5, sy - 2);
      ctx.lineTo(sx + player.width / 2 + i * 5, sy + 4);
      ctx.stroke();
    }
  } else {
    // pelo corto (Bauti)
    ctx.beginPath();
    ctx.moveTo(sx + player.width / 2 - 2, sy - 6);
    ctx.lineTo(sx + player.width / 2 + 4, sy - 10);
    ctx.lineTo(sx + player.width / 2 + 6, sy - 3);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlayerDucking(sx, sy, charDef) {
  const w = player.width, h = player.height;

  const dressGrad = ctx.createLinearGradient(sx, sy, sx, sy + h);
  dressGrad.addColorStop(0, charDef.outfitTop);
  dressGrad.addColorStop(1, charDef.outfitBottom);
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.ellipse(sx + w / 2, sy + h / 2 + 4, w / 2 + 3, h / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(charDef.letter, sx + w / 2, sy + h / 2 + 9);
  ctx.textAlign = 'left';

  const skinGrad = ctx.createRadialGradient(sx + w / 2 - 3, sy + 6, 2, sx + w / 2, sy + 9, 11);
  skinGrad.addColorStop(0, '#ffe9d2');
  skinGrad.addColorStop(1, '#f2c9a0');
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(sx + w / 2, sy + 9, 10, 0, Math.PI * 2);
  ctx.fill();

  const hairGrad = ctx.createLinearGradient(sx, sy - 2, sx, sy + 12);
  hairGrad.addColorStop(0, charDef.hairTop);
  hairGrad.addColorStop(1, charDef.hairBottom);
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(sx + w / 2, sy + 5, 11, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = 'black';
  const eyeOffset = player.facing === 1 ? 2 : -2;
  ctx.fillRect(sx + w / 2 - 4 + eyeOffset, sy + 8, 2, 2);
  ctx.fillRect(sx + w / 2 + 2 + eyeOffset, sy + 8, 2, 2);
}

function draw() {
  drawBackground();
  drawGround();
  drawHazards();
  drawRollingHazards();
  drawPlatforms();
  drawChocolates();
  drawHints();
  drawEnemies();
  drawPlayerProjectiles();
  drawEnemyProjectiles();
  drawBirds();
  drawGoal();
  drawParticles();
  if (player.lives > 0) drawPlayer();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadLevel(0);
loop();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
