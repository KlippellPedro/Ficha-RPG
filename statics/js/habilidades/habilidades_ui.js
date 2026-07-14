/**
 * Interface da coleção de Habilidades.
 * Mantém os IDs e campos de persistência usados pelo motor global.
 */

function _escapeHabHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function _escapeHabAttr(value) {
    return _escapeHabHTML(value)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getOpcoesClassesHab(valorSelecionado = "") {
    let dados = {};
    try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { dados = {}; }
    const classes = typeof getClassesAtivas === 'function' ? getClassesAtivas(dados) : [];
    const option = (value, label) => `<option value="${_escapeHabAttr(value)}" ${valorSelecionado === value ? 'selected' : ''}>${_escapeHabHTML(label)}</option>`;
    let opcoes = option('Geral', 'Geral');
    opcoes += option('Raça', 'Raça');
    opcoes += option('Ancião', 'Ancião');
    opcoes += option('Outro', 'Outro');

    classes.forEach(c => {
        const nomeFormatado = String(c.name || '')
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        const valor = c.sub ? `${c.name}_${c.sub}` : c.name;
        const label = c.sub ? `${nomeFormatado} (${c.sub})` : nomeFormatado;
        opcoes += option(valor, label);
    });
    return opcoes;
}

function atualizarFiltroHabilidadesUI() {
    const filterSelect = document.getElementById('filter-habilidade-classe');
    if (!filterSelect) return;
    const valorAtual = filterSelect.value;
    filterSelect.innerHTML = `<option value="todos">Todas as origens</option>${getOpcoesClassesHab(valorAtual)}`;
    filterSelect.value = Array.from(filterSelect.options).some(option => option.value === valorAtual) ? valorAtual : 'todos';
}

function adicionarHabilidadeUI(nome = "", tipo = "Ativa", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", mods = "[]", buffAtivo = "false") {
    const container = document.getElementById('habilidades-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();
    const safeIndex = _escapeHabAttr(index);
    const isPassiva = tipo === 'Passiva';
    const isAtivo = buffAtivo === 'true';
    const resumoAcao = acao || 'Ação não definida';
    const resumoDuracao = duracao || 'Duração livre';
    const resumoAlcance = alcance || 'Alcance não definido';

    const row = document.createElement('article');
    row.className = `item-row hab-row-grid entity-card ui-card draggable${isAtivo ? ' has-active-buff' : ''}`;
    row.draggable = true;
    row.dataset.index = index;
    row.dataset.tipo = tipo;
    row.innerHTML = `
        <div class="entity-card-head">
            <span class="entity-card-grip" aria-hidden="true">⠿</span>
            <span class="entity-card-symbol" aria-hidden="true">✦</span>
            <div class="entity-card-identity">
                <input type="text" id="hab_nome_${safeIndex}" class="save-input inv-input entity-card-name" placeholder="Nome da habilidade" value="${_escapeHabAttr(nome)}" aria-label="Nome da habilidade">
                <div class="entity-card-badges">
                    <span class="entity-badge entity-badge--type" data-hab-tipo-label>${_escapeHabHTML(tipo)}</span>
                    <span class="entity-badge entity-badge--state entity-badge--muted" data-hab-buff-label>${isAtivo ? 'Efeito ativo' : (isPassiva ? 'Sempre ativa' : 'Efeito inativo')}</span>
                </div>
            </div>
            <button type="button" class="entity-card-remove" onclick="removerHabilidade(this)" title="Remover habilidade" aria-label="Remover habilidade">×</button>
        </div>

        <div class="entity-card-fields">
            <label class="entity-card-field">
                <span>Origem</span>
                <select id="hab_classe_${safeIndex}" class="save-input inv-input">
                    ${getOpcoesClassesHab(classe)}
                </select>
            </label>
            <label class="entity-card-field entity-card-field--cost">
                <span>Custo</span>
                <span class="cost-container">
                    <input type="text" id="hab_custo_${safeIndex}" class="save-input inv-input" inputmode="numeric" placeholder="0" value="${_escapeHabAttr(custo)}">
                    <select id="hab_tipo_custo_${safeIndex}" class="save-input inv-input" aria-label="Recurso do custo">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </span>
            </label>
        </div>

        <div class="entity-card-summary">
            <span data-hab-resumo-acao>${_escapeHabHTML(resumoAcao)}</span>
            <span data-hab-resumo-duracao>${_escapeHabHTML(resumoDuracao)}</span>
            <span data-hab-resumo-alcance>${_escapeHabHTML(resumoAlcance)}</span>
        </div>

        <div class="entity-card-actions">
            <button type="button" class="entity-details-button" onclick="abrirModalHab(this.closest('.entity-card').dataset.index)">Ver detalhes</button>
            <button type="button" class="entity-duplicate-button" onclick="duplicarHabilidade(this.closest('.entity-card').dataset.index)" title="Duplicar habilidade" aria-label="Duplicar habilidade">⧉</button>
            <button type="button" id="btn_usar_hab_${safeIndex}"
                    class="btn-use-skill${isAtivo ? ' buff-ativo' : ''}"
                    onclick="toggleBuffHabilidade(this.closest('.entity-card').dataset.index)"
                    ${isPassiva ? 'hidden' : ''}>
                ${isAtivo ? 'Ativo' : 'Usar'}
            </button>
        </div>

        <div class="entity-card-hidden" hidden>
            <textarea id="hab_desc_${safeIndex}" class="save-input">${_escapeHabHTML(desc)}</textarea>
            <input type="hidden" id="hab_tipo_${safeIndex}" class="save-input" value="${_escapeHabAttr(tipo)}">
            <input type="hidden" id="hab_duracao_${safeIndex}" class="save-input" value="${_escapeHabAttr(duracao)}">
            <input type="hidden" id="hab_alcance_${safeIndex}" class="save-input" value="${_escapeHabAttr(alcance)}">
            <input type="hidden" id="hab_acao_${safeIndex}" class="save-input" value="${_escapeHabAttr(acao)}">
            <input type="hidden" id="hab_mods_${safeIndex}" class="save-input" value="${_escapeHabAttr(mods)}">
            <input type="hidden" id="hab_buff_ativo_${safeIndex}" class="save-input" value="${isAtivo ? 'true' : 'false'}">
        </div>
    `;

    container.appendChild(row);
    if (idIndex === null) {
        atualizarTudo();
        filtrarHabilidades();
    }
}

function duplicarHabilidade(index) {
    const fields = ['nome', 'tipo', 'classe', 'custo', 'tipo_custo', 'desc', 'duracao', 'alcance', 'acao', 'mods'];
    const vals = fields.map(field => document.getElementById(`hab_${field}_${index}`)?.value || "");
    adicionarHabilidadeUI(`${vals[0]} (Cópia)`, vals[1], vals[3], vals[4], vals[5], null, vals[6], vals[7], vals[8], vals[2], vals[9], 'false');
}

function removerHabilidade(btn) {
    const row = btn?.closest('.item-row');
    if (!row) return;
    const index = row.dataset.index;
    let dados = {};
    try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { dados = {}; }
    Object.keys(dados).forEach(key => {
        if (key.endsWith(`_${index}`) && key.startsWith('hab_')) delete dados[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarHabilidades();
}

function filtrarHabilidades() {
    const termo = document.getElementById('search-habilidade')?.value.toLocaleLowerCase('pt-BR') || '';
    const tipo = document.getElementById('filter-habilidade-tipo')?.value.toLocaleLowerCase('pt-BR') || 'todos';
    const origem = document.getElementById('filter-habilidade-classe')?.value.toLocaleLowerCase('pt-BR') || 'todos';
    let contador = 0;

    document.querySelectorAll('#habilidades-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`hab_nome_${index}`)?.value.toLocaleLowerCase('pt-BR') || '';
        const classe = document.getElementById(`hab_classe_${index}`)?.value.toLocaleLowerCase('pt-BR') || '';
        const tipoItem = document.getElementById(`hab_tipo_${index}`)?.value.toLocaleLowerCase('pt-BR') || '';
        const visivel = nome.includes(termo) && (tipo === 'todos' || tipoItem === tipo) && (origem === 'todos' || classe === origem);
        row.style.display = visivel ? 'flex' : 'none';
        if (visivel) contador++;
    });

    const label = `${contador} ${contador === 1 ? 'habilidade visível' : 'habilidades visíveis'}`;
    const counter = document.getElementById('habilidades-counter');
    const summary = document.getElementById('habilidades-summary-count');
    if (counter) counter.textContent = label;
    if (summary) summary.textContent = contador;
}

function limparHabilidades() {
    const limpar = () => {
        const container = document.getElementById('habilidades-container');
        if (container) container.innerHTML = '';
        let dados = {};
        try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { dados = {}; }
        Object.keys(dados).forEach(key => { if (key.startsWith('hab_')) delete dados[key]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        filtrarHabilidades();
        if (typeof showNotification === 'function') showNotification('Todas as habilidades foram removidas.', 'success');
    };

    if (typeof showConfirm === 'function') {
        showConfirm('Apagar todas as habilidades?', limpar, null, 'Limpar habilidades?');
    } else if (window.confirm('Apagar todas as habilidades?')) {
        limpar();
    }
}

function resetarFiltrosHabilidades() {
    const search = document.getElementById('search-habilidade');
    const type = document.getElementById('filter-habilidade-tipo');
    const source = document.getElementById('filter-habilidade-classe');
    if (search) search.value = '';
    if (type) type.value = 'todos';
    if (source) source.value = 'todos';
    filtrarHabilidades();
    if (typeof showNotification === 'function') showNotification('Filtros de habilidades limpos.', 'info', 2000);
}
