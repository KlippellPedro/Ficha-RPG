const PERICIA_ATRIBUTOS = Object.freeze({
    forca: "Força",
    destreza: "Destreza",
    constituicao: "Constituição",
    inteligencia: "Inteligência",
    sabedoria: "Sabedoria",
    carisma: "Carisma",
    aura: "Aura"
});

const PERICIA_TREINOS = Object.freeze({
    nenhum: "Nenhum",
    treinado: "Treinado",
    profissional: "Profissional",
    mestre: "Mestre",
    anciao: "Ancião"
});

function lerDadosPericiasSalvos() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
        console.error("Não foi possível ler os dados salvos das perícias.", error);
        return {};
    }
}

function numeroPericia(valor, padrao = 0) {
    const numero = Number.parseInt(valor, 10);
    return Number.isFinite(numero) ? numero : padrao;
}

function limitarContadorPericia(valor) {
    return Math.max(0, Math.min(20, numeroPericia(valor)));
}

function formatarBonusPericia(valor) {
    const numero = numeroPericia(valor);
    return `${numero >= 0 ? "+" : ""}${numero}`;
}

function escaparHtmlPericia(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

function nomePericiaDaLinha(row) {
    return row?.querySelector(".static-skill-name")?.textContent?.trim()
        || row?.querySelector(".skill-name-input")?.value?.trim()
        || "Perícia";
}

function obterLinhaPericia(skillSlug) {
    return Array.from(document.querySelectorAll("#skills-container .skill-row"))
        .find(row => row.dataset.skillSlug === String(skillSlug)) || null;
}

function opcoesAtributoPericia(selecionado) {
    return Object.entries(PERICIA_ATRIBUTOS).map(([valor, rotulo]) =>
        `<option value="${valor}" ${valor === selecionado ? "selected" : ""}>${rotulo}</option>`
    ).join("");
}

function opcoesTreinoPericia(selecionado) {
    return Object.entries(PERICIA_TREINOS).map(([valor, rotulo]) =>
        `<option value="${valor}" ${valor === selecionado ? "selected" : ""}>${rotulo}</option>`
    ).join("");
}

function criarMarkupPericia({ slug, nome, attr, treino, bonus, vantagem, desvantagem, customizada = false }) {
    const safeSlug = escaparHtmlPericia(slug);
    const safeNome = escaparHtmlPericia(nome);
    const attrLabel = PERICIA_ATRIBUTOS[attr] || "Atributo";
    const nomeMarkup = customizada
        ? `<input type="text" id="skill_name_${safeSlug}" class="save-input skill-name-input" value="${safeNome}" placeholder="Nome do ofício" oninput="filtrarPericias()" />`
        : `<span class="skill-name static-skill-name">${safeNome}</span>`;

    return `
        <div class="skill-card-head">
            <div class="skill-identity">
                ${nomeMarkup}
                <small>Teste baseado em <span class="skill-attr-description">${escaparHtmlPericia(attrLabel)}</span>.</small>
            </div>

            <label class="skill-field skill-attribute-field">
                <span>Atributo</span>
                <select id="skill_attr_${safeSlug}" class="save-input skill-attr-selector" onchange="atualizarDescricaoAtributoPericia(this); atualizarTudo()">
                    ${opcoesAtributoPericia(attr)}
                </select>
            </label>

            <button type="button" class="btn-calc-ajuda pericia-help-btn" onclick="mostrarAjudaSkill(this.closest('.skill-row').dataset.skillSlug)" title="Ver detalhes do cálculo" aria-label="Ver cálculo de ${safeNome}">?</button>
            ${customizada ? `<button type="button" class="btn-remove-skill" onclick="removerOficioPericia(this.closest('.skill-row'))" title="Remover perícia" aria-label="Remover ${safeNome}">×</button>` : ""}
        </div>

        <div class="skill-card-controls">
            <label class="skill-field skill-training-field">
                <span>Grau de treino</span>
                <select id="skill_train_${safeSlug}" class="save-input skill-training-select" onchange="atualizarTudo()">
                    ${opcoesTreinoPericia(treino)}
                </select>
            </label>

            <label class="skill-field skill-bonus-field">
                <span>Bônus manual</span>
                <input type="number" id="skill_bonus_${safeSlug}" class="save-input skill-bonus" value="${numeroPericia(bonus)}" oninput="atualizarTudo()" />
            </label>

            <button type="button" class="skill-roll-state" data-state="normal" onclick="abrirModalRolagemPericia(this.closest('.skill-row').dataset.skillSlug)">
                <span class="skill-roll-state-label">Normal</span>
                <small class="skill-roll-state-detail">Vantagem / desvantagem</small>
            </button>

            <div class="skill-total-box" title="Resultado da perícia">
                <span class="skill-total-caption">Resultado</span>
                <output class="skill-total">+0</output>
            </div>
        </div>

        <input type="hidden" id="skill_adv_${safeSlug}" class="save-input skill-adv" value="${limitarContadorPericia(vantagem)}" />
        <input type="hidden" id="skill_disadv_${safeSlug}" class="save-input skill-disadv" value="${limitarContadorPericia(desvantagem)}" />
    `;
}

function renderPericias() {
    const container = document.getElementById("skills-container");
    if (!container) return;

    const salvo = lerDadosPericiasSalvos();
    container.innerHTML = listaPericias.map(pericia => {
        const slug = pericia.nome.toLowerCase().replace(/\s/g, "_");
        const rowClass = "skill-row";
        const rowMarkup = criarMarkupPericia({
            slug,
            nome: pericia.nome,
            attr: salvo[`skill_attr_${slug}`] || pericia.attr,
            treino: salvo[`skill_train_${slug}`] || "nenhum",
            bonus: salvo[`skill_bonus_${slug}`] ?? 0,
            vantagem: salvo[`skill_adv_${slug}`] ?? 0,
            desvantagem: salvo[`skill_disadv_${slug}`] ?? 0
        });

        return `<article class="${rowClass}" data-skill-slug="${escaparHtmlPericia(slug)}">${rowMarkup}</article>`;
    }).join("");
}

function adicionarOficioUI(nome = "Novo Ofício", attr = "inteligencia", training = "nenhum", bonus = 0, adv = 0, idIndex = null, disadv = 0) {
    const container = document.getElementById("skills-container");
    if (!container) return;

    const index = idIndex !== null ? String(idIndex) : `oficio_${Date.now()}`;
    const row = document.createElement("article");
    row.className = "skill-row dynamic-skill";
    row.dataset.skillSlug = index;
    row.innerHTML = criarMarkupPericia({
        slug: index,
        nome,
        attr: PERICIA_ATRIBUTOS[attr] ? attr : "inteligencia",
        treino: PERICIA_TREINOS[training] ? training : "nenhum",
        bonus,
        vantagem: adv,
        desvantagem: disadv,
        customizada: true
    });
    container.appendChild(row);

    if (idIndex === null) {
        atualizarTudo();
        filtrarPericias();
        row.querySelector(".skill-name-input")?.focus();
    }
}

function removerOficioPericia(row) {
    if (!row?.classList.contains("dynamic-skill")) return;
    const ids = Array.from(row.querySelectorAll("[id]")).map(elemento => elemento.id);
    const dados = lerDadosPericiasSalvos();
    ids.forEach(id => delete dados[id]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarPericias();
}

function atualizarDescricaoAtributoPericia(select) {
    const descricao = select?.closest(".skill-row")?.querySelector(".skill-attr-description");
    if (descricao) descricao.textContent = PERICIA_ATRIBUTOS[select.value] || "Atributo";
}

function coletarFontesPericia(breakdown, chaves) {
    if (!breakdown) return [];
    const grupos = ["itens", "poderes", "habilidades"];
    return grupos.flatMap(grupo => chaves.flatMap(chave => {
        const fontes = breakdown?.[grupo]?.[chave];
        return Array.isArray(fontes) ? fontes.map(String) : [];
    }));
}

function calcularEstadoRolagemPericia(vantagens, desvantagens, bonus = 0) {
    const totalV = Math.max(0, numeroPericia(vantagens));
    const totalD = Math.max(0, numeroPericia(desvantagens));
    const saldo = totalV - totalD;
    const bonusTexto = formatarBonusPericia(bonus);

    if (saldo > 0) {
        return {
            tipo: "vantagem",
            rotulo: `V +${saldo}`,
            detalhe: `${totalV}V − ${totalD}D`,
            titulo: `Vantagem +${saldo}`,
            instrucao: `Role 2d20, use o maior resultado e some ${bonusTexto}.`
        };
    }
    if (saldo < 0) {
        return {
            tipo: "desvantagem",
            rotulo: `D +${Math.abs(saldo)}`,
            detalhe: `${totalV}V − ${totalD}D`,
            titulo: `Desvantagem +${Math.abs(saldo)}`,
            instrucao: `Role 2d20, use o menor resultado e some ${bonusTexto}.`
        };
    }
    if (totalV > 0 || totalD > 0) {
        return {
            tipo: "neutro",
            rotulo: "Neutro",
            detalhe: `${totalV}V − ${totalD}D`,
            titulo: "Fontes anuladas",
            instrucao: `As vantagens e desvantagens se anulam. Role 1d20 e some ${bonusTexto}.`
        };
    }
    return {
        tipo: "normal",
        rotulo: "Normal",
        detalhe: "Vantagem / desvantagem",
        titulo: "Rolagem normal",
        instrucao: `Role 1d20 e some ${bonusTexto}.`
    };
}

function atualizarPericias(nivel, mods, bonusItens = {}, dadosObj = {}, breakdown = null) {
    const nivelAtual = Math.max(0, numeroPericia(nivel));
    let treinadas = 0;

    document.querySelectorAll(".skill-row").forEach(row => {
        const skillSlug = row.dataset.skillSlug || row.querySelector(".skill-bonus")?.id.replace("skill_bonus_", "");
        if (!skillSlug) return;

        const training = document.getElementById(`skill_train_${skillSlug}`)?.value || "nenhum";
        const selectedAttr = document.getElementById(`skill_attr_${skillSlug}`)?.value || "forca";
        const bonusManual = numeroPericia(document.getElementById(`skill_bonus_${skillSlug}`)?.value);
        const advInput = document.getElementById(`skill_adv_${skillSlug}`);
        const disadvInput = document.getElementById(`skill_disadv_${skillSlug}`);
        const manualAdv = limitarContadorPericia(advInput?.value);
        const manualDisadv = limitarContadorPericia(disadvInput?.value);

        // Valores negativos nas chaves antigas de vantagem passam a representar
        // desvantagem. As chaves "disadv_*" mantêm compatibilidade com fontes futuras.
        const autoAdvDelta = numeroPericia(bonusItens[`adv_${skillSlug}`]) + numeroPericia(bonusItens.adv_todas);
        const autoDisadvExplicita = numeroPericia(bonusItens[`disadv_${skillSlug}`]) + numeroPericia(bonusItens.disadv_todas);
        const autoAdv = Math.max(0, autoAdvDelta);
        const autoDisadv = Math.max(0, autoDisadvExplicita) + Math.max(0, -autoAdvDelta);
        const totalAdv = manualAdv + autoAdv;
        const totalDisadv = manualDisadv + autoDisadv;

        dadosObj[`skill_adv_${skillSlug}`] = manualAdv;
        dadosObj[`skill_disadv_${skillSlug}`] = manualDisadv;
        if (advInput) advInput.value = manualAdv;
        if (disadvInput) disadvInput.value = manualDisadv;

        const attrMod = numeroPericia(mods?.[selectedAttr]);
        const itemSkillBonus = numeroPericia(bonusItens[skillSlug]) + numeroPericia(bonusItens.todas);
        const tBonus = {
            nenhum: 0,
            treinado: Math.floor(nivelAtual / 2),
            profissional: Math.floor(nivelAtual / 2) + 4,
            mestre: nivelAtual + 4,
            anciao: nivelAtual + 6
        }[training] || 0;
        const total = tBonus + attrMod + bonusManual + itemSkillBonus;

        row.classList.remove("treinado", "profissional", "mestre", "anciao");
        if (training !== "nenhum") {
            row.classList.add(training);
            treinadas += 1;
        }
        row.dataset.bonusState = itemSkillBonus > 0 ? "positive" : itemSkillBonus < 0 ? "negative" : "neutral";

        const legacyAdvSources = coletarFontesPericia(breakdown, [`adv_${skillSlug}`, "adv_todas"]);
        const advSources = autoAdvDelta > 0 ? legacyAdvSources : [];
        const disadvSources = [
            ...coletarFontesPericia(breakdown, [`disadv_${skillSlug}`, "disadv_todas"]),
            ...(autoAdvDelta < 0 ? legacyAdvSources : [])
        ];
        const skillSources = coletarFontesPericia(breakdown, [skillSlug, "todas"]);
        const rollState = calcularEstadoRolagemPericia(totalAdv, totalDisadv, total);

        const rollButton = row.querySelector(".skill-roll-state");
        if (rollButton) {
            rollButton.dataset.state = rollState.tipo;
            rollButton.querySelector(".skill-roll-state-label").textContent = rollState.rotulo;
            rollButton.querySelector(".skill-roll-state-detail").textContent = rollState.detalhe;
            rollButton.title = rollState.instrucao;
        }

        const display = row.querySelector(".skill-total");
        if (display) {
            display.textContent = formatarBonusPericia(total);
            display.title = `Total ${formatarBonusPericia(total)}: atributo ${formatarBonusPericia(attrMod)}, treino ${formatarBonusPericia(tBonus)}, manual ${formatarBonusPericia(bonusManual)}, efeitos ${formatarBonusPericia(itemSkillBonus)}.`;
        }

        row._periciaCalculo = {
            skillSlug,
            skillName: nomePericiaDaLinha(row),
            nivel: nivelAtual,
            selectedAttr,
            attrLabel: PERICIA_ATRIBUTOS[selectedAttr] || selectedAttr,
            attrMod,
            training,
            trainingLabel: PERICIA_TREINOS[training] || training,
            trainingBonus: tBonus,
            manualBonus: bonusManual,
            effectBonus: itemSkillBonus,
            effectSources: skillSources,
            manualAdv,
            autoAdv,
            totalAdv,
            advSources,
            manualDisadv,
            autoDisadv,
            totalDisadv,
            disadvSources,
            total,
            rollState
        };
    });

    const trainedCounter = document.getElementById("skills-trained-count");
    if (trainedCounter) trainedCounter.textContent = treinadas;
}

document.addEventListener("DOMContentLoaded", () => {
    renderPericias();

    const salvo = lerDadosPericiasSalvos();
    const oficiosIds = new Set();
    Object.keys(salvo).forEach(key => {
        if (key.startsWith("skill_name_oficio_")) oficiosIds.add(key.replace("skill_name_", ""));
    });

    oficiosIds.forEach(id => {
        adicionarOficioUI(
            salvo[`skill_name_${id}`],
            salvo[`skill_attr_${id}`],
            salvo[`skill_train_${id}`],
            salvo[`skill_bonus_${id}`],
            salvo[`skill_adv_${id}`] || 0,
            id,
            salvo[`skill_disadv_${id}`] || 0
        );
    });

    if (typeof atualizarTudo === "function") atualizarTudo();
    filtrarPericias();
});

let _filtroAttrPericia = "todos";

function filtrarPericiasPorAttr(btn) {
    _filtroAttrPericia = btn.dataset.attr;
    document.querySelectorAll(".btn-attr-filter").forEach(button => button.classList.remove("active"));
    btn.classList.add("active");
    filtrarPericias();
}

function filtrarPericias() {
    const termo = document.getElementById("search-pericia")?.value.toLocaleLowerCase("pt-BR").trim() || "";
    const rows = Array.from(document.querySelectorAll("#skills-container .skill-row"));
    let visiveis = 0;

    rows.forEach(row => {
        const nome = nomePericiaDaLinha(row).toLocaleLowerCase("pt-BR");
        const attrSel = row.querySelector('[id^="skill_attr_"]')?.value || "";
        const matchNome = nome.includes(termo);
        const matchAttr = _filtroAttrPericia === "todos" || attrSel === _filtroAttrPericia;
        row.hidden = !(matchNome && matchAttr);
        if (!row.hidden) visiveis += 1;
    });

    const counter = document.getElementById("skills-visible-count");
    if (counter) counter.textContent = `${visiveis} de ${rows.length}`;
}

function resetarFiltrosPericias() {
    const search = document.getElementById("search-pericia");
    if (search) search.value = "";
    _filtroAttrPericia = "todos";
    document.querySelectorAll(".btn-attr-filter").forEach(button => button.classList.remove("active"));
    document.querySelector('.btn-attr-filter[data-attr="todos"]')?.classList.add("active");
    filtrarPericias();
    if (typeof showNotification === "function") showNotification("Filtros de perícias limpos", "info", 2000);
}
