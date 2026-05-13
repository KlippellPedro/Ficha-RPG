/**
 * Lógica de cálculos de PV, PM, Defesa e Movimentação
 */
function atualizarDefesa(mods, dadosObj, bonusItens = {}) {
    const modDes = mods['destreza'] || 0;
    const armadura = parseInt(document.getElementById("defesa_armadura")?.value || 0);
    const outros = parseInt(document.getElementById("defesa_outros")?.value || 0);
    const itemBonus = bonusItens['defesa'] || 0;
    const total = 10 + modDes + armadura + outros + itemBonus;
    const inputDef = document.getElementById("defesa");
    if (inputDef) inputDef.value = total;
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

function atualizarVida(mods, dados, bonusItens = {}) {
    const modFor = mods['forca'] || 0, modCon = mods['constituicao'] || 0;
    const vidaInicial = (modFor + modCon) * 4;
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
    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego;
    let total = vidaInicial + vidaGanha + (bonusItens['pv_max'] || 0) + (RACAS_DATA[racaKey]?.pvBonus || 0);
    if (isVamp && formaMorcego) total = Math.floor(total / 2);

    if (isCorrompido) {
        const manaGanha = getManaGanhaEngine(mods);
        const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
        const manaInicial = (modInt + modSab) * 3;
        const totalMana = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (RACAS_DATA[racaKey]?.manaBonus || 0) + (RACAS_DATA[racaKey]?.pmBonus || 0);
        total += totalMana;
    }

    const el = document.getElementById("pv_max");
    if (el) el.value = Math.max(racaKey === "humano" ? 4 : 1, total);
}

function atualizarMana(mods, dados, bonusItens = {}) {
    const modInt = mods['inteligencia'] || 0, modSab = mods['sabedoria'] || 0;
    const manaInicial = (modInt + modSab) * 3;
    const manaGanha = getManaGanhaEngine(mods);

    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego;
    let total = manaInicial + manaGanha + (bonusItens['pm_max'] || 0) + (RACAS_DATA[racaKey]?.manaBonus || 0) + (RACAS_DATA[racaKey]?.pmBonus || 0);
    if (isVamp && formaMorcego) total = Math.floor(total / 2);

    if (isCorrompido) total = 0;

    const el = document.getElementById("pm_max");
    if (el) el.value = Math.max(racaKey === "humano" ? 3 : 1, total);
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

function atualizarMovimento(mods, dados, bonusItens = {}) {
    const modDes = mods['destreza'] || 0;
    const penalidadeManual = parseInt(document.getElementById("defesa_penalidade")?.value || 0);
    const total = (modDes * 3) + (bonusItens['movimentacao'] || 0) - penalidadeManual;
    const racaKey = document.getElementById("raca")?.value || "nenhuma";
    const isVamp = racaKey === "vampiro" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro"));
    const formaMorcego = document.getElementById("vampiro_forma_morcego")?.checked || dados.vampiro_forma_morcego;
    const racaMov = RACAS_DATA[racaKey]?.movimentoBonus || 0;
    let bonusMorcego = (isVamp && formaMorcego) ? 9 : 0;
    const el = document.getElementById("movimentacao");
    if (el) el.value = Math.max(racaKey === "humano" ? 3 : 0, total + racaMov + bonusMorcego);
}