/**
 * Loader Automático de Raças
 * Centraliza o carregamento dos pacotes de raças (Atual, Olimpo, etc).
 */
(function () {
    // Garante que o objeto de dados das raças exista antes de carregar os arquivos
    window.RACAS_DATA = window.RACAS_DATA || {};

    // 1. REGISTRO DE PACOTES DE RAÇAS
    // Lista os arquivos dentro de /statics/js/ficha/racas/
    const racaRegistry = [
        'racas_atual_data',
        'racas_olimpo_data'
    ];

    // 2. RESOLUÇÃO DE CAMINHO
    const isInTemplates = window.location.pathname.includes('/templates/');
    const prefix = isInTemplates ? '../' : './';
    const basePath = prefix + 'statics/js/ficha/racas/';

    // 3. INJEÇÃO SÍNCRONA
    racaRegistry.forEach(file => {
        // O uso de document.write aqui garante que os dados carreguem na ordem correta
        // e estejam disponíveis para o global.js e ficha_racas.js
        document.write(`<script src="${basePath}${file}.js"></script>`);
    });

    console.log(`[RacaLoader] Foram carregados ${racaRegistry.length} pacotes de raças.`);
})();