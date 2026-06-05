/**
 * Lógica de controle de Modais dos Poderes
 */

let podSendoEditadoIdx = null;
let currentPodModEditIdx = null;

function abrirModalPod(index) {
    podSendoEditadoIdx = index;
    const nome    = document.getElementById(`poder_nome_${index}`).value;
    const desc    = document.getElementById(`poder_desc_${index}`).value;
    const duracao = document.getElementById(`poder_duracao_${index}`).value;
    const alcance = document.getElementById(`poder_alcance_${index}`).value;
    const acao    = document.getElementById(`poder_acao_${index}`).value;
    const modo    = document.getElementById(`poder_modo_${index}`)?.value || 'Ativa';

    const titleEl = document.getElementById('modal-poder-title');
    const body    = document.getElementById('modal-poder-body');
    const modal   = document.getElementById('modal-poder');

    if (!titleEl || !body || !modal) return;

    titleEl.innerText = `Detalhes: ${nome || "Poder"}`;
    body.innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Tipo de Efeito</label>
                <select id="modal_pod_modo" class="inv-input">
                    <option value="Ativa"   ${modo === 'Ativa'   ? 'selected' : ''}>Ativa</option>
                    <option value="Passiva" ${modo === 'Passiva' ? 'selected' : ''}>Passiva</option>
                </select>
            </div>
            <div class="input-group"><label>Ação</label><input type="text" id="modal_pod_acao" class="inv-input" value="${acao}"></div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Duração</label><input type="text" id="modal_pod_duracao" class="inv-input" value="${duracao}"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_pod_alcance" class="inv-input" value="${alcance}"></div>
        </div>
        <div class="input-group">
            <label style="display:flex;justify-content:space-between;align-items:center;">
                <span>Buffs / Modificadores</span>
                <small style="color:var(--text-muted);font-weight:normal;font-size:0.7rem;">
                    ${modo === 'Passiva' ? '🔒 Sempre ativo' : 'Ativo ao usar'}
                </small>
            </label>
            <button type="button" class="btn-save-modal" style="width:100%; background: #1e40af; color: #fff; border: 1px solid #2563eb;" onclick="abrirModalBuffPod('${index}')">Configurar Buffs do Poder</button>
        </div>
        <div class="input-group"><label>Descrição do Poder</label>
            <textarea id="modal_pod_desc" class="inv-input" style="min-height: 130px">${desc}</textarea>
        </div>
    `;

    const footer = modal.querySelector('.modal-footer');
    if (footer) {
        footer.innerHTML = `<button type="button" class="btn-save-modal" style="width:100%" onclick="salvarDetalhesPod()">Salvar e Fechar</button>`;
    }

    modal.showModal();
}

function fecharModalPod() {
    const modal = document.getElementById('modal-poder');
    if (modal) modal.close();
    podSendoEditadoIdx = null;
}

function salvarDetalhesPod() {
    if (podSendoEditadoIdx === null) return;
    const idx = podSendoEditadoIdx;
    document.getElementById(`poder_desc_${idx}`).value    = document.getElementById('modal_pod_desc').value;
    document.getElementById(`poder_duracao_${idx}`).value = document.getElementById('modal_pod_duracao').value;
    document.getElementById(`poder_alcance_${idx}`).value = document.getElementById('modal_pod_alcance').value;
    document.getElementById(`poder_acao_${idx}`).value    = document.getElementById('modal_pod_acao').value;

    // Salva o modo (Ativa / Passiva)
    const novoModo = document.getElementById('modal_pod_modo')?.value || 'Ativa';
    let modoInput = document.getElementById(`poder_modo_${idx}`);
    if (!modoInput) {
        // Cria campo caso ainda não exista (legacy)
        modoInput = document.createElement('input');
        modoInput.type = 'hidden';
        modoInput.id = `poder_modo_${idx}`;
        modoInput.className = 'save-input';
        document.getElementById(`poder_desc_${idx}`)?.closest('div')?.appendChild(modoInput);
    }
    modoInput.value = novoModo;

    // Atualiza visibilidade do botão Usar
    const btnUsar = document.getElementById(`btn_usar_poder_${idx}`);
    if (btnUsar) btnUsar.style.display = novoModo === 'Passiva' ? 'none' : '';

    // Se mudou para Passiva, desativa buff ativo
    if (novoModo === 'Passiva') {
        const buffInput = document.getElementById(`poder_buff_ativo_${idx}`);
        if (buffInput && buffInput.value === 'true') {
            buffInput.value = 'false';
            if (typeof _syncBotaoPoder === 'function') _syncBotaoPoder(idx);
            let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            dados[`poder_buff_ativo_${idx}`] = 'false';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        }
    }

    fecharModalPod();
    atualizarTudo();
}

function abrirModalBuffPod(index) {
    currentPodModEditIdx = index;
    let modsData = [];
    try { modsData = JSON.parse(document.getElementById(`poder_mods_${index}`).value || "[]"); } catch (e) { modsData = []; }

    const container = document.getElementById('pod-buffs-container');
    const modal = document.getElementById('modal-pod-buffs');
    if (!container || !modal) return;

    container.innerHTML = '';
    if (modsData.length > 0) {
        modsData.forEach(m => adicionarLinhaBuffPod(m.attr, m.mod, m.isAdv));
    } else {
        adicionarLinhaBuffPod();
    }

    const btnSalvar = modal.querySelector('.btn-save-modal');
    if (btnSalvar) btnSalvar.setAttribute('onclick', 'salvarBuffsPoder()');

    // Garante que o botão "Adicionar Modificador" aponte para a função correta
    const btnAdd = modal.querySelector('.btn-add-class');
    if (btnAdd) btnAdd.setAttribute('onclick', 'adicionarLinhaBuffPod()');

    modal.showModal();
}

function fecharModalBuffPod() {
    document.getElementById('modal-pod-buffs').close();
    currentPodModEditIdx = null;
}

function adicionarLinhaBuffPod(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    // Identifica a categoria correta para restaurar o estado visual do modal
    let cat = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma && window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === attr)) cat = 'arma';
    }

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style = "display: flex; gap: 10px; margin-bottom: 10px;";

    row.innerHTML = `
        <select class="inv-input pod-cat-select" style="flex: 1;">
            <option value="ficha" ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input pod-buff-attr" style="flex: 1.5;"></select>
        <input type="text" class="inv-input pod-buff-val" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);

    const catSel = row.querySelector('.pod-cat-select');
    const attrSel = row.querySelector('.pod-buff-attr');

    // Força a atualização do valor do select de categoria para garantir a carga correta dos atributos
    catSel.value = cat;

    const update = (val = "nenhum") => {
        const options = window.OPTIONS_CATEGORIZADAS[catSel.value] || [];
        attrSel.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.t}</option>`).join('');
    };
    catSel.onchange = () => update();
    update(attr);
}

function salvarBuffsPoder() {
    if (currentPodModEditIdx === null) return;
    const rows = document.querySelectorAll('#pod-buffs-container .material-attr-row');
    const modsArr = [];
    rows.forEach(row => {
        const cat = row.querySelector('.pod-cat-select').value;
        const attr = row.querySelector('.pod-buff-attr').value;
        const mod = row.querySelector('.pod-buff-val').value;
        if (attr !== 'nenhum') modsArr.push({ attr, mod: isNaN(parseInt(mod)) ? mod : parseInt(mod), isAdv: cat === 'vantagem' });
    });
    document.getElementById(`poder_mods_${currentPodModEditIdx}`).value = JSON.stringify(modsArr);
    fecharModalBuffPod();
    atualizarTudo();
}
