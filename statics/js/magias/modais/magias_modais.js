/**
 * Modais do Grimório de Magias.
 */
let magSendoEditadaIdx = null;
let _magBuffEditIdx = null;

function abrirModalMag(index) {
    magSendoEditadaIdx = index;
    const vals = {
        nome: document.getElementById(`mag_nome_${index}`)?.value || '',
        tipo: document.getElementById(`mag_tipo_${index}`)?.value || 'Comum',
        nivel: document.getElementById(`mag_nivel_${index}`)?.value || '1',
        custo: document.getElementById(`mag_custo_${index}`)?.value || '',
        tipoCusto: document.getElementById(`mag_tipo_custo_${index}`)?.value || 'PM',
        desc: document.getElementById(`mag_desc_${index}`)?.value || '',
        duracao: document.getElementById(`mag_duracao_${index}`)?.value || '',
        alcance: document.getElementById(`mag_alcance_${index}`)?.value || '',
        acao: document.getElementById(`mag_acao_${index}`)?.value || '',
        teste: document.getElementById(`mag_teste_${index}`)?.value || ''
    };

    const titleEl = document.getElementById('modal-magia-title');
    const bodyEl = document.getElementById('modal-magia-body');
    const modalEl = document.getElementById('modal-magia');
    if (!titleEl || !bodyEl || !modalEl) return;

    modalEl.dataset.magiaIndex = index;
    titleEl.textContent = vals.nome || 'Nova magia';
    const optionsHtml = TIPOS_MAGIA
        .map(tipo => `<option value="${_escapeMagAttr(tipo)}" ${vals.tipo === tipo ? 'selected' : ''}>${_escapeMagHTML(tipo)}</option>`)
        .join('');

    bodyEl.innerHTML = `
        <div class="entity-modal-grid">
            <section class="entity-modal-panel">
                <h4 class="entity-modal-section-title">Conjuração</h4>
                <div class="entity-form-grid entity-form-grid--three">
                    <div class="input-group">
                        <label for="modal_mag_tipo">Tradição</label>
                        <select id="modal_mag_tipo" class="inv-input" onchange="atualizarNivelModalMag(this.value)">${optionsHtml}</select>
                    </div>
                    <div class="input-group">
                        <label for="mag_nivel_modal">Círculo</label>
                        <div id="modal_nivel_container">${renderizarCampoNivel(vals.tipo, vals.nivel, 'modal')}</div>
                    </div>
                    <div class="input-group">
                        <label for="modal_mag_custo">Custo</label>
                        <div class="entity-modal-cost">
                            <input type="text" id="modal_mag_custo" class="inv-input" inputmode="numeric" value="${_escapeMagAttr(vals.custo)}" placeholder="0">
                            <select id="modal_mag_tipo_custo" class="inv-input" aria-label="Recurso do custo">
                                <option value="PM" ${vals.tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                                <option value="PV" ${vals.tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                                <option value="Outro" ${vals.tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="entity-form-grid">
                    <div class="input-group"><label for="modal_mag_acao">Ação</label><input type="text" id="modal_mag_acao" class="inv-input" value="${_escapeMagAttr(vals.acao)}" placeholder="Ex: Ação padrão"></div>
                    <div class="input-group"><label for="modal_mag_teste">Teste</label><input type="text" id="modal_mag_teste" class="inv-input" value="${_escapeMagAttr(vals.teste)}" placeholder="Ex: Misticismo"></div>
                </div>
                <div class="entity-form-grid">
                    <div class="input-group"><label for="modal_mag_duracao">Duração</label><input type="text" id="modal_mag_duracao" class="inv-input" value="${_escapeMagAttr(vals.duracao)}" placeholder="Ex: Cena"></div>
                    <div class="input-group"><label for="modal_mag_alcance">Alcance</label><input type="text" id="modal_mag_alcance" class="inv-input" value="${_escapeMagAttr(vals.alcance)}" placeholder="Ex: Curto"></div>
                </div>

                <h4 class="entity-modal-section-title">Efeito persistente</h4>
                <div class="input-group">
                    <label><span>Buffs e modificadores</span><small>Aplicados ao conjurar</small></label>
                    <button type="button" class="entity-buff-launcher" onclick="abrirModalBuffsMag(document.getElementById('modal-magia').dataset.magiaIndex)">Configurar modificadores</button>
                </div>
            </section>

            <section class="entity-modal-panel">
                <h4 class="entity-modal-section-title">Descrição e efeito</h4>
                <textarea id="modal_mag_desc" class="inv-input entity-modal-description" placeholder="Descreva manifestação, efeito, condições e limitações...">${_escapeMagHTML(vals.desc)}</textarea>
            </section>
        </div>
    `;

    const footer = modalEl.querySelector('.modal-footer');
    if (footer) {
        footer.innerHTML = `
            <button type="button" class="btn-modal-secondary" onclick="fecharModalMag()">Cancelar</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesMag()">Salvar no grimório</button>
        `;
    }

    modalEl.showModal();
    atualizarCorNivel('modal');
}

function atualizarNivelModalMag(tipo) {
    const container = document.getElementById('modal_nivel_container');
    if (!container) return;
    container.innerHTML = renderizarCampoNivel(tipo, '1', 'modal');
    atualizarCorNivel('modal');
}

function fecharModalMag() {
    const modal = document.getElementById('modal-magia');
    if (modal) fecharDialogoAnimado(modal);
    magSendoEditadaIdx = null;
}

function salvarDetalhesMag() {
    if (magSendoEditadaIdx === null) return;
    const index = magSendoEditadaIdx;
    const novoTipo = document.getElementById('modal_mag_tipo')?.value || 'Comum';
    const nivelModal = document.getElementById('mag_nivel_modal');
    if (!nivelModal) return;
    const novoNivel = nivelModal.value;
    const nivelParaSalvar = novoTipo === 'Elemental' && novoNivel.endsWith('%') ? novoNivel.slice(0, -1) : novoNivel;

    const tipoInput = document.getElementById(`mag_tipo_${index}`);
    const nivelContainer = document.getElementById(`container_nivel_${index}`);
    if (!tipoInput || !nivelContainer) return;
    tipoInput.value = novoTipo;
    nivelContainer.innerHTML = renderizarCampoNivel(novoTipo, nivelParaSalvar, index);

    const campos = {
        custo: 'modal_mag_custo',
        tipo_custo: 'modal_mag_tipo_custo',
        desc: 'modal_mag_desc',
        duracao: 'modal_mag_duracao',
        alcance: 'modal_mag_alcance',
        acao: 'modal_mag_acao',
        teste: 'modal_mag_teste'
    };
    Object.entries(campos).forEach(([campo, modalId]) => {
        const destino = document.getElementById(`mag_${campo}_${index}`);
        const origem = document.getElementById(modalId);
        if (destino && origem) destino.value = origem.value;
    });

    atualizarCorNivel(index);
    const card = tipoInput.closest('.entity-card');
    if (card) card.dataset.tipo = novoTipo;
    const tipoLabel = card?.querySelector('[data-mag-tipo-label]');
    const resumoAcao = card?.querySelector('[data-mag-resumo-acao]');
    const resumoTeste = card?.querySelector('[data-mag-resumo-teste]');
    const resumoDuracao = card?.querySelector('[data-mag-resumo-duracao]');
    const resumoAlcance = card?.querySelector('[data-mag-resumo-alcance]');
    if (tipoLabel) tipoLabel.textContent = novoTipo;
    if (resumoAcao) resumoAcao.textContent = document.getElementById('modal_mag_acao').value || 'Ação não definida';
    if (resumoTeste) resumoTeste.textContent = document.getElementById('modal_mag_teste').value || 'Teste não definido';
    if (resumoDuracao) resumoDuracao.textContent = document.getElementById('modal_mag_duracao').value || 'Duração livre';
    if (resumoAlcance) resumoAlcance.textContent = document.getElementById('modal_mag_alcance').value || 'Alcance não definido';

    const descDisplay = document.getElementById(`mag_desc_display_${index}`);
    if (descDisplay) descDisplay.innerHTML = _escapeMagHTML(document.getElementById('modal_mag_desc').value) || 'Sem descrição.';

    fecharModalMag();
    atualizarTudo();
    filtrarMagias();
}

function _adicionarLinhaBuff_Mag(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    let categoria = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum' && window.OPTIONS_CATEGORIZADAS) {
        if (window.OPTIONS_CATEGORIZADAS.pericia?.some(option => option.v === attr)) categoria = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma?.some(option => option.v === attr)) categoria = 'arma';
    }

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.innerHTML = `
        <select class="inv-input pod-cat-select" aria-label="Categoria do modificador">
            <option value="ficha" ${categoria === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${categoria === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${categoria === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${categoria === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input pod-buff-attr" aria-label="Atributo modificado"></select>
        <input type="text" class="inv-input pod-buff-val" value="${_escapeMagAttr(mod)}" placeholder="Valor" aria-label="Valor do modificador">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()" aria-label="Remover modificador">×</button>
    `;
    container.appendChild(row);

    const categoriaSelect = row.querySelector('.pod-cat-select');
    const atributoSelect = row.querySelector('.pod-buff-attr');
    const popularAtributos = (valor = 'nenhum') => {
        const opcoes = window.OPTIONS_CATEGORIZADAS?.[categoriaSelect.value] || [];
        atributoSelect.innerHTML = opcoes
            .map(option => `<option value="${_escapeMagAttr(option.v)}" ${option.v === valor ? 'selected' : ''}>${_escapeMagHTML(option.t)}</option>`)
            .join('');
    };
    categoriaSelect.addEventListener('change', () => popularAtributos());
    popularAtributos(attr);
}

function abrirModalBuffsMag(index) {
    _magBuffEditIdx = index;
    let modsData = [];
    try { modsData = JSON.parse(document.getElementById(`mag_mods_${index}`)?.value || '[]'); } catch { modsData = []; }

    const modal = document.getElementById('modal-pod-buffs');
    const container = document.getElementById('pod-buffs-container');
    const title = document.getElementById('modal-pod-buffs-title');
    if (!modal || !container) return;
    if (title) title.textContent = 'Efeito persistente da magia';
    container.innerHTML = '';

    const addButton = modal.querySelector('.btn-add-class');
    const saveButton = modal.querySelector('.btn-save-modal');
    if (addButton) addButton.setAttribute('onclick', '_adicionarLinhaBuff_Mag()');
    if (saveButton) saveButton.setAttribute('onclick', 'salvarBuffsMagia()');

    if (modsData.length) modsData.forEach(mod => _adicionarLinhaBuff_Mag(mod.attr, mod.mod, mod.isAdv));
    else _adicionarLinhaBuff_Mag();
    modal.showModal();
}

function salvarBuffsMagia() {
    if (_magBuffEditIdx === null) return;
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    const modsArr = [];
    container.querySelectorAll('.material-attr-row').forEach(row => {
        const categoria = row.querySelector('.pod-cat-select')?.value || 'ficha';
        const attr = row.querySelector('.pod-buff-attr')?.value;
        const raw = row.querySelector('.pod-buff-val')?.value || '';
        if (!attr || attr === 'nenhum') return;
        modsArr.push({ attr, mod: Number.isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10), isAdv: categoria === 'vantagem' });
    });

    const hidden = document.getElementById(`mag_mods_${_magBuffEditIdx}`);
    if (hidden) hidden.value = JSON.stringify(modsArr);
    fecharDialogoAnimado(document.getElementById('modal-pod-buffs'));
    _magBuffEditIdx = null;
    atualizarTudo();
}
