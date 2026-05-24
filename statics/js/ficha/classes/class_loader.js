/**
 * Loader Automático de Classes
 * Este arquivo centraliza o carregamento de todos os módulos de classe.
 * As classes são organizadas por pacotes (pastas) para facilitar a manutenção.
 */
(function () {
    // Garante que o objeto de dados das classes exista antes de carregar os arquivos
    window.CLASSES_DATA = window.CLASSES_DATA || {};

    // 1. REGISTRO DE PACOTES: 
    // Chave: Nome da pasta dentro de /statics/js/ficha/classes/
    // Valor: Lista de arquivos .js dentro dessa pasta
    const classRegistry = {
        "classes_atual_data": [
            'cientista', 'ceifeiro_almas', 'lobo_solitario', 'atirador_elite',
            'militar', 'assassino', 'lutador_nato', 'especialista_medico',
            'amante_oculto', 'deus_acima', 'diplomata', 'mestre_cuca',
            'amigo_animais', 'astro_rock', 'contrabandista', 'caca_recompensas',
            'multiclasse', 'avatar', 'demonio', 'anjo'
        ],
        "classes_olimpo_data": [
            'campeao', 'necromante'
        ]
    };

    // 2. RESOLUÇÃO DE CAMINHO: Detecta se está em /templates ou na raiz
    const isInTemplates = window.location.pathname.includes('/templates/');
    const prefix = isInTemplates ? '../' : './';
    const baseRoot = prefix + 'statics/js/ficha/classes/';

    // 3. INJEÇÃO: Carrega os scripts de forma síncrona para garantir a ordem
    Object.entries(classRegistry).forEach(([folder, files]) => {
        files.forEach(file => {
            const path = `${baseRoot}${folder}/${file}.js`;
            document.write(`<script src="${path}"></script>`);
        });
    });

    console.log(`[Loader] Foram carregadas ${Object.values(classRegistry).flat().length} classes de ${Object.keys(classRegistry).length} pacotes.`);
})();