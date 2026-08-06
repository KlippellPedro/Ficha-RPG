/**
 * Lógica de controle de Modais das Habilidades
 */

let habSendoEditadaIdx = null;
let currentHabModEditIdx = null;

function abrirModalHab(index) {
    habSendoEditadaIdx = index;
    const nome = document.getElementById(`hab_nome_${index}`).value;
    const tipo = document.getElementById(`hab_tipo_${index}`)?.value || "Ativa";
    const classe = document.getElementById(`hab_classe_${index}`).value;
    const custo = document.getElementById(`hab_custo_${index}`)?.value || "";
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`)?.value || "PM";
    const desc = document.getElementById(`hab_desc_${index}`)?.value || "";
    const duracao = document.getElementById(`hab_duracao_${index}`)?.value || "";
    const alcance = document.getElementById(`hab_alcance_${index}`)?.value || "";
    const acao = document.getElementById(`hab_acao_${index}`)?.value || "";

    const titleEl = document.getElementById('modal-hab-title');
    const body = document.getElementById('modal-hab-body');
    const modal = document.getElementById('modal-hab');

    if (!titleEl || !body || !modal) return;

    modal.dataset.habilidadeIndex = index;
    titleEl.innerText = nome || "Nova habilidade";
    body.innerHTML = `
        <div class="entity-modal-grid">
            <section class="entity-modal-panel">
                <h4 class="entity-modal-section-title">Configuração</h4>
                <div class="entity-form-grid">
                    <div class="input-group">
                        <label for="modal_hab_classe">Origem</label>
                        <select id="modal_hab_classe" class="inv-input">
                            ${typeof getOpcoesClassesHab === 'function' ? getOpcoesClassesHab(classe) : ''}
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="modal_hab_tipo">Tipo de efeito</label>
                        <select id="modal_hab_tipo" class="inv-input">
                            <option value="Ativa" ${tipo === 'Ativa' ? 'selected' : ''}>Ativa</option>
                            <option value="Passiva" ${tipo === 'Passiva' ? 'selected' : ''}>Passiva</option>
                            <option value="Reação" ${tipo === 'Reação' ? 'selected' : ''}>Reação</option>
                            <option value="Outro" ${tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                        </select>
                    </div>
                </div>
                <div class="entity-form-grid">
                    <div class="input-group">
                        <label for="modal_hab_custo">Custo</label>
                        <div class="entity-modal-cost">
                            <input type="text" id="modal_hab_custo" class="inv-input" inputmode="numeric" value="${_escapeHabAttr(custo)}" placeholder="0">
                            <select id="modal_hab_tipo_custo" class="inv-input" aria-label="Recurso do custo">
                                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="modal_hab_acao">Ação</label>
                        <input type="text" id="modal_hab_acao" class="inv-input" value="${_escapeHabAttr(acao)}" placeholder="Ex: Ação padrão">
                    </div>
                </div>
                <div class="entity-form-grid">
                    <div class="input-group">
                        <label for="modal_hab_duracao">Duração</label>
                        <input type="text" id="modal_hab_duracao" class="inv-input" value="${_escapeHabAttr(duracao)}" placeholder="Ex: 1 rodada">
                    </div>
                    <div class="input-group">
                        <label for="modal_hab_alcance">Alcance</label>
                        <input type="text" id="modal_hab_alcance" class="inv-input" value="${_escapeHabAttr(alcance)}" placeholder="Ex: Pessoal">
                    </div>
                </div>

                <h4 class="entity-modal-section-title">Efeitos na ficha</h4>
                <div class="input-group" id="hab-buff-btn-container">
                    <label>
                        <span>Buffs e modificadores</span>
                        <small>${tipo === 'Passiva' ? 'Sempre aplicados' : 'Aplicados ao usar'}</small>
                    </label>
                    <button type="button" class="entity-buff-launcher" onclick="abrirModalBuffsHab(document.getElementById('modal-hab').dataset.habilidadeIndex)">Configurar modificadores</button>
                </div>
            </section>

            <section class="entity-modal-panel">
                <h4 class="entity-modal-section-title">Descrição e efeito</h4>
                <textarea id="modal_hab_desc" class="inv-input entity-modal-description" placeholder="Descreva efeito, condições, limites e aparência...">${_escapeHabHTML(desc)}</textarea>
            </section>
        </div>
    `;

    const footer = modal ? modal.querySelector('.modal-footer') : null;
    if (footer) {
        footer.innerHTML = `
            <button type="button" class="btn-modal-secondary" onclick="fecharModalHab()">Cancelar</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesHab()">Salvar alterações</button>
        `;
    }
    modal.showModal();
}

function fecharModalHab() {
    fecharDialogoAnimado(document.getElementById('modal-hab'));
    habSendoEditadaIdx = null;
}

function salvarDetalhesHab() {
    if (habSendoEditadaIdx === null) return;
    const idx = habSendoEditadaIdx;
    document.getElementById(`hab_classe_${idx}`).value = document.getElementById('modal_hab_classe').value;
    if (document.getElementById(`hab_tipo_${idx}`)) {
        const novoTipo = document.getElementById('modal_hab_tipo').value;
        document.getElementById(`hab_tipo_${idx}`).value = novoTipo;
        const row = document.getElementById(`hab_tipo_${idx}`)?.closest('.item-row');
        if (row) row.dataset.tipo = novoTipo;

        // Atualiza visibilidade do botão Usar baseado no novo tipo
        const btnUsar = document.getElementById(`btn_usar_hab_${idx}`);
        if (btnUsar) btnUsar.hidden = novoTipo === 'Passiva';

        const card = document.getElementById(`hab_tipo_${idx}`)?.closest('.entity-card');
        const tipoLabel = card?.querySelector('[data-hab-tipo-label]');
        const buffLabel = card?.querySelector('[data-hab-buff-label]');
        if (tipoLabel) tipoLabel.textContent = novoTipo;
        if (buffLabel && novoTipo === 'Passiva') buffLabel.textContent = 'Sempre ativa';

        // Se mudou para Passiva, desativa buff ativo automaticamente
        if (novoTipo === 'Passiva') {
            const buffInput = document.getElementById(`hab_buff_ativo_${idx}`);
            if (buffInput && buffInput.value === 'true') {
                buffInput.value = 'false';
                if (typeof _syncBotaoHab === 'function') _syncBotaoHab(idx);
                let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
                dados[`hab_buff_ativo_${idx}`] = 'false';
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            }
        }
    }
    document.getElementById(`hab_custo_${idx}`).value = document.getElementById('modal_hab_custo').value;
    document.getElementById(`hab_tipo_custo_${idx}`).value = document.getElementById('modal_hab_tipo_custo').value;
    document.getElementById(`hab_desc_${idx}`).value = document.getElementById('modal_hab_desc').value;
    document.getElementById(`hab_duracao_${idx}`).value = document.getElementById('modal_hab_duracao').value;
    document.getElementById(`hab_alcance_${idx}`).value = document.getElementById('modal_hab_alcance').value;
    document.getElementById(`hab_acao_${idx}`).value = document.getElementById('modal_hab_acao').value;

    const card = document.getElementById(`hab_tipo_${idx}`)?.closest('.entity-card');
    const resumoAcao = card?.querySelector('[data-hab-resumo-acao]');
    const resumoDuracao = card?.querySelector('[data-hab-resumo-duracao]');
    const resumoAlcance = card?.querySelector('[data-hab-resumo-alcance]');
    const descDisplay = document.getElementById(`hab_desc_display_${habSendoEditadaIdx}`);

    if (resumoAcao) resumoAcao.textContent = document.getElementById('modal_hab_acao').value || 'Ação não definida';
    if (resumoDuracao) resumoDuracao.textContent = document.getElementById('modal_hab_duracao').value || 'Duração livre';
    if (resumoAlcance) resumoAlcance.textContent = document.getElementById('modal_hab_alcance').value || 'Alcance não definido';
    if (descDisplay) descDisplay.innerHTML = _escapeHabHTML(document.getElementById('modal_hab_desc').value) || 'Sem descrição.';

    fecharModalHab();
    atualizarTudo();
    if (typeof filtrarHabilidades === 'function') filtrarHabilidades();
}

function abrirModalBuffsHab(index) {
    currentHabModEditIdx = index;
    let modsData = [];
    try { modsData = JSON.parse(document.getElementById(`hab_mods_${index}`).value || "[]"); } catch (e) { modsData = []; }

    const modal = document.getElementById('modal-pod-buffs');
    const container = document.getElementById('pod-buffs-container');
    if (!modal || !container) return;

    container.innerHTML = '';
    if (modsData.length > 0) {
        modsData.forEach(m => adicionarLinhaBuffHab(m.attr, m.mod, m.isAdv));
    } else {
        adicionarLinhaBuffHab();
    }

    const title = document.getElementById('modal-pod-buffs-title');
    if (title) title.innerText = "Buffs / Modificadores da Habilidade";
    const btnSalvar = modal.querySelector('.btn-save-modal');
    if (btnSalvar) btnSalvar.setAttribute('onclick', 'salvarBuffsHab()');
    const btnAdd = modal.querySelector('.btn-add-class');
    if (btnAdd) btnAdd.setAttribute('onclick', 'adicionarLinhaBuffHab()');
    modal.showModal();
}

function fecharModalBuffHab() {
    fecharDialogoAnimado(document.getElementById('modal-pod-buffs'));
    currentHabModEditIdx = null;
}

function adicionarLinhaBuffHab(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;
    const optionsCat = window.OPTIONS_CATEGORIZADAS || {};
    let categoria = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (optionsCat.pericia?.some(option => option.v === attr)) categoria = 'pericia';
        else if (optionsCat.arma?.some(option => option.v === attr)) categoria = 'arma';
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
        <input type="text" class="inv-input pod-buff-val" value="${_escapeHabAttr(mod)}" placeholder="Valor" aria-label="Valor do modificador">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()" aria-label="Remover modificador">×</button>
    `;

    container.appendChild(row);

    const selectCat = row.querySelector('.pod-cat-select');
    const selectAttr = row.querySelector('.pod-buff-attr');

    const atualizarSub = (val = 'nenhum') => {
        const cat = selectCat.value;
        const opcoes = optionsCat[cat] || [];
        selectAttr.innerHTML = opcoes.map(opt => `<option value="${opt.v}" ${opt.v === val ? 'selected' : ''}>${opt.t}</option>`).join('');
    };

    selectCat.addEventListener('change', () => atualizarSub());
    atualizarSub(attr);
}

function salvarBuffsHab() {
    if (currentHabModEditIdx === null) return;
    const rows = document.querySelectorAll('#pod-buffs-container .material-attr-row');
    const modsArr = [];
    rows.forEach(row => {
        const cat = row.querySelector('.pod-cat-select').value;
        const attr = row.querySelector('.pod-buff-attr').value;
        const modRaw = row.querySelector('.pod-buff-val').value;
        if (attr !== 'nenhum') modsArr.push({ attr, mod: isNaN(parseInt(modRaw)) ? modRaw : parseInt(modRaw), isAdv: cat === 'vantagem' });
    });
    document.getElementById(`hab_mods_${currentHabModEditIdx}`).value = JSON.stringify(modsArr);
    fecharModalBuffHab();
    atualizarTudo();
}
