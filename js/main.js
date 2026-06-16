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
  if (bgMusic.currentTime === 0) bgMusic.currentTime = 4;
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

  // Show hero immediately, set up observer for other sections
  initFadeIn();
  startParallax();
  initSectionSnapScroll();

  setTimeout(() => {
    doorAnim.classList.add('done');
    if (bgMusic.currentTime === 0) bgMusic.currentTime = 4;
    bgMusic.play().then(() => { musicPlaying = true; }).catch(() => {});
  }, 1800);
});

/* ══════════════════════════════════════
   FORCE ONE-SECTION-PER-SCROLL
══════════════════════════════════════ */
function initSectionSnapScroll() {
  const sections = Array.from(document.querySelectorAll('.snap-section'));
  if (!sections.length) return;

  let isAnimating = false;

  function currentIndex() {
    let closest = 0;
    let minDist = Infinity;
    sections.forEach((sec, i) => {
      const dist = Math.abs(sec.getBoundingClientRect().top);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  }

  function goToSection(index) {
    index = Math.max(0, Math.min(sections.length - 1, index));
    isAnimating = true;
    sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isAnimating = false; }, 1000);
  }

  function findScrollableAncestor(el) {
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function innerScrollCanConsume(el, deltaY) {
    const scrollable = findScrollableAncestor(el);
    if (!scrollable) return false;
    if (deltaY > 0) return scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1;
    return scrollable.scrollTop > 0;
  }

  window.addEventListener('wheel', (e) => {
    if (innerScrollCanConsume(e.target, e.deltaY)) return;
    e.preventDefault();
    if (isAnimating) return;
    goToSection(currentIndex() + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  let touchStartY = 0;
  let touchStartTarget = null;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTarget = e.target;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isAnimating) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 40) return;
    if (innerScrollCanConsume(touchStartTarget, diff)) return;
    goToSection(currentIndex() + (diff > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (isAnimating) return;
    if (['ArrowDown','PageDown'].includes(e.key)) { e.preventDefault(); goToSection(currentIndex() + 1); }
    else if (['ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); goToSection(currentIndex() - 1); }
  }, { passive: false });
}

/* ══════════════════════════════════════
   SCROLL FADE-IN (snap-aware)
══════════════════════════════════════ */
function initFadeIn() {
  const sections = document.querySelectorAll('.fade-section');

  // Hero: show instantly with no animation delay
  const hero = document.getElementById('section-hero');
  if (hero) {
    hero.style.transition = 'none';
    hero.classList.add('in-view');
  }

  // All other sections: animate in when they snap into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = '';
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(el => {
    if (el.id !== 'section-hero') observer.observe(el);
  });
}

/* ══════════════════════════════════════
   PARALLAX FLOWERS ON SCROLL
══════════════════════════════════════ */
function startParallax() {
  const flowers = document.querySelectorAll('.parallax-flower');
  let ticking = false;

  // Store base transforms
  flowers.forEach(el => {
    el.dataset.baseTransform = el.style.transform || '';
  });

  function applyParallax() {
    const scrollY = window.scrollY;
    flowers.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      const rect  = el.closest('.snap-section')?.getBoundingClientRect();
      const sectionTop = rect ? rect.top : 0;
      // Parallax relative to section viewport position
      const moveY = sectionTop * speed * -1;
      const base  = el.dataset.baseTransform || '';
      el.style.transform = base + ` translateY(${moveY}px)`;
    });
    ticking = false;
  }

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
   SALAM KAUT — COPY BUTTONS
══════════════════════════════════════ */
function copyText(btn, text) {
  const origHTML = btn.innerHTML;
  const doSuccess = () => {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Disalin!</span>';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('copied'); }, 2000);
  };
  navigator.clipboard.writeText(text).then(doSuccess).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    doSuccess();
  });
}

document.querySelectorAll('.btn-copy, .btn-copy-acc').forEach(btn => {
  btn.addEventListener('click', () => copyText(btn, btn.dataset.copy));
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
   UCAPAN — Supabase + localStorage
══════════════════════════════════════ */
const SB_URL = 'https://nlqfghwfudisdbvihwae.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWZnaHdmdWRpc2Ridmlod2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Mjg4NjEsImV4cCI6MjA5NzIwNDg2MX0.STXKJ9j5beBLQa6B_YNapXDLhuFvXjIARaeDZSZKypE';
const SB_PUB = 'sb_publishable_NOyUH3crdzriXePn3j4gyQ_xQbnB33K';
const LS_KEY = 'ekad_ucapan';

function sbHeaders() {
  return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'x-sb-publishable-key': SB_PUB };
}

function ucapanSave(entry) {
  return fetch(`${SB_URL}/rest/v1/ucapan`, {
    method: 'POST',
    headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
    body: JSON.stringify(entry)
  });
}

function ucapanLoad() {
  return fetch(`${SB_URL}/rest/v1/ucapan?select=*&order=id.asc`, { headers: sbHeaders() })
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : [];
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      return list;
    })
    .catch(() => JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
}

function renderUcapan(list) {
  const el = document.getElementById('ucapan-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = ''; return; }
  el.innerHTML = list.slice().reverse().map(u => `
    <div class="ucapan-item">
      <div class="ucapan-item-head">
        <div class="ucapan-avatar">${escapeHtml(u.nama[0].toUpperCase())}</div>
        <div class="ucapan-body"><strong>${escapeHtml(u.nama)}</strong></div>
      </div>
      <p>${escapeHtml(u.msg)}</p>
      <span class="ucapan-time">${u.tarikh || ''}</span>
    </div>`).join('');
}

// Load ucapan on page load
ucapanLoad().then(renderUcapan);

const toggleUcapanBtn = document.getElementById('toggle-ucapan-form');
if (toggleUcapanBtn) {
  toggleUcapanBtn.addEventListener('click', function () {
    const form = document.getElementById('ucapan-form');
    form.classList.toggle('hidden');
    this.innerHTML = form.classList.contains('hidden') ? '💬 Tinggalkan Ucapan' : '✕ Tutup';
  });
}

const ucapanForm = document.getElementById('ucapan-form');
if (ucapanForm) {
  ucapanForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nama = document.getElementById('ucapan-nama').value.trim();
    const msg  = document.getElementById('ucapan-msg').value.trim();
    if (!nama || !msg) return;

    const submitBtn = document.getElementById('ucapan-submit');
    submitBtn.textContent = 'Menghantar...';
    submitBtn.disabled = true;

    const tarikh = new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric' });
    const entry  = { nama, msg, tarikh };

    ucapanSave(entry).then(() => ucapanLoad()).then(list => {
      renderUcapan(list);
      this.reset();
      this.classList.add('hidden');
      if (toggleUcapanBtn) toggleUcapanBtn.innerHTML = '💬 Tinggalkan Ucapan';
      submitBtn.textContent = 'Hantar 💌';
      submitBtn.disabled = false;
    }).catch(() => {
      submitBtn.textContent = 'Hantar 💌';
      submitBtn.disabled = false;
    });
  });
}

/* ══════════════════════════════════════
   RSVP FORM — Supabase
══════════════════════════════════════ */
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button[type="submit"]');
    const nama     = document.getElementById('rsvp-name').value.trim();
    const bilangan = document.getElementById('rsvp-guests').value;
    const hadir    = document.getElementById('rsvp-status').value;

    submitBtn.textContent = 'Menghantar...';
    submitBtn.disabled = true;

    fetch(`${SB_URL}/rest/v1/rsvp`, {
      method: 'POST',
      headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ nama, bilangan, hadir })
    }).then(() => {
      this.classList.add('hidden');
      document.getElementById('rsvp-success').classList.remove('hidden');
    }).catch(() => {
      submitBtn.textContent = 'Hantar RSVP';
      submitBtn.disabled = false;
      alert('Ralat. Sila cuba lagi.');
    });
  });
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
