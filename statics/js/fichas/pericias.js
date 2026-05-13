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
                <button type="button" class="btn-calc-ajuda pericia-help-btn" onclick="mostrarAjudaSkill('${slug}')" title="Ver detalhes do cálculo">?</button>
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
            <button type="button" class="btn-calc-ajuda pericia-help-btn" onclick="mostrarAjudaSkill('${index}')" title="Ver detalhes do cálculo">?</button>
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

function atualizarPericias(nivel, mods, bonusItens = {}, dadosObj = {}, breakdown = null) {
    document.querySelectorAll(".skill-row").forEach(row => {
        const skillSlug = row.querySelector(".skill-bonus")?.id.replace('skill_bonus_', '');
        if (!skillSlug) return;

        const training = document.getElementById(`skill_train_${skillSlug}`)?.value;
        const selectedAttr = document.getElementById(`skill_attr_${skillSlug}`)?.value;
        const bonus = parseInt(row.querySelector(".skill-bonus")?.value) || 0;

        const advInput = document.getElementById(`skill_adv_${skillSlug}`);
        const itemAdv = (bonusItens[`adv_${skillSlug}`] || 0) + (bonusItens['adv_todas'] || 0);

        let manualAdv;
        if (advInput && advInput === document.activeElement) {
            // Editando: calcula nova base manual subtraindo bônus de itens
            manualAdv = (parseInt(advInput.value) || 0) - itemAdv;
        } else {
            // Não editando: recupera a base manual pura que está nos dados salvos
            const storedAdv = parseInt(dadosObj[`skill_adv_${skillSlug}`]);
            manualAdv = !isNaN(storedAdv) ? storedAdv : 0;
        }

        const totalAdv = manualAdv + itemAdv;

        if (advInput && advInput !== document.activeElement) {
            advInput.value = totalAdv;
        }

        // Salva sempre a BASE no objeto global
        dadosObj[`skill_adv_${skillSlug}`] = manualAdv;

        // Tooltip de Vantagens (V)
        if (advInput) {
            let advDetails = [];
            if (manualAdv !== 0) advDetails.push(`Base: ${manualAdv}`);
            if (breakdown) {
                const sources = [
                    ...(breakdown.itens[`adv_${skillSlug}`] || []),
                    ...(breakdown.itens['adv_todas'] || []),
                    ...(breakdown.poderes[`adv_${skillSlug}`] || []),
                    ...(breakdown.habilidades[`adv_${skillSlug}`] || [])
                ];
                sources.forEach(s => advDetails.push(s));
            }
            advInput.title = advDetails.length > 0 ? `Total V: ${totalAdv} (${advDetails.join(' | ')})` : "Vantagens (Dados extras)";
        }

        const attrMod = mods[selectedAttr] || 0;
        const itemSkillBonus = (bonusItens[skillSlug] || 0) + (bonusItens['todas'] || 0);

        // Remove todas as classes de destaque e adiciona a classe correspondente ao treino atual
        row.classList.remove('treinado', 'profissional', 'mestre', 'anciao');
        if (training !== 'nenhum') row.classList.add(training);

        // Destaque visual para o campo de vantagem se houver valor
        if (totalAdv > 0) advInput?.classList.add('has-advantage');
        else advInput?.classList.remove('has-advantage');

        const tBonus = {
            'nenhum': 0,
            'treinado': Math.floor(nivel / 2),
            'profissional': Math.floor(nivel / 2) + 4,
            'mestre': nivel + 4,
            'anciao': nivel + 6
        }[training] || 0;

        const total = tBonus + attrMod + bonus + itemSkillBonus;
        const display = row.querySelector(".skill-total");

        // Tooltip do Total da Perícia
        let details = [];
        // Exibe Atributo e Treino sempre, para garantir que o cálculo fique transparente
        details.push(`${selectedAttr.toUpperCase().substring(0, 3)} (Mod): ${attrMod >= 0 ? '+' : ''}${attrMod}`);
        details.push(`Treino: +${tBonus}`);

        if (bonus !== 0) details.push(`Manual: ${bonus >= 0 ? '+' : ''}${bonus}`);

        if (breakdown) {
            const skillSources = [
                ...(breakdown.itens[skillSlug] || []),
                ...(breakdown.itens['todas'] || []),
                ...(breakdown.poderes[skillSlug] || []),
                ...(breakdown.poderes['todas'] || []),
                ...(breakdown.habilidades[skillSlug] || []),
                ...(breakdown.habilidades['todas'] || [])
            ];
            skillSources.forEach(s => details.push(s));
        }

        if (display) {
            display.innerText = (total >= 0 ? "+" : "") + total;
            display.title = `Total: ${total} (${details.join(' | ')})`;
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

/**
 * Abre o modal de ajuda detalhando o cálculo da perícia e os valores de treinamento
 */
function mostrarAjudaSkill(skillSlug) {
    const bonusInput = document.getElementById(`skill_bonus_${skillSlug}`);
    const display = bonusInput?.closest('.skill-row')?.querySelector('.skill-total');

    if (!display) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) {
        alert("Erro Crítico: O Modal de Ajuda não foi encontrado no HTML desta página. Verifique se você copiou o bloco de código do modal para o final do seu arquivo .html");
        return;
    }

    const row = display.closest('.skill-row');
    const skillName = row.querySelector('.skill-name')?.textContent || row.querySelector('.skill-name-input')?.value || "Perícia";
    title.innerText = `Cálculo: ${skillName}`;

    const fullTitle = display.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Detalhes não encontrados.";
    const items = breakdownPart.split(' | ');

    // Pega o nível atual para mostrar a tabela de treino dinâmica
    const nivel = parseInt(document.getElementById('nivel')?.value) || 1;

    const formulaHtml = `
        <div style="margin-bottom: 12px; background: rgba(255,68,68,0.1); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,68,68,0.3); font-size: 0.8rem; color: #ff4444; text-align: center;">
            <strong>Fórmula:</strong> Atributo + Treino + Itens/Poderes + Manual
        </div>
    `;

    const treinoTabela = `
        <div style="margin-top: 15px; border-top: 1px dashed rgba(255,68,68,0.3); padding-top: 10px;">
            <label style="color: #ff4444; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Referência de Treino (Nível ${nivel}):</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px; font-size: 0.8rem; color: #bbb;">
                <span>• Nenhum: <strong>+0</strong></span>
                <span>• Treinado: <strong>+${Math.floor(nivel / 2)}</strong> (lvl/2)</span>
                <span>• Profissional: <strong>+${Math.floor(nivel / 2) + 4}</strong> (lvl/2 +4)</span>
                <span>• Mestre: <strong>+${nivel + 4}</strong> (lvl +4)</span>
                <span>• Ancião: <strong>+${nivel + 6}</strong> (lvl +6)</span>
            </div>
        </div>
    `;

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
            ${formulaHtml}
            ${items.map(item => `<div style="padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid #ff4444; font-size: 0.85rem;">${item}</div>`).join('')}
            ${treinoTabela}
            <div style="margin-top: 10px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 4px; color: #ff4444; font-weight: bold; font-size: 1.1rem; text-align: center;">Total: ${display.innerText}</div>
        </div>
    `;

    modal.style.display = 'flex';
}