/**
 * Lógica de Interface dos Poderes (Lista e Filtros)
 */

function _escapePoderHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function _escapePoderAttr(value) {
    return _escapePoderHTML(value).replace(/"/g, '&quot;');
}

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
        opcoes += `<option value="${_escapePoderAttr(valor)}" ${valorSelecionado === valor ? 'selected' : ''}>${_escapePoderHTML(label)}</option>`;
    });
    return opcoes;
}

function atualizarFiltroPoderesUI() {
    const filterSelect = document.getElementById('filter-poder-tipo');
    if (filterSelect) filterSelect.innerHTML = `<option value="todos">Todas as Fontes</option>` + getOpcoesClassesPod(filterSelect.value);
}

function adicionarPoderUI(nome = "", tipo = "Poder de Classe", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", pv_bonus = 0, pm_bonus = 0, mods = "[]", buffAtivo = undefined, modoAtivoPas = "Ativa") {
    const container = document.getElementById('poderes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();
    const isPassiva = modoAtivoPas === 'Passiva';
    const isAtivo = buffAtivo === 'true';
    const hasLegacyBuff = buffAtivo === undefined;
    const safeIndex = _escapePoderAttr(index);
    const resumoAcao = acao || 'Ação não definida';
    const resumoDuracao = duracao || 'Duração livre';
    const resumoAlcance = alcance || 'Alcance não definido';

    const row = document.createElement('div');
    row.className = `item-row pod-row-grid poder-card ui-card draggable${isAtivo ? ' has-active-buff' : ''}`;
    row.draggable = true;
    row.dataset.index = index;
    row.dataset.tipo = modoAtivoPas;
    row.innerHTML = `
        <div class="poder-card-head">
            <span class="poder-card-icon" aria-hidden="true">✦</span>
            <div class="poder-card-identity">
                <input type="text" id="poder_nome_${safeIndex}" class="save-input poder-card-name" placeholder="Nome do poder" value="${_escapePoderAttr(nome)}" aria-label="Nome do poder">
                <div class="poder-card-badges">
                    <span class="poder-mode-badge" data-poder-modo-label>${_escapePoderHTML(modoAtivoPas)}</span>
                    <span class="poder-buff-badge" data-poder-buff-label>${isAtivo ? 'Buff ativo' : 'Sem buff ativo'}</span>
                </div>
            </div>
            <button type="button" class="poder-card-remove" onclick="removerPoder(this)" aria-label="Remover poder" title="Remover poder">×</button>
        </div>

        <div class="poder-card-fields">
            <label class="poder-card-field">
                <span>Origem</span>
                <select id="poder_classe_${safeIndex}" class="save-input inv-input" onchange="atualizarTudo()">
                    ${getOpcoesClassesPod(classe || tipo)}
                </select>
            </label>
            <label class="poder-card-field">
                <span>Custo</span>
                <span class="cost-container">
                    <input type="text" id="poder_custo_${safeIndex}" class="save-input inv-input" inputmode="numeric" placeholder="0" value="${_escapePoderAttr(custo)}">
                    <select id="poder_tipo_custo_${safeIndex}" class="save-input inv-input" aria-label="Recurso do custo">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </span>
            </label>
        </div>

        <div class="poder-card-summary">
            <span data-poder-resumo-acao>${_escapePoderHTML(resumoAcao)}</span>
            <span data-poder-resumo-duracao>${_escapePoderHTML(resumoDuracao)}</span>
            <span data-poder-resumo-alcance>${_escapePoderHTML(resumoAlcance)}</span>
        </div>

        <div class="entity-card-accordion">
            <div class="entity-card-accordion-content" id="poder_desc_display_${safeIndex}">${_escapePoderHTML(desc) || 'Sem descrição.'}</div>
        </div>
        <button type="button" class="btn-toggle-desc" onclick="toggleDescPoder(this)">Mostrar detalhes</button>

        <div class="poder-card-actions" style="margin-top: 10px;">
            <button type="button" class="poder-details-button" onclick="abrirModalPod(this.closest('.poder-card').dataset.index)">Configurar</button>
            <button type="button" class="poder-duplicate-button" onclick="duplicarPoder(this.closest('.poder-card').dataset.index)" title="Duplicar poder" aria-label="Duplicar poder">⧉</button>
            <button type="button" id="btn_usar_poder_${safeIndex}"
                    class="btn-use-skill${isAtivo ? ' buff-ativo' : ''}"
                    onclick="toggleBuffPoder(this.closest('.poder-card').dataset.index)"
                    style="${isPassiva ? 'display:none' : ''}">
                ${isAtivo ? 'Ativo' : 'Usar'}
            </button>
        </div>

        <div class="item-hidden-data" hidden>
            <input type="hidden" id="poder_tipo_${safeIndex}" class="save-input" value="${_escapePoderAttr(tipo)}">
            <textarea id="poder_desc_${safeIndex}" class="save-input">${_escapePoderHTML(desc)}</textarea>
            <input type="hidden" id="poder_duracao_${safeIndex}" class="save-input" value="${_escapePoderAttr(duracao)}">
            <input type="hidden" id="poder_alcance_${safeIndex}" class="save-input" value="${_escapePoderAttr(alcance)}">
            <input type="hidden" id="poder_acao_${safeIndex}" class="save-input" value="${_escapePoderAttr(acao)}">
            <input type="hidden" id="poder_pv_bonus_${safeIndex}" class="save-input" value="${_escapePoderAttr(pv_bonus)}">
            <input type="hidden" id="poder_pm_bonus_${safeIndex}" class="save-input" value="${_escapePoderAttr(pm_bonus)}">
            <input type="hidden" id="poder_mods_${safeIndex}" class="save-input" value="${_escapePoderAttr(mods)}">
            <input type="hidden" id="poder_buff_ativo_${safeIndex}" class="save-input" value="${hasLegacyBuff ? 'legado' : (buffAtivo || 'false')}">
            <input type="hidden" id="poder_modo_${safeIndex}" class="save-input" value="${_escapePoderAttr(modoAtivoPas)}">
        </div>
    `;
    container.appendChild(row);
    if (idIndex === null && typeof savePoderesOrder === 'function') savePoderesOrder();
    if (idIndex === null) { atualizarTudo(); filtrarPoderes(); }
}

function toggleDescPoder(btn) {
    const card = btn.closest('.poder-card');
    if (!card) return;
    const isExpanded = card.classList.toggle('is-expanded');
    btn.innerHTML = isExpanded ? 'Ocultar detalhes' : 'Mostrar detalhes';
}

function duplicarPoder(index) {
    const fields = ['nome', 'tipo', 'custo', 'tipo_custo', 'desc', 'duracao', 'alcance', 'acao', 'classe', 'pv_bonus', 'pm_bonus', 'mods'];
    const vals = fields.map(f => document.getElementById(`poder_${f}_${index}`)?.value || "");
    const modo = document.getElementById(`poder_modo_${index}`)?.value || 'Ativa';
    adicionarPoderUI(vals[0] + " (Cópia)", vals[1], vals[2], vals[3], vals[4], null, vals[5], vals[6], vals[7], vals[8], vals[9], vals[10], vals[11], 'false', modo);
}

function removerPoder(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.endsWith(`_${index}`) && k.startsWith('poder_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    if (typeof savePoderesOrder === 'function') savePoderesOrder();
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
        row.style.display = match ? 'flex' : 'none';
        if (match) contador++;
    });
    const countEl = document.getElementById('poderes-counter');
    const summaryEl = document.getElementById('poderes-summary-count');
    if (countEl) countEl.innerText = `${contador} ${contador === 1 ? 'poder visível' : 'poderes visíveis'}`;
    if (summaryEl) summaryEl.textContent = contador;
}

function limparPoderes() {
    showConfirm("Apagar todos os poderes?", () => {
        document.getElementById('poderes-container').innerHTML = '';
        localStorage.removeItem(STORAGE_KEY_PODERES_ORDER);
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
    const search = document.getElementById('search-poder');
    const filter = document.getElementById('filter-poder-tipo');
    if (search) search.value = '';
    if (filter) filter.value = 'todos';
    filtrarPoderes();
    if (typeof showNotification === 'function') showNotification('Filtros de poderes limpos.', 'info', 2000);
}
