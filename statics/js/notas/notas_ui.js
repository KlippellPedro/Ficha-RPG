/**
 * Lógica de Interface das Notas (Lista, Filtros e Favoritos)
 */

function adicionarNotaUI(titulo = "", tipo = "", desc = "", idIndex = null, camposCustom = "[]", favorito = false) {
    const container = document.getElementById('notas-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row nota-row-grid';
    row.dataset.index = index;

    row.innerHTML = `
        <button type="button" id="btn_fav_${index}" class="btn-fav ${favorito ? 'active' : ''}" onclick="toggleFavorito('${index}')" title="Favoritar">
            ${favorito ? '★' : '☆'}
        </button>
        <input type="text" id="nota_titulo_${index}" class="save-input inv-input" placeholder="Ex: Rumores da Taverna" value="${titulo}">
        <input type="text" id="nota_tipo_${index}" class="save-input inv-input" placeholder="Ex: Missão" value="${tipo}">
        
        <button type="button" class="btn-open-desc" onclick="abrirModalNota('${index}')">🔍</button>
        <button type="button" class="btn-open-desc" onclick="duplicarNota('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerNota(this)">×</button>

        <div style="display:none">
            <textarea id="nota_desc_${index}" class="save-input">${desc}</textarea>
            <textarea id="nota_campos_${index}" class="save-input">${camposCustom}</textarea>
            <input type="checkbox" id="nota_fav_${index}" class="save-input" ${favorito ? 'checked' : ''}>
        </div>
    `;

    container.appendChild(row);
    if (idIndex === null) {
        atualizarTudo();
        ordenarNotas();
        filtrarNotas();
    }
}

/**
 * Alterna o estado de favorito de uma nota
 */
function toggleFavorito(index) {
    const btn = document.getElementById(`btn_fav_${index}`);
    const checkbox = document.getElementById(`nota_fav_${index}`);
    if (!btn || !checkbox) return;

    const novoEstado = !checkbox.checked;
    checkbox.checked = novoEstado;

    btn.classList.toggle('active', novoEstado);
    btn.innerText = novoEstado ? '★' : '☆';

    atualizarTudo();
    ordenarNotas();
}

/**
 * Ordena as notas: Favoritos primeiro, depois por Título
 */
function ordenarNotas() {
    const container = document.getElementById('notas-container');
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('.item-row'));
    rows.sort((a, b) => {
        const isFavA = document.getElementById(`nota_fav_${a.dataset.index}`)?.checked ? 1 : 0;
        const isFavB = document.getElementById(`nota_fav_${b.dataset.index}`)?.checked ? 1 : 0;
        if (isFavA !== isFavB) return isFavB - isFavA;
        const tituloA = document.getElementById(`nota_titulo_${a.dataset.index}`)?.value.toLowerCase() || "";
        const tituloB = document.getElementById(`nota_titulo_${b.dataset.index}`)?.value.toLowerCase() || "";
        return tituloA.localeCompare(tituloB);
    });
    rows.forEach(row => container.appendChild(row));
}

function filtrarNotas() {
    const termo = document.getElementById('search-nota')?.value.toLowerCase() || "";
    let contador = 0;

    document.querySelectorAll('#notas-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const titulo = document.getElementById(`nota_titulo_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`nota_tipo_${index}`)?.value.toLowerCase() || "";

        const matches = titulo.includes(termo) || tipo.includes(termo);
        row.style.display = matches ? 'grid' : 'none';
        if (matches) contador++;
    });

    const counterEl = document.getElementById('notas-counter');
    if (counterEl) counterEl.innerText = `Notas visíveis: ${contador}`;
}

function duplicarNota(index) {
    const campos = ['titulo', 'tipo', 'desc', 'campos'];
    const vals = campos.map(f => document.getElementById(`nota_${f}_${index}`)?.value || "");
    const isFav = document.getElementById(`nota_fav_${index}`)?.checked || false;

    adicionarNotaUI(vals[0] + " (Cópia)", vals[1], vals[2], null, vals[3], isFav);
}

function removerNota(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    showConfirm("Deseja apagar esta nota?", () => {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(k => { if (k.startsWith('nota_') && k.endsWith(`_${index}`)) delete dados[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        row.remove();
        atualizarTudo();
        filtrarNotas();
        showNotification("Nota removida com sucesso.", "success");
    }, () => {
        showNotification("Remoção de nota cancelada.", "info");
    }, "Apagar Nota?");
}

function resetarFiltrosNota() {
    const searchInput = document.getElementById('search-nota');
    if (searchInput) searchInput.value = '';
    filtrarNotas();
    showNotification("Busca limpa", "info", 2000);
}