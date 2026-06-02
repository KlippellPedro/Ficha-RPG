/**
 * Orquestrador do Inventário
 * Centraliza as constantes e inicialização.
 * A lógica detalhada foi movida para inventario_ui.js, inventario_modais.js e inventario_carga.js.
 */

// Variável global para rastrear qual item está sendo editado nos modais suspensos
// Usamos var ou verificamos existência para evitar erro de redeclaração (SyntaxError)
if (typeof itemSendoEditadoIdx === 'undefined') {
    window.itemSendoEditadoIdx = null;
}
if (typeof materialSendoEditadoTipo === 'undefined') {
    window.materialSendoEditadoTipo = null;
}

/**
 * Helper para obter o nome amigável da raridade a partir do seu valor
 */
function getNomeRaridade(valor) {
    // OPTIONS_RARIDADE está definido em inventario_data.js
    const opt = OPTIONS_RARIDADE.find(o => o.v === valor);
    return opt ? opt.t : valor;
}

/**
 * Abre o modal de informações detalhadas do item (Lupa 🔍)
 */
function abrirModalItem(index) {
    itemSendoEditadoIdx = index;
    const modal = document.getElementById('modal-desc');
    const bodyContent = document.getElementById('modal-body-content');
    if (!modal || !bodyContent) return;

    // Coleta dados dos inputs ocultos da linha
    const nome = document.getElementById(`inv_nome_${index}`)?.value || "Item";
    const peso = document.getElementById(`inv_peso_${index}`)?.value || 0;
    const qtd = document.getElementById(`inv_qtd_${index}`)?.value || 1;
    const desc = document.getElementById(`inv_desc_${index}`)?.value || "";
    const raroRaw = document.getElementById(`inv_raro_${index}`)?.value || "{}";
    const categoria = document.getElementById(`inv_cat_${index}`)?.value || "outros";
    const cdAtual = document.getElementById(`inv_cd_atual_${index}`)?.value || 10;
    const cdMax = parseInt(document.getElementById(`inv_cd_max_${index}`)?.value) || 10;

    // Calcula bônus de CD_MAX para exibição
    let cdBonus = 0;
    const sources = [`inv_cabo_${index}`, `inv_base_${index}`, `inv_mods_item_${index}`, `inv_raro_${index}`];
    sources.forEach(s => {
        const val = document.getElementById(s)?.value;
        if (val && val.startsWith('{')) {
            try {
                const parsed = JSON.parse(val);
                (parsed.attributes || []).forEach(a => { if (a.attr === 'cd_max') cdBonus += parseInt(a.mod) || 0; });
            } catch (e) { }
        }
    });

    let raroData = { raridade: 'comum' };
    try {
        raroData = raroRaw.startsWith('{') ? JSON.parse(raroRaw) : { raridade: raroRaw };
    } catch (e) { raroData = { raridade: 'comum' }; }

    const currentRar = raroData.raridade || 'comum';

    document.getElementById('modal-title').innerText = `Detalhes: ${nome}`;

    // Gera campos específicos para Armas ou Armaduras
    let weaponArmorHtml = '';
    if (categoria === 'armas') {
        const dano = document.getElementById(`inv_dano_${index}`)?.value || "";
        const crit = document.getElementById(`inv_critico_${index}`)?.value || "";
        const tipoDano = document.getElementById(`inv_tipo_dano_${index}`)?.value || "";
        const alcance = document.getElementById(`inv_alcance_${index}`)?.value || "";
        weaponArmorHtml = `
            <div class="section-divider">Dados de Combate (Arma)</div>
            <div class="grid-2-cols" style="margin-bottom: 10px;">
                <div class="input-group"><label>Dano</label><input type="text" id="modal_item_dano" class="inv-input" value="${dano}" placeholder="Ex: 1d8+2"></div>
                <div class="input-group"><label>Crítico</label><input type="text" id="modal_item_critico" class="inv-input" value="${crit}" placeholder="Ex: 19/x2"></div>
            </div>
            <div class="grid-2-cols" style="margin-bottom: 15px;">
                <div class="input-group"><label>Tipo de Dano</label>
                    <select id="modal_item_tipo_dano" class="inv-input">
                        <optgroup label="Comuns">
                            ${OPTIONS_TIPO_DANO_CATEGORIZADO.comum.map(opt => `<option value="${opt.v}" ${tipoDano === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Elementais">
                            ${OPTIONS_TIPO_DANO_CATEGORIZADO.elemental.map(opt => `<option value="${opt.v}" ${tipoDano === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Outros">
                            ${OPTIONS_TIPO_DANO_CATEGORIZADO.outros.map(opt => `<option value="${opt.v}" ${tipoDano === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                        </optgroup>
                    </select>
                </div>
                <div class="input-group"><label>Alcance</label>
                    <select id="modal_item_alcance" class="inv-input">
                        ${OPTIONS_ALCANCE.map(opt => `<option value="${opt.v}" ${alcance === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    } else if (categoria === 'armaduras') {
        const def = document.getElementById(`inv_defesa_bonus_${index}`)?.value || 0;
        const pen = document.getElementById(`inv_defesa_penalidade_${index}`)?.value || 0;
        weaponArmorHtml = `
            <div class="section-divider">Dados de Defesa (Armadura)</div>
            <div class="grid-2-cols" style="margin-bottom: 15px;">
                <div class="input-group"><label>Bônus Defesa</label><input type="number" id="modal_item_defesa" class="inv-input" value="${def}"></div>
                <div class="input-group"><label>Penalidade</label><input type="number" id="modal_item_penalidade" class="inv-input" value="${pen}"></div>
            </div>
        `;
    }

    bodyContent.innerHTML = `
        <div class="grid-2-cols" style="margin-bottom: 15px;">
            <div class="input-group">
                <label>Peso Unitário (kg)</label>
                <input type="number" id="modal_item_peso" class="inv-input" value="${peso}" step="0.1">
            </div>
            <div class="input-group">
                <label>Quantidade</label>
                <input type="number" id="modal_item_qtd" class="inv-input" value="${qtd}">
            </div>
        </div>

        <div class="section-divider">Durabilidade (CD)</div>
        <div class="grid-2-cols" style="margin-bottom: 15px;">
            <div class="input-group">
                <label>CD Atual</label>
                <input type="number" id="modal_item_cd_atual" class="inv-input" value="${cdAtual}">
            </div>
            <div class="input-group">
                <label>CD Máxima</label>
                <input type="number" id="modal_item_cd_max" class="inv-input" value="${cdMax + cdBonus}">
            </div>
        </div>

        <div class="section-divider">Qualidade e Propriedades</div>
        <div class="grid-2-cols" style="align-items: end; gap: 10px; margin-bottom: 20px;">
            <div class="input-group">
                <label>Raridade</label>
                <button type="button" id="modal_raridade_display" class="btn-material-edit rarity-${currentRar}" 
                    style="height: 38px; text-transform: uppercase; font-weight: bold;" 
                    onclick="abrirModalRaridade('${index}')">
                    ${getNomeRaridade(currentRar)}
                </button>
            </div>
            <button type="button" class="btn-material-edit" style="height: 38px;" onclick="abrirModalModificacoes('${index}')">
                ⚙ Modificações
            </button>
        </div>

        <div class="section-divider">Materiais de Composição</div>
        <div class="grid-2-cols" style="gap: 10px; margin-bottom: 20px;">
            <button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'cabo')">⚙ Definir Centro</button>
            <button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'base')">⚙ Definir Base</button>
        </div>

        ${weaponArmorHtml}

        <div class="input-group">
            <label>Descrição do Item</label>
            <textarea id="modal_item_desc" class="inv-input" style="min-height: 120px;">${desc}</textarea>
        </div>
    `;

    modal.style.display = 'flex';
}

function fecharModalDescricao() {
    const modal = document.getElementById('modal-desc');
    if (modal) modal.style.display = 'none';
    itemSendoEditadoIdx = null;
}

/**
 * Lógica para o modal de Modificações (Simples/Marciais)
 */
function abrirModalModificacoes(index) {
    itemSendoEditadoIdx = index;
    const modal = document.getElementById('modal-item-mods');
    const container = document.getElementById('modal-mods-container');
    if (!modal || !container) return;

    const modsRaw = document.getElementById(`inv_mods_item_${index}`)?.value || "{}";
    let modsData = { attributes: [] };
    try {
        modsData = modsRaw.startsWith('{') ? JSON.parse(modsRaw) : { attributes: [] };
    } catch (e) { console.error("Erro ao ler modificações:", e); }

    container.innerHTML = '';
    if (modsData.attributes && modsData.attributes.length > 0) {
        modsData.attributes.forEach(a => adicionarLinhaModificacao(a.attr, a.mod, a.isAdv));
    } else {
        adicionarLinhaModificacao(); // Adiciona uma linha vazia por padrão
    }

    modal.style.display = 'flex';
}

function fecharModalModificacoes() {
    const modal = document.getElementById('modal-item-mods');
    if (modal) modal.style.display = 'none';
}

function adicionarLinhaModificacao(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('modal-mods-container');
    if (!container) return;

    // Determinar a categoria correta baseada no atributo para carregar o select certo
    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
    }

    const row = document.createElement('div');
    row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
    row.innerHTML = `
        <select class="inv-input mod-cat-select" style="flex: 1;">
            <option value="ficha" ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input mod-attr-select" style="flex: 1.5;"></select>
        <input type="text" class="inv-input mod-val-input" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const selectCat = row.querySelector('.mod-cat-select');
    const selectAttr = row.querySelector('.mod-attr-select');
    const update = (val = "nenhum") => {
        const options = window.OPTIONS_CATEGORIZADAS[selectCat.value] || [];
        selectAttr.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    selectCat.onchange = () => update();
    update(attr);
}

function salvarDetalhesModificacoes() {
    const idx = itemSendoEditadoIdx;
    if (idx === null) return;

    const rows = document.querySelectorAll('#modal-mods-container > div');
    const attributes = [];

    rows.forEach(row => {
        const cat = row.querySelector('.mod-cat-select').value;
        const attr = row.querySelector('.mod-attr-select').value;
        const modRaw = row.querySelector('.mod-val-input').value;
        if (attr !== 'nenhum') {
            attributes.push({ attr, mod: isNaN(parseInt(modRaw)) ? modRaw : parseInt(modRaw), isAdv: cat === 'vantagem' });
        }
    });

    document.getElementById(`inv_mods_item_${idx}`).value = JSON.stringify({ attributes });
    fecharModalModificacoes();

    // Atualiza o modal de detalhes para refletir as novas modificações (como CD)
    abrirModalItem(idx);

    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx);
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

function salvarDetalhesItem() {
    if (itemSendoEditadoIdx === null) return;
    const idx = itemSendoEditadoIdx;

    const peso = document.getElementById('modal_item_peso').value;
    const qtd = document.getElementById('modal_item_qtd').value;
    const desc = document.getElementById('modal_item_desc').value;
    const cdAtual = document.getElementById('modal_item_cd_atual').value;
    const cdMaxTotal = parseInt(document.getElementById('modal_item_cd_max').value) || 10;

    // Calcula o bônus atual para subtrair e salvar apenas o valor base
    let cdBonus = 0;
    const sources = [`inv_cabo_${idx}`, `inv_base_${idx}`, `inv_mods_item_${idx}`, `inv_raro_${idx}`];
    sources.forEach(s => {
        const val = document.getElementById(s)?.value;
        if (val && val.startsWith('{')) {
            try {
                const parsed = JSON.parse(val);
                (parsed.attributes || []).forEach(a => { if (a.attr === 'cd_max') cdBonus += parseInt(a.mod) || 0; });
            } catch (e) { }
        }
    });
    const baseCdMax = cdMaxTotal - cdBonus;

    // Salva de volta nos inputs ocultos da linha
    document.getElementById(`inv_peso_${idx}`).value = peso;
    document.getElementById(`inv_qtd_${idx}`).value = qtd;
    document.getElementById(`inv_desc_${idx}`).value = desc;
    document.getElementById(`inv_cd_atual_${idx}`).value = cdAtual;
    document.getElementById(`inv_cd_max_${idx}`).value = baseCdMax;

    // Salva campos de combate/defesa se eles estiverem presentes no modal
    const danoInput = document.getElementById('modal_item_dano');
    if (danoInput) document.getElementById(`inv_dano_${idx}`).value = danoInput.value;
    const critInput = document.getElementById('modal_item_critico');
    if (critInput) document.getElementById(`inv_critico_${idx}`).value = critInput.value;
    const tdInput = document.getElementById('modal_item_tipo_dano');
    if (tdInput) document.getElementById(`inv_tipo_dano_${idx}`).value = tdInput.value;
    const alcInput = document.getElementById('modal_item_alcance');
    if (alcInput) document.getElementById(`inv_alcance_${idx}`).value = alcInput.value;

    const defInput = document.getElementById('modal_item_defesa');
    if (defInput) document.getElementById(`inv_defesa_bonus_${idx}`).value = defInput.value;
    const penInput = document.getElementById('modal_item_penalidade');
    if (penInput) document.getElementById(`inv_defesa_penalidade_${idx}`).value = penInput.value;

    fecharModalDescricao();
    if (typeof atualizarEstiloRaridade === 'function') atualizarEstiloRaridade(idx);
    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx); // Sincroniza com Ataques
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

/**
 * Lógica para o novo modal de Raridade
 */
function abrirModalRaridade(index) {
    const modal = document.getElementById('modal-item-rarity');
    const container = document.getElementById('modal-rarity-buffs-container');
    const rarityLevel = document.getElementById('modal_rarity_level');
    if (!modal || !container || !rarityLevel) return;

    const raroRaw = document.getElementById(`inv_raro_${index}`)?.value || "{}";
    let raroData = { raridade: 'comum', attributes: [] };
    try {
        raroData = raroRaw.startsWith('{') ? JSON.parse(raroRaw) : { raridade: raroRaw, attributes: [] };
    } catch (e) { }

    rarityLevel.value = raroData.raridade || 'comum';
    rarityLevel.className = 'inv-input rarity-' + rarityLevel.value;

    container.innerHTML = '';
    if (raroData.attributes && raroData.attributes.length > 0) {
        raroData.attributes.forEach(a => adicionarLinhaBuffRaridade(a.attr, a.mod, a.isAdv));
    }

    modal.style.display = 'flex';
}

function fecharModalRaridade() {
    const modal = document.getElementById('modal-item-rarity');
    if (modal) modal.style.display = 'none';
}

function adicionarLinhaBuffRaridade(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('modal-rarity-buffs-container');
    if (!container) return;

    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
    }

    const row = document.createElement('div');
    row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
    row.innerHTML = `
        <select class="inv-input rarity-cat-select" style="flex: 1;">
            <option value="ficha" ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input rarity-buff-attr" style="flex: 1.5;"></select>
        <input type="text" class="inv-input rarity-buff-val" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const selectCat = row.querySelector('.rarity-cat-select');
    const selectAttr = row.querySelector('.rarity-buff-attr');
    const update = (val = "nenhum") => {
        const options = window.OPTIONS_CATEGORIZADAS[selectCat.value] || [];
        selectAttr.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    selectCat.onchange = () => update();
    update(attr);
}

function salvarDetalhesRaridade() {
    const idx = itemSendoEditadoIdx;
    if (idx === null) return;

    const level = document.getElementById('modal_rarity_level').value;
    const rows = document.querySelectorAll('#modal-rarity-buffs-container > div');
    const buffs = [];

    rows.forEach(row => {
        const cat = row.querySelector('.rarity-cat-select').value;
        const attr = row.querySelector('.rarity-buff-attr').value;
        const modRaw = row.querySelector('.rarity-buff-val').value;
        if (attr !== 'nenhum') {
            buffs.push({ attr, mod: isNaN(parseInt(modRaw)) ? modRaw : parseInt(modRaw), isAdv: cat === 'vantagem' });
        }
    });

    const data = { raridade: level, attributes: buffs };
    document.getElementById(`inv_raro_${idx}`).value = JSON.stringify(data);

    const displayBtn = document.getElementById('modal_raridade_display');
    if (displayBtn) {
        displayBtn.innerText = `${getNomeRaridade(level)}`;
        displayBtn.className = `btn-material-edit rarity-${level}`;
    }

    fecharModalRaridade();

    // Atualiza o modal de detalhes para refletir a nova raridade
    abrirModalItem(idx);

    if (typeof atualizarEstiloRaridade === 'function') atualizarEstiloRaridade(idx);
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

/**
 * Lógica para o modal de Materiais (Centro e Base)
 */
function abrirModalMaterial(index, tipo) {
    itemSendoEditadoIdx = index;
    materialSendoEditadoTipo = tipo;
    const modal = document.getElementById('modal-material-details');
    const container = document.getElementById('material-attributes-container');
    const nomeInput = document.getElementById('modal_material_nome');
    if (!modal || !container || !nomeInput) return;

    const fieldId = tipo === 'cabo' ? `inv_cabo_${index}` : `inv_base_${index}`;
    const matRaw = document.getElementById(fieldId)?.value || "{}";
    let matData = { nome: "", attributes: [] };
    try {
        matData = matRaw.startsWith('{') ? JSON.parse(matRaw) : { nome: matRaw, attributes: [] };
    } catch (e) { }

    // Elementos do modal
    let selectorsWrapper = document.getElementById('modal_material_selectors_wrapper');
    let selectCategory = document.getElementById('modal_material_category_selector'), selectSubcategory, selectMat;
    let descContainer = document.getElementById('modal_material_desc_info');

    // Cria o wrapper flexível e os selects se não existirem
    if (!selectorsWrapper) {
        selectorsWrapper = document.createElement('div');
        selectorsWrapper.id = 'modal_material_selectors_wrapper';
        selectorsWrapper.style = "display: flex; gap: 8px; margin-bottom: 12px; align-items: center;";
        nomeInput.parentNode.insertBefore(selectorsWrapper, nomeInput);

        const createSel = (id, flex) => {
            const s = document.createElement('select');
            s.id = id; s.className = 'inv-input'; s.style.flex = flex;
            selectorsWrapper.appendChild(s);
            return s;
        };

        selectCategory = createSel('modal_material_category_selector', '1');
        selectSubcategory = createSel('modal_material_subcategory_selector', '1');
        selectMat = createSel('modal_material_selector', '1.2');

        // Botão para aplicar bônus padrão manualmente
        const btnAplicar = document.createElement('button');
        btnAplicar.id = 'btn_aplicar_bonus_material';
        btnAplicar.type = 'button';
        btnAplicar.className = 'btn-qty';
        btnAplicar.title = "Aplicar bônus padrão deste material";
        btnAplicar.innerHTML = '⚡';
        btnAplicar.style.display = 'none';
        selectorsWrapper.appendChild(btnAplicar);

        descContainer = document.createElement('div');
        descContainer.id = 'modal_material_desc_info';
        descContainer.style = "font-size: 0.8rem; color: #888; font-style: italic; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; display: none;";
        nomeInput.parentNode.insertBefore(descContainer, nomeInput.nextSibling);
    } else {
        selectSubcategory = document.getElementById('modal_material_subcategory_selector');
        selectMat = document.getElementById('modal_material_selector');
    }

    // Reatribui os listeners toda vez que o modal abre para garantir que usem o contexto (matData) do item atual
    selectCategory.onchange = updateSubcategorySelect;
    selectSubcategory.onchange = updateMaterialSelect;
    selectMat.onchange = handleMaterialSelection;

    // Atualiza o comportamento do botão para o item atual toda vez que o modal abre
    const btnAplicar = document.getElementById('btn_aplicar_bonus_material');
    if (btnAplicar) {
        btnAplicar.onclick = () => {
            const matInfo = buscarMaterial(selectMat.value);
            if (!matInfo) return;

            const catEl = document.getElementById(`inv_cat_${index}`);
            // Garante que a categoria seja lida corretamente mesmo que o select mude
            const catItem = (catEl ? catEl.value : "outros").toLowerCase().trim();

            let attrs = [];
            if (matInfo.attributes && Array.isArray(matInfo.attributes)) {
                attrs = matInfo.attributes;
            } else if (matInfo.attributes && typeof matInfo.attributes === 'object') {
                if (catItem === 'armas' || catItem === 'ataques') {
                    attrs = matInfo.attributes['armas'] || [];
                } else if (catItem === 'itens' || catItem === 'item_magico') {
                    attrs = matInfo.attributes['itens'] || [];
                } else {
                    attrs = matInfo.attributes['geral'] || [];
                }
            }
            if (attrs.length > 0) aplicarBuffsPredefinidos(attrs);
        };
    }

    // Popula o select de categoria
    selectCategory.innerHTML = `
        <option value="">-- Categoria --</option>
        <option value="geologicos">Geológicos</option>
        <option value="naturais">Naturais</option>
        <option value="animais">Animais</option>
    `;

    // Tenta pré-selecionar categoria e subcategoria se o material já estiver definido
    let initialCategory = '';
    let initialSubcategory = '';
    if (matData.nome) {
        const matInfo = getMaterialCategoryInfo(matData.nome);
        if (matInfo) {
            initialCategory = matInfo.category;
            initialSubcategory = matInfo.subcategory;
        } else if (!getListaTodosMateriais().includes(matData.nome)) {
            // Se o material não está no banco de dados, assume que é "Outro"
            selectCategory.value = ''; // Nenhuma categoria selecionada
            selectSubcategory.value = ''; // Nenhuma subcategoria selecionada
            selectMat.value = 'outro'; // Seleciona "Outro" no material
            nomeInput.style.display = 'block';
            nomeInput.value = matData.nome;
        }
    }

    selectCategory.value = initialCategory;
    updateSubcategorySelect(initialSubcategory || ""); // Atualiza subcategoria e materiais

    // Função para atualizar o select de subcategoria
    function updateSubcategorySelect(preselectedSub = '') {
        const selectedCategory = selectCategory.value;
        selectSubcategory.innerHTML = `<option value="">-- Tipo --</option>`;
        if (selectedCategory) {
            selectSubcategory.style.display = 'block';
            selectSubcategory.innerHTML += `
                <option value="comum">Comum</option>
                <option value="marcial">Marcial</option>
            `;
        } else {
            selectSubcategory.style.display = 'none';
        }
        // Só aplica o valor se for uma string (chamada inicial), evita sobrescrever com o objeto de Evento no onchange
        if (typeof preselectedSub === 'string') selectSubcategory.value = preselectedSub;
        updateMaterialSelect();
    }

    // Função para atualizar o select de materiais
    function updateMaterialSelect() {
        const selectedCategory = selectCategory.value, selectedSubcategory = selectSubcategory.value;
        selectMat.innerHTML = `<option value="">-- Material --</option>`;

        if (selectedCategory && selectedSubcategory) {
            selectMat.style.display = 'block';
            const materials = getMaterialsByCategoryAndSubcategory(selectedCategory, selectedSubcategory);
            selectMat.innerHTML += materials.map(m => `<option value="${m.nome}" ${matData.nome === m.nome ? 'selected' : ''}>${m.nome}</option>`).join('');
            selectMat.innerHTML += `<option value="outro" ${matData.nome && !getListaTodosMateriais().includes(matData.nome) ? 'selected' : ''}>Outro...</option>`;
            selectMat.value = matData.nome || (matData.nome && !getListaTodosMateriais().includes(matData.nome) ? 'outro' : "");
        } else {
            selectMat.style.display = 'none';
            selectMat.value = "";
        }
        handleMaterialSelection(); // Garante que o estado do nomeInput e descContainer seja atualizado
    }

    // Função para lidar com a seleção final do material
    function handleMaterialSelection() {
        const matVal = selectMat.value;
        const btn = document.getElementById('btn_aplicar_bonus_material');

        if (matVal === 'outro') {
            nomeInput.style.display = 'block';
            if (descContainer) descContainer.style.display = 'none';
            if (btn) btn.style.display = 'none';
            nomeInput.focus();
        } else {
            nomeInput.style.display = 'none';
            nomeInput.value = matVal;
            const matInfo = buscarMaterial(matVal);

            if (btn) btn.style.display = matInfo ? 'flex' : 'none';

            if (matInfo) {
                if (matInfo.desc && descContainer) {
                    descContainer.innerText = matInfo.desc;
                    descContainer.style.display = 'block';
                } else if (descContainer) {
                    descContainer.style.display = 'none';
                }
            } else if (descContainer) {
                descContainer.style.display = 'none';
            }
        }
    }

    // Define o valor inicial do nomeInput e sua visibilidade
    nomeInput.value = matData.nome || "";
    nomeInput.style.display = (selectMat.value === 'outro') ? 'block' : 'none';

    // Estado inicial da descrição ao abrir
    handleMaterialSelection(); // Chama para garantir que a descrição e o nomeInput estejam corretos no carregamento

    document.getElementById('modal-material-title').innerText = tipo === 'cabo' ? 'Detalhes do Centro (Cabo)' : 'Detalhes da Base (Lâmina/Corpo)';

    container.innerHTML = '';
    if (matData.attributes) {
        matData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod, a.isAdv));
    }

    modal.style.display = 'flex';
}

/**
 * Aplica automaticamente os buffs de um material predefinido após confirmação
 */
function aplicarBuffsPredefinidos(attributes) {
    const container = document.getElementById('material-attributes-container');
    if (!container) return;

    showConfirm("Este material possui bônus padrão. Deseja aplicá-los agora? Isso substituirá os bônus atuais desta parte.", () => {
        container.innerHTML = '';
        attributes.forEach(a => {
            adicionarAtributoMaterial(a.attr, a.mod, a.isAdv || false);
        });
    });
}

function fecharModalMaterial() {
    const modal = document.getElementById('modal-material-details');
    if (modal) modal.style.display = 'none';
}

function adicionarAtributoMaterial(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('material-attributes-container');

    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
    }

    const row = document.createElement('div');
    row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
    row.innerHTML = `
        <select class="inv-input mat-cat-select" style="flex: 1;">
            <option value="ficha" ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input mat-attr-select" style="flex: 1.5;"></select>
        <input type="text" class="inv-input mat-val-input" style="flex: 0.8;" value="${mod}">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
    const selectCat = row.querySelector('.mat-cat-select'), sel = row.querySelector('.mat-attr-select');
    const up = (v = "nenhum") => {
        sel.innerHTML = (window.OPTIONS_CATEGORIZADAS[selectCat.value] || []).map(o => `<option value="${o.v}" ${o.v === v ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    selectCat.onchange = () => up();
    up(attr);
}

function salvarDetalhesMaterial() {
    const idx = itemSendoEditadoIdx, tipo = materialSendoEditadoTipo;
    if (idx === null || !tipo) return;

    const nome = document.getElementById('modal_material_nome').value;
    const rows = document.querySelectorAll('#material-attributes-container > div');
    const attributes = [];
    rows.forEach(row => {
        const cat = row.querySelector('.mat-cat-select').value;
        const attr = row.querySelector('.mat-attr-select').value;
        const mod = row.querySelector('.mat-val-input').value;
        if (attr !== 'nenhum') attributes.push({ attr, mod: isNaN(parseInt(mod)) ? mod : parseInt(mod), isAdv: cat === 'vantagem' });
    });

    const fieldId = tipo === 'cabo' ? `inv_cabo_${idx}` : `inv_base_${idx}`;
    document.getElementById(fieldId).value = JSON.stringify({ nome, attributes });

    fecharModalMaterial();

    // Atualiza o modal de detalhes para refletir o novo material (como CD do Ouro)
    abrirModalItem(idx);

    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx);
    if (typeof atualizarEstiloRaridade === 'function') atualizarEstiloRaridade(idx);
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

// Drag and Drop functionality for inventory items
let draggedItem = null;

document.addEventListener('DOMContentLoaded', () => {
    // Mapeia os containers e suas chaves de salvamento correspondentes
    const containers = [
        { id: 'items-container', key: typeof STORAGE_KEY_INVENTORY_ORDER !== 'undefined' ? STORAGE_KEY_INVENTORY_ORDER : 'inventory_order' },
        { id: 'habilidades-container', key: 'habilidades_order' },
        { id: 'poderes-container', key: 'poderes_order' },
        { id: 'magias-container', key: 'magias_order' },
        { id: 'ataques-container', key: typeof STORAGE_KEY_ATAQUES_ORDER !== 'undefined' ? STORAGE_KEY_ATAQUES_ORDER : 'ataques_order' }
    ];

    containers.forEach(cfg => {
        const container = document.getElementById(cfg.id);
        if (!container) return;

        // Garante que a seleção de texto funcione desativando o drag ao clicar em inputs
        container.addEventListener('mousedown', (e) => {
            const row = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (!row) return;
            if (e.target.closest('input, textarea, select, button, [contenteditable="true"]')) {
                row.draggable = false;
            } else {
                row.draggable = true;
            }
        });

        container.addEventListener('dragstart', (e) => {
            // Bloqueia o arrasto se o clique originar em campos de texto, botões ou seletores
            if (e.target.closest('input, textarea, select, button, [contenteditable="true"]')) {
                e.preventDefault();
                return;
            }
            draggedItem = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (draggedItem) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedItem.dataset.index);
                setTimeout(() => draggedItem.classList.add('dragging'), 0);
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault(); // Permite o drop e remove o ícone de bloqueado
            const target = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (target && target !== draggedItem) {
                container.querySelectorAll('.draggable, [draggable="true"]').forEach(row =>
                    row.classList.remove('drag-insert-top', 'drag-insert-bottom')
                );

                const rect = target.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                target.classList.add(isAfter ? 'drag-insert-bottom' : 'drag-insert-top');
            }
        });

        container.addEventListener('dragleave', (e) => {
            const target = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (target) target.classList.remove('drag-insert-top', 'drag-insert-bottom');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropTarget = e.target.closest('.draggable') || e.target.closest('[draggable="true"]');
            if (draggedItem && dropTarget && dropTarget !== draggedItem) {
                const rect = dropTarget.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                if (isAfter) dropTarget.after(draggedItem);
                else dropTarget.before(draggedItem);
                
                saveInventoryOrder(cfg.id, cfg.key);
            }
            container.querySelectorAll('.draggable, [draggable="true"]').forEach(row =>
                row.classList.remove('drag-insert-top', 'drag-insert-bottom', 'dragging')
            );
        });

        // Tenta carregar a ordem salva para este container específico se ele existir
        loadInventoryOrder(cfg.id, cfg.key);
    });
});

// Evento global de finalização do arraste para limpar classes de estilo
document.addEventListener('dragend', () => {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
    document.querySelectorAll('.drag-insert-top, .drag-insert-bottom').forEach(el => 
        el.classList.remove('drag-insert-top', 'drag-insert-bottom')
    );
});

// New functions for saving and loading inventory order
function saveInventoryOrder(containerId = 'items-container', storageKey = 'inventory_order') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const order = Array.from(container.children)
        .filter(child => child.dataset && child.dataset.index)
        .map(row => row.dataset.index);
    localStorage.setItem(storageKey, JSON.stringify(order));
}

function loadInventoryOrder(containerId = 'items-container', storageKey = 'inventory_order') {
    const savedOrder = JSON.parse(localStorage.getItem(storageKey));
    if (savedOrder && savedOrder.length > 0) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = new Map();
        Array.from(container.children).forEach(row => {
            if (row.dataset && row.dataset.index) {
                items.set(row.dataset.index, row);
            }
        });

        // Create a document fragment to minimize reflows
        const fragment = document.createDocumentFragment();
        savedOrder.forEach(id => {
            const item = items.get(id);
            if (item) {
                fragment.appendChild(item);
            }
        });
        container.appendChild(fragment); // Append the reordered fragment
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // Identifica chaves de itens (ex: inv_nome_123)
    const itemIds = new Set();
    Object.keys(salvo).forEach(key => {
        if (key.startsWith('inv_nome_')) {
            itemIds.add(key.replace('inv_nome_', ''));
        }
    });

    if (itemIds.size > 0) {
        itemIds.forEach(id => {
            adicionarItemUI(
                salvo[`inv_nome_${id}`],
                salvo[`inv_peso_${id}`],
                salvo[`inv_qtd_${id}`],
                salvo[`inv_desc_${id}`],
                salvo[`inv_cat_${id}`] || "outros",
                salvo[`inv_raro_${id}`] || "comum",
                salvo[`inv_tipo_${id}`] || "simples_uma_mao",
                id,
                salvo[`inv_eqp_${id}`] || false,
                salvo[`inv_attr_${id}`] || "nenhum",
                salvo[`inv_mod_${id}`] || 0,
                salvo[`inv_alcance_${id}`] || "toque",
                salvo[`inv_dano_${id}`] || "", // Novo campo
                salvo[`inv_defesa_bonus_${id}`] || 0, // Novo campo
                salvo[`inv_efeito_${id}`] || "", // Novo campo
                salvo[`inv_cabo_${id}`] || "{}", // Proteção contra string vazia
                salvo[`inv_base_${id}`] || "{}", // Proteção contra string vazia
                salvo[`inv_defesa_penalidade_${id}`] || 0,
                salvo[`inv_mods_item_${id}`] || "{}",
                salvo[`inv_critico_${id}`] || "",
                salvo[`inv_tipo_dano_${id}`] || "",
                salvo[`inv_teste_${id}`] || "",
                salvo[`inv_atk_tipo_${id}`] || "Corpo-a-Corpo",
                salvo[`inv_cd_atual_${id}`] !== undefined ? salvo[`inv_cd_atual_${id}`] : 10,
                salvo[`inv_cd_max_${id}`] !== undefined ? salvo[`inv_cd_max_${id}`] : 10
            );
            atualizarEstiloBonus(id);
            atualizarEstiloRaridade(id); // Garante que a raridade visual seja aplicada no carregamento
        });

        // Load custom order, if any. If not, the items remain in their original loaded order.
        const savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY_ORDER));
        if (savedOrder && savedOrder.length > 0) {
            loadInventoryOrder();
        } else {
            ordenarItens(); // If no custom order, apply default sorting
        }
    }

    filtrarItens();
    atualizarTudo(); // Chama atualizarTudo uma única vez após carregar tudo
});