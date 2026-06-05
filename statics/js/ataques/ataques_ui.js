/**
 * Lógica de Interface dos Ataques (Lista e Filtros)
 */

function adicionarAtaqueUI(nome = "", teste = "", dano = "", critico = "", alcance = "", tipo = "Corpo-a-Corpo", desc = "", idIndex = null, tipo_dano = "", originIndex = "") {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    const index = idIndex !== null ? idIndex : Date.now();
    const row = document.createElement('div');
    row.className = 'item-row atk-row-grid draggable';
    row.draggable = true;
    row.dataset.index = index;

    row.innerHTML = `
        <input type="text" id="atk_nome_${index}" class="save-input inv-input" placeholder="Arma/Ataque" value="${nome}" oninput="if(typeof sincronizarAtaqueComInventario === 'function') sincronizarAtaqueComInventario('${index}')">
        <input type="text" id="atk_teste_${index}" class="save-input inv-input" placeholder="Ex: Luta" value="${teste}">
        <input type="text" id="atk_dano_${index}" class="save-input inv-input" placeholder="Ex: 1d8+5" value="${dano}">
        <input type="text" id="atk_tipo_dano_${index}" class="save-input inv-input atk-damage-badge" placeholder="Ex: Cortante" value="${tipo_dano}" oninput="atualizarBadgeDano('${index}'); if(typeof sincronizarAtaqueComInventario === 'function') sincronizarAtaqueComInventario('${index}')" data-damage-type="${tipo_dano.toLowerCase()}">
        <input type="text" id="atk_critico_${index}" class="save-input inv-input" placeholder="Ex: 19/x3" value="${critico}">
        <input type="text" id="atk_alcance_${index}" class="save-input inv-input" placeholder="Ex: Curto" value="${alcance}">
        
        <button type="button" class="btn-open-desc" onclick="abrirModalAtk('${index}')">🔍</button>
        <button type="button" class="btn-open-desc" onclick="duplicarAtaque('${index}')" title="Duplicar">📋</button>
        <button type="button" class="btn-remove-class" onclick="removerAtaque(this)">×</button>

        <div style="display:none">
            <input type="hidden" id="atk_origin_${index}" class="save-input" value="${originIndex}">
            <input type="hidden" id="atk_tipo_${index}" class="save-input" value="${tipo}">
            <textarea id="atk_desc_${index}" class="save-input">${desc}</textarea>
        </div>
    `;

    container.appendChild(row);
    atualizarBadgeDano(index);
    if (idIndex === null) {
        atualizarTudo();
        filtrarAtaques();
    }
}

function atualizarBadgeDano(index) {
    const input = document.getElementById(`atk_tipo_dano_${index}`);
    if (!input) return;
    const val = input.value.toLowerCase();
    const DAMAGE_MAP = {
        cortante: 'dmg-slash',   corte: 'dmg-slash',
        perfurante: 'dmg-pierce', perfur: 'dmg-pierce',
        contundente: 'dmg-blunt', contund: 'dmg-blunt',
        fogo: 'dmg-fire',        chama: 'dmg-fire',
        gelo: 'dmg-ice',         frio: 'dmg-ice',
        raio: 'dmg-lightning',   elétric: 'dmg-lightning',
        ácido: 'dmg-acid',       acido: 'dmg-acid',
        necr: 'dmg-necrotic',    necrótic: 'dmg-necrotic',
        radiant: 'dmg-radiant',  divino: 'dmg-radiant',
        psíquic: 'dmg-psychic',  mental: 'dmg-psychic',
    };
    const allClasses = Object.values(DAMAGE_MAP);
    input.classList.remove(...allClasses);
    for (const [key, cls] of Object.entries(DAMAGE_MAP)) {
        if (val.includes(key)) { input.classList.add(cls); break; }
    }
}

function duplicarAtaque(index) {
    adicionarAtaqueUI(
        document.getElementById(`atk_nome_${index}`).value + " (Cópia)",
        document.getElementById(`atk_teste_${index}`).value,
        document.getElementById(`atk_dano_${index}`).value,
        document.getElementById(`atk_critico_${index}`).value,
        document.getElementById(`atk_alcance_${index}`).value,
        document.getElementById(`atk_tipo_${index}`).value,
        document.getElementById(`atk_desc_${index}`).value,
        null,
        document.getElementById(`atk_tipo_dano_${index}`).value,
        document.getElementById(`atk_origin_${index}`).value
    );
}

function removerAtaque(btn) {
    const row = btn.closest('.item-row');
    const index = row.dataset.index;
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.includes(`atk_`) && k.endsWith(`_${index}`)) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    row.remove();
    atualizarTudo();
    filtrarAtaques();
}

function limparAtaques() {
    if (!confirm("Remover todos os registros de ataques?")) return;
    document.getElementById('ataques-container').innerHTML = '';
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(dados).forEach(k => { if (k.startsWith('atk_')) delete dados[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
    filtrarAtaques();
}

function resetarFiltrosAtaque() {
    document.getElementById('search-ataque').value = '';
    document.getElementById('filter-ataque-tipo').value = 'todos';
    filtrarAtaques();
    showNotification("Filtros limpos", "info", 2000);
}

function filtrarAtaques() {
    const termo = document.getElementById('search-ataque').value.toLowerCase();
    const filtroTipo = document.getElementById('filter-ataque-tipo').value;
    let contador = 0;
    document.querySelectorAll('#ataques-container .item-row').forEach(row => {
        const idx = row.dataset.index;
        const match = (document.getElementById(`atk_nome_${idx}`)?.value.toLowerCase().includes(termo)) && (filtroTipo === 'todos' || document.getElementById(`atk_tipo_${idx}`)?.value === filtroTipo);
        row.style.display = match ? 'grid' : 'none';
        if (match) contador++;
    });
    if (document.getElementById('ataques-counter')) document.getElementById('ataques-counter').innerText = `Ataques visíveis: ${contador}`;
}