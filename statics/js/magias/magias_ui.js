/**
 * Lógica de Interface das Magias (Lista e Filtros)
 */
function renderizarCampoNivel(tipo, nivel, index) {
    if (tipo === "Divinas" || tipo === "Demoniaca") {
        return `
            <select id="mag_nivel_${index}" class="save-input inv-input" onchange="atualizarCorNivel('${index}')">
                <option value="1" ${nivel == "1" ? 'selected' : ''}>I</option>
                <option value="2" ${nivel == "2" ? 'selected' : ''}>II</option>
            </select>`;
    } else if (tipo === "Comum") {
        return `
            <select id="mag_nivel_${index}" class="save-input inv-input" onchange="atualizarCorNivel('${index}')">
                <option value="1" ${nivel == "1" ? 'selected' : ''}>I</option>
                <option value="2" ${nivel == "2" ? 'selected' : ''}>II</option>
                <option value="3" ${nivel == "3" ? 'selected' : ''}>III</option>
                <option value="4" ${nivel == "4" ? 'selected' : ''}>IV</option>
            </select>`;
    } else {
        const placeholder = tipo === "Elemental" ? "Ex: 20" : "Nível";
        let displayNivel = nivel;
        if (tipo === "Elemental" && nivel && !String(nivel).endsWith('%')) {
            displayNivel = nivel + '%';
        }
        return `<input type="text" id="mag_nivel_${index}" class="save-input inv-input mag-nivel-extra" placeholder="${placeholder}" value="${displayNivel}" ${tipo === "Elemental" ? `onblur="formatElementalNivel('${index}')"` : ''}>`;
    }
}

function formatElementalNivel(index) {
    const input = document.getElementById(`mag_nivel_${index}`);
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    if (input && tipo === "Elemental") {
        let val = input.value.trim();
        if (val && !val.endsWith('%')) input.value = val + '%';
    }
}

function atualizarCorNivel(index) {
    const select = document.getElementById(`mag_nivel_${index}`);
    if (!select || select.tagName !== 'SELECT') return;
    select.classList.remove('mag-nivel-1', 'mag-nivel-2', 'mag-nivel-3', 'mag-nivel-4', 'mag-nivel-extra');
    const val = select.value;
    if (val === "1") select.classList.add('mag-nivel-1');
    else if (val === "2") select.classList.add('mag-nivel-2');
    else if (val === "3") select.classList.add('mag-nivel-3');
    else if (val === "4") select.classList.add('mag-nivel-4');
    else select.classList.add('mag-nivel-extra');
}

function adicionarMagiaUI(nome = "", tipo = "Comum", nivel = "1", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", teste = "") {
    const container = document.getElementById('magias-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();
    const row = document.createElement('div');
    row.className = 'item-row mag-row-grid draggable';
    row.draggable = true;
    row.dataset.index = index;
    let optionsHtml = TIPOS_MAGIA.map(t => `<option value="${t}" ${tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    row.innerHTML = `
        <input type="text" id="mag_nome_${index}" class="save-input inv-input" placeholder="Nome da Magia" value="${nome}">
        <select id="mag_tipo_${index}" class="save-input inv-input" onchange="alternarTipoNivel('${index}')">
            ${optionsHtml}
        </select>
        <div id="container_nivel_${index}">${renderizarCampoNivel(tipo, nivel, index)}</div>
        <div style="display:flex; gap:5px;">
            <input type="text" id="mag_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="mag_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        <button type="button" class="btn-open-desc" onclick="abrirModalMag('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarMagia('${index}')">Usar</button>
        <button type="button" class="btn-open-desc" onclick="duplicarMagia('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerMagia(this)">×</button>
        <div style="display:none">
            <textarea id="mag_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="mag_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="mag_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="mag_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="mag_teste_${index}" class="save-input" value="${teste}">
        </div>
    `;
    container.appendChild(row);
    atualizarCorNivel(index);
    if (idIndex === null) { atualizarTudo(); filtrarMagias(); }
}

function alternarTipoNivel(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    const container = document.getElementById(`container_nivel_${index}`);
    container.innerHTML = renderizarCampoNivel(tipo, "1", index);
    atualizarCorNivel(index);
    atualizarTudo();
}

function duplicarMagia(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    let nivel = document.getElementById(`mag_nivel_${index}`).value;
    if (tipo === "Elemental" && nivel.endsWith('%')) nivel = nivel.slice(0, -1);
    adicionarMagiaUI(document.getElementById(`mag_nome_${index}`).value + " (Cópia)", tipo, nivel, document.getElementById(`mag_custo_${index}`).value, document.getElementById(`mag_tipo_custo_${index}`).value, document.getElementById(`mag_desc_${index}`).value, null, document.getElementById(`mag_duracao_${index}`).value, document.getElementById(`mag_alcance_${index}`).value, document.getElementById(`mag_acao_${index}`).value, document.getElementById(`mag_teste_${index}`).value);
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

function resetarFiltrosMagia() {
    document.getElementById('search-magia').value = '';
    document.getElementById('filter-magia-tipo').value = 'todos';
    document.getElementById('filter-magia-nivel').value = 'todos';
    filtrarMagias();
    showNotification("Filtros limpos", "info", 2000);
}

function filtrarMagias() {
    const termo = document.getElementById('search-magia').value.toLowerCase();
    const fTipo = document.getElementById('filter-magia-tipo').value;
    const fNivel = document.getElementById('filter-magia-nivel').value;
    let contador = 0;
    document.querySelectorAll('#magias-container .item-row').forEach(row => {
        const idx = row.dataset.index;
        const n = document.getElementById(`mag_nome_${idx}`)?.value.toLowerCase() || "";
        const t = document.getElementById(`mag_tipo_${idx}`)?.value || "";
        const ni = document.getElementById(`mag_nivel_${idx}`)?.value || "";
        const match = n.includes(termo) && (fTipo === 'todos' || t === fTipo) && (fNivel === 'todos' || ni === fNivel || (fNivel === 'extra' && !['1', '2', '3', '4'].includes(ni)));
        row.style.display = match ? 'grid' : 'none';
        if (match) contador++;
    });
    const countEl = document.getElementById('magias-counter');
    if (countEl) countEl.innerText = `Magias visíveis: ${contador}`;
}