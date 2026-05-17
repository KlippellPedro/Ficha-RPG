/**
 * Lógica de controle de Modais do Inventário
 */

let itemSendoEditadoIdx = null;
let materialSendoEditadoField = null; // 'cabo' ou 'base'

/**
 * Abre o modal principal de detalhes do item
 */
function abrirModalItem(index) {
    itemSendoEditadoIdx = index;
    const nome = document.getElementById(`inv_nome_${index}`).value;
    const cat = document.getElementById(`inv_cat_${index}`).value;
    const desc = document.getElementById(`inv_desc_${index}`).value;
    const peso = document.getElementById(`inv_peso_${index}`).value;
    const qtd = document.getElementById(`inv_qtd_${index}`).value;

    document.getElementById('modal-title').innerText = `Detalhes: ${nome || "Novo Item"}`;

    let especificosHtml = "";

    // Gera campos diferentes baseados na categoria
    if (cat === 'armas') {
        especificosHtml = `
            <div class="grid-2-cols">
                <div class="input-group"><label>Dano Base</label><input type="text" id="modal_inv_dano" class="inv-input" value="${document.getElementById(`inv_dano_${index}`).value}" placeholder="Ex: 1d8"></div>
                <div class="input-group"><label>Crítico</label><input type="text" id="modal_inv_critico" class="inv-input" value="${document.getElementById(`inv_critico_${index}`).value}" placeholder="Ex: 19/x3"></div>
            </div>
            <div class="grid-2-cols">
                <div class="input-group"><label>Tipo de Dano</label><input type="text" id="modal_inv_tipo_dano" class="inv-input" value="${document.getElementById(`inv_tipo_dano_${index}`).value}" placeholder="Ex: Cortante"></div>
                <div class="input-group"><label>Alcance</label>
                    <select id="modal_inv_alcance" class="inv-input">${OPTIONS_ALCANCE.map(o => `<option value="${o.v}" ${o.v === document.getElementById(`inv_alcance_${index}`).value ? 'selected' : ''}>${o.t}</option>`).join('')}</select>
                </div>
            </div>
            <div class="grid-2-cols">
                <div class="input-group"><label>Centro</label><button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'cabo')">Editar Material</button></div>
                <div class="input-group"><label>Base</label><button type="button" class="btn-material-edit" onclick="abrirModalMaterial('${index}', 'base')">Editar Material</button></div>
            </div>
        `;
    } else if (cat === 'armaduras') {
        especificosHtml = `
            <div class="grid-2-cols">
                <div class="input-group"><label>Bônus de Defesa</label><input type="number" id="modal_inv_defesa_bonus" class="inv-input" value="${document.getElementById(`inv_defesa_bonus_${index}`).value}"></div>
                <div class="input-group"><label>Penalidade Mov.</label><input type="number" id="modal_inv_defesa_penalidade" class="inv-input" value="${document.getElementById(`inv_defesa_penalidade_${index}`).value}"></div>
            </div>
        `;
    }

    // Gerar HTML das modificações
    const modsHtml = `
        <div style="margin-top: 20px; border-top: 1px solid rgba(255,68,68,0.3); padding-top: 15px;">
            <div class="input-group">
                <label style="color: #ff4444; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Modificações e Encantamentos</label>
                <button type="button" class="btn-material-edit" onclick="abrirModalModificacoes('${index}')">Editar Modificações</button>
            </div>
        </div>
    `;

    document.getElementById('modal-body-content').innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group"><label>Peso (kg)</label><input type="number" step="0.1" id="modal_inv_peso" class="inv-input" value="${peso}"></div>
            <div class="input-group"><label>Quantidade</label><input type="number" id="modal_inv_qtd" class="inv-input" value="${qtd}"></div>
        </div>
        ${especificosHtml}
        <div class="input-group"><label>Descrição / Efeitos</label>
            <textarea id="modal_inv_desc" class="inv-input" style="min-height: 120px">${desc}</textarea>
        </div>
        ${modsHtml}
    `;

    document.getElementById('modal-desc').style.display = 'flex';
}

function fecharModalDescricao() {
    document.getElementById('modal-desc').style.display = 'none';
    itemSendoEditadoIdx = null;
}

function salvarDetalhesItem() {
    if (itemSendoEditadoIdx === null) return;
    const idx = itemSendoEditadoIdx;

    // Salva campos comuns
    document.getElementById(`inv_peso_${idx}`).value = document.getElementById('modal_inv_peso').value;
    document.getElementById(`inv_qtd_${idx}`).value = document.getElementById('modal_inv_qtd').value;
    document.getElementById(`inv_desc_${idx}`).value = document.getElementById('modal_inv_desc').value;

    // Salva campos específicos se existirem
    const d = document.getElementById('modal_inv_dano'); if (d) document.getElementById(`inv_dano_${idx}`).value = d.value;
    const c = document.getElementById('modal_inv_critico'); if (c) document.getElementById(`inv_critico_${idx}`).value = c.value;
    const td = document.getElementById('modal_inv_tipo_dano'); if (td) document.getElementById(`inv_tipo_dano_${idx}`).value = td.value;
    const al = document.getElementById('modal_inv_alcance'); if (al) document.getElementById(`inv_alcance_${idx}`).value = al.value;
    const db = document.getElementById('modal_inv_defesa_bonus'); if (db) document.getElementById(`inv_defesa_bonus_${idx}`).value = db.value;
    const dp = document.getElementById('modal_inv_defesa_penalidade'); if (dp) document.getElementById(`inv_defesa_penalidade_${idx}`).value = dp.value;

    fecharModalDescricao();
    if (typeof verificarTipoItem === 'function') verificarTipoItem(idx);
    atualizarTudo();
}

/**
 * Abre o modal específico de Modificações
 */
function abrirModalModificacoes(index) {
    itemSendoEditadoIdx = index;
    const raw = document.getElementById(`inv_mods_item_${index}`).value;
    let modsData = { attributes: [] };
    try { if (raw && raw !== "{}") modsData = JSON.parse(raw); } catch (e) { }

    const container = document.getElementById('modal-mods-container');
    container.innerHTML = "";

    if (modsData.attributes && modsData.attributes.length > 0) {
        modsData.attributes.forEach(m => adicionarLinhaModificacao(m.attr, m.mod, m.isAdv));
    } else {
        adicionarLinhaModificacao();
    }

    document.getElementById('modal-item-mods').style.display = 'flex';
}

function fecharModalModificacoes() {
    document.getElementById('modal-item-mods').style.display = 'none';
}

function salvarDetalhesModificacoes() {
    if (itemSendoEditadoIdx === null) return;
    const idx = itemSendoEditadoIdx;

    const modRows = document.querySelectorAll('#modal-mods-container .item-mod-row');
    const attributes = [];
    modRows.forEach(row => {
        const cat = row.querySelector('.mod-cat-select')?.value;
        const attr = row.querySelector('.mod-attr-select')?.value;
        const mod = parseInt(row.querySelector('.mod-val-input')?.value) || 0;
        if (attr !== 'nenhum') {
            attributes.push({ attr, mod, isAdv: cat === 'vantagem' });
        }
    });
    document.getElementById(`inv_mods_item_${idx}`).value = JSON.stringify({ attributes });

    fecharModalModificacoes();
    atualizarTudo();
}

function adicionarLinhaModificacao(attr = "nenhum", mod = 0, isAdv = false) {
    const container = document.getElementById('modal-mods-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'item-mod-row';
    row.style = "display: flex; gap: 8px; margin-bottom: 8px; align-items: center;";

    const categories = [
        { v: "ficha", t: "Ficha" },
        { v: "pericia", t: "Perícia" },
        { v: "arma", t: "Arma" },
        { v: "vantagem", t: "Vantagem" }
    ];

    row.innerHTML = `
        <select class="inv-input mod-cat-select" style="flex: 1; font-size: 0.8rem;">
            ${categories.map(c => `<option value="${c.v}" ${isAdv && c.v === 'vantagem' ? 'selected' : ''}>${c.t}</option>`).join('')}
        </select>
        <select class="inv-input mod-attr-select" style="flex: 1.5; font-size: 0.8rem;"></select>
        <input type="number" class="inv-input mod-val-input" style="flex: 0.7; text-align: center;" value="${mod}">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(row);

    const catSel = row.querySelector('.mod-cat-select');
    const attrSel = row.querySelector('.mod-attr-select');

    const updateOptions = (currentVal = "nenhum") => {
        const cat = catSel.value;
        const options = window.OPTIONS_CATEGORIZADAS[cat] || [];
        attrSel.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === currentVal ? 'selected' : ''}>${o.t}</option>`).join('');
    };

    catSel.onchange = () => updateOptions();
    updateOptions(attr);
}

/**
 * Lógica para Materiais de Armas (Cabo/Base)
 */
function abrirModalMaterial(index, field) {
    materialSendoEditadoField = field;
    const raw = document.getElementById(`inv_${field}_${index}`).value;
    let data = { nome: "", attributes: [], raridade: "comum" };
    try { data = JSON.parse(raw || "{}"); } catch (e) { }

    document.getElementById('modal-material-title').innerText = `Editar ${field === 'cabo' ? 'Centro' : 'Base'}`;
    document.getElementById('modal_material_nome').value = data.nome || "";

    const container = document.getElementById('material-attributes-container');
    container.innerHTML = "";

    if (data.attributes && data.attributes.length > 0) {
        data.attributes.forEach(attr => adicionarAtributoMaterial(attr.attr, attr.mod, attr.isAdv));
    } else {
        adicionarAtributoMaterial();
    }

    document.getElementById('modal-material-details').style.display = 'flex';
}

function fecharModalMaterial() {
    document.getElementById('modal-material-details').style.display = 'none';
    materialSendoEditadoField = null;
}

function adicionarAtributoMaterial(attr = "nenhum", mod = 0, isAdv = false) {
    const container = document.getElementById('material-attributes-container');
    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style = "display: flex; gap: 10px; margin-bottom: 10px;";

    // Categorias para o seletor
    const categories = [
        { v: "ficha", t: "Ficha" },
        { v: "pericia", t: "Perícia" },
        { v: "arma", t: "Arma" },
        { v: "vantagem", t: "Vantagem" }
    ];

    row.innerHTML = `
        <select class="inv-input mat-cat-select" style="flex: 1;">
            ${categories.map(c => `<option value="${c.v}" ${isAdv && c.v === 'vantagem' ? 'selected' : ''}>${c.t}</option>`).join('')}
        </select>
        <select class="inv-input mat-attr-select" style="flex: 1.5;"></select>
        <input type="text" class="inv-input mat-mod-input" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(row);

    const catSel = row.querySelector('.mat-cat-select');
    const attrSel = row.querySelector('.mat-attr-select');

    const updateAttrs = (val = "nenhum") => {
        const cat = catSel.value;
        const options = window.OPTIONS_CATEGORIZADAS[cat] || [];
        attrSel.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };

    catSel.onchange = () => updateAttrs();
    updateAttrs(attr);
}

function salvarDetalhesMaterial() {
    if (!itemSendoEditadoIdx || !materialSendoEditadoField) return;

    const rows = document.querySelectorAll('.material-attr-row');
    const attributes = [];
    rows.forEach(row => {
        const cat = row.querySelector('.mat-cat-select').value;
        const attr = row.querySelector('.mat-attr-select').value;
        const mod = row.querySelector('.mat-mod-input').value;
        if (attr !== 'nenhum') {
            attributes.push({ attr, mod, isAdv: cat === 'vantagem' });
        }
    });

    const data = {
        nome: document.getElementById('modal_material_nome').value,
        attributes: attributes
    };

    document.getElementById(`inv_${materialSendoEditadoField}_${itemSendoEditadoIdx}`).value = JSON.stringify(data);
    fecharModalMaterial();
}