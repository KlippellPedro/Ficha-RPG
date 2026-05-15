/**
 * Lógica de gerenciamento de classes
 */

/**
 * Inicializa as classes salvas ao carregar a página.
 */
function initClasses() {
    const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : "ficha_rpg_dados";
    const salvo = JSON.parse(localStorage.getItem(key)) || null;

    if (salvo) {
        const classesEncontradas = Object.keys(salvo)
            .filter(k => k.startsWith('class_name_'))
            .sort((a, b) => parseInt(a.split('_').pop()) - parseInt(b.split('_').pop()));

        if (classesEncontradas.length > 0) {
            classesEncontradas.forEach(key => {
                const idx = key.split('_').pop();
                adicionarClasseUI(salvo[key], salvo[`class_lvl_${idx}`], parseInt(idx), salvo[`class_sub_${idx}`]);

                const selectEl = document.getElementById(`class_name_${idx}`);
                if (selectEl) atualizarEstiloClasse(selectEl);
            });
        } else {
            adicionarClasseUI();
        }
    } else {
        adicionarClasseUI();
    }
}

/**
 * Controla a visibilidade de seções do cabeçalho baseadas na classe
 */
function verificarVisibilidadeClasses() {
    const ambientTypes = [];
    const visibilityMap = {
        'section-extras': false, 'section-avatar': false, 'section-lutador': false,
        'section-amante': false, 'section-deus': false, 'section-diplomata': false,
        'section-amigo': false, 'section-contrabandista': false, 'section-ceifeiro': false,
        'section-demonio': false, 'section-anjo': false
    };

    document.querySelectorAll('[id^="class_name_"]').forEach(select => {
        const classesDB = typeof CLASSES_DATA !== 'undefined' ? CLASSES_DATA : {};
        if (select.value === 'ceifeiro_almas') ambientTypes.push('soul');
        if (select.value === 'anjo') ambientTypes.push('feather');
        if (select.value === 'demonio') ambientTypes.push('ember');

        const data = classesDB[select.value];
        if (data) {
            Object.keys(visibilityMap).forEach(section => {
                const key = "show" + section.split('-')[1].charAt(0).toUpperCase() + section.split('-')[1].slice(1);
                if (data[key]) visibilityMap[section] = true;
            });
        }

        // Lógica Cientista Lvl 5
        const index = select.id.split('_').pop();
        const lvl = parseInt(document.getElementById(`class_lvl_${index}`)?.value) || 0;
        const subInput = document.getElementById(`class_sub_${index}`);
        const row = select.closest('.class-row');

        if (select.value === 'cientista' && lvl >= 5) {
            if (!subInput.value && currentCientistaIndex === null) abrirModalCientistaSubclasse(index);
            if (subInput.value) row?.classList.add('cientista-lvl5-row');
        } else {
            row?.classList.remove('cientista-lvl5-row');
        }
    });

    // Aplica visibilidade
    for (const [id, visible] of Object.entries(visibilityMap)) {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? (id === 'section-extras' ? 'flex' : 'grid') : 'none';
    }

    // Efeitos visuais globais
    const container = document.querySelector('.container');
    if (container) {
        const isDual = ambientTypes.includes('feather') && ambientTypes.includes('ember');
        container.classList.toggle('container-dual-alignment', isDual);
    }

    if (typeof gerenciarEfeitosAmbientes === 'function') gerenciarEfeitosAmbientes(ambientTypes);
    const btnAdd = document.querySelector('.btn-add-class');
    if (btnAdd) btnAdd.style.display = ambientTypes.includes('soul') ? 'none' : 'block';
}

/** Auxiliar para calcular ganho de mana vindo de classes */
function calcularManaPorClasses(mods) {
    let manaGanha = 0;
    const classesDB = typeof CLASSES_DATA !== 'undefined' ? CLASSES_DATA : {};
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = CLASSES_DATA[className];
        if (data) {
            let pmLvl = data.pm_lvl;
            // Bônus específico: Cientista Alquimista ganha mais mana por nível
            if (className === 'cientista' && lvl >= 5 && sub === 'alquimista') pmLvl = 4;

            let mod = data.pm_attr ? (mods[data.pm_attr] || 0) : 0;
            manaGanha += (lvl * (mod + pmLvl));
        }
    });
    return manaGanha;
}

/** Auxiliar para calcular ganho de vida vindo de classes */
function calcularVidaPorClasses(mods, modConDefault) {
    let vidaGanha = 0;
    const classesDB = typeof CLASSES_DATA !== 'undefined' ? CLASSES_DATA : {};
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = CLASSES_DATA[className];
        if (data) {
            let pvLvl = data.pv_lvl;
            // Bônus específico: Cientista Ferreiro ganha mais vida por nível
            if (className === 'cientista' && lvl >= 5 && sub === 'ferreiro') pvLvl = 4;

            let mod = (data.pv_attr && mods[data.pv_attr] !== undefined) ? mods[data.pv_attr] : modConDefault;
            if (data.pv_mod_half) mod = Math.floor(mod / 2);
            if (data.pv_no_mod) mod = 0;

            vidaGanha += (lvl * (mod + pvLvl));
        }
    });
    return vidaGanha;
}

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

    const classesDB = typeof CLASSES_DATA !== 'undefined' ? CLASSES_DATA : {};
    const classData = classesDB[selectEl.value];
    if (classData?.isSpecial) {
        row.classList.add('special-class-row');
        if (selectEl.value === 'ceifeiro_almas') row.classList.add('ceifeiro-class-row');
        else if (selectEl.value === 'anjo') row.classList.add('anjo-class-row');
        else if (selectEl.value === 'demonio') row.classList.add('demonio-class-row');
    }
}

function adicionarClasseUI(nome = "", lvl = 0, idIndex = null, sub = "") {
    const container = document.getElementById('classes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const classesDB = typeof CLASSES_DATA !== 'undefined' ? CLASSES_DATA : {};
    const options = Object.keys(classesDB).map(key => {
        let label = classesDB[key].nome;
        if (key === 'cientista' && sub && lvl >= 5) {
            label = `Cientista (${sub.charAt(0).toUpperCase() + sub.slice(1)})`;
        }
        return `<option value="${key}" ${nome === key ? 'selected' : ''}>${label}</option>`;
    }).join('');

    let rowClasses = 'class-row';
    const currentClassData = classesDB[nome];
    if (currentClassData?.isSpecial) rowClasses += ' special-class-row';
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
        const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : "ficha_rpg_dados";
        let dados = JSON.parse(localStorage.getItem(key)) || {};
        delete dados[`class_name_${index}`];
        delete dados[`class_lvl_${index}`];
        delete dados[`class_sub_${index}`];
        localStorage.setItem(key, JSON.stringify(dados));
    }

    row.remove();
    atualizarTudo();
}

function formatarNomeClasseCientista(selectEl, subclass) {
    const option = selectEl.querySelector('option[value="cientista"]');
    if (option) {
        const subTitle = subclass ? ` (${subclass.charAt(0).toUpperCase() + subclass.slice(1)})` : "";
        option.textContent = `Cientista${subTitle}`;
    }
}