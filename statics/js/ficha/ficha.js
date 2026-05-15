/**
 * Orquestrador da Ficha de Personagem
 * Este arquivo coordena a inicialização e a integração de módulos específicos da ficha.
 * A lógica detalhada foi distribuída em arquivos especializados nas subpastas /classe e /raca.
 */

// Inicialização da Ficha
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a lógica de raças (população de seletores e restauração)
    if (typeof initRaces === 'function') {
        initRaces();
    }

    // Inicializa a lógica de classes (restauração de classes salvas e UI dinâmica)
    if (typeof initClasses === 'function') {
        initClasses();
    }

    // Dispara a primeira atualização global de cálculos e visibilidade
    if (typeof atualizarTudo === 'function') {
        atualizarTudo();
    }
});