/**
 * Modais de detalhes do item (descrição/combate, materiais, modificações, raridade).
 *
 * Mesma UX e profundidade de recursos da versão antiga (que operava direto em
 * elementos DOM com id inv_xxx_<index>), só que agora lendo/escrevendo nos
 * campos do item do array `inventoryState` (ver inventario_render.js).
 */

let _itemEditandoId = null;
let _materialEditandoTipo = null;

function getNomeRaridade(valor) {
    const opt = OPTIONS_RARIDADE.find(o => o.v === valor);
    return opt ? opt.t : valor;
}

function _detectCatTipoDano(val) {
    if (!val) return 'comum';
    if (OPTIONS_TIPO_DANO_CATEGORIZADO.comum.some(o => o.v === val)) return 'comum';
    if (OPTIONS_TIPO_DANO_CATEGORIZADO.elemental.some(o => o.v === val)) return 'elemental';
    if (OPTIONS_TIPO_DANO_CATEGORIZADO.outros.some(o => o.v === val)) return 'outros';
    return 'comum';
}

window.atualizarSelectTipoDano = function (cat, currentVal) {
    const select = document.getElementById('modal_item_tipo_dano');
    if (!select) return;
    const opts = OPTIONS_TIPO_DANO_CATEGORIZADO[cat] || [];
    const prevVal = currentVal !== undefined ? currentVal : select.value;
    const hasMatch = opts.some(o => o.v === prevVal);
    select.innerHTML = opts.map(o =>
        `<option value="${o.v}" ${o.v === (hasMatch ? prevVal : opts[0]?.v) ? 'selected' : ''}>${o.t}</option>`
    ).join('');
};

/**
 * Modal principal de detalhes (peso, quantidade, durabilidade, dados de
 * combate/defesa e atalhos para materiais/modificações/raridade).
 */
function abrirModalItem(id) {
    const item = getItemInventario(id);
    const modal = document.getElementById('modal-desc');
    const bodyContent = document.getElementById('modal-body-content');
    if (!item || !modal || !bodyContent) return;
    _itemEditandoId = id;
    modal.dataset.itemId = id;

    const cdBonus = _calcularCdBonus(item);
    document.getElementById('modal-title').innerText = `Detalhes: ${item.nome}`;

    let weaponArmorHtml = '';
    if (item.tipo === 'armas') {
        const catDano = _detectCatTipoDano(item.tipoDano);
        const optsIniciais = OPTIONS_TIPO_DANO_CATEGORIZADO[catDano] || [];

        weaponArmorHtml = `
            <div class="section-divider">Dados de Combate</div>
            <div class="item-details-combat-grid">
                <div class="input-group"><label for="modal_item_dano">Dano</label>
                    <input type="text" id="modal_item_dano" class="inv-input" value="${_escapeAttr(item.dano)}" placeholder="Ex: 1d8+2">
                </div>
                <div class="input-group"><label for="modal_item_critico">Crítico</label>
                    <input type="text" id="modal_item_critico" class="inv-input" value="${_escapeAttr(item.critico)}" placeholder="Ex: 19/x2">
                </div>
                <div class="input-group">
                    <label for="modal_cat_dano">Tipo de Dano</label>
                    <div class="item-details-damage-type">
                        <select id="modal_cat_dano" class="inv-input"
                                onchange="atualizarSelectTipoDano(this.value, '')">
                            <option value="comum"    ${catDano === 'comum' ? 'selected' : ''}>Comum</option>
                            <option value="elemental" ${catDano === 'elemental' ? 'selected' : ''}>Elemental</option>
                            <option value="outros"   ${catDano === 'outros' ? 'selected' : ''}>Outro</option>
                        </select>
                        <select id="modal_item_tipo_dano" class="inv-input">
                            ${optsIniciais.map(o => `<option value="${o.v}" ${item.tipoDano === o.v ? 'selected' : ''}>${o.t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="input-group"><label for="modal_item_alcance">Alcance</label>
                    <select id="modal_item_alcance" class="inv-input">
                        ${OPTIONS_ALCANCE.map(opt => `<option value="${opt.v}" ${item.alcance === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    } else if (item.tipo === 'armaduras') {
        weaponArmorHtml = `
            <div class="section-divider">Dados de Defesa</div>
            <div class="item-details-combat-grid">
                <div class="input-group"><label for="modal_item_defesa">Bônus Defesa</label><input type="number" id="modal_item_defesa" class="inv-input" value="${item.defesaBonus}"></div>
                <div class="input-group"><label for="modal_item_penalidade">Penalidade</label><input type="number" id="modal_item_penalidade" class="inv-input" value="${item.defesaPenalidade}"></div>
            </div>
        `;
    }

    const modsLabel = `${item.mods.length} ${item.mods.length === 1 ? 'modificação' : 'modificações'}`;
    const centroLabel = item.materialCabo.nome || 'Não definido';
    const baseLabel = item.materialBase.nome || 'Não definida';

    bodyContent.innerHTML = `
      <div class="item-details-layout">
        <div class="item-details-quick-grid">
            <div class="input-group">
                <label for="modal_item_peso">Peso Unitário (kg)</label>
                <input type="number" id="modal_item_peso" class="inv-input" value="${item.peso}" min="0" step="0.1">
            </div>
            <div class="input-group">
                <label for="modal_item_qtd">Quantidade</label>
                <input type="number" id="modal_item_qtd" class="inv-input" value="${item.quantidade}" min="1">
            </div>
            <div class="input-group">
                <label for="modal_item_cd_atual">CD Atual</label>
                <input type="number" id="modal_item_cd_atual" class="inv-input" value="${Math.max(0, item.cdAtual)}" min="0">
            </div>
            <div class="input-group">
                <label for="modal_item_cd_max">CD Máxima (base ${item.cdMax}${cdBonus > 0 ? ' +' + cdBonus + ' bônus' : ''})</label>
                <input type="number" id="modal_item_cd_max" class="inv-input" value="${item.cdMax + cdBonus}" min="1">
            </div>
        </div>

        <div class="item-details-columns">
          <section class="item-details-panel">
            <div class="section-divider">Qualidade e Propriedades</div>
            <div class="item-details-action-grid">
                <button type="button" id="modal_raridade_display" class="btn-material-edit item-details-button rarity-${item.raridade}"
                    onclick="abrirModalRaridade(document.getElementById('modal-desc').dataset.itemId)">
                    <span>${_escapeHTML(getNomeRaridade(item.raridade))}</span>
                    <small>Alterar raridade</small>
                </button>
                <button type="button" class="btn-material-edit item-details-button" onclick="abrirModalModificacoes(document.getElementById('modal-desc').dataset.itemId)">
                    <span>Modificações</span>
                    <small>${modsLabel}</small>
                </button>
            </div>

            <div class="section-divider">Materiais de Composição</div>
            <div class="item-details-materials">
                <button type="button" class="btn-material-edit item-details-button" onclick="abrirModalMaterial(document.getElementById('modal-desc').dataset.itemId, 'cabo')">
                    <span>Centro</span>
                    <small>${_escapeHTML(centroLabel)}</small>
                </button>
                <button type="button" class="btn-material-edit item-details-button" onclick="abrirModalMaterial(document.getElementById('modal-desc').dataset.itemId, 'base')">
                    <span>Base</span>
                    <small>${_escapeHTML(baseLabel)}</small>
                </button>
            </div>
          </section>

          <section class="item-details-panel item-details-description ${weaponArmorHtml ? 'has-combat' : ''}">
            ${weaponArmorHtml}
            <div class="section-divider">Descrição do Item</div>
            <div class="input-group">
                <textarea id="modal_item_desc" class="inv-input" placeholder="Aparência, história, efeitos e observações...">${_escapeHTML(item.descricao)}</textarea>
            </div>
          </section>
        </div>
      </div>
    `;

    if (!modal.open) modal.showModal();
}
window.abrirModalItem = abrirModalItem;

function fecharModalDescricao() {
    fecharDialogoAnimado(document.getElementById('modal-desc'));
    _itemEditandoId = null;
}
window.fecharModalDescricao = fecharModalDescricao;

function _capturarDetalhesItemAberto() {
    const item = getItemInventario(_itemEditandoId);
    const pesoInput = document.getElementById('modal_item_peso');
    if (!item || !pesoInput) return item;

    const cdMaxTotal = parseInt(document.getElementById('modal_item_cd_max').value) || 10;
    const cdBonus = _calcularCdBonus(item);

    item.peso = parseFloat(pesoInput.value) || 0;
    item.quantidade = Math.max(1, parseInt(document.getElementById('modal_item_qtd').value) || 1);
    item.descricao = document.getElementById('modal_item_desc').value;
    item.cdAtual = Math.max(0, parseInt(document.getElementById('modal_item_cd_atual').value) || 0);
    item.cdMax = Math.max(1, cdMaxTotal - cdBonus);

    const danoInput = document.getElementById('modal_item_dano');
    if (danoInput) item.dano = danoInput.value;
    const critInput = document.getElementById('modal_item_critico');
    if (critInput) item.critico = critInput.value;
    const tdInput = document.getElementById('modal_item_tipo_dano');
    if (tdInput) item.tipoDano = tdInput.value;
    const alcInput = document.getElementById('modal_item_alcance');
    if (alcInput) item.alcance = alcInput.value;
    const defInput = document.getElementById('modal_item_defesa');
    if (defInput) item.defesaBonus = parseInt(defInput.value) || 0;
    const penInput = document.getElementById('modal_item_penalidade');
    if (penInput) item.defesaPenalidade = parseInt(penInput.value) || 0;

    persistirInventario(inventoryState);
    return item;
}

function salvarDetalhesItem() {
    const item = _capturarDetalhesItemAberto();
    if (!item) return;

    fecharModalDescricao();
    sincronizarAtaqueDoItem(item);
    renderizarInventario();
    atualizarTudo();
}
window.salvarDetalhesItem = salvarDetalhesItem;

/**
 * Modal de Modificações (encantamentos/melhorias livres)
 */
function abrirModalModificacoes(id) {
    _capturarDetalhesItemAberto();
    const item = getItemInventario(id);
    const modal = document.getElementById('modal-item-mods');
    const container = document.getElementById('modal-mods-container');
    if (!item || !modal || !container) return;
    _itemEditandoId = id;

    container.innerHTML = '';
    if (item.mods.length > 0) {
        item.mods.forEach(a => adicionarLinhaModificacao(a.attr, a.mod, a.isAdv));
    } else {
        adicionarLinhaModificacao();
    }

    modal.showModal();
}
window.abrirModalModificacoes = abrirModalModificacoes;

function fecharModalModificacoes() {
    fecharDialogoAnimado(document.getElementById('modal-item-mods'));
}
window.fecharModalModificacoes = fecharModalModificacoes;

function adicionarLinhaModificacao(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('modal-mods-container');
    if (!container) return;

    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
        else if (window.OPTIONS_CATEGORIZADAS.item?.some(o => o.v === attr)) cat = 'item';
    }

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = `
        <select class="inv-input mod-cat-select" style="flex:1.1;">
            <option value="ficha"    ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia"  ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma"     ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="item"     ${cat === 'item' ? 'selected' : ''}>Item</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input mod-attr-select" style="flex:1.6;"></select>
        <input type="text" class="inv-input mod-val-input" style="flex:0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const selectCat = row.querySelector('.mod-cat-select');
    const selectAttr = row.querySelector('.mod-attr-select');
    const update = (val = 'nenhum') => {
        const opts = window.OPTIONS_CATEGORIZADAS[selectCat.value] || [];
        selectAttr.innerHTML = opts.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    selectCat.onchange = () => update();
    update(attr);
}
window.adicionarLinhaModificacao = adicionarLinhaModificacao;

function salvarDetalhesModificacoes() {
    const item = getItemInventario(_itemEditandoId);
    if (!item) return;

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

    item.mods = attributes;
    persistirInventario(inventoryState);
    fecharModalModificacoes();
    abrirModalItem(item.id); // Reabre detalhes para refletir mudanças (ex: CD)
    sincronizarAtaqueDoItem(item);
    renderizarInventario();
    atualizarTudo();
}
window.salvarDetalhesModificacoes = salvarDetalhesModificacoes;

/**
 * Modal de Raridade e bônus mágicos
 */
function abrirModalRaridade(id) {
    _capturarDetalhesItemAberto();
    const item = getItemInventario(id);
    const modal = document.getElementById('modal-item-rarity');
    const container = document.getElementById('modal-rarity-buffs-container');
    const rarityLevel = document.getElementById('modal_rarity_level');
    if (!item || !modal || !container || !rarityLevel) return;
    _itemEditandoId = id;

    rarityLevel.value = item.raridade;
    rarityLevel.className = 'inv-input rarity-' + item.raridade;

    container.innerHTML = '';
    item.raridadeBonus.forEach(a => adicionarLinhaBuffRaridade(a.attr, a.mod, a.isAdv));

    modal.showModal();
}
window.abrirModalRaridade = abrirModalRaridade;

function fecharModalRaridade() {
    fecharDialogoAnimado(document.getElementById('modal-item-rarity'));
}
window.fecharModalRaridade = fecharModalRaridade;

function adicionarLinhaBuffRaridade(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('modal-rarity-buffs-container');
    if (!container) return;

    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
        else if (window.OPTIONS_CATEGORIZADAS.item?.some(o => o.v === attr)) cat = 'item';
    }

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = `
        <select class="inv-input rarity-cat-select" style="flex:1.1;">
            <option value="ficha"    ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia"  ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma"     ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="item"     ${cat === 'item' ? 'selected' : ''}>Item</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input rarity-buff-attr" style="flex:1.6;"></select>
        <input type="text" class="inv-input rarity-buff-val" style="flex:0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const selectCat = row.querySelector('.rarity-cat-select');
    const selectAttr = row.querySelector('.rarity-buff-attr');
    const update = (val = 'nenhum') => {
        const opts = window.OPTIONS_CATEGORIZADAS[selectCat.value] || [];
        selectAttr.innerHTML = opts.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    selectCat.onchange = () => update();
    update(attr);
}
window.adicionarLinhaBuffRaridade = adicionarLinhaBuffRaridade;

function salvarDetalhesRaridade() {
    const item = getItemInventario(_itemEditandoId);
    if (!item) return;

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

    item.raridade = level;
    item.raridadeBonus = buffs;

    persistirInventario(inventoryState);
    fecharModalRaridade();
    abrirModalItem(item.id);
    renderizarInventario();
    atualizarTudo();
}
window.salvarDetalhesRaridade = salvarDetalhesRaridade;

/**
 * Modal de Materiais (Centro e Base) — picker em cascata categoria → subcategoria
 * → material, backed pelo banco de dados em materiais.js.
 */
function abrirModalMaterial(id, tipo) {
    _capturarDetalhesItemAberto();
    const item = getItemInventario(id);
    const modal = document.getElementById('modal-material-details');
    const container = document.getElementById('material-attributes-container');
    const nomeInput = document.getElementById('modal_material_nome');
    if (!item || !modal || !container || !nomeInput) return;
    _itemEditandoId = id;
    _materialEditandoTipo = tipo;

    const matData = tipo === 'cabo' ? item.materialCabo : item.materialBase;

    let selectorsWrapper = document.getElementById('modal_material_selectors_wrapper');
    let selectCategory = document.getElementById('modal_material_category_selector'), selectSubcategory, selectMat;
    let descContainer = document.getElementById('modal_material_desc_info');

    if (!selectorsWrapper) {
        selectorsWrapper = document.createElement('div');
        selectorsWrapper.id = 'modal_material_selectors_wrapper';
        selectorsWrapper.style = "display: flex; gap: 8px; margin-bottom: 12px; align-items: center;";
        nomeInput.parentNode.insertBefore(selectorsWrapper, nomeInput);

        const createSel = (idSel, flex) => {
            const s = document.createElement('select');
            s.id = idSel; s.className = 'inv-input'; s.style.flex = flex;
            selectorsWrapper.appendChild(s);
            return s;
        };

        selectCategory = createSel('modal_material_category_selector', '1');
        selectSubcategory = createSel('modal_material_subcategory_selector', '1');
        selectMat = createSel('modal_material_selector', '1.2');

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

    selectCategory.onchange = updateSubcategorySelect;
    selectSubcategory.onchange = updateMaterialSelect;
    selectMat.onchange = handleMaterialSelection;

    const btnAplicar = document.getElementById('btn_aplicar_bonus_material');
    if (btnAplicar) {
        btnAplicar.onclick = () => {
            const matInfo = buscarMaterial(selectMat.value);
            if (!matInfo) return;

            const catItem = item.tipo;
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

    selectCategory.innerHTML = `
        <option value="">-- Categoria --</option>
        <option value="geologicos">Geológicos</option>
        <option value="naturais">Naturais</option>
        <option value="animais">Animais</option>
    `;

    let initialCategory = '';
    let initialSubcategory = '';
    if (matData.nome) {
        const matInfo = getMaterialCategoryInfo(matData.nome);
        if (matInfo) {
            initialCategory = matInfo.category;
            initialSubcategory = matInfo.subcategory;
        } else if (!getListaTodosMateriais().includes(matData.nome)) {
            selectCategory.value = '';
            selectSubcategory.value = '';
            selectMat.value = 'outro';
            nomeInput.style.display = 'block';
            nomeInput.value = matData.nome;
        }
    }

    selectCategory.value = initialCategory;
    updateSubcategorySelect(initialSubcategory || "");

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
        if (typeof preselectedSub === 'string') selectSubcategory.value = preselectedSub;
        updateMaterialSelect();
    }

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
        handleMaterialSelection();
    }

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

    nomeInput.value = matData.nome || "";
    nomeInput.style.display = (selectMat.value === 'outro') ? 'block' : 'none';
    handleMaterialSelection();

    document.getElementById('modal-material-title').innerText = tipo === 'cabo' ? 'Detalhes do Centro (Cabo)' : 'Detalhes da Base (Lâmina/Corpo)';

    container.innerHTML = '';
    matData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod, a.isAdv));

    modal.showModal();
}
window.abrirModalMaterial = abrirModalMaterial;

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
window.aplicarBuffsPredefinidos = aplicarBuffsPredefinidos;

function fecharModalMaterial() {
    fecharDialogoAnimado(document.getElementById('modal-material-details'));
}
window.fecharModalMaterial = fecharModalMaterial;

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
window.adicionarAtributoMaterial = adicionarAtributoMaterial;

function salvarDetalhesMaterial() {
    const item = getItemInventario(_itemEditandoId);
    const tipo = _materialEditandoTipo;
    if (!item || !tipo) return;

    const nome = document.getElementById('modal_material_nome').value;
    const rows = document.querySelectorAll('#material-attributes-container > div');
    const attributes = [];
    rows.forEach(row => {
        const cat = row.querySelector('.mat-cat-select').value;
        const attr = row.querySelector('.mat-attr-select').value;
        const mod = row.querySelector('.mat-val-input').value;
        if (attr !== 'nenhum') attributes.push({ attr, mod: isNaN(parseInt(mod)) ? mod : parseInt(mod), isAdv: cat === 'vantagem' });
    });

    const materialObj = { nome, attributes };
    if (tipo === 'cabo') item.materialCabo = materialObj;
    else item.materialBase = materialObj;

    persistirInventario(inventoryState);
    fecharModalMaterial();
    abrirModalItem(item.id);
    sincronizarAtaqueDoItem(item);
    renderizarInventario();
    atualizarTudo();
}
window.salvarDetalhesMaterial = salvarDetalhesMaterial;

/**
 * Sincronização com a página de Ataques — porta 1:1 a lógica antiga de
 * verificarTipoItem (inventario_ui.js), trocando a fonte de dados de
 * elementos DOM (inv_*_<index>) para os campos do item do array.
 */
function sincronizarAtaqueDoItem(item) {
    if (item.tipo !== 'armas' || !item.nome.trim()) return;

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    if (!item.equipado) {
        removerAtaqueDoItem(item.id, dados);
        return;
    }

    // Bônus intrínsecos acumulados (dano, crítico, alcance, tipo de dano) das partes do item
    let b = { dano: 0, critico: 0, alcance: 0, tipo_dano: "" };
    [item.materialCabo?.attributes, item.materialBase?.attributes, item.mods, item.raridadeBonus].forEach(lista => {
        (lista || []).forEach(a => {
            if (b.hasOwnProperty(a.attr)) b[a.attr] += parseInt(a.mod) || 0;
            if (a.attr === 'tipo_dano' && a.mod) b.tipo_dano = a.mod;
        });
    });

    const formatBonus = (val, bonus) => (bonus !== 0 && val) ? `${val}${bonus > 0 ? '+' : ''}${bonus}` : val;

    const originKey = Object.keys(dados).find(k => k.startsWith('atk_origin_') && dados[k] == item.id);
    let atkId;
    if (originKey) {
        atkId = originKey.replace('atk_origin_', '');
    } else {
        atkId = `${Date.now()}_${item.id}`;
        dados[`atk_origin_${atkId}`] = item.id;
    }

    const mapping = {
        "simples_uma_mao": "Corpo-a-Corpo", "simples_duas_maos": "Corpo-a-Corpo",
        "marcial_uma_mao": "Corpo-a-Corpo", "marcial_duas_maos": "Corpo-a-Corpo",
        "arco_curto": "À Distância", "arco_longo": "À Distância",
        "besta_leve": "À Distância", "besta_pesada": "À Distância", "arremesso": "Arremesso"
    };

    dados[`atk_nome_${atkId}`] = item.nome;
    dados[`atk_tipo_${atkId}`] = item.atkTipo || mapping[item.subtipoArma] || "Outro";
    dados[`atk_teste_${atkId}`] = item.teste || (item.attrMod !== "nenhum" ? item.attrMod : "");
    dados[`atk_dano_${atkId}`] = formatBonus(item.dano, b.dano);
    dados[`atk_tipo_dano_${atkId}`] = b.tipo_dano || item.tipoDano;
    dados[`atk_critico_${atkId}`] = formatBonus(item.critico, b.critico);
    dados[`atk_alcance_${atkId}`] = formatBonus(item.alcance, b.alcance);
    dados[`atk_desc_${atkId}`] = item.descricao;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}
window.sincronizarAtaqueDoItem = sincronizarAtaqueDoItem;

/** Remove o ataque sincronizado de um item (ao desequipar ou excluir o item) */
function removerAtaqueDoItem(itemId, dadosExistentes = null) {
    let dados = dadosExistentes || JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const originKey = Object.keys(dados).find(k => k.startsWith('atk_origin_') && dados[k] == itemId);
    if (originKey) {
        const atkId = originKey.replace('atk_origin_', '');
        Object.keys(dados).forEach(k => {
            if (k.includes('atk_') && k.endsWith(`_${atkId}`)) delete dados[k];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
}
window.removerAtaqueDoItem = removerAtaqueDoItem;
