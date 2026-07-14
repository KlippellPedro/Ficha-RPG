/**
 * Orquestrador das Magias
 */

function _syncBotaoMagia(index) {
    const buffInput = document.getElementById(`mag_buff_ativo_${index}`);
    const btn       = document.getElementById(`btn_usar_mag_${index}`);
    if (!buffInput || !btn) return;
    const isAtivo = buffInput.value === 'true';
    btn.textContent = isAtivo ? 'Ativo' : 'Conjurar';
    btn.classList.toggle('buff-ativo', isAtivo);
    const card = btn.closest('.item-row');
    card?.classList.toggle('has-active-buff', isAtivo);
    const stateLabel = card?.querySelector('[data-mag-buff-label]');
    if (stateLabel) stateLabel.textContent = isAtivo ? 'Efeito ativo' : 'Efeito inativo';
}

function _ativarBuffMagia(index) {
    const modsRaw = document.getElementById(`mag_mods_${index}`)?.value || '[]';
    try { if (!JSON.parse(modsRaw).length) return; } catch { return; }
    const buffInput = document.getElementById(`mag_buff_ativo_${index}`);
    if (!buffInput) return;
    buffInput.value = 'true';
    _syncBotaoMagia(index);
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    dados[`mag_buff_ativo_${index}`] = 'true';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    if (typeof showNotification === 'function') showNotification("Efeito mágico ativo! Clique em 'Ativo' para desativar.", "success", 3500);
}

function toggleBuffMagia(index) {
    const buffInput = document.getElementById(`mag_buff_ativo_${index}`);
    if (!buffInput) return;
    if (buffInput.value === 'true') {
        buffInput.value = 'false';
        _syncBotaoMagia(index);
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`mag_buff_ativo_${index}`] = 'false';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        if (typeof showNotification === 'function') showNotification("Efeito mágico desativado.", "info");
        atualizarTudo();
    } else {
        usarMagia(index);
    }
}

function usarMagia(index) {
    const custoStr = document.getElementById(`mag_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`mag_tipo_custo_${index}`).value;
    const nome = document.getElementById(`mag_nome_${index}`).value || "Magia";
    const custo = parseInt(custoStr);
    //
    if (isNaN(custo) || custo <= 0) return showNotification("Defina um custo numérico para conjurar.", 'warning'); //

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    const racaKey = dados.raca || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    let recurso = (tipoCusto === "PM") ? "pm_atual" : (tipoCusto === "PV" ? "pv_atual" : null);
    if (tipoCusto === "PM" && isCorrompido) recurso = "pv_atual";

    if (recurso) {
        let atual = parseInt(dados[recurso]) || 0;
        if (atual < custo) return showNotification(`${(tipoCusto === "PM" && isCorrompido) ? "Vitalidade" : tipoCusto} insuficiente!`, 'error');
        dados[recurso] = atual - custo; //
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(nome, custo, (tipoCusto === "PM" && isCorrompido) ? "Corrupção" : tipoCusto);
        showNotification(`${nome} conjurada! -${custo} ${isCorrompido && tipoCusto === "PM" ? "Vitalidade" : tipoCusto}`, 'success');
        _ativarBuffMagia(index);
        atualizarTudo();
    } else {
        showNotification(`Magia conjurada (Custo: ${custo} Outro).`, 'info');
        _ativarBuffMagia(index);
    }
}

function setCircleFilter(btn, nivel) {
    document.querySelectorAll('.circle-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const sel = document.getElementById('filter-magia-nivel');
    if (sel) sel.value = nivel;
    filtrarMagias();
}

// Funções para Salvar e Carregar a Ordem Personalizada das Magias
function saveMagiasOrder() {
    const container = document.getElementById('magias-container');
    if (!container) return;
    const order = Array.from(container.children)
        .filter(child => child.classList.contains('mag-row-grid'))
        .map(row => row.dataset.index);
    localStorage.setItem(STORAGE_KEY_MAGIAS_ORDER, JSON.stringify(order));
}

function loadMagiasOrder() {
    const savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEY_MAGIAS_ORDER));
    const container = document.getElementById('magias-container');
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
    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('mag_nome_'))
        .map(k => k.replace('mag_nome_', ''))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    indices.forEach(idx => {
        adicionarMagiaUI(salvo[`mag_nome_${idx}`], salvo[`mag_tipo_${idx}`], salvo[`mag_nivel_${idx}`], salvo[`mag_custo_${idx}`], salvo[`mag_tipo_custo_${idx}`], salvo[`mag_desc_${idx}`], idx, salvo[`mag_duracao_${idx}`], salvo[`mag_alcance_${idx}`], salvo[`mag_acao_${idx}`], salvo[`mag_teste_${idx}`], salvo[`mag_mods_${idx}`] || '[]', salvo[`mag_buff_ativo_${idx}`] || 'false');
    });

    loadMagiasOrder();

    // Lógica de Drag and Drop para Magias
    const container = document.getElementById('magias-container');
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

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            const dropTarget = e.target.closest('.draggable');
            if (dropTarget && dropTarget !== draggedItem) {
                const rect = dropTarget.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                if (isAfter) dropTarget.after(draggedItem);
                else dropTarget.before(draggedItem);
                saveMagiasOrder();
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

    atualizarTudo();
    filtrarMagias();
});
