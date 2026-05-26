/**
 * Orquestrador dos Ataques
 */

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
    let existingAttackRow = null; //
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
        const nomeAtk = document.getElementById(`atk_nome_${id}`)?.value;

        // Prioridade absoluta para o ID de origem (vínculo direto)
        const matchId = (originInput && originId && originInput.value == originId);
        // Fallback apenas se não houver ID (ataques manuais), mas com cautela
        const matchNome = (!originInput?.value && itemName && nomeAtk === itemName);

        if (matchId || matchNome) {
            // Chama a função de remover passando o botão ou simulando o clique
            const btnRemover = row.querySelector('.btn-remove-class');
            if (btnRemover) row.remove(); // Remove da UI imediatamente
        }
    });
    atualizarTudo();
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
    // Limpeza final para garantir que estados de hover de drag não persistam
    container.querySelectorAll('.draggable').forEach(row =>
        row.classList.remove('drag-insert-top', 'drag-insert-bottom')
    );
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

    // Agora utiliza a função genérica do inventario.js
    if (typeof loadInventoryOrder === 'function') {
        loadInventoryOrder('ataques-container', STORAGE_KEY_ATAQUES_ORDER);
    }


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