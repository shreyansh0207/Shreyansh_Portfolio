// ---------- Theme toggle ----------
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
});

// ---------- Nav scroll + progress ----------
const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });

// ---------- Mobile menu ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('open');
  navLinks.classList.remove('open');
}));

// ---------- Scroll reveal ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ---------- Active nav link ----------
const linkMap = {};
document.querySelectorAll('.nav-link').forEach(l => { linkMap[l.getAttribute('href').slice(1)] = l; });
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const link = linkMap[entry.target.id];
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.4, rootMargin: '-40% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

// ---------- Counters ----------
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const start = performance.now();
    const duration = 1500;
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    })(start);
    counterObs.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(c => counterObs.observe(c));

// ---------- Project filter ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  projectCards.forEach(card => {
    const show = f === 'all' || card.dataset.cat === f;
    card.classList.toggle('is-hidden', !show);
    if (show) { card.classList.remove('visible'); void card.offsetWidth; card.classList.add('visible'); }
  });
}));

// ---------- 3D tilt ----------
document.querySelectorAll('.card3d').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
    card.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

// ---------- Contact form ----------
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = document.getElementById('formNote');
  const name = document.getElementById('cfName').value.trim();
  const email = document.getElementById('cfEmail').value.trim();
  const msg = document.getElementById('cfMsg').value.trim();
  note.textContent = 'Sending…';
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message: msg })
    });
    if (!res.ok) throw new Error('bad response');
    note.textContent = 'Message saved! I\'ll get back to you soon.';
    showToast('Thanks ' + name + '! Your message was delivered.');
    e.target.reset();
  } catch (err) {
    note.textContent = 'Could not reach server — opening mail client instead.';
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:shuklashreyansh0207@gmail.com?subject=${subject}&body=${body}`;
  }
});
