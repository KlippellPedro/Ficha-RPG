/**
 * Lógica para gerenciar a lista dinâmica de habilidades
 */

let habSendoEditadaIdx = null;
let currentHabModEditIdx = null;

/**
 * Gera as opções de classe baseadas nas classes que o personagem possui
 */
function getOpcoesClassesHab(valorSelecionado = "") {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const classes = getClassesAtivas(dados);
    let opcoes = `<option value="Geral" ${valorSelecionado === 'Geral' || !valorSelecionado ? 'selected' : ''}>Geral</option>`;
    opcoes += `<option value="Raça" ${valorSelecionado === 'Raça' ? 'selected' : ''}>Raça</option>`;
    opcoes += `<option value="Povo" ${valorSelecionado === 'Povo' ? 'selected' : ''}>Povo</option>`;
    opcoes += `<option value="Outro" ${valorSelecionado === 'Outro' ? 'selected' : ''}>Outro</option>`;

    classes.forEach(c => {
        const nomeFormatado = c.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const valor = c.sub ? `${c.name}_${c.sub}` : c.name;
        const label = c.sub ? `${nomeFormatado} (${c.sub})` : nomeFormatado;
        opcoes += `<option value="${valor}" ${valorSelecionado === valor ? 'selected' : ''}>${label}</option>`;
    });

    return opcoes;
}

/**
 * Atualiza as opções do select de filtro para baterem com as classes e origens disponíveis
 */
function atualizarFiltroHabilidadesUI() {
    const filterSelect = document.getElementById('filter-habilidade-classe');
    if (!filterSelect) return;

    const valorAtual = filterSelect.value;
    filterSelect.innerHTML = `<option value="todos">Todas as Fontes</option>` + getOpcoesClassesHab(valorAtual);
}

function adicionarHabilidadeUI(nome = "", tipo = "Ativa", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", mods = "[]") {
    const container = document.getElementById('habilidades-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now(); // Usa timestamp para ID único

    const row = document.createElement('div');
    row.className = 'item-row hab-row-grid';
    row.dataset.index = index;

    row.innerHTML = `
        <input type="text" id="hab_nome_${index}" class="save-input inv-input" placeholder="Nome" value="${nome}">
        <select id="hab_classe_${index}" class="save-input inv-input" onchange="atualizarTudo()">
            ${getOpcoesClassesHab(classe)} 
        </select>
        <div style="display:flex; gap:5px;">
            <input type="text" id="hab_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="hab_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        
        <button type="button" class="btn-open-desc" onclick="abrirModalHab('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarHabilidade('${index}')">Usar</button>
        <button type="button" class="btn-open-desc" onclick="duplicarHabilidade('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerHabilidade(this)">×</button>

        <div style="display:none">
            <!-- Campos ocultos para detalhes -->
            <textarea id="hab_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="hab_tipo_${index}" class="save-input" value="${tipo}">
            <input type="hidden" id="hab_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="hab_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="hab_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="hab_mods_${index}" class="save-input" value='${mods}'>
        </div>
    `;

    container.appendChild(row);
    // Salva imediatamente para persistir o item recém-adicionado
    if (idIndex === null) {
        atualizarTudo();
        filtrarHabilidades();
    }
}

function abrirModalHab(index) {
    habSendoEditadaIdx = index;
    const nome = document.getElementById(`hab_nome_${index}`).value;
    const tipo = document.getElementById(`hab_tipo_${index}`)?.value || "Ativa";
    const classe = document.getElementById(`hab_classe_${index}`).value;
    // Lê os valores diretamente dos inputs da linha para garantir que estejam atualizados
    const custo = document.getElementById(`hab_custo_${index}`)?.value || "";
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`)?.value || "PM";
    const desc = document.getElementById(`hab_desc_${index}`)?.value || "";
    const duracao = document.getElementById(`hab_duracao_${index}`)?.value || "";
    const alcance = document.getElementById(`hab_alcance_${index}`)?.value || "";
    const acao = document.getElementById(`hab_acao_${index}`)?.value || "";

    // DEBUG: Verifique os valores lidos dos campos ocultos
    console.warn(`[DEBUG Habilidades] Lendo para modal - Duração: "${duracao}", Alcance: "${alcance}", Ação: "${acao}" para index: ${index}`);
    // Se você vir "PM" ou um número grande aqui, significa que os dados no localStorage estão corrompidos.
    // Para corrigir, você precisará apagar a habilidade e recriá-la, ou limpar o localStorage.

    document.getElementById('modal-hab-title').innerText = `Detalhes: ${nome || "Habilidade"}`;

    const body = document.getElementById('modal-hab-body');
    body.innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Origem</label>
                <select id="modal_hab_classe" class="inv-input">
                    ${getOpcoesClassesHab(classe)}
                </select>
            </div>
            <div class="input-group"><label>Tipo de Efeito</label>
                <select id="modal_hab_tipo" class="inv-input" onchange="document.getElementById('hab-buff-btn-container').style.display = this.value === 'Passiva' ? 'block' : 'none';">
                    <option value="Ativa" ${tipo === 'Ativa' ? 'selected' : ''}>Ativa</option>
                    <option value="Passiva" ${tipo === 'Passiva' ? 'selected' : ''}>Passiva</option>
                    <option value="Reação" ${tipo === 'Reação' ? 'selected' : ''}>Reação</option>
                    <option value="Outro" ${tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div class="input-group"><label>Custo</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="modal_hab_custo" class="inv-input" value="${custo}" style="flex:1;">
                    <select id="modal_hab_tipo_custo" class="inv-input" style="width:80px;">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Duração</label>
                <input type="text" id="modal_hab_duracao" class="inv-input" value="${duracao}">
            </div>
            <div class="input-group">
                <label>Alcance</label>
                <input type="text" id="modal_hab_alcance" class="inv-input" value="${alcance}">
            </div>
        </div>
        <div class="input-group">
            <label>Ação</label>
            <input type="text" id="modal_hab_acao" class="inv-input" value="${acao}">
        </div>

        <div class="input-group" id="hab-buff-btn-container" style="display: ${tipo === 'Passiva' ? 'block' : 'none'}">
            <label>Configurações de Buff</label>
            <button type="button" class="btn-save-modal" style="width:100%; background: #4ade80; color: #000; border: 1px solid #166534;" onclick="abrirModalBuffsHab('${index}')">Definir Buffs</button>
        </div>

        <div class="input-group">
            <label>Descrição e Efeito</label>
            <textarea id="modal_hab_desc" class="inv-input" style="min-height: 200px">${desc}</textarea>
        </div>
    `;

    const modal = document.getElementById('modal-hab');
    const footer = modal ? modal.querySelector('.modal-footer') : null;
    if (footer) {
        footer.style.justifyContent = 'space-between';
        footer.innerHTML = `
            <button type="button" class="btn-use-skill" onclick="usarHabilidade('${index}')">Usar Habilidade</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesHab()">Salvar e Fechar</button>
        `;
    }

    modal.style.display = 'flex';
}

function fecharModalHab() {
    document.getElementById('modal-hab').style.display = 'none';
    habSendoEditadaIdx = null;
}

function salvarDetalhesHab() {
    if (habSendoEditadaIdx !== null) {
        const idx = habSendoEditadaIdx;
        document.getElementById(`hab_classe_${idx}`).value = document.getElementById('modal_hab_classe').value;
        if (document.getElementById(`hab_tipo_${idx}`)) document.getElementById(`hab_tipo_${idx}`).value = document.getElementById('modal_hab_tipo').value;
        document.getElementById(`hab_custo_${idx}`).value = document.getElementById('modal_hab_custo').value;
        document.getElementById(`hab_tipo_custo_${idx}`).value = document.getElementById('modal_hab_tipo_custo').value;
        document.getElementById(`hab_desc_${idx}`).value = document.getElementById('modal_hab_desc').value;
        document.getElementById(`hab_duracao_${idx}`).value = document.getElementById('modal_hab_duracao').value;
        document.getElementById(`hab_alcance_${idx}`).value = document.getElementById('modal_hab_alcance').value;
        document.getElementById(`hab_acao_${idx}`).value = document.getElementById('modal_hab_acao').value;

        fecharModalHab();
        atualizarTudo(); // Atualiza a ficha para refletir as mudanças
        filtrarHabilidades();
    }
}

/**
 * Função para "usar" uma habilidade, subtraindo o custo em PM da mana atual.
 */
function usarHabilidade(index) {
    const custoStr = document.getElementById(`hab_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`).value;

    if (!custoStr || custoStr === "0") {
        showNotification("Esta habilidade não possui um custo numérico definido.", 'warning');
        return;
    }

    const custo = parseInt(custoStr);
    if (isNaN(custo) || custo <= 0) {
        showNotification("Custo inválido. Por favor, insira um número positivo.", 'warning');
        return;
    }

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    if (tipoCusto === "PM") {
        let recursoAtual = parseInt(dados.pm_atual) || 0;
        let recursoMax = parseInt(dados.pm_max) || 0;
        if (recursoAtual < custo) return showNotification(`Mana insuficiente! Você tem ${recursoAtual} PM, mas precisa de ${custo} PM.`, 'error');

        recursoAtual -= custo;
        dados.pm_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PM subtraídos. Mana atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "PV") {
        let recursoAtual = parseInt(dados.pv_atual) || 0;
        let recursoMax = parseInt(dados.pv_max) || 0;
        if (recursoAtual < custo) return showNotification(`Vida insuficiente! Você tem ${recursoAtual} PV, mas precisa de ${custo} PV.`, 'error');

        recursoAtual -= custo;
        dados.pv_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PV subtraídos. Vida atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "Outro") {
        showNotification(`Habilidade custa ${custo} de um recurso "Outro". Gerencie isso manualmente.`, 'info');
        atualizarTudo(); // Apenas para garantir que a UI seja atualizada
    }
    // Não é necessário chamar atualizarEstiloCustoHabilidade(index) aqui, pois atualizarTudo() já fará isso globalmente.
}

/**
 * Cria uma cópia da habilidade existente
 */
function duplicarHabilidade(index) {
    const nome = document.getElementById(`hab_nome_${index}`).value;
    const tipo = document.getElementById(`hab_tipo_${index}`)?.value || "Ativa";
    const classe = document.getElementById(`hab_classe_${index}`).value;
    const custo = document.getElementById(`hab_custo_${index}`).value;
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`).value;
    const desc = document.getElementById(`hab_desc_${index}`).value;
    const duracao = document.getElementById(`hab_duracao_${index}`).value;
    const alcance = document.getElementById(`hab_alcance_${index}`).value;
    const acao = document.getElementById(`hab_acao_${index}`).value;
    const mods = document.getElementById(`hab_mods_${index}`)?.value || "[]";

    adicionarHabilidadeUI(nome + " (Cópia)", tipo, custo, tipoCusto, desc, null, duracao, alcance, acao, classe, mods);
}

/**
 * Abre o modal de Buffs para Habilidades
 */
function abrirModalBuffsHab(index) {
    currentHabModEditIdx = index;
    let modsData = [];
    try {
        const rawVal = document.getElementById(`hab_mods_${index}`).value;
        modsData = JSON.parse(rawVal || "[]");
    } catch (e) {
        modsData = [];
    }

    const modal = document.getElementById('modal-pod-buffs');
    const container = document.getElementById('pod-buffs-container');

    if (!modal || !container) return;

    container.innerHTML = '';
    if (modsData.length > 0) {
        modsData.forEach(m => adicionarLinhaBuffHab(m.attr, m.mod, m.isAdv));
    } else {
        adicionarLinhaBuffHab();
    }

    // Ajusta o título e a função de salvamento do modal reutilizado
    const title = document.getElementById('modal-pod-buffs-title');
    if (title) title.innerText = "Buffs de Habilidade (Passiva)";

    const btnSalvar = modal.querySelector('.btn-save-modal');
    if (btnSalvar) btnSalvar.setAttribute('onclick', 'salvarBuffsHab()');

    modal.style.display = 'flex';
}

function fecharModalBuffHab() {
    const modal = document.getElementById('modal-pod-buffs');
    if (modal) modal.style.display = 'none';
    currentHabModEditIdx = null;
}

function adicionarLinhaBuffHab(attr = 'nenhum', mod = 0, isAdv = false) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    const optionsCat = window.OPTIONS_CATEGORIZADAS || {};
    let catInicial = isAdv ? 'vantagem' : 'ficha';
    if (!isAdv && optionsCat.pericia) {
        if (optionsCat.pericia.some(o => o.v === attr)) catInicial = 'pericia';
        else if (optionsCat.arma && optionsCat.arma.some(o => o.v === attr)) catInicial = 'arma';
    }

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
    row.innerHTML = `
        <select class="inv-input pod-cat-select" style="flex: 1; border-color: #555;">
            <option value="ficha" ${catInicial === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${catInicial === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${catInicial === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${catInicial === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="inv-input pod-buff-attr" style="flex: 1.5;"></select>
        <input type="text" class="inv-input pod-buff-val" style="flex: 0.8;" value="${mod}" placeholder="Val">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(row);
    const selectCat = row.querySelector('.pod-cat-select');
    const selectAttr = row.querySelector('.pod-buff-attr');

    const atualizarSub = (val = 'nenhum') => {
        const cat = selectCat.value;
        const opcoes = optionsCat[cat] || [];
        selectAttr.innerHTML = opcoes.map(opt => `<option value="${opt.v}" ${opt.v === val ? 'selected' : ''}>${opt.t}</option>`).join('');
    };

    selectCat.addEventListener('change', () => atualizarSub());
    atualizarSub(attr);
}

function salvarBuffsHab() {
    if (currentHabModEditIdx === null) return;
    const rows = document.querySelectorAll('#pod-buffs-container .material-attr-row');
    const modsArr = [];
    rows.forEach(row => {
        const cat = row.querySelector('.pod-cat-select').value;
        const attr = row.querySelector('.pod-buff-attr').value;
        const modRaw = row.querySelector('.pod-buff-val').value;
        const mod = attr === 'tipo_dano' ? modRaw : (parseInt(modRaw) || 0);
        const isAdv = (cat === 'vantagem');
        if (attr && attr !== 'nenhum') modsArr.push({ attr, mod, isAdv });
    });
    document.getElementById(`hab_mods_${currentHabModEditIdx}`).value = JSON.stringify(modsArr);
    fecharModalBuffHab();
    atualizarTudo();
}

function removerHabilidade(btn) {
    const row = btn.closest('.item-row');
    if (!row) return;

    const index = row.dataset.index;

    // 1. Limpeza robusta de todas as chaves associadas a este ID no banco de dados
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.endsWith(`_${index}`) && k.startsWith('hab_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

    // 2. Remove da interface e sincroniza o estado global
    row.remove();
    atualizarTudo();
    filtrarHabilidades();
}

function limparHabilidades() {
    if (!confirm("Tem certeza que deseja apagar TODAS as habilidades? Esta ação não pode ser desfeita.")) {
        return;
    }

    const container = document.getElementById('habilidades-container');
    if (container) {
        container.innerHTML = '';
    }

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(key => {
        if (key.startsWith('hab_')) delete dados[key];
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarHabilidades();
}

/**
 * Reseta todos os campos de busca e filtros para o estado inicial
 */
function resetarFiltrosHabilidades() {
    document.getElementById('search-habilidade').value = '';
    if (document.getElementById('filter-habilidade-classe')) document.getElementById('filter-habilidade-classe').value = 'todos';
    document.getElementById('filter-habilidade-tipo').value = 'todos';
    filtrarHabilidades();
    showNotification("Filtro limpo", "info", 2000);
}

/**
 * Filtra os cards de habilidade com base no texto de pesquisa
 */
function filtrarHabilidades() {
    const termo = document.getElementById('search-habilidade').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-habilidade-tipo').value;
    const filtroTipoLower = filtroTipo.toLowerCase();
    const filtroClasse = document.getElementById('filter-habilidade-classe')?.value.toLowerCase() || "todos";

    const rows = document.querySelectorAll('#habilidades-container .item-row'); // Seleciona apenas as linhas de habilidade
    let contador = 0;

    rows.forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`hab_nome_${index}`)?.value.toLowerCase() || "";
        const classe = document.getElementById(`hab_classe_${index}`)?.value.toLowerCase() || "geral";
        const tipo = document.getElementById(`hab_tipo_${index}`)?.value.toLowerCase() || "ativa";

        const matchesNome = nome.includes(termo);
        const matchesTipo = filtroTipo === 'todos' || tipo === filtroTipoLower;
        const matchesClasse = filtroClasse === 'todos' || classe === filtroClasse;

        const matches = matchesNome && matchesTipo && matchesClasse;

        row.style.display = matches ? 'grid' : 'none';
        if (matches) contador++;
    });

    const counterEl = document.getElementById('habilidades-counter');
    if (counterEl) {
        counterEl.innerText = `Habilidades visíveis: ${contador}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let salvo = null;
    try {
        salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) { }

    if (salvo) {
        // Encontra todos os índices únicos baseados nos nomes salvos
        const indices = Object.keys(salvo)
            .filter(k => k.startsWith('hab_nome_'))
            .map(k => k.replace('hab_nome_', ''));

        if (indices.length > 0) {
            indices.sort((a, b) => parseInt(a) - parseInt(b)).forEach(idx => {
                adicionarHabilidadeUI(
                    salvo[`hab_nome_${idx}`] || "",         // 1. nome
                    salvo[`hab_tipo_${idx}`] || "Ativa",    // 2. tipo
                    salvo[`hab_custo_${idx}`] || "",        // 3. custo
                    salvo[`hab_tipo_custo_${idx}`] || "PM", // 4. tipoCusto
                    salvo[`hab_desc_${idx}`] || "",         // 5. desc
                    parseInt(idx),                          // 6. idIndex
                    salvo[`hab_duracao_${idx}`] || "",      // 7. duracao
                    salvo[`hab_alcance_${idx}`] || "",      // 8. alcance
                    salvo[`hab_acao_${idx}`] || "",         // 9. acao
                    salvo[`hab_classe_${idx}`] || "",       // 10. classe
                    salvo[`hab_mods_${idx}`] || "[]"        // 11. mods
                );
            });
        }
    }

    // Atualiza o dropdown de filtros para remover o antigo "Ativa/Passiva" e colocar as classes/origens
    atualizarFiltroHabilidadesUI();

    // Chama atualizarTudo() uma única vez após carregar todos os elementos dinâmicos
    atualizarTudo();
    filtrarHabilidades();
});
