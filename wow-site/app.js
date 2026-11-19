(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const canvas = $('#universe');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const themes = [
    { name: 'NEBULA', primary: '#ad94ff', secondary: '#8cf2e5', core: '#8d6de8', dark: '#1d1644', rgb: [173, 148, 255], extra: [140, 242, 229], chords: [110, 164.81, 220] },
    { name: 'SOLAR', primary: '#ffad84', secondary: '#ffdfb7', core: '#ff8b67', dark: '#581b32', rgb: [255, 171, 125], extra: [255, 216, 174], chords: [130.81, 196, 261.63] },
    { name: 'ABYSS', primary: '#65c9ff', secondary: '#8be8ff', core: '#398ce0', dark: '#082b50', rgb: [97, 198, 255], extra: [125, 228, 255], chords: [98, 146.83, 196] },
    { name: 'ZEN', primary: '#b4eba0', secondary: '#e2edb1', core: '#72b996', dark: '#15392c', rgb: [169, 235, 157], extra: [229, 237, 177], chords: [123.47, 185, 246.94] },
    { name: 'CHAOS', primary: '#ff74c4', secondary: '#e5fb7d', core: '#ea55a4', dark: '#4d103f', rgb: [255, 108, 192], extra: [233, 250, 126], chords: [116.54, 174.61, 233.08] }
  ];
  const surpriseWords = ['Antimadde', 'Rüya', 'Sonsuzluk', 'Paradox', 'Yıldız Tozu', 'Utopia', 'Eclipse', 'Başka Bir Dünya', 'Zamansızlık', 'Aurora', 'Özgürlük', 'Bilinmeyen', 'Kaos', 'Bir İhtimal', 'Mucize', 'Yarın'];
  const state = {
    word: 'Sonsuzluk', themeIndex: 0, density: 64, hash: 1,
    stars: [], dust: [], meteors: [], pulses: [], bursts: [],
    pointer: { x: -2000, y: -2000, vx: 0, vy: 0 },
    center: { x: 0, y: 0, r: 180 },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    audio: null, soundOn: false, width: 0, height: 0, dpr: 1,
    time: 0, lastFrame: 0, changeMoment: 0, special: false
  };
  let toastTimer;
  let resizeObserver;
  let raf;

  function rgb(arr, alpha = 1) { return `rgba(${arr[0]},${arr[1]},${arr[2]},${alpha})`; }
  function hashString(str) {
    let h = 2166136261;
    for (const char of str.normalize('NFKC').toLocaleLowerCase('tr-TR')) {
      h ^= char.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function randomGen(seed) {
    let n = seed >>> 0;
    return () => {
      n += 0x6D2B79F5;
      let t = n;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = (min, max) => Math.random() * (max - min) + min;

  function buildUniverse() {
    const r = randomGen(state.hash + state.themeIndex * 14579 + state.density * 43);
    const count = Math.round(90 + state.density * 3.3);
    state.stars = Array.from({ length: count }, () => ({
      x: r(), y: r(), size: .4 + Math.pow(r(), 4) * 2.1,
      phase: r() * Math.PI * 2, speed: .25 + r() * .9, layer: .2 + r() * .8,
      twinkle: r() > .9, tint: r()
    }));
    state.dust = Array.from({ length: Math.round(110 + state.density * 2.4) }, () => ({
      angle: r() * Math.PI * 2, orbit: .9 + Math.pow(r(), .8) * 1.03,
      size: .5 + r() * 1.5, speed: (.04 + r() * .13) * (r() < .2 ? -1 : 1),
      elevation: .22 + r() * .21, opacity: .2 + r() * .75,
      tint: r()
    }));
    state.meteors = Array.from({ length: 6 }, () => ({ x: r(), y: r(), speed: .2 + r() * .4, phase: r() * 100 }));
    $('#star-count').textContent = count.toLocaleString('tr-TR');
  }

  function updateLayout() {
    const hero = $('.hero');
    const planet = $('#planet-target');
    const heroBox = hero.getBoundingClientRect();
    const box = planet.getBoundingClientRect();
    const width = window.innerWidth;
    const height = hero.offsetHeight;
    state.width = width;
    state.height = height;
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * state.dpr);
    canvas.height = Math.round(height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.center.x = box.left + box.width / 2;
    state.center.y = box.top - heroBox.top + box.height / 2;
    state.center.r = Math.min(box.width, box.height) * .323;
    draw(performance.now());
  }

  function backdrop(g, w, h, t, theme) {
    g.fillStyle = '#070711';
    g.fillRect(0, 0, w, h);
    const nebulae = [
      { x: .70, y: .50, r: .42, c: theme.rgb, a: .18 },
      { x: .91, y: .23, r: .35, c: theme.extra, a: .11 },
      { x: .44, y: 1.02, r: .51, c: theme.rgb, a: .055 },
      { x: .12, y: .15, r: .46, c: theme.extra, a: .035 }
    ];
    for (const neb of nebulae) {
      const x = w * neb.x, y = h * neb.y;
      const radius = Math.max(w, h) * neb.r;
      const grad = g.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, rgb(neb.c, neb.a));
      grad.addColorStop(.32, rgb(neb.c, neb.a * .42));
      grad.addColorStop(1, rgb(neb.c, 0));
      g.fillStyle = grad;
      g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    const vignette = g.createRadialGradient(w * .55, h * .5, h * .18, w * .53, h * .52, Math.max(w, h) * .8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.65)');
    g.fillStyle = vignette;
    g.fillRect(0, 0, w, h);
  }

  function drawStars(g, w, h, t, theme, stars = state.stars) {
    const motion = state.reducedMotion ? 0 : 1;
    for (const s of stars) {
      const x = s.x * w + Math.sin(t * .00013 * s.speed + s.phase) * 10 * s.layer * motion;
      const y = s.y * h + Math.cos(t * .00015 * s.speed + s.phase) * 7 * s.layer * motion;
      const px = state.pointer.x, py = state.pointer.y;
      const distance = Math.hypot(x - px, y - py);
      const warp = distance < 160 && motion ? (1 - distance / 160) * s.layer * 12 : 0;
      const fx = x + (distance ? ((x - px) / distance) * warp : 0);
      const fy = y + (distance ? ((y - py) / distance) * warp : 0);
      const flicker = .68 + .3 * Math.sin(t * .0012 * s.speed + s.phase);
      const alpha = (s.size > 1.4 ? .82 : .35) * flicker;
      g.beginPath();
      g.fillStyle = s.tint < .10 ? rgb(theme.extra, alpha) : `rgba(236,230,255,${alpha})`;
      g.arc(fx, fy, s.size, 0, Math.PI * 2);
      g.fill();
      if (s.twinkle && s.size > 1.65) {
        g.strokeStyle = rgb(theme.extra, alpha * .36);
        g.lineWidth = .6;
        g.beginPath();g.moveTo(fx - 6, fy);g.lineTo(fx + 6, fy);g.moveTo(fx, fy - 6);g.lineTo(fx, fy + 6);g.stroke();
      }
    }
  }

  function ring(g, cx, cy, rx, ry, rotation, theme, alpha = 1, width = 1) {
    g.save();
    g.translate(cx, cy);
    g.rotate(rotation);
    g.lineWidth = width;
    const grad = g.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0, rgb(theme.rgb, .03 * alpha));
    grad.addColorStop(.3, rgb(theme.rgb, .7 * alpha));
    grad.addColorStop(.6, rgb(theme.extra, .31 * alpha));
    grad.addColorStop(1, rgb(theme.rgb, .85 * alpha));
    g.strokeStyle = grad;
    g.beginPath();g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);g.stroke();
    g.restore();
  }

  function drawPlanet(g, center, theme, t, ambient = true) {
    const { x: cx, y: cy, r } = center;
    const motion = state.reducedMotion ? 0 : 1;
    const drift = t * .00014 * motion;
    const tilt = Math.max(-1, Math.min(1, ((state.pointer.x || cx) - cx) / (r * 3.8))) * .12 * motion;

    // Outer atmospheric scatter and faint gravitational field.
    const halo = g.createRadialGradient(cx, cy, r * .5, cx, cy, r * 2.5);
    halo.addColorStop(0, rgb(theme.rgb, .21));
    halo.addColorStop(.36, rgb(theme.rgb, .13));
    halo.addColorStop(.68, rgb(theme.extra, .025));
    halo.addColorStop(1, rgb(theme.rgb, 0));
    g.fillStyle = halo;g.beginPath();g.arc(cx, cy, r * 2.5, 0, Math.PI * 2);g.fill();

    if (ambient) {
      ring(g, cx, cy, r * 1.82, r * .55, -.28 + tilt, theme, .19, .75);
      ring(g, cx, cy, r * 1.63, r * .36, -.41 + tilt, theme, .75, 1.15);
      ring(g, cx, cy, r * 1.78, r * .43, -.40 + tilt, theme, .24, 11);
      ring(g, cx, cy, r * 1.37, r * 1.37, 0, theme, .08, .65);
    }

    // Orbit dust renders behind the planet.
    if (ambient) drawDust(g, center, theme, t, true);

    const surface = g.createRadialGradient(cx - r * .45, cy - r * .53, r * .025, cx + r * .10, cy + r * .14, r * 1.22);
    surface.addColorStop(0, rgb(theme.extra, .98));
    surface.addColorStop(.08, rgb(theme.rgb, .92));
    surface.addColorStop(.35, rgb(theme.rgb, .76));
    surface.addColorStop(.68, theme.dark);
    surface.addColorStop(.96, '#070614');
    surface.addColorStop(1, '#03030d');
    g.save();
    g.shadowBlur = r * .20;
    g.shadowColor = rgb(theme.rgb, .67);
    g.fillStyle = surface;g.beginPath();g.arc(cx, cy, r, 0, Math.PI * 2);g.fill();
    g.shadowBlur = 0;
    g.beginPath();g.arc(cx, cy, r, 0, Math.PI * 2);g.clip();

    // Organic iridescent bands, built procedurally rather than using an image.
    const textureSeed = randomGen(state.hash + 313);
    for (let i = 0; i < 64; i++) {
      const base = (i / 63 - .5) * r * 2.4;
      const wave = textureSeed();
      g.beginPath();
      for (let s = -r * 1.1; s <= r * 1.1; s += r / 24) {
        const yy = cy + base + Math.sin(s / r * (2.8 + wave) + i * .37 + drift) * (r * (.045 + wave * .08)) + Math.sin(s / r * 6 + i) * r * .016;
        if (s === -r * 1.1) g.moveTo(cx + s, yy); else g.lineTo(cx + s, yy);
      }
      g.lineWidth = .35 + wave * r * .013;
      g.strokeStyle = wave > .5 ? rgb(theme.extra, .05 + wave * .12) : rgb(theme.rgb, .08 + wave * .16);
      g.stroke();
    }
    // Meridians: translucent arcs make the core feel volumetric.
    for (let i = -3; i <= 3; i++) {
      g.beginPath();
      g.ellipse(cx, cy, Math.max(1, r * Math.cos(i * .34)), r, drift * .11 + .22, 0, Math.PI * 2);
      g.lineWidth = .6;g.strokeStyle = rgb(theme.extra, .045);g.stroke();
    }
    const shade = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    shade.addColorStop(0, 'rgba(255,255,255,.09)');
    shade.addColorStop(.3, 'rgba(255,255,255,0)');
    shade.addColorStop(1, 'rgba(0,0,0,.56)');
    g.fillStyle = shade;g.fillRect(cx-r,cy-r,2*r,2*r);
    g.restore();

    g.save();
    g.shadowBlur = r * .21;
    g.shadowColor = rgb(theme.extra, .65);
    g.strokeStyle = rgb(theme.extra, .48);
    g.lineWidth = 1.35;
    g.beginPath();g.arc(cx, cy, r + .5, -2.89, -1.03);g.stroke();
    g.restore();

    // Sharp slanted orbit with two foreground luminous arcs.
    if (ambient) {
      g.save();g.translate(cx,cy);g.rotate(-.40 + tilt);
      g.strokeStyle = rgb(theme.extra, .64);g.lineWidth = 1.5;
      g.shadowBlur = 15;g.shadowColor = rgb(theme.extra, .77);
      g.beginPath();g.ellipse(0,0,r*1.63,r*.36,0,.03,Math.PI*.93);g.stroke();
      g.lineWidth = .5;g.strokeStyle = rgb(theme.rgb, .42);g.shadowBlur = 0;
      g.beginPath();g.ellipse(0,0,r*1.77,r*.48,0,.14,Math.PI*.91);g.stroke();
      g.restore();
      drawDust(g, center, theme, t, false);
      // Moving orbital beacons.
      for (let i = 0; i < 3; i++) {
        const a = t * .00015 * motion * (i%2 ? -1 : 1) + i * Math.PI * .66 + 1;
        const orbit = r * (1.3 + i * .18);
        const px = cx + Math.cos(a) * orbit;
        const py = cy + Math.sin(a) * orbit * .38;
        g.save();g.shadowColor = rgb(theme.extra, 1);g.shadowBlur = 19;
        g.beginPath();g.fillStyle = i===1 ? rgb(theme.extra,.95) : rgb(theme.rgb,.95);g.arc(px,py,1.8 + i*.55,0,Math.PI*2);g.fill();g.restore();
      }
    }
  }

  function drawDust(g, center, theme, t, behind) {
    const { x: cx, y: cy, r } = center;
    const motion = state.reducedMotion ? 0 : 1;
    for (const d of state.dust) {
      const a = d.angle + t * .0005 * d.speed * motion;
      const isBehind = Math.sin(a) < 0;
      if (isBehind !== behind) continue;
      const orbit = d.orbit * r;
      const x = cx + Math.cos(a) * orbit;
      const y = cy + Math.sin(a) * orbit * d.elevation - Math.cos(a) * orbit * .20;
      g.beginPath();g.fillStyle = rgb(d.tint > .42 ? theme.rgb : theme.extra, d.opacity * (behind ? .35 : .75));
      g.arc(x,y,d.size * Math.max(.65,r/220),0,Math.PI*2);g.fill();
    }
  }

  function drawPulses(g, t, theme) {
    state.pulses = state.pulses.filter((p) => t - p.birth < 1350);
    for (const p of state.pulses) {
      const age = (t - p.birth) / 1350;
      if (age < 0) continue;
      const radius = 10 + age * Math.max(state.width, state.height) * .27;
      g.beginPath();g.arc(p.x,p.y,radius,0,Math.PI*2);
      g.lineWidth = Math.max(.3,2.6 * (1-age));g.strokeStyle = rgb(theme.extra, .55 * (1-age));g.stroke();
    }
    state.bursts = state.bursts.filter((p) => t - p.birth < 1200);
    for (const p of state.bursts) {
      const age = Math.max(0,(t - p.birth) / 1200);
      const x = p.x + p.dx * age * 145;
      const y = p.y + p.dy * age * 145;
      g.beginPath();g.fillStyle = rgb(theme.rgb, (1-age)*.8);g.arc(x,y,p.size*(1-age),0,Math.PI*2);g.fill();
    }
  }

  function draw(now) {
    if (!ctx) return;
    const t = state.reducedMotion ? 6000 : now;
    state.time = t;
    const theme = themes[state.themeIndex];
    const w = state.width, h = state.height;
    if (!w || !h) return;
    backdrop(ctx,w,h,t,theme);
    drawStars(ctx,w,h,t,theme);
    drawPlanet(ctx,state.center,theme,t,true);
    drawPulses(ctx,now,theme);
  }

  function tick(now) {
    draw(now);
    raf = requestAnimationFrame(tick);
  }

  function updateTheme(index) {
    state.themeIndex = Math.max(0,Math.min(themes.length-1,index));
    const theme = themes[state.themeIndex];
    document.documentElement.style.setProperty('--accent',theme.primary);
    document.documentElement.style.setProperty('--accent2',theme.secondary);
    $$('.mood-chip').forEach((button) => {
      const selected = Number(button.dataset.mood) === state.themeIndex;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    if (state.soundOn) retune();
  }

  function updateMeta() {
    const clean = state.word.trim();
    $('#galaxy-title').textContent = `NØVA / ${clean.toLocaleUpperCase('tr-TR')}`;
    const lat = ((state.hash % 9000)/100).toFixed(2);
    const lon = (((state.hash>>>8)%18000)/100).toFixed(2);
    $('#galaxy-coords').textContent = `${lat}° / ${lon}°`;
    $('#universe-id').textContent = `NV-${state.hash.toString(16).toUpperCase().padStart(8,'0').slice(0,8)}`;
    document.title = `NØVA — ${clean} Evreni`;
  }

  function syncURL() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('word',state.word);
      url.searchParams.set('mood',themes[state.themeIndex].name.toLowerCase());
      url.searchParams.set('stars',String(state.density));
      history.replaceState(null,'',url.pathname+url.search+url.hash);
    } catch (err) { /* URLs are an enhancement; creation works offline too. */ }
  }

  function energyWave(x = state.center.x,y = state.center.y,amount = 55) {
    const birth = performance.now();
    state.pulses.push({x,y,birth});
    const gen = randomGen((state.hash ^ Math.floor(birth)) >>> 0);
    for (let i=0;i<amount;i++) {
      const a = gen()*Math.PI*2;
      const speed = .4+gen()*1.1;
      state.bursts.push({x,y,dx:Math.cos(a)*speed,dy:Math.sin(a)*speed,size:.7+gen()*2.5,birth});
    }
    if (state.reducedMotion) draw(performance.now());
  }

  function toast(message) {
    const el = $('#toast');
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3100);
  }

  function generate(word, options = {}) {
    const { autoTheme = true, announce = true } = options;
    const clean = word.trim().replace(/\s+/g,' ').slice(0,36);
    if (!clean) { $('#universe-word').focus();toast('Önce evrenine bir kelime ver.');return; }
    state.word = clean;
    state.hash = hashString(clean);
    state.special = /^(wow|vay|sürpriz|secret|42)$/i.test(clean);
    if (autoTheme) updateTheme(state.hash % themes.length);
    buildUniverse();
    updateMeta();
    syncURL();
    energyWave();
    const flash = $('#flash');
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');
    if (announce) toast(state.special ? '✦ GİZLİ BOYUT AÇILDI. HOŞ GELDİN.' : `✦ “${clean}” evreni artık yaşıyor.`);
    if (state.reducedMotion) draw(performance.now());
  }

  function surprise() {
    const next = surpriseWords[Math.floor(Math.random()*surpriseWords.length)];
    $('#universe-word').value = next;
    generate(next);
  }

  function poster() {
    const art = document.createElement('canvas');
    art.width = 1400;art.height = 1800;
    const g = art.getContext('2d');
    if (!g) { toast('Bu tarayıcıda poster oluşturulamıyor.');return; }
    const theme = themes[state.themeIndex];
    const W = art.width,H = art.height;
    const bg = g.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#0f0b23');bg.addColorStop(.5,'#080817');bg.addColorStop(1,'#03030d');
    g.fillStyle=bg;g.fillRect(0,0,W,H);
    const glow = g.createRadialGradient(W*.5,H*.42,0,W*.5,H*.42,800);
    glow.addColorStop(0,rgb(theme.rgb,.27));glow.addColorStop(1,rgb(theme.rgb,0));
    g.fillStyle=glow;g.fillRect(0,0,W,H);
    const makeRandom=randomGen(state.hash);
    for (let i=0;i<570;i++) {
      const x=makeRandom()*W,y=makeRandom()*H;
      const size=.4+makeRandom()*2.2;
      g.beginPath();g.arc(x,y,size,0,Math.PI*2);g.fillStyle=`rgba(229,221,255,${.2+makeRandom()*.65})`;g.fill();
    }
    drawPlanet(g,{x:W/2,y:745,r:355},theme,5000,false);
    // A few large ellipse strokes are designed for the portrait composition.
    ring(g,W/2,745,600,185,-.35,theme,.78,1.7);
    ring(g,W/2,745,680,300,-.27,theme,.27,.7);
    g.textBaseline='middle';
    g.font='700 34px "Space Grotesk", Arial';g.letterSpacing='5px';
    g.fillStyle=theme.secondary;g.fillText('N Ø V A  /  U N I V E R S E',95,115);
    g.fillStyle='rgba(255,255,255,.47)';g.font='500 23px "Space Grotesk", Arial';
    g.fillText('TEK KELİME. SONSUZ İHTİMAL.',95,1420);
    const label=state.word.toLocaleUpperCase('tr-TR');
    let fontSize=126;
    g.font=`800 ${fontSize}px "Syne", Arial`;
    while (g.measureText(label).width>1210 && fontSize>55) {fontSize-=3;g.font=`800 ${fontSize}px "Syne", Arial`;}
    g.fillStyle='#f7f5ff';g.fillText(label,88,1530);
    g.fillStyle=theme.primary;g.fillRect(95,1603,1210,2);
    g.fillStyle='rgba(255,255,255,.65)';g.font='600 22px "Space Grotesk", Arial';
    g.fillText(`EVREN KODU / NV-${state.hash.toString(16).toUpperCase().padStart(8,'0')}`,95,1660);
    g.textAlign='right';g.fillText(`${theme.name}  —  ∞`,1305,1660);
    g.fillStyle='rgba(255,255,255,.3)';g.fillText('GENERATED IN NØVA  ·  2026',1305,1730);
    try {
      const link=document.createElement('a');
      const safe=state.word.normalize('NFKD').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+/g,'-').slice(0,30) || 'evren';
      link.download=`nova-${safe}.png`;
      link.href=art.toDataURL('image/png');
      document.body.appendChild(link);link.click();link.remove();
      toast('✦ Evrenin poster olarak kaydedildi.');
    } catch(err) {toast('Poster kaydedilemedi. Tarayıcı izinlerini kontrol et.');}
  }

  async function share() {
    syncURL();
    const url=location.href;
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title:'NØVA — Benim Evrenim',text:`“${state.word}” evrenime gel.`,url });
        return;
      }
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
      else {
        const input=document.createElement('textarea');input.value=url;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();
        const copied=document.execCommand('copy');input.remove();if(!copied) throw Error('Copy unsupported');
      }
      toast('✦ Evren bağlantın kopyalandı.');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      toast('Bağlantı kopyalanamadı; adres çubuğundan paylaşabilirsin.');
    }
  }

  function setupAudio() {
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if (!AudioContextClass) {toast('Tarayıcın ses deneyimini desteklemiyor.');return false;}
    try {
      const ac=new AudioContextClass();
      const master=ac.createGain();master.gain.value=0;
      const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=850;filter.Q.value=.6;
      filter.connect(master);master.connect(ac.destination);
      const osc=themes[0].chords.map((frequency,i) => {
        const o=ac.createOscillator();const gain=ac.createGain();
        o.type=i===1?'sine':'triangle';o.frequency.value=frequency;
        gain.gain.value=i===0?.20:.075;o.connect(gain);gain.connect(filter);o.start();
        return o;
      });
      const lfo=ac.createOscillator();const lfoGain=ac.createGain();lfo.type='sine';lfo.frequency.value=.11;lfoGain.gain.value=165;
      lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();
      state.audio={ac,master,filter,osc,lfo};
      return true;
    }catch(err){toast('Ses başlatılamadı.');return false;}
  }
  function retune() {
    if(!state.audio)return;
    const {ac,osc}=state.audio;
    const chords=themes[state.themeIndex].chords;
    osc.forEach((o,i)=>o.frequency.setTargetAtTime(chords[i],ac.currentTime,.36));
  }
  async function toggleSound() {
    if(!state.audio && !setupAudio())return;
    const {ac,master}=state.audio;
    state.soundOn=!state.soundOn;
    if (state.soundOn) {
      await ac.resume();retune();master.gain.cancelScheduledValues(ac.currentTime);master.gain.setTargetAtTime(.16,ac.currentTime,.45);
    } else {master.gain.cancelScheduledValues(ac.currentTime);master.gain.setTargetAtTime(0,ac.currentTime,.15);}
    $('#sound-top').setAttribute('aria-pressed',String(state.soundOn));
    $('#sound-top-label').textContent=state.soundOn?'SES AÇIK':'SES KAPALI';
    $('#sound-top').classList.toggle('sound-on',state.soundOn);
    toast(state.soundOn?'♫ Evrenin sesini duyuyorsun.':'Ses kapatıldı.');
  }

  function init() {
    const url=new URL(window.location.href);
    const savedWord=url.searchParams.get('word');
    const savedMood=url.searchParams.get('mood');
    const savedDensity=Number(url.searchParams.get('stars'));
    if (Number.isFinite(savedDensity) && savedDensity>=15 && savedDensity<=100) state.density=Math.round(savedDensity);
    $('#density-slider').value=String(state.density);
    $('#density-output').textContent=`${state.density}%`;
    $('#density-slider').style.background=`linear-gradient(90deg,var(--accent) ${(state.density-15)/85*100}%,#444352 ${(state.density-15)/85*100}%)`;
    const themeIndex=themes.findIndex((th)=>th.name.toLowerCase()===savedMood);
    updateTheme(themeIndex>=0?themeIndex:0);
    state.word=(savedWord||'Sonsuzluk').slice(0,36).trim()||'Sonsuzluk';
    state.hash=hashString(state.word);
    if (savedWord) $('#universe-word').value=state.word;
    buildUniverse();updateMeta();
    updateLayout();
    if(!state.reducedMotion) raf=requestAnimationFrame(tick);

    resizeObserver=new ResizeObserver(()=>updateLayout());
    resizeObserver.observe($('.hero'));
    window.addEventListener('resize',updateLayout,{passive:true});

    $('#creation-form').addEventListener('submit',e=>{e.preventDefault();generate($('#universe-word').value);});
    $$('.suggestion-list button').forEach(button=>button.addEventListener('click',()=>{const w=button.dataset.word;$('#universe-word').value=w;generate(w);}));
    $$('.mood-chip').forEach(button=>button.addEventListener('click',()=>{
      updateTheme(Number(button.dataset.mood));buildUniverse();syncURL();energyWave();toast(`${themes[state.themeIndex].name} atmosferine geçildi.`);if(state.reducedMotion)draw(performance.now());
    }));
    $('#density-slider').addEventListener('input',(event)=>{
      state.density=Number(event.target.value);
      $('#density-output').textContent=`${state.density}%`;
      event.target.style.background=`linear-gradient(90deg,var(--accent) ${(state.density-15)/85*100}%,#444352 ${(state.density-15)/85*100}%)`;
      buildUniverse();if(state.reducedMotion)draw(performance.now());
    });
    $('#density-slider').addEventListener('change',syncURL);
    $('#surprise-button').addEventListener('click',surprise);
    $('#download-button').addEventListener('click',poster);
    $('#share-button').addEventListener('click',share);
    $('#sound-top').addEventListener('click',toggleSound);

    document.addEventListener('pointermove',(event)=>{
      const top=canvas.getBoundingClientRect().top;
      state.pointer.vx=event.clientX-state.pointer.x;
      state.pointer.vy=event.clientY-state.pointer.y;
      state.pointer.x=event.clientX;
      state.pointer.y=event.clientY-top;
      const halo=$('#cursor-halo');
      halo.style.left=`${event.clientX}px`;
      halo.style.top=`${event.clientY}px`;
      halo.style.opacity='1';
    },{passive:true});
    $('.hero').addEventListener('pointerdown',(event)=>{
      if(event.target.closest('button,input,a,form'))return;
      energyWave(event.clientX,event.clientY-canvas.getBoundingClientRect().top);
    });
    document.addEventListener('keydown',event=>{
      const tag=document.activeElement?.tagName;
      const editing=tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable;
      if(event.key==='Escape'&&$('#help-dialog').open){$('#help-dialog').close();return;}
      if(editing||event.altKey||event.metaKey||event.ctrlKey)return;
      if(event.code==='Space'){event.preventDefault();energyWave();}
      if(event.key.toLowerCase()==='r')surprise();
      if(event.key.toLowerCase()==='m')toggleSound();
      if(event.key.toLowerCase()==='s')poster();
      if(event.key==='?')$('#help-dialog').showModal();
    });
    $('#help-close').addEventListener('click',()=>$('#help-dialog').close());
    $('#help-go').addEventListener('click',()=>$('#help-dialog').close());
    $('#help-dialog').addEventListener('click',(event)=>{if(event.target===$('#help-dialog'))$('#help-dialog').close();});
    $('#header-time').textContent='SİSTEM ÇEVRİMİÇİ';
  }

  init();
})();