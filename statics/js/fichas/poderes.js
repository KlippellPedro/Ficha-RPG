/**
 * Lógica para gerenciar a lista dinâmica de poderes
 */

let podSendoEditadoIdx = null;
let currentPodModEditIdx = null;

/**
 * Gera as opções de classe baseadas nas classes que o personagem possui
 */
function getOpcoesClassesPod(valorSelecionado = "") {
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
function atualizarFiltroPoderesUI() {
    const filterSelect = document.getElementById('filter-poder-tipo');
    if (!filterSelect) return;

    const valorAtual = filterSelect.value;
    filterSelect.innerHTML = `<option value="todos">Todas as Classes/Origens</option>` + getOpcoesClassesPod(valorAtual);
}

function adicionarPoderUI(nome = "", tipo = "Poder de Classe", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", classe = "", pv_bonus = 0, pm_bonus = 0, mods = "[]") {
    const container = document.getElementById('poderes-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row pod-row-grid';
    row.dataset.index = index;

    row.innerHTML = `
        <input type="text" id="poder_nome_${index}" class="save-input inv-input" placeholder="Nome do Poder" value="${nome}">
        <select id="poder_classe_${index}" class="save-input inv-input" onchange="atualizarTudo()">
            ${getOpcoesClassesPod(classe || tipo)} 
        </select>
        <div style="display:flex; gap:5px;">
            <input type="text" id="poder_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="poder_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        
        <button type="button" class="btn-open-desc" onclick="abrirModalPod('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarPoder('${index}')">Usar</button>
        <button type="button" class="btn-open-desc" onclick="duplicarPoder('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerPoder(this)">×</button>

        <div style="display:none">
            <input type="hidden" id="poder_tipo_${index}" class="save-input" value="${tipo}">
            <textarea id="poder_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="poder_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="poder_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="poder_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="poder_pv_bonus_${index}" class="save-input" value="${pv_bonus}">
            <input type="hidden" id="poder_pm_bonus_${index}" class="save-input" value="${pm_bonus}">
            <input type="hidden" id="poder_mods_${index}" class="save-input" value='${mods}'>
        </div>
    `;

    container.appendChild(row);
    if (idIndex === null) {
        atualizarTudo();
        filtrarPoderes();
    }
}

function abrirModalPod(index) {
    podSendoEditadoIdx = index;
    const nome = document.getElementById(`poder_nome_${index}`).value;
    const tipo = document.getElementById(`poder_tipo_${index}`)?.value || "Poder de Classe";
    const classe = document.getElementById(`poder_classe_${index}`).value;
    // Lê os valores diretamente dos inputs da linha para garantir que estejam atualizados
    const custo = document.getElementById(`poder_custo_${index}`).value;
    const tipoCusto = document.getElementById(`poder_tipo_custo_${index}`).value;
    const desc = document.getElementById(`poder_desc_${index}`).value;
    const duracao = document.getElementById(`poder_duracao_${index}`).value;
    const alcance = document.getElementById(`poder_alcance_${index}`).value;
    const acao = document.getElementById(`poder_acao_${index}`).value;

    const modal = document.getElementById('modal-pod');
    const body = document.getElementById('modal-pod-body');

    if (!modal || !body) {
        console.error("Erro: Container do modal 'modal-pod' não encontrado no HTML.");
        return;
    }

    document.getElementById('modal-pod-title').innerText = `Detalhes: ${nome || "Poder"}`;

    body.innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Classe Vinculada</label>
                <select id="modal_pod_classe" class="inv-input">
                    ${getOpcoesClassesPod(classe)}
                </select>
            </div>
            <div class="input-group">
                <label>Tipo de Poder (Fonte)</label>
                <select id="modal_pod_tipo" class="inv-input">
                    <option value="Poder de Classe" ${tipo === 'Poder de Classe' ? 'selected' : ''}>Poder de Classe</option>
                    <option value="Poder de Povo" ${tipo === 'Poder de Povo' ? 'selected' : ''}>Poder de Povo</option>
                    <option value="Poder de Raça" ${tipo === 'Poder de Raça' ? 'selected' : ''}>Poder de Raça</option>
                    <option value="Outro" ${tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div class="input-group">
                <label>Custo ou Requisito</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="modal_pod_custo" class="inv-input" value="${custo}">
                    <select id="modal_pod_tipo_custo" class="inv-input" style="width:80px;">
                        <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Duração</label><input type="text" id="modal_pod_duracao" class="inv-input" value="${duracao}"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_pod_alcance" class="inv-input" value="${alcance}"></div>
        </div>
        <div class="input-group"><label>Ação</label><input type="text" id="modal_pod_acao" class="inv-input" value="${acao}"></div>

        <div class="input-group">
            <label>Configurações de Buff</label>
            <button type="button" class="btn-save-modal" style="width:100%; background: #ff4444; color: white; border: 1px solid #991b1b;" onclick="abrirModalBuffsPoder('${index}')">Definir Buffs</button>
        </div>

        <div class="input-group">
            <label>Descrição e Efeito</label>
            <textarea id="modal_pod_desc" class="inv-input" style="min-height: 180px">${desc}</textarea>
        </div>
    `;

    const footer = modal.querySelector('.modal-footer');
    if (footer) {
        footer.style.justifyContent = 'space-between';
        footer.innerHTML = `
            <button type="button" class="btn-use-skill" onclick="usarPoder('${index}')">Usar Poder</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesPod()">Salvar e Fechar</button>
        `;
    }
    document.getElementById('modal-pod').style.display = 'flex';
}

function fecharModalPod() {
    document.getElementById('modal-pod').style.display = 'none';
    podSendoEditadoIdx = null;
}

function salvarDetalhesPod() {
    if (podSendoEditadoIdx !== null) {
        const idx = podSendoEditadoIdx;
        document.getElementById(`poder_classe_${idx}`).value = document.getElementById('modal_pod_classe').value;
        if (document.getElementById(`poder_tipo_${idx}`)) document.getElementById(`poder_tipo_${idx}`).value = document.getElementById('modal_pod_tipo').value;
        document.getElementById(`poder_custo_${idx}`).value = document.getElementById('modal_pod_custo').value;
        document.getElementById(`poder_tipo_custo_${idx}`).value = document.getElementById('modal_pod_tipo_custo').value;
        document.getElementById(`poder_desc_${idx}`).value = document.getElementById('modal_pod_desc').value;
        document.getElementById(`poder_duracao_${idx}`).value = document.getElementById('modal_pod_duracao').value;
        document.getElementById(`poder_alcance_${idx}`).value = document.getElementById('modal_pod_alcance').value;
        document.getElementById(`poder_acao_${idx}`).value = document.getElementById('modal_pod_acao').value;
        fecharModalPod();
        atualizarTudo(); // Atualiza a ficha para refletir as mudanças
        filtrarPoderes();
    }
}

function usarPoder(index) {
    const custoStr = document.getElementById(`poder_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`poder_tipo_custo_${index}`).value;
    const custo = parseInt(custoStr);
    if (isNaN(custo) || custo <= 0) return showNotification("Defina um custo numérico válido e positivo.", 'warning');

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const racaKey = dados.raca || "nenhuma";
    const h1 = dados.hibrido_raca_1 || "";
    const h2 = dados.hibrido_raca_2 || "";
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (h1 === "corrompido" || h2 === "corrompido"));

    if (tipoCusto === "PM") {
        if (isCorrompido) return usarPoderCorrompido(index, custo);
        let recursoAtual = parseInt(dados.pm_atual) || 0;
        let recursoMax = parseInt(dados.pm_max) || 0;
        if (recursoAtual < custo) return showNotification(`Mana insuficiente! Você tem ${recursoAtual} PM, mas precisa de ${custo} PM.`, 'error');

        recursoAtual -= custo;
        dados.pm_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, tipoCusto);
        showNotification(`Poder usado! ${custo} PM subtraídos. Mana atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "PV") {
        let recursoAtual = parseInt(dados.pv_atual) || 0;
        let recursoMax = parseInt(dados.pv_max) || 0;
        if (recursoAtual < custo) return showNotification(`Vida insuficiente! Você tem ${recursoAtual} PV, mas precisa de ${custo} PV.`, 'error');

        recursoAtual -= custo;
        dados.pv_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, tipoCusto);
        showNotification(`Poder usado! ${custo} PV subtraídos. Vida atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "Outro") {
        showNotification(`Poder custa ${custo} de um recurso "Outro". Gerencie isso manualmente.`, 'info');
        atualizarTudo(); // Apenas para garantir que a UI seja atualizada
    } else { showNotification("Gerencie esse custo manualmente.", 'info'); }
    // Não é necessário chamar atualizarEstiloCustoPoder(index) aqui, pois atualizarTudo() já fará isso globalmente.
}

function usarPoderCorrompido(index, custo) {
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let recursoAtual = parseInt(dados.pv_atual) || 0;

    if (recursoAtual < custo) {
        return showNotification(`Vitalidade insuficiente para corrupção!`, 'error');
    }

    recursoAtual -= custo;
    dados.pv_atual = recursoAtual;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    registrarHistorico(document.getElementById(`poder_nome_${index}`).value || "Poder", custo, "Corrupção");
    showNotification(`Poder usado via Corrupção! -${custo} Vitalidade.`, 'success');
    atualizarTudo();
    return true;
}

function duplicarPoder(index) {
    const n = document.getElementById(`poder_nome_${index}`).value;
    const t = document.getElementById(`poder_tipo_${index}`)?.value || "Poder de Classe";
    const cl = document.getElementById(`poder_classe_${index}`).value;
    const c = document.getElementById(`poder_custo_${index}`).value;
    const tc = document.getElementById(`poder_tipo_custo_${index}`).value;
    const d = document.getElementById(`poder_desc_${index}`).value;
    const du = document.getElementById(`poder_duracao_${index}`).value;
    const al = document.getElementById(`poder_alcance_${index}`).value;
    const ac = document.getElementById(`poder_acao_${index}`).value;
    const pvb = document.getElementById(`poder_pv_bonus_${index}`)?.value || 0;
    const pmb = document.getElementById(`poder_pm_bonus_${index}`)?.value || 0;
    const mods = document.getElementById(`poder_mods_${index}`)?.value || "[]";

    adicionarPoderUI(n + " (Cópia)", t, c, tc, d, null, du, al, ac, cl, pvb, pmb, mods);
}

/**
 * Abre o novo modal de Buffs, populando com os dados salvos em JSON
 */
function abrirModalBuffsPoder(index) {
    currentPodModEditIdx = index;
    let modsData = [];
    try {
        const rawVal = document.getElementById(`poder_mods_${index}`).value;
        modsData = JSON.parse(rawVal || "[]");
    } catch (e) {
        console.warn("Erro ao ler modificações do poder, resetando:", e);
        modsData = [];
    }

    const modal = document.getElementById('modal-pod-buffs');
    const container = document.getElementById('pod-buffs-container');

    if (!modal || !container) {
        console.error("Modal de buffs ou container não encontrado no HTML!");
        return;
    }

    container.innerHTML = '';

    if (modsData.length > 0) {
        modsData.forEach(m => adicionarLinhaBuffPoder(m.attr, m.mod));
    } else {
        adicionarLinhaBuffPoder();
    }

    modal.style.display = 'flex';
}

function fecharModalBuffPod() {
    const modal = document.getElementById('modal-pod-buffs');
    if (modal) modal.style.display = 'none';
    currentPodModEditIdx = null;
}

function adicionarLinhaBuffPoder(attr = 'nenhum', mod = 0) {
    const container = document.getElementById('pod-buffs-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'material-attr-row';
    row.style = 'display: flex; gap: 10px; margin-bottom: 10px;';

    // Reutiliza a lista de atributos do inventário se disponível, senão usa fallback
    const options = (typeof OPTIONS_ATTR !== 'undefined') ? OPTIONS_ATTR : [
        { v: 'nenhum', t: '-' },
        { v: 'pv_max', t: 'Vida Máx' },
        { v: 'pm_max', t: 'Mana Máx' },
        { v: 'forca', t: 'FOR' }, { v: 'destreza', t: 'DES' }, { v: 'constituicao', t: 'CON' },
        { v: 'inteligencia', t: 'INT' }, { v: 'sabedoria', t: 'SAB' }, { v: 'carisma', t: 'CAR' }, { v: 'aura', t: 'AUR' }
    ];

    row.innerHTML = `
        <select class="inv-input pod-buff-attr" style="flex: 2;">
            ${options.map(opt => `<option value="${opt.v}" ${opt.v === attr ? 'selected' : ''}>${opt.t}</option>`).join('')}
        </select>
        <input type="number" class="inv-input pod-buff-val" style="flex: 1;" value="${mod}">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function salvarBuffsPoder() {
    if (currentPodModEditIdx === null) return;
    const rows = document.querySelectorAll('#pod-buffs-container .material-attr-row');
    const modsArr = [];

    rows.forEach(row => {
        const attr = row.querySelector('.pod-buff-attr')?.value;
        const mod = parseInt(row.querySelector('.pod-buff-val')?.value) || 0;
        if (attr && attr !== 'nenhum') {
            modsArr.push({ attr, mod });
        }
    });

    document.getElementById(`poder_mods_${currentPodModEditIdx}`).value = JSON.stringify(modsArr);
    fecharModalBuffPod();
    atualizarTudo();
}

function limparPoderes() {
    if (!confirm("Tem certeza que deseja apagar TODOS os poderes? Esta ação não pode ser desfeita.")) {
        return;
    }

    const container = document.getElementById('poderes-container');
    if (container) {
        container.innerHTML = '';
    }

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(key => {
        if (key.startsWith('poder_')) delete dados[key];
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarPoderes();
}

/**
 * Reseta todos os campos de busca e filtros para o estado inicial
 */
function resetarFiltrosPoderes() {
    document.getElementById('search-poder').value = '';
    if (document.getElementById('filter-poder-classe')) document.getElementById('filter-poder-classe').value = '';
    document.getElementById('filter-poder-tipo').value = 'todos';
    filtrarPoderes();
    showNotification("Filtro limpo", "info", 2000);
}

/**
 * Filtra os cards de poder com base no texto de pesquisa
 */
function filtrarPoderes() {
    const termo = document.getElementById('search-poder').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-poder-tipo').value;
    const filtroTipoLower = filtroTipo.toLowerCase();
    const filtroClasse = document.getElementById('filter-poder-classe')?.value.toLowerCase() || "";
    const rows = document.querySelectorAll('#poderes-container .item-row');
    let contador = 0;

    rows.forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`poder_nome_${index}`)?.value.toLowerCase() || "";
        const classe = document.getElementById(`poder_classe_${index}`)?.value.toLowerCase() || "geral";

        const matchesNome = nome.includes(termo);
        const matchesClasse = filtroTipo === 'todos' || classe === filtroTipoLower || classe.includes(filtroClasse);
        const matches = matchesNome && matchesClasse;

        row.style.display = matches ? 'grid' : 'none';
        if (matches) contador++;
    });

    const counterEl = document.getElementById('poderes-counter');
    if (counterEl) {
        counterEl.innerText = `Poderes visíveis: ${contador}`;
    }
}

function removerPoder(btn) {
    const row = btn.closest('.item-row');
    if (!row) return;
    const index = row.dataset.index;

    // Limpeza robusta de todas as chaves associadas a este ID
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.endsWith(`_${index}`) && k.startsWith('poder_')) delete dados[k]; });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarPoderes();
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('poder_nome_'))
        .map(k => k.replace('poder_nome_', ''));

    if (indices.length > 0) {
        indices.sort((a, b) => parseInt(a) - parseInt(b)).forEach(idx => {
            adicionarPoderUI(
                salvo[`poder_nome_${idx}`] || "",    // 1. nome
                salvo[`poder_tipo_${idx}`] || "Poder de Classe", // 2. tipo
                salvo[`poder_custo_${idx}`] || "",   // 3. custo
                salvo[`poder_tipo_custo_${idx}`] || "PM", // 4. tipoCusto
                salvo[`poder_desc_${idx}`] || "",    // 5. desc
                parseInt(idx),                       // 6. idIndex
                salvo[`poder_duracao_${idx}`] || "", // 7. duracao
                salvo[`poder_alcance_${idx}`] || "", // 8. alcance
                salvo[`poder_acao_${idx}`] || "",    // 9. acao
                salvo[`poder_classe_${idx}`] || "",  // 10. classe
                salvo[`poder_pv_bonus_${idx}`] || 0, // 11. pv_bonus
                salvo[`poder_pm_bonus_${idx}`] || 0, // 12. pm_bonus
                salvo[`poder_mods_${idx}`] || "[]"   // 13. mods
            );
        });
    }

    // Atualiza o dropdown de filtros para as classes/origens
    atualizarFiltroPoderesUI();

    // Chama atualizarTudo() uma única vez após carregar todos os elementos dinâmicos
    atualizarTudo();
    filtrarPoderes();
});