/**
 * UI, Modais e Engine de Animação para a Classe Avatar
 * Gerencia a escolha de elementos, evoluções e efeitos visuais.
 */
(function () {

    // ══════════════════════════════════════════════════════════════════
    // CONFIGURAÇÃO VISUAL DOS ELEMENTOS
    // ══════════════════════════════════════════════════════════════════
    const ELEMENT_VISUAL = {
        fogo:           { cor: '#ff4500', cor2: '#ff8c00' },
        fogo_verdadeiro:{ cor: '#fff7d4', cor2: '#ffd700' },
        fumaca:         { cor: '#8b7d8b', cor2: '#d0c0d0' },
        lava:           { cor: '#cc2900', cor2: '#ff6b00' },
        agua:           { cor: '#0066ff', cor2: '#00bfff' },
        agua_sub:       { cor: '#00d4ff', cor2: '#0099cc' },
        gelo:           { cor: '#a8dce8', cor2: '#e0f4f8' },
        sangue:         { cor: '#8b0000', cor2: '#cc1100' },
        ar:             { cor: '#c8d8ff', cor2: '#ffffff' },
        ar_sub:         { cor: '#e0e8ff', cor2: '#ffffff' },
        gas:            { cor: '#7fff00', cor2: '#ccff44' },
        atm:            { cor: '#4b0082', cor2: '#9400d3' },
        terra:          { cor: '#8b4513', cor2: '#d2691e' },
        terra_sub:      { cor: '#654321', cor2: '#a0522d' },
        metal:          { cor: '#b8b8b8', cor2: '#f0f0f0' },
        cristal:        { cor: '#9b59b6', cor2: '#00bcd4' },
        raio:           { cor: '#00ffee', cor2: '#ffe600' },
        raio_sub:       { cor: '#00fff5', cor2: '#ffffff' },
        vida:           { cor: '#00cc44', cor2: '#7fff00' },
        morte:          { cor: '#2d0a4e', cor2: '#660066' },
        luz:            { cor: '#ffd700', cor2: '#ffffff' },
        escuridao:      { cor: '#1a0033', cor2: '#440066' },
        energia:        { cor: '#00d4ff', cor2: '#80e8ff' },
    };

    // ══════════════════════════════════════════════════════════════════
    // ENGINE DE ANIMAÇÃO (CANVAS)
    // Exposto como window.createAvatarEngine para uso externo (ambient)
    // ══════════════════════════════════════════════════════════════════
    window.createAvatarEngine = function (key, canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];

        function resize() {
            W = canvas.width = canvas.offsetWidth || canvas.width;
            H = canvas.height = canvas.offsetHeight || canvas.height;
        }
        resize();

        if (key === 'fogo') {
            for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * W, y: H + Math.random() * H, vx: (Math.random() - 0.5) * 0.8, vy: -(0.8 + Math.random() * 2), life: Math.random(), size: 2 + Math.random() * 4, hue: 10 + Math.random() * 30 });
            return function (f) { ctx.clearRect(0, 0, W, H); particles.forEach((p, i) => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.05 + i) * 0.3; p.life -= 0.012; if (p.life <= 0) { p.y = H + 5; p.x = Math.random() * W; p.life = 0.8 + Math.random() * 0.2; p.vx = (Math.random() - 0.5) * 0.8; } const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2); g.addColorStop(0, `hsla(${p.hue},100%,80%,${p.life})`); g.addColorStop(0.5, `hsla(${p.hue + 10},100%,50%,${p.life * 0.6})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); const glo = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.6); glo.addColorStop(0, `rgba(255,${60 + Math.sin(f * 0.1) * 20},0,0.12)`); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); };
        }
        if (key === 'fogo_verdadeiro') {
            for (let i = 0; i < 30; i++) particles.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H + Math.random() * 20, vy: -(1.5 + Math.random() * 3), vx: (Math.random() - 0.5) * 0.5, life: Math.random(), size: 1 + Math.random() * 3 });
            return function (f) { ctx.clearRect(0, 0, W, H); const glow = ctx.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, W * 0.4); glow.addColorStop(0, `rgba(255,255,255,${0.15 + Math.sin(f * 0.08) * 0.05})`); glow.addColorStop(0.3, `rgba(255,220,80,${0.1 + Math.sin(f * 0.06) * 0.04})`); glow.addColorStop(1, 'transparent'); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx; p.life -= 0.01; if (p.life <= 0) { p.y = H + 5; p.x = W / 2 + (Math.random() - 0.5) * W * 0.3; p.life = 0.9 + Math.random() * 0.1; } const s = p.size * (1 - (1 - p.life) * 0.5); const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3); g.addColorStop(0, `rgba(255,255,230,${p.life * 0.9})`); g.addColorStop(0.5, `rgba(255,200,50,${p.life * 0.5})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'fumaca') {
            for (let i = 0; i < 25; i++) particles.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.5, y: H + Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 0.4, vy: -(0.3 + Math.random() * 0.8), life: Math.random(), size: 8 + Math.random() * 20, rot: Math.random() * Math.PI * 2, rotv: (Math.random() - 0.5) * 0.02 });
            return function (f) { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.02) * 0.3; p.life -= 0.006; p.size += 0.2; p.rot += p.rotv; if (p.life <= 0) { p.y = H + 5; p.x = W / 2 + (Math.random() - 0.5) * W * 0.4; p.life = 0.7 + Math.random() * 0.3; p.size = 8 + Math.random() * 12; } const a = p.life * 0.35; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); g.addColorStop(0, `rgba(160,140,160,${a})`); g.addColorStop(0.6, `rgba(80,70,90,${a * 0.5})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'lava') {
            for (let i = 0; i < 20; i++) particles.push({ x: Math.random() * W, y: Math.random() * H * 0.3 + H * 0.6, vx: (Math.random() - 0.5) * 0.5, vy: -(0.2 + Math.random() * 1.5), life: Math.random(), size: 3 + Math.random() * 8, drip: Math.random() < 0.4 });
            return function (f) { ctx.clearRect(0, 0, W, H); const pool = ctx.createLinearGradient(0, H * 0.75, 0, H); pool.addColorStop(0, `rgba(200,40,0,${0.3 + Math.sin(f * 0.05) * 0.1})`); pool.addColorStop(0.5, 'rgba(255,80,0,0.2)'); pool.addColorStop(1, 'rgba(80,10,0,0.4)'); ctx.fillStyle = pool; ctx.fillRect(0, H * 0.75, W, H * 0.25); particles.forEach((p, i) => { if (p.drip) { p.y += Math.abs(p.vy) * 1.5; if (p.y > H + 10) { p.y = H * 0.8 - Math.random() * 20; p.x = Math.random() * W; p.vy = -(0.5 + Math.random() * 1); } } else { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.04 + i) * 0.3; p.life -= 0.015; if (p.life <= 0) { p.y = H * 0.85; p.x = Math.random() * W; p.life = 0.8 + Math.random() * 0.2; } } const a = p.drip ? 0.8 : p.life; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5); g.addColorStop(0, `hsla(${p.drip ? 10 : 15 + i % 20},100%,60%,${a * 0.9})`); g.addColorStop(0.6, `hsla(10,100%,35%,${a * 0.4})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.drip ? 0.7 : 1.5), 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'agua') {
            const waves = []; for (let i = 0; i < 4; i++) waves.push({ offset: Math.random() * Math.PI * 2, speed: 0.02 + Math.random() * 0.02, amp: 3 + Math.random() * 5 });
            for (let i = 0; i < 35; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.3, life: Math.random(), size: 1 + Math.random() * 3, alpha: 0.3 + Math.random() * 0.5 });
            return function (f) { ctx.clearRect(0, 0, W, H); waves.forEach(w => { ctx.beginPath(); for (let x = 0; x <= W; x += 4) { const y = H * 0.5 + Math.sin(x * 0.03 + f * w.speed + w.offset) * w.amp + Math.cos(x * 0.05 + f * w.speed * 0.7) * w.amp * 0.5; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = 'rgba(0,102,255,0.04)'; ctx.fill(); }); particles.forEach(p => { p.x += p.vx; p.y += p.vy + Math.sin(f * 0.05 + p.x * 0.02) * 0.2; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2); g.addColorStop(0, `rgba(0,180,255,${p.alpha})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'agua_sub') {
            const waves = []; for (let i = 0; i < 6; i++) waves.push({ offset: i * (Math.PI / 3), speed: 0.04 + i * 0.01, amp: 2 + i, color: `rgba(0,${200 + i * 8},255,0.06)` });
            for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 0.5, size: 0.5 + Math.random() * 2, life: Math.random() });
            return function (f) { ctx.clearRect(0, 0, W, H); waves.forEach(w => { ctx.beginPath(); for (let x = 0; x <= W; x += 3) { const y = H / 2 + Math.sin(x * 0.04 + f * w.speed + w.offset) * w.amp; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = w.color; ctx.fill(); }); particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.008; if (p.life <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 0.8 + Math.random() * 0.2; } ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(100,220,255,${p.life * 0.6})`; ctx.fill(); }); };
        }
        if (key === 'gelo') {
            const crystals = []; for (let i = 0; i < 15; i++) crystals.push({ x: Math.random() * W, y: Math.random() * H, size: 4 + Math.random() * 12, angle: Math.random() * Math.PI / 3, growth: 0, maxGrowth: 0.6 + Math.random() * 0.4, speed: 0.003 + Math.random() * 0.003 });
            for (let i = 0; i < 20; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vy: 0.3 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.3, life: 1, size: 1 + Math.random() * 2.5 });
            return function (f) { ctx.clearRect(0, 0, W, H); crystals.forEach(c => { c.growth = Math.min(c.maxGrowth, c.growth + c.speed); const s = c.size * c.growth; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.angle); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2); g.addColorStop(0, `rgba(220,240,248,${c.growth * 0.8})`); g.addColorStop(0.5, `rgba(168,216,232,${c.growth * 0.4})`); g.addColorStop(1, 'transparent'); for (let a = 0; a < 6; a++) { ctx.save(); ctx.rotate(a * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 2); ctx.strokeStyle = `rgba(200,235,245,${c.growth * 0.6})`; ctx.lineWidth = 1; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(s * 0.3, -s); ctx.moveTo(0, -s * 0.7); ctx.lineTo(-s * 0.3, -s); ctx.stroke(); ctx.restore(); } ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, s * 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); if (c.growth >= c.maxGrowth) { c.x = Math.random() * W; c.y = Math.random() * H; c.growth = 0; c.maxGrowth = 0.5 + Math.random() * 0.5; } }); particles.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.03 + p.y * 0.02) * 0.2; p.life -= 0.008; if (p.life <= 0 || p.y > H) { p.y = 0; p.x = Math.random() * W; p.life = 0.9; } ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(f * 0.02); ctx.beginPath(); for (let a = 0; a < 4; a++) { ctx.rotate(Math.PI / 2); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size * 2); } ctx.strokeStyle = `rgba(200,240,255,${p.life * 0.7})`; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore(); }); };
        }
        if (key === 'sangue') {
            for (let i = 0; i < 25; i++) particles.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vy: 0.5 + Math.random() * 2.5, vx: (Math.random() - 0.5) * 0.3, size: 2 + Math.random() * 5, life: 1, type: Math.random() < 0.3 ? 'drop' : 'orb' });
            return function (f) { ctx.clearRect(0, 0, W, H); const pulse = 0.08 + Math.abs(Math.sin(f * 0.04)) * 0.06; const glo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5); glo.addColorStop(0, `rgba(139,0,0,${pulse})`); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx; p.life -= 0.008; if (p.y > H + 5 || p.life <= 0) { p.y = Math.random() * H * 0.3; p.x = Math.random() * W; p.life = 0.9; p.vy = 0.5 + Math.random() * 2.5; } if (p.type === 'drop') { ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * 0.6, p.size, 0, 0, Math.PI * 2); ctx.fillStyle = `rgba(${150 + Math.floor(p.life * 30)},0,0,${p.life * 0.8})`; ctx.fill(); } else { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2); g.addColorStop(0, `rgba(220,20,20,${p.life * 0.7})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); } }); };
        }
        if (key === 'ar') {
            for (let i = 0; i < 60; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: 1 + Math.random() * 2, vy: (Math.random() - 0.5) * 0.5, life: Math.random(), size: 0.5 + Math.random() * 1.5, trail: [] });
            return function (f) { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 8) p.trail.shift(); p.x += p.vx + Math.sin(f * 0.03 + p.y * 0.02) * 0.5; p.y += p.vy + Math.cos(f * 0.04 + p.x * 0.01) * 0.3; p.life -= 0.006; if (p.x > W + 10 || p.life <= 0) { p.x = -5; p.y = Math.random() * H; p.life = 0.7 + Math.random() * 0.3; p.trail = []; } if (p.trail.length > 1) { ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y); p.trail.forEach(t => ctx.lineTo(t.x, t.y)); ctx.strokeStyle = `rgba(220,230,255,${p.life * 0.3})`; ctx.lineWidth = p.size; ctx.stroke(); } ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(240,245,255,${p.life * 0.7})`; ctx.fill(); }); };
        }
        if (key === 'ar_sub') {
            for (let i = 0; i < 80; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: Math.random(), size: 0.3 + Math.random() * 1, trail: [] });
            return function (f) { ctx.clearRect(0, 0, W, H); const glo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.3); glo.addColorStop(0, 'rgba(255,255,255,0.05)'); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 12) p.trail.shift(); const cx = W / 2, cy = H / 2, dx = p.x - cx, dy = p.y - cy, d = Math.sqrt(dx * dx + dy * dy); const pull = d > 10 ? 30 / (d * d) : 0; p.vx += (-dy * 0.001 - dx * pull); p.vy += (dx * 0.001 - dy * pull); const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (speed > 5) { p.vx *= 5 / speed; p.vy *= 5 / speed; } p.x += p.vx; p.y += p.vy; p.life -= 0.005; if (p.life <= 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) { const a = Math.random() * Math.PI * 2, r = W * 0.4 + Math.random() * W * 0.1; p.x = W / 2 + Math.cos(a) * r; p.y = H / 2 + Math.sin(a) * r; p.vx = -Math.sin(a) * 2; p.vy = Math.cos(a) * 2; p.life = 0.8; p.trail = []; } if (p.trail.length > 1) { ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y); p.trail.forEach(t => ctx.lineTo(t.x, t.y)); ctx.strokeStyle = `rgba(255,255,255,${p.life * 0.25})`; ctx.lineWidth = p.size; ctx.stroke(); } }); };
        }
        if (key === 'gas') {
            for (let i = 0; i < 20; i++) particles.push({ x: Math.random() * W, y: H + Math.random() * 20, vx: (Math.random() - 0.5) * 0.4, vy: -(0.2 + Math.random() * 0.6), life: Math.random(), size: 15 + Math.random() * 25, hue: 80 + Math.random() * 40 });
            return function (f) { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.02 + p.size) * 0.4; p.life -= 0.005; p.size += 0.15; if (p.life <= 0 || p.y < -p.size) { p.y = H + 5; p.x = Math.random() * W; p.life = 0.7 + Math.random() * 0.3; p.size = 15 + Math.random() * 20; } const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); g.addColorStop(0, `hsla(${p.hue},100%,55%,${p.life * 0.35})`); g.addColorStop(0.6, `hsla(${p.hue + 20},80%,40%,${p.life * 0.15})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'atm') {
            const bolts = []; function newBolt() { const x = Math.random() * W; return { x, segments: [{ x, y: 0 }], life: 0.8 + Math.random() * 0.4, maxSegs: 6 + Math.floor(Math.random() * 8) }; }
            for (let i = 0; i < 3; i++) bolts.push(newBolt());
            return function (f) { ctx.clearRect(0, 0, W, H); const bg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H); bg.addColorStop(0, `rgba(74,0,130,${0.08 + Math.sin(f * 0.03) * 0.02})`); bg.addColorStop(1, 'transparent'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); bolts.forEach((b, bi) => { if (b.segments.length < b.maxSegs) { const last = b.segments[b.segments.length - 1]; b.segments.push({ x: last.x + (Math.random() - 0.5) * 30, y: last.y + H / b.maxSegs }); } b.life -= 0.035; if (b.life <= 0) { bolts[bi] = newBolt(); return; } ctx.beginPath(); ctx.moveTo(b.segments[0].x, b.segments[0].y); b.segments.forEach(s => ctx.lineTo(s.x, s.y)); ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(150,50,255,0.8)'; ctx.strokeStyle = `rgba(180,100,255,${b.life * 0.9})`; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = `rgba(230,200,255,${b.life * 0.5})`; ctx.lineWidth = 1; ctx.stroke(); ctx.shadowBlur = 0; }); };
        }
        if (key === 'terra') {
            for (let i = 0; i < 30; i++) particles.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 0.3, vy: 0.4 + Math.random() * 2, size: 2 + Math.random() * 6, life: 1, rot: Math.random() * Math.PI, rotv: (Math.random() - 0.5) * 0.05, type: Math.random() < 0.5 ? 'square' : 'circle' });
            return function (f) { ctx.clearRect(0, 0, W, H); const glo = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.6); glo.addColorStop(0, `rgba(139,69,19,${0.15 + Math.sin(f * 0.02) * 0.04})`); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rotv; p.life -= 0.01; if (p.y > H + 10 || p.life <= 0) { p.y = -5; p.x = Math.random() * W; p.life = 0.8 + Math.random() * 0.2; p.vy = 0.5 + Math.random() * 1.5; } ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = `rgba(${120 + Math.floor(p.life * 60)},${60 + Math.floor(p.life * 20)},20,${p.life * 0.8})`; if (p.type === 'square') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }); };
        }
        if (key === 'terra_sub') {
            const rocks = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; rocks.push({ a, r: Math.min(W, H) * 0.28, va: (Math.random() - 0.5) * 0.01, size: 8 + Math.random() * 12 }); }
            return function (f) { ctx.clearRect(0, 0, W, H); rocks.forEach(r => { r.a += r.va; r.r += Math.sin(f * 0.02 + r.a) * 0.3; const x = W / 2 + Math.cos(r.a) * r.r, y = H / 2 + Math.sin(r.a) * r.r; ctx.save(); ctx.translate(x, y); ctx.rotate(r.a + f * 0.01); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r.size); g.addColorStop(0, 'rgba(160,100,30,0.9)'); g.addColorStop(0.5, 'rgba(100,55,15,0.7)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.beginPath(); const pts = 6; for (let i = 0; i < pts; i++) { const a = i / pts * Math.PI * 2, rad = r.size * (0.8 + Math.sin(i * 1.7) * 0.2); ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); ctx.fill(); ctx.restore(); }); const glo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4); glo.addColorStop(0, `rgba(100,50,10,${0.12 + Math.sin(f * 0.03) * 0.04})`); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); };
        }
        if (key === 'metal') {
            for (let i = 0; i < 20; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, size: 1 + Math.random() * 3, life: Math.random(), angle: Math.random() * Math.PI, va: 0.03 + Math.random() * 0.05 });
            return function (f) { ctx.clearRect(0, 0, W, H); const sh = ctx.createLinearGradient(f % W, 0, (f + W * 0.3) % W, H); sh.addColorStop(0, 'transparent'); sh.addColorStop(0.5, `rgba(200,210,220,${0.04 + Math.sin(f * 0.05) * 0.02})`); sh.addColorStop(1, 'transparent'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.008; p.angle += p.va; if (p.life <= 0 || p.x < -5 || p.x > W + 5 || p.y < -5 || p.y > H + 5) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 0.7; } ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.beginPath(); ctx.moveTo(-p.size * 2, 0); ctx.lineTo(p.size * 2, 0); ctx.moveTo(0, -p.size * 0.5); ctx.lineTo(0, p.size * 0.5); ctx.strokeStyle = `rgba(${200 + Math.floor(p.life * 40)},${210 + Math.floor(p.life * 30)},${220 + Math.floor(p.life * 20)},${p.life * 0.8})`; ctx.lineWidth = p.size * 0.4; ctx.stroke(); ctx.restore(); }); };
        }
        if (key === 'cristal') {
            const shards = []; for (let i = 0; i < 10; i++) shards.push({ x: Math.random() * W, y: Math.random() * H, size: 10 + Math.random() * 20, rot: Math.random() * Math.PI, rotv: (Math.random() - 0.5) * 0.005, hue: 200 + Math.random() * 60, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
            return function (f) { ctx.clearRect(0, 0, W, H); shards.forEach(s => { s.rot += s.rotv; s.x += s.vx; s.y += s.vy; if (s.x < -20) s.x = W + 20; if (s.x > W + 20) s.x = -20; if (s.y < -20) s.y = H + 20; if (s.y > H + 20) s.y = -20; ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.beginPath(); ctx.moveTo(0, -s.size); ctx.lineTo(s.size * 0.5, 0); ctx.lineTo(0, s.size * 0.6); ctx.lineTo(-s.size * 0.5, 0); ctx.closePath(); const g = ctx.createLinearGradient(-s.size, 0, s.size, 0); g.addColorStop(0, `hsla(${s.hue},80%,70%,0.1)`); g.addColorStop(0.3, `hsla(${s.hue + 40},90%,85%,0.5)`); g.addColorStop(0.7, `hsla(${s.hue},80%,70%,0.3)`); g.addColorStop(1, `hsla(${s.hue + 20},80%,75%,0.1)`); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `hsla(${s.hue + 20},90%,90%,0.4)`; ctx.lineWidth = 0.5; ctx.stroke(); ctx.restore(); }); for (let i = 0; i < 6; i++) { const a = f * 0.015 + i * Math.PI / 3; const g2 = ctx.createLinearGradient(W / 2, H / 2, W / 2 + Math.cos(a) * W * 0.25, H / 2 + Math.sin(a) * W * 0.25); g2.addColorStop(0, `hsla(${(i * 60 + f) % 360},100%,70%,0.04)`); g2.addColorStop(1, 'transparent'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); } };
        }
        if (key === 'raio' || key === 'raio_sub') {
            const isSub = key === 'raio_sub';
            const bolts = []; function newBolt() { const x = Math.random() * W; const segs = [{ x, y: 0 }]; const n = 8 + Math.floor(Math.random() * 6); for (let i = 1; i < n; i++) segs.push({ x: segs[i - 1].x + (Math.random() - 0.5) * 25, y: i * (H / n) }); return { segs, life: 0.6 + Math.random() * 0.4, cyan: Math.random() < (isSub ? 0.85 : 0.5) }; }
            for (let i = 0; i < 5; i++) bolts.push(newBolt());
            return function (f) { ctx.clearRect(0, 0, W, H); if (f % 12 === 0) bolts[Math.floor(Math.random() * bolts.length)] = newBolt(); bolts.forEach(b => { b.life -= 0.025; if (b.life <= 0) return; const c = b.cyan ? `rgba(0,240,255,${b.life * 0.9})` : `rgba(255,230,0,${b.life * 0.9})`; const cs = b.cyan ? 'rgba(0,200,255,0.6)' : 'rgba(255,220,0,0.6)'; ctx.beginPath(); ctx.moveTo(b.segs[0].x, b.segs[0].y); b.segs.forEach(s => ctx.lineTo(s.x, s.y)); ctx.shadowBlur = isSub ? 22 : 15; ctx.shadowColor = cs; ctx.strokeStyle = c; ctx.lineWidth = b.life * 3; ctx.stroke(); ctx.strokeStyle = `rgba(255,255,255,${b.life * 0.5})`; ctx.lineWidth = b.life; ctx.stroke(); ctx.shadowBlur = 0; }); const glo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5); glo.addColorStop(0, `rgba(0,${isSub ? 255 : 200},255,${0.04 + Math.sin(f * 0.1) * 0.02})`); glo.addColorStop(1, 'transparent'); ctx.fillStyle = glo; ctx.fillRect(0, 0, W, H); };
        }
        if (key === 'vida') {
            const vines = []; function growVine() { return { x: Math.random() * W, y: H, segments: [], life: 1, speed: 0.5 + Math.random(), sway: Math.random() * Math.PI * 2, color: `hsl(${120 + Math.random() * 40},80%,${40 + Math.random() * 20}%)` }; }
            for (let i = 0; i < 8; i++) vines.push(growVine());
            for (let i = 0; i < 15; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vy: -(0.3 + Math.random() * 0.8), vx: (Math.random() - 0.5) * 0.4, life: Math.random(), size: 2 + Math.random() * 4 });
            return function (f) { ctx.clearRect(0, 0, W, H); vines.forEach(v => { const maxLen = 30 + Math.random() * 20; if (v.segments.length < maxLen) { const last = v.segments.length ? v.segments[v.segments.length - 1] : { x: v.x, y: v.y }; v.segments.push({ x: last.x + Math.sin(v.sway + v.segments.length * 0.3) * 3, y: last.y - v.speed }); v.sway += 0.05; } else v.life -= 0.005; if (v.life <= 0) Object.assign(v, growVine()); if (v.segments.length < 2) return; ctx.beginPath(); ctx.moveTo(v.segments[0].x, v.segments[0].y); v.segments.forEach(s => ctx.lineTo(s.x, s.y)); ctx.strokeStyle = v.color.replace('hsl', 'hsla').replace(')', `,${v.life * 0.7})`); ctx.lineWidth = 1.5; ctx.stroke(); const tip = v.segments[v.segments.length - 1]; ctx.beginPath(); ctx.ellipse(tip.x, tip.y, 3, 5, v.sway, 0, Math.PI * 2); ctx.fillStyle = v.color.replace('hsl', 'hsla').replace(')', `,${v.life * 0.8})`); ctx.fill(); }); particles.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.03 + p.x * 0.02) * 0.3; p.life -= 0.007; if (p.life <= 0 || p.y < -5) { p.y = H; p.x = Math.random() * W; p.life = 0.8 + Math.random() * 0.2; } ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(100,230,80,${p.life * 0.5})`; ctx.fill(); }); };
        }
        if (key === 'morte') {
            for (let i = 0; i < 30; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.5, vy: 0.3 + Math.random() * 1.5, life: Math.random(), size: 2 + Math.random() * 5 });
            return function (f) { ctx.clearRect(0, 0, W, H); const cg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.7); cg.addColorStop(0, 'transparent'); cg.addColorStop(1, `rgba(10,0,20,${0.5 + Math.sin(f * 0.02) * 0.1})`); ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H); particles.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.02 + p.y * 0.01) * 0.5; p.life -= 0.008; if (p.life <= 0 || p.y > H + 5) { p.y = 0; p.x = Math.random() * W; p.life = 0.7 + Math.random() * 0.3; } const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2); g.addColorStop(0, `rgba(${100 + Math.floor(p.life * 30)},0,${150 + Math.floor(p.life * 30)},${p.life * 0.6})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); };
        }
        if (key === 'luz') {
            const rays = []; for (let i = 0; i < 12; i++) rays.push({ angle: i / 12 * Math.PI * 2, len: H * 0.4 + Math.random() * H * 0.2, speed: 0.003 + Math.random() * 0.003, alpha: 0.03 + Math.random() * 0.04 });
            for (let i = 0; i < 40; i++) particles.push({ x: W / 2, y: H / 2, angle: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 3, life: Math.random(), size: 1 + Math.random() * 2 });
            return function (f) { ctx.clearRect(0, 0, W, H); const core = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.15); core.addColorStop(0, `rgba(255,255,230,${0.3 + Math.sin(f * 0.06) * 0.08})`); core.addColorStop(0.5, `rgba(255,220,80,${0.15 + Math.sin(f * 0.05) * 0.04})`); core.addColorStop(1, 'transparent'); ctx.fillStyle = core; ctx.fillRect(0, 0, W, H); rays.forEach(r => { r.angle += r.speed; ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(r.angle); const rg = ctx.createLinearGradient(0, 0, 0, -r.len); rg.addColorStop(0, `rgba(255,230,80,${r.alpha * 1.5})`); rg.addColorStop(0.5, `rgba(255,215,0,${r.alpha})`); rg.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(0, -r.len); ctx.closePath(); ctx.fillStyle = rg; ctx.fill(); ctx.restore(); }); particles.forEach(p => { p.x = W / 2 + Math.cos(p.angle) * p.speed * (1 - p.life) * W * 0.5; p.y = H / 2 + Math.sin(p.angle) * p.speed * (1 - p.life) * H * 0.5; p.life -= 0.012; if (p.life <= 0) { p.angle = Math.random() * Math.PI * 2; p.speed = 0.5 + Math.random() * 3; p.life = 0.8 + Math.random() * 0.2; } ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,240,150,${p.life * 0.8})`; ctx.fill(); }); };
        }
        if (key === 'escuridao') {
            const voids = []; for (let i = 0; i < 5; i++) voids.push({ x: Math.random() * W, y: Math.random() * H, r: 20 + Math.random() * 40, pulse: Math.random() * Math.PI * 2, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2 });
            for (let i = 0; i < 20; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, life: Math.random(), size: 1 + Math.random() * 3 });
            return function (f) { ctx.clearRect(0, 0, W, H); voids.forEach(v => { v.pulse += 0.03; v.x += v.vx; v.y += v.vy; if (v.x < 0 || v.x > W) v.vx *= -1; if (v.y < 0 || v.y > H) v.vy *= -1; const r = v.r * (1 + Math.sin(v.pulse) * 0.15); const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r * 2); g.addColorStop(0, 'rgba(0,0,0,0.8)'); g.addColorStop(0.4, `rgba(20,0,40,${0.4 + Math.sin(v.pulse) * 0.1})`); g.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(v.x, v.y, r * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }); particles.forEach(p => { const v = voids[0]; const dx = v.x - p.x, dy = v.y - p.y, d = Math.sqrt(dx * dx + dy * dy); if (d < v.r * 2) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 0.8; } p.x += dx / d * 0.5; p.y += dy / d * 0.5; p.life -= 0.008; if (p.life <= 0) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 0.8; } ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fillStyle = `rgba(${80 + Math.floor(p.life * 40)},0,${120 + Math.floor(p.life * 40)},${p.life * 0.6})`; ctx.fill(); }); };
        }
        if (key === 'energia') {
            const colors = ['#ff4444', '#ff8800', '#ffff00', '#00ff44', '#00d4ff', '#8800ff'];
            const orbs = []; for (let i = 0; i < 6; i++) orbs.push({ angle: i / 6 * Math.PI * 2, r: Math.min(W, H) * 0.3, speed: (0.02 + i * 0.003) * (i % 2 ? 1 : -1), color: colors[i], size: 4 + Math.random() * 4, trail: [] });
            function hexRgb(hex) { return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) }; }
            return function (f) { ctx.clearRect(0, 0, W, H); const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.2); cg.addColorStop(0, `hsla(${(f * 2) % 360},100%,70%,0.15)`); cg.addColorStop(0.5, `hsla(${(f * 2 + 120) % 360},100%,60%,0.05)`); cg.addColorStop(1, 'transparent'); ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H); orbs.forEach(o => { o.angle += o.speed; const x = W / 2 + Math.cos(o.angle) * o.r, y = H / 2 + Math.sin(o.angle) * o.r; o.trail.push({ x, y }); if (o.trail.length > 15) o.trail.shift(); if (o.trail.length > 1) { ctx.beginPath(); ctx.moveTo(o.trail[0].x, o.trail[0].y); o.trail.forEach(t => ctx.lineTo(t.x, t.y)); const { r, g, b } = hexRgb(o.color); ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`; ctx.lineWidth = o.size * 0.5; ctx.stroke(); } const og = ctx.createRadialGradient(x, y, 0, x, y, o.size * 2); const { r, g, b } = hexRgb(o.color); og.addColorStop(0, 'rgba(255,255,255,0.9)'); og.addColorStop(0.3, `rgba(${r},${g},${b},0.8)`); og.addColorStop(1, 'transparent'); ctx.beginPath(); ctx.arc(x, y, o.size * 2, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill(); }); };
        }
        // fallback
        return function () { ctx.clearRect(0, 0, W, H); };
    };

    // ══════════════════════════════════════════════════════════════════
    // LOOP GLOBAL DE ANIMAÇÃO
    // ══════════════════════════════════════════════════════════════════
    let globalFrame = 0;
    const activeModalEngines = {};

    function startModalLoop() {
        function loop() {
            globalFrame++;
            Object.values(activeModalEngines).forEach(fn => fn && fn(globalFrame));
            requestAnimationFrame(loop);
        }
        loop();
    }
    startModalLoop();

    // ══════════════════════════════════════════════════════════════════
    // CRIAÇÃO DE CARD CANVAS
    // ══════════════════════════════════════════════════════════════════
    function criarElementCard(key, onClick, isSubelemento) {
        const elData = window.AVATAR_ELEMENTS_DATA[key] || {};
        const vis = ELEMENT_VISUAL[key] || { cor: '#888888', cor2: '#aaaaaa' };

        const card = document.createElement('div');
        card.className = `avatar-canvas-card${isSubelemento ? ' avatar-canvas-card--sub' : ''}`;
        card.style.cssText = `border-color: ${vis.cor}33;`;

        const canvas = document.createElement('canvas');
        card.appendChild(canvas);

        const labelEl = document.createElement('span');
        labelEl.className = 'avatar-card-name';
        labelEl.textContent = elData.nome || key;
        labelEl.style.color = vis.cor;
        card.appendChild(labelEl);

        if (isSubelemento && elData.descricao) {
            const descEl = document.createElement('small');
            descEl.className = 'avatar-card-desc';
            descEl.textContent = elData.descricao;
            card.appendChild(descEl);
        }

        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = `0 0 20px ${vis.cor}44, 0 0 40px ${vis.cor}22`;
            card.style.borderColor = `${vis.cor}88`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
            card.style.borderColor = `${vis.cor}33`;
        });
        card.addEventListener('click', onClick);

        // Inicia engine após inserção no DOM
        requestAnimationFrame(() => {
            canvas.width = card.offsetWidth || 120;
            canvas.height = card.offsetHeight || 130;
            const engine = window.createAvatarEngine(key, canvas);
            activeModalEngines[key] = (f) => engine(f);
        });

        return card;
    }

    // ══════════════════════════════════════════════════════════════════
    // INJETA O MODAL NO BODY
    // ══════════════════════════════════════════════════════════════════
    const modalHtml = `
        <dialog id="modal-avatar-despertar" class="modal-overlay" style="z-index: 3000;">
            <div class="modal-content avatar-epic-modal" style="max-width: 720px; width: 95%;">
                <div class="modal-header">
                    <h3 id="avatar-modal-title" class="modal-title">Quem sou eu?</h3>
                </div>
                <div class="modal-body">
                    <p id="avatar-modal-desc" class="avatar-desc" style="text-align:center;margin-bottom:20px;color:#aaa;font-size:0.85rem;"></p>
                    <div id="avatar-element-grid" class="avatar-canvas-grid"></div>
                </div>
                <div class="modal-footer">
                    <p style="font-size:0.65rem;color:#555;width:100%;text-align:center;font-family:var(--font-heading,serif);letter-spacing:0.1em;">Esta escolha define sua jornada como Avatar.</p>
                </div>
            </div>
        </dialog>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });

    // Limpa engines do modal ao fechar
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('modal-avatar-despertar')?.addEventListener('close', () => {
            Object.keys(activeModalEngines).forEach(k => delete activeModalEngines[k]);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // ABERTURA DO MODAL — ELEMENTOS PRINCIPAIS
    // ══════════════════════════════════════════════════════════════════
    window.abrirModalEscolhaElemento = function (classIdx) {
        const container = document.getElementById('avatar-element-grid');
        if (!container) return;

        document.getElementById('avatar-modal-title').innerText = 'Quem sou eu?';
        document.getElementById('avatar-modal-desc').innerText = 'Os elementos são a essência do seu ser. Qual deles representa você?';

        // Limpa engines anteriores
        Object.keys(activeModalEngines).forEach(k => delete activeModalEngines[k]);
        container.innerHTML = '';

        const principais = Object.keys(window.AVATAR_ELEMENTS_DATA)
            .filter(key => window.AVATAR_ELEMENTS_DATA[key].tipo === 'Principal');

        principais.forEach(key => {
            const card = criarElementCard(key, () => window.confirmarEscolhaElemento(classIdx, key), false);
            container.appendChild(card);
        });

        document.getElementById('modal-avatar-despertar').showModal();
    };

    // ══════════════════════════════════════════════════════════════════
    // ABERTURA DO MODAL — SUBELEMENTOS (a 50%)
    // ══════════════════════════════════════════════════════════════════
    window.abrirModalEscolhaSubelemento = function (classIdx, elementoPai) {
        const container = document.getElementById('avatar-element-grid');
        if (!container) return;

        const elData = window.AVATAR_ELEMENTS_DATA[elementoPai];
        if (!elData || !elData.subelementos) return;

        document.getElementById('avatar-modal-title').innerText = 'EVOLUÇÃO ELEMENTAL';
        document.getElementById('avatar-modal-desc').innerText =
            `Seu domínio sobre o ${elData.nome} atingiu 50%. Qual caminho você seguirá?`;

        Object.keys(activeModalEngines).forEach(k => delete activeModalEngines[k]);
        container.innerHTML = '';

        elData.subelementos.forEach(key => {
            const sub = window.AVATAR_ELEMENTS_DATA[key];
            if (!sub) return;
            const card = criarElementCard(key, () => window.confirmarEscolhaSubelemento(classIdx, key), true);
            container.appendChild(card);
        });

        document.getElementById('modal-avatar-despertar').showModal();
    };

    // ══════════════════════════════════════════════════════════════════
    // CONFIRMAÇÕES
    // ══════════════════════════════════════════════════════════════════
    window.confirmarEscolhaElemento = function (idx, elemento) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`class_avatar_element_${idx}`] = elemento;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        fecharDialogoAnimado(document.getElementById('modal-avatar-despertar'));

        const select = document.getElementById(`class_name_${idx}`);
        if (select) {
            const elData = window.AVATAR_ELEMENTS_DATA?.[elemento];
            const option = select.querySelector('option[value="avatar"]');
            if (option) option.textContent = `Avatar (${elData?.nome || elemento})`;
            if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(select);
        }

        if (typeof showNotification === 'function') {
            const elData = window.AVATAR_ELEMENTS_DATA?.[elemento];
            showNotification(`Você despertou o elemento de ${(elData?.nome || elemento).toUpperCase()}!`, 'success');
        }

        // Inicia fundo animado
        if (typeof window.iniciarAvatarAmbient === 'function') window.iniciarAvatarAmbient(elemento);

        if (typeof atualizarTudo === 'function') atualizarTudo();
    };

    window.confirmarEscolhaSubelemento = function (idx, subKey) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`class_avatar_subelement_${idx}`] = subKey;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        fecharDialogoAnimado(document.getElementById('modal-avatar-despertar'));

        const select = document.getElementById(`class_name_${idx}`);
        if (select) {
            const subData = window.AVATAR_ELEMENTS_DATA[subKey];
            const paiKey = dados[`class_avatar_element_${idx}`];
            const paiData = window.AVATAR_ELEMENTS_DATA[paiKey];
            const option = select.querySelector('option[value="avatar"]');
            if (option) option.textContent = `Avatar (${paiData?.nome} - ${subData?.nome})`;
            if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(select);
        }

        if (typeof showNotification === 'function') {
            showNotification(`Maestria evoluiu para ${window.AVATAR_ELEMENTS_DATA[subKey]?.nome}!`, 'success');
        }

        // Atualiza fundo animado para o subelemento
        if (typeof window.iniciarAvatarAmbient === 'function') {
            const paiKey = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})[`class_avatar_element_${idx}`];
            window.iniciarAvatarAmbient(paiKey, subKey);
        }

        if (typeof atualizarTudo === 'function') atualizarTudo();
    };

    // ══════════════════════════════════════════════════════════════════
    // VERIFICAÇÕES DE ESTADO
    // ══════════════════════════════════════════════════════════════════
    window.verificarEvolucaoSubelemento = function (idx) {
        const inputPct = document.getElementById(`avatar_porcentagem_${idx}`);
        if (!inputPct || (inputPct.value.trim() !== '50%' && inputPct.value.trim() !== '50')) return;
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const elementoPai = dados[`class_avatar_element_${idx}`];
        const subJaEscolhido = dados[`class_avatar_subelement_${idx}`];
        if (elementoPai && !subJaEscolhido) window.abrirModalEscolhaSubelemento(idx, elementoPai);
    };

    window.verificarDespertarAvatar = function (idx, lvl, nomeClasse) {
        if (nomeClasse === 'avatar' && parseInt(lvl) >= 1) {
            const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            if (!dados[`class_avatar_element_${idx}`]) window.abrirModalEscolhaElemento(idx);
        }
    };

})();
