/**
 * Avatar Ambient — Partículas de fundo baseadas no elemento do Avatar
 * Segue o mesmo padrão de demônio/anjo (CSS divs position:fixed z-index:9999)
 */
(function () {

    let ambientInterval = null;
    let currentKey = null;

    // Config de partículas por elemento
    const PARTICLE_CFG = {
        // ─── Principais ───────────────────────────────────────────────
        fogo: {
            dir: 'up', rate: 500,
            build: (p) => {
                const s = 4 + Math.random() * 6;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${10 + Math.random() * 25},100%,${55 + Math.random() * 20}%)`;
                p.style.boxShadow = `0 0 8px #ff4500, 0 0 14px #ff8c00`;
                p.style.filter = 'blur(0.5px)';
            }
        },
        agua: {
            dir: 'up', rate: 600,
            build: (p) => {
                const s = 3 + Math.random() * 5;
                p.style.width = s + 'px'; p.style.height = (s * 1.4) + 'px';
                p.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                p.style.background = `rgba(0,${140 + Math.floor(Math.random() * 80)},255,0.75)`;
                p.style.boxShadow = `0 0 8px rgba(0,150,255,0.6)`;
            }
        },
        ar: {
            dir: 'right', rate: 400,
            build: (p) => {
                const w = 6 + Math.random() * 14; const h = 1 + Math.random() * 2;
                p.style.width = w + 'px'; p.style.height = h + 'px';
                p.style.borderRadius = '2px';
                p.style.background = `rgba(220,230,255,${0.3 + Math.random() * 0.5})`;
                p.style.filter = 'blur(0.5px)';
            }
        },
        terra: {
            dir: 'down', rate: 550,
            build: (p) => {
                const s = 3 + Math.random() * 6;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
                const l = 30 + Math.floor(Math.random() * 25);
                p.style.background = `hsl(25,60%,${l}%)`;
            }
        },
        raio: {
            dir: 'flash', rate: 350,
            build: (p) => {
                const s = 2 + Math.random() * 3;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                const isCyan = Math.random() > 0.45;
                p.style.background = isCyan ? '#00ffee' : '#ffe600';
                p.style.boxShadow = isCyan
                    ? `0 0 10px #00ffee, 0 0 20px #00d4ff`
                    : `0 0 10px #ffe600, 0 0 20px #ffaa00`;
            }
        },
        vida: {
            dir: 'up', rate: 650,
            build: (p) => {
                const s = 3 + Math.random() * 5;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${120 + Math.random() * 30},80%,${45 + Math.random() * 20}%)`;
                p.style.boxShadow = `0 0 8px rgba(0,200,60,0.6)`;
            }
        },
        luz: {
            dir: 'up', rate: 500,
            build: (p) => {
                const s = 2 + Math.random() * 4;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(45,100%,${70 + Math.random() * 25}%)`;
                p.style.boxShadow = `0 0 10px #ffd700, 0 0 18px rgba(255,220,80,0.5)`;
            }
        },
        energia: {
            dir: 'up', rate: 420,
            build: (p) => {
                const s = 3 + Math.random() * 5;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                const hue = Math.floor(Math.random() * 360);
                p.style.background = `hsl(${hue},100%,65%)`;
                p.style.boxShadow = `0 0 10px hsl(${hue},100%,65%), 0 0 20px hsl(${hue},100%,50%)`;
            }
        },
        // ─── Subelementos ─────────────────────────────────────────────
        fogo_verdadeiro: {
            dir: 'up', rate: 450,
            build: (p) => {
                const s = 4 + Math.random() * 6;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${355 + Math.random() * 8},100%,${35 + Math.random() * 18}%)`;
                p.style.boxShadow = `0 0 12px #cc1500, 0 0 22px rgba(200,20,0,0.5)`;
            }
        },
        fumaca: {
            dir: 'up', rate: 800,
            build: (p) => {
                const s = 8 + Math.random() * 16;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                const l = 50 + Math.floor(Math.random() * 25);
                p.style.background = `rgba(${l + 80},${l + 60},${l + 80},0.18)`;
                p.style.filter = `blur(${2 + Math.random() * 3}px)`;
            }
        },
        lava: {
            dir: 'down', rate: 600,
            build: (p) => {
                const s = 4 + Math.random() * 7;
                p.style.width = s + 'px'; p.style.height = (s * 1.3) + 'px';
                p.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                p.style.background = `hsl(${10 + Math.floor(Math.random() * 20)},100%,${35 + Math.random() * 20}%)`;
                p.style.boxShadow = `0 0 8px #cc2900, 0 0 14px #ff6b00`;
            }
        },
        agua_sub: {
            dir: 'up', rate: 500,
            build: (p) => {
                const s = 3 + Math.random() * 5;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `rgba(0,${200 + Math.floor(Math.random() * 55)},255,0.8)`;
                p.style.boxShadow = `0 0 10px #00d4ff, 0 0 18px rgba(0,180,255,0.5)`;
            }
        },
        gelo: {
            dir: 'down', rate: 600,
            build: (p) => {
                const s = 4 + Math.random() * 6;
                // Simulação de floco: cruz com border-radius
                p.style.width = s + 'px'; p.style.height = (s * 0.4) + 'px';
                p.style.borderRadius = '2px';
                p.style.background = `rgba(${180 + Math.floor(Math.random() * 70)},${220 + Math.floor(Math.random() * 35)},248,0.85)`;
                p.style.boxShadow = `0 0 6px #a8dce8`;
                p.style.transform = `rotate(${Math.floor(Math.random() * 4) * 30}deg)`;
            }
        },
        sangue: {
            dir: 'down', rate: 550,
            build: (p) => {
                const s = 3 + Math.random() * 5;
                p.style.width = s + 'px'; p.style.height = (s * 1.5) + 'px';
                p.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                p.style.background = `hsl(0,${80 + Math.floor(Math.random() * 20)}%,${25 + Math.floor(Math.random() * 20)}%)`;
                p.style.boxShadow = `0 0 6px rgba(139,0,0,0.8)`;
            }
        },
        ar_sub: {
            dir: 'right', rate: 300,
            build: (p) => {
                const w = 10 + Math.random() * 20; const h = 1;
                p.style.width = w + 'px'; p.style.height = h + 'px';
                p.style.borderRadius = '1px';
                p.style.background = `rgba(255,255,255,${0.4 + Math.random() * 0.5})`;
            }
        },
        gas: {
            dir: 'up', rate: 700,
            build: (p) => {
                const s = 6 + Math.random() * 12;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${80 + Math.floor(Math.random() * 40)},90%,50%)`;
                p.style.opacity = '0.25';
                p.style.filter = `blur(${1 + Math.random() * 2}px)`;
            }
        },
        atm: {
            dir: 'flash', rate: 500,
            build: (p) => {
                const s = 2 + Math.random() * 4;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${270 + Math.floor(Math.random() * 40)},80%,65%)`;
                p.style.boxShadow = `0 0 10px rgba(148,0,211,0.8), 0 0 18px rgba(100,0,150,0.4)`;
            }
        },
        terra_sub: {
            dir: 'down', rate: 600,
            build: (p) => {
                const s = 4 + Math.random() * 7;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '2px';
                p.style.background = `hsl(25,55%,${22 + Math.floor(Math.random() * 15)}%)`;
            }
        },
        metal: {
            dir: 'up', rate: 450,
            build: (p) => {
                const s = 2 + Math.random() * 3;
                p.style.width = s + 'px'; p.style.height = (s * 3) + 'px';
                p.style.borderRadius = '1px';
                const l = 75 + Math.floor(Math.random() * 20);
                p.style.background = `hsl(210,15%,${l}%)`;
                p.style.boxShadow = `0 0 6px rgba(200,210,220,0.7)`;
                p.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg)`;
            }
        },
        cristal: {
            dir: 'up', rate: 500,
            build: (p) => {
                const s = 4 + Math.random() * 7;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '1px';
                p.style.transform = `rotate(45deg)`;
                const hue = 200 + Math.floor(Math.random() * 80);
                p.style.background = `hsla(${hue},80%,75%,0.7)`;
                p.style.boxShadow = `0 0 10px hsl(${hue},90%,80%)`;
            }
        },
        raio_sub: {
            dir: 'flash', rate: 280,
            build: (p) => {
                const s = 2 + Math.random() * 4;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = '#00fff5';
                p.style.boxShadow = `0 0 12px #00fff5, 0 0 24px rgba(0,220,255,0.6)`;
            }
        },
        morte: {
            dir: 'up', rate: 700,
            build: (p) => {
                const s = 4 + Math.random() * 7;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `hsl(${280 + Math.floor(Math.random() * 30)},60%,${15 + Math.floor(Math.random() * 15)}%)`;
                p.style.boxShadow = `0 0 8px rgba(80,0,120,0.6)`;
                p.style.filter = 'blur(1px)';
            }
        },
        escuridao: {
            dir: 'up', rate: 750,
            build: (p) => {
                const s = 5 + Math.random() * 10;
                p.style.width = s + 'px'; p.style.height = s + 'px';
                p.style.borderRadius = '50%';
                p.style.background = `rgba(${Math.floor(Math.random() * 30)},0,${Math.floor(Math.random() * 40)},0.7)`;
                p.style.boxShadow = `0 0 10px rgba(30,0,50,0.9)`;
                p.style.filter = 'blur(1.5px)';
            }
        },
    };

    // Animações CSS
    const styleId = 'avatar-ambient-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .particle-avatar {
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                opacity: 0;
            }

            /* Sobe e desvanece (fogo, vida, ar, luz...) */
            @keyframes av-rise {
                0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
                10%  { opacity: 0.85; }
                80%  { opacity: 0.5; }
                100% { transform: translateY(calc(-1 * var(--dy, 110vh))) translateX(var(--dx, 0px)) scale(0.6); opacity: 0; }
            }
            /* Cai e desvanece (terra, gelo, sangue, lava) */
            @keyframes av-fall {
                0%   { top: -20px; opacity: 0; transform: translateX(0); }
                10%  { opacity: 0.8; }
                80%  { opacity: 0.5; }
                100% { top: 110vh; opacity: 0; transform: translateX(var(--dx, 0px)); }
            }
            /* Deriva horizontal (ar) */
            @keyframes av-right {
                0%   { transform: translateX(-5vw); opacity: 0; }
                5%   { opacity: 0.8; }
                90%  { opacity: 0.4; }
                100% { transform: translateX(110vw); opacity: 0; }
            }
            /* Flash (raio, atm): aparece e some rapidamente */
            @keyframes av-flash {
                0%   { opacity: 0; transform: scale(0.5); }
                20%  { opacity: 1; transform: scale(1); }
                50%  { opacity: 0.8; }
                100% { opacity: 0; transform: scale(1.5) translateY(calc(-1 * var(--dy, 30px))); }
            }
        `;
        document.head.appendChild(style);
    }

    function spawnParticle(cfg, key) {
        const p = document.createElement('div');
        p.className = 'particle-avatar';

        const dur = 4 + Math.random() * 6;
        const delay = Math.random() * 2;

        cfg.build(p);

        if (cfg.dir === 'up') {
            const startX = Math.random() * 100;
            const driftX = (Math.random() - 0.5) * 60;
            p.style.bottom = `-${8 + Math.random() * 20}px`;
            p.style.left = startX + 'vw';
            p.style.setProperty('--dy', `${100 + Math.random() * 30}vh`);
            p.style.setProperty('--dx', driftX + 'px');
            p.style.animation = `av-rise ${dur}s ${delay}s linear forwards`;
        } else if (cfg.dir === 'down') {
            p.style.top = `-10px`;
            p.style.left = (Math.random() * 100) + 'vw';
            p.style.setProperty('--dx', ((Math.random() - 0.5) * 40) + 'px');
            p.style.animation = `av-fall ${dur}s ${delay}s linear forwards`;
        } else if (cfg.dir === 'right') {
            p.style.top = (10 + Math.random() * 80) + 'vh';
            p.style.left = '-5vw';
            p.style.animation = `av-right ${dur * 0.6}s ${delay}s linear forwards`;
        } else if (cfg.dir === 'flash') {
            p.style.top = (5 + Math.random() * 90) + 'vh';
            p.style.left = (Math.random() * 100) + 'vw';
            p.style.setProperty('--dy', ((Math.random() - 0.5) * 60) + 'px');
            p.style.animation = `av-flash ${1.5 + Math.random() * 2}s ${delay * 0.5}s ease-out forwards`;
        }

        document.body.appendChild(p);
        const totalMs = (dur + delay) * 1000 + 200;
        setTimeout(() => p.remove(), totalMs);
    }

    function pararAmbient() {
        if (ambientInterval) { clearInterval(ambientInterval); ambientInterval = null; }
        document.querySelectorAll('.particle-avatar').forEach(p => p.remove());
        currentKey = null;
    }

    window.iniciarAvatarAmbient = function (elementoKey, subelementoKey) {
        // Usa subelemento se existir, senão usa o elemento principal
        const key = (subelementoKey && PARTICLE_CFG[subelementoKey]) ? subelementoKey : elementoKey;
        if (!key) return;
        if (key === currentKey) return; // já está rodando para este elemento

        pararAmbient();
        currentKey = key;

        const cfg = PARTICLE_CFG[key];
        if (!cfg) return; // elemento sem config (ignora silenciosamente)

        ambientInterval = setInterval(() => spawnParticle(cfg, key), cfg.rate);
        // Spawn alguns imediatamente para não ter delay visual
        for (let i = 0; i < 5; i++) {
            setTimeout(() => spawnParticle(cfg, key), i * 100);
        }
    };

    window.pararAvatarAmbient = pararAmbient;

    // ── Carrega ao abrir a página se já há elemento salvo ──
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Só inicia partículas na página da ficha
            if (!document.getElementById('classes-container')) return;

            const dados = JSON.parse(localStorage.getItem(window.STORAGE_KEY)) || {};

            // Verifica se há uma classe avatar realmente ativa (não apenas um elemento salvo órfão)
            const hasActiveAvatar = Object.keys(dados).some(
                k => k.startsWith('class_name_') && dados[k] === 'avatar'
            );
            if (!hasActiveAvatar) return;

            // Busca a primeira instância de avatar com elemento definido
            const eleKey = Object.keys(dados).find(k => k.startsWith('class_avatar_element_'));
            if (!eleKey) return;
            const elemento = dados[eleKey];
            const subKey = eleKey.replace('element', 'subelement');
            const subelemento = dados[subKey] || null;
            if (elemento) window.iniciarAvatarAmbient(elemento, subelemento);
        }, 400);
    });

})();
