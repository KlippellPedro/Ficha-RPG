const listaPericias = [
    { nome: "Acrobacia", attr: "destreza" },
    { nome: "Adestramento", attr: "carisma" },
    { nome: "Atuação", attr: "carisma" },
    { nome: "Bloquear", attr: "constituicao" },
    { nome: "Conhecimento", attr: "sabedoria" },
    { nome: "Corrompimento", attr: "aura" },
    { nome: "Cura", attr: "sabedoria" },
    { nome: "Diplomacia", attr: "carisma" },
    { nome: "Enganação", attr: "carisma" },
    { nome: "Fortitude", attr: "constituicao" },
    { nome: "Furtividade", attr: "destreza" },
    { nome: "Guerra", attr: "inteligencia" },
    { nome: "Iniciativa", attr: "destreza" },
    { nome: "Intimidação", attr: "aura" },
    { nome: "Investigação", attr: "inteligencia" },
    { nome: "Luta", attr: "forca" },
    { nome: "Manipulação", attr: "aura" },
    { nome: "Misticismo", attr: "inteligencia" },
    { nome: "Percepção", attr: "sabedoria" },
    { nome: "Pilotagem", attr: "sabedoria" },
    { nome: "Pontaria", attr: "destreza" },
    { nome: "Reflexos", attr: "destreza" },
    { nome: "Religião", attr: "sabedoria" },
    { nome: "Sobrevivência", attr: "sabedoria" },
    { nome: "Vontade", attr: "sabedoria" },
];

function renderPericias() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const atributos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];

    container.innerHTML = listaPericias.map(p => {
        const slug = p.nome.toLowerCase().replace(/\s/g, '_');
        const savedAttr = salvo[`skill_attr_${slug}`] || p.attr;
        const savedTrain = salvo[`skill_train_${slug}`] || "nenhum";
        const savedBonus = salvo[`skill_bonus_${slug}`] || 0;
        const savedAdv = salvo[`skill_adv_${slug}`] || 0;

        return `
        <div class="skill-row">
            <div class="skill-total-box">
                <span class="skill-total">+0</span>
            </div>
            
            <span class="skill-name static-skill-name">${p.nome}</span>

            <select id="skill_attr_${slug}" class="save-input skill-attr-selector" onchange="atualizarTudo()">
                ${atributos.map(a => `<option value="${a}" ${a === savedAttr ? 'selected' : ''}>${a.substring(0, 3).toUpperCase()}</option>`).join('')}
            </select>

            <select id="skill_train_${slug}" class="save-input skill-training-select" onchange="atualizarTudo()">
                <option value="nenhum" ${savedTrain === 'nenhum' ? 'selected' : ''}>Nenhum</option>
                <option value="treinado" ${savedTrain === 'treinado' ? 'selected' : ''}>Treinado</option>
                <option value="profissional" ${savedTrain === 'profissional' ? 'selected' : ''}>Profissional</option>
                <option value="mestre" ${savedTrain === 'mestre' ? 'selected' : ''}>Mestre</option>
                <option value="anciao" ${savedTrain === 'anciao' ? 'selected' : ''}>Ancião</option>
            </select>
            
            <input type="number" id="skill_bonus_${slug}" class="save-input skill-bonus" value="${savedBonus}" oninput="atualizarTudo()" />

            <div class="skill-adv-container" title="Vantagens (Dados extras)">
                <span class="adv-label">V</span>
                <input type="number" id="skill_adv_${slug}" class="save-input skill-adv" value="${savedAdv}" min="0" oninput="atualizarTudo()" />
            </div>
        </div>
    `}).join('');
}

/**
 * Adiciona uma nova linha de Ofício dinamicamente.
 */
function adicionarOficioUI(nome = "Novo Ofício", attr = "inteligencia", training = "nenhum", bonus = 0, adv = 0, idIndex = null) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : `oficio_${Date.now()}`;
    const atributos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];

    const row = document.createElement('div');
    row.className = 'skill-row dynamic-skill';
    row.innerHTML = `
        <div class="skill-total-box">
            <span class="skill-total">+0</span>
        </div>
        
        <input type="text" id="skill_name_${index}" class="save-input skill-name-input" value="${nome}" placeholder="Nome do Ofício" />

        <select id="skill_attr_${index}" class="save-input skill-attr-selector" onchange="atualizarTudo()">
            ${atributos.map(a => `<option value="${a}" ${a === attr ? 'selected' : ''}>${a.substring(0, 3).toUpperCase()}</option>`).join('')}
        </select>

        <select id="skill_train_${index}" class="save-input skill-training-select" onchange="atualizarTudo()">
            <option value="nenhum" ${training === 'nenhum' ? 'selected' : ''}>Nenhum</option>
            <option value="treinado" ${training === 'treinado' ? 'selected' : ''}>Treinado</option>
            <option value="profissional" ${training === 'profissional' ? 'selected' : ''}>Profissional</option>
            <option value="mestre" ${training === 'mestre' ? 'selected' : ''}>Mestre</option>
            <option value="anciao" ${training === 'anciao' ? 'selected' : ''}>Ancião</option>
        </select>
        
        <input type="number" id="skill_bonus_${index}" class="save-input skill-bonus" value="${bonus}" oninput="atualizarTudo()" />

        <div class="skill-adv-container" title="Vantagens (Dados extras)">
            <span class="adv-label">V</span>
            <input type="number" id="skill_adv_${index}" class="save-input skill-adv" value="${adv}" min="0" oninput="atualizarTudo()" />
        </div>

        <button type="button" class="btn-remove-skill" onclick="this.closest('.skill-row').remove(); atualizarTudo();" title="Remover Perícia">×</button>
    `;
    container.appendChild(row);
}

function atualizarPericias(nivel, mods, bonusItens = {}, dadosObj = {}) {
    document.querySelectorAll(".skill-row").forEach(row => {
        const skillSlug = row.querySelector(".skill-bonus")?.id.replace('skill_bonus_', '');
        if (!skillSlug) return;

        const training = document.getElementById(`skill_train_${skillSlug}`)?.value;
        const selectedAttr = document.getElementById(`skill_attr_${skillSlug}`)?.value;
        const bonus = parseInt(row.querySelector(".skill-bonus")?.value) || 0;

        const advInput = document.getElementById(`skill_adv_${skillSlug}`);
        const itemAdv = (bonusItens[`adv_${skillSlug}`] || 0) + (bonusItens['adv_todas'] || 0);

        // Reverte o bônus do valor que veio do DOM para obter a BASE
        let valorNaTelaAdv = parseInt(advInput?.value) || 0;
        let manualAdv = valorNaTelaAdv - itemAdv;

        // Se o usuário estiver editando o campo V, define a nova base
        if (advInput && advInput === document.activeElement) {
            let valorDigitado = parseInt(advInput.value) || 0;
            manualAdv = valorDigitado - itemAdv;
        }

        const totalAdv = manualAdv + itemAdv;

        if (advInput && advInput !== document.activeElement) {
            advInput.value = totalAdv;
        }

        // Salva sempre a BASE no objeto global
        dadosObj[`skill_adv_${skillSlug}`] = manualAdv;

        const attrMod = mods[selectedAttr] || 0;
        const itemSkillBonus = (bonusItens[skillSlug] || 0) + (bonusItens['todas'] || 0);

        // Remove todas as classes de destaque e adiciona a classe correspondente ao treino atual
        row.classList.remove('treinado', 'profissional', 'mestre', 'anciao');
        if (training !== 'nenhum') row.classList.add(training);

        // Destaque visual para o campo de vantagem se houver valor
        if (totalAdv > 0) advInput?.classList.add('has-advantage');
        else advInput?.classList.remove('has-advantage');
        if (advInput) advInput.title = itemAdv > 0 ? `Bônus de Item: +${itemAdv} Vantagens` : "Vantagens (Dados extras)";

        const tBonus = {
            'nenhum': 0,
            'treinado': Math.floor(nivel / 2),
            'profissional': Math.floor(nivel / 2) + 4,
            'mestre': nivel + 4,
            'anciao': nivel + 6
        }[training] || 0;

        const total = tBonus + attrMod + bonus + itemSkillBonus;
        const display = row.querySelector(".skill-total");
        if (display) {
            display.innerText = (total >= 0 ? "+" : "") + total;
            if (itemSkillBonus > 0) display.style.color = '#4ade80';
            else if (itemSkillBonus < 0) display.style.color = '#ff5f5f';
            else display.style.color = '#ff4444';
        }
    });
}

// Inicializa as perícias ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderPericias();

    // Carrega Ofícios dinâmicos salvos
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const oficiosIds = new Set();
    Object.keys(salvo).forEach(key => {
        if (key.startsWith('skill_name_oficio_')) {
            oficiosIds.add(key.replace('skill_name_', ''));
        }
    });

    oficiosIds.forEach(id => {
        adicionarOficioUI(
            salvo[`skill_name_${id}`],
            salvo[`skill_attr_${id}`],
            salvo[`skill_train_${id}`],
            salvo[`skill_bonus_${id}`],
            salvo[`skill_adv_${id}`] || 0,
            id
        );
    });

    if (typeof atualizarTudo === 'function') atualizarTudo();
});