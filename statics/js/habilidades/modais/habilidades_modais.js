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

    titleEl.innerText = `Detalhes: ${nome || "Habilidade"}`;
    body.innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Origem</label>
                <select id="modal_hab_classe" class="inv-input">
                    ${typeof getOpcoesClassesHab === 'function' ? getOpcoesClassesHab(classe) : ''}
                </select>
            </div>
            <div class="input-group"><label>Tipo de Efeito</label>
                <select id="modal_hab_tipo" class="inv-input">
                    <option value="Ativa" ${tipo === 'Ativa' ? 'selected' : ''}>Ativa</option>
                    <option value="Passiva" ${tipo === 'Passiva' ? 'selected' : ''}>Passiva</option>
                    <option value="Reação" ${tipo === 'Reação' ? 'selected' : ''}>Reação</option>
                    <option value="Outro" ${tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div class="input-group"><label>Custo</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="modal_hab_custo" class="inv-input" value="${custo}" style="flex:1;">
                    <select id="modal_hab_tipo_custo" class="inv-input" style="width:80px;">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Duração</label>
                <input type="text" id="modal_hab_duracao" class="inv-input" value="${duracao}">
            </div>
            <div class="input-group">
                <label>Alcance</label>
                <input type="text" id="modal_hab_alcance" class="inv-input" value="${alcance}">
            </div>
        </div>
        <div class="input-group">
            <label>Ação</label>
            <input type="text" id="modal_hab_acao" class="inv-input" value="${acao}">
        </div>
        <div class="input-group" id="hab-buff-btn-container">
            <label style="display:flex;justify-content:space-between;align-items:center;">
                <span>Buffs / Modificadores</span>
                <small style="color:var(--text-muted);font-weight:normal;">
                    ${tipo === 'Passiva' ? '🔒 Passiva: sempre ativo' : '⚡ Ativa: ativo ao usar'}
                </small>
            </label>
            <button type="button" class="btn-save-modal" style="width:100%; background: #16a34a; color: #fff; border: 1px solid #166534;" onclick="abrirModalBuffsHab('${index}')">Configurar Buffs</button>
        </div>
        <div class="input-group">
            <label>Descrição e Efeito</label>
            <textarea id="modal_hab_desc" class="inv-input" style="min-height: 200px">${desc}</textarea>
        </div>
    `;

    const footer = modal ? modal.querySelector('.modal-footer') : null;
    if (footer) {
        footer.style.justifyContent = 'flex-end';
        footer.innerHTML = `
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesHab()">Salvar e Fechar</button>
        `;
    }
    modal.showModal();
}

function fecharModalHab() {
    document.getElementById('modal-hab').close();
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
        if (btnUsar) btnUsar.style.display = novoTipo === 'Passiva' ? 'none' : '';

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
    document.getElementById('modal-pod-buffs').close();
    currentHabModEditIdx = null;
}

function adicionarLinhaBuffHab(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;
    const optionsCat = window.OPTIONS_CATEGORIZADAS || {};

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';

    row.innerHTML = `
        <select class="inv-input pod-cat-select" style="flex: 1; border-color: #555;">
            <option value="ficha">Ficha</option>
            <option value="pericia">Perícia</option>
            <option value="arma">Arma</option>
            <option value="vantagem" ${isAdv ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input pod-buff-attr" style="flex: 1.5;"></select>
        <input type="text" class="inv-input pod-buff-val" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
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