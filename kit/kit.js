// Общие части всех разделов: профиль мастера, форматы, шрифты, шапка и подвал картинки, панели «Дизайн», «Шрифты», «Контакты».
// Подключать после backgrounds.js.
(function () {
  const Kit = window.Kit;
  const { A, mix, METAL, paintOn, solid, rr } = Kit;

  const W = 1080, SCALE = 2;
  const FORMATS = {
    story: { name: "Сторис 9:16", h: 1920, top: 150, bottom: 130, qr: 250 },
    post:  { name: "Пост 4:5",   h: 1350, top: 80,  bottom: 80,  qr: 200 },
  };
  const FONTS = ["Montserrat", "Raleway", "Manrope", "Nunito", "Comfortaa", "Oswald", "Playfair Display", "Cormorant Garamond",
    "Lora", "Prata", "Forum", "Poiret One", "Marck Script", "Bad Script", "Caveat", "Lobster", "Amatic SC"];
  const SCRIPTS = new Set(["Marck Script", "Bad Script", "Caveat", "Lobster", "Amatic SC"]);
  const SOCIALS = [
    { k: "wa", name: "WhatsApp", ph: "номер, если не тот же" },
    { k: "tg", name: "Telegram", ph: "@ник или t.me/…" },
    { k: "ig", name: "Instagram", ph: "@ник" },
    { k: "max", name: "MAX", ph: "ссылка или номер" },
  ];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  // оформление сайта: светлая / тёмная / комбинированная; без выбора — как в системе
  function uiTheme() {
    const head = document.querySelector("header.top"); if (!head) return;
    const cur = () => store.get("beauty.ui") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const box = document.createElement("div");
    box.className = "uiswitch"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Оформление");
    box.innerHTML = '<button type="button" data-k="light">Светлая</button><button type="button" data-k="dark">Тёмная</button><button type="button" data-k="mix">Комбинированная</button>';
    const apply = () => { document.documentElement.dataset.ui = cur(); box.querySelectorAll("[data-k]").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === cur())); };
    box.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { store.set("beauty.ui", b.dataset.k); apply(); } });
    head.append(box);
    if (store.get("beauty.ui")) apply(); else box.querySelectorAll("[data-k]").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === cur()));
  }
  const loadJSON = k => { try { return JSON.parse(store.get(k)); } catch (e) { return null; } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- телефон и ссылки ----------
  const digits = s => (s || "").replace(/\D/g, "");
  function normPhone(s) {                                       // → 79001234567 или ""
    let d = digits(s);
    if (d.length === 10) d = "7" + d;
    if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1);
    return d.length === 11 && d[0] === "7" ? d : "";
  }
  function fmtPhone(s) {
    const d = normPhone(s);
    return d ? `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}` : (s || "").trim();
  }
  function maskPhone(v, deleting) {                             // маска +7 (999) 999-99-99 прямо при вводе
    let d = digits(v);
    if (/^\s*\+?7/.test(v || "") || /^[78]/.test(d)) d = d.slice(1);
    d = d.slice(0, 10);
    if (!d) return deleting || !digits(v) ? "" : "+7 (";
    let s = "+7 (" + d.slice(0, 3);
    if (d.length > 3) s += ") " + d.slice(3, 6);
    if (d.length > 6) s += "-" + d.slice(6, 8);
    if (d.length > 8) s += "-" + d.slice(8, 10);
    return s;
  }
  const group = n => n.replace(/\B(?=(\d{3})+(?!\d))/g, " ");        // 3000 → 3 000 (неразрывный пробел)
  const handle = (v, host) => {
    const m = v.match(new RegExp(host.replace(".", "\\.") + "/([^/?#]+)"));
    if (m) return "@" + m[1];
    return /^https?:/i.test(v) ? v.replace(/^https?:\/\/(www\.)?/i, "") : "@" + v.replace(/^@/, "");
  };
  function socText(p, k) {
    const v = p.soc[k].val.trim();
    if (k === "wa") return fmtPhone(v || p.phone) || "WhatsApp";
    if (k === "tg") return v ? handle(v, "t.me") : "@ник";
    if (k === "ig") return v ? handle(v, "instagram.com") : "@ник";
    return v ? (/^https?:/i.test(v) ? v.replace(/^https?:\/\/(www\.)?/i, "") : fmtPhone(v)) : (fmtPhone(p.phone) || "MAX");
  }
  function qrTarget(p) {                                        // ссылка для QR или подсказка, чего не хватает
    const v = k => p.soc[k].val.trim(), user = s => s.replace(/^@/, "");
    switch (p.qr) {
      case "wa": { const d = normPhone(v("wa") || p.phone); return d ? { url: "https://wa.me/" + d, cap: "WhatsApp" } : { need: "Укажите телефон, чтобы QR вёл в WhatsApp." }; }
      case "tg": return v("tg") ? { url: /^https?:/i.test(v("tg")) ? v("tg") : "https://t.me/" + user(v("tg")), cap: "Telegram" } : { need: "Включите Telegram и впишите ник." };
      case "ig": return v("ig") ? { url: /^https?:/i.test(v("ig")) ? v("ig") : "https://instagram.com/" + user(v("ig")), cap: "Instagram" } : { need: "Включите Instagram и впишите ник." };
      case "max": return /^https?:/i.test(v("max")) ? { url: v("max"), cap: "MAX" } : { need: "Для QR вставьте в поле MAX ссылку на профиль (https://…)." };
      case "url": {
        const u = p.qrUrl.trim();
        if (!u) return { need: "Вставьте ссылку для QR-кода." };
        const url = /^https?:/i.test(u) ? u : "https://" + u;
        let cap = url; try { cap = new URL(url).hostname.replace(/^www\./, ""); } catch (e) {}
        return { url, cap };
      }
    }
    return {};
  }

  // ---------- профиль мастера: один на все разделы ----------
  const PROFILE_KEY = "beauty.profile";
  // кабинет по умолчанию — Лариса (заказчица); пустой профиль заполняется её данными
  const PRESET = { master: "Лариса Чурилова", phone: "+7 (906) 091-85-93", email: "", showEmail: false,
    soc: { wa: { on: false, val: "" }, tg: { on: true, val: "@Lara_lashes" }, ig: { on: false, val: "" }, max: { on: false, val: "" } },
    socLayout: "row", qr: "tg", qrUrl: "" };
  function loadProfile() {
    const p = { master: "", phone: "", email: "", showEmail: false, soc: { wa: { on: false, val: "" }, tg: { on: false, val: "" }, ig: { on: false, val: "" }, max: { on: false, val: "" } },
      socLayout: "row", qr: "none", qrUrl: "" };
    let saved = loadJSON(PROFILE_KEY) || loadJSON("price.v1");     // прайс до появления профиля хранил контакты у себя
    if (!saved || (!(saved.master || "").trim() && !digits(saved.phone))) saved = PRESET;
    ["master", "phone", "email", "socLayout", "qr", "qrUrl"].forEach(k => { if (typeof saved[k] === "string") p[k] = saved[k]; });
    p.showEmail = !!saved.showEmail;
    if (saved.soc) SOCIALS.forEach(({ k }) => { if (saved.soc[k]) p.soc[k] = { on: !!saved.soc[k].on, val: saved.soc[k].val || "" }; });
    p.phone = maskPhone(p.phone);
    return p;
  }
  const saveProfile = p => store.set(PROFILE_KEY, JSON.stringify(p));

  // ---------- стили текста ----------
  function baseStyle(k, t) {                                    // общие элементы; разделы дополняют своими
    switch (k) {
      case "title": return t.title === "script" ? { font: "Marck Script", weight: 400, italic: false, caps: false, color: t.accent } : { font: "Cormorant Garamond", weight: 600, italic: false, caps: true, color: t.accent };
      case "subtitle": return { font: "Montserrat", weight: 500, italic: false, caps: true, color: t.muted };
      case "master": return { font: "Cormorant Garamond", weight: 500, italic: true, caps: false, color: t.ink };
      case "contacts": return { font: "Montserrat", weight: 500, italic: false, caps: false, color: t.ink };
    }
    return { font: "Montserrat", weight: 400, italic: false, caps: false, color: t.ink };
  }
  function styleOf(over, k, t, base) {                          // базовый стиль дизайна + правки пользователя
    const b = (base && base(k, t)) || baseStyle(k, t), o = (over || {})[k] || {};
    return {
      font: o.font || b.font, italic: o.italic ?? b.italic, caps: o.caps ?? b.caps, color: o.color || b.color,
      weight: o.bold == null ? b.weight : (o.bold ? 700 : 400), bold: o.bold ?? b.weight >= 600, size: (o.size || 100) / 100, overBold: o.bold != null,
    };
  }
  const fontOf = (s, px, weight) => `${s.italic ? "italic " : ""}${weight || s.weight} ${px.toFixed(1)}px "${s.font}"`;
  const caseOf = (s, text) => s.caps ? text.toUpperCase() : text;

  // ---------- рисование на холсте ----------
  const ICONS = {                                               // свои простые значки, не логотипы
    phone: ["M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"],
    wa: ["M3.2 20.8l1.4-4.3A8.7 8.7 0 1 1 7.6 19.5z", "M9 8.2c.2 3.4 3.4 6.6 6.8 6.8l1.2-1.6-2.2-1.1-1 .9a5.2 5.2 0 0 1-2.9-2.9l.9-1-1.1-2.2z"],
    tg: ["M21.4 3.6 2.9 10.8c-.9.4-.8 1.6.1 1.9l4.6 1.4 1.7 5.6c.2.7 1.1.9 1.6.4l2.6-2.5 4.7 3.5c.6.4 1.5.1 1.6-.6l2.9-15.6c.2-.9-.6-1.6-1.4-1.3z", "M7.6 14.1l9.6-6.6-6.5 7.5"],
    ig: ["M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10a4.5 4.5 0 0 1-4.5 4.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5z", "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z", "M17.5 6.3v.1"],
    max: ["M12 2.5a9.5 9.5 0 1 1-4.4 17.9L3 21.5l1.2-4.3A9.5 9.5 0 0 1 12 2.5z", "M8 15V9l4 4 4-4v6"],
    mail: ["M3.5 5.5h17a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z", "M3 6.5l9 7 9-7"],
  };
  function painter(ctx) {
    const paint = (fill, x0, x1) => paintOn(ctx, fill, x0, x1);
    const sized = (font, k) => font.replace(/(\d+(?:\.\d+)?)px/, (_, n) => (n * k).toFixed(1) + "px");
    function spaced(text, cx, y, font, spacing, fill, maxW) {   // разрядка вручную — работает во всех браузерах
      ctx.font = font;
      const chars = [...text];
      const width = () => chars.reduce((a, c) => a + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
      let total = width();
      if (maxW && total > maxW) { const k = maxW / total; ctx.font = sized(font, k); spacing *= k; total = width(); }
      let x = cx - total / 2;
      ctx.fillStyle = paint(fill, x, x + total); ctx.textAlign = "left";
      chars.forEach(c => { ctx.fillText(c, x, y); x += ctx.measureText(c).width + spacing; });
    }
    function centered(text, cx, y, font, fill, maxW) {
      ctx.font = font;
      let w = ctx.measureText(text).width;
      if (maxW && w > maxW) { ctx.font = sized(font, maxW / w); w = ctx.measureText(text).width; }
      ctx.textAlign = "left"; ctx.fillStyle = paint(fill, cx - w / 2, cx + w / 2);
      ctx.fillText(text, cx - w / 2, y);
    }
    function wrap(text, maxW) {
      const words = text.trim().split(/\s+/), lines = [];
      let cur = "";
      words.forEach(w => {
        const t = cur ? cur + " " + w : w;
        if (cur && ctx.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t;
      });
      if (cur) lines.push(cur);
      return lines;
    }
    function icon(name, x, y, size, color) {
      ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
      ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ICONS[name].forEach(d => ctx.stroke(new Path2D(d)));
      ctx.restore();
    }
    function ornament(cx, y, t) {
      ctx.strokeStyle = paint(t.accent, cx - 130, cx + 130); ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - 130, y); ctx.lineTo(cx - 16, y); ctx.moveTo(cx + 16, y); ctx.lineTo(cx + 130, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, y - 7); ctx.lineTo(cx + 7, y); ctx.lineTo(cx, y + 7); ctx.lineTo(cx - 7, y); ctx.closePath(); ctx.fill();
    }
    function drawQr(url, x, y, size, t) {
      const g = ctx.createLinearGradient(x, y, x + size, y + size);
      g.addColorStop(0, t.qrTile[0]); g.addColorStop(1, t.qrTile[1]);
      ctx.fillStyle = g; rr(ctx, x, y, size, size, 16); ctx.fill();
      if (typeof qrcode !== "function") return;
      const q = qrcode(0, "M"); q.addData(url); q.make();
      const n = q.getModuleCount(), pad = size * .07, m = (size - pad * 2) / n;
      ctx.fillStyle = t.qrInk;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect(x + pad + c * m, y + pad + r * m, m + .03, m + .03);
    }
    function watermark(t, H) {
      ctx.save(); ctx.globalAlpha = t.mark; ctx.fillStyle = t.ink; ctx.font = '600 104px "Montserrat"'; ctx.textAlign = "center";
      ctx.translate(W / 2, H / 2); ctx.rotate(-.5);
      for (let y = -H, row = 0; y < H; y += 300, row++) for (let x = -W * 1.5 + (row % 2) * 330; x < W * 1.5; x += 660) ctx.fillText("ОБРАЗЕЦ", x, y);
      ctx.restore();
    }
    return { ctx, paint, sized, spaced, centered, wrap, icon, ornament, drawQr, watermark };
  }

  // шапка: заголовок, подзаголовок, имя мастера, орнамент; возвращает y под орнаментом
  function header(dr, t, F, texts, style) {
    const cw = W - 2 * 96, k = F === FORMATS.story ? 1 : .86;     // в посте шапка чуть меньше
    let y = F.top;
    const st = style("title"), title = caseOf(st, texts.title.trim() || texts.titleDefault);
    const tpx = (SCRIPTS.has(st.font) ? 128 : 84) * k * st.size;
    if (st.caps && !SCRIPTS.has(st.font)) { y += tpx * .93; dr.spaced(title, W / 2, y, fontOf(st, tpx), 10 * k * st.size, st.color, cw * k); y += 18; }
    else { y += tpx * .81; dr.centered(title, W / 2, y, fontOf(st, tpx), st.color, cw * k); y += 24; }
    const ss = style("subtitle"), spx = 24 * ss.size;
    if (texts.subtitle.trim()) { y += 26 + spx; dr.spaced(caseOf(ss, texts.subtitle.trim()), W / 2, y, fontOf(ss, spx), ss.caps ? 6 * ss.size : 0, ss.color, cw); }
    const sm = style("master"), mpx = 54 * sm.size;
    y += 18 + mpx; dr.centered(caseOf(sm, texts.master.trim() || "Имя мастера"), W / 2, y, fontOf(sm, mpx), texts.master.trim() ? sm.color : t.muted, cw);
    y += 48; dr.ornament(W / 2, y, t);
    return y;
  }

  // подвал: телефон, соцсети, QR; считает высоту и умеет себя нарисовать
  function footer(dr, t, F, prof, style) {
    const ctx = dr.ctx, P = 96, story = F === FORMATS.story, st = style("contacts"), iconCol = c => (c === t.ink ? solid(t.accent) : solid(c));
    const phoneSize = (story ? 44 : 38) * st.size, socSize = (story ? 32 : 28) * st.size;
    const socWeight = st.overBold ? st.weight : 400;
    const phone = { icon: "phone", text: fmtPhone(prof.phone) || "+7 (999) 999-99-99", size: phoneSize, weight: st.weight, color: prof.phone ? st.color : t.muted };
    const socs = SOCIALS.filter(s => prof.soc[s.k].on).map(s => ({ icon: s.k, text: socText(prof, s.k), size: socSize, weight: socWeight, color: st.color }));
    if (prof.showEmail && (prof.email || "").trim()) socs.push({ icon: "mail", text: prof.email.trim(), size: socSize, weight: socWeight, color: st.color });
    const qr = qrTarget(prof), qs = F.qr, capH = 46, colW = qr.url ? W - 2 * P - qs - 44 : W - 2 * P;
    const itemW = it => { ctx.font = fontOf(st, it.size, it.weight); return it.size * 1.3 + ctx.measureText(caseOf(st, it.text)).width; };
    const lines = [[phone]];                                    // строки подвала: телефон, потом соцсети
    if (prof.socLayout === "col") socs.forEach(s => lines.push([s]));
    else {
      let cur = [], w = 0;
      socs.forEach(s => { const sw = itemW(s); if (cur.length && w + 34 + sw > colW) { lines.push(cur); cur = []; w = 0; } w += (cur.length ? 34 : 0) + sw; cur.push(s); });
      if (cur.length) lines.push(cur);
    }
    const lh = l => l[0].size * 1.65, textH = lines.reduce((a, l) => a + lh(l), 0) - lines[lines.length - 1][0].size * .65;
    const h = Math.max(textH, qr.url ? qs + capH : 0);
    return { h, draw(top) {
      let y = top + (h - textH) / 2;
      lines.forEach(line => {
        const base = y + line[0].size;
        const total = line.reduce((a, it) => a + itemW(it), 0) + 34 * (line.length - 1), k = total > colW ? colW / total : 1;
        let x = qr.url ? P : W / 2 - total * k / 2;
        line.forEach(it => {
          const size = it.size * k, iw = size * .9, text = caseOf(st, it.text);
          ctx.font = fontOf(st, size, it.weight);
          dr.icon(it.icon, x, base - size * .82, iw, iconCol(it.color));
          ctx.fillStyle = dr.paint(it.color, x, x + 400); ctx.textAlign = "left"; ctx.fillText(text, x + size * 1.3, base);
          x += size * 1.3 + ctx.measureText(text).width + 34 * k;
        });
        y += lh(line);
      });
      if (qr.url) {
        const qx = W - P - qs, qy = top + (h - qs - capH) / 2;
        dr.drawQr(qr.url, qx, qy, qs, t);
        dr.centered(qr.cap, qx + qs / 2, qy + qs + 36, '500 24px "Montserrat"', t.muted, qs + 40);
      }
    } };
  }

  // ---------- панели формы ----------
  const press = (box, key) => box.querySelectorAll("[data-k]").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === key));

  function tabs(nav, storeKey, onShow) {                        // вкладки: кнопки data-tab в nav, панели .tab[data-tab]
    let cur = store.get(storeKey) || nav.querySelector("[data-tab]").dataset.tab;
    function show(name) {
      cur = name; store.set(storeKey, name);
      nav.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === name));
      document.querySelectorAll(".tab").forEach(s => s.hidden = s.dataset.tab !== name);
      onShow && onShow(name);
    }
    nav.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) show(b.dataset.tab); });
    return { show, get current() { return cur; } };
  }

  // «Дизайн»: формат, категории фонов и миниатюры; state.theme / state.format
  function designPanel(root, state, onChange) {
    root.innerHTML = `<section class="group"><h2>Формат</h2><div class="seg" data-role="formats"></div></section>
      <section class="group"><h2>Фон</h2><div class="cats" data-role="cats"></div><div class="thumbs" data-role="thumbs"></div><span class="hint" data-role="name"></span></section>`;
    const $r = r => root.querySelector(`[data-role="${r}"]`);
    let cat = (Kit.CATS.find(c => c.items.some(t => t.id === state.theme)) || Kit.CATS[0]).id;
    $r("formats").innerHTML = Object.entries(FORMATS).map(([k, f]) => `<button type="button" data-k="${k}">${f.name}</button>`).join("");
    press($r("formats"), state.format);
    $r("cats").innerHTML = Kit.CATS.map(c => `<button type="button" class="chip" data-k="${c.id}">${c.name} <span>${c.items.length}</span></button>`).join("");
    press($r("cats"), cat);
    const total = Kit.CATS.reduce((a, c) => a + c.items.length, 0);
    const name = () => $r("name").textContent = `Выбрано: ${(Kit.THEMES[state.theme] || {}).name || "—"} · всего фонов: ${total}`;
    function thumbs() {
      const c = Kit.CATS.find(x => x.id === cat), TW = 1080, TH = 1920, px = 96 * 2;
      $r("thumbs").innerHTML = c.items.map(t => `<button type="button" class="thumb" data-id="${t.id}" title="${esc(t.name)}" aria-label="${esc(t.name)}" aria-pressed="${t.id === state.theme}"><canvas width="${px}" height="${Math.round(px * TH / TW)}"></canvas></button>`).join("");
      $r("thumbs").querySelectorAll(".thumb").forEach(b => {
        const t = Kit.THEMES[b.dataset.id], cv = b.querySelector("canvas"), c2 = cv.getContext("2d");
        c2.setTransform(cv.width / TW, 0, 0, cv.width / TW, 0, 0); Kit.drawBg(c2, t, TW, TH);
        c2.fillStyle = paintOn(c2, t.accent, 300, 780); c2.fillRect(300, 190, 480, 70);   // условный заголовок и строки
        c2.fillStyle = A(t.ink, .75);
        for (let i = 0; i < 7; i++) c2.fillRect(140, 560 + i * 120, 360 + (i * 97 % 160), 26);
        c2.fillStyle = paintOn(c2, t.accent, 760, 940);
        for (let i = 0; i < 7; i++) c2.fillRect(780, 560 + i * 120, 160, 26);
        c2.fillStyle = A(t.ink, .6); c2.fillRect(140, 1620, 420, 34);
      });
      name();
    }
    $r("formats").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; state.format = b.dataset.k; press($r("formats"), state.format); onChange("format"); });
    $r("cats").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; cat = b.dataset.k; press($r("cats"), cat); thumbs(); });
    $r("thumbs").addEventListener("click", e => {
      const b = e.target.closest(".thumb"); if (!b) return;
      state.theme = b.dataset.id; $r("thumbs").querySelectorAll(".thumb").forEach(x => x.setAttribute("aria-pressed", x === b));
      name(); onChange("theme");
    });
    return { show: thumbs };
  }

  // «Шрифты»: для каждого элемента — шрифт, цвет, размер, Ж/К/АА; state.text
  function fontsPanel(root, items, state, styleFn, onChange) {
    root.innerHTML = `<section class="group">
        <div class="thead"><h2>Шрифты и размер</h2><button type="button" class="linkbtn" data-act="resetAll">сбросить всё</button></div>
        <span class="hint">«Как в дизайне» — шрифт подбирается под выбранный фон. Длинные списки сами уменьшаются, если не влезают.</span>
        <div data-role="list"></div></section>`;
    const list = root.querySelector('[data-role="list"]');
    function build() {
      list.innerHTML = items.map(({ k, name }) => {
        const s = styleFn(k), o = state.text[k] || {}, col = /^#[0-9a-f]{6}$/i.test(solid(s.color)) ? solid(s.color) : "#888888";
        return `<div class="tstyle" data-k="${k}">
          <div class="thead"><span>${name}</span><button type="button" class="linkbtn" data-act="reset">сбросить</button></div>
          <div class="trow">
            <select class="tfont" aria-label="Шрифт: ${name}"><option value="">Как в дизайне (${s.font})</option>${FONTS.map(f => `<option value="${f}" ${o.font === f ? "selected" : ""} style="font-family:'${f}'">${f}</option>`).join("")}</select>
            <input type="color" class="tcolor" value="${col}" aria-label="Цвет: ${name}" title="Цвет">
          </div>
          <div class="trow">
            <input type="range" class="tsize" min="60" max="160" step="5" value="${o.size || 100}" aria-label="Размер: ${name}">
            <span class="tval">${o.size || 100}%</span>
            <button type="button" class="tog" data-p="bold" aria-pressed="${s.bold}" title="Жирный"><b>Ж</b></button>
            <button type="button" class="tog" data-p="italic" aria-pressed="${s.italic}" title="Курсив"><i>К</i></button>
            <button type="button" class="tog" data-p="caps" aria-pressed="${s.caps}" title="Заглавные буквы">АА</button>
          </div>
        </div>`;
      }).join("");
    }
    const textOf = el => { const k = el.closest(".tstyle").dataset.k; state.text[k] = state.text[k] || {}; return [k, state.text[k]]; };
    const loadFont = k => document.fonts.load(fontOf(styleFn(k), 40), "Прайс 123").catch(() => {}).then(() => onChange("font"));
    list.addEventListener("input", e => {
      if (!e.target.closest(".tstyle")) return;
      const [, o] = textOf(e.target);
      if (e.target.classList.contains("tsize")) { o.size = +e.target.value; e.target.nextElementSibling.textContent = o.size + "%"; }
      if (e.target.classList.contains("tcolor")) o.color = e.target.value;
      onChange("text");
    });
    list.addEventListener("change", e => {
      if (!e.target.classList.contains("tfont")) return;
      const [k, o] = textOf(e.target); o.font = e.target.value; loadFont(k);
    });
    root.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "resetAll") { state.text = {}; build(); onChange("text"); return; }
      if (!b.closest(".tstyle")) return;
      const [k, o] = textOf(b);
      if (b.dataset.act === "reset") { delete state.text[k]; build(); onChange("text"); return; }
      const p = b.dataset.p; o[p] = !styleFn(k)[p]; b.setAttribute("aria-pressed", o[p]); loadFont(k);
    });
    build();
    return { refresh: build, fontsInUse: () => items.map(({ k }) => fontOf(styleFn(k), 40)) };
  }

  // «Мастер и контакты»: общий профиль для всех разделов
  function contactsPanel(root, prof, onChange) {
    root.innerHTML = `<section class="group">
      <h2>Мастер и контакты</h2>
      <span class="hint">Общие для всех разделов — заполняются один раз.</span>
      <div class="field"><label for="k-master" class="req">Имя мастера</label><input id="k-master" type="text" maxlength="40" placeholder="Например, Лариса Чурилова"></div>
      <div class="field"><label for="k-phone" class="req">Телефон</label><input id="k-phone" type="tel" inputmode="tel" placeholder="+7 (999) 999-99-99" maxlength="18"></div>
      <div class="field"><label for="k-email">Почта</label><input id="k-email" type="email" inputmode="email" autocomplete="email" placeholder="name@mail.ru">
        <label class="check"><input type="checkbox" id="k-showEmail"> показывать почту на картинке</label></div>
      <span class="lbl">Соцсети — любые или ни одной</span>
      <div class="socchips" data-role="chips"></div>
      <div class="svcs" data-role="socs"></div>
      <div class="field"><span class="lbl">Соцсети на картинке</span>
        <div class="seg" data-role="layout"><button type="button" data-k="row">В строку</button><button type="button" data-k="col">Столбиком</button></div></div>
      <div class="field"><label for="k-qr">QR-код на картинке</label>
        <select id="k-qr"><option value="none">Без QR-кода</option><option value="wa">WhatsApp</option><option value="tg">Telegram</option>
        <option value="ig">Instagram</option><option value="max">MAX</option><option value="url">Своя ссылка</option></select></div>
      <input id="k-qrUrl" type="url" placeholder="https://…" aria-label="Ссылка для QR-кода">
      <span class="hint" data-role="qrHint"></span></section>`;
    const $r = r => root.querySelector(`[data-role="${r}"]`), $i = id => root.querySelector("#k-" + id);
    const changed = () => { saveProfile(prof); refresh(); onChange("profile"); };
    function socs() {
      $r("chips").innerHTML = SOCIALS.map(s => `<button type="button" class="chip" data-k="${s.k}" aria-pressed="${prof.soc[s.k].on}">${s.name}</button>`).join("");
      $r("socs").innerHTML = SOCIALS.filter(s => prof.soc[s.k].on).map(s => `<div class="socin">
          <label for="k-soc-${s.k}">${s.name}</label>
          <input type="${s.k === "wa" ? "tel" : "text"}" id="k-soc-${s.k}" data-k="${s.k}" value="${esc(prof.soc[s.k].val)}" placeholder="${s.ph}" ${s.k === "wa" ? 'inputmode="tel" maxlength="18"' : ""}>
        </div>`).join("");
      press($r("layout"), prof.socLayout);
    }
    function refresh() { $i("qrUrl").hidden = prof.qr !== "url"; $r("qrHint").textContent = qrTarget(prof).need || ""; }
    const deleting = e => (e.inputType || "").startsWith("delete");
    $i("master").value = prof.master; $i("phone").value = prof.phone; $i("email").value = prof.email; $i("showEmail").checked = prof.showEmail;
    $i("email").addEventListener("input", e => { prof.email = e.target.value; changed(); });
    $i("showEmail").addEventListener("change", e => { prof.showEmail = e.target.checked; changed(); }); $i("qr").value = prof.qr; $i("qrUrl").value = prof.qrUrl;
    $i("master").addEventListener("input", e => { prof.master = e.target.value; changed(); });
    $i("phone").addEventListener("input", e => { e.target.value = maskPhone(e.target.value, deleting(e)); prof.phone = e.target.value; changed(); });
    $i("qr").addEventListener("change", e => { prof.qr = e.target.value; changed(); if (prof.qr === "url") $i("qrUrl").focus(); });
    $i("qrUrl").addEventListener("input", e => { prof.qrUrl = e.target.value; changed(); });
    $r("chips").addEventListener("click", e => {
      const b = e.target.closest("[data-k]"); if (!b) return;
      const k = b.dataset.k; prof.soc[k].on = !prof.soc[k].on; socs(); changed();
      if (prof.soc[k].on) $i("soc-" + k).focus();
    });
    $r("socs").addEventListener("input", e => {
      const k = e.target.dataset.k; if (!k) return;
      if (k === "wa") e.target.value = maskPhone(e.target.value, deleting(e));
      prof.soc[k].val = e.target.value; changed();
    });
    $r("layout").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; prof.socLayout = b.dataset.k; press($r("layout"), prof.socLayout); changed(); });
    socs(); refresh();
    return { focus: id => { const el = $i(id); if (el) el.focus(); } };
  }

  // кнопки «Скачать» и «Отправить»
  function output({ download, share, status }, canvas, draw, fileName, ready) {
    const setStatus = (text, kind) => { status.textContent = text; status.className = "status" + (kind ? " " + kind : ""); };
    const blobNow = async () => {                               // ждём шрифты, иначе в картинку попадёт запасной
      await document.fonts.ready; draw();
      return new Promise(r => canvas.toBlob(r, "image/png"));
    };
    download.addEventListener("click", async () => {
      const err = ready(); if (err) return setStatus(err, "err");
      const b = await blobNow(), a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = fileName(); document.body.append(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      setStatus("Картинка сохранена.", "ok");
    });
    share.hidden = !(navigator.canShare && navigator.canShare({ files: [new File([new Blob(["x"])], "x.png", { type: "image/png" })] }));
    share.addEventListener("click", async () => {
      const err = ready(); if (err) return setStatus(err, "err");
      try { await navigator.share({ files: [new File([await blobNow()], fileName(), { type: "image/png" })] }); setStatus(""); }
      catch (e) { if (e && e.name !== "AbortError") setStatus("Отправить не получилось — скачайте картинку.", "err"); }
    });
    return { setStatus };
  }
  // общая проверка профиля перед сохранением картинки; возвращает текст ошибки или ""
  function profileError(prof) {
    if (!prof.master.trim()) return "Укажите имя мастера.";
    if (!normPhone(prof.phone)) return "Укажите телефон полностью: +7 (999) 999-99-99.";
    return "";
  }
  const safeName = s => s.trim().replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_") || "мастер";

  uiTheme();

  Object.assign(Kit, {
    W, SCALE, FORMATS, FONTS, SCRIPTS, SOCIALS, store, loadJSON, esc,
    digits, normPhone, fmtPhone, maskPhone, group, socText, qrTarget, loadProfile, saveProfile,
    baseStyle, styleOf, fontOf, caseOf, painter, header, footer, press,
    tabs, designPanel, fontsPanel, contactsPanel, output, profileError, safeName, PRESET,
  });
})();
