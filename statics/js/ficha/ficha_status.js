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
    const total = 10 + modDes + armadura + outros + itemBonus;
    const inputDef = document.getElementById("defesa");
    if (inputDef) {
        inputDef.value = total;

        let details = ["Base: 10"];
        if (modDes !== 0) details.push(`DES: ${modDes >= 0 ? '+' : ''}${modDes}`);
        if (armadura !== 0) details.push(`Armadura: ${armadura >= 0 ? '+' : ''}${armadura}`);
        if (outros !== 0) details.push(`Outros: ${outros >= 0 ? '+' : ''}${outros}`);
        if (extraRaca !== 0) details.push(`Bônus Raça: ${extraRaca >= 0 ? '+' : ''}${extraRaca}`);

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

function atualizarVida(mods, dados, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dados);
    const modFor = mods['forca'] || 0, modCon = mods['constituicao'] || 0;
    const vidaInicial = (modFor + modCon) * 4;
    let details = [`Inicial (FOR+CON x4): ${vidaInicial}`];

    const vidaGanha = typeof calcularVidaPorClasses === 'function' ? calcularVidaPorClasses(mods, modCon) : 0;
    if (vidaGanha !== 0) details.push(`Classes: +${vidaGanha}`);

    const racaBonus = state.racaData.pvBonus || 0;
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pv_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

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

    let total = vidaInicial + vidaGanha + (bonusItens['pv_max'] || 0) + racaBonus;
    if (state.isVampiro && state.formaMorcego) {
        total = Math.floor(total / 2);
        details.push("Forma de Morcego: Vida Reduzida (50%)");
    }

    if (state.isCorrompido) {
        const manaGanha = typeof calcularManaPorClasses === 'function' ? calcularManaPorClasses(mods) : 0;
        const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
        const manaInicial = (modInt + modSab) * 3;
        const totalMana = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (state.racaData.manaBonus || 0) + (state.racaData.pmBonus || 0);
        total += totalMana;
        details.push(`Corrupção (Mana convertida): +${totalMana}`);
    }

    const el = document.getElementById("pv_max");
    if (el) {
        const finalTotal = Math.max(state.racaKey === "humano" ? 4 : 1, total);
        el.value = finalTotal;
        el.title = `Total PV: ${finalTotal} (${details.join(' | ')})`;
    }
}

function atualizarMana(mods, dados, bonusItens = {}, breakdown = null) {
    const state = getSheetState(dados);
    const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
    const manaInicial = (modInt + modSab) * 3;
    let details = [`Inicial (INT+SAB x3): ${manaInicial}`];

    const manaGanha = typeof calcularManaPorClasses === 'function' ? calcularManaPorClasses(mods) : 0;
    if (manaGanha !== 0) details.push(`Classes: +${manaGanha}`);

    const racaBonus = (state.racaData.manaBonus || 0) + (state.racaData.pmBonus || 0);
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pm_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

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
    let total = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + racaBonus;
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
    if (elInv) elInv.value = Math.max(0, Math.floor(modInt / 2));
}

function verificarStatusInicial(mods) {
    const modCar = mods['carisma'] || 0;
    const inputDef = document.getElementById('status_inicial_definido');
    if (!inputDef) return;
    const jaEscolheu = inputDef.value === "true";
    const inputStatus = document.getElementById('status_info'); //
    if (inputStatus) inputStatus.classList.toggle('status-glow', jaEscolheu);

    const modal = document.getElementById('modal-status');
    if (modCar >= 3 && !jaEscolheu) {
        if (modal && !modal.open) modal.showModal();
    } else {
        if (modal && modal.open) modal.close();
        if (modCar < 3 && jaEscolheu) {
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
    const totalCalculado = (modDes * 3) + (bonusItens['movimentacao'] || 0) - penArmadura - penMovManual;
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