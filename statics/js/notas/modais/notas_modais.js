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
        <div class="diario-container">
            <label class="diario-label">Categoria / Etiqueta</label>
            <input type="text" id="modal_nota_tipo" class="inv-input" value="${tipo}" placeholder="Ex: Lore, Personagem, Alvo...">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: -15px;">
                <label class="diario-label">Anotações Principais</label>
                <button type="button" class="btn-expand-field" onclick="abrirEditorTexto('modal_nota_desc', 'Anotações Principais')" style="margin-bottom: 5px;">Expandir ↗</button>
            </div>
            <textarea id="modal_nota_desc" class="inv-input diario-escrita" placeholder="Escreva aqui os detalhes da sua aventura...">${desc}</textarea>
        </div>

        <div class="section-divider">Tópicos e Informações Extras</div>
        <div id="custom-fields-container" style="display: flex; flex-direction: column; gap: 15px;"></div>
        
        <div class="notes-modal-actions" style="margin-top: 15px;">
            <button type="button" class="btn-add-note-field" onclick="adicionarTopicoExpandido()">+ Adicionar Novo Tópico</button>
        </div>

        <div class="modal-footer" style="margin-top: 20px;">
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesNota()" style="width:100%">Salvar no Diário</button>
        </div>
    `;

    const container = document.getElementById('custom-fields-container');
    if (campos.length > 0) {
        campos.forEach(c => adicionarCampoDinamico(c.label, c.valor));
    }

    document.getElementById('modal-nota').style.display = 'flex';
}

function adicionarCampoDinamico(label = "", valor = "") {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;

    const fieldId = 'cf_val_' + Date.now() + Math.floor(Math.random() * 1000);
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.dataset.isBlock = "true";

    row.innerHTML = `
        <input type="text" class="inv-input field-label" placeholder="Título do tópico..." value="${label}" style="flex: 1; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <button type="button" class="btn-expand-field" onclick="abrirEditorTexto('${fieldId}', 'Editando Tópico')" title="Expandir Conteúdo">↗</button>
        <button type="button" class="btn-remove-class" onclick="this.closest('.custom-field-row').remove()">×</button>
        <textarea id="${fieldId}" class="field-value" style="display: none;">${valor}</textarea>
    `;
    container.appendChild(row);
}

function adicionarTopicoExpandido() {
    adicionarCampoDinamico();
    const textareas = document.querySelectorAll('#custom-fields-container textarea');
    if (textareas.length === 0) return;
    const lastId = textareas[textareas.length - 1].id;
    abrirEditorTexto(lastId, "Novo Tópico Detalhado");
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
        const isBlock = row.dataset.isBlock === "true";
        if (l.trim() || v.trim()) camposArr.push({ label: l, valor: v, isBlock });
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