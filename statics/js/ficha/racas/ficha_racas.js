/**
 * Lógica específica para raças e traços raciais
 */

// ── Configuração visual das raças (cor de destaque) ───────────────
const RACA_VISUAL = {
    humano:     { cor: '#a0a0b0' },
    vampiro:    { cor: '#8b0000' },
    espirito:   { cor: '#00d4ff' },
    morto_vivo: { cor: '#660066' },
    animalia:   { cor: '#c97b2c' },
    goblin:     { cor: '#4ade80' },
    fada:       { cor: '#f0abfc' },
    anao:       { cor: '#a0522d' },
    elfo:       { cor: '#86efac' },
    demonio:    { cor: '#ff4444' },
    anjo:       { cor: '#f59e0b' },
    semideus:   { cor: '#a78bfa' },
    deus:       { cor: '#ffd700' },
    escolhido:  { cor: '#fb923c' },
    corrompido: { cor: '#7e22ce' },
    hibrido:    { cor: '#22d3ee' },
    kitsune:    { cor: '#ff7043' },
};

// ── Nome amigável de cada expansão (DLC) ──────────────────────────
const RACA_DLC_NOME = {
    atual: 'Atual',
    normalidade: 'Normalidade',
    passado: 'Passado',
    futuro: 'Futuro',
    olimpo: 'Olimpo',
};

// ── Modal de seleção de raça ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const modalHtml = `
        <dialog id="modal-raca-select" class="modal-overlay">
            <div class="modal-content" style="max-width:680px;width:95%;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color:var(--primary-color)">Escolher Raça</h3>
                    <button type="button" class="btn-remove-class" onclick="fecharDialogoAnimado(this.closest('dialog'))">×</button>
                </div>
                <div style="padding: 4px 0 8px 0;">
                    <input type="text" id="modal-raca-search"
                           placeholder="🔍  Buscar raça..."
                           oninput="filtrarModalRaca(this.value)"
                           style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:white;font-size:0.85rem;outline:none;box-sizing:border-box;"
                    />
                </div>
                <div class="modal-body" id="modal-raca-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;max-height:64vh;overflow-y:auto;padding:6px 2px;"></div>
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
            const vis = RACA_VISUAL[key] || { cor: '#888' };
            const isSelected = key === currentVal;
            const expansao = RACA_DLC_NOME[r.dlc] || (r.dlc ? r.dlc.charAt(0).toUpperCase() + r.dlc.slice(1) : '');
            const dlcBadge = expansao
                ? `<span style="font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;background:rgba(${hexToRgbStr(vis.cor)},0.12);color:${vis.cor};border:1px solid rgba(${hexToRgbStr(vis.cor)},0.3);border-radius:4px;padding:2px 8px;opacity:0.85;">${expansao}</span>`
                : '';
            return `
                <div data-raca-card data-raca-nome="${r.nome.toLowerCase()}"
                     onclick="confirmarSelecionarRaca('${key}')"
                     style="
                        cursor:pointer;border-radius:10px;padding:24px 16px;text-align:center;
                        border:1px solid ${isSelected ? vis.cor : 'rgba(255,255,255,0.07)'};
                        background:${isSelected ? `rgba(${hexToRgbStr(vis.cor)},0.15)` : 'rgba(255,255,255,0.02)'};
                        box-shadow:${isSelected ? `0 0 16px rgba(${hexToRgbStr(vis.cor)},0.35)` : 'none'};
                        transition:all 0.2s;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;min-height:96px;
                     "
                     onmouseenter="this.style.borderColor='${vis.cor}';this.style.background='rgba(${hexToRgbStr(vis.cor)},0.1)';this.style.transform='translateY(-3px)'"
                     onmouseleave="this.style.borderColor='${isSelected ? vis.cor : 'rgba(255,255,255,0.07)'}';this.style.background='${isSelected ? `rgba(${hexToRgbStr(vis.cor)},0.15)` : 'rgba(255,255,255,0.02)'}';this.style.transform=''">
                    <span style="font-family:var(--font-heading,serif);font-size:1.05rem;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${vis.cor};text-shadow:0 0 10px rgba(${hexToRgbStr(vis.cor)},0.45);">${r.nome}</span>
                    ${dlcBadge}
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
    fecharDialogoAnimado(document.getElementById('modal-raca-select'));
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
    const condSection = document.getElementById("section-condicao-fada");
    const famSection = document.getElementById("section-familia-fada");
    if (condSection) condSection.style.display = active ? 'block' : 'none';
    if (famSection) famSection.style.display = active ? 'block' : 'none';

    const familiaKey = dados.fada_familia || document.getElementById("fada_familia")?.value;
    const display = document.getElementById("display-familia-fada");
    if (display) {
        const f = (window.FAMILIAS_FADA || {})[familiaKey];
        if (f) {
            display.style.color = "";
            display.innerHTML =
                `<strong style="color:${f.cor};font-size:0.95rem;">${f.nome}</strong>` +
                `<br><span style="color:#ccc;font-size:0.8rem;line-height:1.4;">${f.desc}</span>` +
                `<br><span style="font-size:0.78rem;"><b>Cores:</b> ${f.cores}</span>` +
                `<br><span style="color:#ccc;font-size:0.78rem;">${f.bonus.join('<br>')}</span>` +
                `<br><span style="color:var(--primary-color);font-size:0.75rem;font-weight:bold;">Magias: ${f.magias.join(' • ')}</span>`;
        } else {
            display.innerHTML = "Nenhuma família selecionada";
            display.style.color = "#ccc";
        }
    }
}

/**
 * Concede/remove automaticamente as magias da Família das Fadas conforme o nível.
 * - Adiciona a magia na aba de Magias (entrada com nome + tier) quando o nível é atingido.
 * - Avisa o desbloqueio ("Você desbloqueou X pela raça Fada (Família Y)").
 * - Remove as magias da família anterior ao trocar de família ou deixar de ser Fada.
 * - Respeita remoção manual: uma magia já concedida não volta sozinha se a pessoa apagar.
 * As mudanças são feitas no objeto `dados`, que é persistido no fim de atualizarTudo().
 */
function aplicarMagiasFamiliaFada(dados) {
    if (typeof window.FAMILIAS_FADA === 'undefined') return;

    const fadaAtiva = isRacaAtiva('fada', dados);
    const familiaKey = dados.fada_familia || document.getElementById('fada_familia')?.value || '';
    const familia = window.FAMILIAS_FADA[familiaKey];
    const nivel = parseInt(dados.nivel) || 1;

    // idx válidos AGORA: Fada ativa + família escolhida + nível suficiente
    const validos = {};
    if (fadaAtiva && familia && Array.isArray(familia.grants)) {
        familia.grants.forEach(g => {
            if (nivel >= g.nivel) validos[`fada_${familiaKey}_${g.key}`] = { g, familia };
        });
    }

    let concedidas = Array.isArray(dados.fada_magias_dadas) ? dados.fada_magias_dadas.slice() : [];

    // 1. Remove as que não são mais válidas (troca de família/raça ou queda de nível)
    concedidas.filter(idx => !validos[idx]).forEach(idx => {
        Object.keys(dados).forEach(k => { if (k.startsWith('mag_') && k.endsWith(`_${idx}`)) delete dados[k]; });
        const row = document.querySelector(`.item-row[data-index="${idx}"]`);
        if (row) row.remove();
    });
    concedidas = concedidas.filter(idx => validos[idx]);

    // 2. Adiciona as novas válidas ainda não concedidas
    Object.keys(validos).forEach(idx => {
        if (concedidas.includes(idx)) return; // já concedida antes — respeita remoção manual
        const { g, familia: fam } = validos[idx];
        dados[`mag_nome_${idx}`] = g.nome;
        dados[`mag_tipo_${idx}`] = 'Comum';
        dados[`mag_nivel_${idx}`] = String(g.tier);
        dados[`mag_custo_${idx}`] = '';
        dados[`mag_tipo_custo_${idx}`] = 'PM';
        dados[`mag_desc_${idx}`] = `Magia concedida pela raça Fada — ${fam.nome}.`;
        dados[`mag_duracao_${idx}`] = '';
        dados[`mag_alcance_${idx}`] = '';
        dados[`mag_acao_${idx}`] = '';
        dados[`mag_teste_${idx}`] = '';
        dados[`mag_mods_${idx}`] = '[]';
        dados[`mag_buff_ativo_${idx}`] = 'false';
        concedidas.push(idx);

        // Renderiza ao vivo caso esteja na aba de Magias
        if (typeof adicionarMagiaUI === 'function' && document.getElementById('magias-container') &&
            !document.querySelector(`.item-row[data-index="${idx}"]`)) {
            adicionarMagiaUI(g.nome, 'Comum', String(g.tier), '', 'PM', dados[`mag_desc_${idx}`], idx, '', '', '', '', '[]', 'false');
        }

        if (typeof showNotification === 'function') {
            showNotification(`Você desbloqueou "${g.nome}" pela raça Fada (${fam.nome})!`, 'success', 5000);
        }
    });

    dados.fada_magias_dadas = concedidas;
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
        const p = (window.PODERES_ESPIRITO || {})[poderAtivo];
        if (p) {
            displayPoder.style.color = "";
            displayPoder.innerHTML = `<strong style="color:#ff4444;">${p.nome}</strong><br><span style="color:#ccc;font-size:0.8rem;line-height:1.4;">${p.desc}</span>${p.custo ? `<br><span style="color:var(--primary-color);font-size:0.72rem;font-weight:bold;">${p.custo}</span>` : ''}`;
        } else {
            displayPoder.innerHTML = "Nenhum poder selecionado";
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
        const p = (window.PODERES_MORTO || {})[poderAtivo];
        if (p) {
            displayPoder.style.color = "";
            displayPoder.innerHTML = `<strong style="color:#ff4444;">${p.nome}</strong><br><span style="color:#ccc;font-size:0.8rem;line-height:1.4;">${p.desc}</span>`;
        } else {
            displayPoder.innerHTML = "Nenhum poder selecionado";
            displayPoder.style.color = "#ccc";
        }
    }
}

function verificarExtraAnimalia(dados) {
    const active = isRacaAtiva("animalia", dados);
    const condSection = document.getElementById("section-condicao-animalia");
    const powerSection = document.getElementById("section-poder-animalia");
    if (condSection) condSection.style.display = active ? 'block' : 'none';
    if (powerSection) powerSection.style.display = active ? 'block' : 'none';

    const poderAtivo = dados.animalia_poder || document.getElementById("animalia_poder")?.value;
    const displayPoder = document.getElementById("display-poder-animalia");
    if (displayPoder) {
        const p = (window.PODERES_ANIMALIA || {})[poderAtivo];
        if (p) {
            displayPoder.style.color = "";
            displayPoder.innerHTML = `<strong style="color:#ff4444;">${p.nome}</strong><br><span style="color:#ccc;font-size:0.8rem;line-height:1.4;">${p.desc}</span>`;
        } else {
            displayPoder.innerHTML = "Nenhum poder selecionado";
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