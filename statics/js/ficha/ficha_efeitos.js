/**
 * Lógica de efeitos visuais e ambientais (partículas)
 */

/**
 * Cria um efeito visual de fumaça na posição de um elemento
 */
function criarEfeitoFumaca(elemento) {
    const rect = elemento.getBoundingClientRect();
    const numParticulas = 25;

    for (let i = 0; i < numParticulas; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';

        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const size = 20 + Math.random() * 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${Math.random() * 0.4}s`;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2500);
    }
}

/**
 * Efeito épico de alma escapando — usado quando Ceifeiro remove outras classes.
 * Cria almas visíveis flutuando para cima a partir do elemento removido.
 */
function criarEfeitoAlmaEscapando(elemento) {
    const rect = elemento.getBoundingClientRect();

    // Almas principais (orbes maiores)
    for (let i = 0; i < 8; i++) {
        const soul = document.createElement('div');
        soul.className = 'soul-escape-orb';
        const x = rect.left + rect.width * 0.2 + Math.random() * rect.width * 0.6;
        const y = rect.top + Math.random() * rect.height;
        const size = 18 + Math.random() * 28;
        const dx = (Math.random() - 0.5) * 120;
        soul.style.cssText = `
            position:fixed; pointer-events:none; z-index:10002;
            left:${x}px; top:${y}px;
            width:${size}px; height:${size}px;
            border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
            background: radial-gradient(circle at 40% 35%, rgba(180,255,230,0.95) 0%, rgba(0,255,200,0.7) 35%, rgba(0,80,60,0.5) 70%, transparent 100%);
            box-shadow: 0 0 ${size}px rgba(0,255,190,0.7), 0 0 ${size*2}px rgba(0,200,150,0.3);
            filter: blur(1.5px);
            --dx: ${dx}px;
            animation: soul-orb-escape ${1.4 + Math.random() * 0.8}s ease-out forwards;
            animation-delay: ${Math.random() * 0.3}s;
        `;
        document.body.appendChild(soul);
        setTimeout(() => soul.remove(), 2600);
    }

    // Faíscas de alma (pequenas) — coordenadas pré-calculadas em JS
    for (let i = 0; i < 16; i++) {
        const spark = document.createElement('div');
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        const size = 4 + Math.random() * 8;
        const angleRad = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 100;
        const tx = Math.cos(angleRad) * dist;
        const ty = Math.sin(angleRad) * dist - 60;
        spark.style.cssText = `
            position:fixed; pointer-events:none; z-index:10002;
            left:${x}px; top:${y}px;
            width:${size}px; height:${size}px;
            border-radius:50%;
            background: radial-gradient(circle, #aafff0, #00ffd2);
            box-shadow: 0 0 8px #00ffd2, 0 0 16px rgba(0,255,200,0.5);
            --tx:${tx}px; --ty:${ty}px;
            animation: soul-spark-burst ${0.6 + Math.random() * 0.5}s ease-out forwards;
            animation-delay: ${Math.random() * 0.2}s;
        `;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 1200);
    }

    // Injetar keyframes se ainda não existem
    if (!document.getElementById('soul-escape-style')) {
        const s = document.createElement('style');
        s.id = 'soul-escape-style';
        s.textContent = `
            @keyframes soul-orb-escape {
                0%   { transform: translate(-50%,-50%) scale(0.3); opacity:0; }
                15%  { opacity:1; transform: translate(-50%,-50%) scale(1.1); }
                50%  { transform: translate(calc(-50% + var(--dx,0px)*0.5), calc(-50% - 80px)) scale(0.9); opacity:0.9; }
                100% { transform: translate(calc(-50% + var(--dx,0px)), calc(-50% - 220px)) scale(0.2) rotate(30deg);
                       opacity:0; filter:blur(8px); }
            }
            @keyframes soul-spark-burst {
                0%   { transform: translate(-50%,-50%) scale(1); opacity:1; }
                100% { transform: translate(calc(-50% + var(--tx,0px)), calc(-50% + var(--ty,0px))) scale(0);
                       opacity:0; }
            }
        `;
        document.head.appendChild(s);
    }
}

/**
 * Gerencia os efeitos ambientes flutuando pela tela de forma cumulativa
 */
let activeAmbientIntervals = {};

// Configuração de spawn por tipo de partícula
const AMBIENT_CFG = {
    // fromTop: true = partícula nasce no topo e cai; false/undefined = nasce embaixo e sobe
    feather: { rate: 720, fromTop: true, build: (p) => {
        const w = 5 + Math.random() * 7;
        const h = w * 2.2;
        p.style.width = w + 'px';
        p.style.height = h + 'px';
        p.style.setProperty('--rot-start', (Math.random() * 60 - 10) + 'deg');
        p.style.setProperty('--rot-mid',   (100 + Math.random() * 120) + 'deg');
        p.style.setProperty('--rot-end',   (300 + Math.random() * 120) + 'deg');
        p.style.setProperty('--dx',  ((Math.random() - 0.5) * 80) + 'px');
        p.style.setProperty('--dx2', ((Math.random() - 0.5) * 60) + 'px');
    }},
    divine: { rate: 520, build: (p) => {
        const s = 3 + Math.random() * 6;
        p.style.width = s + 'px';
        p.style.height = s + 'px';
        p.style.setProperty('--dy', (60 + Math.random() * 60) + 'vh');
    }},
    ember: { rate: 560, build: (p) => {
        const s = 4 + Math.random() * 7;
        p.style.width = s + 'px';
        p.style.height = s + 'px';
        p.style.setProperty('--dx1', ((Math.random() - 0.5) * 50) + 'px');
        p.style.setProperty('--dx2', ((Math.random() - 0.5) * 40) + 'px');
        p.style.setProperty('--dx3', ((Math.random() - 0.5) * 60) + 'px');
    }},
    hellfire: { rate: 870, build: (p) => {
        const w = 8 + Math.random() * 14;
        const h = w * (1.4 + Math.random() * 0.8);
        p.style.width = w + 'px';
        p.style.height = h + 'px';
    }},
    soul: { rate: 620, build: (p) => {
        const s = 8 + Math.random() * 10;
        p.style.width = s + 'px';
        p.style.height = (s * 1.6) + 'px';
        p.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'px');
    }},
};

function _spawnAmbientParticle(tipo, cfg) {
    const particle = document.createElement('div');
    particle.className = `floating-particle particle-${tipo}`;

    const duration = 4 + Math.random() * 5;
    // Delay NEGATIVO: partícula já começa em movimento, sem "congelamento" inicial
    const delay = -(Math.random() * duration * 0.4);

    const x = Math.random() * 100;
    particle.style.left = `${x}vw`;

    if (cfg && cfg.fromTop) {
        particle.style.top = '-20px';
    } else {
        particle.style.bottom = '-20px';
    }

    particle.style.setProperty('--duration', `${duration}s`);
    particle.style.animationDelay = `${delay}s`;

    if (cfg && cfg.build) cfg.build(particle);

    document.body.appendChild(particle);
    // Remoção baseada na duração real (sem o delay negativo pois já começa "no meio")
    setTimeout(() => particle.remove(), (duration + 0.3) * 1000);
}

function gerenciarEfeitosAmbientes(tiposAtivos = []) {
    // Limpa efeitos que não estão mais presentes
    Object.keys(activeAmbientIntervals).forEach(tipo => {
        if (!tiposAtivos.includes(tipo)) {
            clearInterval(activeAmbientIntervals[tipo]);
            delete activeAmbientIntervals[tipo];
            document.querySelectorAll(`.particle-${tipo}`).forEach(p => p.remove());
        }
    });

    // Inicia novos efeitos
    tiposAtivos.forEach(tipo => {
        if (activeAmbientIntervals[tipo]) return;

        const cfg = AMBIENT_CFG[tipo];
        const rate = cfg ? cfg.rate : 700;

        // Burst inicial — evita tela vazia ao ativar
        for (let i = 0; i < 4; i++) {
            setTimeout(() => _spawnAmbientParticle(tipo, cfg), i * 80);
        }

        activeAmbientIntervals[tipo] = setInterval(
            () => _spawnAmbientParticle(tipo, cfg),
            rate
        );
    });
}
