/**
 * Lógica de Experiência (XP) e Progressão de Nível
 */

// Tabela de XP: XP necessário para sair de cada nível (índice = nível atual).
// Progressão inspirada em Tormenta RPG — pode ser editada conforme a campanha.
const XP_TABELA = [
    // Nível 0-9 → curva inicial suave
    1000, 2000, 3500, 5000, 7000, 9500, 12500, 16000, 20000, 25000,
    // Nível 10-19 → crescimento moderado
    30000, 36000, 43000, 51000, 60000, 70000, 82000, 95000, 110000, 130000,
    // Nível 20-29 → saltos maiores
    150000, 175000, 205000, 240000, 280000, 325000, 375000, 435000, 500000, 575000,
    // Nível 30-39
    660000, 755000, 860000, 980000, 1110000, 1255000, 1415000, 1590000, 1785000, 2000000,
    // Nível 40-49
    2240000, 2505000, 2800000, 3125000, 3485000, 3880000, 4315000, 4795000, 5320000, 5900000,
    // Nível 50-59
    6530000, 7220000, 7975000, 8800000, 9700000, 10680000, 11745000, 12900000, 14160000, 15530000,
    // Nível 60-69
    17020000, 18640000, 20400000, 22310000, 24380000, 26620000, 29050000, 31680000, 34530000, 37620000,
    // Nível 70-79
    40975000, 44610000, 48545000, 52800000, 57395000, 62350000, 67685000, 73420000, 79580000, 86185000,
    // Nível 80-89
    93270000, 100855000, 108975000, 117655000, 126930000, 136830000, 147390000, 158645000, 170635000, 183400000,
    // Nível 90-99
    196980000, 211415000, 226750000, 243030000, 260300000, 278610000, 298010000, 318560000, 340315000, 363335000
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
    if (xpAtual >= xpMax && modal && !modal.open) {
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
    modal.showModal();
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
        fecharDialogoAnimado(document.getElementById('modal-level-up'));

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

        // Dispara a atualização de estilo e verifica gatilhos (como o despertar do Avatar)
        const selectName = document.getElementById(`class_name_${idx}`);
        if (selectName && typeof atualizarEstiloClasse === 'function') {
            atualizarEstiloClasse(selectName);
        }

        fecharDialogoAnimado(document.getElementById('modal-level-up'));

        // Desconta exatamente o XP necessário para o nível que o personagem estava
        xpAtualEl.value = Math.max(0, atualXP - xpMaxGasto);

        if (typeof showNotification === 'function') showNotification("Nível aumentado com sucesso!", "success");
        if (typeof atualizarTudo === 'function') atualizarTudo();
    }
}

// Removido o listener de DOMContentLoaded para evitar que o XP 
// seja validado antes dos dados do aliado serem carregados no DOM.