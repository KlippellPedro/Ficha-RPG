/**
 * Interface da coleção de Magias.
 * Mantém os contratos de IDs e persistência do grimório.
 */

function _escapeMagHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function _escapeMagAttr(value) {
    return _escapeMagHTML(value)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function _rotuloNivelMagia(nivel) {
    const mapa = { '1': 'Círculo I', '2': 'Círculo II', '3': 'Círculo III', '4': 'Círculo IV' };
    return mapa[String(nivel)] || (nivel ? `Nível ${nivel}` : 'Nível livre');
}

function renderizarCampoNivel(tipo, nivel, index) {
    const safeIndex = _escapeMagAttr(index);
    const safeNivel = _escapeMagAttr(nivel);
    const updateHandler = "atualizarCorNivel(this.id.replace('mag_nivel_', ''))";
    if (tipo === 'Divinas' || tipo === 'Demoniaca') {
        return `
            <select id="mag_nivel_${safeIndex}" class="save-input inv-input" onchange="${updateHandler}" aria-label="Círculo da magia">
                <option value="1" ${String(nivel) === '1' ? 'selected' : ''}>I</option>
                <option value="2" ${String(nivel) === '2' ? 'selected' : ''}>II</option>
            </select>`;
    }
    if (tipo === 'Comum') {
        return `
            <select id="mag_nivel_${safeIndex}" class="save-input inv-input" onchange="${updateHandler}" aria-label="Círculo da magia">
                <option value="1" ${String(nivel) === '1' ? 'selected' : ''}>I</option>
                <option value="2" ${String(nivel) === '2' ? 'selected' : ''}>II</option>
                <option value="3" ${String(nivel) === '3' ? 'selected' : ''}>III</option>
                <option value="4" ${String(nivel) === '4' ? 'selected' : ''}>IV</option>
            </select>`;
    }

    const placeholder = tipo === 'Elemental' ? 'Ex: 20' : 'Nível';
    const displayNivel = tipo === 'Elemental' && nivel && !String(nivel).endsWith('%') ? `${nivel}%` : nivel;
    const blurHandler = tipo === 'Elemental'
        ? "onblur=\"formatElementalNivel(this.id.replace('mag_nivel_', ''))\""
        : '';
    return `<input type="text" id="mag_nivel_${safeIndex}" class="save-input inv-input mag-nivel-extra" placeholder="${placeholder}" value="${_escapeMagAttr(displayNivel)}" ${blurHandler} aria-label="Nível da magia">`;
}

function formatElementalNivel(index) {
    const input = document.getElementById(`mag_nivel_${index}`);
    const tipo = document.getElementById(`mag_tipo_${index}`)?.value;
    if (!input || tipo !== 'Elemental') return;
    const valor = input.value.trim();
    if (valor && !valor.endsWith('%')) input.value = `${valor}%`;
    atualizarCorNivel(index);
    atualizarTudo();
}

function atualizarCorNivel(index) {
    const control = document.getElementById(`mag_nivel_${index}`);
    if (!control) return;
    const value = control.value || '';
    const levelClass = ['1', '2', '3', '4'].includes(value) ? value : 'extra';
    control.classList.remove('mag-nivel-1', 'mag-nivel-2', 'mag-nivel-3', 'mag-nivel-4', 'mag-nivel-extra');
    control.classList.add(`mag-nivel-${levelClass}`);

    const card = control.closest('.entity-card');
    const badge = card?.querySelector('[data-mag-level-label]');
    if (badge) {
        badge.dataset.level = levelClass;
        badge.textContent = _rotuloNivelMagia(value);
    }
}

function adicionarMagiaUI(nome = "", tipo = "Comum", nivel = "1", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", teste = "", mods = "[]", buffAtivo = "false") {
    const container = document.getElementById('magias-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();
    const safeIndex = _escapeMagAttr(index);
    const isAtivo = buffAtivo === 'true';
    const optionsHtml = TIPOS_MAGIA.map(item => `<option value="${_escapeMagAttr(item)}" ${tipo === item ? 'selected' : ''}>${_escapeMagHTML(item)}</option>`).join('');
    const resumoAcao = acao || 'Ação não definida';
    const resumoTeste = teste || 'Teste não definido';
    const resumoDuracao = duracao || 'Duração livre';
    const resumoAlcance = alcance || 'Alcance não definido';

    const row = document.createElement('article');
    row.className = `item-row mag-row-grid entity-card ui-card draggable${isAtivo ? ' has-active-buff' : ''}`;
    row.draggable = true;
    row.dataset.index = index;
    row.dataset.tipo = tipo;
    row.innerHTML = `
        <div class="entity-card-head">
            <span class="entity-card-grip" aria-hidden="true">⠿</span>
            <span class="entity-card-symbol" aria-hidden="true">✧</span>
            <div class="entity-card-identity">
                <input type="text" id="mag_nome_${safeIndex}" class="save-input inv-input entity-card-name" placeholder="Nome da magia" value="${_escapeMagAttr(nome)}" aria-label="Nome da magia">
                <div class="entity-card-badges">
                    <span class="entity-badge entity-badge--type" data-mag-tipo-label>${_escapeMagHTML(tipo)}</span>
                    <span class="entity-badge entity-badge--level" data-mag-level-label data-level="${['1', '2', '3', '4'].includes(String(nivel)) ? _escapeMagAttr(nivel) : 'extra'}">${_escapeMagHTML(_rotuloNivelMagia(nivel))}</span>
                    <span class="entity-badge entity-badge--state entity-badge--muted" data-mag-buff-label>${isAtivo ? 'Efeito ativo' : 'Efeito inativo'}</span>
                </div>
            </div>
            <button type="button" class="entity-card-remove" onclick="removerMagia(this)" title="Remover magia" aria-label="Remover magia">×</button>
        </div>

        <div class="entity-card-fields">
            <label class="entity-card-field">
                <span>Tradição</span>
                <select id="mag_tipo_${safeIndex}" class="save-input inv-input" onchange="alternarTipoNivel(this.closest('.entity-card').dataset.index)">
                    ${optionsHtml}
                </select>
            </label>
            <label class="entity-card-field">
                <span>Círculo</span>
                <span id="container_nivel_${safeIndex}" class="level-control">${renderizarCampoNivel(tipo, nivel, index)}</span>
            </label>
            <label class="entity-card-field entity-card-field--cost">
                <span>Custo</span>
                <span class="cost-container">
                    <input type="text" id="mag_custo_${safeIndex}" class="save-input inv-input" inputmode="numeric" placeholder="0" value="${_escapeMagAttr(custo)}">
                    <select id="mag_tipo_custo_${safeIndex}" class="save-input inv-input" aria-label="Recurso do custo">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </span>
            </label>
        </div>

        <div class="entity-card-summary">
            <span data-mag-resumo-acao>${_escapeMagHTML(resumoAcao)}</span>
            <span data-mag-resumo-teste>${_escapeMagHTML(resumoTeste)}</span>
            <span data-mag-resumo-duracao>${_escapeMagHTML(resumoDuracao)}</span>
            <span data-mag-resumo-alcance>${_escapeMagHTML(resumoAlcance)}</span>
        </div>

        <div class="entity-card-actions" style="margin-top: 10px;">
            <button type="button" class="entity-details-button" onclick="abrirModalMag(this.closest('.entity-card').dataset.index)">Configurar</button>
            <button type="button" class="entity-duplicate-button" onclick="duplicarMagia(this.closest('.entity-card').dataset.index)" title="Duplicar magia" aria-label="Duplicar magia">⧉</button>
            <button type="button" id="btn_usar_mag_${safeIndex}"
                    class="btn-use-skill${isAtivo ? ' buff-ativo' : ''}"
                    onclick="toggleBuffMagia(this.closest('.entity-card').dataset.index)">
                ${isAtivo ? 'Ativo' : 'Conjurar'}
            </button>
        </div>

        <div class="entity-card-hidden" hidden>
            <textarea id="mag_desc_${safeIndex}" class="save-input">${_escapeMagHTML(desc)}</textarea>
            <input type="hidden" id="mag_duracao_${safeIndex}" class="save-input" value="${_escapeMagAttr(duracao)}">
            <input type="hidden" id="mag_alcance_${safeIndex}" class="save-input" value="${_escapeMagAttr(alcance)}">
            <input type="hidden" id="mag_acao_${safeIndex}" class="save-input" value="${_escapeMagAttr(acao)}">
            <input type="hidden" id="mag_teste_${safeIndex}" class="save-input" value="${_escapeMagAttr(teste)}">
            <input type="hidden" id="mag_mods_${safeIndex}" class="save-input" value="${_escapeMagAttr(mods)}">
            <input type="hidden" id="mag_buff_ativo_${safeIndex}" class="save-input" value="${isAtivo ? 'true' : 'false'}">
        </div>
    `;

    container.appendChild(row);
    if (idIndex === null && typeof saveMagiasOrder === 'function') saveMagiasOrder();
    atualizarCorNivel(index);
    if (idIndex === null) {
        atualizarTudo();
        filtrarMagias();
    }
}

function alternarTipoNivel(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`)?.value || 'Comum';
    const container = document.getElementById(`container_nivel_${index}`);
    if (!container) return;
    container.innerHTML = renderizarCampoNivel(tipo, '1', index);
    const card = container.closest('.entity-card');
    if (card) card.dataset.tipo = tipo;
    const tipoLabel = card?.querySelector('[data-mag-tipo-label]');
    if (tipoLabel) tipoLabel.textContent = tipo;
    atualizarCorNivel(index);
    atualizarTudo();
    filtrarMagias();
}

function duplicarMagia(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`)?.value || 'Comum';
    let nivel = document.getElementById(`mag_nivel_${index}`)?.value || '1';
    if (tipo === 'Elemental' && nivel.endsWith('%')) nivel = nivel.slice(0, -1);
    const mods = document.getElementById(`mag_mods_${index}`)?.value || '[]';
    adicionarMagiaUI(
        `${document.getElementById(`mag_nome_${index}`)?.value || 'Magia'} (Cópia)`,
        tipo,
        nivel,
        document.getElementById(`mag_custo_${index}`)?.value || '',
        document.getElementById(`mag_tipo_custo_${index}`)?.value || 'PM',
        document.getElementById(`mag_desc_${index}`)?.value || '',
        null,
        document.getElementById(`mag_duracao_${index}`)?.value || '',
        document.getElementById(`mag_alcance_${index}`)?.value || '',
        document.getElementById(`mag_acao_${index}`)?.value || '',
        document.getElementById(`mag_teste_${index}`)?.value || '',
        mods,
        'false'
    );
}

function removerMagia(btn) {
    const row = btn?.closest('.item-row');
    if (!row) return;
    const index = row.dataset.index;
    let dados = {};
    try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { dados = {}; }
    Object.keys(dados).forEach(key => {
        if (key.startsWith('mag_') && key.endsWith(`_${index}`)) delete dados[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    if (typeof saveMagiasOrder === 'function') saveMagiasOrder();
    atualizarTudo();
    filtrarMagias();
}

function limparMagias() {
    const limpar = () => {
        const container = document.getElementById('magias-container');
        if (container) container.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY_MAGIAS_ORDER);
        let dados = {};
        try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { dados = {}; }
        Object.keys(dados).forEach(key => { if (key.startsWith('mag_')) delete dados[key]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        filtrarMagias();
        if (typeof showNotification === 'function') showNotification('O grimório foi limpo.', 'success');
    };
    if (typeof showConfirm === 'function') {
        showConfirm('Esquecer todas as magias?', limpar, null, 'Limpar grimório?');
    } else if (window.confirm('Esquecer todas as magias?')) {
        limpar();
    }
}

function resetarFiltrosMagia() {
    const search = document.getElementById('search-magia');
    const tipo = document.getElementById('filter-magia-tipo');
    const nivel = document.getElementById('filter-magia-nivel');
    if (search) search.value = '';
    if (tipo) tipo.value = 'todos';
    if (nivel) nivel.value = 'todos';
    document.querySelectorAll('.circle-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.nivel === 'todos'));
    filtrarMagias();
    if (typeof showNotification === 'function') showNotification('Filtros do grimório limpos.', 'info', 2000);
}

function filtrarMagias() {
    const termo = document.getElementById('search-magia')?.value.toLocaleLowerCase('pt-BR') || '';
    const filtroTipo = document.getElementById('filter-magia-tipo')?.value || 'todos';
    const filtroNivel = document.getElementById('filter-magia-nivel')?.value || 'todos';
    let contador = 0;

    document.querySelectorAll('#magias-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`mag_nome_${index}`)?.value.toLocaleLowerCase('pt-BR') || '';
        const tipo = document.getElementById(`mag_tipo_${index}`)?.value || '';
        const nivelInput = document.getElementById(`mag_nivel_${index}`);
        const nivel = nivelInput?.value || '';
        const tipoOk = filtroTipo === 'todos' || tipo === filtroTipo;
        const nivelOk = filtroNivel === 'todos'
            || nivel === filtroNivel
            || (filtroNivel === 'extra' && (nivelInput?.tagName === 'INPUT' || !['1', '2', '3', '4'].includes(nivel)));
        const visivel = nome.includes(termo) && tipoOk && nivelOk;
        row.style.display = visivel ? 'flex' : 'none';
        if (visivel) contador++;
    });

    const label = `${contador} ${contador === 1 ? 'magia visível' : 'magias visíveis'}`;
    const counter = document.getElementById('magias-counter');
    const summary = document.getElementById('magias-summary-count');
    if (counter) counter.textContent = label;
    if (summary) summary.textContent = contador;
}
