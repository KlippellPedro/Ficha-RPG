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
 * Gerencia os efeitos ambientes flutuando pela tela de forma cumulativa
 */
let activeAmbientIntervals = {};
function gerenciarEfeitosAmbientes(tiposAtivos = []) {
    // Limpa efeitos que não estão mais presentes
    Object.keys(activeAmbientIntervals).forEach(tipo => {
        if (!tiposAtivos.includes(tipo)) {
            clearInterval(activeAmbientIntervals[tipo]);
            delete activeAmbientIntervals[tipo];
            document.querySelectorAll(`.particle-${tipo}`).forEach(p => p.remove());
        }
    });

    const spawnRate = tiposAtivos.length > 1 ? 800 : 600;

    // Inicia novos efeitos
    tiposAtivos.forEach(tipo => {
        if (!activeAmbientIntervals[tipo]) {
            activeAmbientIntervals[tipo] = setInterval(() => {
                const particle = document.createElement('div');
                particle.className = `floating-particle particle-${tipo}`;

                const x = Math.random() * 100;
                const duration = 5 + Math.random() * 5;
                const delay = Math.random() * 5;

                particle.style.left = `${x}vw`;
                particle.style.setProperty('--duration', `${duration}s`);
                particle.style.animationDelay = `${delay}s`;

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), (duration + delay) * 1000);
            }, spawnRate);
        }
    });
}