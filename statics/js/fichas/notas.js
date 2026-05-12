let notaSendoEditadaIdx = null;

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

function abrirModalNota(index) {
    notaSendoEditadaIdx = index;
    const titulo = document.getElementById(`nota_titulo_${index}`).value;
    const tipo = document.getElementById(`nota_tipo_${index}`).value;
    const desc = document.getElementById(`nota_desc_${index}`).value;
    const camposRaw = document.getElementById(`nota_campos_${index}`).value;

    let campos = [];
    try { campos = JSON.parse(camposRaw || "[]"); } catch (e) { campos = []; }

    document.getElementById('modal-nota-title').innerText = `Diário: ${titulo || "Nova Nota"}`;

    document.getElementById('modal-nota-body').innerHTML = `
        <div class="input-group">
            <label>Tipo / Categoria</label>
            <input type="text" id="modal_nota_tipo" class="inv-input" value="${tipo}" placeholder="Ex: Lore, Personagem, Alvo...">
        </div>
        <div class="input-group">
            <label>Anotações Gerais</label>
            <textarea id="modal_nota_desc" class="inv-input" style="min-height: 150px">${desc}</textarea>
        </div>

        <div class="section-divider">Camos Personalizados</div>
        <div id="custom-fields-container"></div>
        <button type="button" class="btn-add-class" style="width: 100%; margin-top: 10px;" onclick="adicionarCampoDinamico()">+ Adicionar Campo Flexível</button>

        <div class="modal-footer" style="margin-top: 20px;">
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesNota()" style="width:100%">Salvar no Diário</button>
        </div>
    `;

    const container = document.getElementById('custom-fields-container');
    if (campos.length > 0) {
        campos.forEach(c => adicionarCampoDinamico(c.label, c.valor));
    } else {
        adicionarCampoDinamico();
    }

    document.getElementById('modal-nota').style.display = 'flex';
}

function adicionarCampoDinamico(label = "", valor = "") {
    const container = document.getElementById('custom-fields-container');
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.innerHTML = `
        <input type="text" class="inv-input field-label" placeholder="Nome do campo" value="${label}" style="flex: 1;">
        <input type="text" class="inv-input field-value" placeholder="Informação" value="${valor}" style="flex: 2;">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function fecharModalNota() {
    document.getElementById('modal-nota').style.display = 'none';
    notaSendoEditadaIdx = null;
}

function salvarDetalhesNota() {
    if (notaSendoEditadaIdx !== null) {
        const idx = notaSendoEditadaIdx;

        document.getElementById(`nota_tipo_${idx}`).value = document.getElementById('modal_nota_tipo').value;
        document.getElementById(`nota_desc_${idx}`).value = document.getElementById('modal_nota_desc').value;

        const rows = document.querySelectorAll('.custom-field-row');
        const camposArr = [];
        rows.forEach(row => {
            const l = row.querySelector('.field-label').value;
            const v = row.querySelector('.field-value').value;
            if (l.trim() || v.trim()) camposArr.push({ label: l, valor: v });
        });

        document.getElementById(`nota_campos_${idx}`).value = JSON.stringify(camposArr);

        fecharModalNota();
        atualizarTudo();
        filtrarNotas();
    }
}

function duplicarNota(index) {
    adicionarNotaUI(
        document.getElementById(`nota_titulo_${index}`).value + " (Cópia)",
        document.getElementById(`nota_tipo_${index}`).value,
        document.getElementById(`nota_desc_${index}`).value,
        null,
        document.getElementById(`nota_campos_${index}`).value,
        document.getElementById(`nota_fav_${index}`).checked
    );
}

function removerNota(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    if (!confirm("Deseja apagar esta nota?")) return;

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.includes(`nota_`) && k.endsWith(`_${index}`)) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarNotas();
}

function limparNotas() {
    if (!confirm("Apagar todas as suas anotações?")) return;
    document.getElementById('notas-container').innerHTML = '';
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.startsWith('nota_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarNotas();
}

function resetarFiltrosNota() {
    document.getElementById('search-nota').value = '';
    filtrarNotas();
    showNotification("Busca limpa", "info", 2000);
}

function filtrarNotas() {
    const termo = document.getElementById('search-nota').value.toLowerCase();
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

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('nota_titulo_'))
        .map(k => k.replace('nota_titulo_', ''))
        .sort((a, b) => a - b);

    indices.forEach(idx => {
        adicionarNotaUI(salvo[`nota_titulo_${idx}`], salvo[`nota_tipo_${idx}`], salvo[`nota_desc_${idx}`], idx, salvo[`nota_campos_${idx}`], salvo[`nota_fav_${idx}`] === true);
    });

    atualizarTudo();
    ordenarNotas();
    filtrarNotas();
});