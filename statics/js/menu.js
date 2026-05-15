document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.querySelector('.menu-links');
    if (!menuContainer) return;

    // Detecta se estamos dentro da pasta templates ou na raiz
    const isInTemplates = window.location.pathname.includes('/templates/');

    const prefix = isInTemplates ? '' : 'templates/';
    const homePrefix = isInTemplates ? '../' : '';

    // Definição dos campos padrão do menu
    const menuItems = [
        { name: 'Início', href: homePrefix + 'index.html' },
        { name: 'Ficha', href: prefix + 'ficha.html' },
        { name: 'Perícias', href: prefix + 'pericias.html' },
        { name: 'Inventário', href: prefix + 'inventario.html' },
        { name: 'Habilidades', href: prefix + 'habilidade.html' },
        { name: 'Poderes', href: prefix + 'poderes.html' },
        { name: 'Magias', href: prefix + 'magias.html' },
        { name: 'Ataques', href: prefix + 'ataques.html' },
        { name: 'Notas', href: prefix + 'notas.html' }
    ];

    let currentPath = window.location.pathname.split("/").pop();
    if (currentPath === "" || currentPath === "Ficha-RPG") currentPath = "index.html";

    // Limpa o conteúdo estático e gera o menu dinâmico
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.textContent = item.name;

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
            border-bottom: 2px solid #ff4444 !important; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 68, 68, 0.2);
            backdrop-filter: blur(10px);
            padding: 5px 0 !important;
        }
        .menu-links a { 
            color: #ffffff !important; 
            opacity: 0.6 !important;
            font-size: 0.85rem !important;
            letter-spacing: 1px;
            transition: all 0.3s ease !important;
            border-bottom: 2px solid transparent !important;
            margin: 0 10px !important;
            text-decoration: none !important;
            outline: none !important;
            background: transparent !important;
        }
        .menu-links a:hover { 
            opacity: 1 !important;
            color: #ff4444 !important; 
            text-shadow: 0 0 8px rgba(255, 68, 68, 0.5);
            background: transparent !important;
        }
        .menu-links a.active { 
            opacity: 1 !important;
            color: #ff4444 !important; 
            border-bottom: 2px solid #ff4444 !important;
            background: transparent !important;
        }
    `;
    document.head.appendChild(style);
});