/**
 * Lógica de controle de Modais das Notas
 */
let notaSendoEditadaIdx = null;

function abrirModalNota(index) {
    notaSendoEditadaIdx = index;
    const titulo = document.getElementById(`nota_titulo_${index}`).value;
    const tipo = document.getElementById(`nota_tipo_${index}`).value;
    const desc = document.getElementById(`nota_desc_${index}`).value;
    const camposRaw = document.getElementById(`nota_campos_${index}`).value;
    const data = document.getElementById(`nota_data_${index}`)?.value || "";

    let campos = [];
    try { campos = JSON.parse(camposRaw || "[]"); } catch (e) { campos = []; }

    const titleEl = document.getElementById('modal-nota-title');
    const bodyEl = document.getElementById('modal-nota-body');
    const modalEl = document.getElementById('modal-nota');

    if (!titleEl || !bodyEl || !modalEl) return;

    titleEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: 35px;">
            <span>Diário: ${titulo || "Nova Nota"}</span>
            <small style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">${data}</small>
        </div>
    `;

    bodyEl.innerHTML = `
        <div class="input-group">
            <label style="color: var(--primary-color); font-size: 0.7rem; letter-spacing: 1px;">CATEGORIA / ETIQUETA</label>
            <input type="text" id="modal_nota_tipo" class="inv-input" value="${tipo}" placeholder="Ex: Lore, Personagem, Alvo...">
        </div>
        <div class="input-group">
            <label style="color: var(--primary-color); font-size: 0.7rem; letter-spacing: 1px;">ANOTAÇÃO</label>
            <textarea id="modal_nota_desc" class="inv-input" style="min-height: 300px; line-height: 1.6; font-size: 1.05rem; padding: 15px; background: rgba(0,0,0,0.2);">${desc}</textarea>
        </div>

        <div class="section-divider">Campos Personalizados</div>
        <div id="custom-fields-container"></div>
        <button type="button" class="btn-add-class" style="width: 100%; margin-top: 10px;" onclick="adicionarCampoDinamico()">+ Adicionar Campo Flexível</button>

        <div class="modal-footer" style="margin-top: 20px;">
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesNota()" style="width:100%">Salvar no Diário</button>
        </div>
    `;

    const container = document.getElementById('custom-fields-container');
    if (campos.length > 0) {
        campos.forEach(c => adicionarCampoDinamico(c.label, c.valor));
    } else {
        adicionarCampoDinamico();
    }

    document.getElementById('modal-nota').style.display = 'flex';
}

function adicionarCampoDinamico(label = "", valor = "") {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.innerHTML = `
        <input type="text" class="inv-input field-label" placeholder="Nome do campo" value="${label}" style="flex: 1;">
        <input type="text" class="inv-input field-value" placeholder="Informação" value="${valor}" style="flex: 2;">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function fecharModalNota() {
    document.getElementById('modal-nota').style.display = 'none';
    notaSendoEditadaIdx = null;
}

function salvarDetalhesNota() {
    if (notaSendoEditadaIdx === null) return;
    const idx = notaSendoEditadaIdx;

    document.getElementById(`nota_tipo_${idx}`).value = document.getElementById('modal_nota_tipo').value;
    document.getElementById(`nota_desc_${idx}`).value = document.getElementById('modal_nota_desc').value;

    const rows = document.querySelectorAll('.custom-field-row');
    const camposArr = [];
    rows.forEach(row => {
        const l = row.querySelector('.field-label').value;
        const v = row.querySelector('.field-value').value;
        if (l.trim() || v.trim()) camposArr.push({ label: l, valor: v });
    });

    document.getElementById(`nota_campos_${idx}`).value = JSON.stringify(camposArr);

    fecharModalNota();
    atualizarTudo();
    if (typeof filtrarNotas === 'function') filtrarNotas();
}

function limparNotas() {
    showConfirm("Apagar todas as suas anotações?", () => {
        document.getElementById('notas-container').innerHTML = '';
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(k => { if (k.startsWith('nota_')) delete dados[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        filtrarNotas();
        showNotification("Todas as anotações foram removidas.", "success");
    }, () => {
        showNotification("Limpeza de anotações cancelada.", "info");
    }, "Limpar Anotações?");
}