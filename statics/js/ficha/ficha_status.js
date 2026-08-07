/**
 * Lógica de cálculos de PV, PM, Defesa e Movimentação
 */

/** Helper para obter o contexto de raça e estados especiais */
function getSheetState(dados) {
    if (!dados) dados = {};
    const racaKey = document.getElementById("raca")?.value || dados.raca || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const racasDB = typeof RACAS_DATA !== 'undefined' ? RACAS_DATA : {};

    return {
        racaKey,
        racaData: racasDB[racaKey] || { bonus: {} },
        isCorrompido: racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido")),
        isVampiro: racaKey === "vampiro" || (racaKey === "hibrido" && (h1 === "vampiro" || h2 === "vampiro")),
        formaMorcego: document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego || false
    };
}

function atualizarDefesa(mods, dadosObj, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dadosObj);
    const modDes = mods['destreza'] || 0;
    const armadura = parseInt(document.getElementById("defesa_armadura")?.value || 0);
    const outros = parseInt(document.getElementById("defesa_outros")?.value || 0);
    const extraRaca = parseInt(dadosObj.defesa_extra_raca) || 0;
    const itemBonus = bonusItens['defesa'] || 0;
    const ajustesDef = typeof somarAjustesManuais === 'function' ? somarAjustesManuais(dadosObj, 'defesa_ajustes_manuais') : { total: 0, detalhes: [] };
    const total = 10 + modDes + armadura + outros + itemBonus + ajustesDef.total;
    const inputDef = document.getElementById("defesa");
    if (inputDef) {
        inputDef.value = total;

        let details = ["Base: 10"];
        if (modDes !== 0) details.push(`DES: ${modDes >= 0 ? '+' : ''}${modDes}`);
        if (armadura !== 0) details.push(`Armadura: ${armadura >= 0 ? '+' : ''}${armadura}`);
        if (outros !== 0) details.push(`Outros: ${outros >= 0 ? '+' : ''}${outros}`);
        if (extraRaca !== 0) details.push(`Bônus Raça: ${extraRaca >= 0 ? '+' : ''}${extraRaca}`);
        ajustesDef.detalhes.forEach(d => details.push(d));

        if (breakdown) {
            const sources = [
                ...(breakdown.itens['defesa'] || []),
                ...(breakdown.poderes['defesa'] || []),
                ...(breakdown.habilidades['defesa'] || []),
                ...(breakdown.aliados['defesa'] || []),
                ...(breakdown.event['defesa'] || [])
            ];
            sources.forEach(s => details.push(s));
        }
        inputDef.title = `Total: ${total} (${details.join(' | ')})`;
    }
}

/**
 * ─── Snapshot de Modificadores para PV / PM ───
 * Os modificadores de atributo usados no cálculo de PV e PM máximos são "travados"
 * (snapshot) para que mudanças de atributo durante a sessão NÃO recalculem Vida/Mana.
 * O snapshot é atualizado quando: o personagem é criado, sobe de nível, muda de classe,
 * ou o mestre clica em "Sincronizar Atributos".
 */

/** Flag global — quando true, o próximo cálculo atualiza o snapshot com os mods atuais */
window._forceRecalcPvPm = false;

/**
 * Retorna os mods que devem ser usados nos cálculos de PV/PM.
 * Se já existe um snapshot salvo E não estamos forçando recálculo, retorna o snapshot.
 * Caso contrário, salva os mods atuais como novo snapshot e retorna-os.
 */
function _getSnapshotMods(dados, currentMods) {
    const key = '_snapshot_mods_pvpm';
    let snapshot = null;

    try {
        const raw = dados[key];
        if (raw && typeof raw === 'string') snapshot = JSON.parse(raw);
        else if (raw && typeof raw === 'object') snapshot = raw;
    } catch { snapshot = null; }

    // Se existe snapshot válido e NÃO estamos forçando recálculo → usa o snapshot
    if (snapshot && typeof snapshot === 'object' && !window._forceRecalcPvPm) {
        return snapshot;
    }

    // Cria/atualiza snapshot com os mods atuais
    const novoSnapshot = {};
    Object.keys(currentMods).forEach(k => novoSnapshot[k] = currentMods[k]);
    dados[key] = JSON.stringify(novoSnapshot);
    window._forceRecalcPvPm = false;
    return novoSnapshot;
}

/**
 * Sincroniza os atributos com PV/PM — atualiza o snapshot com os mods atuais
 * e recalcula tudo. Chamado pelo botão "Sincronizar Atributos".
 */
function sincronizarAtributosPvPm() {
    const doSync = () => {
        window._forceRecalcPvPm = true;
        atualizarTudo();
        if (typeof showNotification === 'function') {
            showNotification('Atributos sincronizados com PV e PM máximos.', 'success');
        }
    };

    if (typeof showConfirm === 'function') {
        showConfirm(
            'Isso vai recalcular Vida e Mana máximas usando os modificadores de atributo atuais. Continuar?',
            doSync,
            null,
            'Sincronizar Atributos?'
        );
    } else {
        doSync();
    }
}

function atualizarVida(mods, dados, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dados);

    // Obtém os mods travados (snapshot) para o cálculo de PV
    const snapMods = _getSnapshotMods(dados, mods);
    const modFor = snapMods['forca'] || 0, modCon = snapMods['constituicao'] || 0;
    const vidaInicial = (modFor + modCon) * 4;
    let details = [`Inicial (FOR+CON x4): ${vidaInicial}`];

    // Nota no tooltip se os mods estão travados
    const modsAtuaisFor = mods['forca'] || 0, modsAtuaisCon = mods['constituicao'] || 0;
    if (modFor !== modsAtuaisFor || modCon !== modsAtuaisCon) {
        details.push(`⚡ Mods travados (FOR ${modFor >= 0 ? '+' : ''}${modFor}, CON ${modCon >= 0 ? '+' : ''}${modCon})`);
    }

    const vidaGanha = typeof calcularVidaPorClasses === 'function' ? calcularVidaPorClasses(snapMods, modCon) : 0;
    if (vidaGanha !== 0) details.push(`Classes: +${vidaGanha}`);

    const racaBonus = state.racaData.pvBonus || 0;
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pv_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

    // Ajustes personalizados: lista de ganhos/perdas de Vida Máxima fora de poderes/itens/raça
    // (maldições, bênçãos, eventos especiais, regras de mesa, etc — definidos manualmente pelo jogador)
    const ajustesPV = typeof somarAjustesManuais === 'function' ? somarAjustesManuais(dados, 'pv_ajustes_manuais') : { total: 0, detalhes: [] };
    ajustesPV.detalhes.forEach(d => details.push(d));

    if (breakdown) {
        const sources = [
            ...(breakdown.itens['pv_max'] || []),
            ...(breakdown.poderes['pv_max'] || []),
            ...(breakdown.habilidades['pv_max'] || []),
            ...(breakdown.aliados['pv_max'] || []),
            ...(breakdown.event['pv_max'] || [])
        ];
        sources.forEach(s => details.push(s));
    }

    let total = vidaInicial + vidaGanha + (bonusItens['pv_max'] || 0) + racaBonus + ajustesPV.total;
    if (state.isVampiro && state.formaMorcego) {
        total = Math.floor(total / 2);
        details.push("Forma de Morcego: Vida Reduzida (50%)");
    }

    if (state.isCorrompido) {
        const manaGanha = typeof calcularManaPorClasses === 'function' ? calcularManaPorClasses(snapMods) : 0;
        const modInt = snapMods['inteligencia'] || 0, modSab = snapMods['sabedoria'] || 0;
        const manaInicial = (modInt + modSab) * 3;
        const totalMana = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (state.racaData.manaBonus || 0) + (state.racaData.pmBonus || 0);
        total += totalMana;
        details.push(`Corrupção (Mana convertida): +${totalMana}`);
    }

    const el = document.getElementById("pv_max");
    if (el) {
        // Ceifeiro tem pv_lvl 0.5 (não-inteiro) — garante valor inteiro na barra
        const finalTotal = Math.max(state.racaKey === "humano" ? 4 : 1, Math.floor(total));

        // Detecta se o Ceifeiro está ativo para adicionar nota no tooltip
        const hasCeifeiro = Array.from(document.querySelectorAll('[id^="class_name_"]'))
            .some(s => s.value === 'ceifeiro_almas');
        if (hasCeifeiro) details.push('Ceifeiro: ×0.5 PV/nível | CON ÷ 2 (arredondado)');

        el.value = finalTotal;
        el.title = `Total PV: ${finalTotal} (${details.join(' | ')})`;
    }

    // Atualiza o resumo dos ajustes personalizados nos botões "±" (Vida/Mana/Sanidade)
    if (typeof atualizarAjustesPersonalizadosUI === 'function') atualizarAjustesPersonalizadosUI(dados);
}

function atualizarMana(mods, dados, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dados);

    // Obtém os mods travados (snapshot) para o cálculo de PM
    const snapMods = _getSnapshotMods(dados, mods);
    const modInt = snapMods['inteligencia'] || 0, modSab = snapMods['sabedoria'] || 0;
    const manaInicial = (modInt + modSab) * 3;
    let details = [`Inicial (INT+SAB x3): ${manaInicial}`];

    // Nota no tooltip se os mods estão travados
    const modsAtuaisInt = mods['inteligencia'] || 0, modsAtuaisSab = mods['sabedoria'] || 0;
    if (modInt !== modsAtuaisInt || modSab !== modsAtuaisSab) {
        details.push(`⚡ Mods travados (INT ${modInt >= 0 ? '+' : ''}${modInt}, SAB ${modSab >= 0 ? '+' : ''}${modSab})`);
    }

    const manaGanha = typeof calcularManaPorClasses === 'function' ? calcularManaPorClasses(snapMods) : 0;
    if (manaGanha !== 0) details.push(`Classes: +${manaGanha}`);

    const racaBonus = (state.racaData.manaBonus || 0) + (state.racaData.pmBonus || 0);
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pm_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

    // Ajustes personalizados: lista de ganhos/perdas de Mana Máxima fora de poderes/itens/raça
    // (maldições, bênçãos, eventos especiais, regras de mesa, etc — definidos manualmente pelo jogador)
    const ajustesPM = typeof somarAjustesManuais === 'function' ? somarAjustesManuais(dados, 'pm_ajustes_manuais') : { total: 0, detalhes: [] };
    ajustesPM.detalhes.forEach(d => details.push(d));

    if (breakdown) {
        const sources = [
            ...(breakdown.itens['pm_max'] || []),
            ...(breakdown.poderes['pm_max'] || []),
            ...(breakdown.habilidades['pm_max'] || []),
            ...(breakdown.aliados['pm_max'] || []),
            ...(breakdown.event['pm_max'] || [])
        ];
        sources.forEach(s => details.push(s));
    }
    let total = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + racaBonus + ajustesPM.total;
    if (state.isVampiro && state.formaMorcego) {
        total = Math.floor(total / 2);
        details.push("Forma de Morcego: Mana Reduzida (50%)");
    }

    if (state.isCorrompido) total = 0;

    const el = document.getElementById("pm_max");
    if (el) {
        const finalTotal = Math.max(state.racaKey === "humano" ? 3 : 1, total);
        el.value = finalTotal;
        el.title = state.isCorrompido ? "Corrompido: Mana é convertida em Vitalidade" : `Total PM: ${finalTotal} (${details.join(' | ')})`;
    }

    const elInv = document.getElementById("invocacoes_max");
    if (elInv) {
        const invBonus = (bonusItens['invocacoes_max'] || 0);
        // Invocações usam mod ATUAL (não travado), pois não é PV/PM
        const modIntAtual = mods['inteligencia'] || 0;
        elInv.value = Math.max(0, Math.floor(modIntAtual / 2) + invBonus);
    }
}


function verificarStatusInicial(mods) {
    const modCar = mods['carisma'] || 0;
    const inputDef = document.getElementById('status_inicial_definido');
    if (!inputDef) return;
    const jaEscolheu = inputDef.value === "true";
    const inputStatus = document.getElementById('status_info'); //
    if (inputStatus) inputStatus.classList.toggle('status-glow', jaEscolheu);

    // Só é oferecida a escolha de Status quando Carisma atinge +5 no modificador (Carisma 20)
    const modal = document.getElementById('modal-status');
    if (modCar >= 5 && !jaEscolheu) {
        if (modal && !modal.open) modal.showModal();
    } else {
        if (modal && modal.open) fecharDialogoAnimado(modal);
        if (modCar < 5 && jaEscolheu) {
            inputDef.value = "false";
            if (inputStatus) inputStatus.value = "";
        }
    }
}

function atualizarMovimento(mods, dadosObj, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dadosObj);
    const modDes = mods['destreza'] || 0;
    const penArmadura = parseInt(document.getElementById("defesa_penalidade")?.value || 0);
    const penMovManual = parseInt(document.getElementById("movimento_penalidade")?.value || 0);
    const extraRaca = parseInt(dadosObj.movimento_extra_raca) || 0;
    const ajustesMov = typeof somarAjustesManuais === 'function' ? somarAjustesManuais(dadosObj, 'movimentacao_ajustes_manuais') : { total: 0, detalhes: [] };
    const totalCalculado = (modDes * 3) + (bonusItens['movimentacao'] || 0) - penArmadura - penMovManual + ajustesMov.total;
    const racaMov = state.racaData.movimentoBonus || 0;
    let bonusMorcego = (state.isVampiro && state.formaMorcego) ? 9 : 0;

    let finalTotal = totalCalculado + racaMov + bonusMorcego;
    let usandoPadraoHumano = false;

    // O 3 só é aplicado se o total for 0 ou negativo para Humanos
    if (state.racaKey === "humano" && finalTotal <= 0) {
        finalTotal = 3;
        usandoPadraoHumano = true;
    } else {
        finalTotal = Math.max(0, finalTotal);
    }

    const el = document.getElementById("movimentacao");
    if (el) {
        el.value = finalTotal;

        let details = [];
        if (usandoPadraoHumano) details.push("Padrão Humano (Mínimo): 3");
        else details.push(`Base (DESx3): ${modDes * 3}`);

        if (racaMov !== 0) details.push(`Raça: ${racaMov >= 0 ? '+' : ''}${racaMov}`);
        if (extraRaca !== 0) details.push(`Bônus Raça: ${extraRaca >= 0 ? '+' : ''}${extraRaca}`);
        if (bonusMorcego !== 0) details.push(`Forma Morcego: +${bonusMorcego}`);
        if (penArmadura !== 0) details.push(`Pen. Armadura: -${penArmadura}`);
        if (penMovManual !== 0) details.push(`Penalidade: -${penMovManual}`);
        ajustesMov.detalhes.forEach(d => details.push(d));

        if (breakdown) {
            const sources = [
                ...(breakdown.itens['movimentacao'] || []),
                ...(breakdown.poderes['movimentacao'] || []),
                ...(breakdown.habilidades['movimentacao'] || []),
                ...(breakdown.aliados['movimentacao'] || []),
                ...(breakdown.event['movimentacao'] || [])
            ];
            sources.forEach(s => details.push(s));
        }
        el.title = `Total: ${finalTotal} (${details.join(' | ')})`;
    }
}