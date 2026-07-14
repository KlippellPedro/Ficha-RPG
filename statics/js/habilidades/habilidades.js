/**
 * Lógica para gerenciar a lista dinâmica de habilidades
 */

/**
 * Atualiza o visual do botão e da row com o estado do buff
 */
function _syncBotaoHab(index) {
    const buffInput = document.getElementById(`hab_buff_ativo_${index}`);
    const btn       = document.getElementById(`btn_usar_hab_${index}`);
    if (!buffInput || !btn) return;
    const isAtivo = buffInput.value === 'true';
    btn.textContent = isAtivo ? 'Ativo' : 'Usar';
    btn.classList.toggle('buff-ativo', isAtivo);
    const card = btn.closest('.item-row');
    card?.classList.toggle('has-active-buff', isAtivo);
    const stateLabel = card?.querySelector('[data-hab-buff-label]');
    if (stateLabel) {
        stateLabel.textContent = card.dataset.tipo === 'Passiva'
            ? 'Sempre ativa'
            : (isAtivo ? 'Efeito ativo' : 'Efeito inativo');
    }
}

/**
 * Alterna o estado do buff de uma habilidade ativa.
 * Se buff está OFF → usa (deduciona custo) e ativa o buff (se tiver mods).
 * Se buff está ON  → apenas desativa (sem custo).
 */
function toggleBuffHabilidade(index) {
    const buffInput = document.getElementById(`hab_buff_ativo_${index}`);
    if (!buffInput) return;
    if (buffInput.value === 'true') {
        // Desativar buff
        buffInput.value = 'false';
        _syncBotaoHab(index);
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`hab_buff_ativo_${index}`] = 'false';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        if (typeof showNotification === 'function') showNotification("Buff desativado.", "info");
        atualizarTudo();
    } else {
        // Usar habilidade → irá ativar buff dentro de usarHabilidade se tiver mods
        usarHabilidade(index);
    }
}

/**
 * Ativa o buff de uma habilidade se ela tiver mods configurados
 */
function _ativarBuffHab(index) {
    const modsRaw = document.getElementById(`hab_mods_${index}`)?.value || '[]';
    try {
        const mods = JSON.parse(modsRaw);
        if (!mods.length) return; // sem mods — não há buff pra ativar
    } catch { return; }

    const buffInput = document.getElementById(`hab_buff_ativo_${index}`);
    if (!buffInput) return;
    buffInput.value = 'true';
    _syncBotaoHab(index);

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    dados[`hab_buff_ativo_${index}`] = 'true';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    if (typeof showNotification === 'function') showNotification("Buff ativado! Clique em 'Ativo' para desativar.", "success", 3500);
}

/**
 * Função para "usar" uma habilidade, subtraindo o custo em PM da mana atual.
 */
function usarHabilidade(index) {
    const custoStr = document.getElementById(`hab_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`).value;
    if (!custoStr || custoStr === "0") {
        showNotification("Esta habilidade não possui um custo numérico definido.", 'warning');
        return;
    }
    const custo = parseInt(custoStr);
    if (isNaN(custo) || custo <= 0) {
        showNotification("Custo inválido. Por favor, insira um número positivo.", 'warning'); //
        return;
    }
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (tipoCusto === "PM") {
        let recursoAtual = parseInt(dados.pm_atual) || 0;
        let recursoMax = parseInt(dados.pm_max) || 0;
        if (recursoAtual < custo) return showNotification(`Mana insuficiente! Você tem ${recursoAtual} PM, mas precisa de ${custo} PM.`, 'error');
        recursoAtual -= custo;

        // Sincroniza o valor com o input na tela (se existir) para evitar que atualizarTudo() reverta a mudança
        const inputPM = document.getElementById('pm_atual');
        if (inputPM) inputPM.value = recursoAtual;

        dados.pm_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PM subtraídos. Mana atual: ${recursoAtual}/${recursoMax}.`, 'success');
        _ativarBuffHab(index);
        atualizarTudo();
    } else if (tipoCusto === "PV") {
        let recursoAtual = parseInt(dados.pv_atual) || 0;
        let recursoMax = parseInt(dados.pv_max) || 0;
        if (recursoAtual < custo) return showNotification(`Vida insuficiente! Você tem ${recursoAtual} PV, mas precisa de ${custo} PV.`, 'error');
        recursoAtual -= custo;

        const inputPV = document.getElementById('pv_atual');
        if (inputPV) inputPV.value = recursoAtual;

        dados.pv_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PV subtraídos. Vida atual: ${recursoAtual}/${recursoMax}.`, 'success');
        _ativarBuffHab(index);
        atualizarTudo();
    } else if (tipoCusto === "Outro") {
        showNotification(`Habilidade usada (custo manual).`, 'info');
        _ativarBuffHab(index);
        atualizarTudo();
    }
}

// Funções para Salvar e Carregar a Ordem Personalizada
function saveHabilidadesOrder() {
    const container = document.getElementById('habilidades-container');
    if (!container) return;
    const order = Array.from(container.children)
        .filter(child => child.classList.contains('hab-row-grid'))
        .map(row => row.dataset.index);
    localStorage.setItem(STORAGE_KEY_HABILIDADES_ORDER, JSON.stringify(order));
}

function loadHabilidadesOrder() {
    const savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEY_HABILIDADES_ORDER));
    const container = document.getElementById('habilidades-container');
    if (!savedOrder || !container) return;

    const items = new Map();
    Array.from(container.children).forEach(row => {
        if (row.dataset.index) items.set(row.dataset.index, row);
    });

    const fragment = document.createDocumentFragment();
    savedOrder.forEach(id => {
        const item = items.get(id);
        if (item) fragment.appendChild(item);
    });
    container.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (salvo) {
        const ids = new Set();
        Object.keys(salvo).forEach(k => { if (k.startsWith('hab_nome_')) ids.add(k.replace('hab_nome_', '')); });

        // Ordenação segura para IDs numéricos e strings (auto_...)
        Array.from(ids)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
            .forEach(idx => {
                adicionarHabilidadeUI(salvo[`hab_nome_${idx}`], salvo[`hab_tipo_${idx}`], salvo[`hab_custo_${idx}`], salvo[`hab_tipo_custo_${idx}`], salvo[`hab_desc_${idx}`], idx, salvo[`hab_duracao_${idx}`], salvo[`hab_alcance_${idx}`], salvo[`hab_acao_${idx}`], salvo[`hab_classe_${idx}`], salvo[`hab_mods_${idx}`], salvo[`hab_buff_ativo_${idx}`] || 'false');
            });

        loadHabilidadesOrder();
    }

    // Lógica de Drag and Drop
    const container = document.getElementById('habilidades-container');
    let draggedItem = null;

    // Garante que a seleção de texto funcione desativando o drag ao clicar em inputs
    container.addEventListener('mousedown', (e) => {
        const row = e.target.closest('.draggable');
        if (!row) return;
        if (e.target.closest('input, textarea, select, button, [contenteditable="true"]')) {
            row.draggable = false;
        } else {
            row.draggable = true;
        }
    });

    container.addEventListener('dragstart', (e) => {
        // Bloqueia o arrasto se o clique originar em campos de texto, botões ou seletores
        if (e.target.closest('input, textarea, select, button, [contenteditable="true"]')) {
            e.preventDefault();
            return;
        }
        draggedItem = e.target.closest('.draggable');
        if (draggedItem) {
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => draggedItem.classList.add('dragging'), 0);
        }
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target.closest('.draggable');
        if (target && target !== draggedItem) {
            container.querySelectorAll('.draggable').forEach(row =>
                row.classList.remove('drag-insert-top', 'drag-insert-bottom')
            );
            const rect = target.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2;
            target.classList.add(isAfter ? 'drag-insert-bottom' : 'drag-insert-top');
        }
    });

    container.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.draggable');
        if (target) target.classList.remove('drag-insert-top', 'drag-insert-bottom');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            const dropTarget = e.target.closest('.draggable');
            if (dropTarget && dropTarget !== draggedItem) {
                const rect = dropTarget.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                if (isAfter) dropTarget.after(draggedItem);
                else dropTarget.before(draggedItem);
                saveHabilidadesOrder();
            }
        }
        container.querySelectorAll('.draggable').forEach(row =>
            row.classList.remove('drag-insert-top', 'drag-insert-bottom')
        );
    });

    container.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.classList.remove('dragging');
        draggedItem = null;
    });

    atualizarFiltroHabilidadesUI();
    atualizarTudo();
    filtrarHabilidades();
});
