/**
 * Loader Dinâmico de CSS para Classes
 * Garante que os estilos específicos sejam carregados apenas quando necessário.
 */
(function () {
    const loadedStyles = new Set();

    /**
     * Carrega um arquivo CSS de classe se ele ainda não estiver presente.
     * @param {string} className - Nome da classe (deve corresponder ao nome do arquivo .css)
     */
    window.loadClassCSS = function (className) {
        if (!className || loadedStyles.has(className)) return;

        // Mapeamento de nomes de classe para nomes de arquivos CSS (caso sejam diferentes)
        const map = {
            'ceifeiro_almas': 'ceifeiro',
            'anjo': 'anjos_demonios',
            'demonio': 'anjos_demonios',
            'avatar': 'avatar',
            'campeao': 'olimpo',
            'necromante': 'olimpo'
        };

        const fileName = map[className] || className;

        // Resolução de caminho (mesma lógica do class_loader.js)
        const isInTemplates = window.location.pathname.includes('/templates/');
        const prefix = isInTemplates ? '../' : './';
        const cssPath = `${prefix}statics/css/ficha/classes/${fileName}.css`;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssPath;
        link.id = `css-class-${fileName}`;

        document.head.appendChild(link);
        loadedStyles.add(className);

        console.log(`[CSS Loader] Estilo carregado: ${fileName}.css`);
    };
})();