/** Editor detalhado das notas e seus tópicos. */
let notaSendoEditadaIdx = null;

function criarBotaoNota(text, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', handler);
    return button;
}

function abrirModalNota(index) {
    const titleInput = document.getElementById(`nota_titulo_${index}`);
    const typeInput = document.getElementById(`nota_tipo_${index}`);
    const descriptionInput = document.getElementById(`nota_desc_${index}`);
    const fieldsInput = document.getElementById(`nota_campos_${index}`);
    const modal = document.getElementById('modal-nota');
    const titleElement = document.getElementById('modal-nota-title');
    const body = document.getElementById('modal-nota-body');
    if (!titleInput || !typeInput || !descriptionInput || !fieldsInput || !modal || !titleElement || !body) return;

    notaSendoEditadaIdx = String(index);
    const date = document.getElementById(`nota_data_${index}`)?.value || "";
    let fields = [];
    try {
        const parsed = JSON.parse(fieldsInput.value || "[]");
        fields = Array.isArray(parsed) ? parsed : [];
    } catch {
        fields = [];
    }

    modal.classList.add('nota-editor-dialog');
    modal.setAttribute('aria-labelledby', 'modal-nota-title');
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.maxWidth = '960px';
        modalContent.style.width = 'min(94vw, 960px)';
    }

    const titleCopy = document.createElement('span');
    titleCopy.textContent = titleInput.value ? `Diário — ${titleInput.value}` : "Nova nota";
    const dateCopy = document.createElement('small');
    dateCopy.className = 'nota-modal-date';
    dateCopy.textContent = date;
    titleElement.replaceChildren(titleCopy, dateCopy);

    const editor = document.createElement('div');
    editor.className = 'diario-container';

    const categoryField = document.createElement('label');
    categoryField.className = 'nota-modal-field';
    const categoryLabel = document.createElement('span');
    categoryLabel.className = 'diario-label';
    categoryLabel.textContent = "Categoria ou etiqueta";
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'modal_nota_tipo';
    categoryInput.className = 'inv-input';
    categoryInput.placeholder = 'Ex.: Lore, Missão, Personagem...';
    categoryInput.value = typeInput.value;
    categoryField.append(categoryLabel, categoryInput);

    const contentField = document.createElement('label');
    contentField.className = 'nota-modal-field nota-modal-main-field';
    const contentHeading = document.createElement('span');
    contentHeading.className = 'nota-modal-field-heading';
    const contentLabel = document.createElement('span');
    contentLabel.className = 'diario-label';
    contentLabel.textContent = "Anotações principais";
    const expandMain = criarBotaoNota('Expandir ↗', 'btn-expand-field', () => abrirEditorTexto('modal_nota_desc', 'Anotações principais'));
    contentHeading.append(contentLabel, expandMain);
    const contentInput = document.createElement('textarea');
    contentInput.id = 'modal_nota_desc';
    contentInput.className = 'inv-input diario-escrita';
    contentInput.placeholder = 'Escreva aqui os detalhes da aventura...';
    contentInput.value = descriptionInput.value;
    contentField.append(contentHeading, contentInput);
    editor.append(categoryField, contentField);

    const topicsSection = document.createElement('section');
    topicsSection.className = 'nota-topics-section';
    const topicsHeading = document.createElement('div');
    topicsHeading.className = 'nota-topics-heading';
    const topicsCopy = document.createElement('div');
    const topicsKicker = document.createElement('span');
    topicsKicker.className = 'page-section-eyebrow';
    topicsKicker.textContent = "Informações extras";
    const topicsTitle = document.createElement('h4');
    topicsTitle.textContent = "Tópicos da nota";
    topicsCopy.append(topicsKicker, topicsTitle);
    const addTopic = criarBotaoNota('+ Adicionar tópico', 'btn-add-note-field', () => adicionarCampoDinamico());
    topicsHeading.append(topicsCopy, addTopic);

    const topicsContainer = document.createElement('div');
    topicsContainer.id = 'custom-fields-container';
    topicsContainer.className = 'custom-fields-container';
    topicsSection.append(topicsHeading, topicsContainer);

    const actions = document.createElement('div');
    actions.className = 'modal-footer nota-modal-actions';
    actions.append(
        criarBotaoNota('Cancelar', 'btn-modal-secondary', fecharModalNota),
        criarBotaoNota('Salvar no diário', 'btn-save-modal', salvarDetalhesNota)
    );

    body.className = 'modal-body nota-modal-body';
    body.replaceChildren(editor, topicsSection, actions);
    fields.forEach(field => adicionarCampoDinamico(field?.label || "", field?.valor || ""));

    modal.addEventListener('close', () => { notaSendoEditadaIdx = null; }, { once: true });
    if (!modal.open) modal.showModal();
}

function adicionarCampoDinamico(label = "", valor = "") {
    const container = document.getElementById('custom-fields-container');
    if (!container) return null;

    const fieldId = `cf_val_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const row = document.createElement('article');
    row.className = 'custom-field-row';
    row.dataset.isBlock = "true";

    const heading = document.createElement('div');
    heading.className = 'custom-field-heading';
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'inv-input field-label';
    labelInput.placeholder = 'Título do tópico...';
    labelInput.value = label;
    const expand = criarBotaoNota('Expandir ↗', 'btn-expand-field', () => abrirEditorTexto(fieldId, labelInput.value || 'Editando tópico'));
    const remove = criarBotaoNota('×', 'btn-remove-class', () => row.remove());
    remove.setAttribute('aria-label', 'Remover tópico');
    heading.append(labelInput, expand, remove);

    const valueInput = document.createElement('textarea');
    valueInput.id = fieldId;
    valueInput.className = 'inv-input field-value';
    valueInput.rows = 3;
    valueInput.placeholder = 'Detalhes deste tópico...';
    valueInput.value = valor;
    row.append(heading, valueInput);
    container.appendChild(row);
    return row;
}

function adicionarTopicoExpandido() {
    const row = adicionarCampoDinamico();
    row?.querySelector('.field-label')?.focus();
}

function fecharModalNota() {
    const modal = document.getElementById('modal-nota');
    if (modal?.open) fecharDialogoAnimado(modal);
}

function salvarDetalhesNota() {
    if (notaSendoEditadaIdx === null) return;
    const index = notaSendoEditadaIdx;
    const typeTarget = document.getElementById(`nota_tipo_${index}`);
    const descriptionTarget = document.getElementById(`nota_desc_${index}`);
    const fieldsTarget = document.getElementById(`nota_campos_${index}`);
    const typeSource = document.getElementById('modal_nota_tipo');
    const descriptionSource = document.getElementById('modal_nota_desc');
    if (!typeTarget || !descriptionTarget || !fieldsTarget || !typeSource || !descriptionSource) return;

    typeTarget.value = typeSource.value;
    descriptionTarget.value = descriptionSource.value;

    const fields = [...document.querySelectorAll('#custom-fields-container .custom-field-row')]
        .map(row => ({
            label: row.querySelector('.field-label')?.value || "",
            valor: row.querySelector('.field-value')?.value || "",
            isBlock: row.dataset.isBlock === "true"
        }))
        .filter(field => field.label.trim() || field.valor.trim());
    fieldsTarget.value = JSON.stringify(fields);

    atualizarResumoNota(index);
    atualizarTudo();
    filtrarNotas();
    if (typeof showNotification === 'function') showNotification("Nota salva no diário.", "success");
    fecharModalNota();
}

function limparNotas() {
    showConfirm("Apagar todas as suas anotações?", () => {
        document.getElementById('notas-container')?.replaceChildren();
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.startsWith('nota_')) delete dados[key];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        localStorage.removeItem(window.STORAGE_KEY_NOTAS_ORDER);
        atualizarTudo();
        filtrarNotas();
        showNotification("Todas as anotações foram removidas.", "success");
    }, () => {
        showNotification("Limpeza de anotações cancelada.", "info");
    }, "Limpar anotações?");
}
