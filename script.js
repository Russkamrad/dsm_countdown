const EVENT_START = new Date("2026-06-05T12:00:00+02:00");
const EVENT_END = new Date("2026-06-07T18:00:00+02:00");
const PROGRESS_START = new Date("2025-11-17T00:00:00+01:00");
const COMMENT_MAX_LENGTH = 300;

let currentLang = localStorage.getItem("dsmLang") || "de";

const pollOptions = [
  "🍺 Ящик пива / Bierkasten / Beer crate",
  "🌭 Пачку сосисек / Würstchen / Sausages",
  "🧻 Туалетную бумагу / Klopapier / Toilet paper",
  "💰 Много денег / Viel Geld / Lots of money",
  "📡 Металлоискатель / Metalldetektor / Metal detector",
  "🪣 Ведро для находок / Fund-Eimer / Finds bucket",
  "🦟 Спрей от комаров / Mückenspray / Mosquito spray",
  "🧲 Пинпоинтер, который опять потеряется / Pinpointer, der wieder verschwindet",
  "🥾 Запасные носки после грязи / Ersatzsocken nach dem Schlamm",
  "☕ Термос с кофе для легендарного старта / Kaffee-Thermoskanne"
];

const musicTracks = [
  { title: "Bunker Folk Demo", file: "assets/music/bunker-folk-demo.mp3" },
  { title: "Copper Road Demo", file: "assets/music/copper-road-demo.mp3" },
  { title: "Detector Night Demo", file: "assets/music/detector-night-demo.mp3" }
];

const russkamradVideos = [
  { title: "DOBRAPOISK", channel: "Russkamrad", videoId: "" },
  { title: "Alex Stahlhelm", channel: "Russkamrad Friends", videoId: "" },
  { title: "DenDS", channel: "Russkamrad Friends", videoId: "" },
  { title: "3dRK Printing Russkamrad", channel: "3D models for detectorists", videoId: "" }
];

const communityVideos = [
  { title: "Treasur Erdinger", channel: "German detectorist video", videoId: "" },
  { title: "Great Treasure Hunter", channel: "DSM / metal detecting", videoId: "" },
  { title: "Der Sondengänger", channel: "German detectorist video", videoId: "" },
  { title: "The Mole’s Nico Sondengänger", channel: "German detectorist video", videoId: "" }
];

const photoArchive = [
  { title: "DSM Archiv 1", image: "assets/photos/photo-1.jpg" },
  { title: "DSM Archiv 2", image: "assets/photos/photo-2.jpg" },
  { title: "DSM Archiv 3", image: "assets/photos/photo-3.jpg" },
  { title: "DSM Archiv 4", image: "assets/photos/photo-4.jpg" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function t(key) {
  return translations[currentLang]?.[key] || translations.de[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.innerHTML = t(key);
  });
  $$('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  $$('.lang-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === currentLang));
  renderComments();
  renderMusicList();
}

function updateCountdown() {
  const now = new Date();
  let diff = EVENT_START - now;

  if (now >= EVENT_START && now <= EVENT_END) {
    $('#days').textContent = '00';
    $('#hours').textContent = '00';
    $('#minutes').textContent = '00';
    $('#seconds').textContent = '00';
    return;
  }

  if (diff < 0) diff = 0;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  $('#days').textContent = String(days).padStart(2, '0');
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#minutes').textContent = String(minutes).padStart(2, '0');
  $('#seconds').textContent = String(secs).padStart(2, '0');
}

function updateProgress() {
  const now = new Date();
  const total = EVENT_START - PROGRESS_START;
  const passed = Math.min(Math.max(now - PROGRESS_START, 0), total);
  const percent = total > 0 ? Math.round((passed / total) * 100) : 100;
  $('#progressFill').style.width = `${percent}%`;
  $('#progressPercent').textContent = `${percent}%`;
}

function setupModes() {
  $$('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      $('#countdownPanel').classList.toggle('hidden', btn.dataset.mode !== 'countdown');
      $('#progressPanel').classList.toggle('hidden', btn.dataset.mode !== 'progress');
    });
  });
}

function loadPoll() {
  return JSON.parse(localStorage.getItem('dsmPollVotes') || '{}');
}

function savePoll(votes) {
  localStorage.setItem('dsmPollVotes', JSON.stringify(votes));
}

function renderPoll() {
  const votes = loadPoll();
  const selected = localStorage.getItem('dsmPollSelected');
  const total = Object.values(votes).reduce((sum, value) => sum + value, 0);
  const root = $('#pollOptions');
  root.innerHTML = '';

  pollOptions.forEach((label, index) => {
    const count = votes[index] || 0;
    const percent = total ? Math.round((count / total) * 100) : 0;
    const button = document.createElement('button');
    button.className = 'poll-option';
    button.type = 'button';
    button.innerHTML = `
      <span>${label}</span>
      <b>${percent}%</b>
      <i style="width:${percent}%"></i>
    `;
    button.disabled = selected !== null;
    button.classList.toggle('selected', selected === String(index));
    button.addEventListener('click', () => {
      const current = loadPoll();
      current[index] = (current[index] || 0) + 1;
      savePoll(current);
      localStorage.setItem('dsmPollSelected', String(index));
      renderPoll();
    });
    root.appendChild(button);
  });
}

function setupPoll() {
  $('#resetPollBtn').addEventListener('click', () => {
    const selected = localStorage.getItem('dsmPollSelected');
    if (selected !== null) {
      const votes = loadPoll();
      votes[selected] = Math.max((votes[selected] || 1) - 1, 0);
      savePoll(votes);
    }
    localStorage.removeItem('dsmPollSelected');
    renderPoll();
  });
}

function renderVideoCard(video) {
  const card = document.createElement('article');
  card.className = 'video-card';
  if (video.videoId) {
    card.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${video.videoId}" title="${video.title}" allowfullscreen loading="lazy"></iframe>
      <div><h4>${video.title}</h4><p>${video.channel}</p></div>
    `;
  } else {
    card.innerHTML = `
      <div class="video-placeholder">▶</div>
      <div><h4>${video.title}</h4><p>${video.channel}<br><small>YouTube videoId in script.js eintragen</small></p></div>
    `;
  }
  return card;
}

function renderVideos() {
  $('#russkamradVideos').append(...russkamradVideos.map(renderVideoCard));
  $('#communityVideos').append(...communityVideos.map(renderVideoCard));
}

function renderPhotoArchive() {
  const root = $('#photoGrid');
  photoArchive.forEach((photo) => {
    const item = document.createElement('article');
    item.className = 'photo-item';
    item.innerHTML = `
      <div class="photo-placeholder"><span>📷</span></div>
      <h4>${photo.title}</h4>
      <p>${photo.image}</p>
    `;
    root.appendChild(item);
  });
}

function loadComments() {
  return JSON.parse(localStorage.getItem('dsmComments') || '[]');
}

function saveComments(comments) {
  localStorage.setItem('dsmComments', JSON.stringify(comments.slice(0, 30)));
}

function renderComments() {
  const list = $('#commentsList');
  const comments = loadComments();
  list.innerHTML = '';
  if (!comments.length) {
    list.innerHTML = `<p class="muted">${t('noComments')}</p>`;
    return;
  }
  comments.forEach((comment) => {
    const item = document.createElement('article');
    item.className = 'comment-item';
    item.innerHTML = `<strong>${escapeHtml(comment.name)}</strong><p>${escapeHtml(comment.text)}</p>`;
    list.appendChild(item);
  });
}

function setupComments() {
  const text = $('#commentText');
  text.addEventListener('input', () => {
    $('#commentCounter').textContent = `${text.value.length}/${COMMENT_MAX_LENGTH}`;
  });
  $('#commentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('#commentName').value.trim();
    const message = $('#commentText').value.trim();
    if (!name || !message) return;
    const comments = loadComments();
    comments.unshift({ name, text: message, date: new Date().toISOString() });
    saveComments(comments);
    $('#commentForm').reset();
    $('#commentCounter').textContent = `0/${COMMENT_MAX_LENGTH}`;
    renderComments();
  });
}

function setupRating() {
  const ratings = JSON.parse(localStorage.getItem('dsmRatings') || '[]');
  const render = () => {
    const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    $('#ratingResult').textContent = `${average.toFixed(1)} / 5 (${ratings.length})`;
  };
  $$('#ratingStars button').forEach((btn) => {
    btn.addEventListener('click', () => {
      ratings.push(Number(btn.dataset.rating));
      localStorage.setItem('dsmRatings', JSON.stringify(ratings));
      render();
    });
  });
  render();
}

function renderMusicList() {
  const root = $('#musicList');
  root.innerHTML = '';
  musicTracks.forEach((track) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>🎧 ${track.title}</span><b>${t('play')}</b>`;
    button.addEventListener('click', () => {
      $('#audioPlayer').src = track.file;
      $('#audioPlayer').play().catch(() => {});
    });
    root.appendChild(button);
  });
}

function setupMusic() {
  $('#musicOpenBtn').addEventListener('click', () => $('#musicDialog').showModal());
  $('#musicCloseBtn').addEventListener('click', () => $('#musicDialog').close());
}

function setupLanguage() {
  $('#langToggle').addEventListener('click', () => $('#languageMenu').classList.toggle('open'));
  $$('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem('dsmLang', currentLang);
      $('#languageMenu').classList.remove('open');
      applyTranslations();
    });
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[char]));
}

function init() {
  setupLanguage();
  setupModes();
  setupPoll();
  setupComments();
  setupRating();
  setupMusic();
  renderPoll();
  renderVideos();
  renderPhotoArchive();
  applyTranslations();
  updateCountdown();
  updateProgress();
  setInterval(() => {
    updateCountdown();
    updateProgress();
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
