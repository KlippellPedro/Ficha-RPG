/**
 * Lógica de gerenciamento de classes
 */

/**
 * Inicializa as classes salvas ao carregar a página.
 */
function initClasses() {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;

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
        'section-extras': false, 'section-lutador': false,
        'section-amante': false, 'section-deus': false, 'section-diplomata': false,
        'section-amigo': false, 'section-contrabandista': false, 'section-ceifeiro': false
    };

    // Marca todas as seções dinâmicas de avatar como invisíveis antes da verificação
    document.querySelectorAll('.avatar-elemental-row').forEach(row => row.dataset.visible = "false");

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
                const parts = section.split('-');
                if (parts.length < 2) return;
                const key = "show" + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
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

            // Trigger para Evolução de Avatar (50% Elemental)
            if (select.value === 'avatar' && window.verificarEvolucaoSubelemento) {
                if (data.showAvatar) renderizarInputsAvatar(index);
                window.verificarEvolucaoSubelemento(index);
            }
        }
    });

    // Remove seções de avatar que não estão mais ativas
    document.querySelectorAll('.avatar-elemental-row').forEach(row => {
        if (row.dataset.visible === "false") row.remove();
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

    // Partículas de Avatar: para se nenhuma classe avatar estiver ativa
    const temAvatar = Array.from(document.querySelectorAll('[id^="class_name_"]')).some(s => s.value === 'avatar');
    if (!temAvatar && typeof window.pararAvatarAmbient === 'function') window.pararAvatarAmbient();

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
    const className = selectEl.value;

    // Sincroniza o atributo 'value' no HTML para que seletores CSS [value="..."] funcionem
    selectEl.setAttribute('value', className);

    if (className && typeof window.loadClassCSS === 'function') window.loadClassCSS(className);

    if (inputLvl) {
        if (selectEl.value === 'ceifeiro_almas') {
            inputLvl.removeAttribute('max');
        } else {
            inputLvl.setAttribute('max', '99'); // Aumentado o limite visual para 99
        }
    }

    // Limpa todos os estilos possíveis e classes de elementos
    row.classList.remove('special-class-row', 'ceifeiro-class-row', 'anjo-class-row', 'demonio-class-row', 'cientista-lvl5-row', 'olimpo-class-row');
    Array.from(row.classList).forEach(c => { if (c.startsWith('row-element-')) row.classList.remove(c); });

    // Adiciona uma classe genérica para facilitar estilização futura (ex: class-row-avatar)
    Array.from(row.classList).forEach(c => { if (c.startsWith('row-active-')) row.classList.remove(c); });
    if (className) row.classList.add(`row-active-${className}`);

    // Lógica específica para o Despertar do Avatar
    if (className === 'avatar') {
        const lvl = parseInt(inputLvl?.value) || 0;
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const elementoEscolhido = dados[`class_avatar_element_${index}`];

        if (lvl >= 1 && window.verificarDespertarAvatar) window.verificarDespertarAvatar(index, lvl, 'avatar');

        if (elementoEscolhido) {
            // Usa subelemento para cor da row se existir
            const chaveVisual = dados[`class_avatar_subelement_${index}`] || elementoEscolhido;
            row.classList.add(`row-element-${chaveVisual}`);

            const subElemento = dados[`class_avatar_subelement_${index}`];
            const elData = window.AVATAR_ELEMENTS_DATA?.[elementoEscolhido];
            const subData = subElemento ? window.AVATAR_ELEMENTS_DATA?.[subElemento] : null;

            const suffix = subData
                ? `${elData?.nome} - ${subData.nome}`
                : (elData?.nome || elementoEscolhido);

            // Atualiza o <select> oculto
            const option = selectEl.querySelector('option[value="avatar"]');
            if (option) option.textContent = `Avatar (${suffix})`;

            // Atualiza o botão visível (substituiu o select)
            const btnVisible = document.getElementById(`class_btn_${index}`);
            if (btnVisible) {
                btnVisible.textContent = `Avatar (${suffix})`;
                btnVisible.classList.remove('empty');
            }

            // Inicia/atualiza partículas de fundo
            if (typeof window.iniciarAvatarAmbient === 'function') {
                window.iniciarAvatarAmbient(elementoEscolhido, subElemento || null);
            }
        }
    }

    const classesDB = window.CLASSES_DATA || {};
    const classData = selectEl.value ? classesDB[selectEl.value] : null;

    const isSpecialName = ['ceifeiro_almas', 'anjo', 'demonio', 'campeao', 'avatar'].includes(selectEl.value);
    if (classData?.isSpecial || isSpecialName) {
        row.classList.add('special-class-row');
        if (selectEl.value === 'ceifeiro_almas') row.classList.add('ceifeiro-class-row');
        else if (selectEl.value === 'anjo') row.classList.add('anjo-class-row');
        else if (selectEl.value === 'demonio') row.classList.add('demonio-class-row');
        else if (classData?.dlc === 'olimpo') row.classList.add('olimpo-class-row');
    }
}

function adicionarClasseUI(nome = "", lvl = 0, idIndex = null, sub = "") {
    const container = document.getElementById('classes-container');
    if (!container) return;
    const index = idIndex !== null ? idIndex : Date.now();

    const classesDB = window.CLASSES_DATA || {};
    const options = Object.keys(classesDB)
        .filter(key => !classesDB[key].dlc || isDlcAtiva(classesDB[key].dlc))
        .map(key => {
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
    else if (currentClassData?.dlc === 'olimpo') rowClasses += ' olimpo-class-row';
    const maxAttr = nome === 'ceifeiro_almas' ? '' : 'max="99"';

    const nomeExibido = nome ? (classesDB[nome]?.nome || nome) : '';

    const row = document.createElement('div');
    row.className = rowClasses;
    row.innerHTML = `
        <div class="input-group" style="flex:1; min-width:0;">
            <label>Classe</label>
            <button type="button"
                    id="class_btn_${index}"
                    class="btn-class-select${nome ? '' : ' empty'}"
                    onclick="abrirModalSelecionarClasse('${index}')">
                ${nomeExibido || 'Selecionar Classe...'}
            </button>
            <select id="class_name_${index}" class="save-input" style="display:none" onchange="handleClassChange(this)">
                <option value="">Selecione...</option>
                ${options}
            </select>
        </div>
        <input type="hidden" id="class_sub_${index}" class="save-input" value="${sub}">
        <div class="input-group">
            <label>Lvl</label>
            <input type="number" id="class_lvl_${index}" class="save-input header-input" value="${lvl}" min="0" ${maxAttr} oninput="atualizarEstiloClasse(document.getElementById('class_name_${index}')); atualizarTudo();" />
        </div>
        <button type="button" class="btn-remove-class" onclick="removerClasseUI(this)">×</button>`;
    container.appendChild(row);

    // Garante que o estilo e gatilhos especiais (como despertar do Avatar)
    // sejam aplicados imediatamente ao adicionar uma nova classe
    const select = row.querySelector('select');
    if (nome && select && typeof atualizarEstiloClasse === 'function') {
        atualizarEstiloClasse(select);
    }
}

/**
 * Abre o modal de seleção de classe para uma row específica
 */
function abrirModalSelecionarClasse(index) {
    const modal = document.getElementById('modal-class-select');
    const listContainer = document.getElementById('modal-class-select-list');
    if (!modal || !listContainer) return;

    const classesDB = window.CLASSES_DATA || {};
    const currentVal = document.getElementById(`class_name_${index}`)?.value || '';

    const grupos = {};
    Object.keys(classesDB)
        .filter(key => !classesDB[key].dlc || isDlcAtiva(classesDB[key].dlc))
        .forEach(key => {
            const data = classesDB[key];
            const grupo = data.dlc ? data.dlc.toUpperCase() : 'Base';
            if (!grupos[grupo]) grupos[grupo] = [];
            grupos[grupo].push({ key, data });
        });

    let html = '';
    Object.keys(grupos).sort((a, b) => a === 'Base' ? -1 : 1).forEach(grupo => {
        html += `<div style="font-size:0.6rem;letter-spacing:0.15em;color:var(--text-muted);text-transform:uppercase;
                             padding:8px 0 4px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:6px;
                             font-family:var(--font-heading,serif);">${grupo}</div>`;
        grupos[grupo].forEach(({ key, data }) => {
            const isSelected = key === currentVal;
            html += `
                <div class="selection-option" style="${isSelected ? 'border-color:var(--primary-color);background:var(--primary-glow);' : ''}"
                     onclick="confirmarSelecionarClasse('${index}', '${key}')">
                    <strong style="${isSelected ? 'color:var(--primary-color);' : ''}">${data.nome || key}</strong>
                    <p>${data.dlc ? 'Expansão: ' + data.dlc.toUpperCase() : 'Classe Base'}</p>
                </div>`;
        });
    });

    listContainer.innerHTML = html;
    modal.showModal();
}

/**
 * Confirma a escolha de classe no modal e atualiza a row
 */
function confirmarSelecionarClasse(index, className) {
    const select = document.getElementById(`class_name_${index}`);
    const btn = document.getElementById(`class_btn_${index}`);
    if (!select) return;

    select.value = className;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    if (btn) {
        const classesDB = window.CLASSES_DATA || {};
        const nome = classesDB[className]?.nome || className;
        btn.textContent = nome;
        btn.classList.remove('empty');
    }

    document.getElementById('modal-class-select')?.close();
    if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(select);
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

/** Renderiza dinamicamente os campos de porcentagem e manifestação para cada instância de Avatar */
function renderizarInputsAvatar(index) {
    const container = document.getElementById('avatar-sections-container');
    if (!container) return;

    let row = document.getElementById(`section-avatar-${index}`);
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const elemento = dados[`class_avatar_element_${index}`] || "???";
    const elData = window.AVATAR_ELEMENTS_DATA?.[elemento];
    const nomeMostrar = elData ? elData.nome : elemento;

    if (!row) {
        const html = `
          <div id="section-avatar-${index}" class="combat-header-row avatar-elemental-row row-element-${elemento}">
            <div class="input-group">
              <label>Porcentagem (${nomeMostrar})</label>
              <input type="text" id="avatar_porcentagem_${index}" class="save-input header-input" placeholder="0%" oninput="if(window.verificarEvolucaoSubelemento) window.verificarEvolucaoSubelemento('${index}')" />
            </div>
            <div class="input-group">
              <label>Manifestação (${nomeMostrar})</label>
              <input type="text" id="avatar_manifestacao_${index}" class="save-input header-input" placeholder="Linhas de Conhecimento" />
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        row = document.getElementById(`section-avatar-${index}`);
        
        // Popula valores salvos no LocalStorage
        const pctInput = document.getElementById(`avatar_porcentagem_${index}`);
        const manInput = document.getElementById(`avatar_manifestacao_${index}`);
        if (pctInput) pctInput.value = dados[`avatar_porcentagem_${index}`] || "";
        if (manInput) manInput.value = dados[`avatar_manifestacao_${index}`] || "";
    } else {
        // Atualiza labels caso o elemento mude
        const labels = row.querySelectorAll('label');
        if (labels[0]) labels[0].textContent = `Porcentagem (${nomeMostrar})`;
        if (labels[1]) labels[1].textContent = `Manifestação (${nomeMostrar})`;
        
        // Sincroniza o estilo visual do elemento na linha oculta
        Array.from(row.classList).forEach(c => { if(c.startsWith('row-element-')) row.classList.remove(c); });
        row.classList.add(`row-element-${elemento}`);
    }
    
    row.dataset.visible = "true";
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