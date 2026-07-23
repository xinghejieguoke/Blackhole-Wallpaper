// 黑洞动效（canvas）
// 核心思路：中心黑洞（径向渐变），吸积盘（旋转的发光圆环），大量粒子沿对数螺线/极坐标旋转并向内坠落。
// 支持缩放（window devicePixelRatio）、鼠标拖拽影响引力偏移。

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false });

let DPR = Math.max(1, window.devicePixelRatio || 1);

function resize() {
  DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.ceil(innerWidth * DPR);
  canvas.height = Math.ceil(innerHeight * DPR);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
addEventListener('resize', resize);
resize();

let mouse = { x: innerWidth/2, y: innerHeight/2, down: false };
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mousedown', () => mouse.down = true);
addEventListener('mouseup', () => mouse.down = false);

// 参数
let PARTICLE_COUNT = 800;
let BLACKHOLE_RADIUS = Math.min(innerWidth, innerHeight) * 0.06;
let MAX_RADIUS = Math.hypot(innerWidth, innerHeight);
const particles = [];
function rand(min, max){ return Math.random() * (max - min) + min; }

function initParticles() {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = rand(BLACKHOLE_RADIUS * 1.2, Math.min(innerWidth, innerHeight) * 0.9);
    const theta = rand(0, Math.PI * 2);
    particles.push({
      r,
      theta,
      speed: rand(0.2, 1.2) * 0.02,
      angularSpeed: rand(-0.002, 0.002),
      size: rand(0.6, 2.2),
      hue: rand(20, 50),
      alpha: rand(0.6, 1)
    });
  }
}
initParticles();

let accretion = { angle: 0, speed: 0.0025 };
let lastFrame = performance.now();
let fpsLimit = 60; // 可改为 30 节能

function pt(r, theta, cx, cy) {
  return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
}

function drawBlackHole(cx, cy, baseRadius) {
  const g = ctx.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 3);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.65, 'rgba(0,0,0,1)');
  g.addColorStop(0.8, 'rgba(8,8,10,0.6)');
  g.addColorStop(1, 'rgba(14,14,18,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAccretionDisk(cx, cy, radius) {
  const ring = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 3.2);
  ring.addColorStop(0, 'rgba(255,200,100,0.9)');
  ring.addColorStop(0.25, 'rgba(255,120,60,0.65)');
  ring.addColorStop(0.45, 'rgba(180,80,40,0.35)');
  ring.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius * 3, radius * 1.1, accretion.angle, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,${200 - i * 30},${120 - i * 20},${0.06 + i * 0.02})`;
    ctx.lineWidth = 6 + i * 2;
    ctx.ellipse(cx, cy, radius * (2.2 - i * 0.2), radius * (0.9 - i * 0.06), accretion.angle + i * 0.15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function step(now) {
  const dt = now - lastFrame;
  if (dt < 1000 / fpsLimit) {
    requestAnimationFrame(step);
    return;
  }
  lastFrame = now;

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#000010');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

  const cx = canvas.width / DPR / 2;
  const cy = canvas.height / DPR / 2;

  const mx = (mouse.x - cx) * 0.02;
  const my = (mouse.y - cy) * 0.02;
  const gravX = cx + mx;
  const gravY = cy + my;

  accretion.angle += accretion.speed * (mouse.down ? 3 : 1);

  drawAccretionDisk(gravX, gravY, Math.min(innerWidth, innerHeight) * 0.14);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let p of particles) {
    p.theta += p.angularSpeed + accretion.speed * 0.02;
    p.r -= p.speed * (mouse.down ? 1.8 : 1);
    if (p.r <= BLACKHOLE_RADIUS * 1.08 || p.r > MAX_RADIUS) {
      p.r = rand(BLACKHOLE_RADIUS * 1.6, Math.min(innerWidth, innerHeight) * 0.9);
      p.theta = rand(0, Math.PI * 2);
      p.speed = rand(0.2, 1.2) * 0.02;
      p.size = rand(0.6, 2.2);
      p.hue = rand(20, 55);
      p.alpha = rand(0.5, 1);
    }
    const pos = pt(p.r, p.theta, gravX, gravY);
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, Math.max(6, p.size * 6));
    gradient.addColorStop(0, `hsla(${p.hue},100%,60%,${p.alpha})`);
    gradient.addColorStop(0.6, `hsla(${p.hue},90%,45%,${p.alpha * 0.35})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.arc(pos.x, pos.y, p.size * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawBlackHole(gravX, gravY, Math.min(innerWidth, innerHeight) * 0.055);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const lens = ctx.createRadialGradient(gravX, gravY, 0, gravX, gravY, Math.min(innerWidth, innerHeight) * 0.5);
  lens.addColorStop(0, 'rgba(120,200,255,0.01)');
  lens.addColorStop(0.6, 'rgba(90,130,200,0.02)');
  lens.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lens;
  ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);
  ctx.restore();

  requestAnimationFrame(step);
}

requestAnimationFrame(step);
