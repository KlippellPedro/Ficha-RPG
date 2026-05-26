/**
 * Orquestrador das Magias
 */

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
        atualizarTudo();
    } else {
        showNotification(`Magia conjurada (Custo: ${custo} Outro).`, 'info');
    }
}

function duplicarMagia(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    let nivel = document.getElementById(`mag_nivel_${index}`).value;

    // Remove o % para passar o valor limpo para a função de criação
    if (tipo === "Elemental" && nivel.endsWith('%')) nivel = nivel.slice(0, -1);

    adicionarMagiaUI(
        document.getElementById(`mag_nome_${index}`).value + " (Cópia)",
        tipo,
        nivel,
        document.getElementById(`mag_custo_${index}`).value,
        document.getElementById(`mag_tipo_custo_${index}`).value,
        document.getElementById(`mag_desc_${index}`).value,
        null,
        document.getElementById(`mag_duracao_${index}`).value,
        document.getElementById(`mag_alcance_${index}`).value,
        document.getElementById(`mag_acao_${index}`).value,
        document.getElementById(`mag_teste_${index}`).value
    );
}

function removerMagia(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.includes(`mag_`) && k.endsWith(`_${index}`)) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarMagias();
}

function limparMagias() {
    if (!confirm("Apagar grimório inteiro?")) return;
    document.getElementById('magias-container').innerHTML = '';
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.startsWith('mag_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarMagias();
}

/**
 * Reseta todos os campos de busca e filtros para o estado inicial
 */
function resetarFiltrosMagia() {
    const search = document.getElementById('search-magia');
    const tipo = document.getElementById('filter-magia-tipo');
    const nivel = document.getElementById('filter-magia-nivel');

    if (search) search.value = '';
    if (tipo) tipo.value = 'todos';
    if (nivel) nivel.value = 'todos';

    filtrarMagias();
    showNotification("Filtros limpos", "info", 2000);
}

function filtrarMagias() {
    const termo = document.getElementById('search-magia').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-magia-tipo').value;
    const filtroNivel = document.getElementById('filter-magia-nivel').value;
    let contador = 0;

    document.querySelectorAll('#magias-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`mag_nome_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`mag_tipo_${index}`)?.value || "";
        const nivelInput = document.getElementById(`mag_nivel_${index}`);
        const nivel = nivelInput?.value || "";

        const matchesNome = nome.includes(termo);
        const matchesTipo = filtroTipo === 'todos' || tipo === filtroTipo;

        let matchesNivel = filtroNivel === 'todos';
        if (!matchesNivel && nivelInput) {
            if (filtroNivel === 'extra') {
                // Considera 'extra' se for um input de texto (Elemental/Outro) ou se o valor não for 1-4
                matchesNivel = nivelInput.tagName === 'INPUT' || !['1', '2', '3', '4'].includes(nivel);
            } else {
                matchesNivel = nivel === filtroNivel;
            }
        } else if (!matchesNivel && !nivelInput) {
            // Se o input de nível não existe por erro, oculta por segurança se houver filtro ativo
            matchesNivel = false;
        }

        const visible = (matchesNome && matchesTipo && matchesNivel);
        row.style.display = visible ? 'grid' : 'none';
        if (visible) contador++;
    });

    const counterEl = document.getElementById('magias-counter');
    if (counterEl) {
        counterEl.innerText = `Magias visíveis: ${contador}`;
    }
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
    const indices = Object.keys(salvo).filter(k => k.startsWith('mag_nome_')).map(k => k.replace('mag_nome_', '')).sort((a, b) => a - b);
    indices.forEach(idx => {
        adicionarMagiaUI(salvo[`mag_nome_${idx}`], salvo[`mag_tipo_${idx}`], salvo[`mag_nivel_${idx}`], salvo[`mag_custo_${idx}`], salvo[`mag_tipo_custo_${idx}`], salvo[`mag_desc_${idx}`], idx, salvo[`mag_duracao_${idx}`], salvo[`mag_alcance_${idx}`], salvo[`mag_acao_${idx}`], salvo[`mag_teste_${idx}`]); // `renderizarCampoNivel` will format `mag_nivel_${idx}`
    });

    loadMagiasOrder();

    // Lógica de Drag and Drop para Magias
    const container = document.getElementById('magias-container');
    let draggedItem = null;

    container.addEventListener('dragstart', (e) => {
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