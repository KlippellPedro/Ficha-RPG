document.addEventListener("DOMContentLoaded", () => {
    const emTemplates = window.location.pathname.includes("/templates/");
    const prefixoRaiz = emTemplates ? "../" : "";
    const prefixoPaginas = emTemplates ? "" : "templates/";
    const menu = document.querySelector(".top-menu");
    const menuContainer = document.querySelector(".menu-links");
    if (!menu || !menuContainer) return;

    menu.setAttribute("aria-label", "Navegação principal da ficha");
    menuContainer.id ||= "main-menu-links";

    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "shortcut icon";
        document.head.appendChild(favicon);
    }
    favicon.href = `${prefixoRaiz}favicon.ico`;

    if (!menu.querySelector(".menu-brand")) {
        const marca = document.createElement("span");
        marca.className = "menu-brand";
        marca.setAttribute("aria-hidden", "true");
        marca.innerHTML = '<span class="menu-brand-mark">S</span><span class="menu-brand-name">Supremacia</span>';
        menu.insertBefore(marca, menuContainer);
    }

    const params = new URLSearchParams(window.location.search);
    const allyId = params.get("allyId");
    let itens = [
        { nome: "Ficha", href: "ficha.html" },
        { nome: "Perícias", href: "pericias.html" },
        { nome: "Inventário", href: "inventario.html" },
        { nome: "Habilidades", href: "habilidade.html" },
        { nome: "Poderes", href: "poderes.html" },
        { nome: "Magias", href: "magias.html" },
        { nome: "Aliados", href: "aliados.html" },
        { nome: "Ataques", href: "ataques.html" },
        { nome: "Notas", href: "notas.html" }
    ];

    if (allyId) {
        itens = itens.filter(item => item.nome !== "Aliados");
        itens.unshift({ nome: "Voltar à ficha principal", href: "ficha.html", voltar: true });
    }

    const arquivoAtual = window.location.pathname.split("/").pop() || "index.html";
    menuContainer.replaceChildren();
    itens.forEach(item => {
        const link = document.createElement("a");
        let href = `${prefixoPaginas}${item.href}`;
        if (allyId && !item.voltar) href += `?allyId=${encodeURIComponent(allyId)}`;
        link.href = href;
        link.textContent = item.nome;
        if (item.voltar) link.classList.add("menu-link-back");
        if (item.href === arquivoAtual) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
        menuContainer.appendChild(link);
    });

    const botaoConfiguracao = document.getElementById("btn-open-config");
    if (botaoConfiguracao) {
        botaoConfiguracao.removeAttribute("style");
        botaoConfiguracao.classList.add("menu-config-button");
        botaoConfiguracao.setAttribute("aria-label", "Configurações de aparência");
        menu.appendChild(botaoConfiguracao);
    }

    document.dispatchEvent(new CustomEvent("supremacia:menu-ready"));
});
