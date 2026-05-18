/**
 * Lógica de Interface das Habilidades (Lista e Filtros)
 */

function getOpcoesClassesHab(valorSelecionado = "") {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const classes = getClassesAtivas(dados);
    let opcoes = `<option value="Geral" ${valorSelecionado === 'Geral' || !valorSelecionado ? 'selected' : ''}>Geral</option>`;
    opcoes += `<option value="Raça" ${valorSelecionado === 'Raça' ? 'selected' : ''}>Raça</option>`;
    opcoes += `<option value="Ancião" ${valorSelecionado === 'Ancião' ? 'selected' : ''}>Ancião</option>`;
    opcoes += `<option value="Outro" ${valorSelecionado === 'Outro' ? 'selected' : ''}>Outro</option>`;

    classes.forEach(c => {
        const nomeFormatado = c.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const valor = c.sub ? `${c.name}_${c.sub}` : c.name;
        const label = c.sub ? `${nomeFormatado} (${c.sub})` : nomeFormatado;
        opcoes += `<option value="${valor}" ${valorSelecionado === valor ? 'selected' : ''}>${label}</option>`;
    });
    return opcoes;
}

function atualizarFiltroHabilidadesUI() {
    const filterSelect = document.getElementById('filter-habilidade-classe');
    if (filterSelect) filterSelect.innerHTML = `<option value="todos">Todas as Fontes</option>` + getOpcoesClassesHab(filterSelect.value);
}

function adicionarHabilidadeUI(nome = "", tipo = "Ativa", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", mods = "[]") {
    const container = document.getElementById('habilidades-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row hab-row-grid';
    row.dataset.index = index;
    row.innerHTML = `
        <input type="text" id="hab_nome_${index}" class="save-input inv-input" placeholder="Nome" value="${nome}">
        <select id="hab_classe_${index}" class="save-input inv-input"> <-- CORRETO: Único para cada linha
            ${getOpcoesClassesHab(classe)} 
        </select>
        <div style="display:flex; gap:5px;">
            <input type="text" id="hab_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="hab_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        <button type="button" class="btn-open-desc" onclick="abrirModalHab('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarHabilidade('${index}')">Usar</button>
        <button type="button" class="btn-duplicate" onclick="duplicarHabilidade('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerHabilidade(this)">×</button>

        <div style="display:none">
            <textarea id="hab_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="hab_tipo_${index}" class="save-input" value="${tipo}">
            <input type="hidden" id="hab_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="hab_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="hab_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="hab_mods_${index}" class="save-input" value='${mods}'>
        </div>
    `;
    container.appendChild(row);
    if (idIndex === null) { atualizarTudo(); filtrarHabilidades(); }
}

function duplicarHabilidade(index) {
    const fields = ['nome', 'tipo', 'classe', 'custo', 'tipo_custo', 'desc', 'duracao', 'alcance', 'acao', 'mods'];
    const vals = fields.map(f => document.getElementById(`hab_${f}_${index}`)?.value || "");
    adicionarHabilidadeUI(vals[0] + " (Cópia)", vals[1], vals[3], vals[4], vals[5], null, vals[6], vals[7], vals[8], vals[2], vals[9]);
}

function removerHabilidade(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.endsWith(`_${index}`) && k.startsWith('hab_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarHabilidades();
}

function filtrarHabilidades() {
    const termo = document.getElementById('search-habilidade').value.toLowerCase();
    const fTipo = document.getElementById('filter-habilidade-tipo').value.toLowerCase();
    const fClasse = document.getElementById('filter-habilidade-classe')?.value.toLowerCase() || "todos";

    let contador = 0;
    document.querySelectorAll('#habilidades-container .item-row').forEach(row => {
        const idx = row.dataset.index;
        const n = document.getElementById(`hab_nome_${idx}`)?.value.toLowerCase() || "";
        const c = document.getElementById(`hab_classe_${idx}`)?.value.toLowerCase() || "";
        const t = document.getElementById(`hab_tipo_${idx}`)?.value.toLowerCase() || "";

        const match = n.includes(termo) && (fTipo === 'todos' || t === fTipo) && (fClasse === 'todos' || c === fClasse);
        row.style.display = match ? 'grid' : 'none';
        if (match) contador++;
    });
    const countEl = document.getElementById('habilidades-counter');
    if (countEl) countEl.innerText = `Habilidades visíveis: ${contador}`;
}

function limparHabilidades() {
    showConfirm("Apagar todas as habilidades?", () => {
        document.getElementById('habilidades-container').innerHTML = '';
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(k => { if (k.startsWith('hab_')) delete dados[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        showNotification("Todas as habilidades foram removidas.", "success");
    }, () => {
        showNotification("Limpeza de habilidades cancelada.", "info");
    }, "Limpar Habilidades?");
}

function resetarFiltrosHabilidades() {
    document.getElementById('search-habilidade').value = '';
    document.getElementById('filter-habilidade-tipo').value = 'todos';
    filtrarHabilidades();
}