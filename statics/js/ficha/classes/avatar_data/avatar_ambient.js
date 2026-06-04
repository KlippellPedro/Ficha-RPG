/**
 * Avatar Ambient — Anima o fundo da ficha com o elemento do Avatar
 * Requer que window.createAvatarEngine esteja disponível (carregado por avatar_ui.js)
 */
(function () {

    let ambientCanvas = null;
    let ambientEngine = null;
    let ambientFrame = 0;
    let ambientRaf = null;
    let currentKey = null;

    function criarCanvas() {
        if (ambientCanvas) return;
        ambientCanvas = document.createElement('canvas');
        ambientCanvas.id = 'avatar-ambient-canvas';
        ambientCanvas.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0;
            transition: opacity 1.5s ease;
        `;
        document.body.insertBefore(ambientCanvas, document.body.firstChild);
        // Resize
        function resize() {
            if (!ambientCanvas) return;
            ambientCanvas.width = window.innerWidth;
            ambientCanvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);
    }

    function pararLoop() {
        if (ambientRaf) { cancelAnimationFrame(ambientRaf); ambientRaf = null; }
        ambientEngine = null;
    }

    window.iniciarAvatarAmbient = function (elementoKey, subelementoKey) {
        // Usa subelemento se disponível, senão usa elemento principal
        const key = subelementoKey || elementoKey;
        if (!key || key === currentKey) return;
        currentKey = key;

        if (!window.createAvatarEngine) return;

        criarCanvas();

        pararLoop();

        // Fade out antes de trocar
        ambientCanvas.style.opacity = '0';

        setTimeout(() => {
            if (!ambientCanvas) return;
            ambientCanvas.width = window.innerWidth;
            ambientCanvas.height = window.innerHeight;

            ambientEngine = window.createAvatarEngine(key, ambientCanvas);

            function loop() {
                ambientFrame++;
                if (ambientEngine) ambientEngine(ambientFrame);
                ambientRaf = requestAnimationFrame(loop);
            }
            loop();

            // Fade in suave
            ambientCanvas.style.opacity = '0.07';
        }, 400);
    };

    window.pararAvatarAmbient = function () {
        if (ambientCanvas) ambientCanvas.style.opacity = '0';
        setTimeout(pararLoop, 1500);
        currentKey = null;
    };

    // ── Carrega o fundo ao iniciar a página se já há elemento salvo ──
    document.addEventListener('DOMContentLoaded', () => {
        // Aguarda avatar_ui.js criar createAvatarEngine
        setTimeout(() => {
            if (!window.createAvatarEngine) return;
            const dados = JSON.parse(localStorage.getItem(window.STORAGE_KEY)) || {};

            // Busca a primeira instância de avatar ativa
            const elementoKey = Object.keys(dados).find(k => k.startsWith('class_avatar_element_'));
            const subKey = elementoKey
                ? dados[elementoKey.replace('element', 'subelement')]
                : null;
            const ele = elementoKey ? dados[elementoKey] : null;

            if (ele) window.iniciarAvatarAmbient(ele, subKey || null);
        }, 300);
    });

})();
