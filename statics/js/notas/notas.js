/**
 * Orquestrador das Notas
 */

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('nota_titulo_'))
        .map(k => k.replace('nota_titulo_', ''))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    indices.forEach(idx => {
        adicionarNotaUI(salvo[`nota_titulo_${idx}`], salvo[`nota_tipo_${idx}`], salvo[`nota_desc_${idx}`], idx, salvo[`nota_campos_${idx}`], salvo[`nota_fav_${idx}`] === true, salvo[`nota_data_${idx}`] || "");
    });

    loadNotasOrder();

    atualizarTudo();
    ordenarNotas();
    filtrarNotas();

    // Adiciona o ouvinte para a barra de pesquisa funcionar em tempo real
    document.getElementById('search-nota')?.addEventListener('input', filtrarNotas);
    document.getElementById('search-nota-desc')?.addEventListener('input', filtrarNotas);

    // Lógica de Drag and Drop para Notas com fix de seleção
    const container = document.getElementById('notas-container');
    let draggedItem = null;

    container.addEventListener('mousedown', (e) => {
        const row = e.target.closest('.draggable');
        if (!row) return;
        if (e.target.closest('input, textarea, select, button, .nota-titulo-lista')) {
            row.draggable = false;
        } else {
            row.draggable = true;
        }
    });

    container.addEventListener('dragstart', (e) => {
        if (e.target.closest('input, textarea, select, button')) {
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
        saveNotasOrder();
    });

    container.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.classList.remove('dragging');
        draggedItem = null;
    });
});

function saveNotasOrder() {
    const container = document.getElementById('notas-container');
    if (!container) return;
    const order = Array.from(container.children).filter(c => c.dataset.index).map(c => c.dataset.index);
    localStorage.setItem(window.STORAGE_KEY_NOTAS_ORDER, JSON.stringify(order));
}

function loadNotasOrder() {
    const container = document.getElementById('notas-container');
    if (!container) return;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(window.STORAGE_KEY_NOTAS_ORDER)) || []; }
    catch (e) { saved = []; }
    if (!Array.isArray(saved) || saved.length === 0) return;
    const items = new Map();
    Array.from(container.children).forEach(row => { if (row.dataset.index) items.set(row.dataset.index, row); });
    const fragment = document.createDocumentFragment();
    saved.forEach(id => {
        const item = items.get(String(id));
        if (item) {
            fragment.appendChild(item);
            items.delete(String(id));
        }
    });
    items.forEach(item => fragment.appendChild(item));
    container.appendChild(fragment);
    saveNotasOrder();
}
