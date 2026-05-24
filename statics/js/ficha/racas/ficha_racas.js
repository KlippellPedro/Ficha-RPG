/**
 * Lógica específica para raças e traços raciais
 */

function initRaces() {
    const racaSelect = document.getElementById('raca');
    const h1 = document.getElementById('hibrido_raca_1');
    const h2 = document.getElementById('hibrido_raca_2');
    const storageKey = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : "ficha_rpg_dados";
    const racasDB = typeof RACAS_DATA !== 'undefined' ? RACAS_DATA : {};
    const salvo = JSON.parse(localStorage.getItem(storageKey)) || {};

    if (racaSelect) {
        racaSelect.innerHTML = Object.keys(racasDB)
            .filter(key => !racasDB[key].dlc || isDlcAtiva(racasDB[key].dlc))
            .map(key =>
                `<option value="${key}">${racasDB[key].nome}</option>`
            ).join('');
        if (salvo.raca) racaSelect.value = salvo.raca;
    }

    if (h1 && h2) {
        const hybridOptions = Object.keys(racasDB)
            .filter(key => !['hibrido', 'nenhuma'].includes(key))
            .map(key => `<option value="${key}">${racasDB[key].nome}</option>`)
            .join('');

        h1.innerHTML = hybridOptions;
        h2.innerHTML = hybridOptions;

        if (salvo.hibrido_raca_1) h1.value = salvo.hibrido_raca_1;
        if (salvo.hibrido_raca_2) h2.value = salvo.hibrido_raca_2;
    }
}

/** Helper para verificar se uma raça está ativa (incluindo híbridos) */
function isRacaAtiva(racaAlvo, dados) {
    if (!dados) dados = {};
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";
    return racaKey === racaAlvo || (racaKey === "hibrido" && (h1 === racaAlvo || h2 === racaAlvo));
}

let vampiroWarningTimeout = null;
function verificarAtributoVampiro(infoAttr, dados) { // infoAttr is not used here, but kept for consistency
    const active = isRacaAtiva("vampiro", dados);
    const warningEl = document.getElementById("vampiro-warning");

    if (!warningEl) return;

    if (active) {
        const destrezaTotal = infoAttr.totals['destreza'] || 0;
        const otherAttrs = ["forca", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];
        let hasHigherAttr = false;
        for (const attr of otherAttrs) {
            if ((infoAttr.totals[attr] || 0) > destrezaTotal) {
                hasHigherAttr = true;
                break;
            }
        }
        if (hasHigherAttr) {
            if (warningEl.style.display !== 'block') {
                warningEl.style.display = 'block';
                clearTimeout(vampiroWarningTimeout);
                vampiroWarningTimeout = setTimeout(() => { warningEl.style.display = 'none'; }, 20000);
            }
        } else {
            warningEl.style.display = 'none';
            clearTimeout(vampiroWarningTimeout);
        }
    } else { warningEl.style.display = 'none'; }
}

let animaliaWarningTimeout = null;
let animaliaAvisoMostrado = false;

function verificarAvisoAnimalia(dados) { // dados is already passed
    const active = isRacaAtiva("animalia", dados);
    const warningEl = document.getElementById("animalia-warning");
    const extraEl = document.getElementById("animalia-extra");

    if (warningEl) {
        if (active) {
            if (!animaliaAvisoMostrado) {
                warningEl.style.display = 'block';
                animaliaAvisoMostrado = true;
                clearTimeout(animaliaWarningTimeout);
                animaliaWarningTimeout = setTimeout(() => { warningEl.style.display = 'none'; }, 20000);
            }
        } else {
            warningEl.style.display = 'none';
            animaliaAvisoMostrado = false;
            clearTimeout(animaliaWarningTimeout);
        }
    }
    if (extraEl) extraEl.style.display = active ? 'flex' : 'none';
}

function verificarExtraFada(dados) { // dados is already passed
    const active = isRacaAtiva("fada", dados);
    const extraEl = document.getElementById("fada-extra");
    if (extraEl) extraEl.style.display = active ? 'flex' : 'none';
}

function verificarExtraEspirito(dados) { // Add dados as argument
    const active = isRacaAtiva("espirito", dados);

    const extraEl = document.getElementById("espirito-extra");
    const powerSection = document.getElementById("section-poder-espirito");

    if (extraEl) extraEl.style.display = active ? 'block' : 'none';
    if (powerSection) powerSection.style.display = active ? 'block' : 'none';

    const poderAtivo = dados.espirito_poder || document.getElementById("espirito_poder")?.value;
    const displayPoder = document.getElementById("display-poder-espirito");
    if (displayPoder) {
        if (poderAtivo) {
            const nomesPoderes = { 'teliii': 'TELIII...alguma coisa', 'assustador': 'ASSUSTADOR!', 'possessao': 'TEU CORPO MINHAS REGRAS!' };
            displayPoder.innerText = nomesPoderes[poderAtivo] || "Nenhum selecionado";
            displayPoder.style.color = "#ff4444";
        } else {
            displayPoder.innerText = "Nenhum poder selecionado";
            displayPoder.style.color = "#ccc";
        }
    }
}

function verificarExtraVampiro(dados) {
    const active = isRacaAtiva("vampiro", dados);

    const extraEl = document.getElementById("vampiro-extra");
    const powerSection = document.getElementById("section-poder-vampiro");

    if (extraEl) extraEl.style.display = active ? 'block' : 'none';
    if (powerSection) powerSection.style.display = active ? 'block' : 'none';
}

function verificarExtraMortoVivo(dados) { // dados is already passed
    const active = isRacaAtiva("morto_vivo", dados);
    const extraEl = document.getElementById("morto-vivo-extra");
    const powerSection = document.getElementById("section-poder-morto");
    if (extraEl) extraEl.style.display = active ? 'block' : 'none';
    if (powerSection) powerSection.style.display = active ? 'block' : 'none';

    const poderAtivo = dados.morto_vivo_poder || document.getElementById("morto_vivo_poder")?.value;
    const displayPoder = document.getElementById("display-poder-morto");
    if (displayPoder) {
        if (poderAtivo) {
            displayPoder.innerText = { 'nao_reflete_luz': 'NAO REFLETE MAIS LUZ', 'morto_nao_vivo': 'MORTO NÃO VIVO', 'eu_to_morto': 'EU TO MORTO?' }[poderAtivo] || "Nenhum selecionado";
            displayPoder.style.color = "#ff4444";
        } else {
            displayPoder.innerText = "Nenhum poder selecionado";
            displayPoder.style.color = "#ccc";
        }
    }
}

function verificarExtraHibrido(dados) { // dados is already passed
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const extraEl = document.getElementById("hibrido-extra");
    if (extraEl && racaKey === "hibrido") {
        extraEl.style.display = 'flex';
        const h1 = document.getElementById('hibrido_raca_1'), h2 = document.getElementById('hibrido_raca_2');
        if (h1 && h2 && h1.value !== "" && h1.value === h2.value && h1.value !== "animalia") {
            const opt = Array.from(h2.options).find(o => o.value !== h1.value && o.value !== "");
            if (opt) h2.value = opt.value;
        }
    } else if (extraEl) extraEl.style.display = 'none';
}

function verificarExtraDeusEscolhido(dados) {
    const racasComBonusExtra = ["deus", "escolhido", "corrompido", "anjo", "demonio", "semideus"];

    // Força a verificação tanto da raça base quanto de híbridos
    const activeRaca = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const isSpecialRaca = racasComBonusExtra.some(raca => isRacaAtiva(raca, dados));

    const extraEl = document.getElementById("deus-escolhido-extra");
    if (extraEl) extraEl.style.display = isSpecialRaca ? 'block' : 'none';

    const isDeus = isRacaAtiva("deus", dados);
    const headerExtra = document.getElementById("deus-raca-header");
    if (headerExtra) headerExtra.style.display = isDeus ? 'flex' : 'none';

    const isAnjo = isRacaAtiva("anjo", dados);
    const headerAnjo = document.getElementById("anjo-raca-header");
    if (headerAnjo) headerAnjo.style.display = isAnjo ? 'flex' : 'none';

    const isDemonio = isRacaAtiva("demonio", dados);
    const headerDemonio = document.getElementById("demonio-raca-header");
    if (headerDemonio) headerDemonio.style.display = isDemonio ? 'flex' : 'none';

    const isSemideus = isRacaAtiva("semideus", dados);
    const headerSemideus = document.getElementById("semideus-raca-header");
    if (headerSemideus) headerSemideus.style.display = isSemideus ? 'flex' : 'none';
}

function verificarCorrompido(dados) {
    const isCorrompido = isRacaAtiva("corrompido", dados);

    const pmGroup = document.getElementById("pm-stat-group");
    const pvLabel = document.querySelector("#pv-stat-group .stat-labels label");

    if (pmGroup) pmGroup.style.display = isCorrompido ? 'none' : 'flex';
    if (pvLabel) {
        pvLabel.innerText = isCorrompido ? 'CORRUPÇÃO (VITALIDADE)' : 'VIDA (P.V.)';
    }
}

let racaAnteriorUI = null;
function atualizarRacaUI(racaKey) {
    const racasDB = typeof RACAS_DATA !== 'undefined' ? RACAS_DATA : {};
    const data = racasDB[racaKey];
    if (!data) return;
    if (racaKey !== racaAnteriorUI) {
        const elTam = document.getElementById("tamanho");
        if (elTam && data.tamanho) elTam.value = data.tamanho;
    }
    const elCred = document.getElementById("creditos");
    const storageKey = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : "ficha_rpg_dados";
    if (elCred && racaAnteriorUI !== racaKey) {
        const valorAtual = parseInt(elCred.value), basePadrao = 20;
        const totalRaca = basePadrao + (data.creditosInicial || 0);
        let valorEsperadoAnterior = basePadrao;
        if (racaAnteriorUI && racasDB[racaAnteriorUI]) valorEsperadoAnterior = basePadrao + (racasDB[racaAnteriorUI].creditosInicial || 0);

        if (isNaN(valorAtual) || valorAtual === 0 || valorAtual === basePadrao || valorAtual === valorEsperadoAnterior) {
            elCred.value = totalRaca;
            const d = JSON.parse(localStorage.getItem(storageKey)) || {};
            d.creditos = totalRaca;
            localStorage.setItem(storageKey, JSON.stringify(d));
        }
    }
    racaAnteriorUI = racaKey;
}