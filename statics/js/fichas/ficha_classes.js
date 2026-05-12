/**
 * Lógica de gerenciamento de classes
 */
let pendingUniqueSelect = null;

function handleClassChange(selectEl) {
    const value = selectEl.value;
    if (value === 'ceifeiro_almas') {
        const rows = document.querySelectorAll('.class-row');
        if (rows.length > 1) {
            pendingUniqueSelect = selectEl;
            document.getElementById('modal-unique-class').style.display = 'flex';
            return;
        }
    }
    atualizarEstiloClasse(selectEl);
    atualizarTudo();
}

function confirmarClasseUnica() {
    if (!pendingUniqueSelect) return;
    const targetRow = pendingUniqueSelect.closest('.class-row');
    document.querySelectorAll('.class-row').forEach(row => {
        if (row !== targetRow) {
            if (typeof criarEfeitoFumaca === 'function') criarEfeitoFumaca(row);
            row.remove();
        }
    });
    atualizarEstiloClasse(pendingUniqueSelect);
    document.getElementById('modal-unique-class').style.display = 'none';
    pendingUniqueSelect = null;
    atualizarTudo();
}

function cancelarClasseUnica() {
    if (pendingUniqueSelect) pendingUniqueSelect.value = "";
    document.getElementById('modal-unique-class').style.display = 'none';
    pendingUniqueSelect = null;
    atualizarTudo();
}

function atualizarEstiloClasse(selectEl) {
    const row = selectEl.closest('.class-row');
    const index = selectEl.id.split('_').pop();
    const inputLvl = document.getElementById(`class_lvl_${index}`);

    if (inputLvl) {
        if (selectEl.value === 'ceifeiro_almas') {
            inputLvl.removeAttribute('max');
        } else {
            inputLvl.setAttribute('max', '20');
        }
    }

    row.classList.remove('special-class-row', 'ceifeiro-class-row', 'anjo-class-row', 'demonio-class-row');

    const classData = CLASSES_DATA[selectEl.value];
    if (classData && classData.isSpecial) {
        row.classList.add('special-class-row');
        if (selectEl.value === 'ceifeiro_almas') row.classList.add('ceifeiro-class-row');
        else if (selectEl.value === 'anjo') row.classList.add('anjo-class-row');
        else if (selectEl.value === 'demonio') row.classList.add('demonio-class-row');
    }
}

function adicionarClasseUI(nome = "", lvl = 0, idIndex = null) {
    const container = document.getElementById('classes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const options = Object.keys(CLASSES_DATA).map(key =>
        `<option value="${key}" ${nome === key ? 'selected' : ''}>${CLASSES_DATA[key].nome}</option>`
    ).join('');

    let rowClasses = 'class-row';
    if (CLASSES_DATA[nome]?.isSpecial) rowClasses += ' special-class-row';
    if (nome === 'ceifeiro_almas') rowClasses += ' ceifeiro-class-row';
    if (nome === 'anjo') rowClasses += ' anjo-class-row';
    if (nome === 'demonio') rowClasses += ' demonio-class-row';
    const maxAttr = nome === 'ceifeiro_almas' ? '' : 'max="20"';

    const row = document.createElement('div');
    row.className = rowClasses;
    row.innerHTML = `
        <div class="input-group">
            <label>Classe</label>
            <select id="class_name_${index}" class="save-input header-input" onchange="handleClassChange(this)">
                <option value="">Selecione...</option>
                ${options}
            </select>
        </div>
        <div class="input-group">
            <label>Lvl</label>
            <input type="number" id="class_lvl_${index}" class="save-input header-input" value="${lvl}" min="0" ${maxAttr} />
        </div>
        <button type="button" class="btn-remove-class" onclick="this.closest('.class-row').remove(); atualizarTudo();">×</button>`;
    container.appendChild(row);
}