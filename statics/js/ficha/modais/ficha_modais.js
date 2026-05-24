/**
 * Centralização de todos os modais da página da Ficha
 */

let pendingUniqueSelect = null;
let currentCientistaIndex = null;

/**
 * MODAL DE AJUDA: Detalhamento de Cálculos (Atributos, Vida, Mana, etc)
 */
function abrirModalCalculoGenerico(alias) {
    // Mapeia o nome amigável passado no HTML para o ID real do input
    const idMap = {
        'vida': 'pv_max',
        'mana': 'pm_max',
        'defesa': 'defesa',
        'movimentacao': 'movimentacao',
        'sanidade': 'sanidade',
        'status_info': 'status_info'
    };

    const elId = idMap[alias] || alias;
    const el = document.getElementById(elId);
    if (!el) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) return;

    // Define um nome bonito para o título do modal
    const nameMap = {
        'pv_max': 'Vida Máxima',
        'pm_max': 'Mana Máxima',
        'status_info': 'Status',
        'movimentacao': 'Movimentação',
        'defesa': 'Defesa',
        'sanidade': 'Sanidade'
    };
    let displayName = nameMap[elId] || elId.toUpperCase();
    title.innerText = `Cálculo de ${displayName}`;

    const fullTitle = el.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Sem detalhes.";
    const items = breakdownPart.split(' | ');

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            ${items.map(item => {
        const colored = item
            .replace(/Base: (\d+)/g, '<span class="calc-label-base">Base: $1</span>')
            .replace(/(\+\d+)/g, '<span class="calc-label-bonus-pos">$1</span>')
            .replace(/(\-\d+)/g, '<span class="calc-label-bonus-neg">$1</span>');
        return `
                <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid var(--primary-color); font-size: 0.9rem;">
                    ${colored}
                </div>`;
    }).join('')}
            <div class="calc-label-total" style="background: var(--primary-glow); border-radius: 4px; padding: 12px; text-align: center; border-top: none;">
                Total: ${el.value}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

const mostrarAjudaCalculo = abrirModalCalculoGenerico;
const mostrarAjudaCalculoGenerico = abrirModalCalculoGenerico;
const mostrarAjudaAtributo = abrirModalCalculoGenerico;

/**
 * MODAL DE CLASSE: Cientista e Classe Única
 */
function abrirModalCientistaSubclasse(index) {
    currentCientistaIndex = index;
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) modal.style.display = 'flex';
}

function fecharModalCientistaSubclasse() {
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) modal.style.display = 'none';
    currentCientistaIndex = null;
}

function escolherSubclasseCientista(index, subclasse) {
    if (index === null) return;
    const subInput = document.getElementById(`class_sub_${index}`);
    const nameSel = document.getElementById(`class_name_${index}`);
    if (subInput && nameSel) {
        subInput.value = subclasse;
        if (typeof formatarNomeClasseCientista === 'function') formatarNomeClasseCientista(nameSel, subclasse);
    }
    fecharModalCientistaSubclasse();
    atualizarTudo();
}

function confirmarClasseUnica() {
    showConfirm("O Ceifeiro de Almas é uma classe exclusiva. Se você continuar, todas as suas outras classes serão removidas permanentemente. Deseja prosseguir?", () => {
        if (!pendingUniqueSelect) return;
        const targetRow = pendingUniqueSelect.closest('.class-row');
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        document.querySelectorAll('.class-row').forEach(row => {
            if (row !== targetRow) {
                // Dispara o efeito de fumaça/almas saindo da linha que será removida
                if (typeof criarEfeitoFumaca === 'function') criarEfeitoFumaca(row);

                const nameSelect = row.querySelector('[id^="class_name_"]');
                const index = nameSelect?.id.split('_').pop();
                if (index) {
                    delete dados[`class_name_${index}`];
                    delete dados[`class_lvl_${index}`];
                    delete dados[`class_sub_${index}`];
                }

                // Pequeno atraso para o efeito visual de fumaça ser percebido antes da remoção
                setTimeout(() => row.remove(), 300);
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(pendingUniqueSelect);

        const modalUnique = document.getElementById('modal-unique-class');
        if (modalUnique) modalUnique.style.display = 'none';

        pendingUniqueSelect = null;
        atualizarTudo();
        showNotification("Classe Ceifeiro de Almas ativada. Outras classes removidas.", "success");
    }, () => {
        if (pendingUniqueSelect) pendingUniqueSelect.value = ""; // Reseta a seleção da classe

        const modalUnique = document.getElementById('modal-unique-class');
        if (modalUnique) modalUnique.style.display = 'none';

        pendingUniqueSelect = null;
        atualizarTudo();
        showNotification("Seleção de Ceifeiro de Almas cancelada.", "info");
    }, "Classe Única Detectada");
}

function cancelarClasseUnica() {
    if (pendingUniqueSelect) pendingUniqueSelect.value = "";
    document.getElementById('modal-unique-class').style.display = 'none';
    pendingUniqueSelect = null;
    atualizarTudo();
}

/**
 * MODAL DE RAÇA E STATUS
 */
function escolherPoderEspirito(poder) {
    const inputPoder = document.getElementById("espirito_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        document.getElementById('modal-poder-espirito').style.display = 'none';
        atualizarTudo();
    }
}

function escolherPoderMortoVivo(poder) {
    const inputPoder = document.getElementById("morto_vivo_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        document.getElementById('modal-poder-morto').style.display = 'none';
        atualizarTudo();
    }
}

function escolherStatus(valor) {
    const inputStatus = document.getElementById('status_info');
    if (inputStatus) inputStatus.value = (valor > 0 ? "+" : "") + valor;
    const inputDef = document.getElementById('status_inicial_definido');
    if (inputDef) inputDef.value = "true";
    const modal = document.getElementById('modal-status');
    if (modal) modal.style.display = 'none';
    atualizarTudo();
}
