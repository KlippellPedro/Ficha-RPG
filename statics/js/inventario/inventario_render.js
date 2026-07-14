/**
 * Interface do Inventário: grid de cards, busca/filtro/ordenação, e
 * reordenação por arraste. Substitui a antiga lista de linhas com campos
 * escondidos em inventario_ui.js.
 */

let inventoryState = [];

let _filtroCategoria = 'todos';
let _filtroEstado = 'todos';
let _termoBusca = '';
let _ordemAtual = 'padrao';

function getItemInventario(id) {
    return inventoryState.find(i => i.id === id);
}
window.getItemInventario = getItemInventario;

function _nomeTipo(t) {
    return TIPOS_INVENTARIO_INFO[t]?.nome || t;
}

function _rarityOrder() {
    return (typeof OPTIONS_RARIDADE !== 'undefined' ? OPTIONS_RARIDADE : []).map(o => o.v);
}

/**
 * Filtros e busca (chamados pelos controles da barra de filtro)
 */
function filtrarItens() {
    _filtroCategoria = document.getElementById('filter-category')?.value || 'todos';
    _termoBusca = (document.getElementById('search-item')?.value || '').toLowerCase();
    renderizarInventario();
}
window.filtrarItens = filtrarItens;

function filtrarPorEstado() {
    _filtroEstado = document.getElementById('filter-state')?.value || 'todos';
    renderizarInventario();
}
window.filtrarPorEstado = filtrarPorEstado;

function ordenarInventario() {
    _ordemAtual = document.getElementById('sort-inventory')?.value || 'padrao';
    renderizarInventario();
}
window.ordenarInventario = ordenarInventario;

function resetarFiltrosInventario() {
    const search = document.getElementById('search-item');
    const cat = document.getElementById('filter-category');
    const estado = document.getElementById('filter-state');
    const ordem = document.getElementById('sort-inventory');
    if (search) search.value = '';
    if (cat) cat.value = 'todos';
    if (estado) estado.value = 'todos';
    if (ordem) ordem.value = 'padrao';
    _filtroCategoria = 'todos'; _termoBusca = ''; _filtroEstado = 'todos'; _ordemAtual = 'padrao';
    renderizarInventario();
    showNotification("Filtros do inventário limpos", "info", 2000);
}
window.resetarFiltrosInventario = resetarFiltrosInventario;

/**
 * Renderização principal — reconstrói o grid a partir do estado em memória.
 */
function renderizarInventario() {
    const container = document.getElementById('items-container');
    if (!container) return;

    let itens = inventoryState.filter(item => {
        const matchCat = _filtroCategoria === 'todos' || item.tipo === _filtroCategoria;
        const matchBusca = !_termoBusca || item.nome.toLowerCase().includes(_termoBusca);
        const matchEstado = _filtroEstado === 'todos'
            || (_filtroEstado === 'equipados' && item.equipado)
            || (_filtroEstado === 'favoritos' && item.favorito);
        return matchCat && matchBusca && matchEstado;
    });

    switch (_ordemAtual) {
        case 'nome':
            itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            break;
        case 'peso':
            itens.sort((a, b) => b.peso - a.peso);
            break;
        case 'raridade': {
            const ordem = _rarityOrder();
            itens.sort((a, b) => ordem.indexOf(b.raridade) - ordem.indexOf(a.raridade));
            break;
        }
        default:
            // A ordem do array é a ordem personalizada persistida pelo usuário.
            // filter() já preserva essa sequência mesmo com busca e filtros.
            break;
    }

    container.innerHTML = '';
    if (inventoryState.length === 0) {
        container.innerHTML = `<div class="inv-empty-state">Sua mochila está vazia. Clique em "+ Adicionar Novo Item" para começar.</div>`;
    } else if (itens.length === 0) {
        container.innerHTML = `<div class="inv-empty-state">Nenhum item corresponde aos filtros atuais.</div>`;
    } else {
        itens.forEach(item => container.appendChild(criarCardItem(item)));
    }

    const contador = document.getElementById('inv-contador');
    if (contador) {
        const totalLabel = inventoryState.length === 1 ? 'item' : 'itens';
        contador.innerText = `${itens.length} de ${inventoryState.length} ${totalLabel}`;
    }
}
window.renderizarInventario = renderizarInventario;

function criarCardItem(item) {
    const info = TIPOS_INVENTARIO_INFO[item.tipo] || TIPOS_INVENTARIO_INFO.outros;
    const cdBonus = _calcularCdBonus(item);
    const cdMaxEfetivo = item.cdMax + cdBonus;
    const raridadeNome = typeof getNomeRaridade === 'function' ? getNomeRaridade(item.raridade) : item.raridade;
    const pesoTotal = item.peso * item.quantidade;

    const card = document.createElement('div');
    card.className = 'inv-card';
    card.dataset.raridade = item.raridade;
    if (item.equipado) card.classList.add('inv-card--equipado');
    if (cdMaxEfetivo > 0 && item.cdAtual <= 0) card.classList.add('inv-card--quebrado');
    else if (cdMaxEfetivo > 0 && (item.cdAtual / cdMaxEfetivo) < 0.3) card.classList.add('inv-card--danificado');
    card.dataset.id = item.id;
    card.draggable = _ordemAtual === 'padrao';

    card.innerHTML = `
        <div class="inv-card-topo">
            <span class="inv-card-icone rarity-${item.raridade}" aria-hidden="true">${info.icone}</span>
            <div class="inv-card-identidade">
                <input type="text" class="inv-card-nome" value="${_escapeAttr(item.nome)}" placeholder="Nome do item"
                       aria-label="Nome do item"
                       oninput="atualizarCampoItem(this.closest('.inv-card').dataset.id, 'nome', this.value)">
                <div class="inv-card-badges">
                    <span class="inv-card-raridade rarity-${item.raridade}">${_escapeHTML(raridadeNome)}</span>
                    ${item.equipado ? '<span class="inv-card-status">Equipado</span>' : ''}
                </div>
            </div>
            <button type="button" class="inv-card-favorito ${item.favorito ? 'ativo' : ''}"
                    aria-label="${item.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                    aria-pressed="${item.favorito}"
                    onclick="alternarFavoritoItem(this.closest('.inv-card').dataset.id)">★</button>
        </div>

        <div class="inv-card-meta">
            <label class="inv-card-field">
                <span>Categoria</span>
                <select class="inv-input inv-card-categoria" onchange="mudarCategoriaItem(this.closest('.inv-card').dataset.id, this.value)">
                    ${Object.keys(TIPOS_INVENTARIO_INFO).map(t => `<option value="${t}" ${t === item.tipo ? 'selected' : ''}>${_nomeTipo(t)}</option>`).join('')}
                </select>
            </label>
            <label class="inv-card-equip">
                <span>Em uso</span>
                <span class="inv-card-equip-control">
                    <input type="checkbox" class="inv-checkbox" ${item.equipado ? 'checked' : ''}
                           onchange="alternarEquipadoItem(this.closest('.inv-card').dataset.id, this.checked)">
                    Equipar
                </span>
            </label>
        </div>

        <div class="inv-card-stats">
            <label class="inv-card-stat">
                <span>Peso unitário</span>
                <span class="inv-card-input-suffix">
                    <input type="number" step="0.1" min="0" class="inv-input inv-card-peso" value="${item.peso}"
                           onchange="atualizarCampoItem(this.closest('.inv-card').dataset.id, 'peso', parseFloat(this.value) || 0); atualizarTudo();">
                    <small>kg</small>
                </span>
            </label>
            <div class="inv-card-stat">
                <span>Quantidade</span>
                <div class="inv-card-qtd-stepper" aria-label="Quantidade do item">
                    <button type="button" aria-label="Diminuir quantidade" onclick="ajustarQuantidadeItem(this.closest('.inv-card').dataset.id, -1)">−</button>
                    <strong>${item.quantidade}</strong>
                    <button type="button" aria-label="Aumentar quantidade" onclick="ajustarQuantidadeItem(this.closest('.inv-card').dataset.id, 1)">+</button>
                </div>
            </div>
        </div>

        <div class="inv-card-resumo">
            <span>${cdMaxEfetivo > 0 ? `CD ${Math.max(0, item.cdAtual)}/${cdMaxEfetivo}` : 'Sem durabilidade'}</span>
            <span>${pesoTotal.toFixed(1)} kg no total</span>
        </div>

        <div class="inv-card-rodape">
            <button type="button" class="inv-card-details" onclick="abrirModalItem(this.closest('.inv-card').dataset.id)">
                <span aria-hidden="true">⌕</span> Ver detalhes
            </button>
            <button type="button" class="inv-card-remove" onclick="removerItemInventario(this.closest('.inv-card').dataset.id)" aria-label="Remover item" title="Remover item">×</button>
        </div>
    `;
    return card;
}

/**
 * Mutações de campo — todas persistem e, quando o valor pode afetar cálculos
 * derivados (equipar, peso, quantidade), chamam atualizarTudo().
 */
function atualizarCampoItem(id, campo, valor) {
    const item = getItemInventario(id);
    if (!item) return;
    item[campo] = valor;
    persistirInventario(inventoryState);
}
window.atualizarCampoItem = atualizarCampoItem;

function mudarCategoriaItem(id, novoTipo) {
    const item = getItemInventario(id);
    if (!item) return;
    item.tipo = novoTipo;
    persistirInventario(inventoryState);
    sincronizarAtaqueDoItem(item);
    renderizarInventario();
    atualizarTudo();
}
window.mudarCategoriaItem = mudarCategoriaItem;

function alternarFavoritoItem(id) {
    const item = getItemInventario(id);
    if (!item) return;
    item.favorito = !item.favorito;
    persistirInventario(inventoryState);
    renderizarInventario();
}
window.alternarFavoritoItem = alternarFavoritoItem;

function alternarEquipadoItem(id, valor) {
    const item = getItemInventario(id);
    if (!item) return;
    item.equipado = valor;
    persistirInventario(inventoryState);
    sincronizarAtaqueDoItem(item);
    renderizarInventario();
    atualizarTudo();
}
window.alternarEquipadoItem = alternarEquipadoItem;

function ajustarQuantidadeItem(id, delta) {
    const item = getItemInventario(id);
    if (!item) return;
    item.quantidade = Math.max(1, (item.quantidade || 1) + delta);
    persistirInventario(inventoryState);
    renderizarInventario();
    atualizarTudo();
}
window.ajustarQuantidadeItem = ajustarQuantidadeItem;

function novoItemInventario() {
    const item = normalizarItemInventario({}, inventoryState.length);
    inventoryState.push(item);
    persistirInventario(inventoryState);
    renderizarInventario();
    atualizarTudo();

    requestAnimationFrame(() => {
        const cardNovo = Array.from(document.querySelectorAll('.inv-card')).find(card => card.dataset.id === item.id);
        const nomeInput = cardNovo?.querySelector('.inv-card-nome');
        if (nomeInput) { nomeInput.focus(); nomeInput.select(); }
    });
}
window.novoItemInventario = novoItemInventario;

function removerItemInventario(id) {
    const item = getItemInventario(id);
    if (!item) return;

    showConfirm(`Tem certeza que deseja remover "${item.nome}"?`, () => {
        if (item.tipo === 'armas' && item.equipado) {
            removerAtaqueDoItem(item.id);
        }
        inventoryState = inventoryState.filter(i => i.id !== id);
        persistirInventario(inventoryState);
        renderizarInventario();
        atualizarTudo();
        showNotification(`"${item.nome}" removido com sucesso.`, "success");
    }, () => {
        showNotification("Remoção cancelada.", "info");
    }, `Remover ${item.nome}?`);
}
window.removerItemInventario = removerItemInventario;

function limparInventario() {
    showConfirm("Tem certeza que deseja apagar TODOS os itens do seu inventário? Esta ação não pode ser desfeita.", () => {
        inventoryState.filter(i => i.tipo === 'armas' && i.equipado).forEach(i => removerAtaqueDoItem(i.id));
        inventoryState = [];
        persistirInventario(inventoryState);
        renderizarInventario();
        atualizarTudo();
        showNotification("Inventário limpo com sucesso.", "success");
    }, () => {
        showNotification("Limpeza do inventário cancelada.", "info");
    }, "Limpar Inventário?");
}
window.limparInventario = limparInventario;

/**
 * Reordenação por arraste — só ativa quando a ordenação em uso é "Padrão"
 * (nos outros modos a ordem exibida é derivada do critério escolhido, não
 * da ordem persistida, então arrastar não faria sentido visualmente).
 */
let _draggedCardId = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('items-container');
    if (!container) return;

    container.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.inv-card');
        if (!card || !card.draggable) { e.preventDefault(); return; }
        if (e.target.closest('input, textarea, select, button')) { e.preventDefault(); return; }
        _draggedCardId = card.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => card.classList.add('dragging'), 0);
    });

    container.addEventListener('dragover', (e) => {
        if (!_draggedCardId) return;
        e.preventDefault();
        const target = e.target.closest('.inv-card');
        if (target && target.dataset.id !== _draggedCardId) {
            container.querySelectorAll('.inv-card').forEach(c => c.classList.remove('drag-insert-top', 'drag-insert-bottom'));
            const rect = target.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2;
            target.classList.add(isAfter ? 'drag-insert-bottom' : 'drag-insert-top');
        }
    });

    container.addEventListener('drop', (e) => {
        if (!_draggedCardId) return;
        e.preventDefault();
        const target = e.target.closest('.inv-card');
        container.querySelectorAll('.inv-card').forEach(c => c.classList.remove('drag-insert-top', 'drag-insert-bottom', 'dragging'));

        if (target && target.dataset.id !== _draggedCardId) {
            const rect = target.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2;
            const fromIdx = inventoryState.findIndex(i => i.id === _draggedCardId);
            const [moved] = inventoryState.splice(fromIdx, 1);
            let toIdx = inventoryState.findIndex(i => i.id === target.dataset.id);
            if (isAfter) toIdx += 1;
            inventoryState.splice(toIdx, 0, moved);
            persistirInventario(inventoryState);
            renderizarInventario();
        }
        _draggedCardId = null;
    });

    container.addEventListener('dragend', () => {
        _draggedCardId = null;
        container.querySelectorAll('.inv-card').forEach(c => c.classList.remove('drag-insert-top', 'drag-insert-bottom', 'dragging'));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    inventoryState = carregarInventario();
    // Re-sincroniza armas equipadas com a aba de Ataques a cada carregamento da
    // página (espelha o comportamento antigo, em que reconstruir cada linha do
    // inventário re-verificava o vínculo com o ataque correspondente).
    inventoryState.filter(item => item.tipo === 'armas' && item.equipado).forEach(sincronizarAtaqueDoItem);
    renderizarInventario();
    atualizarTudo();
});
