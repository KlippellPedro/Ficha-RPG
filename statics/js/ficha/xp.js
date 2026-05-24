/**
 * Lógica de Experiência (XP) e Progressão de Nível
 */

// Tabela de XP: Defina aqui quanto XP é necessário para sair de cada nível.
// O índice representa o nível atual (Ex: o primeiro valor é o XP para sair do nível 0 e ir para o 1).
const XP_TABELA = [
    1000,  // Nível 0 -> 1
    2000,  // Nível 1 -> 2
    3000,  // Nível 2 -> 3
    4000,  // Nível 3 -> 4
    5000,  // Nível 4 -> 5
    6000,  // Nível 5 -> 6
    7000,  // Nível 6 -> 7
    8000,  // Nível 7 -> 8
    9000,  // Nível 8 -> 9
    10000, // Nível 9 -> 10
    12000, // Nível 10 -> 11
    15000, // Nível 11 -> 12
    20000, // Nível 12 -> 13
    25000, // Nível 13 -> 14
    30000  // Nível 14 -> 15
];

/**
 * Define quanto XP é necessário para o próximo nível total
 */
window.getXPNecessario = function (nivelTotal) {
    // Busca o valor na tabela. Se o nível for maior que a tabela, 
    // retorna um valor infinito para indicar que atingiu o limite definido.
    return XP_TABELA[nivelTotal] || 9999999;
};

/**
 * Verifica se o XP atual atingiu o limite para subir de nível
 */
window.validarXP = function () {
    const xpAtualEl = document.getElementById('xp_atual');
    const nivelTotal = parseInt(document.getElementById('nivel')?.value) || 0;

    // Se o nível atual já estiver no limite da tabela definida, não sobe mais
    if (nivelTotal >= XP_TABELA.length) return;

    const xpMax = window.getXPNecessario(nivelTotal);
    const xpAtual = parseInt(xpAtualEl?.value) || 0;

    const modal = document.getElementById('modal-level-up');
    if (xpAtual >= xpMax && modal && modal.style.display !== 'flex') {
        abrirModalEscolhaLevelUp();
    }
};

/**
 * Adiciona ou remove XP manualmente (botões +/-)
 */
function alterarXP(delta) {
    const xpAtualEl = document.getElementById('xp_atual');
    if (xpAtualEl) {
        const newVal = Math.max(0, (parseInt(xpAtualEl.value) || 0) + delta);
        xpAtualEl.value = newVal;
        // Força a atualização total para garantir que a barra se ajuste ao novo valor
        if (window.atualizarTudo) window.atualizarTudo();
    }
}

/**
 * Abre o modal para o jogador escolher qual classe deseja evoluir
 */
function abrirModalEscolhaLevelUp() {
    const modal = document.getElementById('modal-level-up');
    const container = document.getElementById('level-up-class-list');
    const modalTitle = modal?.querySelector('.modal-title');
    if (!modal || !container) return;

    // Diferencia visualmente se é um Level Up de aliado
    if (modalTitle) {
        modalTitle.innerText = allyId ? "LEVEL UP! (ALIADO)" : "LEVEL UP!";
        modalTitle.style.color = allyId ? "var(--primary-color)" : "#f59e0b";
    }

    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const classes = typeof getClassesAtivas === 'function' ? getClassesAtivas(dados) : [];

    let html = classes.map(c => {
        const selectEls = document.querySelectorAll('[id^="class_name_"]');
        let targetIdx = "";
        selectEls.forEach(sel => {
            if (sel.value === c.name) targetIdx = sel.id.replace('class_name_', '');
        });

        const classesDB = window.CLASSES_DATA || {};
        const nomeLabel = classesDB[c.name]?.nome || c.name;

        return `
            <div class="selection-option" onclick="processarLevelUp('${targetIdx}')">
                <strong>Subir Nível: ${nomeLabel}</strong>
                <p>Nível: ${c.lvl} → <span style="color: #4ade80">${c.lvl + 1}</span></p>
            </div>
        `;
    }).join('');

    // Adiciona a opção de Adquirir Nova Classe (Multiclasse ou Primeira Classe)
    html += `
        <div class="selection-option" onclick="selecionarNovaClasseLevelUp()" style="border: 1px dashed var(--primary-color); background: rgba(0,0,0,0.1); margin-top: 10px;">
            <strong style="color: var(--primary-color); text-align: center; width: 100%;">+ Adquirir Nova Classe</strong>
            <p style="text-align: center; width: 100%;">Escolha uma nova jornada (Lvl 1)</p>
        </div>
    `;

    container.innerHTML = html;
    modal.style.display = 'flex';
}

/**
 * Mostra a lista de classes disponíveis para adquirir como nova
 */
function selecionarNovaClasseLevelUp() {
    const container = document.getElementById('level-up-class-list');
    if (!container) return;

    const classesDB = window.CLASSES_DATA || {};
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const classesAtivas = typeof getClassesAtivas === 'function' ? getClassesAtivas(dados) : [];
    const nomesAtivos = classesAtivas.map(c => c.name);

    let html = `
        <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn-qty" onclick="abrirModalEscolhaLevelUp()" style="width: auto; padding: 0 10px;">← Voltar</button>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Escolha sua nova classe:</span>
        </div>
    `;

    html += Object.keys(classesDB)
        .filter(key => (!classesDB[key].dlc || isDlcAtiva(classesDB[key].dlc)) && !nomesAtivos.includes(key))
        .map(key => {
            const data = classesDB[key];
            return `
                <div class="selection-option" onclick="concluirNovaClasseLevelUp('${key}')">
                    <strong>${data.nome || key}</strong>
                    <p>${data.dlc ? 'Expansão: ' + data.dlc.toUpperCase() : 'Classe Base'}</p>
                </div>
            `;
        }).join('');

    if (html.length < 200) {
        html += `<p style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhuma nova classe disponível no momento.</p>`;
    }

    container.innerHTML = html;
}

/**
 * Adiciona a nova classe e processa o level up
 */
function concluirNovaClasseLevelUp(className) {
    if (typeof adicionarClasseUI === 'function') {
        adicionarClasseUI(className, 1);
        document.getElementById('modal-level-up').style.display = 'none';

        const xpAtualEl = document.getElementById('xp_atual');
        const nivelEl = document.getElementById('nivel');

        if (xpAtualEl && nivelEl) {
            const nivelTotalAntes = parseInt(nivelEl.value) || 0;
            const xpMaxGasto = window.getXPNecessario(nivelTotalAntes);
            const atualXP = parseInt(xpAtualEl.value) || 0;

            xpAtualEl.value = Math.max(0, atualXP - xpMaxGasto);

            if (typeof showNotification === 'function') showNotification("Nova classe adquirida!", "success");
            if (typeof atualizarTudo === 'function') atualizarTudo();
        }
    }
}

/**
 * Efetiva o ganho de nível na classe selecionada e desconta o XP
 */
function processarLevelUp(idx) {
    const inputLvl = document.getElementById(`class_lvl_${idx}`);
    const xpAtualEl = document.getElementById('xp_atual');
    const nivelEl = document.getElementById('nivel');

    if (inputLvl && xpAtualEl && nivelEl) {
        const nivelAtualAntes = parseInt(nivelEl.value) || 0; // Correção: permitir nível 0
        const xpMaxGasto = window.getXPNecessario(nivelAtualAntes);
        const atualXP = parseInt(xpAtualEl.value) || 0;

        inputLvl.value = (parseInt(inputLvl.value) || 0) + 1;
        document.getElementById('modal-level-up').style.display = 'none';

        // Desconta exatamente o XP necessário para o nível que o personagem estava
        xpAtualEl.value = Math.max(0, atualXP - xpMaxGasto);

        if (typeof showNotification === 'function') showNotification("Nível aumentado com sucesso!", "success");
        if (typeof atualizarTudo === 'function') atualizarTudo();
    }
}

// Removido o listener de DOMContentLoaded para evitar que o XP 
// seja validado antes dos dados do aliado serem carregados no DOM.