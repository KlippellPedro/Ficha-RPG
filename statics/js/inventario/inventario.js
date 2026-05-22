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
                        ${OPTIONS_TIPO_DANO.map(opt => `<option value="${opt.v}" ${tipoDano === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                    </select>
                </div>
                <div class="input-group"><label>Alcance</label>
                    <select id="modal_item_alcance" class="inv-input">
                        ${OPTIONS_ALCANCE.map(opt => `<option value="${opt.v}" ${alcance === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="grid-2-cols" style="gap: 10px; margin-bottom: 15px;">
                <button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'cabo')">⚙ Definir Centro</button>
                <button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'base')">⚙ Definir Base</button>
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
    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx);
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

function salvarDetalhesItem() {
    if (itemSendoEditadoIdx === null) return;
    const idx = itemSendoEditadoIdx;

    const peso = document.getElementById('modal_item_peso').value;
    const qtd = document.getElementById('modal_item_qtd').value;
    const desc = document.getElementById('modal_item_desc').value;

    // Salva de volta nos inputs ocultos da linha
    document.getElementById(`inv_peso_${idx}`).value = peso;
    document.getElementById(`inv_qtd_${idx}`).value = qtd;
    document.getElementById(`inv_desc_${idx}`).value = desc;

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
    if (!modal || !container) return;

    const fieldId = tipo === 'cabo' ? `inv_cabo_${index}` : `inv_base_${index}`;
    const matRaw = document.getElementById(fieldId)?.value || "{}";
    let matData = { nome: "", attributes: [] };
    try {
        matData = matRaw.startsWith('{') ? JSON.parse(matRaw) : { nome: matRaw, attributes: [] };
    } catch (e) { }

    document.getElementById('modal_material_nome').value = matData.nome || "";
    document.getElementById('modal-material-title').innerText = tipo === 'cabo' ? 'Detalhes do Centro (Cabo)' : 'Detalhes da Base (Lâmina/Corpo)';

    container.innerHTML = '';
    if (matData.attributes) {
        matData.attributes.forEach(a => adicionarAtributoMaterial(a.attr, a.mod, a.isAdv));
    }

    modal.style.display = 'flex';
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
    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx);
    if (typeof atualizarEstiloRaridade === 'function') atualizarEstiloRaridade(idx);
    if (typeof atualizarTudo === 'function') atualizarTudo();
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
                salvo[`inv_atk_tipo_${id}`] || "Corpo-a-Corpo"
            );
            atualizarEstiloBonus(id);
            atualizarEstiloRaridade(id); // Garante que a raridade visual seja aplicada no carregamento
        });
    }

    ordenarItens();
    filtrarItens();
    atualizarTudo(); // Chama atualizarTudo uma única vez após carregar tudo
});