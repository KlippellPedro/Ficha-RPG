/**
 * Lógica específica para raças e traços raciais
 */

// ── Configuração visual das raças (cor de destaque) ───────────────
const RACA_VISUAL = {
    humano:     { cor: '#a0a0b0', desc: 'Versáteis e adaptáveis.' },
    vampiro:    { cor: '#8b0000', desc: 'Imortais sedentos de sangue.' },
    espirito:   { cor: '#00d4ff', desc: 'Seres etéreos além do véu.' },
    morto_vivo: { cor: '#660066', desc: 'Mantidos pela força da morte.' },
    animalia:   { cor: '#c97b2c', desc: 'Fusão entre humano e besta.' },
    goblin:     { cor: '#4ade80', desc: 'Pequenos, espertos e ágeis.' },
    fada:       { cor: '#f0abfc', desc: 'Criaturas mágicas da natureza.' },
    anao:       { cor: '#a0522d', desc: 'Fortes e resistentes como pedra.' },
    elfo:       { cor: '#86efac', desc: 'Longevos e refinados.' },
    demonio:    { cor: '#ff4444', desc: 'Nascidos do caos infernal.' },
    anjo:       { cor: '#f59e0b', desc: 'Guardiões da ordem divina.' },
    semideus:   { cor: '#a78bfa', desc: 'Sangue de deuses nas veias.' },
    deus:       { cor: '#ffd700', desc: 'Poder absoluto e eterno.' },
    escolhido:  { cor: '#fb923c', desc: 'Marcados pelo destino.' },
    corrompido: { cor: '#7e22ce', desc: 'Consumidos pela corrupção.' },
    hibrido:    { cor: '#22d3ee', desc: 'Duas raças, um ser.' },
    kitsune:    { cor: '#ff7043', desc: 'Raposas místicas do Olimpo.' },
};

// ── Modal de seleção de raça ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const modalHtml = `
        <dialog id="modal-raca-select" class="modal-overlay">
            <div class="modal-content" style="max-width:680px;width:95%;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color:var(--primary-color)">Escolher Raça</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div style="padding: 4px 0 8px 0;">
                    <input type="text" id="modal-raca-search"
                           placeholder="🔍  Buscar raça..."
                           oninput="filtrarModalRaca(this.value)"
                           style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:white;font-size:0.85rem;outline:none;box-sizing:border-box;"
                    />
                </div>
                <div class="modal-body" id="modal-raca-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;max-height:60vh;overflow-y:auto;padding:4px 2px;"></div>
            </div>
        </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
});

window.abrirModalSelecionarRaca = function () {
    const modal = document.getElementById('modal-raca-select');
    const list = document.getElementById('modal-raca-list');
    if (!modal || !list) return;

    const racasDB = window.RACAS_DATA || {};
    const currentVal = document.getElementById('raca')?.value || '';

    list.innerHTML = Object.keys(racasDB)
        .filter(key => !racasDB[key].dlc || isDlcAtiva(racasDB[key].dlc))
        .map(key => {
            const r = racasDB[key];
            const vis = RACA_VISUAL[key] || { cor: '#888', desc: '' };
            const isSelected = key === currentVal;
            const size = r.tamanho ? `<small style="opacity:0.5;font-size:0.55rem;">${r.tamanho}</small>` : '';
            const dlcBadge = r.dlc && r.dlc !== 'atual'
                ? `<span style="font-size:0.45rem;background:rgba(255,255,255,0.08);border-radius:3px;padding:1px 4px;opacity:0.6;">${r.dlc.toUpperCase()}</span>`
                : '';
            return `
                <div data-raca-card data-raca-nome="${r.nome.toLowerCase()}"
                     onclick="confirmarSelecionarRaca('${key}')"
                     style="
                        cursor:pointer;border-radius:8px;padding:14px 10px;text-align:center;
                        border:1px solid ${isSelected ? vis.cor : 'rgba(255,255,255,0.07)'};
                        background:${isSelected ? `rgba(${hexToRgbStr(vis.cor)},0.15)` : 'rgba(255,255,255,0.02)'};
                        box-shadow:${isSelected ? `0 0 12px rgba(${hexToRgbStr(vis.cor)},0.3)` : 'none'};
                        transition:all 0.2s;display:flex;flex-direction:column;gap:5px;align-items:center;
                     "
                     onmouseenter="this.style.borderColor='${vis.cor}';this.style.background='rgba(${hexToRgbStr(vis.cor)},0.1)';this.style.transform='translateY(-3px)'"
                     onmouseleave="this.style.borderColor='${isSelected ? vis.cor : 'rgba(255,255,255,0.07)'}';this.style.background='${isSelected ? `rgba(${hexToRgbStr(vis.cor)},0.15)` : 'rgba(255,255,255,0.02)'}';this.style.transform=''">
                    <span style="font-family:var(--font-heading,serif);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${vis.cor};text-shadow:0 0 8px rgba(${hexToRgbStr(vis.cor)},0.4);">${r.nome}</span>
                    ${size} ${dlcBadge}
                    <span style="font-size:0.5rem;opacity:0.45;line-height:1.3;">${vis.desc}</span>
                </div>`;
        }).join('');

    // Limpa busca e foca ao abrir
    const searchEl = document.getElementById('modal-raca-search');
    if (searchEl) { searchEl.value = ''; setTimeout(() => searchEl.focus(), 80); }
    // Garante que todos os cards estejam visíveis
    list.querySelectorAll('[data-raca-card]').forEach(c => c.style.display = '');

    modal.showModal();
};

window.filtrarModalRaca = function (query) {
    const list = document.getElementById('modal-raca-list');
    if (!list) return;
    const q = (query || '').toLowerCase().trim();
    list.querySelectorAll('[data-raca-card]').forEach(card => {
        card.style.display = (!q || card.dataset.racaNome.toLowerCase().includes(q)) ? '' : 'none';
    });
};

function hexToRgbStr(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

window.confirmarSelecionarRaca = function (key) {
    const select = document.getElementById('raca');
    const btn = document.getElementById('race-btn');
    const racasDB = window.RACAS_DATA || {};
    if (select) {
        select.value = key;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (btn) {
        btn.textContent = racasDB[key]?.nome || key;
        btn.classList.remove('empty');
        const cor = RACA_VISUAL[key]?.cor || 'var(--primary-color)';
        btn.style.borderColor = cor;
        btn.style.color = cor;
    }
    document.getElementById('modal-raca-select')?.close();
};

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
        if (salvo.raca) {
            racaSelect.value = salvo.raca;
            // Atualiza botão com o valor salvo
            const btn = document.getElementById('race-btn');
            if (btn && salvo.raca) {
                btn.textContent = racasDB[salvo.raca]?.nome || salvo.raca;
                btn.classList.remove('empty');
                const cor = RACA_VISUAL[salvo.raca]?.cor;
                if (cor) { btn.style.borderColor = cor; btn.style.color = cor; }
            }
        }
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