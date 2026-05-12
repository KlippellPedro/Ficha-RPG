/**
 * Lógica de Modais (Item e Material)
 */
let itemSendoEditadoIdx = null;
let currentMaterialEditItemIdx = null;
let currentMaterialEditField = null;

function abrirModalItem(index) {
    itemSendoEditadoIdx = index;

    const nome = document.getElementById(`inv_nome_${index}`).value;
    const cat = document.getElementById(`inv_cat_${index}`).value;
    const desc = document.getElementById(`inv_desc_${index}`).value;
    const peso = document.getElementById(`inv_peso_${index}`).value;
    const qtd = document.getElementById(`inv_qtd_${index}`).value;
    const raroRaw = document.getElementById(`inv_raro_${index}`).value;
    const modAttr = document.getElementById(`inv_attr_${index}`).value;
    const modVal = document.getElementById(`inv_mod_${index}`).value;
    const critico = document.getElementById(`inv_critico_${index}`)?.value || "";
    const tipoDano = document.getElementById(`inv_tipo_dano_${index}`)?.value || "";
    const atkTipo = document.getElementById(`inv_atk_tipo_${index}`)?.value || "Corpo-a-Corpo";
    const teste = document.getElementById(`inv_teste_${index}`)?.value || "";
    const bonusDef = parseInt(document.getElementById(`inv_defesa_bonus_${index}`).value) || 0;
    const penalidadeDef = parseInt(document.getElementById(`inv_defesa_penalidade_${index}`)?.value) || 0;

    // Proteção contra JSON malformado ou cortado
    let caboData = {};
    let baseData = {};
    try {
        // Proteção contra JSON malformado ou cortado
        const caboVal = document.getElementById(`inv_cabo_${index}`).value;
        caboData = JSON.parse(caboVal && caboVal.startsWith('{') ? caboVal : '{}');
    } catch (e) { console.warn("Dados do Centro corrompidos, resetando..."); }

    try {
        const baseVal = document.getElementById(`inv_base_${index}`).value;
        baseData = JSON.parse(baseVal && baseVal.startsWith('{') ? baseVal : '{}');
    } catch (e) { console.warn("Dados da Base corrompidos, resetando..."); }

    document.getElementById('modal-title').innerText = `Detalhes: ${nome || "Novo Item"}`;

    const body = document.getElementById('modal-body-content');
    let htmlExtra = `
        <div class="input-group"><label>Descrição</label><textarea id="modal_desc" class="inv-input" style="min-height:80px">${desc}</textarea></div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Peso (kg)</label><input type="number" step="0.1" id="modal_peso" class="inv-input" value="${peso}"></div>
            <div class="input-group"><label>Quantidade</label><input type="number" id="modal_qtd" class="inv-input" value="${qtd}"></div>
        </div>
    `;

    if (['armas', 'armaduras', 'consumiveis', 'itens'].includes(cat)) {
        htmlExtra += `
            <div class="input-group">
                <label>Modificações (Simples/Marciais)</label>
                <button type="button" class="btn-material-edit" onclick="abrirModalModificacoesItem('${index}')">Definir Modificações</button>
            </div>
        `;
    }

    if (cat !== 'armas') {
        htmlExtra += `<div class="input-group"><label>Raridade</label><select id="modal_raro" class="inv-input">${OPTIONS_RARIDADE.map(r => `<option value="${r.v}">${r.t}</option>`).join('')}</select></div>`;
    } else {
        let raroData = {};
        try { raroData = JSON.parse(raroRaw.startsWith('{') ? raroRaw : '{}'); } catch (e) { }
        const rarityText = OPTIONS_RARIDADE.find(r => r.v === raroData.raridade)?.t || "Comum";
        htmlExtra += `<div class="input-group"><label>Raridade & Buffs</label><button type="button" class="btn-material-edit" onclick="abrirModalRaridadeArma('${index}')">${rarityText}</button></div>`;
    }

    htmlExtra += `
            <div class="input-group"><label>Bônus de Atributo</label>
            <div style="display:flex; gap:5px">
                <select id="modal_attr" class="inv-input" style="flex:2">${OPTIONS_ATTR.map(opt => `<option value="${opt.v}">${opt.t}</option>`).join('')}</select>
                <input type="number" id="modal_mod" class="inv-input" style="flex:1" value="${modVal}">
            </div>
        </div>`;

    if (cat === 'armas') {
        htmlExtra += `
            <div class="input-group"><label>Tipo de Arma</label>
                <select id="modal_tipo" class="inv-input">
                    <option value="simples_uma_mao">Simples uma mão</option>
                    <option value="simples_duas_maos">Simples duas mãos</option>
                    <option value="marcial_uma_mao">Marcial uma mão</option>
                    <option value="marcial_duas_maos">Marcial duas mãos</option>
                </select></div>
            <div class="input-group"><label>Categoria de Ataque</label>
                <select id="modal_atk_tipo" class="inv-input">
                    ${OPTIONS_ATK_TIPO.map(opt => `<option value="${opt.v}" ${atkTipo === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                </select></div>
            <div class="input-group"><label>Teste (Perícia ou Atributo)</label><input type="text" id="modal_teste" class="inv-input" value="${teste}" placeholder="Ex: Luta ou Força"></div>
            <div class="input-group"><label>Dano</label><input type="text" id="modal_dano" class="inv-input" value="${document.getElementById(`inv_dano_${index}`).value}"></div>
            <div class="grid-2-cols">
                <div class="input-group"><label>Crítico</label><input type="text" id="modal_critico" class="inv-input" value="${critico}" placeholder="Ex: 19/x3"></div>
                <div class="input-group"><label>Tipo de Dano</label><input type="text" id="modal_tipo_dano" class="inv-input" value="${tipoDano}" placeholder="Ex: Cortante"></div>
            </div>
            <div class="input-group"><label>Alcance</label><select id="modal_alcance" class="inv-input">${OPTIONS_ALCANCE.map(opt => `<option value="${opt.v}">${opt.t}</option>`).join('')}</select></div>
            <div class="grid-2-cols">
                <div class="input-group"><label>Centro</label><button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'cabo')">${caboData.nome || 'Definir Centro'}</button></div>
                <div class="input-group"><label>Base</label><button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'base')">${baseData.nome || 'Definir Base'}</button></div>
            </div>
        `;
    } else if (cat === 'armaduras') {
        htmlExtra += `
            <div class="input-group"><label>Tipo de Armadura/Escudo</label>
                <select id="modal_tipo" class="inv-input">
                    <option value="armadura_simples">Armadura Simples</option>
                    <option value="armadura_marcial">Armadura Marcial</option>
                    <option value="escudo_simples_uma_mao">Escudo Simples uma mão</option>
                    <option value="escudo_simples_duas_maos">Escudo Simples duas mãos</option>
                    <option value="escudo_marcial_uma_mao">Escudo Marcial uma mão</option>
                </select></div>
            <div class="grid-2-cols">
                <div class="input-group">
                    <label>Bônus de Defesa</label>
                    <input type="text" id="modal_defesa_bonus" class="inv-input"
                        value="${bonusDef >= 0 ? '+' : ''}${bonusDef}"
                        oninput="this.value = '+' + this.value.replace(/[^0-9]/g, '')">
                </div>
                <div class="input-group">
                    <label>Penalidade</label>
                    <input type="text" id="modal_defesa_penalidade" class="inv-input"
                        value="${penalidadeDef > 0 ? '-' : (penalidadeDef < 0 ? '' : '-')}${penalidadeDef}"
                        oninput="this.value = '-' + this.value.replace(/[^0-9]/g, '')">
                </div>
            </div>
        `;
    } else if (cat === 'consumiveis') {
        htmlExtra += `<div class="input-group"><label>Efeito</label><textarea id="modal_efeito" class="inv-input">${document.getElementById(`inv_efeito_${index}`).value}</textarea></div>`;
    }

    body.innerHTML = htmlExtra;
    if (document.getElementById('modal_raro')) document.getElementById('modal_raro').value = raroRaw;
    if (document.getElementById('modal_attr')) document.getElementById('modal_attr').value = modAttr;
    if (document.getElementById('modal_tipo')) document.getElementById('modal_tipo').value = document.getElementById(`inv_tipo_${index}`).value || "";
    if (document.getElementById('modal_alcance')) document.getElementById('modal_alcance').value = document.getElementById(`inv_alcance_${index}`).value || "toque";

    document.getElementById('modal-desc').style.display = 'flex';
}

function fecharModalDescricao() {
    document.getElementById('modal-desc').style.display = 'none';
    itemSendoEditadoIdx = null;
}

function abrirModalMaterial(itemIndex, fieldName) {
    currentMaterialEditItemIdx = itemIndex;
    currentMaterialEditField = fieldName;

    let materialData = {};
    try {
        const rawVal = document.getElementById(`inv_${fieldName}_${itemIndex}`).value;
        materialData = JSON.parse(rawVal && rawVal.startsWith('{') ? rawVal : '{}');
    } catch (e) {
        console.warn("Erro ao processar JSON do material:", e);
    }

    // Reconstroi o corpo do modal de material (sem raridade de material)
    document.querySelector('#modal-material-details .modal-body').innerHTML = `
            <div class="input-group">
            <label>Nome</label>
            <input type="text" id="modal_material_nome" class="inv-input" placeholder="Ex: Palo Santo, Pérola Celestial..." value="${materialData.nome || ''}" />
        </div>
        <div id="material-attributes-container">
            <!-- Linhas de bônus serão injetadas aqui -->
        </div>
        <button type="button" class="btn-add-class" onclick="adicionarAtributoMaterial()">+ Adicionar Buff</button>
        `;

    document.getElementById('modal-material-title').innerText = `Detalhes do ${fieldName === 'cabo' ? 'Centro' : 'Base'}`;
    const container = document.getElementById('material-attributes-container');
    // Preenche os atributos do material
    if (materialData.attributes && Array.isArray(materialData.attributes)) materialData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod));
    else if (materialData.attr) adicionarAtributoMaterial(materialData.attr, materialData.mod); // Compatibilidade com formato antigo de um único atributo
    else adicionarAtributoMaterial(); // Adiciona uma linha vazia se não houver atributos
    document.getElementById('modal-material-details').style.display = 'flex';
}

function fecharModalMaterial() {
    document.getElementById('modal-material-details').style.display = 'none';
    currentMaterialEditItemIdx = null;
    currentMaterialEditField = null;
}

/**
 * Abre o modal para definir modificações simples e marciais do item
 */
function abrirModalModificacoesItem(itemIndex) {
    currentMaterialEditItemIdx = itemIndex;
    currentMaterialEditField = 'mods_item';

    let modsData = {};
    try {
        const rawVal = document.getElementById(`inv_mods_item_${itemIndex}`).value;
        modsData = JSON.parse(rawVal && rawVal.startsWith('{') ? rawVal : '{}');
    } catch (e) { }

    document.querySelector('#modal-material-details .modal-body').innerHTML = `
        <div id="material-attributes-container"></div>
            <button type="button" class="btn-add-class" onclick="adicionarAtributoMaterial()">+ Adicionar Modificação/Buff</button>
    `;

    document.getElementById('modal-material-title').innerText = "Modificações Simples e Marciais";
    const container = document.getElementById('material-attributes-container');
    if (modsData.attributes && Array.isArray(modsData.attributes)) modsData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod, a.nome));
    else adicionarAtributoMaterial();

    document.getElementById('modal-material-details').style.display = 'flex';
}

function salvarDetalhesModificacoesItem() {
    const idx = currentMaterialEditItemIdx;
    const rows = document.querySelectorAll('.material-attr-row');
    const attributes = [];
    rows.forEach(row => {
        const nome = row.querySelector('.material-name-input')?.value || "";
        const attr = row.querySelector('.material-attr-select').value;
        const mod = parseInt(row.querySelector('.material-mod-input').value) || 0;
        if (attr !== 'nenhum') attributes.push({ nome, attr, mod });
    });
    const modsJson = JSON.stringify({ attributes });
    document.getElementById(`inv_mods_item_${idx}`).value = modsJson;

    fecharModalMaterial();
    atualizarTudo();
}

/**
 * Abre o modal para definir a raridade e buffs de uma arma
 */
function abrirModalRaridadeArma(itemIndex) {
    currentMaterialEditItemIdx = itemIndex;
    currentMaterialEditField = 'raro';

    let rarityData = {};
    try {
        const rawVal = document.getElementById(`inv_raro_${itemIndex}`).value;
        rarityData = JSON.parse(rawVal && rawVal.startsWith('{') ? rawVal : '{}');
    } catch (e) { }

    const rarityOptionsHtml = OPTIONS_RARIDADE.map(r => `<option value="${r.v}" ${rarityData.raridade === r.v ? 'selected' : ''}>${r.t}</option>`).join('');

    document.querySelector('#modal-material-details .modal-body').innerHTML = `
        <div class="input-group">
            <label>Raridade da Arma</label>
            <select id="modal_arma_raridade" class="inv-input">${rarityOptionsHtml}</select>
        </div>
        <div id="material-attributes-container"></div>
        <button type="button" class="btn-add-class" onclick="adicionarAtributoMaterial()">+ Adicionar Buff de Raridade</button>
    `;

    document.getElementById('modal-material-title').innerText = "Raridade & Buffs da Arma";
    const container = document.getElementById('material-attributes-container');
    if (rarityData.attributes && Array.isArray(rarityData.attributes)) rarityData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod));
    else adicionarAtributoMaterial();

    document.getElementById('modal-material-details').style.display = 'flex';
}

function salvarDetalhesRaridadeArma() {
    const idx = currentMaterialEditItemIdx;
    const raridade = document.getElementById('modal_arma_raridade').value;
    const rows = document.querySelectorAll('.material-attr-row');
    const attributes = [];
    rows.forEach(row => {
        const attr = row.querySelector('.material-attr-select').value;
        const mod = parseInt(row.querySelector('.material-mod-input').value) || 0;
        if (attr !== 'nenhum') attributes.push({ attr, mod });
    });
    const rarityJson = JSON.stringify({ raridade, attributes });
    document.getElementById(`inv_raro_${idx}`).value = rarityJson;

    const rarityText = OPTIONS_RARIDADE.find(r => r.v === raridade)?.t || "Comum";
    const btn = document.querySelector(`#modal-desc button[onclick*="abrirModalRaridadeArma('${idx}')"]`);
    if (btn) btn.innerText = rarityText;

    fecharModalMaterial();
    atualizarTudo();
    atualizarEstiloRaridade(idx);
}

function adicionarAtributoMaterial(attr = 'nenhum', mod = 0, nome = '') {
    const container = document.getElementById('material-attributes-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style.display = 'flex';
    row.style.gap = '5px';
    row.style.marginBottom = '10px';
    row.style.alignItems = 'center';

    const showName = currentMaterialEditField === 'mods_item';

    row.innerHTML = `
        ${showName ? `<input type="text" class="inv-input material-name-input" style="flex:2" placeholder="Nome (Ex: Certeira)" value="${nome}">` : ''}
        <select class="inv-input material-attr-select" style="flex:2">${OPTIONS_ATTR.map(opt => `<option value="${opt.v}">${opt.t}</option>`).join('')}</select>
        <input type="number" class="inv-input material-mod-input" style="flex:1" value="${mod}">
        <button type="button" class="btn-remove-class" onclick="this.closest('.material-attr-row').remove()">×</button>
    `;
    container.appendChild(row);
    row.querySelector('.material-attr-select').value = attr;
}

function salvarDetalhesMaterial() {
    if (currentMaterialEditField === 'mods_item') {
        return salvarDetalhesModificacoesItem();
    }

    if (currentMaterialEditField === 'raro') {
        return salvarDetalhesRaridadeArma();
    }

    if (currentMaterialEditItemIdx !== null && currentMaterialEditField !== null) {
        const nome = document.getElementById('modal_material_nome').value;
        const rows = document.querySelectorAll('.material-attr-row');
        const attributes = [];
        rows.forEach(row => {
            const attr = row.querySelector('.material-attr-select').value;
            const mod = parseInt(row.querySelector('.material-mod-input').value) || 0;
            if (attr !== 'nenhum') attributes.push({ attr, mod });
        });
        const materialJson = JSON.stringify({ nome, attributes });
        document.getElementById(`inv_${currentMaterialEditField}_${currentMaterialEditItemIdx}`).value = materialJson;
        const btn = document.querySelector(`#modal-desc button[onclick*="abrirModalMaterial('${currentMaterialEditItemIdx}', '${currentMaterialEditField}')"]`);
        if (btn) btn.innerText = nome || `Definir ${currentMaterialEditField === 'cabo' ? 'Centro' : 'Base'}`;
        fecharModalMaterial();
        atualizarTudo();
        atualizarEstiloRaridade(currentMaterialEditItemIdx); // Atualiza a raridade visual do item principal
        verificarTipoItem(currentMaterialEditItemIdx); // Dispara a sincronização de bônus com o ataque
    }
}

function salvarDetalhesItem() {
    if (itemSendoEditadoIdx !== null) {
        const idx = itemSendoEditadoIdx;
        document.getElementById(`inv_desc_${idx}`).value = document.getElementById('modal_desc').value;
        document.getElementById(`inv_peso_${idx}`).value = document.getElementById('modal_peso').value;
        document.getElementById(`inv_qtd_${idx}`).value = document.getElementById('modal_qtd').value;

        const categoria = document.getElementById(`inv_cat_${idx}`).value;
        // A raridade de armas é derivada, não pode ser definida diretamente pelo modal
        if (categoria !== 'armas') {
            document.getElementById(`inv_raro_${idx}`).value = document.getElementById('modal_raro').value;
        }

        document.getElementById(`inv_attr_${idx}`).value = document.getElementById('modal_attr').value;
        document.getElementById(`inv_mod_${idx}`).value = document.getElementById('modal_mod').value;
        if (document.getElementById('modal_tipo')) document.getElementById(`inv_tipo_${idx}`).value = document.getElementById('modal_tipo').value;
        if (document.getElementById('modal_atk_tipo')) document.getElementById(`inv_atk_tipo_${idx}`).value = document.getElementById('modal_atk_tipo').value;
        if (document.getElementById('modal_teste')) document.getElementById(`inv_teste_${idx}`).value = document.getElementById('modal_teste').value;
        if (document.getElementById('modal_dano')) document.getElementById(`inv_dano_${idx}`).value = document.getElementById('modal_dano').value;
        if (document.getElementById('modal_critico')) document.getElementById(`inv_critico_${idx}`).value = document.getElementById('modal_critico').value;
        if (document.getElementById('modal_tipo_dano')) document.getElementById(`inv_tipo_dano_${idx}`).value = document.getElementById('modal_tipo_dano').value;
        if (document.getElementById('modal_alcance')) document.getElementById(`inv_alcance_${idx}`).value = document.getElementById('modal_alcance').value;
        if (document.getElementById('modal_defesa_bonus')) document.getElementById(`inv_defesa_bonus_${idx}`).value = parseInt(document.getElementById('modal_defesa_bonus').value.replace(/[^-0-9]/g, '')) || 0;
        if (document.getElementById('modal_defesa_penalidade')) document.getElementById(`inv_defesa_penalidade_${idx}`).value = Math.abs(parseInt(document.getElementById('modal_defesa_penalidade').value.replace(/[^-0-9]/g, ''))) || 0;
        if (document.getElementById('modal_efeito')) document.getElementById(`inv_efeito_${idx}`).value = document.getElementById('modal_efeito').value;

        // Garante que a UI e a sincronização de ataques sejam disparadas
        verificarTipoItem(idx);
        atualizarEstiloRaridade(idx);
        atualizarEstiloBonus(idx);
        fecharModalDescricao();
        atualizarTudo();
    }
}