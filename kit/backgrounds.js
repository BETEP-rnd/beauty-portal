// Общая библиотека фонов для всех разделов портала: ~300 вариантов в 10 категориях.
// Фоны рисуются кодом на canvas — без картинок, в любом размере.
(function () {
  const Kit = window.Kit = window.Kit || {};

  // ---------- цвета и вспомогательное ----------
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const A = (h, a) => `rgba(${rgb(h).join(",")},${a})`;
  const mix = (h1, h2, t) => "#" + rgb(h1).map((v, i) => Math.round(v + (rgb(h2)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const rnd = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash = s => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  const METAL = {
    gold: ["#9c7a3c", "#e0c78e", "#a8843f", "#d9bd7c", "#c9a960", "золото"],
    silver: ["#8e9297", "#eceff2", "#9fa4aa", "#d5d9dd", "#c3c7cc", "серебро"],
    rose: ["#a7695a", "#f0c4b4", "#b37766", "#e3a998", "#d39a88", "розовое золото"],
    "gold-d": ["#6f5220", "#b08a3e", "#7d5e26", "#a07c34", "#8c6a2c", "золото"],          // для светлых фонов — темнее, чтобы читалось
    "silver-d": ["#50555c", "#8f969e", "#5c6168", "#80878f", "#6a7078", "серебро"],
    "rose-d": ["#7e4436", "#b9735f", "#8a4d3f", "#ad6a56", "#9a5a48", "розовое золото"],
  };
  function paintOn(c, fill, x0, x1) {                           // металл — градиентом, остальное — как есть
    const m = METAL[fill];
    if (!m) return fill;
    const g = c.createLinearGradient(x0, 0, x1, 0);
    [0, .35, .65, 1].forEach((p, i) => g.addColorStop(p, m[i]));
    return g;
  }
  const solid = c => METAL[c] ? METAL[c][4] : c;
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  Object.assign(Kit, { rgb, A, mix, rnd, hash, METAL, paintOn, solid, rr });

  // ---------- фигуры для узоров ----------
  function archPath(c, W, H, side, top) {                       // приплюснутая арка — не задевает заголовок
    const rx = W / 2 - side, ry = rx * .6;
    c.beginPath(); c.moveTo(side, H - side); c.lineTo(side, top + ry); c.ellipse(W / 2, top + ry, rx, ry, 0, Math.PI, 0); c.lineTo(W - side, H - side); c.closePath();
  }
  function blob(c, cx, cy, R, r) {                              // мягкое «пятно» произвольной формы
    const n = 7, p = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = R * (.75 + r() * .5); p.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]); }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    c.beginPath(); c.moveTo(...mid(p[n - 1], p[0]));
    p.forEach((pt, i) => c.quadraticCurveTo(pt[0], pt[1], ...mid(pt, p[(i + 1) % n])));
    c.closePath();
  }
  function sprig(c, x, y, len, ang, col) {                     // веточка с листьями
    c.save(); c.translate(x, y); c.rotate(ang); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len / 2, -len * .1, len, 0); c.stroke();
    for (let i = 1; i <= 7; i++) {
      const t = i / 8, px = len * t, py = -len * .1 * 2 * t * (1 - t), leaf = Math.min(len * .11, 46) * (1 - t * .45);
      [-1, 1].forEach(side => {
        c.save(); c.translate(px, py); c.rotate(side * .75 - .25); c.globalAlpha = .6;
        c.beginPath(); c.ellipse(leaf, 0, leaf, leaf * .38, 0, 0, Math.PI * 2); c.fill(); c.restore();
      });
    }
    c.restore();
  }
  function euc(c, x, y, len, ang, col) {                        // эвкалипт — круглые листья
    c.save(); c.translate(x, y); c.rotate(ang); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len / 2, len * .06, len, 0); c.stroke();
    for (let i = 1; i <= 6; i++) {
      const t = i / 7, r = len * .075 * (1 - t * .4);
      [-1, 1].forEach(s => { c.globalAlpha = .5; c.beginPath(); c.arc(len * t, s * r * 1.1, r, 0, Math.PI * 2); c.fill(); });
    }
    c.restore();
  }
  function flower(c, x, y, R, col, mid, petals = 5) {
    c.save(); c.translate(x, y); c.fillStyle = col; c.globalAlpha = .85;
    for (let i = 0; i < petals; i++) { c.rotate(Math.PI * 2 / petals); c.beginPath(); c.ellipse(R * .55, 0, R * .55, R * .33, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = mid; c.beginPath(); c.arc(0, 0, R * .2, 0, Math.PI * 2); c.fill(); c.restore();
  }
  function lavender(c, x, y, len, ang, stem, bud) {
    c.save(); c.translate(x, y); c.rotate(ang); c.strokeStyle = stem; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(len, 0); c.stroke(); c.fillStyle = bud; c.globalAlpha = .85;
    for (let i = 0; i < 10; i++) { const t = .58 + i * .045; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(len * t, s * 6, 8, 4.5, s * .5, 0, Math.PI * 2); c.fill(); }); }
    c.restore();
  }
  function waveBand(c, W, y0, amp, freq, phase, toY, fill) {
    c.beginPath(); c.moveTo(0, toY); c.lineTo(0, y0);
    for (let x = 0; x <= W; x += 20) c.lineTo(x, y0 + Math.sin(x / W * Math.PI * 2 * freq + phase) * amp);
    c.lineTo(W, toY); c.closePath(); c.fillStyle = fill; c.fill();
  }
  function leaf(c, x, y, len, ang, col) {                       // осенний лист с прожилкой
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = col;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .42, len, 0); c.quadraticCurveTo(len * .5, len * .42, 0, 0); c.fill();
    c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-len * .15, 0); c.lineTo(len * .9, 0); c.stroke();
    c.restore();
  }
  function snowflake(c, x, y, R, col) {
    c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = Math.max(1.2, R / 14); c.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(R, 0);
      [.45, .7].forEach(t => { c.moveTo(R * t, 0); c.lineTo(R * t + R * .2, -R * .2); c.moveTo(R * t, 0); c.lineTo(R * t + R * .2, R * .2); });
      c.stroke();
    }
    c.restore();
  }
  function heart(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y + s * .3);
    c.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); c.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s);
    c.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); c.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); c.closePath();
  }
  function tulip(c, x, y, s, col, stem, ang) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = stem; c.lineWidth = s * .06; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * .08, -s * .5, 0, -s); c.stroke();
    c.fillStyle = stem; c.globalAlpha = .8; c.beginPath(); c.ellipse(s * .12, -s * .35, s * .07, s * .28, .5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.fillStyle = col; c.beginPath(); c.moveTo(-s * .18, -s); c.quadraticCurveTo(-s * .2, -s * 1.3, -s * .1, -s * 1.32); c.lineTo(0, -s * 1.2);
    c.lineTo(s * .1, -s * 1.32); c.quadraticCurveTo(s * .2, -s * 1.3, s * .18, -s); c.quadraticCurveTo(0, -s * .9, -s * .18, -s); c.fill();
    c.restore();
  }
  function edgePts(r, n, W, H, pad = 130) {                     // точки по краям, не в зоне текста
    const pts = [];
    for (let i = 0; i < n * 30 && pts.length < n; i++) {
      const x = r() * W, y = r() * H;
      if (x > 80 && x < W - 80 && y > 90 && y < H - 60) continue;
      pts.push([x, y]);
    }
    return pts;
  }
  function confetti(c, W, H, r, cols, n) {
    edgePts(r, n, W, H).forEach(([x, y], i) => {
      c.save(); c.translate(x, y); c.rotate(r() * 6); c.fillStyle = A(cols[i % cols.length], .85);
      if (i % 3 === 0) { c.beginPath(); c.arc(0, 0, 5 + r() * 5, 0, Math.PI * 2); c.fill(); } else c.fillRect(-9, -3.5, 18, 7);
      c.restore();
    });
  }

  // ---------- узоры фонов ----------
  const DECOR = {
    corners(c, W, H, r, t) {
      c.strokeStyle = t.acc; c.lineWidth = 2;
      [[46, 46, 1, 1], [W - 46, 46, -1, 1], [46, H - 46, 1, -1], [W - 46, H - 46, -1, -1]].forEach(([x, y, sx, sy]) => {
        c.beginPath(); c.moveTo(x + sx * 150, y); c.lineTo(x, y); c.lineTo(x, y + sy * 150); c.stroke();
      });
    },
    frame2(c, W, H, r, t) { c.strokeStyle = t.acc; c.lineWidth = 1.6; c.strokeRect(40, 40, W - 80, H - 80); c.lineWidth = .8; c.strokeRect(52, 52, W - 104, H - 104); },
    frame1(c, W, H, r, t) { c.strokeStyle = t.acc; c.lineWidth = 2.2; c.strokeRect(44, 44, W - 88, H - 88); },
    cornersThin(c, W, H, r, t) {
      c.strokeStyle = t.acc; c.fillStyle = t.acc; c.lineWidth = 1.4;
      [[58, 58, 1, 1], [W - 58, 58, -1, 1], [58, H - 58, 1, -1], [W - 58, H - 58, -1, -1]].forEach(([x, y, sx, sy]) => {
        c.beginPath(); c.moveTo(x + sx * 90, y); c.lineTo(x, y); c.lineTo(x, y + sy * 90); c.stroke();
        c.beginPath(); c.arc(x + sx * 14, y + sy * 14, 3, 0, Math.PI * 2); c.fill();
      });
    },
    deco(c, W, H, r, t) {                                       // ар-деко: веера сверху и снизу
      const R = H > 1500 ? 110 : 66;
      c.strokeStyle = t.acc; c.lineWidth = 1.5;
      [[0, 1], [H, -1]].forEach(([cy, s]) => {
        const a0 = s > 0 ? 0 : Math.PI;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(W / 2, cy, R * (.45 + k * .22), a0, a0 + Math.PI); c.stroke(); }
        for (let i = 1; i < 10; i++) { const a = a0 + i * Math.PI / 10; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * R * .45, cy + Math.sin(a) * R * .45); c.lineTo(W / 2 + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); }
      });
      c.globalAlpha = .6; c.lineWidth = 1; c.strokeRect(34, 34, W - 68, H - 68); c.globalAlpha = 1;
    },
    stars(c, W, H, r, t) {
      c.fillStyle = mix(t.ink, t.acc, .3);
      for (let i = 0; i < 90; i++) { c.globalAlpha = .12 + r() * .5; c.beginPath(); c.arc(r() * W, r() * H, .8 + r() * 1.8, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = .85; c.fillStyle = t.acc;
      [[.1, .07], [.9, .12], [.06, .55], [.94, .5], [.12, .93], [.88, .95]].forEach(([x, y], i) => {
        const s = 10 + (i % 3) * 5; c.save(); c.translate(x * W, y * H); c.beginPath();
        c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill(); c.restore();
      });
      c.globalAlpha = 1;
    },
    arcLine(c, W, H, r, t) { archPath(c, W, H, 64, 30); c.strokeStyle = t.acc; c.lineWidth = 1.6; c.globalAlpha = .85; c.stroke(); c.globalAlpha = 1; },
    sideLines(c, W, H, r, t) {
      c.strokeStyle = t.acc; c.fillStyle = t.acc; c.lineWidth = 1.4;
      [52, W - 52].forEach(x => {
        c.beginPath(); c.moveTo(x, H * .12); c.lineTo(x, H * .45); c.moveTo(x, H * .55); c.lineTo(x, H * .88); c.stroke();
        c.beginPath(); c.moveTo(x, H / 2 - 12); c.lineTo(x + 8, H / 2); c.lineTo(x, H / 2 + 12); c.lineTo(x - 8, H / 2); c.closePath(); c.fill();
      });
    },
    blobs(c, W, H, r, t) {
      [[W * .92, H * .06, 270, .6], [W * .04, H * .97, 320, .7], [W * .98, H * .72, 150, .55], [W * .02, H * .3, 90, .5]]
        .forEach(([x, y, rad, a]) => { c.fillStyle = A(t.deco, a); c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill(); });
    },
    waves(c, W, H, r, t) {
      [[H - 200, .3, 1.1, 0], [H - 150, .45, 1.4, 1.5], [H - 95, .65, .9, 3]].forEach(([y, a, f, ph]) => waveBand(c, W, y, 24, f, ph, H, A(t.deco, a)));
      waveBand(c, W, 70, 18, 1.2, 2, 0, A(t.deco, .35));
    },
    arch(c, W, H, r, t) { archPath(c, W, H, 60, 30); c.fillStyle = A(mix(t.a, "#ffffff", .55), .82); c.fill(); c.strokeStyle = t.deco; c.lineWidth = 2; c.stroke(); },
    dotsSoft(c, W, H, r, t) {
      edgePts(r, 46, W, H, 120).forEach(([x, y]) => { c.fillStyle = A(t.deco, .25 + r() * .3); c.beginPath(); c.arc(x, y, 6 + r() * 36, 0, Math.PI * 2); c.fill(); });
    },
    circleBig(c, W, H, r, t) {
      c.fillStyle = A(t.deco, .55); c.beginPath(); c.arc(W * .88, H * .08, 300, 0, Math.PI * 2); c.fill();
      c.strokeStyle = A(t.deco, .9); c.lineWidth = 3; c.beginPath(); c.arc(W * .1, H * .92, 220, 0, Math.PI * 2); c.stroke();
      c.fillStyle = A(t.deco, .45); c.beginPath(); c.arc(W * .05, H * .45, 40, 0, Math.PI * 2); c.fill();
    },
    organic(c, W, H, r, t) {
      [[W, 0, 300, .55], [0, H, 340, .6], [W, H * .62, 120, .45]].forEach(([x, y, R, a]) => { blob(c, x, y, R, r); c.fillStyle = A(t.deco, a); c.fill(); });
    },
    bars(c, W, H, r, t) { c.fillStyle = t.acc; c.fillRect(60, 56, W - 120, 5); c.fillRect(60, H - 61, W - 120, 5); },
    sideStripe(c, W, H, r, t) { c.fillStyle = t.acc; c.fillRect(0, 0, 26, H); c.fillRect(40, 0, 2, H); },
    underline(c, W, H, r, t) { c.fillStyle = t.acc; c.fillRect(60, 60, W - 120, 1.5); c.fillRect(60, H - 61, W - 120, 1.5); },
    none() {},
    sprigs(c, W, H, r, t) {
      sprig(c, -20, 120, 330, -.35, t.leaf); sprig(c, 40, -30, 260, .55, t.leaf2);
      sprig(c, W + 20, H - 120, 330, Math.PI - .35, t.leaf); sprig(c, W - 40, H + 30, 260, Math.PI + .55, t.leaf2);
    },
    eucalyptus(c, W, H, r, t) {
      euc(c, -10, 90, 320, -.3, t.leaf); euc(c, 60, -20, 240, .6, t.leaf2);
      euc(c, W + 10, H - 90, 320, Math.PI - .3, t.leaf); euc(c, W - 60, H + 20, 240, Math.PI + .6, t.leaf2);
    },
    flowers(c, W, H, r, t) {
      sprig(c, -10, 210, 200, -.6, t.leaf); sprig(c, W + 10, H - 210, 200, Math.PI - .6, t.leaf);
      [[70, 70, 50], [175, 38, 34], [38, 185, 30]].forEach(([x, y, R]) => { flower(c, x, y, R, t.leaf2, t.acc); flower(c, W - x, H - y, R, t.leaf2, t.acc); });
    },
    lavender(c, W, H, r, t) {
      [[22, -1.68], [44, -1.6], [64, -1.52]].forEach(([x, a], i) => {
        lavender(c, x, H + 10, 300 + i * 40, a, t.leaf, t.leaf2); lavender(c, W - x, H + 10, 300 + i * 40, -Math.PI - a, t.leaf, t.leaf2);
      });
    },
    leavesFrame(c, W, H, r, t) {
      sprig(c, -10, 44, 400, .06, t.leaf); sprig(c, W + 10, 44, 400, Math.PI - .06, t.leaf2);
      sprig(c, -10, H - 44, 400, -.06, t.leaf2); sprig(c, W + 10, H - 44, 400, Math.PI + .06, t.leaf);
    },
    branch(c, W, H, r, t) { sprig(c, W - 8, H + 10, 720, -Math.PI / 2 - .04, t.leaf); sprig(c, -10, 80, 260, -.25, t.leaf2); },
    mesh(c, W, H, r, t) {
      [[.1, .05], [.95, .2], [.05, .75], [.9, .95], [.5, .5]].forEach(([x, y], i) => {
        const col = t.cols[i % t.cols.length], g = c.createRadialGradient(x * W, y * H, 0, x * W, y * H, W * .7);
        g.addColorStop(0, A(col, .85)); g.addColorStop(1, A(col, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      });
    },
    wavesBold(c, W, H, r, t) {
      const top = H > 1500 ? 110 : 70;                          // верхние волны не заходят на заголовок
      t.cols.forEach((col, i) => { waveBand(c, W, H - 230 + i * 55, 30, 1 + i * .3, i * 1.7, H, A(col, .8)); waveBand(c, W, top - i * 30, 22, 1.2 + i * .2, i * 2.1, 0, A(col, .75)); });
    },
    terrazzo(c, W, H, r, t) {
      for (let i = 0; i < 130; i++) {
        const x = r() * W, y = r() * H, R = 8 + r() * 20, n = 3 + Math.floor(r() * 3), a0 = r() * 6;
        c.beginPath(); for (let k = 0; k < n; k++) { const a = a0 + k / n * Math.PI * 2, d = R * (.6 + r() * .4); c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
        c.closePath(); c.fillStyle = A(t.cols[i % t.cols.length], .9); c.fill();
      }
    },
    terrazzoFine(c, W, H, r, t) {
      for (let i = 0; i < 80; i++) {
        const x = r() * W, y = r() * H, R = 4 + r() * 10, n = 3 + Math.floor(r() * 3), a0 = r() * 6;
        c.beginPath(); for (let k = 0; k < n; k++) { const a = a0 + k / n * Math.PI * 2; c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R * (.6 + r() * .4)); }
        c.closePath(); c.fillStyle = A(t.cols[i % t.cols.length], .75); c.fill();
      }
    },
    arcs(c, W, H, r, t) {
      c.lineWidth = 13;
      [[W, 0], [0, H]].forEach(([x, y]) => { for (let k = 0; k < 6; k++) { c.strokeStyle = A(t.cols[k % t.cols.length], .8); c.beginPath(); c.arc(x, y, 60 + k * 32, 0, Math.PI * 2); c.stroke(); } });
    },
    strokes(c, W, H, r, t) {
      c.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const top = i % 2 === 0, y = top ? 60 + r() * 180 : H - 60 - r() * 180, x1 = 250 + r() * 450, fromLeft = i % 4 < 2;
        c.strokeStyle = A(t.cols[i % t.cols.length], .55); c.lineWidth = 60 + r() * 50;
        c.beginPath(); const sx = fromLeft ? -60 : W + 60, ex = fromLeft ? x1 : W - x1;
        c.moveTo(sx, y); c.quadraticCurveTo((sx + ex) / 2, y + (r() - .5) * 120, ex, y + (r() - .5) * 60); c.stroke();
      }
    },
    shapes(c, W, H, r, t) {
      const [c0, c1, c2] = t.cols;
      c.fillStyle = A(c0, .85); c.beginPath(); c.arc(0, 0, 250, 0, Math.PI * 2); c.fill();
      c.fillStyle = A(c1, .8); c.beginPath(); c.arc(W - 30, H - 50, 210, 0, Math.PI * 2); c.fill();
      c.fillStyle = A(c2, .9); c.beginPath(); c.moveTo(W - 170, 60); c.lineTo(W - 50, 60); c.lineTo(W - 110, 160); c.closePath(); c.fill();
      c.strokeStyle = A(c2, .9); c.lineWidth = 14; c.beginPath(); c.arc(70, H - 120, 70, 0, Math.PI * 2); c.stroke();
    },
    marble(c, W, H, r, t) {
      for (let i = 0; i < 6; i++) { blob(c, r() * W, r() * H, 200 + r() * 200, r); c.fillStyle = A(t.vein, .05); c.fill(); }
      const vein = (col, alpha, lw) => {
        let x = r() * W * 1.2 - W * .1, y = -40; c.beginPath(); c.moveTo(x, y);
        while (y < H + 40) { const nx = x + (r() - .35) * 260, ny = y + 120 + r() * 220; c.bezierCurveTo(x + (r() - .5) * 200, y + 60, nx + (r() - .5) * 200, ny - 60, nx, ny); x = nx; y = ny; }
        c.strokeStyle = A(col, alpha); c.lineWidth = lw; c.stroke();
      };
      for (let i = 0; i < 14; i++) vein(t.vein, .12 + r() * .3, .6 + r() * 2.4);
      if (t.vein2) for (let i = 0; i < 4; i++) vein(t.vein2, .55 + r() * .3, 1 + r() * 1.5);
    },
    linen(c, W, H, r, t) {
      const col = t.dark ? "#ffffff" : "#000000";
      for (let y = 0; y < H; y += 3) { c.fillStyle = A(col, .02 + r() * .035); c.fillRect(0, y, W, 1); }
      for (let x = 0; x < W; x += 3) { c.fillStyle = A(col, .015 + r() * .03); c.fillRect(x, 0, 1, H); }
    },
    grainPaper(c, W, H, r, t) {
      for (let i = 0; i < 9000; i++) { c.fillStyle = A(r() < .5 ? "#000000" : "#ffffff", r() * .08); c.fillRect(r() * W, r() * H, 2, 2); }
      for (let i = 0; i < 40; i++) { blob(c, r() * W, r() * H, 60 + r() * 120, r); c.fillStyle = A("#000000", .018); c.fill(); }
    },
    velvet(c, W, H, r, t) {
      let g = c.createRadialGradient(W * .3, H * .2, 0, W * .3, H * .2, H * .7); g.addColorStop(0, "rgba(255,255,255,.09)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      g = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.45)"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 6000; i++) { c.fillStyle = A("#ffffff", r() * .04); c.fillRect(r() * W, r() * H, 2, 2); }
    },
    // сезоны
    autumn(c, W, H, r, t) {
      const spots = t.v === 1 ? edgePts(r, 26, W, H) : t.v === 2 ? Array.from({ length: 18 }, (_, i) => [r() * W, i % 2 ? 10 + r() * 70 : H - 10 - r() * 70])
        : [...Array.from({ length: 12 }, () => [r() * 220, r() * 90]), ...Array.from({ length: 12 }, () => [W - r() * 220, H - r() * 90])];
      spots.forEach(([x, y], i) => leaf(c, x, y, 40 + r() * 40, r() * 6, A(t.cols[i % t.cols.length], .85)));
    },
    winter(c, W, H, r, t) {
      c.fillStyle = A(t.cols[0], .6);
      for (let i = 0; i < 120; i++) { c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 3, 0, Math.PI * 2); c.fill(); }
      const pts = t.v === 1 ? [[60, 60, 56], [W - 70, H - 70, 64], [W - 60, 70, 34], [50, H - 60, 40]] : edgePts(r, 16, W, H).map(([x, y]) => [x, y, 18 + r() * 34]);
      pts.forEach(([x, y, R], i) => snowflake(c, x, y, R, A(t.cols[i % t.cols.length], .9)));
    },
    spring(c, W, H, r, t) {
      c.strokeStyle = A(t.cols[2] || t.acc, .8); c.lineWidth = 6; c.lineCap = "round";
      const twig = (x, y, dx, dy) => { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + dx * .5, y + dy * .2, x + dx, y + dy); c.stroke(); return [x + dx, y + dy]; };
      if (t.v === 1) edgePts(r, 30, W, H).forEach(([x, y], i) => flower(c, x, y, 14 + r() * 16, A(t.cols[i % 2], .9), "#ffffff"));
      else {
        twig(-10, 40, 380, 30); twig(W + 10, H - 40, -380, -30);
        for (let i = 0; i < 9; i++) { const k = i / 8; flower(c, -10 + 380 * k, 40 + 30 * k * k + (i % 2 ? -20 : 20), 16 + r() * 10, A(t.cols[i % 2], .92), "#fff6c9"); flower(c, W + 10 - 380 * k, H - 40 - 30 * k * k + (i % 2 ? 20 : -20), 16 + r() * 10, A(t.cols[i % 2], .92), "#fff6c9"); }
      }
    },
    summer(c, W, H, r, t) {
      const [x, y, R] = t.v === 1 ? [W * .5, H + 120, 230] : [W - 10, 10, 80];
      c.strokeStyle = A(t.cols[0], .8); c.lineWidth = 8; c.lineCap = "round";
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * (R + 18), y + Math.sin(a) * (R + 18)); c.lineTo(x + Math.cos(a) * (R + 48), y + Math.sin(a) * (R + 48)); c.stroke(); }
      c.fillStyle = A(t.cols[0], .85); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
      waveBand(c, W, t.v === 1 ? 90 : H - 130, 22, 1.3, 1, t.v === 1 ? 0 : H, A(t.cols[1], .7));
      waveBand(c, W, t.v === 1 ? 50 : H - 85, 18, 1.7, 2.5, t.v === 1 ? 0 : H, A(t.cols[2], .75));
    },
    // праздники
    newyear(c, W, H, r, t) {
      c.fillStyle = A("#ffffff", .5); for (let i = 0; i < 70; i++) { c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2.5, 0, Math.PI * 2); c.fill(); }
      if (t.v === 1) {                                          // гирлянда сверху и снизу
        [[40, 1], [H - 40, -1]].forEach(([y0, s]) => {
          c.strokeStyle = A(t.ink, .45); c.lineWidth = 2; c.beginPath();
          for (let x = 0; x <= W; x += 10) c.lineTo(x, y0 + s * Math.abs(Math.sin(x / W * Math.PI * 4)) * 34); c.stroke();
          for (let i = 0; i < 16; i++) { const x = 30 + i * (W - 60) / 15, y = y0 + s * Math.abs(Math.sin(x / W * Math.PI * 4)) * 34 + s * 14; const g = c.createRadialGradient(x, y, 0, x, y, 22); g.addColorStop(0, A(solid(t.cols[i % 3]), 1)); g.addColorStop(1, A(solid(t.cols[i % 3]), 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, 22, 0, Math.PI * 2); c.fill(); }
        });
      } else {                                                  // шары на ниточках
        [[60, 40, 30], [150, 20, 24], [W - 60, 46, 32], [W - 150, 18, 24], [W / 2 + 330, 8, 18]].forEach(([x, len, R], i) => {
          c.strokeStyle = A(t.ink, .5); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, len); c.stroke();
          c.fillStyle = paintOn(c, t.cols[i % 3], x - R, x + R); c.beginPath(); c.arc(x, len + R, R, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(255,255,255,.35)"; c.beginPath(); c.arc(x - R * .35, len + R * .65, R * .25, 0, Math.PI * 2); c.fill();
          c.fillStyle = A(t.ink, .6); c.fillRect(x - 7, len - 4, 14, 10);
        });
        edgePts(r, 8, W, H).forEach(([x, y]) => snowflake(c, x, y, 16 + r() * 18, A("#ffffff", .7)));
      }
    },
    hearts(c, W, H, r, t) {
      if (t.v === 1) { c.strokeStyle = A(t.cols[0], .8); c.lineWidth = 4; heart(c, W - 110, -130, 260); c.stroke(); heart(c, 60, H - 150, 200); c.stroke(); }
      edgePts(r, t.v === 1 ? 14 : 30, W, H).forEach(([x, y], i) => { heart(c, x, y, 22 + r() * 40); c.fillStyle = A(t.cols[i % t.cols.length], .7 + r() * .25); c.fill(); });
    },
    tulips(c, W, H, r, t) {
      const n = t.v === 1 ? 3 : 5;
      for (let i = 0; i < n; i++) { tulip(c, 14 + i * 18, H + 20, 150 + r() * 50, t.cols[i % 2], t.cols[2], -.28 + i * .06); tulip(c, W - 14 - i * 18, H + 20, 150 + r() * 50, t.cols[(i + 1) % 2], t.cols[2], .28 - i * .06); }
      if (t.v === 1) for (let i = 0; i < 40; i++) { c.fillStyle = A("#f2d24b", .9); c.beginPath(); c.arc(W - 30 - r() * 200, 20 + r() * 80, 6 + r() * 6, 0, Math.PI * 2); c.fill(); }
    },
    balloons(c, W, H, r, t) {
      const B = t.v === 1 ? [[0, H * .36], [W, H * .58]] : [[0, H * .42], [W, H * .3], [W + 10, H * .66]];
      B.forEach(([x, y], i) => {
        c.strokeStyle = A(t.ink, .4); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 95); c.bezierCurveTo(x - 30, y + 200, x + 30, y + 300, x, y + 420); c.stroke();
        c.fillStyle = A(t.cols[i % t.cols.length], .9); c.beginPath(); c.ellipse(x, y, 70, 90, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(x - 24, y - 30, 14, 24, -.4, 0, Math.PI * 2); c.fill();
      });
      confetti(c, W, H, r, t.cols, 40);
    },
    sale(c, W, H, r, t) {
      c.save(); c.fillStyle = A(t.cols[0], .9);
      [[0, 0, 1], [W, H, -1]].forEach(([x, y, s]) => { c.beginPath(); c.moveTo(x, y + s * 120); c.lineTo(x + s * 120, y); c.lineTo(x + s * 180, y); c.lineTo(x, y + s * 180); c.closePath(); c.fill(); });
      c.restore(); confetti(c, W, H, r, t.cols, t.v === 1 ? 70 : 36);
    },
    // акварель
    watercolor(c, W, H, r, t) {
      const spots = [[[W, 0], [0, H]], [[0, 0], [W, H * .7]], [[W * .5, -60], [W * .5, H + 60]]][t.v || 0];
      spots.forEach(([x, y], k) => {
        for (let i = 0; i < 9; i++) { blob(c, x + (r() - .5) * 160, y + (r() - .5) * 160, 180 + r() * 160, r); c.fillStyle = A(t.cols[(k + i) % t.cols.length], .1 + r() * .06); c.fill(); }
      });
      for (let i = 0; i < 26; i++) { const [x, y] = spots[i % spots.length]; c.fillStyle = A(t.cols[i % t.cols.length], .25); c.beginPath(); c.arc(x + (r() - .5) * 600, y + (r() - .5) * 600, 3 + r() * 9, 0, Math.PI * 2); c.fill(); }
    },
    // блеск
    glitter(c, W, H, r, t) {
      const m = METAL[t.accent] ? METAL[t.accent] : [t.acc, t.acc, t.acc, t.acc];
      for (let i = 0; i < 4500; i++) {
        const cx = i % 2 ? W : 0, cy = i % 2 ? H : 0, d = Math.pow(r(), 2.2) * 620, a = r() * Math.PI / 2;
        const x = Math.abs(cx - Math.cos(a) * d), y = Math.abs(cy - Math.sin(a) * d);
        c.fillStyle = A(m[Math.floor(r() * 4)], .5 + r() * .5); c.fillRect(x, y, 1.5 + r() * 2.5, 1.5 + r() * 2.5);
      }
    },
    bokeh(c, W, H, r, t) {
      edgePts(r, 34, W, H, 160).forEach(([x, y], i) => {
        const R = 20 + r() * 70, g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, A(t.cols[i % t.cols.length], .5)); g.addColorStop(.7, A(t.cols[i % t.cols.length], .3)); g.addColorStop(1, A(t.cols[i % t.cols.length], 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
      });
    },
    sequins(c, W, H, r, t) {
      edgePts(r, 90, W, H, 110).forEach(([x, y], i) => {
        const R = 6 + r() * 12; c.fillStyle = paintOn(c, t.accent, x - R, x + R); c.globalAlpha = .55 + r() * .45;
        c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill(); c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.arc(x - R * .3, y - R * .3, R * .25, 0, Math.PI * 2); c.fill();
      });
      c.globalAlpha = 1;
    },
    foilFrame(c, W, H, r, t) {
      c.strokeStyle = paintOn(c, t.accent, 0, W); c.lineWidth = 10; c.strokeRect(36, 36, W - 72, H - 72);
      c.lineWidth = 1.5; c.strokeRect(58, 58, W - 116, H - 116);
      c.fillStyle = paintOn(c, t.accent, 0, W);
      [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]].forEach(([x, y]) => { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-16, -16, 32, 32); c.restore(); });
    },
  };

  const DECOR_NAMES = { corners: "уголки", frame2: "двойная рамка", frame1: "рамка", cornersThin: "тонкие уголки", deco: "ар-деко", stars: "звёзды",
    arcLine: "арка", sideLines: "линии", blobs: "круги", waves: "волны", arch: "арка", dotsSoft: "конфетти", circleBig: "солнце", organic: "пятна",
    bars: "полосы", sideStripe: "полоса сбоку", underline: "линии", none: "чистый", sprigs: "веточки", eucalyptus: "эвкалипт", flowers: "цветы",
    lavender: "лаванда", leavesFrame: "листья", branch: "ветка", mesh: "градиент", wavesBold: "волны", terrazzo: "терраццо", arcs: "кольца",
    strokes: "мазки", shapes: "геометрия", marble: "мрамор", linen: "лён", grainPaper: "бумага", velvet: "бархат", terrazzoFine: "терраццо",
    autumn: "листопад", winter: "снежинки", spring: "цветение", summer: "солнце", newyear: "Новый год", hearts: "сердечки", tulips: "тюльпаны",
    balloons: "шары", sale: "акция", watercolor: "акварель", glitter: "блёстки", bokeh: "боке", sequins: "пайетки", foilFrame: "фольга" };

  // ---------- сборка тем ----------
  function mk(o) {
    if (!o.dark && METAL[o.accent] && !o.accent.endsWith("-d")) o = { ...o, accent: o.accent + "-d" };
    const acc = METAL[o.accent] ? METAL[o.accent][4] : o.accent, b = o.b || o.a;
    return {
      title: "caps", ...o, b, acc, dark: !!o.dark,
      cols: o.cols || [o.deco || acc, mix(o.deco || acc, "#ffffff", .3), mix(o.deco || acc, o.ink, .3)],
      deco: o.deco || (o.cols ? o.cols[0] : acc), leaf: o.leaf || acc, leaf2: o.leaf2 || acc,
      muted: o.muted || mix(o.ink, mix(o.a, b, .5), .4),
      dots: A(acc, .5),
      qrTile: o.dark ? [mix(acc, "#ffffff", .8), mix(acc, "#ffffff", .62)] : ["#ffffff", "#ffffff"],
      qrInk: o.dark ? b : o.ink,
      mark: o.dark ? .09 : .1,
    };
  }
  const cats = [];
  // палитра × 3 узора; узоры перебираются со сдвигом, чтобы соседние палитры отличались
  function gen(id, name, pals, decors, extra = () => ({})) {
    const items = [];
    pals.forEach((p, i) => [0, 1, 2].forEach(j => {
      const decor = decors[(2 * i + j) % decors.length], k = items.length;
      const o = { ...p, decor, v: j, title: (i + j) % 2 ? "caps" : "script", ...extra(p, i, j, decor) };
      items.push(mk({ id: `${id}-${k}`, name: `${p.n} · ${o.decorName || DECOR_NAMES[o.decor]}`, ...o }));
    }));
    cats.push({ id, name, items });
  }
  const BUSY = new Set(["mesh", "terrazzo", "strokes"]);

  gen("lux", "Тёмные люкс", [
    { n: "Чёрный", a: "#211c17", b: "#0b0a09", ink: "#efe6d6" }, { n: "Графит", a: "#2e2e30", b: "#121213", ink: "#ecebea" },
    { n: "Тёмно-синий", a: "#1f2a40", b: "#0c111c", ink: "#e9edf5" }, { n: "Изумруд", a: "#1d3a30", b: "#0a1712", ink: "#e8f0ea" },
    { n: "Бордо", a: "#40192a", b: "#17080e", ink: "#f5e7ec" }, { n: "Шоколад", a: "#3a2a20", b: "#140d09", ink: "#f2e8de" },
    { n: "Слива", a: "#36284d", b: "#15101d", ink: "#f1e8f7" }, { n: "Петроль", a: "#16343d", b: "#081418", ink: "#e6f1f3" },
    { n: "Индиго", a: "#262b55", b: "#0e1028", ink: "#ecedfa" }, { n: "Вишня", a: "#4a1420", b: "#1a060b", ink: "#f8e9ec" }],
    ["corners", "frame2", "deco", "stars", "arcLine", "sideLines"],
    (p, i, j, decor) => { const m = ["gold", "silver", "rose"][(i + j) % 3]; return { dark: true, radial: true, accent: m, decorName: `${METAL[m][5]} · ${DECOR_NAMES[decor]}` }; });

  gen("pastel", "Пастель", [
    { n: "Пудра", a: "#fbefec", b: "#f0d8d3", ink: "#5a3d42", accent: "#a8636f", deco: "#e8beb7" },
    { n: "Персик", a: "#fff1e8", b: "#f8d9c4", ink: "#5b3f30", accent: "#c0714a", deco: "#f3c3a5" },
    { n: "Лаванда", a: "#f3effa", b: "#e2d8f1", ink: "#43385a", accent: "#7d68a8", deco: "#cfc0ea" },
    { n: "Мята", a: "#eef8f3", b: "#d6ede2", ink: "#2f4a3e", accent: "#4f8a70", deco: "#b8e0cd" },
    { n: "Небо", a: "#eef5fb", b: "#d7e7f4", ink: "#2d4257", accent: "#4f7aa3", deco: "#b9d4ec" },
    { n: "Ваниль", a: "#fffaec", b: "#f6ead0", ink: "#56472b", accent: "#b0893e", deco: "#efd9a7" },
    { n: "Сирень", a: "#fbeff8", b: "#efd6ea", ink: "#55374f", accent: "#a35a96", deco: "#e6bddc" },
    { n: "Нюд", a: "#ecdfcf", b: "#e0ccb5", ink: "#4b382b", accent: "#8a6447", deco: "#c7aa8b" },
    { n: "Коралл", a: "#fff0ec", b: "#fbd6cc", ink: "#5a3029", accent: "#d0604c", deco: "#f6b3a3" },
    { n: "Голубика", a: "#f0f2fb", b: "#d9def3", ink: "#323a5c", accent: "#5a67a8", deco: "#bcc5ec" }],
    ["blobs", "waves", "arch", "dotsSoft", "circleBig", "organic"]);

  gen("minimal", "Минимализм", [
    { n: "Белый", a: "#faf9f6", ink: "#1f1f1f", accent: "#1f1f1f" }, { n: "Слоновая кость", a: "#f6f1e7", ink: "#2b2620", accent: "#7a6347" },
    { n: "Серый", a: "#eceae7", ink: "#262626", accent: "#262626" }, { n: "Чёрный", a: "#141414", ink: "#f2f2f2", accent: "#f2f2f2", dark: true },
    { n: "Беж", a: "#ede4d8", ink: "#3b3027", accent: "#3b3027" }, { n: "Шалфей", a: "#e6e9e2", ink: "#28322a", accent: "#3e5a44" },
    { n: "Пыльная роза", a: "#f1e4e1", ink: "#3d2a2a", accent: "#9b5c5c" }, { n: "Тёмно-синий", a: "#1c2433", ink: "#eef1f6", accent: "#c9d3e3", dark: true },
    { n: "Графит", a: "#2a2a2c", ink: "#f0efed", accent: "#d8c3a5", dark: true }, { n: "Песок", a: "#e9dfcd", ink: "#3a3024", accent: "#8c6b43" }],
    ["frame2", "frame1", "cornersThin", "bars", "sideStripe", "underline", "none"]);

  gen("botanic", "Ботаника", [
    { n: "Шалфей", a: "#e8ede2", b: "#d6dfcd", ink: "#2e392b", accent: "#4f654a", leaf: "#7f9878", leaf2: "#93aa8b" },
    { n: "Эвкалипт", a: "#eef2ef", b: "#dbe5df", ink: "#2c3b36", accent: "#4d6d63", leaf: "#7d9c92", leaf2: "#a3bdb4" },
    { n: "Крем", a: "#faf5ec", b: "#efe4d1", ink: "#3e3527", accent: "#6f7a4f", leaf: "#8e9a6a", leaf2: "#d9b8a0" },
    { n: "Розовый сад", a: "#fbf0ee", b: "#f1dcd8", ink: "#4f3536", accent: "#9a5b62", leaf: "#8aa07f", leaf2: "#e3a8ae" },
    { n: "Лес", a: "#22352b", b: "#101b15", ink: "#eef3ec", accent: "#c9d9b5", leaf: "#5f8a6a", leaf2: "#7ea486", dark: true, radial: true },
    { n: "Лаванда", a: "#f4f1f8", b: "#e4def0", ink: "#3d3550", accent: "#6d5c93", leaf: "#8d9f84", leaf2: "#9d88c9" },
    { n: "Олива", a: "#f1efe2", b: "#e1dcc4", ink: "#3a3824", accent: "#6b6a35", leaf: "#8b8a50", leaf2: "#aead78" },
    { n: "Терракота", a: "#f8ede6", b: "#ecd5c6", ink: "#4a3026", accent: "#a3593a", leaf: "#8e9a72", leaf2: "#d39a7c" },
    { n: "Пион", a: "#fdf1f4", b: "#f6dbe3", ink: "#4e2c38", accent: "#b34d72", leaf: "#7f9a7c", leaf2: "#ef9fb8" },
    { n: "Хвоя", a: "#18302a", b: "#0b1714", ink: "#ecf3ef", accent: "#d8c8a0", leaf: "#4f7a66", leaf2: "#6f9a84", dark: true, radial: true }],
    ["sprigs", "eucalyptus", "flowers", "lavender", "leavesFrame", "branch"]);

  gen("abstract", "Абстракция", [
    { n: "Закат", a: "#fff4ec", ink: "#3b2a2a", accent: "#c04a3e", cols: ["#f7b39a", "#f39ab0", "#ffd28f"] },
    { n: "Лагуна", a: "#eef8f8", ink: "#1f3b40", accent: "#1f7a84", cols: ["#9fdcdc", "#b9c7f0", "#c8eedb"] },
    { n: "Ягода", a: "#fbeef3", ink: "#43233a", accent: "#a8336c", cols: ["#f2a7c7", "#c9a3e6", "#ffc2b8"] },
    { n: "Песок", a: "#f7f0e6", ink: "#3d3226", accent: "#a86b35", cols: ["#e8c49b", "#d9a982", "#f1dcb8"] },
    { n: "Ночь", a: "#1a1726", ink: "#f3eefc", accent: "#f0a6c8", cols: ["#6c4bd1", "#d14b8f", "#3f7fd1"], dark: true },
    { n: "Мята-лимон", a: "#f5fbef", ink: "#2c3b23", accent: "#4f7f26", cols: ["#c9eaa2", "#fdf0a0", "#a8e0c9"] },
    { n: "Пыльный", a: "#f2ece8", ink: "#3a302d", accent: "#8d5f55", cols: ["#d8b8ad", "#b9a7b8", "#e4cbb6"] },
    { n: "Океан", a: "#0f2230", ink: "#eaf4fb", accent: "#7fd3e8", cols: ["#1f6f8b", "#3fb5c7", "#285d9a"], dark: true },
    { n: "Мандарин", a: "#fff6ea", ink: "#40291a", accent: "#d06a1f", cols: ["#ffc98a", "#ffa98a", "#ffe3a3"] },
    { n: "Индиго", a: "#f0f0fa", ink: "#262a4a", accent: "#4a4fb0", cols: ["#b7b9ec", "#d6b9ec", "#b9dcec"] }],
    ["mesh", "wavesBold", "terrazzo", "arcs", "strokes", "shapes"],
    (p, i, j, decor) => ({ panel: BUSY.has(decor) ? (p.dark ? "rgba(10,8,20,.55)" : "rgba(255,255,255,.74)") : null }));

  const LP = "rgba(255,255,255,.45)", DP = "rgba(0,0,0,.3)";
  gen("marble", "Мрамор и текстуры", [
    { n: "Белый мрамор", a: "#f7f6f3", b: "#ecebe7", ink: "#2a2a2a", accent: "#2a2a2a", vein: "#8f8f8f", panel: LP },
    { n: "Мрамор с золотом", a: "#f8f6f1", b: "#eeebe4", ink: "#2d2a24", accent: "gold", vein: "#9a9a9a", vein2: "#c9a960", panel: LP },
    { n: "Розовый мрамор", a: "#f8eeeb", b: "#f0dfda", ink: "#4b3233", accent: "#a35f63", vein: "#c99a92", panel: LP },
    { n: "Травертин", a: "#efe6d8", b: "#e2d4bf", ink: "#3e3226", accent: "#7a5c3c", vein: "#b39a78", panel: LP, cols: ["#d9b48a", "#b9a58c", "#e6d2b0"] },
    { n: "Чёрный мрамор", a: "#1c1b1a", b: "#0d0c0c", ink: "#efe9df", accent: "gold", vein: "#8d8d8d", vein2: "#c9a960", panel: DP, dark: true },
    { n: "Зелёный мрамор", a: "#1f3d34", b: "#0e1f1a", ink: "#eef4f0", accent: "gold", vein: "#9fc7b4", panel: DP, dark: true, radial: true },
    { n: "Синий мрамор", a: "#1d2a40", b: "#0d1420", ink: "#edf1f7", accent: "silver", vein: "#8aa3c7", panel: DP, dark: true, radial: true },
    { n: "Серый камень", a: "#e9e8e5", b: "#d9d8d4", ink: "#232323", accent: "#3a3a3a", vein: "#6b6b6b", panel: LP },
    { n: "Бордо", a: "#5a1a31", b: "#2a0a17", ink: "#f7e9ee", accent: "gold", vein: "#c48a9c", panel: DP, dark: true, radial: true },
    { n: "Терраццо", a: "#f3efe8", ink: "#2f2a25", accent: "#a4613f", vein: "#b0a89c", cols: ["#d9a48a", "#9fb3a6", "#e6c98f", "#b9a7c9"] }],
    ["marble", "linen", "grainPaper", "velvet", "terrazzoFine", "marble"],
    (p, i, j, decor) => { const d = decor === "velvet" && !p.dark ? "grainPaper" : decor; return { decor: d, panel: d === "marble" ? p.panel : null }; });

  gen("seasons", "Сезоны", [
    { n: "Осень", a: "#fbf1e4", b: "#f1dcc0", ink: "#4a2f1c", accent: "#b55a22", cols: ["#d9822b", "#c2452d", "#e2b13c"] },
    { n: "Осень тёмная", a: "#2e2119", b: "#140d09", ink: "#f6ece1", accent: "gold", cols: ["#d9822b", "#b5412a", "#e2b13c"], dark: true, radial: true },
    { n: "Горчица", a: "#f7efd9", b: "#ecdcb2", ink: "#3f3216", accent: "#9a6f12", cols: ["#c99a2e", "#a5582a", "#7c8a3a"] },
    { n: "Зима", a: "#f1f6fb", b: "#dbe7f3", ink: "#22344a", accent: "#3f6a9a", cols: ["#9cc3e8", "#c8dcf2", "#7aa6d6"] },
    { n: "Зимняя ночь", a: "#1d2b45", b: "#0b1222", ink: "#eef3fb", accent: "silver", cols: ["#e7f0fb", "#bcd2ee", "#ffffff"], dark: true, radial: true },
    { n: "Иней", a: "#f6f7f9", b: "#e4e8ee", ink: "#2c3340", accent: "#6c7a90", cols: ["#b9c6d8", "#d7dfe9", "#93a5bf"] },
    { n: "Весна", a: "#f6fbf0", b: "#e3f0d6", ink: "#2f4127", accent: "#5f8f3a", cols: ["#f5b8c8", "#ffffff", "#8a6a4a"] },
    { n: "Сакура", a: "#fdf3f5", b: "#f7dee4", ink: "#4d2c35", accent: "#c0567a", cols: ["#f4a9be", "#fbd3de", "#7a5545"] },
    { n: "Лето", a: "#fffbea", b: "#fff0c2", ink: "#3d3115", accent: "#d08a12", cols: ["#ffcf4a", "#6fd0d0", "#4aa8c8"] },
    { n: "Море", a: "#eefafb", b: "#d3eff3", ink: "#163a44", accent: "#1f8299", cols: ["#ffd36b", "#7ad3df", "#3aa2bd"] }],
    ["autumn", "autumn", "autumn"],
    (p, i, j) => { const d = ["autumn", "autumn", "autumn", "winter", "winter", "winter", "spring", "spring", "summer", "summer"][i]; return { decor: d, decorName: `${DECOR_NAMES[d]} ${j + 1}` }; });

  gen("holidays", "Праздники", [
    { n: "Новый год", a: "#14281f", b: "#08130e", ink: "#f4efe2", accent: "gold", cols: ["gold", "#c0392b", "silver"], dark: true, radial: true },
    { n: "Новый год красный", a: "#5a1414", b: "#2a0707", ink: "#fbefe6", accent: "gold", cols: ["gold", "silver", "#2e7d4f"], dark: true, radial: true },
    { n: "Новый год светлый", a: "#f7f4ee", b: "#ebe4d6", ink: "#2b2a26", accent: "#b2873a", cols: ["#c0392b", "#2e7d4f", "gold"] },
    { n: "14 февраля", a: "#fff0f3", b: "#fbd9e1", ink: "#5a1f30", accent: "#d0335c", cols: ["#e8436a", "#f58fa8", "#ffc0cf"] },
    { n: "14 февраля тёмный", a: "#3a0f1c", b: "#17050b", ink: "#fbe9ee", accent: "rose", cols: ["#e8436a", "#f58fa8", "#d39a88"], dark: true, radial: true },
    { n: "8 марта", a: "#fdf3f6", b: "#f6dfe7", ink: "#4a2533", accent: "#c24a72", cols: ["#e85d8a", "#f5a4bd", "#5f8f4a"] },
    { n: "8 марта мимоза", a: "#fffbe8", b: "#fbf0c4", ink: "#3d3418", accent: "#9a7a12", cols: ["#f2c94c", "#e85d8a", "#6f9a4a"] },
    { n: "День рождения", a: "#fff7ef", b: "#fde6d2", ink: "#3f2a22", accent: "#d0563e", cols: ["#f2994a", "#eb5757", "#56ccf2", "#bb6bd9"] },
    { n: "Праздник", a: "#f2f4ff", b: "#dfe3fb", ink: "#26294a", accent: "#5b5fd1", cols: ["#7b61ff", "#ff8fb1", "#ffd36b", "#56ccf2"] },
    { n: "Акция", a: "#141414", b: "#050505", ink: "#fafafa", accent: "#ff4d6d", cols: ["#ff4d6d", "#ffd166", "#ffffff"], dark: true }],
    ["newyear"],
    (p, i, j) => { const d = ["newyear", "newyear", "newyear", "hearts", "hearts", "tulips", "tulips", "balloons", "balloons", "sale"][i]; return { decor: d, v: j % 2, decorName: `${DECOR_NAMES[d]} ${j + 1}` }; });

  gen("watercolor", "Акварель", [
    { n: "Роза", a: "#fffafa", ink: "#4a2c33", accent: "#b2556d", cols: ["#f2a5b8", "#f7c6a5", "#e8b0d0"] },
    { n: "Голубая", a: "#fbfdff", ink: "#24384e", accent: "#3f6f9e", cols: ["#9cc7ec", "#b9e0e8", "#c4c3ee"] },
    { n: "Персиковая", a: "#fffbf7", ink: "#4a3022", accent: "#c26a3a", cols: ["#f7bf96", "#f6d59a", "#f2a59a"] },
    { n: "Мятная", a: "#fbfffd", ink: "#24443a", accent: "#3c8a72", cols: ["#a5e0c8", "#c2e8a5", "#9fd6df"] },
    { n: "Лиловая", a: "#fdfbff", ink: "#3a2c4e", accent: "#7a5aa8", cols: ["#c9b0ec", "#e8b0d8", "#b0c4ec"] },
    { n: "Золотая", a: "#fffdf6", ink: "#3f3418", accent: "gold", cols: ["#f0d58a", "#e8c3a0", "#d9c08a"] },
    { n: "Морская", a: "#f9fdff", ink: "#16384a", accent: "#1f7a99", cols: ["#7fc7e0", "#9fe0d0", "#5fa8d8"] },
    { n: "Ягодная", a: "#fffafc", ink: "#4a1f36", accent: "#a8336c", cols: ["#e88ab8", "#c98ae0", "#f2a0a0"] },
    { n: "Оливковая", a: "#fdfdf7", ink: "#36381c", accent: "#6b6f2a", cols: ["#c8cf8a", "#e0d39a", "#a8c09a"] },
    { n: "Небо и розы", a: "#fdfcff", ink: "#30324e", accent: "#a8566d", cols: ["#a8c4ec", "#f2b0c4", "#e0d0f2"] }],
    ["watercolor", "watercolor", "watercolor"],
    (p, i, j) => ({ decorName: `акварель ${j + 1}` }));

  gen("glam", "Блеск", [
    { n: "Чёрный", a: "#1a1716", b: "#070606", ink: "#f4ede2", accent: "gold", cols: ["#c9a960", "#e0c78e", "#8a6e3a"], dark: true, radial: true },
    { n: "Шампань", a: "#f7efe2", b: "#ecdcc4", ink: "#3a2e20", accent: "gold", cols: ["#e0c78e", "#f3e3c3", "#c9a960"] },
    { n: "Розовое золото", a: "#fbefec", b: "#f2d9d2", ink: "#4a2e2a", accent: "rose", cols: ["#f0c4b4", "#e3a998", "#fbe3da"] },
    { n: "Серебро", a: "#f1f2f4", b: "#dfe2e7", ink: "#25282e", accent: "silver", cols: ["#d5d9dd", "#eceff2", "#aab0b8"] },
    { n: "Изумруд", a: "#163a30", b: "#071712", ink: "#eef5f1", accent: "gold", cols: ["#c9a960", "#4fa384", "#e0c78e"], dark: true, radial: true },
    { n: "Сапфир", a: "#1a2550", b: "#080d22", ink: "#eef1fb", accent: "silver", cols: ["#c3c7cc", "#6f86d6", "#eceff2"], dark: true, radial: true },
    { n: "Бордо", a: "#4a1225", b: "#1c050d", ink: "#fbecf0", accent: "rose", cols: ["#e3a998", "#c85a7a", "#f0c4b4"], dark: true, radial: true },
    { n: "Жемчуг", a: "#fbfaf8", b: "#eeebe6", ink: "#2e2c2a", accent: "silver", cols: ["#e6e0d8", "#d8dde6", "#f2e6ea"] },
    { n: "Аметист", a: "#2f1d45", b: "#120a1d", ink: "#f4ecfb", accent: "silver", cols: ["#c3a6e8", "#e0c4f0", "#c3c7cc"], dark: true, radial: true },
    { n: "Карамель", a: "#3b2414", b: "#160c05", ink: "#f8ecdf", accent: "gold", cols: ["#d9a066", "#e0c78e", "#a86b3a"], dark: true, radial: true }],
    ["glitter", "bokeh", "sequins", "foilFrame"]);

  const THEMES = Object.fromEntries(cats.flatMap(c => c.items.map(t => [t.id, t])));

  function drawBg(c, t, W, H) {
    let g;
    if (t.radial) { g = c.createRadialGradient(W / 2, H * .35, 0, W / 2, H * .35, H * .8); g.addColorStop(0, t.a); g.addColorStop(1, t.b); }
    else { g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, t.a); g.addColorStop(1, t.b); }
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); DECOR[t.decor](c, W, H, rnd(hash(t.id)), t); c.restore();
    if (t.panel) { c.fillStyle = t.panel; rr(c, 56, 56, W - 112, H - 112, 30); c.fill(); }
  }

  Object.assign(Kit, { CATS: cats, THEMES, DECOR, drawBg });
})();
