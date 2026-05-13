/**
 * Lógica específica para raças e traços raciais
 */
let vampiroWarningTimeout = null;
function verificarAtributoVampiro(infoAttr, dados) { // infoAttr is not used here, but kept for consistency
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";

    const isVampiro = racaKey === "vampiro" || (racaKey === "hibrido" && (h1 === "vampiro" || h2 === "vampiro"));
    const warningEl = document.getElementById("vampiro-warning");

    if (!warningEl) return;

    if (isVampiro) {
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
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";
    const isAnimalia = racaKey === "animalia" || (racaKey === "hibrido" && (h1 === "animalia" || h2 === "animalia"));
    const warningEl = document.getElementById("animalia-warning");
    const extraEl = document.getElementById("animalia-extra");

    if (warningEl) {
        if (isAnimalia) {
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
    if (extraEl) extraEl.style.display = isAnimalia ? 'flex' : 'none';
}

function verificarExtraFada(dados) { // dados is already passed
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";
    const isFada = racaKey === "fada" || (racaKey === "hibrido" && (h1 === "fada" || h2 === "fada"));
    const extraEl = document.getElementById("fada-extra");
    if (extraEl) extraEl.style.display = isFada ? 'flex' : 'none';
}

function verificarExtraEspirito(dados) { // Add dados as argument
    const racaKey = dados.raca || document.getElementById("raca")?.value || "";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";
    const isEspirito = racaKey === "espirito" || (racaKey === "hibrido" && (h1 === "espirito" || h2 === "espirito"));

    const extraEl = document.getElementById("espirito-extra");
    const powerSection = document.getElementById("section-poder-espirito");

    if (extraEl) extraEl.style.display = isEspirito ? 'block' : 'none';
    if (powerSection) powerSection.style.display = isEspirito ? 'block' : 'none';

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

function escolherPoderEspirito(poder) {
    const inputPoder = document.getElementById("espirito_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        document.getElementById('modal-poder-espirito').style.display = 'none'; // Fecha o modal após a escolha
        atualizarTudo();
    }
}

function verificarExtraVampiro(dados) {
    const racaKey = dados.raca || "";
    const isVampiro = racaKey === "vampiro" || dados.hibrido_raca_1 === "vampiro" || dados.hibrido_raca_2 === "vampiro";

    const extraEl = document.getElementById("vampiro-extra");
    const powerSection = document.getElementById("section-poder-vampiro");

    if (extraEl) extraEl.style.display = isVampiro ? 'block' : 'none';
    if (powerSection) powerSection.style.display = isVampiro ? 'block' : 'none';
}

function verificarExtraMortoVivo(dados) { // dados is already passed
    const racaKey = dados.raca || document.getElementById("raca")?.value || "";
    const h1 = dados.hibrido_raca_1 || document.getElementById('hibrido_raca_1')?.value || "";
    const h2 = dados.hibrido_raca_2 || document.getElementById('hibrido_raca_2')?.value || "";
    const isMorto = racaKey === "morto_vivo" || (racaKey === "hibrido" && (h1 === "morto_vivo" || h2 === "morto_vivo"));
    const extraEl = document.getElementById("morto-vivo-extra");
    const powerSection = document.getElementById("section-poder-morto");
    if (extraEl) extraEl.style.display = isMorto ? 'block' : 'none';
    if (powerSection) powerSection.style.display = isMorto ? 'block' : 'none';

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

function escolherPoderMortoVivo(poder) {
    const inputPoder = document.getElementById("morto_vivo_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        document.getElementById('modal-poder-morto').style.display = 'none';
        atualizarTudo();
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
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";

    const isSpecialRaca = ["deus", "escolhido"].includes(racaKey) ||
        (racaKey === "hibrido" && (["deus", "escolhido"].includes(h1) || ["deus", "escolhido"].includes(h2)));

    const extraEl = document.getElementById("deus-escolhido-extra");
    if (extraEl) extraEl.style.display = isSpecialRaca ? 'block' : 'none';
}

function verificarCorrompido(dados) {
    const racaKey = dados.raca || document.getElementById("raca")?.value || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    const pmGroup = document.getElementById("pm-stat-group");
    const pvLabel = document.querySelector("#pv-stat-group .stat-labels label");

    if (pmGroup) pmGroup.style.display = isCorrompido ? 'none' : 'flex';
    if (pvLabel) {
        pvLabel.innerText = isCorrompido ? 'CORRUPÇÃO (VITALIDADE)' : 'VIDA (P.V.)';
    }
}

let racaAnteriorUI = null;
function atualizarRacaUI(racaKey) {
    const data = RACAS_DATA[racaKey];
    if (!data) return;
    if (racaKey !== racaAnteriorUI) {
        const elTam = document.getElementById("tamanho");
        if (elTam && data.tamanho) elTam.value = data.tamanho;
    }
    const elCred = document.getElementById("creditos");
    if (elCred && racaAnteriorUI !== racaKey) {
        const valorAtual = parseInt(elCred.value), basePadrao = 20;
        const totalRaca = basePadrao + (data.creditosInicial || 0);
        let valorEsperadoAnterior = basePadrao;
        if (racaAnteriorUI && RACAS_DATA[racaAnteriorUI]) valorEsperadoAnterior = basePadrao + (RACAS_DATA[racaAnteriorUI].creditosInicial || 0);

        if (isNaN(valorAtual) || valorAtual === 0 || valorAtual === basePadrao || valorAtual === valorEsperadoAnterior) {
            elCred.value = totalRaca;
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            d.creditos = totalRaca;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        }
    }
    racaAnteriorUI = racaKey;
}