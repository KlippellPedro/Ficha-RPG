/**
 * UI e Modais específicos para a classe Avatar
 * Responsável por gerenciar a escolha de elementos e evoluções.
 */
(function () {
    // 1. Definição do HTML do Modal (Injetado via JS para manter o HTML principal limpo)
    const modalHtml = `
        <div id="modal-avatar-despertar" class="modal-overlay" style="display: none; z-index: 3000;">
            <div class="modal-content avatar-epic-modal" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 id="avatar-modal-title" class="modal-title">Quem sou eu ?</h3>
                </div>
                <div class="modal-body">
                    <p id="avatar-modal-desc" class="avatar-desc" style="text-align: center; margin-bottom: 20px; color: #aaa;">Os elementos são a essência do seu ser. Qual deles representa você?</p>
                    <div id="avatar-element-grid" class="avatar-selection-grid">
                        <!-- Gerado dinamicamente -->
                    </div>
                </div>
                <div class="modal-footer">
                    <p style="font-size: 0.7rem; color: #666; width: 100%; text-align: center;">Esta escolha define sua jornada inicial como Avatar.</p>
                </div>
            </div>
        </div>
    `;

    // 2. Injeta o modal no Body ao carregar
    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });

    /**
     * Abre o modal de seleção de elemento principal.
     * @param {string} classIdx - O índice da classe na ficha (ex: 0, 1, 2)
     */
    window.abrirModalEscolhaElemento = function (classIdx) {
        const container = document.getElementById('avatar-element-grid');
        if (!container) return;

        document.getElementById('avatar-modal-title').innerText = "Quem sou eu ?";
        document.getElementById('avatar-modal-desc').innerText = "Os elementos são a essência do seu ser. Qual deles representa você?";

        // Filtra apenas os elementos principais da nossa base de dados
        const principais = Object.keys(window.AVATAR_ELEMENTS_DATA)
            .filter(key => window.AVATAR_ELEMENTS_DATA[key].tipo === "Principal");

        container.innerHTML = principais.map(key => {
            const el = window.AVATAR_ELEMENTS_DATA[key];
            return `
                <div class="element-card card-${key}" onclick="confirmarEscolhaElemento('${classIdx}', '${key}')">
                    <div class="element-glow"></div>
                    <span class="element-name">${el.nome}</span>
                </div>
            `;
        }).join('');

        document.getElementById('modal-avatar-despertar').style.display = 'flex';
    };

    /**
     * Abre o modal de seleção de subelemento baseado no elemento pai.
     */
    window.abrirModalEscolhaSubelemento = function (classIdx, elementoPai) {
        const container = document.getElementById('avatar-element-grid');
        if (!container) return;

        const elData = window.AVATAR_ELEMENTS_DATA[elementoPai];
        if (!elData || !elData.subelementos) return;

        document.getElementById('avatar-modal-title').innerText = "EVOLUÇÃO ELEMENTAL";
        document.getElementById('avatar-modal-desc').innerText = `Seu domínio sobre o ${elData.nome} atingiu 50%. Qual caminho de especialização você seguirá?`;

        container.innerHTML = elData.subelementos.map(key => {
            const sub = window.AVATAR_ELEMENTS_DATA[key];
            if (!sub) return '';

            // Se for o subelemento de evolução pura (ex: fogo_verdadeiro), usamos uma classe especial
            const isPure = key.includes('_sub') || key.includes('_verdadeiro');

            return `
                <div class="element-card card-${elementoPai} ${isPure ? 'card-evolution-pure' : ''}" 
                     onclick="confirmarEscolhaSubelemento('${classIdx}', '${key}')"
                     title="${sub.descricao || ''}">
                    <div class="element-glow"></div>
                    <span class="element-name">${sub.nome}</span>
                    <small style="font-size: 0.6rem; opacity: 0.7; display: block; margin-top: 5px;">${isPure ? 'Aprimoramento' : 'Sub-Elemento'}</small>
                </div>
            `;
        }).join('');

        document.getElementById('modal-avatar-despertar').style.display = 'flex';
    };

    /**
     * Salva a escolha do elemento e fecha o modal
     * @param {string} idx - O índice da linha da classe
     * @param {string} elemento - A chave do elemento escolhido
     */
    window.confirmarEscolhaElemento = function (idx, elemento) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        // Salva o elemento escolhido nos dados da classe
        dados[`class_avatar_element_${idx}`] = elemento;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

        document.getElementById('modal-avatar-despertar').style.display = 'none';

        // Força a atualização do nome no select imediatamente
        const select = document.getElementById(`class_name_${idx}`);
        if (select) {
            const elData = window.AVATAR_ELEMENTS_DATA?.[elemento];
            const option = select.querySelector('option[value="avatar"]');
            if (option) {
                option.textContent = `Avatar (${elData?.nome || elemento})`;
            }
            // Dispara a atualização de estilos
            if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(select);
        }

        if (typeof showNotification === 'function') {
            const elData = window.AVATAR_ELEMENTS_DATA?.[elemento];
            showNotification(`Você despertou o elemento de ${elData?.nome.toUpperCase() || elemento.toUpperCase()}!`, "success");
        }

        if (typeof atualizarTudo === 'function') atualizarTudo();
    };

    /**
     * Salva a escolha do subelemento
     */
    window.confirmarEscolhaSubelemento = function (idx, subKey) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`class_avatar_subelement_${idx}`] = subKey;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

        document.getElementById('modal-avatar-despertar').style.display = 'none';

        const select = document.getElementById(`class_name_${idx}`);
        if (select) {
            const subData = window.AVATAR_ELEMENTS_DATA[subKey];
            const paiKey = dados[`class_avatar_element_${idx}`];
            const paiData = window.AVATAR_ELEMENTS_DATA[paiKey];

            const option = select.querySelector('option[value="avatar"]');
            if (option) {
                option.textContent = `Avatar (${paiData?.nome} - ${subData?.nome})`;
            }
            if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(select);
        }

        if (typeof showNotification === 'function') {
            showNotification(`Sua maestria evoluiu para ${window.AVATAR_ELEMENTS_DATA[subKey]?.nome}!`, "success");
        }

        if (typeof atualizarTudo === 'function') atualizarTudo();
    };

    /**
     * Verifica se a porcentagem elemental atingiu 50% para disparar a evolução.
     */
    window.verificarEvolucaoSubelemento = function (idx) {
        const inputPct = document.getElementById(`avatar_porcentagem_${idx}`);
        // Aceita "50%" ou "50"
        if (!inputPct || (inputPct.value.trim() !== '50%' && inputPct.value.trim() !== '50')) return;

        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const elementoPai = dados[`class_avatar_element_${idx}`];
        const subJaEscolhido = dados[`class_avatar_subelement_${idx}`];

        // Só abre se tiver elemento pai e ainda não tiver escolhido subelemento
        if (elementoPai && !subJaEscolhido) {
            window.abrirModalEscolhaSubelemento(idx, elementoPai);
        }
    };

    /**
     * Hook para o sistema de nível:
     * Se a classe Avatar for nível 1 e não tiver elemento, abre o modal.
     */
    window.verificarDespertarAvatar = function (idx, lvl, nomeClasse) {
        if (nomeClasse === 'avatar' && parseInt(lvl) >= 1) {
            const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            if (!dados[`class_avatar_element_${idx}`]) {
                window.abrirModalEscolhaElemento(idx);
            }
        }
    };
})();