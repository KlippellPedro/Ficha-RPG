let magSendoEditadaIdx = null;
const TIPOS_MAGIA = ["Comum", "Elemental", "Divinas", "Demoniaca", "Palavra Sagrada", "Outro"];

/**
 * Gera o HTML do campo de nível baseado nas regras:
 * Divinas/Demoniaca: 1-2 | Comum: 1-4 | Elemental: % | Outros: Texto livre
 */
function renderizarCampoNivel(tipo, nivel, index) {
    if (tipo === "Divinas" || tipo === "Demoniaca") {
        return `
            <select id="mag_nivel_${index}" class="save-input inv-input" onchange="atualizarCorNivel('${index}')">
                <option value="1" ${nivel == "1" ? 'selected' : ''}>I</option>
                <option value="2" ${nivel == "2" ? 'selected' : ''}>II</option>
            </select>`;
    } else if (tipo === "Comum") {
        return `
            <select id="mag_nivel_${index}" class="save-input inv-input" onchange="atualizarCorNivel('${index}')">
                <option value="1" ${nivel == "1" ? 'selected' : ''}>I</option>
                <option value="2" ${nivel == "2" ? 'selected' : ''}>II</option>
                <option value="3" ${nivel == "3" ? 'selected' : ''}>III</option>
                <option value="4" ${nivel == "4" ? 'selected' : ''}>IV</option>
            </select>`;
    } else {
        const placeholder = tipo === "Elemental" ? "Ex: 20" : "Nível";
        // Se for elemental e não tiver %, adiciona apenas para exibição
        let displayNivel = nivel;
        if (tipo === "Elemental" && nivel && !String(nivel).endsWith('%')) {
            displayNivel = nivel + '%';
        }
        return `<input type="text" id="mag_nivel_${index}" class="save-input inv-input mag-nivel-extra" placeholder="${placeholder}" value="${displayNivel}" ${tipo === "Elemental" ? `onblur="formatElementalNivel('${index}')"` : ''}>`;
    }
}

/**
 * Garante que o nível elemental sempre termine com %
 */
function formatElementalNivel(index) {
    const input = document.getElementById(`mag_nivel_${index}`);
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    if (input && tipo === "Elemental") {
        let val = input.value.trim();
        if (val && !val.endsWith('%')) {
            input.value = val + '%';
        }
    }
}

/**
 * Atualiza a classe de cor do select de nível
 */
function atualizarCorNivel(index) {
    const select = document.getElementById(`mag_nivel_${index}`);
    if (!select || select.tagName !== 'SELECT') return;

    select.classList.remove('mag-nivel-1', 'mag-nivel-2', 'mag-nivel-3', 'mag-nivel-4', 'mag-nivel-extra');
    const val = select.value;
    if (val === "1") select.classList.add('mag-nivel-1');
    else if (val === "2") select.classList.add('mag-nivel-2');
    else if (val === "3") select.classList.add('mag-nivel-3');
    else if (val === "4") select.classList.add('mag-nivel-4');
    else select.classList.add('mag-nivel-extra');
}

function adicionarMagiaUI(nome = "", tipo = "Comum", nivel = "1", custo = "", tipoCusto = "PM", desc = "", idIndex = null, duracao = "", alcance = "", acao = "", teste = "") {
    const container = document.getElementById('magias-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();

    const row = document.createElement('div');
    row.className = 'item-row mag-row-grid'; // This class is for grid display
    row.dataset.index = index;

    let optionsHtml = TIPOS_MAGIA.map(t => `<option value="${t}" ${tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    row.innerHTML = `
        <input type="text" id="mag_nome_${index}" class="save-input inv-input" placeholder="Nome da Magia" value="${nome}">
        <select id="mag_tipo_${index}" class="save-input inv-input" onchange="alternarTipoNivel('${index}')">
            ${optionsHtml}
        </select>
        <div id="container_nivel_${index}">${renderizarCampoNivel(tipo, nivel, index)}</div>
        <div style="display:flex; gap:5px;">
            <input type="text" id="mag_custo_${index}" class="save-input inv-input" placeholder="Custo" value="${custo}" style="flex:1;">
            <select id="mag_tipo_custo_${index}" class="save-input inv-input" style="width:60px;">
                <option value="PM" ${tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                <option value="PV" ${tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                <option value="Outro" ${tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        <button type="button" class="btn-open-desc" onclick="abrirModalMag('${index}')">🔍</button>
        <button type="button" class="btn-use-skill" onclick="usarMagia('${index}')">Usar</button>
        <button type="button" class="btn-open-desc" onclick="duplicarMagia('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerMagia(this)">×</button>

        <div style="display:none">
            <textarea id="mag_desc_${index}" class="save-input">${desc}</textarea>
            <input type="hidden" id="mag_duracao_${index}" class="save-input" value="${duracao}">
            <input type="hidden" id="mag_alcance_${index}" class="save-input" value="${alcance}">
            <input type="hidden" id="mag_acao_${index}" class="save-input" value="${acao}">
            <input type="hidden" id="mag_teste_${index}" class="save-input" value="${teste}">
        </div>
    `;

    container.appendChild(row);
    atualizarCorNivel(index);
    if (idIndex === null) {
        atualizarTudo();
        filtrarMagias();
    }
}

/**
 * Troca o seletor de nível dinamicamente quando o tipo de magia muda
 */
function alternarTipoNivel(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    const container = document.getElementById(`container_nivel_${index}`);
    container.innerHTML = renderizarCampoNivel(tipo, "1", index);
    atualizarCorNivel(index);
    atualizarTudo();
}

function abrirModalMag(index) {
    magSendoEditadaIdx = index;
    const vals = {
        nome: document.getElementById(`mag_nome_${index}`).value,
        tipo: document.getElementById(`mag_tipo_${index}`).value,
        // When reading from the main row, the level might already have '%'. Strip it for modal input.
        nivel: document.getElementById(`mag_nivel_${index}`).value,
        custo: document.getElementById(`mag_custo_${index}`).value,
        tipoCusto: document.getElementById(`mag_tipo_custo_${index}`).value,
        desc: document.getElementById(`mag_desc_${index}`).value,
        duracao: document.getElementById(`mag_duracao_${index}`).value,
        alcance: document.getElementById(`mag_alcance_${index}`).value,
        acao: document.getElementById(`mag_acao_${index}`).value,
        teste: document.getElementById(`mag_teste_${index}`)?.value || ""
    };

    document.getElementById('modal-mag-title').innerText = `Grimório: ${vals.nome || "Nova Magia"}`;
    let optionsHtml = TIPOS_MAGIA.map(t => `<option value="${t}" ${vals.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

    document.getElementById('modal-mag-body').innerHTML = `
        <div class="grid-3-cols" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Tipo</label>
                <select id="modal_mag_tipo" class="inv-input" onchange="const c = document.getElementById('modal_nivel_container'); c.innerHTML = renderizarCampoNivel(this.value, '', 'modal'); atualizarCorNivel('modal');">${optionsHtml}</select>
            </div>
            <div class="input-group"><label>Nível/Círculo</label>
                <div id="modal_nivel_container">${renderizarCampoNivel(vals.tipo, vals.nivel, 'modal')}</div>
            </div>
            <div class="input-group"></div> <!-- Espaçador -->
        </div>
        <div class="grid-2-cols">
            <div class="input-group" ><label>Custo de Conjuração</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="modal_mag_custo" class="inv-input" value="${vals.custo}" style="flex:1;">
                    <select id="modal_mag_tipo_custo" class="inv-input" style="width:80px;">
                        <option value="PM" ${vals.tipoCusto === 'PM' ? 'selected' : ''}>PM</option>
                        <option value="PV" ${vals.tipoCusto === 'PV' ? 'selected' : ''}>PV</option>
                        <option value="Outro" ${vals.tipoCusto === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="grid-2-cols">
            <div class="input-group"><label>Duração</label><input type="text" id="modal_mag_duracao" class="inv-input" value="${vals.duracao}" placeholder="Ex: Cena"></div>
            <div class="input-group"><label>Alcance</label><input type="text" id="modal_mag_alcance" class="inv-input" value="${vals.alcance}" placeholder="Ex: Curto"></div>
        </div>
        <div class="grid-2-cols" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="input-group"><label>Ação</label><input type="text" id="modal_mag_acao" class="inv-input" value="${vals.acao}" placeholder="Ex: Padrão"></div>
            <div class="input-group"><label>Teste</label><input type="text" id="modal_mag_teste" class="inv-input" value="${vals.teste}" placeholder="Ex: Misticismo"></div>
        </div>
        <div class="input-group"><label>Efeito da Magia</label><textarea id="modal_mag_desc" class="inv-input" style="min-height: 200px">${vals.desc}</textarea></div>
        <div class="modal-footer" style="justify-content: space-between;">
            <button type="button" class="btn-use-skill" onclick="usarMagia('${index}')">Usar</button>
            <button type="button" class="btn-save-modal" onclick="salvarDetalhesMag()">Salvar no Grimório</button>
        </div>
    `;
    document.getElementById('modal-mag').style.display = 'flex'; // Show the modal
    atualizarCorNivel('modal');
}

function fecharModalMag() { document.getElementById('modal-mag').style.display = 'none'; magSendoEditadaIdx = null; }

function salvarDetalhesMag() {
    if (magSendoEditadaIdx !== null) {
        const idx = magSendoEditadaIdx;
        const novoTipo = document.getElementById('modal_mag_tipo').value;
        let novoNivel = document.getElementById('mag_nivel_modal').value;

        // Strip '%' if elemental before saving
        const nivelParaSalvar = (novoTipo === "Elemental" && novoNivel.endsWith('%')) ? novoNivel.slice(0, -1) : novoNivel;

        document.getElementById(`mag_tipo_${idx}`).value = novoTipo;
        // Força a atualização do container de nível na linha antes de atribuir o valor
        document.getElementById(`container_nivel_${idx}`).innerHTML = renderizarCampoNivel(novoTipo, nivelParaSalvar, idx);
        atualizarCorNivel(idx);

        document.getElementById(`mag_custo_${idx}`).value = document.getElementById('modal_mag_custo').value;
        document.getElementById(`mag_tipo_custo_${idx}`).value = document.getElementById('modal_mag_tipo_custo').value;
        document.getElementById(`mag_desc_${idx}`).value = document.getElementById('modal_mag_desc').value;
        document.getElementById(`mag_duracao_${idx}`).value = document.getElementById('modal_mag_duracao').value;
        document.getElementById(`mag_alcance_${idx}`).value = document.getElementById('modal_mag_alcance').value;
        document.getElementById(`mag_acao_${idx}`).value = document.getElementById('modal_mag_acao').value;
        document.getElementById(`mag_teste_${idx}`).value = document.getElementById('modal_mag_teste').value;
        fecharModalMag();
        atualizarTudo();
        filtrarMagias();
    }
}

function usarMagia(index) {
    const custoStr = document.getElementById(`mag_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`mag_tipo_custo_${index}`).value;
    const nome = document.getElementById(`mag_nome_${index}`).value || "Magia";
    const custo = parseInt(custoStr);

    if (isNaN(custo) || custo <= 0) return showNotification("Defina um custo numérico para conjurar.", 'warning');

    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let recurso = (tipoCusto === "PM") ? "pm_atual" : (tipoCusto === "PV" ? "pv_atual" : null);

    if (recurso) {
        let atual = parseInt(dados[recurso]) || 0;
        if (atual < custo) return showNotification(`${tipoCusto} insuficiente!`, 'error');
        dados[recurso] = atual - custo;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(nome, custo, tipoCusto);
        showNotification(`${nome} conjurada! -${custo} ${tipoCusto}`, 'success');
        atualizarTudo();
    } else {
        showNotification(`Magia conjurada (Custo: ${custo} Outro).`, 'info');
    }
}

function duplicarMagia(index) {
    const tipo = document.getElementById(`mag_tipo_${index}`).value;
    let nivel = document.getElementById(`mag_nivel_${index}`).value;

    // Remove o % para passar o valor limpo para a função de criação
    if (tipo === "Elemental" && nivel.endsWith('%')) nivel = nivel.slice(0, -1);

    adicionarMagiaUI(
        document.getElementById(`mag_nome_${index}`).value + " (Cópia)",
        tipo,
        nivel,
        document.getElementById(`mag_custo_${index}`).value,
        document.getElementById(`mag_tipo_custo_${index}`).value,
        document.getElementById(`mag_desc_${index}`).value,
        null,
        document.getElementById(`mag_duracao_${index}`).value,
        document.getElementById(`mag_alcance_${index}`).value,
        document.getElementById(`mag_acao_${index}`).value,
        document.getElementById(`mag_teste_${index}`).value
    );
}

function removerMagia(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.includes(`mag_`) && k.endsWith(`_${index}`)) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarMagias();
}

function limparMagias() {
    if (!confirm("Apagar grimório inteiro?")) return;
    document.getElementById('magias-container').innerHTML = '';
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.startsWith('mag_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarMagias();
}

/**
 * Reseta todos os campos de busca e filtros para o estado inicial
 */
function resetarFiltrosMagia() {
    document.getElementById('search-magia').value = '';
    document.getElementById('filter-magia-tipo').value = 'todos';
    document.getElementById('filter-magia-nivel').value = 'todos';
    filtrarMagias();
    showNotification("Filtros limpos", "info", 2000);
}

function filtrarMagias() {
    const termo = document.getElementById('search-magia').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-magia-tipo').value;
    const filtroNivel = document.getElementById('filter-magia-nivel').value;
    let contador = 0;

    document.querySelectorAll('#magias-container .item-row').forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`mag_nome_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`mag_tipo_${index}`)?.value || "";
        const nivelInput = document.getElementById(`mag_nivel_${index}`);
        const nivel = nivelInput?.value || "";

        const matchesNome = nome.includes(termo);
        const matchesTipo = filtroTipo === 'todos' || tipo === filtroTipo;

        let matchesNivel = filtroNivel === 'todos';
        if (!matchesNivel && nivelInput) {
            if (filtroNivel === 'extra') {
                // Considera 'extra' se for um input de texto (Elemental/Outro) ou se o valor não for 1-4
                matchesNivel = nivelInput.tagName === 'INPUT' || !['1', '2', '3', '4'].includes(nivel);
            } else {
                matchesNivel = nivel === filtroNivel;
            }
        } else if (!matchesNivel && !nivelInput) {
            // Se o input de nível não existe por erro, oculta por segurança se houver filtro ativo
            matchesNivel = false;
        }

        const visible = (matchesNome && matchesTipo && matchesNivel);
        row.style.display = visible ? 'grid' : 'none';
        if (visible) contador++;
    });

    const counterEl = document.getElementById('magias-counter');
    if (counterEl) {
        counterEl.innerText = `Magias visíveis: ${contador}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const indices = Object.keys(salvo).filter(k => k.startsWith('mag_nome_')).map(k => k.replace('mag_nome_', '')).sort((a, b) => a - b);
    indices.forEach(idx => {
        adicionarMagiaUI(salvo[`mag_nome_${idx}`], salvo[`mag_tipo_${idx}`], salvo[`mag_nivel_${idx}`], salvo[`mag_custo_${idx}`], salvo[`mag_tipo_custo_${idx}`], salvo[`mag_desc_${idx}`], idx, salvo[`mag_duracao_${idx}`], salvo[`mag_alcance_${idx}`], salvo[`mag_acao_${idx}`], salvo[`mag_teste_${idx}`]); // `renderizarCampoNivel` will format `mag_nivel_${idx}`
    });
    atualizarTudo();
    filtrarMagias();
});