let timerLabel = document.createElement('div');
timerLabel.style.position = 'fixed';
timerLabel.style.top = '10px';
timerLabel.style.left = '10px'; // Ensure initial placement
timerLabel.style.backgroundColor = 'black';
timerLabel.style.color = 'white';
timerLabel.style.padding = '5px';
timerLabel.style.zIndex = '10000';
timerLabel.style.pointerEvents = 'auto';
timerLabel.style.cursor = 'move'; // Indicates draggable

document.body.appendChild(timerLabel);

chrome.runtime.sendMessage({ type: "startTimer" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "updateTime") {
    const seconds = Math.floor(message.time / 1000);
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerLabel.textContent = `${hours}:${minutes}:${secs}`;
  }
});

window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ type: "stopTimer" });
});

let isDragging = false;
let offsetX, offsetY;

function onMouseMove(event) {
  if (isDragging) {
    const newX = event.pageX - offsetX;
    const newY = event.pageY - offsetY;
    timerLabel.style.left = `${newX}px`;
    timerLabel.style.top = `${newY}px`;
  }
}

function onMouseDown(event) {
  isDragging = true;
  const rect = timerLabel.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
  document.addEventListener('mousemove', onMouseMove);
}

function onMouseUp() {
  isDragging = false;
  document.removeEventListener('mousemove', onMouseMove);
}

timerLabel.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);

let lastBlinkTime = Date.now();
let lastSoundTime10Min = Date.now(); // Track last 10-minute sound
let isBlinking = false;

function playSound() {
  const audio = new Audio(chrome.runtime.getURL('Click.mp3'));
  audio.play();
}

function blinkTimer() {
  if (isBlinking) {
    timerLabel.style.backgroundColor = 'black';
    isBlinking = false;
  } else {
    timerLabel.style.backgroundColor = 'green';
    isBlinking = true;
  }
}

function updateTimer() {
  const now = Date.now();
  const elapsedTime = now - timers[tabId].startTime;
  const elapsedMinutes = Math.floor(elapsedTime / 60000);

  // Play sound every 45 minutes
  if (elapsedMinutes % 45 === 0 && elapsedTime !== 0) {
    playSound();
  }

  // Play sound every 10 minutes
  if (now - lastSoundTime10Min >= 600000) { // 600000 ms = 10 minutes
    playSound();
    lastSoundTime10Min = now;
  }

  // Blink timer every minute
  if (now - lastBlinkTime >= 60000) {
    blinkTimer();
    lastBlinkTime = now;
  }
}

setInterval(updateTimer, 1000);
