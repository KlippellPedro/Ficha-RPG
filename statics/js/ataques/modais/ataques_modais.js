/**
 * Lógica de controle de Modais dos Ataques
 */
let atkSendoEditadoIdx = null;

function abrirModalAtk(index) {
    atkSendoEditadoIdx = index;
    const vals = {
        nome: document.getElementById(`atk_nome_${index}`).value,
        teste: document.getElementById(`atk_teste_${index}`).value,
        dano: document.getElementById(`atk_dano_${index}`).value,
        critico: document.getElementById(`atk_critico_${index}`).value,
        alcance: document.getElementById(`atk_alcance_${index}`).value,
        tipo: document.getElementById(`atk_tipo_${index}`).value,
        desc: document.getElementById(`atk_desc_${index}`).value,
        tipo_dano: document.getElementById(`atk_tipo_dano_${index}`).value
    };

    const titleEl = document.getElementById('modal-ataque-title');
    const bodyEl = document.getElementById('modal-ataque-body');
    const modalEl = document.getElementById('modal-ataque');

    if (!titleEl || !bodyEl || !modalEl) return;

    titleEl.innerText = `Estatísticas: ${vals.nome || "Ataque"}`;
    let optionsHtml = TIPOS_ATAQUE.map(t => `<option value="${t}" ${vals.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    bodyEl.innerHTML = `
        <div class="grid-2-cols" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Tipo de Ataque</label>
                <select id="modal_atk_tipo" class="inv-input">${optionsHtml}</select>
            </div>
            <div class="input-group"><label>Perícia/Teste</label>
                <input type="text" id="modal_atk_teste" class="inv-input" value="${vals.teste}">
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Dano</label><input type="text" id="modal_atk_dano" class="inv-input" value="${vals.dano}"></div>
            <div class="input-group"><label>Tipo de Dano</label><input type="text" id="modal_tipo_dano" class="inv-input" value="${vals.tipo_dano}"></div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Crítico</label><input type="text" id="modal_atk_critico" class="inv-input" value="${vals.critico}"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_atk_alcance" class="inv-input" value="${vals.alcance}"></div>
        </div>
        <div class="input-group"><label>Notas e Efeitos Especiais</label><textarea id="modal_atk_desc" class="inv-input" style="min-height: 150px">${vals.desc}</textarea></div>
    `;

    const footer = modalEl.querySelector('.modal-footer');
    if (footer) {
        footer.innerHTML = `<button type="button" class="btn-save-modal" onclick="salvarDetalhesAtk()" style="width:100%">Salvar Alterações</button>`;
    }

    modalEl.showModal();
}

function fecharModalAtk() {
    const modal = document.getElementById('modal-ataque');
    if (modal) modal.close();
    atkSendoEditadoIdx = null;
}

function salvarDetalhesAtk() {
    if (atkSendoEditadoIdx !== null) {
        const idx = atkSendoEditadoIdx;
        document.getElementById(`atk_tipo_${idx}`).value = document.getElementById('modal_atk_tipo').value;
        document.getElementById(`atk_teste_${idx}`).value = document.getElementById('modal_atk_teste').value;
        document.getElementById(`atk_dano_${idx}`).value = document.getElementById('modal_atk_dano').value;
        document.getElementById(`atk_tipo_dano_${idx}`).value = document.getElementById('modal_tipo_dano').value;
        document.getElementById(`atk_critico_${idx}`).value = document.getElementById('modal_atk_critico').value;
        document.getElementById(`atk_alcance_${idx}`).value = document.getElementById('modal_atk_alcance').value;
        document.getElementById(`atk_desc_${idx}`).value = document.getElementById('modal_atk_desc').value;
        document.getElementById(`atk_tipo_dano_${idx}`).value = document.getElementById('modal_tipo_dano').value;

        if (typeof sincronizarAtaqueComInventario === 'function') {
            sincronizarAtaqueComInventario(idx);
        }
        fecharModalAtk();
        atualizarTudo();
        if (typeof filtrarAtaques === 'function') {
            filtrarAtaques();
        }
    }
}