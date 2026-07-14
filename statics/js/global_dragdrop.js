/**
 * Motor genérico de drag-and-drop por arraste, compartilhado entre as listas de
 * Habilidades, Poderes, Magias e Ataques. Extraído de inventario/inventario.js —
 * o Inventário passou a ter seu próprio mecanismo de reordenação (ver inventario_render.js),
 * pois seus itens agora vivem em um array normalizado, não em linhas soltas no DOM.
 */
let draggedItem = null;

document.addEventListener('DOMContentLoaded', () => {
    const containers = [
        { id: 'habilidades-container', key: 'habilidades_order' },
        { id: 'poderes-container', key: 'poderes_order' },
        { id: 'magias-container', key: 'magias_order' },
        { id: 'ataques-container', key: typeof STORAGE_KEY_ATAQUES_ORDER !== 'undefined' ? STORAGE_KEY_ATAQUES_ORDER : 'ataques_order' }
    ];

    containers.forEach(cfg => {
        const container = document.getElementById(cfg.id);
        if (!container) return;

        // Garante que a seleção de texto funcione desativando o drag ao clicar em inputs
        container.addEventListener('mousedown', (e) => {
            const row = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
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
            draggedItem = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (draggedItem) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedItem.dataset.index);
                setTimeout(() => draggedItem.classList.add('dragging'), 0);
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault(); // Permite o drop e remove o ícone de bloqueado
            const target = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (target && target !== draggedItem) {
                container.querySelectorAll('.draggable, [draggable="true"]').forEach(row =>
                    row.classList.remove('drag-insert-top', 'drag-insert-bottom')
                );

                const rect = target.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                target.classList.add(isAfter ? 'drag-insert-bottom' : 'drag-insert-top');
            }
        });

        container.addEventListener('dragleave', (e) => {
            const target = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (target) target.classList.remove('drag-insert-top', 'drag-insert-bottom');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropTarget = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (draggedItem && dropTarget && dropTarget !== draggedItem) {
                const rect = dropTarget.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                if (isAfter) dropTarget.after(draggedItem);
                else dropTarget.before(draggedItem);

                saveInventoryOrder(cfg.id, cfg.key);
            }
            container.querySelectorAll('.draggable, [draggable="true"]').forEach(row =>
                row.classList.remove('drag-insert-top', 'drag-insert-bottom', 'dragging')
            );
        });

        // Tenta carregar a ordem salva para este container específico se ele existir
        loadInventoryOrder(cfg.id, cfg.key);
    });
});

// Evento global de finalização do arraste para limpar classes de estilo
document.addEventListener('dragend', () => {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
    document.querySelectorAll('.drag-insert-top, .drag-insert-bottom').forEach(el =>
        el.classList.remove('drag-insert-top', 'drag-insert-bottom')
    );
});

function saveInventoryOrder(containerId = 'items-container', storageKey = 'inventory_order') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const order = Array.from(container.children)
        .filter(child => child.dataset && child.dataset.index)
        .map(row => row.dataset.index);
    localStorage.setItem(storageKey, JSON.stringify(order));
}

function loadInventoryOrder(containerId = 'items-container', storageKey = 'inventory_order') {
    const savedOrder = JSON.parse(localStorage.getItem(storageKey));
    if (savedOrder && savedOrder.length > 0) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = new Map();
        Array.from(container.children).forEach(row => {
            if (row.dataset && row.dataset.index) {
                items.set(row.dataset.index, row);
            }
        });

        const fragment = document.createDocumentFragment();
        savedOrder.forEach(id => {
            const item = items.get(id);
            if (item) {
                fragment.appendChild(item);
            }
        });
        container.appendChild(fragment);
    }
}
