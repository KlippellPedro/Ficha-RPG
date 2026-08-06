class SPARouter {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    init() {
        document.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (!link || !link.href) return;
            
            // Ignorar links externos, âncoras locais ou novas abas
            if (link.origin !== window.location.origin || link.hash || link.target === '_blank') return;
            
            // Ignorar mesma página (pode ser um toggle)
            if (link.pathname === window.location.pathname) return;

            e.preventDefault();
            this.navigate(link.href);
        });

        window.addEventListener('popstate', () => {
            this.navigate(window.location.href, false);
        });
        
        // Prefetch inteligente no hover para carregamento instantâneo
        document.addEventListener('mouseover', e => {
            const link = e.target.closest('a');
            if (link && link.href && link.origin === window.location.origin && !this.cache.has(link.href)) {
                this.prefetch(link.href);
            }
        });
    }

    async prefetch(url) {
        try {
            const res = await fetch(url);
            const html = await res.text();
            this.cache.set(url, html);
        } catch (err) {}
    }

    async navigate(url, pushState = true) {
        // 1. Iniciar transição de saída (fade out)
        document.body.classList.add('spa-transitioning');
        
        try {
            let html = this.cache.get(url);
            if (!html) {
                const res = await fetch(url);
                html = await res.text();
                this.cache.set(url, html);
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Aguardar um instante para o CSS de fade-out aplicar visualmente
            await new Promise(r => setTimeout(r, 200));

            // 2. Atualizar Metadados
            document.title = doc.title;
            document.body.className = doc.body.className;

            // 3. Mesclar novos scripts/estilos no Head
            this.updateHead(doc);

            // 4. Substituir conteúdo principal
            // Salvar o notification container se necessário, mas substituir body é mais simples
            document.body.innerHTML = doc.body.innerHTML;

            // 5. Re-avaliar scripts inseridos no body (necessário para scripts inline funcionarem pós-innerHtml)
            this.reEvaluateScripts(document.body);

            // 6. Refazer bindings (simular carregamento)
            window.dispatchEvent(new Event('DOMContentLoaded'));
            document.dispatchEvent(new Event('DOMContentLoaded'));
            document.dispatchEvent(new CustomEvent('supremacia:menu-ready'));

            if (pushState) {
                window.history.pushState({}, '', url);
            }
            
            // Rolar pro topo suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error("SPA Navigation failed, fallback to native", err);
            window.location.href = url; // Fallback
        } finally {
            // 7. Transição de entrada (fade in)
            document.body.classList.remove('spa-transitioning');
            // Forçar reflow para reiniciar animação
            void document.body.offsetWidth;
            document.body.classList.add('spa-transition-in');
            
            setTimeout(() => {
                document.body.classList.remove('spa-transition-in');
            }, 400);
        }
    }

    updateHead(newDoc) {
        const currentLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
        const currentScripts = Array.from(document.head.querySelectorAll('script[src]')).map(s => s.getAttribute('src'));

        newDoc.head.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (!currentLinks.includes(href)) {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href;
                document.head.appendChild(newLink);
            }
        });

        newDoc.head.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            if (!currentScripts.includes(src)) {
                const newScript = document.createElement('script');
                newScript.src = src;
                document.head.appendChild(newScript);
            }
        });
    }

    reEvaluateScripts(container) {
        const scripts = Array.from(container.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            if (!oldScript.src) { // Ignorar src porque já estão no head ou não queremos duplicar loading assíncrono do body se houver
                const newScript = document.createElement('script');
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        });
    }
}

// Inicializar após carregamento
window.addEventListener('DOMContentLoaded', () => {
    if (!window.spaRouter) {
        window.spaRouter = new SPARouter();
    }
});
