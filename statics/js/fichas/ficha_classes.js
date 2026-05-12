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
    // Se mudar para cientista e já for nível 5+, abre o modal
    const index = selectEl.id.split('_').pop();
    const lvl = parseInt(document.getElementById(`class_lvl_${index}`)?.value) || 0;
    if (value === 'cientista' && lvl >= 5) {
        abrirModalCientistaSubclasse(index);
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

let currentCientistaIndex = null; // New global variable for Cientista modal

function adicionarClasseUI(nome = "", lvl = 0, idIndex = null, sub = "") {
    const container = document.getElementById('classes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const options = Object.keys(CLASSES_DATA).map(key => {
        let label = CLASSES_DATA[key].nome;
        if (key === 'cientista' && sub && lvl >= 5) {
            label = `Cientista (${sub.charAt(0).toUpperCase() + sub.slice(1)})`;
        }
        return `<option value="${key}" ${nome === key ? 'selected' : ''}>${label}</option>`;
    }).join('');

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
        <input type="hidden" id="class_sub_${index}" class="save-input" value="${sub}">
        <div class="input-group">
            <label>Lvl</label>
            <input type="number" id="class_lvl_${index}" class="save-input header-input" value="${lvl}" min="0" ${maxAttr} />
        </div>
        <button type="button" class="btn-remove-class" onclick="removerClasseUI(this)">×</button>`;
    container.appendChild(row);
}

function removerClasseUI(btn) {
    const row = btn.closest('.class-row');
    const nameSelect = row.querySelector('[id^="class_name_"]');
    const index = nameSelect?.id.split('_').pop();

    if (index) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        delete dados[`class_name_${index}`];
        delete dados[`class_lvl_${index}`];
        delete dados[`class_sub_${index}`];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }

    row.remove();
    atualizarTudo();
}

// New functions for Cientista subclass modal
function abrirModalCientistaSubclasse(index) {
    currentCientistaIndex = index;
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) modal.style.display = 'flex';
}

function fecharModalCientistaSubclasse() {
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) modal.style.display = 'none';
    currentCientistaIndex = null;
}

function escolherSubclasseCientista(index, subclasse) {
    if (index === null) return;

    const subInput = document.getElementById(`class_sub_${index}`);
    const nameSel = document.getElementById(`class_name_${index}`);

    if (subInput && nameSel) {
        subInput.value = subclasse;
        formatarNomeClasseCientista(nameSel, subclasse);
    }

    fecharModalCientistaSubclasse();
    atualizarTudo();
}

function formatarNomeClasseCientista(selectEl, subclass) {
    const option = selectEl.querySelector('option[value="cientista"]');
    if (option) {
        const subTitle = subclass ? ` (${subclass.charAt(0).toUpperCase() + subclass.slice(1)})` : "";
        option.textContent = `Cientista${subTitle}`;
    }
}