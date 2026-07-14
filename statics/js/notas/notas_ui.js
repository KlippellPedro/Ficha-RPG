/** Interface das notas: cards, favoritos, filtros e resumos. */

function configurarCampoNota(control, id, value = "") {
    control.id = id;
    control.value = value ?? "";
    return control;
}

function atualizarResumoNota(index) {
    const row = document.querySelector(`#notas-container .item-row[data-index="${CSS.escape(String(index))}"]`);
    if (!row) return;

    const desc = document.getElementById(`nota_desc_${index}`)?.value.trim() || "";
    const preview = row.querySelector('.nota-card-preview');
    if (preview) preview.textContent = desc || "Esta nota ainda não possui conteúdo. Abra para começar a escrever.";

    let topics = [];
    try {
        topics = JSON.parse(document.getElementById(`nota_campos_${index}`)?.value || "[]");
    } catch {
        topics = [];
    }
    const topicsCount = row.querySelector('.nota-topics-count');
    if (topicsCount) {
        const count = Array.isArray(topics) ? topics.length : 0;
        topicsCount.textContent = `${count} ${count === 1 ? 'tópico' : 'tópicos'}`;
    }

    const category = document.getElementById(`nota_tipo_${index}`)?.value.trim() || "Sem categoria";
    row.dataset.category = category.toLowerCase();
}

function adicionarNotaUI(titulo = "", tipo = "", desc = "", idIndex = null, camposCustom = "[]", favorito = false, data = "") {
    const container = document.getElementById('notas-container');
    if (!container) return;

    const index = String(idIndex !== null ? idIndex : Date.now());
    const dataFormatada = data || new Date().toLocaleDateString('pt-BR');
    const row = document.createElement('article');
    row.className = 'item-row nota-row-grid nota-card draggable ui-enter';
    row.draggable = true;
    row.dataset.index = index;

    row.innerHTML = `
        <header class="nota-card-header">
            <button type="button" class="btn-fav" title="Favoritar nota" aria-label="Favoritar nota"></button>
            <div class="nota-header-info">
                <span class="nota-card-kicker">Entrada do diário</span>
                <input type="text" class="save-input inv-input nota-titulo-lista" placeholder="Título da nota" aria-label="Título da nota">
                <small class="nota-data-lista"></small>
            </div>
            <button type="button" class="btn-remove-class nota-remove-button" title="Apagar nota" aria-label="Apagar nota">×</button>
        </header>

        <div class="nota-card-body">
            <div class="nota-tag-container">
                <label>
                    <span class="sr-only">Categoria da nota</span>
                    <input type="text" class="save-input inv-input nota-tag" placeholder="Categoria">
                </label>
                <span class="nota-topics-count">0 tópicos</span>
            </div>
            <p class="nota-card-preview"></p>
        </div>

        <footer class="nota-card-footer">
            <button type="button" class="btn-open-desc nota-open-button">Abrir nota</button>
            <button type="button" class="btn-duplicate nota-duplicate-button" title="Duplicar nota">Duplicar</button>
        </footer>

        <div class="nota-hidden-data" hidden>
            <textarea class="save-input nota-desc-input"></textarea>
            <textarea class="save-input nota-fields-input"></textarea>
            <input type="checkbox" class="save-input nota-favorite-input">
            <input type="hidden" class="save-input nota-date-input">
        </div>
    `;

    const titleInput = configurarCampoNota(row.querySelector('.nota-titulo-lista'), `nota_titulo_${index}`, titulo);
    const typeInput = configurarCampoNota(row.querySelector('.nota-tag'), `nota_tipo_${index}`, tipo);
    configurarCampoNota(row.querySelector('.nota-desc-input'), `nota_desc_${index}`, desc);
    configurarCampoNota(row.querySelector('.nota-fields-input'), `nota_campos_${index}`, camposCustom || "[]");
    const favoriteInput = row.querySelector('.nota-favorite-input');
    favoriteInput.id = `nota_fav_${index}`;
    favoriteInput.checked = Boolean(favorito);
    configurarCampoNota(row.querySelector('.nota-date-input'), `nota_data_${index}`, dataFormatada);

    const favoriteButton = row.querySelector('.btn-fav');
    favoriteButton.id = `btn_fav_${index}`;
    favoriteButton.classList.toggle('active', Boolean(favorito));
    favoriteButton.textContent = favorito ? '★' : '☆';
    favoriteButton.setAttribute('aria-pressed', favorito ? 'true' : 'false');
    favoriteButton.addEventListener('click', () => toggleFavorito(index));

    row.querySelector('.nota-data-lista').textContent = dataFormatada;
    row.querySelector('.nota-open-button').addEventListener('click', () => abrirModalNota(index));
    row.querySelector('.nota-duplicate-button').addEventListener('click', () => duplicarNota(index));
    row.querySelector('.nota-remove-button').addEventListener('click', event => removerNota(event.currentTarget));

    titleInput.addEventListener('input', filtrarNotas);
    typeInput.addEventListener('input', () => {
        atualizarResumoNota(index);
        filtrarNotas();
    });

    const hoje = new Date().toLocaleDateString('pt-BR');
    row.classList.toggle('nota-recente', dataFormatada === hoje);
    container.appendChild(row);
    atualizarResumoNota(index);

    if (idIndex === null) {
        atualizarTudo();
        ordenarNotas();
        filtrarNotas();
        titleInput.focus();
    }
}

function toggleFavorito(index) {
    const button = document.getElementById(`btn_fav_${index}`);
    const checkbox = document.getElementById(`nota_fav_${index}`);
    if (!button || !checkbox) return;

    checkbox.checked = !checkbox.checked;
    button.classList.toggle('active', checkbox.checked);
    button.textContent = checkbox.checked ? '★' : '☆';
    button.setAttribute('aria-pressed', checkbox.checked ? 'true' : 'false');
    atualizarTudo();
    ordenarNotas();
    filtrarNotas();
}

function ordenarNotas() {
    const container = document.getElementById('notas-container');
    if (!container) return;

    const rows = [...container.querySelectorAll('.item-row')];
    rows.sort((a, b) => {
        const favA = document.getElementById(`nota_fav_${a.dataset.index}`)?.checked ? 1 : 0;
        const favB = document.getElementById(`nota_fav_${b.dataset.index}`)?.checked ? 1 : 0;
        if (favA !== favB) return favB - favA;
        const titleA = document.getElementById(`nota_titulo_${a.dataset.index}`)?.value.toLowerCase() || "";
        const titleB = document.getElementById(`nota_titulo_${b.dataset.index}`)?.value.toLowerCase() || "";
        return titleA.localeCompare(titleB, 'pt-BR');
    });
    rows.forEach(row => container.appendChild(row));
}

function filtrarNotas() {
    const termo = document.getElementById('search-nota')?.value.trim().toLowerCase() || "";
    const termoDesc = document.getElementById('search-nota-desc')?.value.trim().toLowerCase() || "";
    const rows = [...document.querySelectorAll('#notas-container .item-row')];
    let contador = 0;

    rows.forEach(row => {
        const index = row.dataset.index;
        const titulo = document.getElementById(`nota_titulo_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`nota_tipo_${index}`)?.value.toLowerCase() || "";
        const desc = document.getElementById(`nota_desc_${index}`)?.value.toLowerCase() || "";
        const match = (titulo.includes(termo) || tipo.includes(termo)) && desc.includes(termoDesc);
        row.hidden = !match;
        if (match) contador += 1;
    });

    const counter = document.getElementById('notas-counter');
    if (counter) counter.textContent = `${contador} ${contador === 1 ? 'visível' : 'visíveis'}`;
    const summary = document.getElementById('notas-summary-count');
    if (summary) summary.textContent = String(rows.length);
    const emptyState = document.getElementById('notas-empty-state');
    if (emptyState) emptyState.hidden = contador !== 0;
}

function duplicarNota(index) {
    const fields = ['titulo', 'tipo', 'desc', 'campos'];
    const values = fields.map(field => document.getElementById(`nota_${field}_${index}`)?.value || "");
    const isFavorite = document.getElementById(`nota_fav_${index}`)?.checked || false;
    adicionarNotaUI(`${values[0] || 'Nota'} (Cópia)`, values[1], values[2], null, values[3], isFavorite);
}

function removerNota(btn) {
    const row = btn.closest('.item-row');
    if (!row) return;
    const index = row.dataset.index;
    showConfirm("Deseja apagar esta nota?", () => {
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.startsWith('nota_') && key.endsWith(`_${index}`)) delete dados[key];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        row.remove();
        atualizarTudo();
        filtrarNotas();
        showNotification("Nota removida com sucesso.", "success");
    }, () => {
        showNotification("Remoção de nota cancelada.", "info");
    }, "Apagar nota?");
}

function resetarFiltrosNota() {
    const searchInput = document.getElementById('search-nota');
    const searchDescInput = document.getElementById('search-nota-desc');
    if (searchInput) searchInput.value = '';
    if (searchDescInput) searchDescInput.value = '';
    filtrarNotas();
    showNotification("Busca limpa", "info", 2000);
}
