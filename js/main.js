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
const musicBtn  = document.getElementById('music-btn');
const bgMusic   = document.getElementById('bg-music');
let musicPlaying = false;

function playMusic() {
  bgMusic.play().catch(() => {});
  musicPlaying = true;
  musicBtn.classList.remove('muted');
}

function pauseMusic() {
  bgMusic.pause();
  musicPlaying = false;
  musicBtn.classList.add('muted');
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) { pauseMusic(); } else { playMusic(); }
});

/* ══════════════════════════════════════
   DOOR OPEN — BUKA KAD
══════════════════════════════════════ */
document.getElementById('buka-kad-btn').addEventListener('click', () => {
  const coverScreen = document.getElementById('cover-screen');
  const doorAnim    = document.getElementById('door-animation');
  const mainContent = document.getElementById('main-content');

  coverScreen.style.opacity = '0';
  coverScreen.style.pointerEvents = 'none';
  setTimeout(() => coverScreen.remove(), 600);

  doorAnim.classList.add('opening');
  mainContent.classList.remove('hidden');
  mainContent.classList.add('visible');

  setTimeout(() => {
    doorAnim.classList.add('done');
    bgMusic.play().then(() => { musicPlaying = true; }).catch(() => {});
    checkFadeIn();
    startParallax();
  }, 1800);
});

/* ══════════════════════════════════════
   SCROLL FADE-IN
══════════════════════════════════════ */
function checkFadeIn() {
  document.querySelectorAll('.fade-section').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
      el.classList.add('in-view');
    }
  });
}
window.addEventListener('scroll', checkFadeIn, { passive: true });
checkFadeIn();

/* ══════════════════════════════════════
   PARALLAX FLOWERS ON SCROLL
══════════════════════════════════════ */
function startParallax() {
  const flowers = document.querySelectorAll('.parallax-flower');
  let ticking = false;

  function applyParallax() {
    const scrollY = window.scrollY;
    flowers.forEach(el => {
      const speed  = parseFloat(el.dataset.speed) || 0.2;
      const rect   = el.closest('section, footer')?.getBoundingClientRect();
      const sectionOffset = rect ? (rect.top + scrollY) : 0;
      const relY   = scrollY - sectionOffset;
      const moveY  = relY * speed;

      // Preserve existing transform (scaleX, scaleY, rotate etc.)
      const base = el.dataset.baseTransform || '';
      el.style.transform = base + ` translateY(${moveY}px)`;
    });
    ticking = false;
  }

  // Store base transforms before we override them
  flowers.forEach(el => {
    const computed = window.getComputedStyle(el).transform;
    // Read inline style transform as base (set by CSS classes)
    el.dataset.baseTransform = el.style.transform || '';
  });

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });

  applyParallax();
}

/* ══════════════════════════════════════
   FALLING PETALS
══════════════════════════════════════ */
(function createPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const colors = ['#e8b4bb', '#c9728a', '#d4a0a8', '#f0c8d0', '#b85070'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size  = 8 + Math.random() * 12;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${size}px; height:${size*1.4}px;
      background:radial-gradient(ellipse,${color},#9e3a52);
      animation-duration:${6+Math.random()*8}s;
      animation-delay:-${Math.random()*12}s;
    `;
    canvas.appendChild(p);
  }
})();

/* ══════════════════════════════════════
   COUNTDOWN — 04 Oktober 2026
══════════════════════════════════════ */
const weddingDate = new Date('2026-10-04T10:00:00+08:00');

function updateCountdown() {
  const diff = weddingDate - new Date();
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }
  document.getElementById('cd-days').textContent  = String(Math.floor(diff/864e5)).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(Math.floor((diff%864e5)/36e5)).padStart(2,'0');
  document.getElementById('cd-mins').textContent  = String(Math.floor((diff%36e5)/6e4)).padStart(2,'0');
  document.getElementById('cd-secs').textContent  = String(Math.floor((diff%6e4)/1e3)).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ══════════════════════════════════════
   ADD TO CALENDAR
══════════════════════════════════════ */
document.getElementById('add-calendar-btn').addEventListener('click', () => {
  const start = '20261004T020000Z';
  const end   = '20261004T140000Z';
  const title = encodeURIComponent('Majlis Perkahwinan Nabila & Hasif');
  const loc   = encodeURIComponent('Kampung Baru, Kuala Lumpur');
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`, '_blank');
});

/* ══════════════════════════════════════
   SALAM KAUT — COPY BUTTON
══════════════════════════════════════ */
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ Disalin!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      btn.textContent = '✓ Disalin!';
      setTimeout(() => btn.textContent = btn.dataset.origText || 'Salin', 2000);
    });
  });
});

/* ══════════════════════════════════════
   GALLERY SLIDER
══════════════════════════════════════ */
(function () {
  const track    = document.getElementById('gallery-track');
  const dotsWrap = document.getElementById('gallery-dots');
  if (!track) return;
  const slides = track.querySelectorAll('.gallery-slide');
  let current = 0;

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
  setInterval(() => goTo(current + 1), 4000);

  let startX = 0;
  const slider = document.getElementById('gallery-slider');
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
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
  item.style.animation = 'fadeInUp 0.4s ease';
  item.innerHTML = `<strong>${escapeHtml(nama)}</strong><p>${escapeHtml(msg)}</p>`;
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
