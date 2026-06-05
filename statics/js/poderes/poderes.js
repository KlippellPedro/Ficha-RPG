/**
 * Orquestrador dos Poderes
 */

function _syncBotaoPoder(index) {
    const buffInput = document.getElementById(`poder_buff_ativo_${index}`);
    const btn       = document.getElementById(`btn_usar_poder_${index}`);
    if (!buffInput || !btn) return;
    const isAtivo = buffInput.value === 'true';
    btn.textContent = isAtivo ? 'Ativo' : 'Usar';
    btn.classList.toggle('buff-ativo', isAtivo);
    btn.closest('.item-row')?.classList.toggle('has-active-buff', isAtivo);
}

function _ativarBuffPoder(index) {
    const modsRaw = document.getElementById(`poder_mods_${index}`)?.value || '[]';
    try { if (!JSON.parse(modsRaw).length) return; } catch { return; }
    const buffInput = document.getElementById(`poder_buff_ativo_${index}`);
    if (!buffInput) return;
    buffInput.value = 'true';
    _syncBotaoPoder(index);
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    dados[`poder_buff_ativo_${index}`] = 'true';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    if (typeof showNotification === 'function') showNotification("Buff de poder ativado! Clique em 'Ativo' para desativar.", "success", 3500);
}

function toggleBuffPoder(index) {
    const buffInput = document.getElementById(`poder_buff_ativo_${index}`);
    if (!buffInput) return;
    if (buffInput.value === 'true') {
        buffInput.value = 'false';
        _syncBotaoPoder(index);
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados[`poder_buff_ativo_${index}`] = 'false';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        if (typeof showNotification === 'function') showNotification("Buff desativado.", "info");
        atualizarTudo();
    } else {
        usarPoder(index);
    }
}

function usarPoder(index) {
    const custoStr = document.getElementById(`poder_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`poder_tipo_custo_${index}`).value;
    const custo = parseInt(custoStr);
    if (isNaN(custo) || custo <= 0) return showNotification("Defina um custo numérico válido e positivo.", 'warning');

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const racaKey = dados.raca || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    if (tipoCusto === "PM") {
        if (isCorrompido) return usarPoderCorrompido(index, custo);
        let recursoAtual = parseInt(dados.pm_atual) || 0;
        let recursoMax = parseInt(dados.pm_max) || 0;
        if (recursoAtual < custo) return showNotification(`Mana insuficiente! Você tem ${recursoAtual} PM, mas precisa de ${custo} PM.`, 'error');

        recursoAtual -= custo;
        dados.pm_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, tipoCusto);
        showNotification(`Poder usado! ${custo} PM subtraídos. Mana atual: ${recursoAtual}/${recursoMax}.`, 'success');
        _ativarBuffPoder(index);
        atualizarTudo();
    } else if (tipoCusto === "PV") {
        let recursoAtual = parseInt(dados.pv_atual) || 0;
        let recursoMax = parseInt(dados.pv_max) || 0;
        if (recursoAtual < custo) return showNotification(`Vida insuficiente! Você tem ${recursoAtual} PV, mas precisa de ${custo} PV.`, 'error');

        recursoAtual -= custo;
        dados.pv_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, tipoCusto);
        showNotification(`Poder usado! ${custo} PV subtraídos. Vida atual: ${recursoAtual}/${recursoMax}.`, 'success');
        _ativarBuffPoder(index);
        atualizarTudo();
    } else if (tipoCusto === "Outro") {
        showNotification(`Poder usado (custo manual).`, 'info');
        _ativarBuffPoder(index);
        atualizarTudo();
    } else { showNotification("Gerencie esse custo manualmente.", 'info'); }
    // Não é necessário chamar atualizarEstiloCustoPoder(index) aqui, pois atualizarTudo() já fará isso globalmente.
}

function usarPoderCorrompido(index, custo) {
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let recursoAtual = parseInt(dados.pv_atual) || 0;

    if (recursoAtual < custo) {
        return showNotification(`Vitalidade insuficiente para corrupção!`, 'error'); //
    }

    recursoAtual -= custo;
    dados.pv_atual = recursoAtual;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, "Corrupção");
    showNotification(`Poder usado via Corrupção! -${custo} Vitalidade.`, 'success');
    atualizarTudo();
    return true;
}

// Funções para Salvar e Carregar a Ordem Personalizada
function savePoderesOrder() {
    const container = document.getElementById('poderes-container');
    if (!container) return;
    const order = Array.from(container.children)
        .filter(child => child.classList.contains('pod-row-grid'))
        .map(row => row.dataset.index);
    localStorage.setItem(STORAGE_KEY_PODERES_ORDER, JSON.stringify(order));
}

function loadPoderesOrder() {
    const savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEY_PODERES_ORDER));
    const container = document.getElementById('poderes-container');
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
        .filter(k => k.startsWith('poder_nome_'))
        .map(k => k.replace('poder_nome_', ''));

    if (indices.length > 0) {
        indices.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).forEach(idx => {
            adicionarPoderUI(
                salvo[`poder_nome_${idx}`] || "",    // 1. nome
                salvo[`poder_tipo_${idx}`] || "Poder de Classe", // 2. tipo
                salvo[`poder_custo_${idx}`] || "",   // 3. custo
                salvo[`poder_tipo_custo_${idx}`] || "PM", // 4. tipoCusto
                salvo[`poder_desc_${idx}`] || "",    // 5. desc
                idx,                                 // 6. idIndex (Mantém como string para evitar NaN)
                salvo[`poder_duracao_${idx}`] || "", // 7. duracao
                salvo[`poder_alcance_${idx}`] || "", // 8. alcance
                salvo[`poder_acao_${idx}`] || "",    // 9. acao
                salvo[`poder_classe_${idx}`] || "",  // 10. classe
                salvo[`poder_pv_bonus_${idx}`] || 0, // 11. pv_bonus
                salvo[`poder_pm_bonus_${idx}`] || 0, // 12. pm_bonus
                salvo[`poder_mods_${idx}`] || "[]",          // 13. mods
                salvo[`poder_buff_ativo_${idx}`],            // 14. buffAtivo
                salvo[`poder_modo_${idx}`] || 'Ativa'       // 15. modo (Ativa/Passiva)
            );
        });
    }

    // Aplica a ordem personalizada salva
    loadPoderesOrder();

    // Lógica de Drag and Drop para Poderes
    const container = document.getElementById('poderes-container');
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
            const rect = target.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2;
            if (isAfter) target.after(draggedItem);
            else target.before(draggedItem);
        }
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        savePoderesOrder();
        container.querySelectorAll('.draggable').forEach(row => row.classList.remove('drag-insert-top', 'drag-insert-bottom'));
    });

    container.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.classList.remove('dragging');
        draggedItem = null;
    });

    // Atualiza o dropdown de filtros para as classes/origens
    atualizarFiltroPoderesUI();

    // Chama atualizarTudo() uma única vez após carregar todos os elementos dinâmicos
    atualizarTudo();
    filtrarPoderes();
});