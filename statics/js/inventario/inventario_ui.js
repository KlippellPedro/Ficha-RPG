/**
 * Lógica de Interface (Lista, Filtros e Ordenação)
 */

function atualizarEstiloRaridade(index) {
    const RARITY_ORDER = OPTIONS_RARIDADE.map(r => r.v);

    function getRarityRank(rarityValue) {
        const rank = RARITY_ORDER.indexOf(rarityValue);
        return rank === -1 ? 0 : rank; // Default to 0 (comum) if not found
    }

    const raroInput = document.getElementById(`inv_raro_${index}`);
    const nomeInput = document.getElementById(`inv_nome_${index}`);
    const catSelect = document.getElementById(`inv_cat_${index}`);
    if (!raroInput || !nomeInput || !catSelect) return;

    const raroRaw = raroInput.value;
    let itemRarity = 'comum';

    try {
        if (raroRaw && raroRaw.startsWith('{')) {
            itemRarity = JSON.parse(raroRaw).raridade || 'comum';
        } else {
            itemRarity = raroRaw || 'comum';
        }
    } catch (e) { }

    let effectiveRarity = itemRarity;

    // Se for uma arma, calcula a raridade efetiva a partir das partes
    if (catSelect.value === 'armas') {
        const caboVal = document.getElementById(`inv_cabo_${index}`)?.value;
        const baseVal = document.getElementById(`inv_base_${index}`)?.value;

        let caboRarity = 'comum';
        let baseRarity = 'comum';

        try {
            const caboData = JSON.parse(caboVal || '{}');
            if (caboData.raridade) caboRarity = caboData.raridade;
        } catch (e) { /* Ignora erros de parsing */ }

        try {
            const baseData = JSON.parse(baseVal || '{}');
            if (baseData.raridade) baseRarity = baseData.raridade;
        } catch (e) { /* Ignora erros de parsing */ }

        const itemRank = getRarityRank(effectiveRarity);
        const caboRank = getRarityRank(caboRarity);
        const baseRank = getRarityRank(baseRarity);

        const maxRank = Math.max(itemRank, caboRank, baseRank);
        effectiveRarity = RARITY_ORDER[maxRank];
    }

    const classesRaridade = ['rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-mitico', 'rarity-especial'];

    raroInput.classList.remove(...classesRaridade);
    nomeInput.classList.remove(...classesRaridade);

    raroInput.classList.add(`rarity-${effectiveRarity}`);
    nomeInput.classList.add(`rarity-${effectiveRarity}`);
}

function filtrarItens() {
    const filtroCat = document.getElementById('filter-category').value;
    const termoBusca = (document.getElementById('search-item')?.value || "").toLowerCase();
    const rows = document.querySelectorAll('.item-row');

    rows.forEach(row => {
        const index = row.dataset.index;
        const catSelect = document.getElementById(`inv_cat_${index}`);
        const nomeInput = document.getElementById(`inv_nome_${index}`);
        if (!catSelect || !nomeInput) return;

        const categoria = catSelect.value;
        const nome = nomeInput.value.toLowerCase();

        const matchCat = (filtroCat === 'todos' || categoria === filtroCat);
        const matchBusca = nome.includes(termoBusca);

        row.style.display = (matchCat && matchBusca) ? 'grid' : 'none';
    });
}

function ordenarItens() {
    const container = document.getElementById('items-container');
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('.item-row'));

    rows.sort((a, b) => {
        const isEqA = a.querySelector('.inv-checkbox')?.checked || false;
        const isEqB = b.querySelector('.inv-checkbox')?.checked || false;

        if (isEqA !== isEqB) return isEqA ? -1 : 1;

        const nomeA = a.querySelector('[id^="inv_nome_"]')?.value.toLowerCase() || "";
        const nomeB = b.querySelector('[id^="inv_nome_"]')?.value.toLowerCase() || "";
        return nomeA.localeCompare(nomeB);
    });

    rows.forEach(row => container.appendChild(row));
}

function verificarTipoItem(index) {
    const catEl = document.getElementById(`inv_cat_${index}`);
    if (!catEl) return;

    const row = catEl.closest('.item-row');
    const isEquipped = document.getElementById(`inv_eqp_${index}`)?.checked || false;
    row.classList.toggle('equipped-row', isEquipped);

    // Sincronização automática com a página de Ataques (Armas Equipadas)
    const categoria = catEl.value;
    const nome = document.getElementById(`inv_nome_${index}`)?.value || "";

    if (categoria === 'armas' && nome.trim() !== "") {
        const lowerNome = nome.trim().toLowerCase();

        // Cálculo de bônus acumulados do item (Dano, Crítico, Alcance)
        let b = { dano: 0, critico: 0, alcance: 0, tipo_dano: "" };
        const sources = [`inv_cabo_${index}`, `inv_base_${index}`, `inv_mods_item_${index}`, `inv_raro_${index}`];
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        sources.forEach(s => {
            let raw = (document.getElementById(s) ? document.getElementById(s).value : dados[s]);
            if (raw && typeof raw === 'string' && raw.startsWith('{')) {
                try {
                    const parsed = JSON.parse(raw);
                    (parsed.attributes || []).forEach(attr => {
                        if (b.hasOwnProperty(attr.attr)) b[attr.attr] += parseInt(attr.mod) || 0;
                        if (attr.attr === 'tipo_dano' && attr.mod) b.tipo_dano = attr.mod;
                    });
                } catch (e) { }
            }
        });

        const formatBonus = (val, bonus) => (bonus !== 0 && val) ? `${val}${bonus > 0 ? '+' : ''}${bonus}` : val;
        const baseTipoDano = document.getElementById(`inv_tipo_dano_${index}`)?.value || "";

        const syncData = {
            id: index,
            nome: nome,
            atk_tipo: document.getElementById(`inv_atk_tipo_${index}`)?.value || "Corpo-a-Corpo",
            tipo: document.getElementById(`inv_tipo_${index}`)?.value || "",
            dano: formatBonus(document.getElementById(`inv_dano_${index}`)?.value || "", b.dano),
            alcance: formatBonus(document.getElementById(`inv_alcance_${index}`)?.value || "", b.alcance),
            attr_mod: document.getElementById(`inv_attr_${index}`)?.value || "nenhum",
            desc: document.getElementById(`inv_desc_${index}`)?.value || "",
            critico: formatBonus(document.getElementById(`inv_critico_${index}`)?.value || "", b.critico),
            tipo_dano: b.tipo_dano || baseTipoDano,
            teste: document.getElementById(`inv_teste_${index}`)?.value || ""
        };

        // Tenta usar as funções globais se estiverem disponíveis (página de ataques)
        // Caso contrário, manipula os dados diretamente no localStorage para persistência entre páginas
        if (typeof adicionarAtaqueAutomatico === 'function' && isEquipped) {
            adicionarAtaqueAutomatico(syncData);
        } else if (typeof removerAtaqueAutomatico === 'function' && !isEquipped) {
            removerAtaqueAutomatico(nome, index);
        } else {
            if (isEquipped) {
                // Procura se já existe um ataque vinculado a este ID de inventário
                const originKey = Object.keys(dados).find(k => k.startsWith('atk_origin_') && dados[k] == index);

                let atkId;
                if (originKey) {
                    atkId = originKey.replace('atk_origin_', '');
                } else {
                    atkId = Date.now() + "_" + index;
                    dados[`atk_origin_${atkId}`] = index;
                }

                const mapping = {
                    "simples_uma_mao": "Corpo-a-Corpo", "simples_duas_maos": "Corpo-a-Corpo",
                    "marcial_uma_mao": "Corpo-a-Corpo", "marcial_duas_maos": "Corpo-a-Corpo",
                    "arco_curto": "À Distância", "arco_longo": "À Distância",
                    "besta_leve": "À Distância", "besta_pesada": "À Distância", "arremesso": "Arremesso"
                };

                // Salva ou atualiza os campos no localStorage
                dados[`atk_nome_${atkId}`] = syncData.nome;
                dados[`atk_tipo_${atkId}`] = syncData.atk_tipo || mapping[syncData.tipo] || "Outro";
                dados[`atk_teste_${atkId}`] = syncData.teste || (syncData.attr_mod !== "nenhum" ? syncData.attr_mod : "");
                dados[`atk_dano_${atkId}`] = syncData.dano;
                dados[`atk_tipo_dano_${atkId}`] = syncData.tipo_dano;
                dados[`atk_critico_${atkId}`] = syncData.critico;
                dados[`atk_alcance_${atkId}`] = syncData.alcance;
                dados[`atk_desc_${atkId}`] = syncData.desc;

                localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            } else {
                // Remove o ataque se ele existir nos dados salvos
                const atkKey = Object.keys(dados).find(k => k.startsWith('atk_nome_') && dados[k].trim().toLowerCase() === lowerNome);
                if (atkKey) {
                    const atkId = atkKey.replace('atk_nome_', '');
                    Object.keys(dados).forEach(k => { if (k.endsWith(`_${atkId}`) && k.includes('atk_')) delete dados[k]; });
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
                }
            }
        }
    }
}

function atualizarEstiloBonus(index) {
    const input = document.getElementById(`inv_mod_${index}`);
    if (!input) return;
    const val = parseInt(input.value) || 0;
    if (val > 0) input.style.color = '#4ade80';
    else if (val < 0) input.style.color = '#ff5f5f';
    else input.style.color = 'white';
}

/**
 * Remove um item do inventário e sincroniza com a página de ataques
 */
function removerItemUI(index) {
    const nomeEl = document.getElementById(`inv_nome_${index}`);
    const catEl = document.getElementById(`inv_cat_${index}`);
    const nomeItem = nomeEl?.value || "este item";

    showConfirm(`Tem certeza que deseja remover "${nomeItem}"?`, () => {
        // Lógica de remoção
        if (nomeEl && catEl) {
            const nome = nomeEl.value;
            const categoria = catEl.value;

            // Se for arma, tentamos remover o ataque associado
            if (categoria === 'armas' && nome.trim() !== "") {
                if (typeof removerAtaqueAutomatico === 'function') {
                    removerAtaqueAutomatico(nome, index);
                } else {
                    // Fallback manual para o localStorage (se não estiver na página de ataques)
                    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
                    const lowerNome = nome.trim().toLowerCase();
                    const atkKey = Object.keys(dados).find(k => k.startsWith('atk_nome_') && dados[k].trim().toLowerCase() === lowerNome);
                    if (atkKey) {
                        const atkId = atkKey.replace('atk_nome_', '');
                        Object.keys(dados).forEach(k => { if (k.endsWith(`_${atkId}`) && k.includes('atk_')) delete dados[k]; });
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
                    }
                }
            }
        }

        // Remove do localStorage as chaves específicas deste item
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.endsWith(`_${index}`) && key.startsWith('inv_')) {
                delete dados[key];
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

        // Remove o elemento da UI
        const row = document.querySelector(`.item-row[data-index="${index}"]`);
        if (row) row.remove();

        atualizarTudo();
        showNotification(`"${nomeItem}" removido com sucesso.`, "success");
    }, () => {
        showNotification("Remoção cancelada.", "info");
    }, `Remover ${nomeItem}?`);
}

function adicionarItemUI(nome = "", peso = 0, qtd = 1, desc = "", categoria = "outros", raridade = "comum", tipo = "simples_uma_mao", idIndex = null, equipado = false, attr_mod = "nenhum", val_mod = 0, alcance = "toque", dano = "", defesa_bonus = 0, efeito = "", cabo = "{}", base = "{}", defesa_penalidade = 0, modificacoes = "{}", critico = "", tipo_dano = "", teste = "", atk_tipo = "Corpo-a-Corpo") {
    const container = document.getElementById('items-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const optionsCat = [
        { v: "todos", t: "Todos os Itens" },
        { v: "armas", t: "Armas" },
        { v: "armaduras", t: "Armaduras" },
        { v: "consumiveis", t: "Consumíveis" },
        { v: "itens", t: "Itens" },
        { v: "outros", t: "Outros" }
    ];

    const row = document.createElement('div');
    row.className = 'item-row';
    if (equipado) row.classList.add('equipped-row');
    row.dataset.index = index;

    let raroObj = { raridade: 'comum', attributes: [] };
    try {
        if (typeof raridade === 'object' && raridade !== null) {
            raroObj = raridade;
        } else if (raridade && raridade.toString().startsWith('{')) {
            raroObj = JSON.parse(raridade);
        } else {
            raroObj.raridade = raridade || 'comum';
        }
    } catch (e) {
        console.warn("Erro ao processar raridade do item:", e);
    }

    const baseRarity = raroObj.raridade || 'comum';

    const escapedCabo = (typeof cabo === 'object' ? JSON.stringify(cabo) : cabo || '{}').replace(/"/g, '&quot;');
    const escapedBase = (typeof base === 'object' ? JSON.stringify(base) : base || '{}').replace(/"/g, '&quot;');
    const escapedMods = (typeof modificacoes === 'object' ? JSON.stringify(modificacoes) : modificacoes || '{}').replace(/"/g, '&quot;');
    const escapedRaro = JSON.stringify(raroObj).replace(/"/g, '&quot;');

    row.innerHTML = `
        <input type="checkbox" id="inv_eqp_${index}" class="save-input inv-checkbox" ${equipado ? 'checked' : ''} onchange="verificarTipoItem('${index}'); ordenarItens(); filtrarItens(); atualizarTudo()">
        <input type="text" id="inv_nome_${index}" class="save-input inv-input rarity-${baseRarity}" value="${nome}" placeholder="Nome do item" oninput="verificarTipoItem('${index}')" onblur="ordenarItens(); filtrarItens();">
        <select id="inv_cat_${index}" class="save-input inv-input" onchange="verificarTipoItem('${index}'); ordenarItens(); filtrarItens(); atualizarTudo()">
            ${optionsCat.map(opt => `<option value="${opt.v}" ${categoria === opt.v ? 'selected' : ''}>${opt.t}</option>`).join('')}
        </select>
        <button type="button" class="btn-open-desc" onclick="abrirModalItem('${index}')" title="Ver Detalhes">🔍</button>
        <button type="button" class="btn-remove-class" onclick="removerItemUI('${index}')">×</button>

        <div class="item-hidden-data">
            <input type="hidden" id="inv_tipo_${index}" class="save-input" value="${tipo || ''}">
            <input type="hidden" id="inv_alcance_${index}" class="save-input" value="${alcance || 'toque'}">
            <input type="hidden" id="inv_dano_${index}" class="save-input" value="${dano || ''}">
            <input type="hidden" id="inv_critico_${index}" class="save-input" value="${critico || ''}">
            <input type="hidden" id="inv_tipo_dano_${index}" class="save-input" value="${tipo_dano || ''}">
            <input type="hidden" id="inv_teste_${index}" class="save-input" value="${teste || ''}">
            <input type="hidden" id="inv_cabo_${index}" class="save-input" value="${escapedCabo}">
            <input type="hidden" id="inv_base_${index}" class="save-input" value="${escapedBase}">
            <input type="hidden" id="inv_mods_item_${index}" class="save-input" value="${escapedMods}">
            <input type="hidden" id="inv_defesa_bonus_${index}" class="save-input" value="${defesa_bonus || 0}">
            <input type="hidden" id="inv_defesa_penalidade_${index}" class="save-input" value="${defesa_penalidade || 0}">
            <input type="hidden" id="inv_atk_tipo_${index}" class="save-input" value="${atk_tipo}">
            <input type="hidden" id="inv_efeito_${index}" class="save-input" value="${efeito || ''}">
            <input type="hidden" id="inv_attr_${index}" class="save-input" value="${attr_mod || 'nenhum'}">
            <input type="hidden" id="inv_mod_${index}" class="save-input" value="${val_mod || 0}">
            <input type="hidden" id="inv_raro_${index}" class="save-input" value="${escapedRaro}">
            <input type="hidden" id="inv_peso_${index}" class="save-input item-peso" value="${peso || 0}">
            <input type="hidden" id="inv_qtd_${index}" class="save-input item-qtd" value="${qtd || 1}">
            <input type="hidden" id="inv_desc_${index}" class="save-input" value="${desc || ''}">
        </div>
    `;
    container.appendChild(row);

    verificarTipoItem(index);
    atualizarEstiloRaridade(index);
    atualizarEstiloBonus(index);
}

function limparInventario() {
    showConfirm("Tem certeza que deseja apagar TODOS os itens do seu inventário? Esta ação não pode ser desfeita.", () => {
        const container = document.getElementById('items-container');
        if (container) {
            container.innerHTML = '';
        }

        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.startsWith('inv_')) delete dados[key];
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        showNotification("Inventário limpo com sucesso.", "success");
    }, () => {
        showNotification("Limpeza do inventário cancelada.", "info");
    }, "Limpar Inventário?");
}