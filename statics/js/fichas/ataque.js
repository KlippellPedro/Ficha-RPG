let atkSendoEditadoIdx = null;
const TIPOS_ATAQUE = ["Corpo-a-Corpo", "À Distância", "Arremesso", "Magia", "Outro"];

// Mapeamento de tipos de arma do inventário para tipos de ataque
const INVENTORY_WEAPON_TYPE_TO_ATTACK_TYPE = {
    "simples_uma_mao": "Corpo-a-Corpo",
    "simples_duas_maos": "Corpo-a-Corpo",
    "marcial_uma_mao": "Corpo-a-Corpo",
    "marcial_duas_maos": "Corpo-a-Corpo",
    "arco_curto": "À Distância",
    "arco_longo": "À Distância",
    "besta_leve": "À Distância",
    "besta_pesada": "À Distância",
    "arremesso": "Arremesso",
};

function adicionarAtaqueUI(nome = "", teste = "", dano = "", critico = "", alcance = "", tipo = "Corpo-a-Corpo", desc = "", idIndex = null, tipo_dano = "", originIndex = "") {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row atk-row-grid';
    row.dataset.index = index;

    row.innerHTML = `
        <input type="text" id="atk_nome_${index}" class="save-input inv-input" placeholder="Arma/Ataque" value="${nome}" oninput="sincronizarAtaqueComInventario('${index}')">
        <input type="text" id="atk_teste_${index}" class="save-input inv-input" placeholder="Ex: Luta" value="${teste}">
        <input type="text" id="atk_dano_${index}" class="save-input inv-input" placeholder="Ex: 1d8+5" value="${dano}">
        <input type="text" id="atk_tipo_dano_${index}" class="save-input inv-input" placeholder="Ex: Cortante" value="${tipo_dano}" oninput="sincronizarAtaqueComInventario('${index}')">
        <input type="text" id="atk_critico_${index}" class="save-input inv-input" placeholder="Ex: 19/x3" value="${critico}">
        <input type="text" id="atk_alcance_${index}" class="save-input inv-input" placeholder="Ex: Curto" value="${alcance}">
        
        <button type="button" class="btn-open-desc" onclick="abrirModalAtk('${index}')">🔍</button>
        <button type="button" class="btn-open-desc" onclick="duplicarAtaque('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerAtaque(this)">×</button>

        <div style="display:none">
            <input type="hidden" id="atk_origin_${index}" class="save-input" value="${originIndex}">
            <input type="hidden" id="atk_tipo_${index}" class="save-input" value="${tipo}">
            <textarea id="atk_desc_${index}" class="save-input">${desc}</textarea>
        </div>
    `;

    container.appendChild(row);
    if (idIndex === null) {
        atualizarTudo();
        filtrarAtaques();
    }
}

function abrirModalAtk(index) {
    atkSendoEditadoIdx = index;
    const vals = {
        nome: document.getElementById(`atk_nome_${index}`).value,
        teste: document.getElementById(`atk_teste_${index}`).value,
        dano: document.getElementById(`atk_dano_${index}`).value,
        critico: document.getElementById(`atk_critico_${index}`).value,
        alcance: document.getElementById(`atk_alcance_${index}`).value,
        tipo: document.getElementById(`atk_tipo_${index}`).value,
        desc: document.getElementById(`atk_desc_${index}`).value,
        tipo_dano: document.getElementById(`atk_tipo_dano_${index}`).value
    };

    document.getElementById('modal-atk-title').innerText = `Estatísticas: ${vals.nome || "Ataque"}`;
    let optionsHtml = TIPOS_ATAQUE.map(t => `<option value="${t}" ${vals.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    document.getElementById('modal-atk-body').innerHTML = `
        <div class="grid-2-cols" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Tipo de Ataque</label>
                <select id="modal_atk_tipo" class="inv-input">${optionsHtml}</select>
            </div>
            <div class="input-group"><label>Perícia/Teste</label>
                <input type="text" id="modal_atk_teste" class="inv-input" value="${vals.teste}">
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Dano</label><input type="text" id="modal_atk_dano" class="inv-input" value="${vals.dano}"></div>
            <div class="input-group"><label>Tipo de Dano</label><input type="text" id="modal_tipo_dano" class="inv-input" value="${vals.tipo_dano}"></div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Crítico</label><input type="text" id="modal_atk_critico" class="inv-input" value="${vals.critico}"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_atk_alcance" class="inv-input" value="${vals.alcance}"></div>
        </div>
        <div class="input-group"><label>Notas e Efeitos Especiais</label><textarea id="modal_atk_desc" class="inv-input" style="min-height: 150px">${vals.desc}</textarea></div>
        <div class="modal-footer">
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesAtk()" style="width:100%">Salvar Alterações</button>
        </div>
    `;
    document.getElementById('modal-atk').style.display = 'flex';
}

function fecharModalAtk() {
    document.getElementById('modal-atk').style.display = 'none';
    atkSendoEditadoIdx = null;
}

function salvarDetalhesAtk() {
    if (atkSendoEditadoIdx !== null) {
        const idx = atkSendoEditadoIdx;
        document.getElementById(`atk_tipo_${idx}`).value = document.getElementById('modal_atk_tipo').value;
        document.getElementById(`atk_teste_${idx}`).value = document.getElementById('modal_atk_teste').value;
        document.getElementById(`atk_dano_${idx}`).value = document.getElementById('modal_atk_dano').value;
        document.getElementById(`atk_tipo_dano_${idx}`).value = document.getElementById('modal_tipo_dano').value;
        document.getElementById(`atk_critico_${idx}`).value = document.getElementById('modal_atk_critico').value;
        document.getElementById(`atk_alcance_${idx}`).value = document.getElementById('modal_atk_alcance').value;
        document.getElementById(`atk_desc_${idx}`).value = document.getElementById('modal_atk_desc').value;
        document.getElementById(`atk_tipo_dano_${idx}`).value = document.getElementById('modal_tipo_dano').value;

        sincronizarAtaqueComInventario(idx);
        fecharModalAtk();
        atualizarTudo();
        filtrarAtaques();
    }
}

function duplicarAtaque(index) {
    adicionarAtaqueUI(
        document.getElementById(`atk_nome_${index}`).value + " (Cópia)",
        document.getElementById(`atk_teste_${index}`).value,
        document.getElementById(`atk_dano_${index}`).value,
        document.getElementById(`atk_critico_${index}`).value,
        document.getElementById(`atk_alcance_${index}`).value,
        document.getElementById(`atk_tipo_${index}`).value,
        document.getElementById(`atk_desc_${index}`).value,
        null,
        document.getElementById(`atk_tipo_dano_${index}`).value,
        document.getElementById(`atk_origin_${index}`).value
    );
}

/**
 * Sincroniza mudanças feitas na página de Ataque de volta para o Inventário
 * Sincroniza Nome, Descrição e Tipo de Dano.
 * Nota: Dano e Crítico não são sincronizados de volta para evitar duplicação de bônus matemáticos.
 */
function sincronizarAtaqueComInventario(atkId) {
    const originId = document.getElementById(`atk_origin_${atkId}`)?.value;
    if (!originId) return;

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const novoNome = document.getElementById(`atk_nome_${atkId}`).value;
    const novaDesc = document.getElementById(`atk_desc_${atkId}`).value;
    const novoTipoDano = document.getElementById(`atk_tipo_dano_${atkId}`)?.value || "";

    // Atualiza apenas se houver mudança e o item existir no inventário
    if (dados[`inv_nome_${originId}`] !== undefined) {
        dados[`inv_nome_${originId}`] = novoNome;
        dados[`inv_desc_${originId}`] = novaDesc;
        dados[`inv_tipo_dano_${originId}`] = novoTipoDano;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
}

function removerAtaque(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.includes(`atk_`) && k.endsWith(`_${index}`)) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarAtaques();
}

function limparAtaques() {
    if (!confirm("Remover todos os registros de ataques?")) return;
    document.getElementById('ataques-container').innerHTML = '';
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.startsWith('atk_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarAtaques();
}

function resetarFiltrosAtaque() {
    document.getElementById('search-ataque').value = '';
    document.getElementById('filter-ataque-tipo').value = 'todos';
    filtrarAtaques();
    showNotification("Filtros limpos", "info", 2000);
}

/**
 * Adiciona ou atualiza um ataque automaticamente com base em uma arma equipada.
 * @param {object} itemData - Dados da arma do inventário.
 */
function adicionarAtaqueAutomatico(itemData) {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    const attackName = itemData.nome.trim();
    if (!attackName) return; // Não adiciona ataques sem nome

    // Verifica se já existe um ataque com este nome
    let existingAttackRow = null;
    const originId = itemData.id;

    document.querySelectorAll('#ataques-container .item-row').forEach(row => {
        const id = row.dataset.index;
        const originInput = document.getElementById(`atk_origin_${id}`);
        if (originInput && originInput.value == originId) {
            existingAttackRow = row;
        }
    });

    const attackType = itemData.atk_tipo || INVENTORY_WEAPON_TYPE_TO_ATTACK_TYPE[itemData.tipo] || "Outro";

    if (existingAttackRow) {
        // Atualiza o ataque existente
        const id = existingAttackRow.dataset.index;
        document.getElementById(`atk_nome_${id}`).value = attackName;
        document.getElementById(`atk_teste_${id}`).value = itemData.teste || (itemData.attr_mod !== "nenhum" ? itemData.attr_mod : "");
        document.getElementById(`atk_dano_${id}`).value = itemData.dano;
        document.getElementById(`atk_tipo_dano_${id}`).value = itemData.tipo_dano;
        document.getElementById(`atk_critico_${id}`).value = itemData.critico;
        document.getElementById(`atk_alcance_${id}`).value = itemData.alcance;
        document.getElementById(`atk_tipo_${id}`).value = attackType;
        document.getElementById(`atk_desc_${id}`).value = itemData.desc;
    } else {
        // Adiciona um novo ataque
        adicionarAtaqueUI(
            attackName,
            itemData.teste || (itemData.attr_mod !== "nenhum" ? itemData.attr_mod : ""), // Usa o campo manual ou o atributo do item
            itemData.dano,
            itemData.critico,
            itemData.alcance,
            attackType,
            itemData.desc,
            null,
            itemData.tipo_dano,
            itemData.id
        );
    }
    atualizarTudo(); // Atualiza o estado global e salva
}

/**
 * Remove um ataque automaticamente quando a arma é desequipada.
 * @param {string} itemName - Nome da arma (para fallback).
 * @param {string} originId - ID da arma no inventário.
 */
function removerAtaqueAutomatico(itemName, originId) {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    document.querySelectorAll('#ataques-container .item-row').forEach(row => {
        const id = row.dataset.index;
        const originInput = document.getElementById(`atk_origin_${id}`);
        // Verifica pelo ID de origem primeiro, depois pelo nome como fallback
        if ((originInput && originInput.value == originId) || (document.getElementById(`atk_nome_${id}`)?.value === itemName)) {
            removerAtaque(row.querySelector('.btn-remove-class')); // Reutiliza a função de remover existente
        }
    });
}

/**
 * Integra bônus de Atributos, Perícias e Itens nos campos de Ataque
 */
function atualizarAtaques(nivel, mods, bonusItens) {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // Coleta nomes de todas as armas equipadas no inventário
    const equippedWeapons = new Set();
    Object.keys(dados).forEach(key => {
        if (key.startsWith('inv_nome_')) {
            const id = key.replace('inv_nome_', '');
            if (dados[`inv_cat_${id}`] === 'armas' && dados[`inv_eqp_${id}`] === true) {
                equippedWeapons.add(dados[key].trim().toLowerCase());
            }
        }
    });

    document.querySelectorAll('#ataques-container .item-row').forEach(row => {
        const id = row.dataset.index;
        const nomeInput = document.getElementById(`atk_nome_${id}`);
        const testeInput = document.getElementById(`atk_teste_${id}`);
        const danoInput = document.getElementById(`atk_dano_${id}`);
        const tipo = dados[`atk_tipo_${id}`];

        // Lógica de destaque para arma não equipada
        if (nomeInput) {
            const atkName = nomeInput.value.trim().toLowerCase();
            // Apenas destaca tipos físicos (Corpo-a-Corpo, Distância, Arremesso)
            const isPhysical = ["Corpo-a-Corpo", "À Distância", "Arremesso"].includes(tipo);
            const notEquipped = isPhysical && atkName !== "" && !equippedWeapons.has(atkName);

            row.classList.toggle('weapon-not-equipped', notEquipped);
            if (notEquipped) row.title = "Aviso: Esta arma não está equipada no inventário.";
        }

        if (!testeInput || !danoInput) return;

        // 1. Lógica para o campo de Teste (Perícias)
        const valorTeste = testeInput.value.trim().toLowerCase();
        const slug = valorTeste.replace(/\s/g, '_');

        const training = dados[`skill_train_${slug}`];
        const attrVinculado = dados[`skill_attr_${slug}`];

        if (training && attrVinculado) {
            const attrMod = mods[attrVinculado] || 0;
            const itemBonus = bonusItens[slug] || 0;
            const profBonus = {
                'nenhum': 0, 'treinado': Math.floor(nivel / 2), 'profissional': Math.floor(nivel / 2) + 4,
                'mestre': nivel + 4, 'anciao': nivel + 6
            }[training] || 0;

            const total = profBonus + attrMod + itemBonus;
            testeInput.title = `Total Calculado: ${total >= 0 ? '+' : ''}${total}\n(${attrVinculado.substring(0, 3).toUpperCase()} ${attrMod >= 0 ? '+' : ''}${attrMod} | Treino +${profBonus} | Itens +${itemBonus})`;

            if (itemBonus > 0) testeInput.style.color = '#4ade80';
            else if (itemBonus < 0) testeInput.style.color = '#ff5f5f';
            else testeInput.style.color = 'white';
        } else {
            testeInput.title = "";
            testeInput.style.color = 'white';
        }

        // 2. Lógica para o campo de Dano (Atributos)
        const valorDano = danoInput.value.toLowerCase();
        let infoDano = "";
        ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"].forEach(a => {
            if (valorDano.includes(a.substring(0, 3)) || valorDano.includes(a)) {
                const mod = mods[a] || 0;
                infoDano += `${a.substring(0, 3).toUpperCase()}: ${mod >= 0 ? '+' : ''}${mod}  `;
            }
        });
        danoInput.title = infoDano ? "Bônus de Atributo: " + infoDano : "";
    });
}

function filtrarAtaques() {
    const termo = document.getElementById('search-ataque').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-ataque-tipo').value;
    let contador = 0;

    document.querySelectorAll('#ataques-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`atk_nome_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`atk_tipo_${index}`)?.value || "";

        const matchesNome = nome.includes(termo);
        const matchesTipo = filtroTipo === 'todos' || tipo === filtroTipo;
        const visible = matchesNome && matchesTipo;

        row.style.display = visible ? 'grid' : 'none';
        if (visible) contador++;
    });

    const counterEl = document.getElementById('ataques-counter');
    if (counterEl) counterEl.innerText = `Ataques visíveis: ${contador}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('atk_nome_'))
        .map(k => k.replace('atk_nome_', ''))
        .sort((a, b) => a - b);

    indices.forEach(idx => {
        adicionarAtaqueUI(
            salvo[`atk_nome_${idx}`],
            salvo[`atk_teste_${idx}`],
            salvo[`atk_dano_${idx}`],
            salvo[`atk_critico_${idx}`],
            salvo[`atk_alcance_${idx}`],
            salvo[`atk_tipo_${idx}`],
            salvo[`atk_desc_${idx}`],
            idx,
            salvo[`atk_tipo_dano_${idx}`],
            salvo[`atk_origin_${idx}`]
        );
    });

    // Adiciona listener para sincronizar mudanças manuais na lista de ataques de volta para o inventário
    document.body.addEventListener('change', (e) => {
        if (e.target.id && (e.target.id.startsWith('atk_nome_') || e.target.id.startsWith('atk_tipo_dano_'))) {
            const id = e.target.id.split('_').pop();
            sincronizarAtaqueComInventario(id);
        }
    });

    atualizarTudo();
    filtrarAtaques();
});