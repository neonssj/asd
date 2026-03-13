// ── HERO CANVAS PARTICLES ──
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });

  const COLORS = ['rgba(232,25,44,', 'rgba(0,200,255,', 'rgba(255,255,255,'];

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function init() {
    particles = [];
    lines = [];
    const count = Math.floor(W * H / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
        r: rand(1, 2.5),
        color: COLORS[Math.floor(rand(0, COLORS.length))],
        alpha: rand(0.2, 0.7),
      });
    }
    // Diagonal energy lines
    for (let i = 0; i < 6; i++) {
      lines.push({
        x: rand(0, W), y: rand(0, H),
        angle: rand(-0.5, 0.5),
        len: rand(80, 220),
        speed: rand(0.4, 1.2),
        color: Math.random() > 0.5 ? 'rgba(232,25,44,' : 'rgba(0,200,255,',
        alpha: rand(0.05, 0.18),
        w: rand(0.5, 1.5),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.04 * (1 - dist/120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw energy lines
    lines.forEach(l => {
      l.x += Math.cos(l.angle) * l.speed;
      l.y += Math.sin(l.angle) * l.speed;
      if (l.x > W + l.len || l.x < -l.len) l.x = rand(0, W);
      if (l.y > H + l.len || l.y < -l.len) l.y = rand(0, H);
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + Math.cos(l.angle) * l.len, l.y + Math.sin(l.angle) * l.len);
      const grad = ctx.createLinearGradient(l.x, l.y, l.x + Math.cos(l.angle)*l.len, l.y + Math.sin(l.angle)*l.len);
      grad.addColorStop(0, l.color + '0)');
      grad.addColorStop(0.5, l.color + l.alpha + ')');
      grad.addColorStop(1, l.color + '0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = l.w;
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  init();
  draw();
})();

// Twitch live detection via allorigins proxy (bypasses CORS)
const TWITCH_USER = 'neonnvlr';
let _timerInterval = null;

function startStreamTimer(startDate) {
  stopStreamTimer();
  _timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startDate) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    const fmt = h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
    const el = document.getElementById('liveTimer');
    if (el) el.textContent = fmt;
  }, 1000);
}

function stopStreamTimer() {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

async function checkLive() {
  try {
    const apiUrl = `https://twitchtracker.com/api/streams/${TWITCH_USER}`;
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
    const data = await res.json();
    const parsed = JSON.parse(data.contents);
    const banner = document.getElementById('liveBanner');

    if (parsed && parsed.status === 1) {
      document.getElementById('streamTitle').textContent = parsed.title || 'Jugando Valorant';
      document.getElementById('viewerCount').textContent = (parsed.viewers || 0).toLocaleString() + ' viewers';
      if (parsed.started_at && !window._streamStart) {
        window._streamStart = new Date(parsed.started_at * 1000);
        startStreamTimer(window._streamStart);
      }
      banner.style.display = 'block';
      document.querySelector('nav').style.top = banner.offsetHeight + 'px';
      // Update nav status to LIVE
      document.getElementById('statusDot').style.background = '#FF0000';
      document.getElementById('statusDot').style.boxShadow = '0 0 8px rgba(255,0,0,0.7)';
      document.getElementById('statusDot').style.animation = 'livepulse 1.5s ease infinite';
      document.getElementById('statusText').style.color = '#FF4040';
      document.getElementById('statusText').textContent = 'EN VIVO';
      document.getElementById('statusIcon').style.fill = '#9146FF';
      document.getElementById('statusHandle').style.color = '#9146FF';
      document.getElementById('streamStatus').style.borderColor = 'rgba(255,0,0,0.25)';
      document.getElementById('streamStatus').style.background = 'linear-gradient(90deg,rgba(255,0,0,0.07),rgba(145,70,255,0.05))';
      document.getElementById('streamStatus').style.cursor = 'pointer';
      document.getElementById('streamStatus').onclick = function(){ window.open('https://twitch.tv/neonnvlr','_blank'); };
    } else {
      banner.style.display = 'none';
      document.querySelector('nav').style.top = '0';
      // Update nav status to OFFLINE
      document.getElementById('statusDot').style.background = '#3A4050';
      document.getElementById('statusDot').style.boxShadow = 'none';
      document.getElementById('statusDot').style.animation = 'none';
      document.getElementById('statusText').style.color = '#4A5060';
      document.getElementById('statusText').textContent = 'OFFLINE';
      document.getElementById('statusIcon').style.fill = '#3A4050';
      document.getElementById('statusHandle').style.color = '#2A3040';
      document.getElementById('streamStatus').style.borderColor = 'rgba(255,255,255,0.07)';
      document.getElementById('streamStatus').style.background = 'linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))';
      document.getElementById('streamStatus').style.cursor = 'default';
      document.getElementById('streamStatus').onclick = null;
      window._streamStart = null;
      stopStreamTimer();
    }
  } catch(e) {
    console.log('Twitch check failed:', e);
  }
}

checkLive();
setInterval(checkLive, 60000);
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

// Copy Wooting profile
function copyWooting() {
  navigator.clipboard.writeText('5f7421c3c6b92a676cf30052bf8a479106f3').then(() => {
    const toast = document.getElementById('toast');
    toast.textContent = '✓ Perfil de Wooting copiado';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.textContent = '✓ Copiado al portapapeles';
    }, 2500);
  });
}

// Copy crosshair
function copyCrosshair() {
  const code = document.getElementById('crosshairCode').textContent.trim();
  navigator.clipboard.writeText(code).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  });
}