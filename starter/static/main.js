// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_KEY = 'sudoku-leaderboard';
const THEME_KEY = 'sudoku-theme';
let puzzle = [];
let solution = [];
let timerSeconds = 0;
let timerIntervalId = null;
let timerRunning = false;

function getLeaderboardEntries() {
  const stored = window.localStorage.getItem(LEADERBOARD_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function saveLeaderboardEntries(entries) {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function renderLeaderboard() {
  const entries = getLeaderboardEntries()
    .slice()
    .sort((first, second) => first.seconds - second.seconds)
    .slice(0, 10);

  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';

  if (entries.length === 0) {
    const item = document.createElement('li');
    item.innerText = 'No completed games yet.';
    list.appendChild(item);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    const timeText = formatTime(entry.seconds);
    item.innerText = `${index + 1}. ${entry.name} — ${timeText} — ${entry.difficulty} — ${entry.completedAt}`;
    list.appendChild(item);
  });
}

function addLeaderboardEntry(name, seconds, difficulty) {
  const entries = getLeaderboardEntries();
  const completedAt = new Date().toLocaleString();
  entries.push({name, seconds, difficulty, completedAt});
  const sortedEntries = entries
    .sort((first, second) => first.seconds - second.seconds)
    .slice(0, 10);
  saveLeaderboardEntries(sortedEntries);
  renderLeaderboard();
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  document.getElementById('timer').innerText = formatTime(timerSeconds);
}

function startTimer() {
  if (timerRunning) {
    return;
  }

  timerRunning = true;
  timerIntervalId = window.setInterval(() => {
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (!timerRunning) {
    return;
  }

  timerRunning = false;
  if (timerIntervalId !== null) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function resetTimer() {
  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

function setMessage(text, tone = 'neutral') {
  const msg = document.getElementById('message');
  msg.className = `message ${tone}`.trim();
  msg.innerText = text;
}

function getStoredTheme() {
  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === 'dark') {
    return 'dark';
  }
  return 'light';
}

function applyTheme(themeName) {
  const isDark = themeName === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    toggleButton.setAttribute('aria-pressed', String(isDark));
  }

  window.localStorage.setItem(THEME_KEY, themeName);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function showCompletionMessage() {
  const difficulty = document.getElementById('difficulty').value;
  const message = `Congratulations! You solved the ${difficulty} puzzle in ${formatTime(timerSeconds)}.`;
  setMessage(message, 'success');
}

function promptForLeaderboardEntry() {
  const name = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (!name) {
    return;
  }

  const difficulty = document.getElementById('difficulty').value;
  addLeaderboardEntry(name.trim(), timerSeconds, difficulty);
}

function clearCellState() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = 'sudoku-cell';
  }
}

function validateBoard() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  clearCellState();

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled || inp.value === '') continue;

    const row = parseInt(inp.dataset.row, 10);
    const col = parseInt(inp.dataset.col, 10);
    const value = parseInt(inp.value, 10);
    if (value !== solution[row][col]) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
}

function applyCheckResults(incorrectIndexes) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;

    if (incorrectIndexes.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    } else {
      inp.className = 'sudoku-cell';
    }
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        validateBoard();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  solution = [];
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className = 'sudoku-cell prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  setMessage('', 'neutral');
  solution = data.solution || [];
  resetTimer();
  startTimer();
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  applyCheckResults(incorrect);
  if (incorrect.size === 0) {
    stopTimer();
    showCompletionMessage();
    promptForLeaderboardEntry();
  } else {
    setMessage('Some cells are incorrect.', 'error');
  }
}

async function giveHint() {
  const res = await fetch('/hint');
  const data = await res.json();
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }

  const idx = data.row * SIZE + data.col;
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const inp = inputs[idx];
  inp.value = data.value;
  inp.disabled = true;
  inp.className = 'sudoku-cell prefilled';
  setMessage('Hint revealed.', 'success');
}

// Wire buttons
window.addEventListener('load', () => {
  updateTimerDisplay();
  renderLeaderboard();
  applyTheme(getStoredTheme());
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', giveHint);
  // initialize
  newGame();
});