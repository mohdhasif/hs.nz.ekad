/* ══════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 700);
  }, 2200);
});

/* ══════════════════════════════════════
   MUSIC TOGGLE
══════════════════════════════════════ */
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
let musicPlaying = false;

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicBtn.classList.add('muted');
    musicPlaying = false;
  } else {
    bgMusic.play().catch(() => {});
    musicBtn.classList.remove('muted');
    musicPlaying = true;
  }
});

/* ══════════════════════════════════════
   DOOR OPEN — BUKA KAD
══════════════════════════════════════ */
document.getElementById('buka-kad-btn').addEventListener('click', () => {
  const coverScreen = document.getElementById('cover-screen');
  const doorAnim = document.getElementById('door-animation');
  const mainContent = document.getElementById('main-content');

  // Hide cover, show door animation
  coverScreen.style.opacity = '0';
  coverScreen.style.pointerEvents = 'none';
  setTimeout(() => coverScreen.remove(), 600);

  // Trigger door opening
  doorAnim.classList.add('opening');

  // Reveal main content behind
  mainContent.classList.remove('hidden');
  mainContent.classList.add('visible');

  // After animation completes, remove door overlay
  setTimeout(() => {
    doorAnim.classList.add('done');
    // Start music
    bgMusic.play().then(() => { musicPlaying = true; }).catch(() => {});
    // Trigger first section fade-in
    checkFadeIn();
  }, 1800);
});

/* ══════════════════════════════════════
   SCROLL FADE-IN
══════════════════════════════════════ */
function checkFadeIn() {
  const sections = document.querySelectorAll('.fade-section');
  sections.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      el.classList.add('in-view');
    }
  });
}

window.addEventListener('scroll', checkFadeIn, { passive: true });
checkFadeIn();

/* ══════════════════════════════════════
   FALLING PETALS
══════════════════════════════════════ */
function createPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = 8 + Math.random() * 10;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 10;
    const hue = Math.random() > 0.5 ? '#e8b4bb' : '#c9728a';

    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 1.4}px;
      background: radial-gradient(ellipse, ${hue}, #9e3a52);
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;
    canvas.appendChild(petal);
  }
}

createPetals();

/* ══════════════════════════════════════
   COUNTDOWN TIMER
══════════════════════════════════════ */
const weddingDate = new Date('2025-10-25T10:00:00+08:00');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '00';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent = '00';
    document.getElementById('cd-secs').textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ══════════════════════════════════════
   ADD TO CALENDAR
══════════════════════════════════════ */
document.getElementById('add-calendar-btn').addEventListener('click', () => {
  const start = '20251025T020000Z'; // 10:00 AM MYT = 02:00 UTC
  const end   = '20251025T140000Z'; // 10:00 PM MYT = 14:00 UTC
  const title = encodeURIComponent('Majlis Perkahwinan Aisyah & Marwan');
  const loc   = encodeURIComponent('Masjid Al-Hidayah, Shah Alam, Selangor');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  window.open(url, '_blank');
});

/* ══════════════════════════════════════
   GALLERY SLIDER
══════════════════════════════════════ */
(function () {
  const track = document.getElementById('gallery-track');
  const dotsWrap = document.getElementById('gallery-dots');
  const slides = track ? track.querySelectorAll('.gallery-slide') : [];
  let current = 0;

  if (!track || slides.length === 0) return;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  document.getElementById('gallery-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('gallery-next').addEventListener('click', () => goTo(current + 1));

  // Auto-slide every 4s
  setInterval(() => goTo(current + 1), 4000);

  // Touch/swipe support
  let startX = 0;
  const slider = document.getElementById('gallery-slider');
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });
})();

/* ══════════════════════════════════════
   UCAPAN FORM
══════════════════════════════════════ */
document.getElementById('toggle-ucapan-form').addEventListener('click', function () {
  const form = document.getElementById('ucapan-form');
  form.classList.toggle('hidden');
  this.textContent = form.classList.contains('hidden') ? 'Tinggalkan Ucapan' : 'Tutup';
});

document.getElementById('ucapan-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const nama = document.getElementById('ucapan-nama').value.trim();
  const msg  = document.getElementById('ucapan-msg').value.trim();
  if (!nama || !msg) return;

  const list = document.getElementById('ucapan-list');
  const item = document.createElement('div');
  item.className = 'ucapan-item';
  item.innerHTML = `<strong>${escapeHtml(nama)}</strong><p>${escapeHtml(msg)}</p>`;
  item.style.animation = 'fadeInUp 0.4s ease';
  list.prepend(item);

  this.reset();
  this.classList.add('hidden');
  document.getElementById('toggle-ucapan-form').textContent = 'Tinggalkan Ucapan';
});

/* ══════════════════════════════════════
   RSVP FORM
══════════════════════════════════════ */
document.getElementById('rsvp-form').addEventListener('submit', function (e) {
  e.preventDefault();
  this.classList.add('hidden');
  document.getElementById('rsvp-success').classList.remove('hidden');
});

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
