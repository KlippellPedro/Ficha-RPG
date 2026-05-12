/**
 * Lógica para gerenciar a lista dinâmica de poderes
 */

let podSendoEditadoIdx = null;

function adicionarPoderUI(nome = "", tipo = "Poder de Classe", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "") {
    const container = document.getElementById('poderes-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row pod-row-grid';
    row.dataset.index = index;

    row.innerHTML = `
        <input type="text" id="poder_nome_${index}" class="save-input inv-input" placeholder="Nome do Poder" value="${nome}">
        <select id="poder_tipo_${index}" class="save-input inv-input">
            <option value="Poder de Classe" ${tipo === 'Poder de Classe' ? 'selected' : ''}>Classe</option>
            <option value="Poder de Povo" ${tipo === 'Poder de Povo' ? 'selected' : ''}>Povo</option>
            <option value="Poder de Raça" ${tipo === 'Poder de Raça' ? 'selected' : ''}>Raça</option>
            <option value="Outro" ${tipo === 'Outro' ? 'selected' : ''}>Outro</option>
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
            <textarea id="poder_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="poder_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="poder_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="poder_acao_${index}" class="save-input" value="${acao}">
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
    const tipo = document.getElementById(`poder_tipo_${index}`).value;
    // Lê os valores diretamente dos inputs da linha para garantir que estejam atualizados
    const custo = document.getElementById(`poder_custo_${index}`).value;
    const tipoCusto = document.getElementById(`poder_tipo_custo_${index}`).value;
    const desc = document.getElementById(`poder_desc_${index}`).value;
    const duracao = document.getElementById(`poder_duracao_${index}`).value;
    const alcance = document.getElementById(`poder_alcance_${index}`).value;
    const acao = document.getElementById(`poder_acao_${index}`).value;

    document.getElementById('modal-pod-title').innerText = `Detalhes: ${nome || "Poder"}`;

    const body = document.getElementById('modal-pod-body');
    body.innerHTML = `
        <div class="grid-2-cols">
            <div class="input-group">
                <label>Tipo de Poder</label>
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
            <label>Descrição e Efeito</label>
            <textarea id="modal_pod_desc" class="inv-input" style="min-height: 180px">${desc}</textarea>
        </div>
        <div class="modal-footer" style="justify-content: space-between; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1)">
            <button type="button" class="btn-use-skill" onclick="usarPoder('${index}')">Usar Poder</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesPod()">Salvar e Fechar</button>
        </div>
    `;

    document.getElementById('modal-pod').style.display = 'flex';
}

function fecharModalPod() {
    document.getElementById('modal-pod').style.display = 'none';
    podSendoEditadoIdx = null;
}

function salvarDetalhesPod() {
    if (podSendoEditadoIdx !== null) {
        const idx = podSendoEditadoIdx;
        document.getElementById(`poder_tipo_${idx}`).value = document.getElementById('modal_pod_tipo').value;
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
    if (tipoCusto === "PM") {
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

function duplicarPoder(index) {
    const n = document.getElementById(`poder_nome_${index}`).value;
    const t = document.getElementById(`poder_tipo_${index}`).value;
    const c = document.getElementById(`poder_custo_${index}`).value;
    const tc = document.getElementById(`poder_tipo_custo_${index}`).value;
    const d = document.getElementById(`poder_desc_${index}`).value;
    const du = document.getElementById(`poder_duracao_${index}`).value;
    const al = document.getElementById(`poder_alcance_${index}`).value;
    const ac = document.getElementById(`poder_acao_${index}`).value;
    adicionarPoderUI(n + " (Cópia)", t, c, tc, d, null, du, al, ac);
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
    const rows = document.querySelectorAll('#poderes-container .item-row');
    let contador = 0;

    rows.forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`poder_nome_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`poder_tipo_${index}`)?.value || "";

        const matchesNome = nome.includes(termo);
        const matchesTipo = filtroTipo === 'todos' || tipo === filtroTipo;
        const matches = matchesNome && matchesTipo;

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

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    delete dados[`poder_nome_${index}`];
    delete dados[`poder_tipo_${index}`];
    delete dados[`poder_custo_${index}`];
    delete dados[`poder_desc_${index}`];
    delete dados[`poder_tipo_custo_${index}`];
    delete dados[`poder_duracao_${index}`];
    delete dados[`poder_alcance_${index}`];
    delete dados[`poder_acao_${index}`];

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
                salvo[`poder_acao_${idx}`] || ""     // 9. acao
            );
        });
    }
    // Chama atualizarTudo() uma única vez após carregar todos os elementos dinâmicos
    atualizarTudo();
    filtrarPoderes();
});