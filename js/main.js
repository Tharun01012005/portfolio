/* ===== Navigation ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navLinkItems = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (navbar) {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  if (backToTop) {
    if (window.scrollY > 400) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }

  updateActiveNav();
});

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
}

navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navLinks?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link && scrollY >= top && scrollY < top + height) {
      navLinkItems.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===== Counter Animation ===== */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        let current = 0;
        const step = target / (1500 / 16);
        const update = () => {
          current += step;
          if (current < target) {
            el.textContent = Math.floor(current) + (target >= 10 ? '+' : '');
            requestAnimationFrame(update);
          } else {
            el.textContent = target + (target >= 10 ? '+' : '');
          }
        };
        update();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ===== Scroll Reveal ===== */
function revealOnScroll() {
  const elements = document.querySelectorAll('.stat-card, .project-card, .exp-card, .skills-category, .contact-card, .timeline-item, .tool-card, .dt-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 40);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

/* ===== Contact Form — Formspree ===== */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('form-submit-btn') || contactForm.querySelector('button[type="submit"]');
    const status = document.getElementById('form-status');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Sending...';
    if (status) { status.textContent = ''; status.className = 'form-status'; }

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.reset();
        if (status) {
          status.textContent = 'Message sent successfully. I\'ll get back to you soon.';
          status.className = 'form-status success';
        }
        btn.innerHTML = '<i class="fas fa-check"></i> Sent';
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      if (status) {
        status.textContent = err.message || 'Failed to send. Please email me directly.';
        status.className = 'form-status error';
      }
      btn.innerHTML = original;
    }
    setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 3000);
  });
}

/* ===== Typing / Role rotation ===== */
function typingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;
  const texts = ['UI/UX Designer', 'Product Designer', 'Frontend Developer'];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = texts[textIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }
    let speed = isDeleting ? 45 : 90;
    if (!isDeleting && charIndex === current.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      speed = 350;
    }
    setTimeout(type, speed);
  }
  type();
}

/* ===== Text-only Intro — session aware ===== */
(function () {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const skipBtn = document.getElementById('intro-skip');
  const hello = document.getElementById('intro-hello');
  const role = document.getElementById('intro-role');
  let finished = false;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = sessionStorage.getItem('portfolioIntroSeen') === '1';
  const hasHash = window.location.hash && window.location.hash.length > 1;

  function endIntro(scrollToHash) {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('portfolioIntroSeen', '1');
    overlay.classList.add('hidden');
    document.body.classList.remove('intro-active');
    setTimeout(() => {
      overlay.remove();
      if (scrollToHash && window.location.hash) {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 700);
  }

  // Skip intro if already seen this session OR navigating to a section hash
  if (seen || hasHash) {
    overlay.classList.add('hidden');
    document.body.classList.remove('intro-active');
    overlay.remove();
    if (hasHash) {
      requestAnimationFrame(() => {
        const el = document.querySelector(window.location.hash);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
      });
    }
    return;
  }

  if (skipBtn) skipBtn.addEventListener('click', () => endIntro(false));

  if (reduced) {
    hello?.classList.add('visible');
    role?.classList.add('visible');
    setTimeout(() => endIntro(false), 500);
    return;
  }

  setTimeout(() => hello?.classList.add('visible'), 200);
  setTimeout(() => role?.classList.add('visible'), 900);
  setTimeout(() => endIntro(false), 2600);
})();

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  revealOnScroll();
  typingEffect();
});

/* ===== Tools Marquee — drag + auto-scroll ===== */
(function () {
  const wrap = document.querySelector('.tools-marquee-wrap');
  const track = document.getElementById('tools-marquee');
  if (!wrap || !track) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    track.style.animation = 'none';
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let currentTranslate = 0;
  let resumeTimer = null;
  let halfWidth = 0;

  function measure() {
    // half because content is duplicated
    halfWidth = track.scrollWidth / 2;
  }

  function getTranslateX() {
    const style = window.getComputedStyle(track);
    const matrix = style.transform;
    if (matrix && matrix !== 'none') {
      const values = matrix.match(/matrix.*\((.+)\)/);
      if (values) {
        const parts = values[1].split(',');
        return parseFloat(parts[4]) || 0;
      }
    }
    return currentTranslate;
  }

  function setTranslate(x) {
    // Keep within one loop cycle for seamless resume
    if (halfWidth > 0) {
      x = x % halfWidth;
      if (x > 0) x -= halfWidth;
    }
    currentTranslate = x;
    track.style.transform = `translateX(${x}px)`;
  }

  function pauseAuto() {
    track.classList.add('paused');
    wrap.classList.add('is-dragging');
  }

  function resumeAuto() {
    wrap.classList.remove('is-dragging');
    // Apply current position as animation delay equivalent by setting transform
    // and restarting animation from that offset via negative delay approximation
    track.classList.remove('paused');
    // Seamless: keep transform and let CSS animation continue — 
    // better approach: temporarily disable animation, set position, re-enable
    const x = currentTranslate;
    track.style.animation = 'none';
    track.style.transform = `translateX(${x}px)`;
    // Force reflow
    void track.offsetWidth;
    // Duration 40s for full -50% distance (halfWidth)
    // offset as negative delay
    if (halfWidth > 0) {
      const progress = Math.abs(x) / halfWidth;
      const delay = -(progress * 40);
      track.style.animation = '';
      track.style.animationDelay = `${delay}s`;
      track.style.transform = '';
    } else {
      track.style.animation = '';
      track.style.transform = '';
    }
    track.classList.remove('paused');
  }

  function onDown(clientX) {
    measure();
    isDragging = true;
    startX = clientX;
    // Read live transform from animation
    startTranslate = getTranslateX();
    currentTranslate = startTranslate;
    pauseAuto();
    track.style.animation = 'none';
    track.style.transform = `translateX(${startTranslate}px)`;
    if (resumeTimer) clearTimeout(resumeTimer);
  }

  function onMove(clientX, e) {
    if (!isDragging) return;
    const dx = clientX - startX;
    setTranslate(startTranslate + dx);
    if (e && e.cancelable) e.preventDefault();
  }

  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    resumeTimer = setTimeout(resumeAuto, 400);
  }

  wrap.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    onDown(e.clientX);
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e));
  window.addEventListener('mouseup', onUp);

  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    onDown(e.touches[0].clientX);
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    onMove(e.touches[0].clientX, e);
  }, { passive: false });

  wrap.addEventListener('touchend', onUp);
  wrap.addEventListener('touchcancel', onUp);

  // Prevent click-through after drag
  wrap.addEventListener('dragstart', (e) => e.preventDefault());

  measure();
  window.addEventListener('resize', measure);
})();
