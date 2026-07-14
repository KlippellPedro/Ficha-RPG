let _edicaoRolagemPericia = null;

function criarElementoPericia(tag, className, texto) {
    const elemento = document.createElement(tag);
    if (className) elemento.className = className;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function adicionarLinhaCalculoPericia(container, rotulo, detalhe, valor, tipo = "normal") {
    const linha = criarElementoPericia("div", "pericia-calc-row");
    linha.dataset.tone = tipo;

    const textos = criarElementoPericia("div", "pericia-calc-row-copy");
    textos.appendChild(criarElementoPericia("strong", "", rotulo));
    if (detalhe) textos.appendChild(criarElementoPericia("small", "", detalhe));

    linha.appendChild(textos);
    linha.appendChild(criarElementoPericia("span", "pericia-calc-value", formatarBonusPericia(valor)));
    container.appendChild(linha);
}

function mostrarAjudaSkill(skillSlug) {
    const row = obterLinhaPericia(skillSlug);
    const calculo = row?._periciaCalculo;
    const modal = document.getElementById("modal-calc-ajuda");
    const title = document.getElementById("modal-calc-ajuda-title");
    const body = document.getElementById("modal-calc-ajuda-body");
    if (!row || !calculo || !modal || !title || !body) return;

    title.textContent = `Cálculo — ${calculo.skillName}`;
    body.replaceChildren();
    body.classList.add("pericia-calc-modal-body");

    const intro = criarElementoPericia("div", "pericia-calc-intro");
    intro.appendChild(criarElementoPericia("span", "modal-kicker", "Composição do resultado"));
    intro.appendChild(criarElementoPericia("p", "", `Teste baseado em ${calculo.attrLabel}.`));
    body.appendChild(intro);

    const formula = criarElementoPericia("div", "pericia-calc-formula");
    formula.textContent = "Atributo + treino + bônus manual + efeitos ativos";
    body.appendChild(formula);

    const linhas = criarElementoPericia("div", "pericia-calc-rows");
    adicionarLinhaCalculoPericia(
        linhas,
        `${calculo.attrLabel} · modificador`,
        "Modificador do atributo selecionado",
        calculo.attrMod,
        "attribute"
    );
    adicionarLinhaCalculoPericia(
        linhas,
        `Grau ${calculo.trainingLabel}`,
        `Calculado para o nível ${calculo.nivel}`,
        calculo.trainingBonus,
        "training"
    );
    adicionarLinhaCalculoPericia(
        linhas,
        "Bônus manual",
        "Valor informado diretamente nesta perícia",
        calculo.manualBonus,
        calculo.manualBonus < 0 ? "negative" : "normal"
    );
    adicionarLinhaCalculoPericia(
        linhas,
        "Itens, poderes e habilidades",
        calculo.effectSources.length ? `${calculo.effectSources.length} fonte(s) ativa(s)` : "Nenhum efeito alterando o resultado",
        calculo.effectBonus,
        calculo.effectBonus > 0 ? "positive" : calculo.effectBonus < 0 ? "negative" : "normal"
    );
    body.appendChild(linhas);

    if (calculo.effectSources.length) {
        const sources = criarElementoPericia("div", "pericia-calc-sources");
        sources.appendChild(criarElementoPericia("strong", "", "Fontes ativas"));
        const list = document.createElement("ul");
        calculo.effectSources.forEach(source => list.appendChild(criarElementoPericia("li", "", source)));
        sources.appendChild(list);
        body.appendChild(sources);
    }

    const roll = criarElementoPericia("div", "pericia-calc-roll");
    roll.dataset.state = calculo.rollState.tipo;
    roll.appendChild(criarElementoPericia("strong", "", calculo.rollState.titulo));
    roll.appendChild(criarElementoPericia("p", "", calculo.rollState.instrucao));
    body.appendChild(roll);

    const total = criarElementoPericia("div", "pericia-calc-total");
    total.appendChild(criarElementoPericia("span", "", "Resultado da perícia"));
    total.appendChild(criarElementoPericia("strong", "", formatarBonusPericia(calculo.total)));
    body.appendChild(total);

    modal.classList.add("pericia-calc-dialog");
    if (!modal.open) modal.showModal();
}

function abrirModalRolagemPericia(skillSlug) {
    const row = obterLinhaPericia(skillSlug);
    const modal = document.getElementById("modal-pericia-rolagem");
    const title = document.getElementById("modal-pericia-rolagem-title");
    if (!row || !modal || !title) return;

    const calculo = row._periciaCalculo || {};
    _edicaoRolagemPericia = {
        skillSlug: String(skillSlug),
        skillName: calculo.skillName || nomePericiaDaLinha(row),
        manualAdv: limitarContadorPericia(document.getElementById(`skill_adv_${skillSlug}`)?.value),
        manualDisadv: limitarContadorPericia(document.getElementById(`skill_disadv_${skillSlug}`)?.value),
        autoAdv: Math.max(0, numeroPericia(calculo.autoAdv)),
        autoDisadv: Math.max(0, numeroPericia(calculo.autoDisadv)),
        advSources: Array.isArray(calculo.advSources) ? calculo.advSources : [],
        disadvSources: Array.isArray(calculo.disadvSources) ? calculo.disadvSources : [],
        total: numeroPericia(calculo.total)
    };

    title.textContent = `Vantagens e desvantagens — ${_edicaoRolagemPericia.skillName}`;
    renderizarEditorRolagemPericia();
    if (!modal.open) modal.showModal();
}

function renderizarFontesAutomaticasPericia() {
    const container = document.getElementById("pericia-roll-auto-sources");
    if (!container || !_edicaoRolagemPericia) return;

    const { autoAdv, autoDisadv, advSources, disadvSources } = _edicaoRolagemPericia;
    const possuiFontes = autoAdv > 0 || autoDisadv > 0 || advSources.length > 0 || disadvSources.length > 0;
    container.replaceChildren();
    container.hidden = !possuiFontes;
    if (!possuiFontes) return;

    container.appendChild(criarElementoPericia("strong", "", "Efeitos automáticos ativos"));
    container.appendChild(criarElementoPericia("p", "", "Eles entram no saldo, mas não são alterados pelos controles abaixo."));
    const list = document.createElement("ul");

    if (advSources.length) {
        advSources.forEach(source => list.appendChild(criarElementoPericia("li", "roll-source-adv", source)));
    } else if (autoAdv > 0) {
        list.appendChild(criarElementoPericia("li", "roll-source-adv", `${autoAdv} vantagem(ns) automática(s)`));
    }

    if (disadvSources.length) {
        disadvSources.forEach(source => list.appendChild(criarElementoPericia("li", "roll-source-disadv", source)));
    } else if (autoDisadv > 0) {
        list.appendChild(criarElementoPericia("li", "roll-source-disadv", `${autoDisadv} desvantagem(ns) automática(s)`));
    }
    container.appendChild(list);
}

function renderizarEditorRolagemPericia() {
    if (!_edicaoRolagemPericia) return;
    const advOutput = document.getElementById("pericia-adv-value");
    const disadvOutput = document.getElementById("pericia-disadv-value");
    const summary = document.getElementById("pericia-roll-summary");
    const summaryTitle = document.getElementById("pericia-roll-summary-title");
    const summaryText = document.getElementById("pericia-roll-summary-text");

    if (advOutput) advOutput.textContent = _edicaoRolagemPericia.manualAdv;
    if (disadvOutput) disadvOutput.textContent = _edicaoRolagemPericia.manualDisadv;

    const totalAdv = _edicaoRolagemPericia.manualAdv + _edicaoRolagemPericia.autoAdv;
    const totalDisadv = _edicaoRolagemPericia.manualDisadv + _edicaoRolagemPericia.autoDisadv;
    const estado = calcularEstadoRolagemPericia(totalAdv, totalDisadv, _edicaoRolagemPericia.total);

    if (summary) summary.dataset.state = estado.tipo;
    if (summaryTitle) summaryTitle.textContent = estado.titulo;
    if (summaryText) summaryText.textContent = `${estado.detalhe}. ${estado.instrucao}`;
    renderizarFontesAutomaticasPericia();
}

function ajustarRolagemPericia(tipo, delta) {
    if (!_edicaoRolagemPericia) return;
    const chave = tipo === "desvantagem" ? "manualDisadv" : "manualAdv";
    _edicaoRolagemPericia[chave] = limitarContadorPericia(_edicaoRolagemPericia[chave] + numeroPericia(delta));
    renderizarEditorRolagemPericia();
}

function zerarRolagemPericia() {
    if (!_edicaoRolagemPericia) return;
    _edicaoRolagemPericia.manualAdv = 0;
    _edicaoRolagemPericia.manualDisadv = 0;
    renderizarEditorRolagemPericia();
}

function aplicarRolagemPericia() {
    if (!_edicaoRolagemPericia) return;
    const { skillSlug, manualAdv, manualDisadv } = _edicaoRolagemPericia;
    const advInput = document.getElementById(`skill_adv_${skillSlug}`);
    const disadvInput = document.getElementById(`skill_disadv_${skillSlug}`);
    if (advInput) advInput.value = limitarContadorPericia(manualAdv);
    if (disadvInput) disadvInput.value = limitarContadorPericia(manualDisadv);
    if (typeof atualizarTudo === "function") atualizarTudo();
    fecharModalRolagemPericia();
}

function fecharModalRolagemPericia() {
    const modal = document.getElementById("modal-pericia-rolagem");
    if (!modal) return;
    if (typeof fecharDialogoAnimado === "function") fecharDialogoAnimado(modal);
    else if (modal.open) modal.close();
    _edicaoRolagemPericia = null;
}

// Compatibilidade com chamadas antigas que abriam apenas as fontes de vantagem.
function mostrarAjudaVantagem(skillSlug) {
    abrirModalRolagemPericia(skillSlug);
}
