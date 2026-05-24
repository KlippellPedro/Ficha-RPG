/**
 * Lógica de Interface dos Poderes (Lista e Filtros)
 */

function getOpcoesClassesPod(valorSelecionado = "") {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const classes = typeof getClassesAtivas === 'function' ? getClassesAtivas(dados) : [];
    let opcoes = `<option value="Geral" ${valorSelecionado === 'Geral' || !valorSelecionado ? 'selected' : ''}>Geral</option>`;
    opcoes += `<option value="Raça" ${valorSelecionado === 'Raça' ? 'selected' : ''}>Raça</option>`;
    opcoes += `<option value="Povo" ${valorSelecionado === 'Povo' ? 'selected' : ''}>Povo</option>`;
    opcoes += `<option value="Outro" ${valorSelecionado === 'Outro' ? 'selected' : ''}>Outro</option>`;

    classes.forEach(c => {
        const nomeFormatado = c.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const valor = c.sub ? `${c.name}_${c.sub}` : c.name;
        const label = c.sub ? `${nomeFormatado} (${c.sub})` : nomeFormatado;
        opcoes += `<option value="${valor}" ${valorSelecionado === valor ? 'selected' : ''}>${label}</option>`;
    });
    return opcoes;
}

function atualizarFiltroPoderesUI() {
    const filterSelect = document.getElementById('filter-poder-tipo');
    if (filterSelect) filterSelect.innerHTML = `<option value="todos">Todas as Fontes</option>` + getOpcoesClassesPod(filterSelect.value);
}

function adicionarPoderUI(nome = "", tipo = "Poder de Classe", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", pv_bonus = 0, pm_bonus = 0, mods = "[]") {
    const container = document.getElementById('poderes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row pod-row-grid';
    row.dataset.index = index;
    row.innerHTML = `
        <input type="text" id="poder_nome_${index}" class="save-input inv-input" placeholder="Nome do Poder" value="${nome}">
        <select id="poder_classe_${index}" class="save-input inv-input" onchange="atualizarTudo()">
            ${getOpcoesClassesPod(classe || tipo)} 
        </select>
        <div class="cost-container" style="display:flex; gap:5px;">
            <input type="text" id="poder_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="poder_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        <button type="button" class="btn-open-desc" onclick="abrirModalPod('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarPoder('${index}')">Usar</button>
        <button type="button" class="btn-duplicate" onclick="duplicarPoder('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerPoder(this)">×</button>

        <div style="display:none">
            <input type="hidden" id="poder_tipo_${index}" class="save-input" value="${tipo}">
            <textarea id="poder_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="poder_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="poder_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="poder_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="poder_pv_bonus_${index}" class="save-input" value="${pv_bonus}">
            <input type="hidden" id="poder_pm_bonus_${index}" class="save-input" value="${pm_bonus}">
            <input type="hidden" id="poder_mods_${index}" class="save-input" value='${mods}'>
        </div>
    `;
    container.appendChild(row);
    if (idIndex === null) { atualizarTudo(); filtrarPoderes(); }
}

function duplicarPoder(index) {
    const fields = ['nome', 'tipo', 'custo', 'tipo_custo', 'desc', 'duracao', 'alcance', 'acao', 'classe', 'pv_bonus', 'pm_bonus', 'mods'];
    const vals = fields.map(f => document.getElementById(`poder_${f}_${index}`)?.value || "");
    adicionarPoderUI(vals[0] + " (Cópia)", vals[1], vals[2], vals[3], vals[4], null, vals[5], vals[6], vals[7], vals[8], vals[9], vals[10], vals[11]);
}

function removerPoder(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.endsWith(`_${index}`) && k.startsWith('poder_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarPoderes();
}

function filtrarPoderes() {
    const termo = document.getElementById('search-poder').value.toLowerCase();
    const fTipo = document.getElementById('filter-poder-tipo').value.toLowerCase();

    let contador = 0;
    document.querySelectorAll('#poderes-container .item-row').forEach(row => {
        const idx = row.dataset.index;
        const n = document.getElementById(`poder_nome_${idx}`)?.value.toLowerCase() || "";
        const t = document.getElementById(`poder_classe_${idx}`)?.value.toLowerCase() || "";

        const match = n.includes(termo) && (fTipo === 'todos' || t === fTipo.toLowerCase());
        row.style.display = match ? 'grid' : 'none';
        if (match) contador++;
    });
    const countEl = document.getElementById('poderes-counter');
    if (countEl) countEl.innerText = `Poderes visíveis: ${contador}`;
}

function limparPoderes() {
    showConfirm("Apagar todos os poderes?", () => {
        document.getElementById('poderes-container').innerHTML = '';
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(k => { if (k.startsWith('poder_')) delete dados[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        showNotification("Todos os poderes foram removidos.", "success");
    }, () => {
        showNotification("Limpeza de poderes cancelada.", "info");
    }, "Limpar Poderes?");
}

function resetarFiltrosPoderes() {
    document.getElementById('search-poder').value = '';
    document.getElementById('filter-poder-tipo').value = 'todos';
    filtrarPoderes();
}
