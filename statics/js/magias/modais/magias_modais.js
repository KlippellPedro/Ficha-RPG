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

    document.getElementById('modal-mag-title').innerText = `Grimório: ${vals.nome || "Nova Magia"}`;
    let optionsHtml = TIPOS_MAGIA.map(t => `<option value="${t}" ${vals.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    document.getElementById('modal-mag-body').innerHTML = `
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
        <div class="input-group"><label>Efeito da Magia</label><textarea id="modal_mag_desc" class="inv-input" style="min-height: 200px">${vals.desc}</textarea></div>
    `;

    const modal = document.getElementById('modal-mag');
    const footer = modal ? modal.querySelector('.modal-footer') : null;
    if (footer) {
        footer.style.justifyContent = 'space-between';
        footer.innerHTML = `
            <button type="button" class="btn-use-skill" onclick="usarMagia('${index}')">Usar Magia</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesMag()">Salvar no Grimório</button>
        `;
    }

    modal.style.display = 'flex';
    atualizarCorNivel('modal');
}

function fecharModalMag() {
    document.getElementById('modal-mag').style.display = 'none';
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