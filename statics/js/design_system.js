(function iniciarSupremaciaUI() {
    "use strict";

    const reduzirMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const seletorFoco = [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    function inferirPagina() {
        const arquivo = window.location.pathname.split("/").pop() || "index.html";
        return arquivo.replace(/\.html$/i, "") || "inicio";
    }

    function marcarRevelacao() {
        const alvos = document.querySelectorAll([
            ".page-hero",
            ".pericias-page-header",
            ".inventory-title",
            ".poderes-intro",
            ".filter-bar",
            ".collection-panel",
            ".skills-section",
            ".inventory-container > .weight-stats",
            ".ficha-section",
            ".aliados-actions",
            ".aliados-grid"
        ].join(","));

        alvos.forEach((elemento, indice) => {
            if (elemento.closest("dialog")) return;
            elemento.classList.add("ui-reveal");
            elemento.style.setProperty("--ui-order", Math.min(indice, 6));
        });
    }

    function tituloDoDialogo(dialogo) {
        return dialogo.querySelector(".modal-title, h1, h2, h3");
    }

    function atualizarBloqueioDaPagina() {
        document.body.classList.toggle("modal-open", Boolean(document.querySelector("dialog[open]")));
    }

    function prepararDialogo(dialogo) {
        if (!(dialogo instanceof HTMLDialogElement) || dialogo.dataset.uiPrepared === "true") return;
        dialogo.dataset.uiPrepared = "true";
        dialogo.setAttribute("aria-modal", "true");

        const titulo = tituloDoDialogo(dialogo);
        if (titulo) {
            if (!titulo.id) titulo.id = `${dialogo.id || "modal"}-titulo`;
            if (!dialogo.hasAttribute("aria-labelledby")) dialogo.setAttribute("aria-labelledby", titulo.id);
        } else if (!dialogo.hasAttribute("aria-label")) {
            dialogo.setAttribute("aria-label", "Janela de diálogo");
        }

        dialogo.querySelectorAll(".btn-remove-class").forEach(botao => {
            if (!botao.getAttribute("aria-label")) botao.setAttribute("aria-label", "Fechar janela");
        });

        dialogo.addEventListener("close", () => {
            atualizarBloqueioDaPagina();
            const anterior = dialogo.__supremaciaFocoAnterior;
            if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus({ preventScroll: true });
            dialogo.__supremaciaFocoAnterior = null;
        });
    }

    function dialogoFoiAberto(dialogo) {
        prepararDialogo(dialogo);
        if (!dialogo.open) return;
        if (!dialogo.__supremaciaFocoAnterior) dialogo.__supremaciaFocoAnterior = document.activeElement;
        atualizarBloqueioDaPagina();

        requestAnimationFrame(() => {
            const focoInicial = dialogo.querySelector("[autofocus]") || dialogo.querySelector(seletorFoco);
            if (focoInicial instanceof HTMLElement && !dialogo.contains(document.activeElement)) {
                focoInicial.focus({ preventScroll: true });
            }
        });
    }

    function observarInterface() {
        const observer = new MutationObserver(mudancas => {
            mudancas.forEach(mudanca => {
                if (mudanca.type === "attributes" && mudanca.target instanceof HTMLDialogElement) {
                    if (mudanca.target.open) dialogoFoiAberto(mudanca.target);
                    else atualizarBloqueioDaPagina();
                    return;
                }

                mudanca.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    const dialogs = node.matches("dialog") ? [node] : Array.from(node.querySelectorAll("dialog"));
                    dialogs.forEach(prepararDialogo);

                    const cards = node.matches(".item-row, .ui-card, .ally-card")
                        ? [node]
                        : Array.from(node.querySelectorAll(".item-row, .ui-card, .ally-card"));
                    if (!reduzirMovimento?.matches) {
                        cards.forEach(card => {
                            card.classList.add("ui-enter");
                            card.addEventListener("animationend", () => card.classList.remove("ui-enter"), { once: true });
                        });
                    }
                });
            });
        });

        observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
    }

    function manterFocoNoDialogo(evento) {
        if (evento.key !== "Tab") return;
        const dialogo = document.querySelector("dialog[open]");
        if (!dialogo) return;
        const focaveis = Array.from(dialogo.querySelectorAll(seletorFoco)).filter(elemento => {
            const estilo = window.getComputedStyle(elemento);
            return estilo.display !== "none" && estilo.visibility !== "hidden";
        });
        if (!focaveis.length) return;

        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }

    function inicializar() {
        document.documentElement.classList.add("ui-enhanced");
        document.body.dataset.page ||= inferirPagina();
        document.querySelectorAll("dialog").forEach(prepararDialogo);
        marcarRevelacao();
        observarInterface();
        document.addEventListener("keydown", manterFocoNoDialogo, true);
        requestAnimationFrame(() => document.body.classList.add("ui-ready"));
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicializar, { once: true });
    else inicializar();
})();
