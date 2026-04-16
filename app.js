// ── API configuration ──────────────────────────────────────────────────────
// Change this constant to point at your own server later without touching
// anything else in the file.
const API_BASE = 'https://api.adviceslip.com';

// ── Clock widget ───────────────────────────────────────────────────────────
// Runs as soon as the page loads; no network call needed.
function startClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  function tick() {
    const now = new Date();

    // toLocaleTimeString gives "3:45:07 PM" style on most devices
    timeEl.textContent = now.toLocaleTimeString();

    // toLocaleDateString gives "Wednesday, April 16, 2026" style
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });
  }

  tick(); // run immediately so there's no blank flash on load
  setInterval(tick, 1000); // then update every second
}

// ── Advice widget ──────────────────────────────────────────────────────────
// Fetches a random piece of advice from the public API.
// Uses network-first (handled by the service worker for offline graceful
// degradation); here we just show the result or the real error message.
async function fetchAdvice() {
  const resultEl = document.getElementById('advice-result');
  const btn      = document.getElementById('advice-btn');

  // Disable the button while the request is in flight
  btn.disabled = true;
  resultEl.textContent = 'Fetching…';

  try {
    // The API returns: { "slip": { "id": 1, "advice": "..." } }
    const response = await fetch(`${API_BASE}/advice`, {
      // Prevent the browser from serving a stale cached response for this
      // particular request — we always want fresh advice
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    resultEl.textContent = `"${data.slip.advice}"`;
  } catch (err) {
    // Show the real error so it's easier to debug
    resultEl.textContent = `Error: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

// ── Notepad widget ─────────────────────────────────────────────────────────
// Saves text to localStorage so it survives page reloads.
const NOTE_KEY = 'pwa-dashboard-note';

function saveNote() {
  const textarea  = document.getElementById('note-input');
  const statusEl  = document.getElementById('note-status');

  localStorage.setItem(NOTE_KEY, textarea.value);

  // Brief confirmation message that auto-clears after 2 seconds
  statusEl.textContent = 'Saved!';
  setTimeout(() => { statusEl.textContent = ''; }, 2000);
}

function loadNote() {
  const textarea = document.getElementById('note-input');
  const saved    = localStorage.getItem(NOTE_KEY);

  // Only set a value if something was previously saved
  if (saved !== null) {
    textarea.value = saved;
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────
// DOMContentLoaded fires once the HTML is parsed (before images/fonts load),
// which is the right time to wire up all interactive elements.
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  loadNote();

  // Attach button handlers
  document.getElementById('advice-btn').addEventListener('click', fetchAdvice);
  document.getElementById('note-save-btn').addEventListener('click', saveNote);
});
