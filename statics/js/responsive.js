(function iniciarMenuResponsivo() {
    "use strict";

    function inicializar() {
        const menu = document.querySelector(".top-menu");
        const links = document.querySelector(".menu-links");
        if (!menu || !links || document.getElementById("mobile-menu-toggle")) return;

        links.id ||= "main-menu-links";
        const botao = document.createElement("button");
        botao.id = "mobile-menu-toggle";
        botao.type = "button";
        botao.setAttribute("aria-label", "Abrir menu de navegação");
        botao.setAttribute("aria-controls", links.id);
        botao.setAttribute("aria-expanded", "false");
        botao.innerHTML = '<span aria-hidden="true">☰</span>';
        menu.insertBefore(botao, links);

        const definirAberto = aberto => {
            links.classList.toggle("active", aberto);
            botao.setAttribute("aria-expanded", String(aberto));
            botao.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
            botao.firstElementChild.textContent = aberto ? "×" : "☰";
            document.body.classList.toggle("menu-mobile-open", aberto);
        };

        botao.addEventListener("click", evento => {
            evento.stopPropagation();
            definirAberto(!links.classList.contains("active"));
        });

        menu.addEventListener("click", evento => {
            if (evento.target.closest(".menu-links a")) definirAberto(false);
        });

        document.addEventListener("click", evento => {
            if (links.classList.contains("active") && !menu.contains(evento.target)) definirAberto(false);
        });

        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && links.classList.contains("active")) {
                definirAberto(false);
                botao.focus();
            }
        });

        window.matchMedia("(min-width: 981px)").addEventListener("change", evento => {
            if (evento.matches) definirAberto(false);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicializar, { once: true });
    else inicializar();
})();
