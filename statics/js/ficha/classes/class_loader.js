/**
 * Loader Automático de Classes
 * Este arquivo centraliza o carregamento de todos os módulos de classe.
 * Adicione o nome do arquivo da classe na lista abaixo para ativá-la no sistema.
 */
(function () {
    // 1. LISTA DE CLASSES: Adicione apenas o nome do arquivo (sem o .js)
    const classes = [
        'cientista',
        'ceifeiro_almas',
        'lobo_solitario',
        'atirador_elite',
        'militar',
        'assassino',
        'lutador_nato',
        'especialista_medico',
        'amante_oculto',
        'deus_acima',
        'diplomata',
        'mestre_cuca',
        'amigo_animais',
        'astro_rock',
        'contrabandista',
        'caca_recompensas',
        'multiclasse',
        'avatar',
        'demonio',
        'anjo',
        'olimpo',
        '../classes_olimpo_data/campeao'
    ];

    // 2. RESOLUÇÃO DE CAMINHO: Detecta se está em /templates ou na raiz
    const isInTemplates = window.location.pathname.includes('/templates/');
    const prefix = isInTemplates ? '../' : './';
    const basePath = prefix + 'statics/js/ficha/classes/classes_data/';

    // 3. INJEÇÃO: Carrega os scripts de forma síncrona para garantir a ordem
    classes.forEach(className => {
        // O uso de document.write aqui garante que os dados carreguem antes do global.js
        document.write(`<script src="${basePath}${className}.js"></script>`);
    });
})();