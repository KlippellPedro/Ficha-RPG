document.addEventListener('DOMContentLoaded', () => {
    // Detecta se estamos dentro da pasta templates ou na raiz
    const isInTemplates = window.location.pathname.includes('/templates/');
    const homePrefix = isInTemplates ? '../' : '';

    // --- Configuração Automática do Favicon ---
    // Procura por uma tag favicon existente ou cria uma nova dinamicamente.
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'shortcut icon';
        document.head.appendChild(favicon);
    }
    // Define o caminho para a raiz. Quando a arte estiver pronta, salve-a como 'favicon.ico' na raiz do projeto.
    // Caso a imagem seja um PNG, basta mudar para 'favicon.png' abaixo.
    favicon.href = homePrefix + 'favicon.ico';

    const menuContainer = document.querySelector('.menu-links');
    if (!menuContainer) return;

    const prefix = isInTemplates ? '' : 'templates/';

    // Detecta se estamos no contexto de um aliado
    const urlParams = new URLSearchParams(window.location.search);
    const allyId = urlParams.get('allyId');

    // Definição dos campos padrão do menu
    let menuItems = [
        { name: 'Início', href: homePrefix + 'index.html' },
        { name: 'Ficha', href: prefix + 'ficha.html' },
        { name: 'Aliados', href: prefix + 'aliados.html' },
        { name: 'Perícias', href: prefix + 'pericias.html' },
        { name: 'Inventário', href: prefix + 'inventario.html' },
        { name: 'Habilidades', href: prefix + 'habilidade.html' },
        { name: 'Poderes', href: prefix + 'poderes.html' },
        { name: 'Magias', href: prefix + 'magias.html' },
        { name: 'Ataques', href: prefix + 'ataques.html' },
        { name: 'Notas', href: prefix + 'notas.html' }
    ];

    // Se for um aliado: Esconde "Aliados" e adiciona "Voltar"
    if (allyId) {
        menuItems = menuItems.filter(item => item.name !== 'Aliados' && item.name !== 'Início');

        // Adiciona o botão de retorno ao início do menu
        menuItems.unshift({
            name: '⬅ VOLTAR À FICHA PRINCIPAL',
            href: prefix + 'ficha.html',
            isBackBtn: true
        });

        // Mantém o contexto do aliado em todos os outros links internos
        menuItems.forEach(item => {
            if (!item.isBackBtn) {
                item.href += `?allyId=${allyId}`;
            }
        });
    }

    let currentPath = window.location.pathname.split("/").pop();
    if (currentPath === "" || currentPath === "Ficha-RPG") currentPath = "index.html";

    // Limpa o conteúdo estático e gera o menu dinâmico
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.textContent = item.name;

        if (item.isBackBtn) {
            a.style.setProperty('color', 'var(--primary-color)', 'important');
            a.style.fontWeight = '800';
        }

        if (item.href.includes(currentPath) && currentPath !== "") {
            a.classList.add('active');
        }

        menuContainer.appendChild(a);
    });

    // Injeção dinâmica do tema Supremacia do Protesto para o menu
    const style = document.createElement('style');
    style.textContent = `
        .top-menu { 
            background: rgba(13, 13, 15, 0.98) !important; 
            border-bottom: 2px solid var(--primary-color) !important; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px var(--primary-glow);
            backdrop-filter: blur(10px);
            padding: 5px 0 !important;
        }
        .menu-links a { 
            color: #ffffff !important; 
            opacity: 0.7 !important;
            font-size: 0.85rem !important;
            letter-spacing: 1px;
            transition: all 0.3s ease !important;
            border-bottom: 2px solid transparent !important;
            padding-bottom: 4px !important;
            margin: 0 10px !important;
            text-decoration: none !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
            position: relative !important;
        }
        .menu-links a::after, .menu-links a::before {
            content: none !important;
            display: none !important;
        }
        .menu-links a:hover { 
            opacity: 1 !important;
            color: var(--primary-color) !important; 
            text-decoration: none !important;
            text-shadow: 0 0 8px var(--primary-glow);
            background: transparent !important;
            border-bottom: 2px solid var(--primary-color) !important;
        }
        .menu-links a.active { 
            opacity: 1 !important;
            text-decoration: none !important;
            color: var(--primary-color) !important; 
            border-bottom: 2px solid var(--primary-color) !important;
            background: transparent !important;
        }
    `;
    document.head.appendChild(style);
});