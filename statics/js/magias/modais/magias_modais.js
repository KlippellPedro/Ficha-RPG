/**
 * Lógica de controle de Modais das Magias (Grimório)
 */
let magSendoEditadaIdx = null;

function abrirModalMag(index) {
    magSendoEditadaIdx = index;
    const vals = {
        nome: document.getElementById(`mag_nome_${index}`).value,
        tipo: document.getElementById(`mag_tipo_${index}`).value,
        nivel: document.getElementById(`mag_nivel_${index}`).value,
        custo: document.getElementById(`mag_custo_${index}`).value,
        tipoCusto: document.getElementById(`mag_tipo_custo_${index}`).value,
        desc: document.getElementById(`mag_desc_${index}`).value,
        duracao: document.getElementById(`mag_duracao_${index}`).value,
        alcance: document.getElementById(`mag_alcance_${index}`).value,
        acao: document.getElementById(`mag_acao_${index}`).value,
        teste: document.getElementById(`mag_teste_${index}`)?.value || ""
    };

    const titleEl = document.getElementById('modal-magia-title');
    const bodyEl = document.getElementById('modal-magia-body');
    const modalEl = document.getElementById('modal-magia');

    if (!titleEl || !bodyEl || !modalEl) return;

    titleEl.innerText = `Grimório: ${vals.nome || "Nova Magia"}`;
    let optionsHtml = TIPOS_MAGIA.map(t => `<option value="${t}" ${vals.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    bodyEl.innerHTML = `
        <div class="grid-3-cols" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Tipo</label>
                <select id="modal_mag_tipo" class="inv-input" onchange="const c = document.getElementById('modal_nivel_container'); c.innerHTML = renderizarCampoNivel(this.value, '', 'modal'); atualizarCorNivel('modal');">${optionsHtml}</select>
            </div>
            <div class="input-group"><label>Nível/Círculo</label>
                <div id="modal_nivel_container">${renderizarCampoNivel(vals.tipo, vals.nivel, 'modal')}</div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group" ><label>Custo de Conjuração</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="modal_mag_custo" class="inv-input" value="${vals.custo}" style="flex:1;">
                    <select id="modal_mag_tipo_custo" class="inv-input" style="width:80px;">
                        <option value="PM" ${vals.tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${vals.tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${vals.tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Duração</label><input type="text" id="modal_mag_duracao" class="inv-input" value="${vals.duracao}" placeholder="Ex: Cena"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_mag_alcance" class="inv-input" value="${vals.alcance}" placeholder="Ex: Curto"></div>
        </div>
        <div class="grid-2-cols" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Ação</label><input type="text" id="modal_mag_acao" class="inv-input" value="${vals.acao}" placeholder="Ex: Padrão"></div>
            <div class="input-group"><label>Teste</label><input type="text" id="modal_mag_teste" class="inv-input" value="${vals.teste}" placeholder="Ex: Misticismo"></div>
        </div>
        <div class="input-group"><label>Efeito da Magia</label><textarea id="modal_mag_desc" class="inv-input" style="min-height: 180px">${vals.desc}</textarea></div>
        <div class="input-group">
            <label style="display:flex;justify-content:space-between;align-items:center;">
                <span>Buffs / Efeitos Persistentes</span>
                <small style="color:var(--text-muted);font-weight:normal;">✨ Ativo ao conjurar</small>
            </label>
            <button type="button" class="btn-save-modal" style="width:100%;background:#6d28d9;color:#fff;border:1px solid #7c3aed;" onclick="abrirModalBuffsMag('${index}')">Configurar Buffs da Magia</button>
        </div>
    `;

    const footer = modalEl.querySelector('.modal-footer');
    if (footer) {
        footer.style.justifyContent = 'flex-end';
        footer.innerHTML = `
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesMag()">Salvar no Grimório</button>
        `;
    }

    modalEl.showModal();
    atualizarCorNivel('modal');
}

function fecharModalMag() {
    const modal = document.getElementById('modal-magia');
    if (modal) modal.close();
    magSendoEditadaIdx = null;
}

function salvarDetalhesMag() {
    if (magSendoEditadaIdx !== null) {
        const idx = magSendoEditadaIdx;
        const novoTipo = document.getElementById('modal_mag_tipo').value;
        let novoNivel = document.getElementById('mag_nivel_modal').value;
        const nivelParaSalvar = (novoTipo === "Elemental" && novoNivel.endsWith('%')) ? novoNivel.slice(0, -1) : novoNivel;

        document.getElementById(`mag_tipo_${idx}`).value = novoTipo;
        document.getElementById(`container_nivel_${idx}`).innerHTML = renderizarCampoNivel(novoTipo, nivelParaSalvar, idx);
        atualizarCorNivel(idx);
        document.getElementById(`mag_custo_${idx}`).value = document.getElementById('modal_mag_custo').value;
        document.getElementById(`mag_tipo_custo_${idx}`).value = document.getElementById('modal_mag_tipo_custo').value;
        document.getElementById(`mag_desc_${idx}`).value = document.getElementById('modal_mag_desc').value;
        document.getElementById(`mag_duracao_${idx}`).value = document.getElementById('modal_mag_duracao').value;
        document.getElementById(`mag_alcance_${idx}`).value = document.getElementById('modal_mag_alcance').value;
        document.getElementById(`mag_acao_${idx}`).value = document.getElementById('modal_mag_acao').value;
        document.getElementById(`mag_teste_${idx}`).value = document.getElementById('modal_mag_teste').value;
        fecharModalMag();
        atualizarTudo();
        filtrarMagias();
    }
}

let _magBuffEditIdx = null;

/**
 * Adiciona uma linha de buff no container do modal — versão local para magias
 * (idêntica à de poderes, mas independente para funcionar sem poderes_modais.js)
 */
function _adicionarLinhaBuff_Mag(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum' && window.OPTIONS_CATEGORIZADAS) {
        if (window.OPTIONS_CATEGORIZADAS.pericia?.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma?.some(o => o.v === attr)) cat = 'arma';
    }

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;';
    row.innerHTML = `
        <select class="inv-input pod-cat-select" style="flex:1;">
            <option value="ficha"    ${cat === 'ficha'    ? 'selected' : ''}>Ficha</option>
            <option value="pericia"  ${cat === 'pericia'  ? 'selected' : ''}>Perícia</option>
            <option value="arma"     ${cat === 'arma'     ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input pod-buff-attr" style="flex:1.5;"></select>
        <input type="text" class="inv-input pod-buff-val" style="flex:0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const catSel  = row.querySelector('.pod-cat-select');
    const attrSel = row.querySelector('.pod-buff-attr');

    const populateAttr = (val = 'nenhum') => {
        const opts = (window.OPTIONS_CATEGORIZADAS?.[catSel.value]) || [];
        attrSel.innerHTML = opts.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    catSel.onchange = () => populateAttr();
    populateAttr(attr);
}

function abrirModalBuffsMag(index) {
    _magBuffEditIdx = index;
    let modsData = [];
    try { modsData = JSON.parse(document.getElementById(`mag_mods_${index}`)?.value || '[]'); } catch { modsData = []; }

    const modal     = document.getElementById('modal-pod-buffs');
    const container = document.getElementById('pod-buffs-container');
    const title     = document.getElementById('modal-pod-buffs-title');
    if (!modal || !container) return;

    if (title) title.innerText = "Buffs da Magia (Efeito Persistente)";
    container.innerHTML = '';

    // Botão para adicionar nova linha
    const btnAdd = modal.querySelector('.btn-add-class');
    if (btnAdd) btnAdd.setAttribute('onclick', '_adicionarLinhaBuff_Mag()');

    if (modsData.length > 0) {
        modsData.forEach(m => _adicionarLinhaBuff_Mag(m.attr, m.mod, m.isAdv));
    } else {
        _adicionarLinhaBuff_Mag();
    }

    const btnSalvar = modal.querySelector('.btn-save-modal');
    if (btnSalvar) btnSalvar.setAttribute('onclick', 'salvarBuffsMagia()');
    modal.showModal();
}

function salvarBuffsMagia() {
    if (_magBuffEditIdx === null) return;
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    const modsArr = [];
    container.querySelectorAll('.material-attr-row').forEach(row => {
        const cat    = row.querySelector('.pod-cat-select')?.value || 'ficha';
        const attr   = row.querySelector('.pod-buff-attr')?.value;
        const modVal = row.querySelector('.pod-buff-val')?.value;
        if (!attr || attr === 'nenhum') return;
        modsArr.push({
            attr,
            mod: isNaN(parseInt(modVal)) ? (modVal || 0) : parseInt(modVal),
            isAdv: cat === 'vantagem'
        });
    });

    const hidden = document.getElementById(`mag_mods_${_magBuffEditIdx}`);
    if (hidden) hidden.value = JSON.stringify(modsArr);

    document.getElementById('modal-pod-buffs')?.close();
    _magBuffEditIdx = null;
    atualizarTudo();
}