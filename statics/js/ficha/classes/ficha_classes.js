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
        const classesDB = window.CLASSES_DATA || {};
        const data = classesDB[select.value];
        const index = select.id.split('_').pop();
        const lvl = parseInt(document.getElementById(`class_lvl_${index}`)?.value) || 0;
        const subInput = document.getElementById(`class_sub_${index}`);
        const row = select.closest('.class-row');

        if (data) {
            if (data.ambientType) ambientTypes.push(data.ambientType);

            Object.keys(visibilityMap).forEach(section => {
                const key = "show" + section.split('-')[1].charAt(0).toUpperCase() + section.split('-')[1].slice(1);
                if (data[key]) visibilityMap[section] = true;
            });

            // Lógica Genérica de Subclasse e Estilos Dinâmicos
            if (data.rowStyleClass) row?.classList.remove(data.rowStyleClass);

            if (data.subclassAt && lvl >= data.subclassAt) {
                // Só abre o modal se ainda não tiver uma subclasse definida
                if (!subInput.value && currentCientistaIndex === null) {
                    abrirModalCientistaSubclasse(index);
                }
                // Aplica o estilo visual se houver uma subclasse e uma classe de estilo definida
                if (subInput.value && data.rowStyleClass) {
                    row?.classList.add(data.rowStyleClass);
                }
            }
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
    const classesDB = window.CLASSES_DATA || {};
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = classesDB[className];
        if (data) {
            let pmLvl = data.pm_lvl;
            // Bônus específico: Cientista Químico ganha mais mana por nível
            if (className === 'cientista' && lvl >= 5 && sub === 'Químico') pmLvl = 4;

            let mod = data.pm_attr ? (mods[data.pm_attr] || 0) : 0;
            manaGanha += (lvl * (mod + pmLvl));
        }
    });
    return manaGanha;
}

/** Auxiliar para calcular ganho de vida vindo de classes */
function calcularVidaPorClasses(mods, modConDefault) {
    let vidaGanha = 0;
    const classesDB = window.CLASSES_DATA || {};
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = classesDB[className];
        if (data) {
            let pvLvl = data.pv_lvl;
            // Bônus específico: Cientista Ferreiro ganha mais vida por nível
            if (className === 'cientista' && lvl >= 5 && sub === 'Ferreiro') pvLvl = 4;

            let mod = (data.pv_attr && mods[data.pv_attr] !== undefined) ? mods[data.pv_attr] : modConDefault;
            if (data.pv_mod_half) mod = Math.floor(mod / 2);
            if (data.pv_no_mod) mod = 0;

            vidaGanha += (lvl * (mod + pvLvl));
        }
    });
    return vidaGanha;
}

function handleClassChange(selectEl) {
    const classesDB = window.CLASSES_DATA || {};
    const data = classesDB[selectEl.value];

    if (data?.isUnique) {
        const rows = document.querySelectorAll('.class-row');
        if (rows.length > 1) {
            pendingUniqueSelect = selectEl;
            if (typeof confirmarClasseUnica === 'function') confirmarClasseUnica();
            return;
        }
    }

    const index = selectEl.id.split('_').pop();
    const lvl = parseInt(document.getElementById(`class_lvl_${index}`)?.value) || 0;
    if (data?.subclassAt && lvl >= data.subclassAt) {
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

    // Limpa todos os estilos possíveis antes de aplicar o novo
    row.classList.remove('special-class-row', 'ceifeiro-class-row', 'anjo-class-row', 'demonio-class-row', 'cientista-lvl5-row');

    const classesDB = window.CLASSES_DATA || {};
    const classData = selectEl.value ? classesDB[selectEl.value] : null;

    const isSpecialName = ['ceifeiro_almas', 'anjo', 'demonio'].includes(selectEl.value);
    if (classData?.isSpecial || isSpecialName) {
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

    const classesDB = window.CLASSES_DATA || {};
    const options = Object.keys(classesDB).map(key => {
        const classData = classesDB[key];
        let label = classData.nome || key;
        if (key === 'cientista' && sub && lvl >= 5) {
            label = `Cientista (${sub.charAt(0).toUpperCase() + sub.slice(1)})`;
        }
        return `<option value="${key}" ${nome === key ? 'selected' : ''}>${label}</option>`;
    }).join('');

    let rowClasses = 'class-row';
    const currentClassData = classesDB[nome];

    const isSpecial = currentClassData?.isSpecial || ['ceifeiro_almas', 'anjo', 'demonio'].includes(nome);
    if (isSpecial) rowClasses += ' special-class-row';

    if (nome === 'ceifeiro_almas') rowClasses += ' ceifeiro-class-row';
    else if (nome === 'anjo') rowClasses += ' anjo-class-row';
    else if (nome === 'demonio') rowClasses += ' demonio-class-row';
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

/**
 * Verifica a progressão de nível de cada classe ativa e adiciona automaticamente
 * as habilidades e poderes definidos no CLASSES_DATA caso o personagem tenha o nível necessário.
 * @param {Object} dados - O objeto de dados da ficha (JSON) passado por referência.
 * @returns {boolean} - Retorna true se algo novo foi adicionado.
 */
function verificarProgressaoHabilidades(dados) {
    const classesAtivas = getClassesAtivas(dados);
    const classesDB = window.CLASSES_DATA || {};
    let mudou = false;

    // 1. Mapeia nomes existentes para evitar duplicatas (normalizando para minúsculas)
    const existentes = new Set();
    Object.keys(dados).forEach(key => {
        if (key.startsWith('hab_nome_') || key.startsWith('poder_nome_')) {
            const nome = dados[key];
            if (nome && typeof nome === 'string') {
                existentes.add(nome.trim().toLowerCase());
            }
        }
    });

    classesAtivas.forEach(cl => {
        const classData = classesDB[cl.name];
        if (!classData || !classData.progressao) return;

        // 2. Itera sobre os níveis de progressão configurados para a classe
        Object.keys(classData.progressao).forEach(lvlReqStr => {
            const lvlReq = parseInt(lvlReqStr);
            if (cl.lvl >= lvlReq) {
                const recompensa = classData.progressao[lvlReqStr];
                let recompensaAdicionada = false;

                // Processa Habilidades do Nível
                const habs = recompensa.habilidades || [];
                habs.forEach(nome => {
                    const slug = nome.trim().toLowerCase();
                    if (!existentes.has(slug) && slug !== "") {
                        const id = "auto_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                        dados[`hab_nome_${id}`] = nome;
                        dados[`hab_tipo_${id}`] = "Passiva"; // Tipo padrão
                        existentes.add(slug);
                        mudou = true;
                        recompensaAdicionada = true;
                        if (typeof showNotification === 'function') {
                            showNotification(`Nova Habilidade: ${nome} (${classData.nome})`, "success");
                        }
                    }
                });

                // Processa Poderes do Nível
                const pods = recompensa.poderes || [];
                pods.forEach(nome => {
                    const slug = nome.trim().toLowerCase();
                    if (!existentes.has(slug) && slug !== "") {
                        const id = "auto_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                        dados[`poder_nome_${id}`] = nome;
                        existentes.add(slug);
                        mudou = true;
                        recompensaAdicionada = true;
                        if (typeof showNotification === 'function') {
                            showNotification(`Novo Poder: ${nome} (${classData.nome})`, "success");
                        }
                    }
                });

                // Exibe mensagem especial se algo novo foi adicionado neste nível
                if (recompensa.msg && recompensaAdicionada) {
                    if (typeof showNotification === 'function') {
                        showNotification(recompensa.msg, "warning", 8000);
                    }
                }
            }
        });
    });

    return mudou;
}