// Коллекция «Тренды 2026»: палитры и приёмы, популярные у бьюти-мастеров (Pantone Cloud Dancer, Pinterest Predicts,
// Canva «Imperfect by Design», мокко, бантики, ретро, бохо). Рисунки свои, рисуются кодом, как и классические фоны.
(function () {
  const Kit = window.Kit;
  const { A, mix, paintOn, blob, edgePts, rnd } = Kit;
  const TAU = Math.PI * 2;
  const kH = H => H > 1500 ? 1 : .75;                           // пост и сертификат ниже сторис — узоры у краёв чуть мельче

  // тень не масштабируется вместе с холстом — пересчитываем под текущий масштаб (миниатюры, SCALE)
  function shade(c, col, blur, dy) { const s = c.getTransform().a; c.shadowColor = col; c.shadowBlur = blur * s; c.shadowOffsetX = 0; c.shadowOffsetY = dy * s; }
  function unshade(c) { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0; }
  function grain(c, W, H, r, a = 1) {                           // зерно, как у бумаги и ризографии
    for (let i = 0, n = W * H / 700; i < n; i++) {
      c.fillStyle = r() < .5 ? `rgba(0,0,0,${.07 * a})` : `rgba(255,255,255,${.1 * a})`;
      c.fillRect(r() * W, r() * H, 1.8, 1.8);
    }
  }
  function gloss(c, x, y, R, col, a = 1) {                      // глянцевый шарик с бликом
    const g = c.createRadialGradient(x - R * .35, y - R * .4, R * .05, x, y, R);
    g.addColorStop(0, mix(col, "#ffffff", .7)); g.addColorStop(.45, col); g.addColorStop(1, mix(col, "#000000", .18));
    c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
    c.globalAlpha = a * .8; c.fillStyle = "#ffffff"; c.beginPath(); c.ellipse(x - R * .38, y - R * .42, R * .22, R * .12, -.7, 0, TAU); c.fill();
    c.globalAlpha = 1;
  }
  function sparkle(c, x, y, s) {                                // четырёхлучевая звёздочка
    c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s);
    c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill();
  }
  function bow(c, x, y, s, ang, col, line) {                    // бант: петли, хвосты, узелок
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = col; c.strokeStyle = line; c.lineWidth = Math.max(1.5, s * .045); c.lineJoin = "round";
    [-1, 1].forEach(d => {
      c.beginPath(); c.moveTo(d * s * .08, s * .05); c.quadraticCurveTo(d * s * .35, s * .55, d * s * .5, s * 1.05);
      c.lineTo(d * s * .36, s * .93); c.lineTo(d * s * .28, s * 1.1); c.quadraticCurveTo(d * s * .18, s * .55, -d * s * .06, s * .08); c.closePath(); c.fill(); c.stroke();
    });
    [-1, 1].forEach(d => {
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(d * s * .45, -s * .55, d * s * .95, -s * .35, d * s * .85, 0);
      c.bezierCurveTo(d * s * .8, s * .3, d * s * .4, s * .25, 0, 0); c.closePath(); c.fill(); c.stroke();
    });
    c.beginPath(); c.ellipse(0, 0, s * .13, s * .16, 0, 0, TAU); c.fill(); c.stroke();
    c.restore();
  }
  function daisy(c, x, y, R, pet, mid) {
    c.fillStyle = pet;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * R * .55, y + Math.sin(a) * R * .55, R * .45, R * .17, a, 0, TAU); c.fill(); }
    c.fillStyle = mid; c.beginPath(); c.arc(x, y, R * .28, 0, TAU); c.fill();
  }
  // рисунки «от руки»: линия дрожит и обводится дважды, как маркером
  function hand(c, r, pts) {
    for (let pass = 0; pass < 2; pass++) {
      c.globalAlpha = pass ? .5 : .95; c.beginPath();
      pts.forEach(([x, y], i) => { const jx = x + (r() - .5) * 4, jy = y + (r() - .5) * 4; i ? c.lineTo(jx, jy) : c.moveTo(jx, jy); });
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  const P = {
    star: (x, y, R) => Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? R * .45 : R; return [x + Math.cos(a) * d, y + Math.sin(a) * d]; }),
    heart: (x, y, s) => Array.from({ length: 44 }, (_, i) => { const a = i / 43 * TAU; return [x + s * Math.pow(Math.sin(a), 3), y - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]; }),
    squiggle: (x, y, L) => Array.from({ length: Math.ceil(L / 6) + 1 }, (_, i) => [x + i * 6, y + Math.sin(i * 6 / L * Math.PI * 4) * 12]),
    spiral: (x, y, R) => Array.from({ length: 95 }, (_, i) => { const a = i * .2, d = R * a / (Math.PI * 6); return [x + Math.cos(a) * d, y + Math.sin(a) * d]; }),
  };
  function handSpark(c, r, x, y, R) { [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 4; hand(c, r, [[x - Math.cos(a) * R, y - Math.sin(a) * R], [x + Math.cos(a) * R, y + Math.sin(a) * R]]); }); }
  const softShadow = t => t.dark ? "rgba(0,0,0,.5)" : A(mix(t.b, t.ink, .5), .28);

  const DECOR = {
    // ---------- облачный белый ----------
    clay(c, W, H, r, t) {                                       // объёмные «пластилиновые» фигуры с мягкой тенью
      const k = kH(H), C = t.cols;
      const items = t.v
        ? [["s", W - 70, 90 * k, 150 * k, 0], ["p", W - 290, 46 * k, 90 * k, 1], ["s", 60, H - 90 * k, 170 * k, 2], ["r", 300, H + 20, 110 * k, 0], ["s", 60, H * .34, 34, 1]]
        : [["r", W - 30, 40, 150 * k, 1], ["s", 90, 70 * k, 64 * k, 2], ["s", 100, H - 110 * k, 150 * k, 0], ["p", W - 180, H - 60 * k, 100 * k, 2], ["s", W - 50, H * .55, 38, 0]];
      items.forEach(([kind, x, y, R, ci], i) => {
        const col = mix(C[ci % C.length], Kit.solid(t.accent), .3);   // чуть насыщеннее фона, чтобы фигуры читались
        shade(c, softShadow(t), 50, 22);
        if (kind === "s") {
          const g = c.createRadialGradient(x - R * .35, y - R * .4, R * .1, x, y, R * 1.05);
          g.addColorStop(0, mix(col, "#ffffff", .55)); g.addColorStop(1, mix(col, "#000000", .06));
          c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
        } else if (kind === "p") {
          c.save(); c.translate(x, y); c.rotate(i % 2 ? .45 : -.45);
          const g = c.createLinearGradient(0, -R * .45, 0, R * .45); g.addColorStop(0, mix(col, "#ffffff", .5)); g.addColorStop(1, col);
          c.fillStyle = g; Kit.rr(c, -R * 1.2, -R * .42, R * 2.4, R * .84, R * .42); c.fill(); c.restore();
        } else {
          const g = c.createLinearGradient(x - R, y - R, x + R, y + R); g.addColorStop(0, mix(col, "#ffffff", .5)); g.addColorStop(1, col);
          c.strokeStyle = g; c.lineWidth = R * .38; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
        }
        unshade(c);
      });
    },
    paperLayers(c, W, H, r, t) {                                // бумажные слои внахлёст
      const k = kH(H);
      for (let i = 0; i < 4; i++) {
        const y0 = H - (118 - i * 26) * k, ph = r() * 6;
        shade(c, softShadow(t), 26, -6);
        c.beginPath(); c.moveTo(0, H); c.lineTo(0, y0);
        for (let x = 0; x <= W; x += 20) c.lineTo(x, y0 + Math.sin(x / W * Math.PI * (1.4 + i * .3) + ph) * 16 * k);
        c.lineTo(W, H); c.closePath(); c.fillStyle = mix(t.a, mix(t.deco, Kit.solid(t.accent), .25), .35 + i * .2); c.fill();
      }
      for (let i = 0; i < 3; i++) {
        shade(c, softShadow(t), 26, 8);
        c.fillStyle = mix(t.a, mix(t.deco, Kit.solid(t.accent), .25), .35 + i * .2); c.beginPath(); c.arc(t.v ? 0 : W, 0, (220 - i * 60) * k, 0, TAU); c.fill();
      }
      unshade(c);
    },
    puffs(c, W, H, r, t) {                                      // пухлые облака
      const k = kH(H), fill = t.dark ? mix(t.a, "#ffffff", .14) : mix(t.a, "#ffffff", .8);
      const cloud = (x, y, s) => {
        c.beginPath();
        [[-.9, .1, .45], [-.4, -.25, .6], [.25, -.3, .55], [.8, .05, .42], [0, .2, .5]].forEach(([dx, dy, R]) => { c.moveTo(x + dx * s + R * s, y + dy * s); c.arc(x + dx * s, y + dy * s, R * s, 0, TAU); });
        c.fill();
      };
      shade(c, softShadow(t), 40, 16); c.fillStyle = fill;
      cloud(80, H - 50 * k, 150 * k); cloud(W - 40, H - 30 * k, 120 * k); cloud(W - 70, 50 * k, 110 * k);
      if (t.v) cloud(50, 50 * k, 80 * k);
      unshade(c);
      c.fillStyle = A(t.deco, .7);
      edgePts(r, 14, W, H).forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3 + r() * 6, 0, TAU); c.fill(); });
    },

    // ---------- нео-деко ----------
    decoFans(c, W, H, r, t) {                                   // ряды вееров сверху и снизу
      const R = H > 1500 ? 64 : 46, n = Math.ceil(W / (2 * R)), x0 = (W - n * 2 * R) / 2 + R;
      c.strokeStyle = paintOn(c, t.accent, 0, W); c.lineWidth = 1.6;
      [[0, 1], [H, -1]].forEach(([cy, s]) => {
        const a0 = s > 0 ? 0 : Math.PI;
        for (let i = 0; i < n; i++) {
          const x = x0 + i * 2 * R;
          if (i % 2) { c.fillStyle = A(Kit.solid(t.accent), .12); c.beginPath(); c.arc(x, cy, R, a0, a0 + Math.PI); c.fill(); }
          for (let q = 1; q <= 4; q++) { c.beginPath(); c.arc(x, cy, R * q / 4, a0, a0 + Math.PI); c.stroke(); }
        }
        c.beginPath(); c.moveTo(40, cy + s * (R + 14)); c.lineTo(W - 40, cy + s * (R + 14)); c.stroke();
      });
    },
    stepFrame(c, W, H, r, t) {                                  // рамка со ступенчатыми углами
      c.strokeStyle = paintOn(c, t.accent, 0, W); c.fillStyle = c.strokeStyle;
      const frame = (m, s, lw) => {
        c.lineWidth = lw;
        [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([cx, cy, sx, sy]) => {
          c.beginPath(); c.moveTo(cx + sx * 3 * s, cy);
          [[3, 1], [2, 1], [2, 2], [1, 2], [1, 3], [0, 3]].forEach(([a, b]) => c.lineTo(cx + sx * a * s, cy + sy * b * s));
          c.stroke();
        });
        c.beginPath(); c.moveTo(m + 3 * s, m); c.lineTo(W - m - 3 * s, m); c.moveTo(m + 3 * s, H - m); c.lineTo(W - m - 3 * s, H - m);
        c.moveTo(m, m + 3 * s); c.lineTo(m, H - m - 3 * s); c.moveTo(W - m, m + 3 * s); c.lineTo(W - m, H - m - 3 * s); c.stroke();
      };
      frame(34, 20, 2); frame(48, 20, 1);
      [[W / 2, 34], [W / 2, H - 34]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 11); c.lineTo(x + 11, y); c.lineTo(x, y + 11); c.lineTo(x - 11, y); c.closePath(); c.fill(); });
    },
    sunburst(c, W, H, r, t) {                                   // лучи из углов
      c.strokeStyle = paintOn(c, t.accent, 0, W);
      [[0, 0, 0], [W, H, Math.PI]].forEach(([x, y, a0]) => {
        c.lineWidth = 1.4;
        for (let i = 0; i <= 18; i++) { const a = a0 + i / 18 * Math.PI / 2, d = i % 2 ? 190 : 240; c.beginPath(); c.moveTo(x + Math.cos(a) * 70, y + Math.sin(a) * 70); c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); c.stroke(); }
        c.lineWidth = 2; [56, 262].forEach(R => { c.beginPath(); c.arc(x, y, R, a0, a0 + Math.PI / 2); c.stroke(); });
      });
      c.lineWidth = 1; c.globalAlpha = .6; c.strokeRect(28, 28, W - 56, H - 56); c.globalAlpha = 1;
    },

    // ---------- желе и глянец ----------
    jelly(c, W, H, r, t) {                                      // глянцевые желейные капли
      const spots = t.v ? [[W + 30, -20, 250], [-40, H + 30, 280], [W - 10, H * .7, 90], [10, H * .35, 70]]
                        : [[-30, -30, 230], [W + 20, H + 20, 300], [W, H * .4, 80], [0, H * .72, 100]];
      spots.forEach(([x, y, R], i) => {
        const col = t.cols[i % t.cols.length], k = kH(H); R *= k;
        blob(c, x, y, R, r);
        const g = c.createRadialGradient(x, y, R * .1, x, y, R * 1.1);
        g.addColorStop(0, mix(col, "#000000", .1)); g.addColorStop(.7, col); g.addColorStop(1, mix(col, "#ffffff", .35));
        shade(c, A(col, .45), 40, 16); c.globalAlpha = .93; c.fillStyle = g; c.fill(); unshade(c); c.globalAlpha = 1;
        const dx = W / 2 - x, dy = H / 2 - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;   // блик — на видимом краю
        c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(x + ux * R * .62, y + uy * R * .62, R * .22, R * .07, Math.atan2(uy, ux) + Math.PI / 2, 0, TAU); c.fill();
        c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.arc(x + ux * R * .5 + uy * R * .2, y + uy * R * .5 - ux * R * .2, R * .035, 0, TAU); c.fill();
      });
    },
    drip(c, W, H, r, t) {                                       // стекающая глазурь сверху
      const k = kH(H), base = 40 * k, col = t.cols[0], drips = [];
      const g = c.createLinearGradient(0, 0, 0, base + 200 * k); g.addColorStop(0, mix(col, "#000000", .08)); g.addColorStop(1, mix(col, "#ffffff", .2));
      shade(c, A(col, .35), 20, 8); c.fillStyle = g;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, base);
      let x = W;
      for (;;) {
        const w = 36 + r() * 44, gap = 30 + r() * 90; x -= gap;
        if (x - w < 0) break;
        const side = x < 280 || x - w > W - 280, len = (side ? 60 + r() * 140 : 10 + r() * 34) * k;
        c.lineTo(x, base);
        c.bezierCurveTo(x - w * .2, base, x - w * .02, base + len, x - w * .5, base + len);
        c.bezierCurveTo(x - w * .98, base + len, x - w * .8, base, x - w, base);
        drips.push([x - w / 2, w, len]); x -= w;
      }
      c.lineTo(0, base); c.closePath(); c.fill(); unshade(c);
      c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(40, base * .45); c.lineTo(W - 40, base * .45); c.stroke();
      c.fillStyle = "rgba(255,255,255,.55)";
      drips.filter(d => d[2] > 40).forEach(([cx, w, len]) => { c.beginPath(); c.ellipse(cx - w * .15, base + len * .72, w * .07, Math.min(len * .15, 16), 0, 0, TAU); c.fill(); });
      [[80, H - 70 * k, 44], [150, H - 40 * k, 20], [W - 90, H - 80 * k, 32], [W - 40, H - 40 * k, 16]].forEach(([x, y, R], i) => gloss(c, x, y, R * k, t.cols[i % t.cols.length]));
    },
    bubbles(c, W, H, r, t) {                                    // глянцевые шарики по краям
      const k = kH(H);
      const big = t.v ? [[W - 80, 100 * k, 80], [80, H - 70 * k, 100], [W - 60, H - 60 * k, 44]] : [[90, 100 * k, 70], [W - 80, H - 70 * k, 100], [50, H * .45, 34]];
      big.forEach(([x, y, R], i) => { shade(c, A(t.cols[i % t.cols.length], .35), 24, 10); gloss(c, x, y, R * k, t.cols[i % t.cols.length], .95); unshade(c); });
      edgePts(r, 22, W, H).forEach(([x, y], i) => gloss(c, x, y, 8 + r() * 20, t.cols[i % t.cols.length], .85));
    },

    // ---------- космос и хром ----------
    holo(c, W, H, r, t) {                                       // голографический перелив
      c.globalCompositeOperation = t.dark ? "screen" : "source-over";
      [[0, 0], [W, H * .35], [W * .15, H], [W, H]].forEach(([x, y], i) => {
        const col = t.cols[i % t.cols.length], R = W * (.55 + r() * .25), g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, A(col, t.dark ? .55 : .7)); g.addColorStop(1, A(col, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      });
      c.globalCompositeOperation = "source-over";
      c.fillStyle = paintOn(c, t.accent, 0, W);
      [[90, 100, 30], [W - 90, H * .45, 20], [110, H - 70, 18]].forEach(([x, y, s]) => sparkle(c, x, y, s));
      grain(c, W, H, r, .6);
    },
    moons(c, W, H, r, t) {                                      // фазы луны над заголовком и месяц в углу
      const k = kH(H), R = 15 * k, y = 58 * k, gap = 52 * k, x0 = W / 2 - gap * 3, lit = paintOn(c, t.accent, x0 - R, x0 + gap * 6 + R), shadow = mix(t.a, t.b, .3);
      for (let i = 0; i < 7; i++) {
        const x = x0 + i * gap, d = 2 * R * (1 - Math.abs(i - 3) / 3) * (i < 3 ? -1 : 1);
        c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
        c.fillStyle = lit; c.fill();
        if (i !== 3) { c.fillStyle = shadow; c.beginPath(); c.arc(x + d, y, R, 0, TAU); c.fill(); }
        c.restore();
        c.strokeStyle = lit; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      }
      const X = 20, Y = H - 20, RR = 120 * k;
      c.fillStyle = lit; c.beginPath(); c.arc(X, Y, RR, 0, TAU); c.fill();
      c.fillStyle = mix(t.a, t.b, .9); c.beginPath(); c.arc(X + RR * .45, Y - RR * .35, RR * .92, 0, TAU); c.fill();
      c.fillStyle = A(t.dark ? "#ffffff" : t.ink, .5);
      for (let i = 0; i < 70; i++) { c.globalAlpha = .2 + r() * .6; c.beginPath(); c.arc(r() * W, r() * H, .8 + r() * 1.6, 0, TAU); c.fill(); }
      c.globalAlpha = 1; c.fillStyle = lit;
      [[W - 90, 140 * k, 22], [W - 60, H - 60 * k, 26], [60, H * .45, 14]].forEach(([x, yy, s]) => sparkle(c, x, yy, s));
    },
    sparkles(c, W, H, r, t) {                                   // хромовые звёздочки
      const fill = paintOn(c, t.accent, 0, W), k = kH(H);
      c.fillStyle = fill;
      [[90, 100 * k, 46], [W - 110, 80 * k, 30], [W - 60, H * .5, 22], [60, H * .62, 26], [W - 70, H - 60 * k, 34], [90, H - 60 * k, 20]].forEach(([x, y, s]) => sparkle(c, x, y, s * k));
      edgePts(r, 34, W, H).forEach(([x, y], i) => { c.fillStyle = A(t.cols[i % t.cols.length], .8); c.beginPath(); c.arc(x, y, 1.5 + r() * 2.5, 0, TAU); c.fill(); });
    },
    chrome(c, W, H, r, t) {                                     // жидкий хром в углах
      const k = kH(H), C = t.cols;
      [[W + 20, -10, 230 * k], [-20, H + 10, 250 * k], [W + 10, H * .62, 70 * k]].forEach(([x, y, R]) => {
        blob(c, x, y, R, r);
        const g = c.createLinearGradient(x - R, y - R, x + R, y + R);
        [[0, "#ffffff"], [.18, mix(C[0], "#8a8f98", .4)], [.38, "#f6f7fa"], [.55, mix(C[1], "#5c626c", .45)], [.75, "#e9ecf2"], [1, mix(C[2], "#7d838d", .4)]].forEach(([p, col]) => g.addColorStop(p, col));
        shade(c, "rgba(0,0,0,.3)", 30, 12); c.fillStyle = g; c.fill(); unshade(c);
      });
      c.fillStyle = paintOn(c, t.accent, 0, W);
      [[100, 110 * k, 26], [W - 70, H * .42, 18], [W - 120, H - 60 * k, 16]].forEach(([x, y, s]) => sparkle(c, x, y, s));
    },

    // ---------- мокко и нюд ----------
    archesRow(c, W, H, r, t) {                                  // арки-«окна» у края
      const k = kH(H), d = t.deco, cs = [d, mix(d, t.a, .5), mix(d, t.ink, .22)];
      const arch = (x, y, w, h) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h + w / 2); c.arc(x + w / 2, y - h + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y); c.closePath(); };
      c.fillStyle = cs[0]; arch(-70, H, 160, 460 * k); c.fill();
      c.fillStyle = cs[1]; arch(40, H, 80, 250 * k); c.fill();
      c.save(); c.scale(1, -1);                                 // сверху справа — арки вниз головой
      c.fillStyle = cs[2]; arch(W - 90, 0, 170, 380 * k); c.fill();
      c.fillStyle = cs[1]; arch(W - 160, 0, 80, 200 * k); c.fill();
      c.restore();
      c.fillStyle = cs[2]; c.beginPath(); c.arc(t.v ? 70 : 110, H - 470 * k, 22 * k, 0, TAU); c.fill();
    },
    swirl(c, W, H, r, t) {                                      // латте-арт: волнистые кольца
      const ring = (x, y, R0, n) => {
        c.strokeStyle = t.deco; c.lineWidth = 2.2;
        for (let i = 0; i < n; i++) {
          const R = R0 + i * 22, ph = r() * 6; c.beginPath();
          for (let a = 0; a <= TAU + .01; a += .05) { const d = R + Math.sin(a * 3 + ph) * 6 + Math.sin(a * 5 + i) * 3, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; a ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
        }
      };
      c.globalAlpha = .6; ring(t.v ? 30 : W - 30, 40, 40, 9); ring(t.v ? W - 30 : 30, H - 40, 50, 11); c.globalAlpha = 1;
    },
    ribbed(c, W, H, r, t) {                                     // рифлёные полосы по бокам, как стекло или дерево
      const w = 16, n = 4;
      const side = x0 => { for (let i = 0; i < n; i++) { const x = x0 + i * w, g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, mix(t.deco, "#000000", .15)); g.addColorStop(.5, mix(t.deco, "#ffffff", .35)); g.addColorStop(1, mix(t.deco, "#000000", .15)); c.fillStyle = g; c.fillRect(x, 0, w, H); } };
      side(0); side(W - n * w);
      c.fillStyle = t.acc; c.fillRect(n * w + 10, 0, 1.5, H); c.fillRect(W - n * w - 11.5, 0, 1.5, H);
    },

    // ---------- бантики ----------
    bows(c, W, H, r, t) {
      const k = kH(H), line = mix(t.deco, t.ink, .35);
      bow(c, 110, 66 * k, 108 * k, -.25, t.deco, line); bow(c, W - 110, 66 * k, 108 * k, .25, t.deco, line);
      bow(c, 80, H - 100 * k, 68 * k, -.2, t.deco, line); bow(c, W - 80, H - 100 * k, 68 * k, .2, t.deco, line);
      edgePts(r, t.v ? 10 : 6, W, H).forEach(([x, y]) => bow(c, x, y, 18 + r() * 12, (r() - .5) * .8, A(t.deco, .75), A(line, .7)));
    },
    pearls(c, W, H, r, t) {                                     // жемчужные нити
      const k = kH(H), R = 9 * k, line = mix(t.deco, t.ink, .35);
      const pearl = (x, y) => { const g = c.createRadialGradient(x - R * .35, y - R * .4, R * .1, x, y, R); g.addColorStop(0, "#ffffff"); g.addColorStop(.6, mix(t.deco, "#ffffff", .6)); g.addColorStop(1, mix(t.deco, t.ink, .15)); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); };
      const swag = (x0, x1, y, sag, dir) => { for (let x = x0; x <= x1; x += R * 2.1) { const u = (x - x0) / (x1 - x0); pearl(x, y + dir * sag * 4 * u * (1 - u)); } };
      shade(c, A(t.ink, .25), 6, 3);
      swag(0, W / 2, 24 * k, 64 * k, 1); swag(W / 2, W, 24 * k, 64 * k, 1);
      swag(0, W / 2, H - 22 * k, 40 * k, -1); swag(W / 2, W, H - 22 * k, 40 * k, -1);
      unshade(c);
      bow(c, W / 2, 26 * k, 40 * k, 0, t.deco, line);
    },
    gingham(c, W, H, r, t) {                                    // клетка-виши полосами сверху и снизу
      const k = kH(H), bh = 60 * k, s = 20 * k, col = A(t.deco, .5);
      const band = y0 => { c.save(); c.beginPath(); c.rect(0, y0, W, bh); c.clip(); c.fillStyle = col; for (let x = 0; x < W; x += 2 * s) c.fillRect(x, y0, s, bh); for (let y = y0; y < y0 + bh; y += 2 * s) c.fillRect(0, y, W, s); c.restore(); };
      band(0); band(H - bh);
      c.fillStyle = t.acc; c.fillRect(0, bh, W, 2); c.fillRect(0, H - bh - 2, W, 2);
      bow(c, W / 2, bh, 36 * k, 0, t.acc, mix(t.acc, t.ink, .3));
    },
    lace(c, W, H, r, t) {                                       // кружевной край
      const k = kH(H), R = 22 * k, h = 26 * k, fill = t.dark ? t.deco : mix(t.a, "#ffffff", .85);
      const edge = (bg, dy) => {
        shade(c, A(t.dark ? "#000000" : t.ink, .18), 10, dy);
        c.fillStyle = fill; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, h);
        for (let x = W; x > 0; x -= 2 * R) c.arc(x - R, h, R, 0, Math.PI);
        c.lineTo(0, 0); c.closePath(); c.fill(); unshade(c);
        c.fillStyle = bg;
        for (let x = W; x > 0; x -= 2 * R) {
          c.beginPath(); c.arc(x - R, h + R * .3, R * .22, 0, TAU); c.fill();
          for (let j = 1; j < 6; j++) { const a = j / 6 * Math.PI; c.beginPath(); c.arc(x - R + Math.cos(a) * R * .68, h + Math.sin(a) * R * .68, 2.2 * k, 0, TAU); c.fill(); }
        }
        for (let x = 8; x < W; x += 14) { c.beginPath(); c.arc(x, h * .5, 2.6 * k, 0, TAU); c.fill(); }
      };
      edge(t.a, 4);
      c.save(); c.translate(0, H); c.scale(1, -1); edge(t.b, -4); c.restore();
      if (t.v) { const line = mix(t.deco, t.ink, .35); bow(c, 90, h + R + 40 * k, 40 * k, -.2, t.deco, line); bow(c, W - 90, h + R + 40 * k, 40 * k, .2, t.deco, line); }
    },

    // ---------- от руки ----------
    torn(c, W, H, r, t) {                                       // рваный лист бумаги на скотче
      const k = kH(H), m = 58, pts = [];
      const edge = (x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 14); for (let i = 0; i < n; i++) { const u = i / n; pts.push([x0 + (x1 - x0) * u + (r() - .5) * 7, y0 + (y1 - y0) * u + (r() - .5) * 7]); } };
      const x0 = m, y0 = m * k, x1 = W - m, y1 = H - m * k;
      edge(x0, y0, x1, y0); edge(x1, y0, x1, y1); edge(x1, y1, x0, y1); edge(x0, y1, x0, y0);
      c.save(); c.translate(W / 2, H / 2); c.rotate((r() - .5) * .012); c.translate(-W / 2, -H / 2);
      shade(c, "rgba(0,0,0,.22)", 22, 8); c.fillStyle = t.deco; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); unshade(c);
      c.restore();
      const tape = (x, y, a) => {
        c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = A(mix(t.acc, "#ffffff", .45), .6); c.beginPath(); c.moveTo(-90, -24);
        for (let yy = -24; yy <= 24; yy += 8) c.lineTo(-90 + (r() - .5) * 6, yy);
        for (let yy = 24; yy >= -24; yy -= 8) c.lineTo(90 + (r() - .5) * 6, yy);
        c.closePath(); c.fill(); c.restore();
      };
      tape(m + 30, y0 + 10, -.6); tape(W - m - 30, y0 + 10, .6);
      if (t.v) tape(W / 2, y1, .04);
      grain(c, W, H, r, .7);
    },
    doodles(c, W, H, r, t) {                                    // каракули маркером по углам
      const k = kH(H);
      c.strokeStyle = t.acc; c.lineWidth = 5; c.lineCap = "round"; c.lineJoin = "round";
      if (t.v) { hand(c, r, P.heart(110, 90 * k, 44 * k)); hand(c, r, P.star(W - 100, 92 * k, 44 * k)); hand(c, r, P.spiral(70, H - 60 * k, 38 * k)); hand(c, r, P.squiggle(W - 220, H - 56 * k, 160)); }
      else { hand(c, r, P.star(100, 92 * k, 44 * k)); hand(c, r, P.heart(W - 110, 90 * k, 44 * k)); hand(c, r, P.squiggle(50, H - 56 * k, 160)); hand(c, r, P.spiral(W - 70, H - 60 * k, 38 * k)); }
      handSpark(c, r, W - 54, H * .42, 20); handSpark(c, r, 54, H * .58, 16);
      grain(c, W, H, r, .5);
    },
    scribbleFrame(c, W, H, r, t) {                              // рамка, нарисованная от руки
      const k = kH(H), m = 44;
      c.strokeStyle = t.acc; c.lineWidth = 3.5; c.lineCap = "round"; c.lineJoin = "round";
      for (let pass = 0; pass < 2; pass++) {
        const o = pass * 5, cs = [[m - o - 6, m * k + o], [W - m + o + 8, m * k - o], [W - m - o, H - m * k + o + 6], [m + o, H - m * k - o]];
        c.globalAlpha = pass ? .5 : .9; c.beginPath();
        cs.forEach(([x, y], i) => { const [nx, ny] = cs[(i + 1) % 4]; for (let s = 0; s <= 30; s++) { const u = s / 30, px = x + (nx - x) * u + (r() - .5) * 3, py = y + (ny - y) * u + (r() - .5) * 3; i === 0 && s === 0 ? c.moveTo(px, py) : c.lineTo(px, py); } });
        c.stroke();
      }
      c.globalAlpha = 1; c.lineWidth = 4.5;
      hand(c, r, P.star(t.v ? 66 : W - 66, 66 * k, 30 * k));
      grain(c, W, H, r, .5);
    },

    // ---------- ретро 70-х ----------
    groovy(c, W, H, r, t) {                                     // волнистые полосы по бокам
      const C = t.cols, ph = r() * 6;
      [[0, 1], [W, -1]].forEach(([x0, s], side) => {
        for (let i = 0; i < 3; i++) {
          const w = (3 - i) * 22; c.beginPath(); c.moveTo(x0, 0);
          for (let y = 0; y <= H; y += 20) c.lineTo(x0 + s * (w + Math.sin(y / H * Math.PI * 3 + ph + side) * 12), y);
          c.lineTo(x0, H); c.closePath(); c.fillStyle = C[(i + side) % C.length]; c.fill();
        }
      });
    },
    daisies(c, W, H, r, t) {                                    // ретро-ромашки
      const C = t.cols, k = kH(H), white = t.dark ? "#fff5e6" : "#ffffff";
      daisy(c, W - 40, 30 * k, 120 * k, t.v ? C[0] : white, C[1]);
      daisy(c, 40, H - 40 * k, 110 * k, t.v ? white : C[0], C[2]);
      daisy(c, 52, H * .38, 34, C[2], C[3 % C.length]); daisy(c, W - 52, H * .6, 40, C[0], C[1]); daisy(c, W - 60, H - 55 * k, 46 * k, white, C[0]);
      if (t.v) daisy(c, 60, 60 * k, 50 * k, C[1], C[0]);
    },
    rainbowArc(c, W, H, r, t) {                                 // радуга 70-х из угла
      const C = t.cols, k = kH(H);
      const rb = (x, y, R, a0, span) => { const w = R / 5.5; for (let i = 0; i < 4; i++) { c.strokeStyle = C[i % C.length]; c.lineWidth = w; c.beginPath(); c.arc(x, y, R - i * w - w / 2, a0, a0 + span); c.stroke(); } };
      rb(W, 0, 210 * k, Math.PI / 2, Math.PI / 2);
      rb(0, H * .5, 88, -Math.PI / 2, Math.PI);
      rb(W, H, 125 * k, Math.PI, Math.PI / 2);
    },

    // ---------- бохо ----------
    bohoRainbow(c, W, H, r, t) {                                // бохо-радуга с плоским основанием
      const C = t.cols, k = kH(H);
      const rb = (x, y, R, rot) => { c.save(); c.translate(x, y); c.rotate(rot); const w = R / 5; for (let i = 0; i < 4; i++) { c.strokeStyle = C[i % C.length]; c.lineWidth = w * .82; c.beginPath(); c.arc(0, 0, R - i * w - w / 2, Math.PI, 0); c.stroke(); } c.restore(); };
      rb(t.v ? W - 150 : 150, H, 130 * k, 0);
      rb(0, H * .32, 84, Math.PI / 2);
      rb(W, H * .66, 84, -Math.PI / 2);
      c.fillStyle = C[0]; c.beginPath(); c.arc(t.v ? 70 : W - 70, 66 * k, 26 * k, 0, TAU); c.fill();
      c.fillStyle = A(t.acc, .6); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc((t.v ? 120 : W - 120) - i * 18 * (t.v ? -1 : 1), 66 * k, 3, 0, TAU); c.fill(); }
    },
    bohoSun(c, W, H, r, t) {                                    // солнце с лучами и холмы
      const C = t.cols, k = kH(H);
      const sun = (x, y, R) => {
        c.fillStyle = C[0]; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
        c.strokeStyle = C[1]; c.lineWidth = 4; c.lineCap = "round";
        for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, d = i % 2 ? 1.5 : 1.7; c.beginPath(); c.moveTo(x + Math.cos(a) * R * 1.22, y + Math.sin(a) * R * 1.22); c.lineTo(x + Math.cos(a) * R * d, y + Math.sin(a) * R * d); c.stroke(); }
      };
      sun(t.v ? 60 : W - 60, 56 * k, 44 * k);
      [[W * .2, 130, 300, C[2]], [W * .75, 110, 360, C[3 % C.length]], [W * .45, 80, 300, C[1]]].forEach(([x, h, w, col]) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, H, w, h * k, 0, Math.PI, 0); c.fill(); });
    },
    mudcloth(c, W, H, r, t) {                                   // узор мадклот полосами
      const k = kH(H), bh = 64 * k;
      const band = y0 => {
        c.strokeStyle = t.acc; c.fillStyle = t.acc; c.lineWidth = 3; c.lineCap = "round";
        c.beginPath(); c.moveTo(0, y0); c.lineTo(W, y0); c.moveTo(0, y0 + bh); c.lineTo(W, y0 + bh); c.stroke();
        const cy = y0 + bh / 2, d = 9 * k;
        for (let x = 22, i = 0; x < W; x += 44, i++) {
          if (i % 3 === 0) { c.beginPath(); c.moveTo(x - d, cy - d); c.lineTo(x + d, cy + d); c.moveTo(x + d, cy - d); c.lineTo(x - d, cy + d); c.stroke(); }
          else if (i % 3 === 1) for (let j = -1; j <= 1; j++) { c.beginPath(); c.arc(x, cy + j * 14 * k, 2.6, 0, TAU); c.fill(); }
          else { c.beginPath(); c.moveTo(x, cy - 15 * k); c.lineTo(x, cy + 15 * k); c.stroke(); }
        }
      };
      c.globalAlpha = .85; band(12 * k); band(H - 12 * k - bh); c.globalAlpha = 1;
    },
  };
  const NAMES = { clay: "объёмные фигуры", paperLayers: "бумажные слои", puffs: "облака", decoFans: "веера", stepFrame: "ступенчатая рамка", sunburst: "лучи",
    jelly: "желе", drip: "глазурь", bubbles: "шарики", holo: "голограмма", moons: "фазы луны", sparkles: "звёздочки", chrome: "жидкий хром",
    archesRow: "арки", swirl: "латте", ribbed: "рифление", bows: "бантики", pearls: "жемчуг", gingham: "клетка", lace: "кружево",
    torn: "лист на скотче", doodles: "каракули", scribbleFrame: "рамка от руки", groovy: "волны", daisies: "ромашки", rainbowArc: "радуга",
    bohoRainbow: "бохо-радуга", bohoSun: "солнце", mudcloth: "мадклот" };

  const metal = (p, i, j, decor) => ({ accent: p.accent || ["gold", "rose", "silver"][(i + j) % 3] });
  Kit.addCollection("trends", "Тренды 2026", DECOR, NAMES, [
    ["t-cloud", "Облачный белый", [
      { n: "Облачный", a: "#f4f2ee", b: "#e9e6e0", ink: "#2f2d2a", accent: "#8b8378", deco: "#ddd8cf", cols: ["#e8e3da", "#f3ece4", "#dcd6ce"] },
      { n: "Молочный", a: "#f7f3ec", b: "#ece4d6", ink: "#3a3128", accent: "#9a7b5a", deco: "#e6d9c4", cols: ["#ecdcc4", "#f4ead9", "#dcc7a8"] },
      { n: "Пудровое облако", a: "#f8f0ef", b: "#eedcda", ink: "#4a3234", accent: "#b07079", deco: "#ecc9c9", cols: ["#f1c9cc", "#f7e1df", "#e6b3b8"] },
      { n: "Голубое облако", a: "#f2f5f8", b: "#dfe7ef", ink: "#2b3a4a", accent: "#5f7f9f", deco: "#c9d8e8", cols: ["#c9dbee", "#e4edf6", "#b5c9e0"] },
      { n: "Лавандовое", a: "#f5f2f8", b: "#e6e0ef", ink: "#3c3450", accent: "#7f6fa8", deco: "#d8cfea", cols: ["#d8cdee", "#ece6f6", "#c6b8e3"] },
      { n: "Шалфейное", a: "#f2f4ef", b: "#e1e7dc", ink: "#2f3a2c", accent: "#6f8a64", deco: "#cfdcc6", cols: ["#cfdec4", "#e6eedf", "#b9cdb0"] },
      { n: "Персиковое", a: "#fbf3ee", b: "#f2e0d4", ink: "#4a3326", accent: "#c0805a", deco: "#f0cfb8", cols: ["#f4cdb2", "#f9e3d4", "#eab896"] },
      { n: "Жемчужно-серое", a: "#f1f1f0", b: "#e2e2e0", ink: "#2a2a2a", accent: "#6d6d6d", deco: "#d4d4d1", cols: ["#dcdcd9", "#ececea", "#c9c9c5"] },
      { n: "Ванильное", a: "#fbf7ea", b: "#f1e8cf", ink: "#46391f", accent: "#a8873a", deco: "#ecdcae", cols: ["#f0dfae", "#f8eed2", "#e3cb8a"] },
      { n: "Облако на графите", a: "#3a3a3c", b: "#1f1f21", ink: "#f0eeea", accent: "#e8e4dc", deco: "#5a5a5e", cols: ["#6a6a70", "#8a8a90", "#55555a"], dark: true, radial: true }],
      ["clay", "paperLayers", "puffs"], undefined, 2],
    ["t-deco", "Нео-деко", [
      { n: "Чёрный оникс", a: "#1b1a19", b: "#0a0909", ink: "#efe6d6", dark: true, radial: true },
      { n: "Изумруд", a: "#123128", b: "#06140f", ink: "#eef5f1", accent: "gold", dark: true, radial: true },
      { n: "Полночь", a: "#141c33", b: "#070b17", ink: "#eef1fb", dark: true, radial: true },
      { n: "Бордо", a: "#3d0f1e", b: "#160509", ink: "#fbecf0", dark: true, radial: true },
      { n: "Шампань", a: "#f5ecdd", b: "#e8d8bd", ink: "#2e2416", accent: "gold" },
      { n: "Слоновая кость", a: "#f7f2e8", b: "#ebe2d0", ink: "#1f1c17" },
      { n: "Нефрит", a: "#e3ece6", b: "#cddcd2", ink: "#1c3329", accent: "gold" },
      { n: "Сливовый", a: "#2a1a35", b: "#100915", ink: "#f6edff", dark: true, radial: true },
      { n: "Терракотовый", a: "#6a2f22", b: "#2e120c", ink: "#fbeee2", accent: "gold", dark: true, radial: true },
      { n: "Графит", a: "#2c2d30", b: "#111214", ink: "#ecebea", accent: "silver", dark: true, radial: true }],
      ["decoFans", "stepFrame", "sunburst"], metal, 2],
    ["t-jelly", "Желе и глянец", [
      { n: "Клубничное", a: "#fff0f3", b: "#ffd9e2", ink: "#5a1630", accent: "#e0306a", cols: ["#ff5c8a", "#ff9eb8", "#ffc2d1"] },
      { n: "Лимонное", a: "#fffbe6", b: "#fff1b8", ink: "#4a3a00", accent: "#c08a00", cols: ["#ffd43b", "#ffb347", "#ffe680"] },
      { n: "Мятное", a: "#ecfdf6", b: "#cff5e6", ink: "#0f4434", accent: "#0f9370", cols: ["#3ddc97", "#8ff0c4", "#5fd0e0"] },
      { n: "Черничное", a: "#f1f0ff", b: "#dcdaff", ink: "#23206b", accent: "#5a50e0", cols: ["#7b6cff", "#ff8fd8", "#b0a8ff"] },
      { n: "Апельсиновое", a: "#fff3e8", b: "#ffdcc0", ink: "#5a2600", accent: "#e06000", cols: ["#ff8a2b", "#ffb36b", "#ff5c5c"] },
      { n: "Малиновое", a: "#fdeef7", b: "#f8d2e8", ink: "#5c0f3e", accent: "#c2187a", cols: ["#e83e9c", "#c77dff", "#ff8cc6"] },
      { n: "Арбузное", a: "#fff4f5", b: "#fde3e6", ink: "#4a1a1f", accent: "#e23e57", cols: ["#ff5a6e", "#7ad67a", "#ffb0bb"] },
      { n: "Бабл-гам", a: "#fff0fa", b: "#e9e8ff", ink: "#40205a", accent: "#d63ca8", cols: ["#ff8fd0", "#9fd8ff", "#c9a8ff"] },
      { n: "Лаймовое", a: "#f6fde8", b: "#e4f7c4", ink: "#2c4000", accent: "#5a8f00", cols: ["#a8e03a", "#5fd6a0", "#d7f57a"] },
      { n: "Ночное желе", a: "#241336", b: "#0e0717", ink: "#fbeffd", accent: "#ff7ad0", cols: ["#ff4fb0", "#7b6cff", "#3ad6c7"], dark: true, radial: true }],
      ["jelly", "drip", "bubbles"], undefined, 2],
    ["t-cosmos", "Космос и хром", [
      { n: "Космос", a: "#15132b", b: "#05040f", ink: "#f1eeff", accent: "silver", cols: ["#ff9be0", "#8fd3ff", "#c7a6ff"], dark: true, radial: true },
      { n: "Чёрный хром", a: "#161616", b: "#050505", ink: "#f2f2f2", accent: "silver", cols: ["#c7c7ff", "#ffc7e8", "#c7fff0"], dark: true },
      { n: "Голография", a: "#f4f1fb", b: "#e6e9f7", ink: "#2a2640", accent: "silver", cols: ["#ffb3e6", "#a8e6ff", "#d4b3ff"] },
      { n: "Лунный", a: "#1d2236", b: "#0a0d18", ink: "#eef0fa", accent: "gold", cols: ["#ffe7a8", "#c7d2ff", "#ffffff"], dark: true, radial: true },
      { n: "Перламутр", a: "#f8f5f4", b: "#ece7ea", ink: "#2f2a33", accent: "rose", cols: ["#f6c6d9", "#c6e4f6", "#e4d6f6"] },
      { n: "Сиреневый космос", a: "#2a1840", b: "#0f0719", ink: "#f6edff", accent: "silver", cols: ["#ff8fd8", "#b38fff", "#8fe3ff"], dark: true, radial: true },
      { n: "Инопланетный", a: "#0f2622", b: "#04100d", ink: "#e9fff7", accent: "silver", cols: ["#7dffcf", "#b8ff7d", "#7dd8ff"], dark: true, radial: true },
      { n: "Серебро", a: "#eef0f3", b: "#dcdfe5", ink: "#1f232a", accent: "silver", cols: ["#c9ced8", "#e8ebf0", "#aab3c2"] },
      { n: "Розовый хром", a: "#fbeef3", b: "#f1d9e3", ink: "#3d1e2c", accent: "rose", cols: ["#ffb6d1", "#d8b6ff", "#f7d6e6"] },
      { n: "Глубокий синий", a: "#0d1b3d", b: "#040a1a", ink: "#eaf1ff", accent: "silver", cols: ["#7aa8ff", "#c49bff", "#ff9bd2"], dark: true, radial: true }],
      ["holo", "moons", "sparkles", "chrome"], undefined, 2],
    ["t-mocha", "Мокко и нюд", [
      { n: "Мокко", a: "#e9ddd2", b: "#d9c4b2", ink: "#3a2619", accent: "#7d5038", deco: "#a47864" },
      { n: "Латте", a: "#f3e9de", b: "#e6d4c0", ink: "#3b2a1d", accent: "#8b5e3c", deco: "#c9a587" },
      { n: "Капучино", a: "#d9c3ad", b: "#c4a688", ink: "#2e1f14", accent: "#5c3a22", deco: "#a07a5a" },
      { n: "Тёмный шоколад", a: "#3b2a21", b: "#1a110c", ink: "#f3e7da", accent: "#d9b38c", deco: "#6a4a37", dark: true, radial: true },
      { n: "Карамель", a: "#f5e4cf", b: "#e8c9a4", ink: "#44290f", accent: "#a0602a", deco: "#d49a62" },
      { n: "Нюд-роза", a: "#f2e1da", b: "#e5c8bd", ink: "#4a2f28", accent: "#a0604f", deco: "#d4a596" },
      { n: "Корица", a: "#e8d3c2", b: "#d6b59b", ink: "#3f2414", accent: "#94532e", deco: "#b9805a" },
      { n: "Какао", a: "#5a4033", b: "#2e1f18", ink: "#f6ebdf", accent: "#e3c2a0", deco: "#8a6650", dark: true, radial: true },
      { n: "Крем-брюле", a: "#faf1e3", b: "#f0dfc4", ink: "#3e2e17", accent: "#a87228", deco: "#e3c48f" },
      { n: "Тауп", a: "#e4dcd4", b: "#d2c6ba", ink: "#322a24", accent: "#6f5f52", deco: "#a99788" }],
      ["archesRow", "swirl", "ribbed"], undefined, 2],
    ["t-bows", "Бантики", [
      { n: "Балетки", a: "#fdf1f3", b: "#f8dfe4", ink: "#5a2e3a", accent: "#c45c78", deco: "#f2b8c6" },
      { n: "Молоко и клубника", a: "#fffaf5", b: "#fde8e8", ink: "#4e2a2a", accent: "#d64560", deco: "#f7c1c8" },
      { n: "Вишня", a: "#fff4f2", b: "#fbe0dc", ink: "#5c1218", accent: "#b8132a", deco: "#e8505b" },
      { n: "Небесный", a: "#f2f7fd", b: "#dfeaf7", ink: "#26405e", accent: "#4f7cae", deco: "#b9d3ef" },
      { n: "Ваниль и пудра", a: "#fffaf0", b: "#f6e9dc", ink: "#4a3626", accent: "#b0747a", deco: "#efc9c4" },
      { n: "Лиловый", a: "#f9f3fd", b: "#ecdff7", ink: "#44305a", accent: "#8a5fb8", deco: "#d7c0ee" },
      { n: "Шампань", a: "#fbf5ec", b: "#f1e4d0", ink: "#3e3122", accent: "gold", deco: "#e8d3b0" },
      { n: "Чёрный бант", a: "#1d1719", b: "#0b0809", ink: "#f8ecef", accent: "#f2b8c6", deco: "#f2b8c6", dark: true, radial: true },
      { n: "Мятный", a: "#f1faf6", b: "#dcefe6", ink: "#244236", accent: "#4f8c74", deco: "#bfe3d3" },
      { n: "Бордо", a: "#4a1020", b: "#1f050c", ink: "#fbeef0", accent: "#f4c6cf", deco: "#f4c6cf", dark: true, radial: true }],
      ["bows", "pearls", "gingham", "lace"], undefined, 2],
    ["t-hand", "От руки", [
      { n: "Крафт", a: "#e2cdaa", b: "#d4b98f", ink: "#2a1f14", accent: "#b8322a", deco: "#f6efe2" },
      { n: "Блокнот", a: "#f6f3ea", b: "#ece6d6", ink: "#1e1e1e", accent: "#2f5bd3", deco: "#fffdf6" },
      { n: "Газета", a: "#ebe8e1", b: "#dcd8cf", ink: "#1b1b1b", accent: "#e0452b", deco: "#f7f5f0" },
      { n: "Ризограф", a: "#fbe3ea", b: "#f5cfdb", ink: "#2a1a4a", accent: "#2f49c9", deco: "#fff7f9" },
      { n: "Мятная бумага", a: "#e3f1ea", b: "#cfe5da", ink: "#1f2f29", accent: "#e0532f", deco: "#fbfdfb" },
      { n: "Чёрная доска", a: "#2b2b2b", b: "#1a1a1a", ink: "#f4f1ea", accent: "#ffd54a", deco: "#3a3a3a", dark: true },
      { n: "Лимонный зин", a: "#fbf3c8", b: "#f3e6a2", ink: "#1f1c10", accent: "#d6307f", deco: "#fffdf0" },
      { n: "Синька", a: "#dfe7f5", b: "#c9d6ee", ink: "#14234a", accent: "#f05a2d", deco: "#f7f9fd" },
      { n: "Картон", a: "#c9b08c", b: "#b89b74", ink: "#20170e", accent: "#7a1f1f", deco: "#efe4cf" },
      { n: "Сиреневый зин", a: "#ece3f6", b: "#dccdee", ink: "#261a3d", accent: "#1f8a5a", deco: "#fbf8ff" }],
      ["torn", "doodles", "scribbleFrame"], undefined, 2],
    ["t-retro", "Ретро 70-х", [
      { n: "Горчица", a: "#f6e7c1", b: "#efd89a", ink: "#3b2410", accent: "#b04a14", cols: ["#e8a33d", "#d9692b", "#9c4a1f", "#f2c76b"] },
      { n: "Персик", a: "#fde9d9", b: "#f8d2b8", ink: "#4a2414", accent: "#c94a22", cols: ["#f28c4c", "#e85d5d", "#f5b26b", "#ffd59a"] },
      { n: "Розовый", a: "#fde4ea", b: "#f8cbd7", ink: "#4a1830", accent: "#c92a5e", cols: ["#ff6f91", "#ff9671", "#ffc75f", "#f9a8c4"] },
      { n: "Шоколад", a: "#3b2416", b: "#1e120a", ink: "#fbeedd", accent: "#f2a541", cols: ["#f2a541", "#e0612f", "#b8402a", "#f6d38b"], dark: true, radial: true },
      { n: "Оливка", a: "#eef0d8", b: "#dfe3b8", ink: "#2f3313", accent: "#8a5a12", cols: ["#a3a83a", "#e0a030", "#c0602a", "#6f7a2a"] },
      { n: "Лиловый", a: "#efe4f6", b: "#dfcdee", ink: "#33204a", accent: "#b83c0a", cols: ["#9d6ad8", "#f28c8c", "#f6c26b", "#c3a6e8"] },
      { n: "Бирюза", a: "#e2f3ef", b: "#c9e8e1", ink: "#12352e", accent: "#d0552a", cols: ["#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"] },
      { n: "Кирпич", a: "#f4dfd2", b: "#e9c4ad", ink: "#3e1d10", accent: "#a8401c", cols: ["#c75b2a", "#e6a157", "#8c3a1f", "#efc59b"] },
      { n: "Диско", a: "#2a1240", b: "#120720", ink: "#fff0f8", accent: "#ffb84d", cols: ["#ff6fb5", "#ffb84d", "#ff8a3d", "#b56cff"], dark: true, radial: true },
      { n: "Кремовый", a: "#fbf3e4", b: "#f3e2c4", ink: "#2e2112", accent: "#b5541f", cols: ["#e3a14a", "#c9662f", "#8f4a24", "#efc98a"] }],
      ["groovy", "daisies", "rainbowArc"], undefined, 2],
    ["t-boho", "Бохо", [
      { n: "Терракота", a: "#f3e3d3", b: "#e8cdb5", ink: "#3d2216", accent: "#a8492a", cols: ["#c4673f", "#e0a47a", "#8c4a2f", "#e8c4a0"] },
      { n: "Песок", a: "#f5ece0", b: "#eadbc6", ink: "#3a2c1e", accent: "#9c6a3a", cols: ["#d6a77a", "#b98b5e", "#e8cfae", "#8f6a4a"] },
      { n: "Шалфей", a: "#e9ece2", b: "#d8decb", ink: "#2c3326", accent: "#5f6f48", cols: ["#9aaa86", "#c9b48f", "#d98f6a", "#6f7f58"] },
      { n: "Ржавчина", a: "#5a2a1a", b: "#2e140b", ink: "#fbeee2", accent: "#e8b48a", cols: ["#c4673f", "#e8b48a", "#d9a066", "#9c4a2f"], dark: true, radial: true },
      { n: "Пыльная роза", a: "#f4e2dd", b: "#e9cbc3", ink: "#45261f", accent: "#a85b4a", cols: ["#d4948a", "#e8bfa8", "#b07060", "#c9a090"] },
      { n: "Горчица", a: "#f5e8c8", b: "#ead6a6", ink: "#3a2c0e", accent: "#9a6a14", cols: ["#d9a43a", "#c4673f", "#8a9a6a", "#e8cf8f"] },
      { n: "Глина", a: "#e6d5c6", b: "#d6bfac", ink: "#33241a", accent: "#7a4a30", cols: ["#b07a5a", "#d9b096", "#8a5a40", "#c9a080"] },
      { n: "Олива", a: "#3a3a24", b: "#1c1c10", ink: "#f4efdf", accent: "#e0c48a", cols: ["#c9a96a", "#a3a85a", "#d98f5a", "#e8d8a8"], dark: true, radial: true },
      { n: "Охра", a: "#f7e9d2", b: "#eed4ab", ink: "#3e2a10", accent: "#a8641a", cols: ["#e09a3a", "#c46a2a", "#f2c98a", "#8a5a2a"] },
      { n: "Молочный", a: "#faf6ef", b: "#efe6d8", ink: "#3a3026", accent: "#a0644a", cols: ["#d9b8a0", "#c49a7a", "#e8d5c0", "#a8826a"] }],
      ["bohoRainbow", "bohoSun", "mudcloth"], undefined, 2],
  ]);
})();
