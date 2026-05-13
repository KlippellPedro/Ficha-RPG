/**
 * Lógica de cálculos de PV, PM, Defesa e Movimentação
 */
function atualizarDefesa(mods, dadosObj, bonusItens = {}, breakdown = null) {
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
                ...(breakdown.habilidades['defesa'] || [])
            ];
            sources.forEach(s => details.push(s));
        }
        inputDef.title = `Total: ${total} (${details.join(' | ')})`;
    }
}

/** Auxiliar para calcular ganho de mana vindo de classes */
function getManaGanhaEngine(mods) {
    let manaGanha = 0;
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = CLASSES_DATA[className];
        if (data) {
            let pmLvl = data.pm_lvl;
            if (className === 'cientista' && lvl >= 5 && sub === 'alquimista') pmLvl = 4;
            let mod = data.pm_attr ? (mods[data.pm_attr] || 0) : 0;
            manaGanha += (lvl * (mod + pmLvl));
        }
    });
    return manaGanha;
}

function atualizarVida(mods, dados, bonusItens = {}, breakdown = null) {
    const modFor = mods['forca'] || 0, modCon = mods['constituicao'] || 0;
    const vidaInicial = (modFor + modCon) * 4;
    let details = [`Inicial (FOR+CON x4): ${vidaInicial}`];

    let vidaGanha = 0;
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.querySelector('[id^="class_name_"]')?.value;
        const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
        const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
        const data = CLASSES_DATA[className];
        if (data) {
            let pvLvl = data.pv_lvl;
            if (className === 'cientista' && lvl >= 5 && sub === 'ferreiro') pvLvl = 4;

            let mod = (data.pv_attr && mods[data.pv_attr] !== undefined) ? mods[data.pv_attr] : modCon;
            if (data.pv_mod_half) mod = Math.floor(mod / 2);
            if (data.pv_no_mod) mod = 0;
            vidaGanha += (lvl * (mod + pvLvl));
        }
    });
    if (vidaGanha !== 0) details.push(`Classes: +${vidaGanha}`);

    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));
    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego;

    const racaBonus = RACAS_DATA[racaKey]?.pvBonus || 0;
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pv_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

    if (breakdown) {
        const sources = [
            ...(breakdown.itens['pv_max'] || []),
            ...(breakdown.poderes['pv_max'] || []),
            ...(breakdown.habilidades['pv_max'] || [])
        ];
        sources.forEach(s => details.push(s));
    }

    let total = vidaInicial + vidaGanha + (bonusItens['pv_max'] || 0) + (RACAS_DATA[racaKey]?.pvBonus || 0);
    if (isVamp && formaMorcego) {
        total = Math.floor(total / 2);
        details.push("Forma de Morcego: Vida Reduzida (50%)");
    }

    if (isCorrompido) {
        const manaGanha = getManaGanhaEngine(mods);
        const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
        const manaInicial = (modInt + modSab) * 3;
        const totalMana = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (RACAS_DATA[racaKey]?.manaBonus || 0) + (RACAS_DATA[racaKey]?.pmBonus || 0);
        total += totalMana;
        details.push(`Corrupção (Mana convertida): +${totalMana}`);
    }

    const el = document.getElementById("pv_max");
    if (el) {
        const finalTotal = Math.max(racaKey === "humano" ? 4 : 1, total);
        el.value = finalTotal;
        el.title = `Total PV: ${finalTotal} (${details.join(' | ')})`;
    }
}

function atualizarMana(mods, dados, bonusItens = {}, breakdown = null) {
    const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
    const manaInicial = (modInt + modSab) * 3;
    let details = [`Inicial (INT+SAB x3): ${manaInicial}`];

    const manaGanha = getManaGanhaEngine(mods);
    if (manaGanha !== 0) details.push(`Classes: +${manaGanha}`);

    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego;

    const racaBonus = (RACAS_DATA[racaKey]?.manaBonus || 0) + (RACAS_DATA[racaKey]?.pmBonus || 0);
    if (racaBonus !== 0) details.push(`Raça: ${racaBonus > 0 ? '+' : ''}${racaBonus}`);

    const extraRaca = parseInt(dados.pm_extra_raca) || 0;
    if (extraRaca !== 0) details.push(`Bônus Raça: +${extraRaca}`);

    if (breakdown) {
        const sources = [
            ...(breakdown.itens['pm_max'] || []),
            ...(breakdown.poderes['pm_max'] || []),
            ...(breakdown.habilidades['pm_max'] || [])
        ];
        sources.forEach(s => details.push(s));
    }

    let total = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (RACAS_DATA[racaKey]?.manaBonus || 0) + (RACAS_DATA[racaKey]?.pmBonus || 0);
    if (isVamp && formaMorcego) {
        total = Math.floor(total / 2);
        details.push("Forma de Morcego: Mana Reduzida (50%)");
    }

    if (isCorrompido) total = 0;

    const el = document.getElementById("pm_max");
    if (el) {
        const finalTotal = Math.max(racaKey === "humano" ? 3 : 1, total);
        el.value = finalTotal;
        el.title = isCorrompido ? "Corrompido: Mana é convertida em Vitalidade" : `Total PM: ${finalTotal} (${details.join(' | ')})`;
    }

    const elInv = document.getElementById("invocacoes_max");
    if (elInv) elInv.value = Math.max(0, Math.floor(modInt / 2));
}

function verificarStatusInicial(mods) {
    const modCar = mods['carisma'] || 0;
    const inputDef = document.getElementById('status_inicial_definido');
    if (!inputDef) return;
    const jaEscolheu = inputDef.value === "true";
    const inputStatus = document.getElementById('status_info');
    if (inputStatus) inputStatus.classList.toggle('status-glow', jaEscolheu);

    const modal = document.getElementById('modal-status');
    if (modCar >= 3 && !jaEscolheu) {
        if (modal) modal.style.display = 'flex';
    } else {
        if (modal) modal.style.display = 'none';
        if (modCar < 3 && jaEscolheu) {
            inputDef.value = "false";
            if (inputStatus) inputStatus.value = "";
        }
    }
}

function escolherStatus(valor) {
    const inputStatus = document.getElementById('status_info');
    if (inputStatus) inputStatus.value = (valor > 0 ? "+" : "") + valor;
    const inputDef = document.getElementById('status_inicial_definido');
    if (inputDef) inputDef.value = "true";
    document.getElementById('modal-status').style.display = 'none';
    atualizarTudo();
}

function atualizarMovimento(mods, dadosObj, bonusItens = {}, breakdown = null) {
    const modDes = mods['destreza'] || 0;
    const penalidadeManual = parseInt(document.getElementById("defesa_penalidade")?.value || 0);
    const extraRaca = parseInt(dadosObj.movimento_extra_raca) || 0;
    const total = (modDes * 3) + (bonusItens['movimentacao'] || 0) - penalidadeManual;
    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dadosObj.hibrido_raca_1 === "vampiro" || dadosObj.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dadosObj.vampiro_forma_morcego;
    const racaMov = RACAS_DATA[racaKey]?.movimentoBonus || 0;
    let bonusMorcego = (isVamp && formaMorcego) ? 9 : 0;
    const el = document.getElementById("movimentacao");
    if (el) {
        const finalTotal = Math.max(racaKey === "humano" ? 3 : 0, total + racaMov + bonusMorcego);
        el.value = finalTotal;

        let details = [`Base (DESx3): ${modDes * 3}`];
        if (racaMov !== 0) details.push(`Raça: ${racaMov >= 0 ? '+' : ''}${racaMov}`);
        if (extraRaca !== 0) details.push(`Bônus Raça: ${extraRaca >= 0 ? '+' : ''}${extraRaca}`);
        if (bonusMorcego !== 0) details.push(`Forma Morcego: +${bonusMorcego}`);
        if (penalidadeManual !== 0) details.push(`Penalidade: -${penalidadeManual}`);

        if (breakdown) {
            const sources = [
                ...(breakdown.itens['movimentacao'] || []),
                ...(breakdown.poderes['movimentacao'] || []),
                ...(breakdown.habilidades['movimentacao'] || [])
            ];
            sources.forEach(s => details.push(s));
        }
        el.title = `Total: ${finalTotal} (${details.join(' | ')})`;
    }
}

/**
 * Abre o modal de ajuda exibindo o detalhamento do cálculo de Vida ou Mana
 * @param {'vida'|'mana'} tipo 
 */
function mostrarAjudaCalculo(tipo) {
    const elId = tipo === 'vida' ? 'pv_max' : 'pm_max';
    const el = document.getElementById(elId);
    if (!el) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) return;

    title.innerText = `Cálculo de ${tipo === 'vida' ? 'Vida' : 'Mana'} Máxima`;

    // Extrai o breakdown do atributo title do input
    const fullTitle = el.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Dados de cálculo não encontrados.";
    const items = breakdownPart.split(' | ');

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            ${items.map(item => `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid #ff4444; font-size: 0.9rem;">${item}</div>`).join('')}
            <div style="margin-top: 10px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 4px; color: #ff4444; font-weight: bold; font-size: 1.1rem; text-align: center;">Total: ${el.value}</div>
        </div>
    `;

    modal.style.display = 'flex';
}

/**
 * Abre o modal de ajuda exibindo o detalhamento do cálculo de um Atributo
 * @param {string} attrId 
 */
function mostrarAjudaAtributo(attrId) {
    const el = document.getElementById(attrId);
    if (!el) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) {
        console.error("ERRO: Modal de ajuda não encontrado no HTML desta página.");
        return;
    }

    title.innerText = `Cálculo de Atributo: ${attrId.toUpperCase()}`;

    const fullTitle = el.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Dados de cálculo não encontrados.";
    const items = breakdownPart.split(' | ');

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            ${items.map(item => `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid #ff4444; font-size: 0.9rem;">${item}</div>`).join('')}
            <div style="margin-top: 10px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 4px; color: #ff4444; font-weight: bold; font-size: 1.1rem; text-align: center;">Total: ${el.value}</div>
        </div>
    `;

    modal.style.display = 'flex';
}

/**
 * Abre o modal de ajuda exibindo o detalhamento do cálculo genérico (Defesa, Movimento, etc)
 * @param {string} elId 
 */
function mostrarAjudaCalculoGenerico(elId) {
    const el = document.getElementById(elId);
    if (!el) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) return;

    let displayName = elId.charAt(0).toUpperCase() + elId.slice(1);
    if (elId === 'status_info') displayName = 'Status';
    if (elId === 'movimentacao') displayName = 'Movimentação';

    title.innerText = `Cálculo de ${displayName}`;

    const fullTitle = el.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Dados de cálculo não encontrados.";
    const items = breakdownPart.split(' | ');

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            ${items.map(item => `<div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid #ff4444; font-size: 0.9rem;">${item}</div>`).join('')}
            <div style="margin-top: 10px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 4px; color: #ff4444; font-weight: bold; font-size: 1.1rem; text-align: center;">Total: ${el.value}</div>
        </div>
    `;

    modal.style.display = 'flex';
}