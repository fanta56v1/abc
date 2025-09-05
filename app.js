// ABC Fun — simple letter learning mini‑game

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const DATA = {
  A: { word: "Apple 🍎" },
  B: { word: "Ball 🏀" },
  C: { word: "Cat 🐱" },
  D: { word: "Dog 🐶" },
  E: { word: "Egg 🥚" },
  F: { word: "Fish 🐟" },
  G: { word: "Grapes 🍇" },
  H: { word: "Hat 🎩" },
  I: { word: "Ice cream 🍦" },
  J: { word: "Juice 🧃" },
  K: { word: "Kite 🪁" },
  L: { word: "Lion 🦁" },
  M: { word: "Monkey 🐒" },
  N: { word: "Nose 👃" },
  O: { word: "Orange 🍊" },
  P: { word: "Panda 🐼" },
  Q: { word: "Queen 👑" },
  R: { word: "Rabbit 🐰" },
  S: { word: "Sun ☀️" },
  T: { word: "Tiger 🐯" },
  U: { word: "Umbrella ☔" },
  V: { word: "Violin 🎻" },
  W: { word: "Whale 🐳" },
  X: { word: "Xylophone 🎵" },
  Y: { word: "Yarn 🧶" },
  Z: { word: "Zebra 🦓" },
};

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// Prefer recorded human voice if available
const AudioBank = {
  map: new Map(),
  ext: 'mp3',
  init() {
    // Pick a supported format (mp3 is widely supported)
    const test = document.createElement('audio');
    const candidates = [
      { ext: 'mp3', type: 'audio/mpeg' },
      { ext: 'm4a', type: 'audio/mp4' },
      { ext: 'ogg', type: 'audio/ogg' },
      { ext: 'wav', type: 'audio/wav' },
    ];
    for (const c of candidates) {
      if (test.canPlayType && test.canPlayType(c.type)) { this.ext = c.ext; break; }
    }
    // Pre-create audio elements
    LETTERS.forEach(L => {
      const a = new Audio(`audio/${L}.${this.ext}`);
      a.preload = 'auto';
      // Store immediately; play() will still guard readiness
      this.map.set(L, a);
    });
  },
  stop() {
    this.map.forEach((a) => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
  },
  async play(L) {
    const a = this.map.get(L);
    if (!a) return false;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        await p; return true;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};

function speak(text, { rate = 1, pitch = 1 } = {}) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find(v => /en/i.test(v.lang)) || voices[0];
    if (en) u.voice = en;
    u.rate = rate; u.pitch = pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {
    // ignore if TTS is unavailable
  }
}

async function sayLetter(L, { rate = 1, pitch = 1 } = {}) {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  AudioBank.stop();
  const ok = await AudioBank.play(L);
  if (!ok) speak(L, { rate, pitch });
}

function beep(type = 'ok') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = type === 'ok' ? 880 : 220;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.start(); o.stop(ctx.currentTime + 0.16);
  } catch (e) {}
}

function confetti(count = 20) {
  const root = document.getElementById('celebrate');
  const symbols = ['🎉','⭐','✨','🎈','🌈','💖'];
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'confetti';
    span.textContent = symbols[rnd(symbols.length)];
    span.style.left = rnd(100) + 'vw';
    span.style.top = '-40px';
    span.style.transform = `translateY(0) rotate(${rnd(360)}deg)`;
    span.style.animationDelay = (i * 10) + 'ms';
    root.appendChild(span);
    setTimeout(() => span.remove(), 1200);
  }
}

// ---------- Tabs ----------
function setupTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $$('.tab').forEach(s => s.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });
}

// ---------- Learn Mode ----------
let learnIndex = 0;
function renderLearn() {
  const L = LETTERS[learnIndex];
  const el = document.getElementById('learn-letter');
  const wd = document.getElementById('learn-word');
  el.textContent = `${L} ${L.toLowerCase()}`;
  wd.textContent = DATA[L].word;
}

function setupLearn() {
  renderLearn();
  $('#btn-prev').addEventListener('click', () => {
    learnIndex = (learnIndex - 1 + LETTERS.length) % LETTERS.length;
    renderLearn();
    autoSpeakCurrent();
  });
  $('#btn-next').addEventListener('click', () => {
    learnIndex = (learnIndex + 1) % LETTERS.length;
    renderLearn();
    autoSpeakCurrent();
  });
  $('#btn-random').addEventListener('click', () => {
    learnIndex = rnd(LETTERS.length);
    renderLearn();
    autoSpeakCurrent();
  });
  $('#btn-speak').addEventListener('click', autoSpeakCurrent);
}

function autoSpeakCurrent() {
  const slow = $('#slow-speech').checked;
  const L = LETTERS[learnIndex];
  // Prefer recorded voice for letter; fallback to TTS
  sayLetter(L, { rate: slow ? 0.8 : 1 });
  // Keep TTS for example word
  setTimeout(() => speak(DATA[L].word.replace(/[^A-Za-z\s]/g, ''), { rate: slow ? 0.9 : 1 }), 700);
}

// ---------- Quiz Mode ----------
let target = 'A';
let streak = parseInt(localStorage.getItem('abc_streak') || '0', 10);
let best = parseInt(localStorage.getItem('abc_best') || '0', 10);

function updateStreakUI() {
  $('#streak').textContent = String(streak);
  $('#best').textContent = String(best);
}

function newRound() {
  target = LETTERS[rnd(LETTERS.length)];
  $('#quiz-prompt').textContent = '请点字母';
  const opts = new Set([target]);
  while (opts.size < 4) opts.add(LETTERS[rnd(LETTERS.length)]);
  const list = shuffle([...opts]);
  const box = $('#quiz-choices');
  box.innerHTML = '';
  list.forEach(L => {
    const b = document.createElement('button');
    b.className = 'choice'; b.textContent = L;
    b.addEventListener('click', () => pick(L, b));
    box.appendChild(b);
  });
  setTimeout(() => { sayLetter(target, { rate: 0.9, pitch: 1.1 }); }, 250);
}

function pick(letter, btn) {
  if (letter === target) {
    btn.classList.add('correct');
    beep('ok');
    streak += 1; best = Math.max(best, streak);
    localStorage.setItem('abc_streak', String(streak));
    localStorage.setItem('abc_best', String(best));
    updateStreakUI();
    confetti(18);
    setTimeout(newRound, 550);
  } else {
    btn.classList.add('wrong');
    beep('no');
    streak = 0;
    localStorage.setItem('abc_streak', '0');
    updateStreakUI();
  }
}

function setupQuiz() {
  updateStreakUI();
  $('#quiz-speak').addEventListener('click', () => { sayLetter(target, { rate: 0.9, pitch: 1.05 }); });
  window.addEventListener('keydown', (e) => {
    const k = (e.key || '').toUpperCase();
    if (k >= 'A' && k <= 'Z' && $('#tab-quiz').classList.contains('active')) {
      const btn = [...document.querySelectorAll('.choice')].find(b => b.textContent === k);
      if (btn) pick(k, btn);
    }
  });
  newRound();
}

// ---------- Match Mode (drag + drop) ----------
let pairsDone = 0;

function setupMatch() {
  $('#match-reset').addEventListener('click', initMatch);
  initMatch();
}

function initMatch() {
  pairsDone = 0; $('#match-done').textContent = '0';
  const upper = $('#match-uppercase');
  const lower = $('#match-lowercase');
  upper.innerHTML = ''; lower.innerHTML = '';
  const pick = shuffle([...LETTERS]).slice(0, 6);
  const uppers = pick.map(L => ({ L, type: 'upper' }));
  const lowers = pick.map(L => ({ L, type: 'lower' }));
  shuffle(uppers).forEach(({ L }) => upper.appendChild(makeDraggable(L)));
  shuffle(lowers).forEach(({ L }) => lower.appendChild(makeDrop(L)));
}

function makeDraggable(L) {
  const el = document.createElement('div');
  el.className = 'tile'; el.textContent = L; el.draggable = true;
  el.addEventListener('dragstart', (e) => { el.classList.add('dragging'); e.dataTransfer.setData('text/plain', L); });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  return el;
}

function makeDrop(L) {
  const el = document.createElement('div');
  el.className = 'tile drop'; el.textContent = L.toLowerCase();
  el.addEventListener('dragover', (e) => { e.preventDefault(); });
  el.addEventListener('dragenter', (e) => {
    e.preventDefault();
    const dragged = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || '';
    el.classList.toggle('ok', dragged === L);
    el.classList.toggle('no', dragged && dragged !== L);
  });
  el.addEventListener('dragleave', () => { el.classList.remove('ok','no'); });
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('ok','no');
    const dragged = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || '';
    if (dragged === L) {
      const src = [...document.querySelectorAll('#match-uppercase .tile')].find(t => t.textContent === dragged);
      if (src) src.classList.add('done');
      el.classList.add('done');
      el.textContent = `${L} = ${L.toLowerCase()}`;
      el.style.pointerEvents = 'none';
      pairsDone += 1; $('#match-done').textContent = String(pairsDone);
      beep('ok');
      if (pairsDone === 6) confetti(24);
    } else {
      beep('no');
    }
  });
  return el;
}

// ---------- Init ----------
window.addEventListener('load', () => {
  // Safari sometimes needs a small timeout before voices load
  window.speechSynthesis && window.speechSynthesis.getVoices();
  AudioBank.init();
  setupTabs();
  setupLearn();
  setupQuiz();
  setupMatch();
  setupListenGrid();
});

// ---------- Listen and Click Grid Game ----------
let listenCase = 'upper'; // 'upper' | 'lower'
let listenTarget = 'A';
let listenCorrect = 0;

function setupListenGrid() {
  const upperBtn = $('#case-upper');
  const lowerBtn = $('#case-lower');
  upperBtn?.addEventListener('click', () => { setCase('upper'); });
  lowerBtn?.addEventListener('click', () => { setCase('lower'); });
  $('#listen-start')?.addEventListener('click', () => { startListenGame(); });
  $('#listen-repeat')?.addEventListener('click', () => { sayLetter(listenTarget, { rate: 0.95 }); });
  buildListenGrid();
}

function setCase(mode) {
  listenCase = mode;
  $('#case-upper')?.classList.toggle('active', mode === 'upper');
  $('#case-lower')?.classList.toggle('active', mode === 'lower');
  buildListenGrid();
}

function buildListenGrid() {
  const box = document.getElementById('grid-letters');
  if (!box) return;
  box.innerHTML = '';
  LETTERS.forEach(L => {
    const t = document.createElement('div');
    t.className = 'tile az';
    t.textContent = listenCase === 'upper' ? L : L.toLowerCase();
    t.dataset.letter = L;
    t.addEventListener('click', () => onListenClick(L, t));
    box.appendChild(t);
  });
  listenCorrect = 0; $('#listen-correct').textContent = '0';
  $('#listen-prompt').textContent = '请听声音，点对应字母';
}

function startListenGame() {
  // reset visuals
  $$('#grid-letters .tile.az').forEach(t => { t.classList.remove('done','wrong'); });
  listenCorrect = 0; $('#listen-correct').textContent = '0';
  newListenRound();
}

function newListenRound() {
  listenTarget = LETTERS[rnd(LETTERS.length)];
  $('#listen-prompt').textContent = '请听声音，点对应字母';
  setTimeout(() => sayLetter(listenTarget, { rate: 0.95, pitch: 1.05 }), 100);
}

function onListenClick(L, el) {
  if (L === listenTarget) {
    el.classList.add('done');
    beep('ok');
    listenCorrect += 1;
    $('#listen-correct').textContent = String(listenCorrect);
    confetti(8);
    setTimeout(newListenRound, 500);
  } else {
    el.classList.add('wrong');
    beep('no');
    setTimeout(() => el.classList.remove('wrong'), 250);
  }
}
