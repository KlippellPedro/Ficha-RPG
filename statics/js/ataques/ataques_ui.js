/**
 * Interface dos ataques: cards, filtros e ações rápidas.
 * Os IDs persistidos continuam idênticos ao formato legado `atk_campo_ID`.
 */

function configurarCampoAtaque(input, id, value = "") {
    input.id = id;
    input.value = value ?? "";
    return input;
}

function atualizarResumoCardAtaque(index) {
    const row = document.querySelector(`#ataques-container .item-row[data-index="${CSS.escape(String(index))}"]`);
    if (!row) return;

    const descricao = document.getElementById(`atk_desc_${index}`)?.value.trim() || "";
    const preview = row.querySelector('.atk-card-description');
    if (preview) preview.textContent = descricao || "Sem observações ou efeitos especiais registrados.";

    const origin = document.getElementById(`atk_origin_${index}`)?.value;
    const originBadge = row.querySelector('.atk-origin-badge');
    if (originBadge) {
        originBadge.textContent = origin ? "Vinculado ao inventário" : "Ataque manual";
        originBadge.dataset.origin = origin ? "inventory" : "manual";
    }
}

function adicionarAtaqueUI(nome = "", teste = "", dano = "", critico = "", alcance = "", tipo = "Corpo-a-Corpo", desc = "", idIndex = null, tipo_dano = "", originIndex = "") {
    const container = document.getElementById('ataques-container');
    if (!container) return;

    const index = String(idIndex !== null ? idIndex : Date.now());
    const row = document.createElement('article');
    row.className = 'item-row atk-row-grid atk-card draggable ui-enter';
    row.draggable = true;
    row.dataset.index = index;

    row.innerHTML = `
        <header class="atk-card-header">
            <div class="atk-card-identity">
                <span class="atk-card-kicker">Ataque preparado</span>
                <input type="text" class="save-input inv-input atk-name-input" placeholder="Nome da arma ou ataque" aria-label="Nome do ataque">
                <small class="atk-origin-badge"></small>
            </div>
            <button type="button" class="btn-remove-class atk-remove-button" title="Remover ataque" aria-label="Remover ataque">×</button>
        </header>

        <div class="atk-card-stats">
            <label class="atk-field">
                <span>Teste</span>
                <input type="text" class="save-input inv-input atk-test-input" placeholder="Ex.: Luta">
            </label>
            <label class="atk-field atk-field--damage">
                <span>Dano</span>
                <input type="text" class="save-input inv-input atk-damage-input" placeholder="Ex.: 1d8+5">
            </label>
            <label class="atk-field">
                <span>Tipo de dano</span>
                <input type="text" class="save-input inv-input atk-damage-badge" placeholder="Ex.: Corte">
            </label>
            <label class="atk-field">
                <span>Crítico</span>
                <input type="text" class="save-input inv-input atk-critical-input" placeholder="Ex.: 19/x3">
            </label>
            <label class="atk-field">
                <span>Alcance</span>
                <input type="text" class="save-input inv-input atk-range-input" placeholder="Ex.: Curto">
            </label>
        </div>

        <p class="atk-card-description"></p>

        <footer class="atk-card-footer">
            <button type="button" class="btn-open-desc atk-details-button">Detalhes</button>
            <button type="button" class="btn-duplicate atk-duplicate-button" title="Duplicar ataque">Duplicar</button>
        </footer>

        <div class="item-hidden-data" hidden>
            <input type="hidden" class="save-input atk-origin-input">
            <input type="hidden" class="save-input atk-type-input">
            <textarea class="save-input atk-description-input"></textarea>
        </div>
    `;

    const nameInput = configurarCampoAtaque(row.querySelector('.atk-name-input'), `atk_nome_${index}`, nome);
    configurarCampoAtaque(row.querySelector('.atk-test-input'), `atk_teste_${index}`, teste);
    configurarCampoAtaque(row.querySelector('.atk-damage-input'), `atk_dano_${index}`, dano);
    const damageTypeInput = configurarCampoAtaque(row.querySelector('.atk-damage-badge'), `atk_tipo_dano_${index}`, tipo_dano);
    configurarCampoAtaque(row.querySelector('.atk-critical-input'), `atk_critico_${index}`, critico);
    configurarCampoAtaque(row.querySelector('.atk-range-input'), `atk_alcance_${index}`, alcance);
    configurarCampoAtaque(row.querySelector('.atk-origin-input'), `atk_origin_${index}`, originIndex);
    configurarCampoAtaque(row.querySelector('.atk-type-input'), `atk_tipo_${index}`, tipo);
    configurarCampoAtaque(row.querySelector('.atk-description-input'), `atk_desc_${index}`, desc);

    nameInput.addEventListener('input', () => {
        if (typeof sincronizarAtaqueComInventario === 'function') sincronizarAtaqueComInventario(index);
    });
    damageTypeInput.addEventListener('input', () => {
        atualizarBadgeDano(index);
        if (typeof sincronizarAtaqueComInventario === 'function') sincronizarAtaqueComInventario(index);
    });
    row.querySelector('.atk-details-button').addEventListener('click', () => abrirModalAtk(index));
    row.querySelector('.atk-duplicate-button').addEventListener('click', () => duplicarAtaque(index));
    row.querySelector('.atk-remove-button').addEventListener('click', (event) => removerAtaque(event.currentTarget));

    container.appendChild(row);
    atualizarBadgeDano(index);
    atualizarResumoCardAtaque(index);

    if (idIndex === null) {
        atualizarTudo();
        filtrarAtaques();
        nameInput.focus();
    }
}

function atualizarBadgeDano(index) {
    const input = document.getElementById(`atk_tipo_dano_${index}`);
    if (!input) return;
    const val = input.value.toLowerCase();
    const DAMAGE_MAP = {
        cortante: 'dmg-slash', corte: 'dmg-slash',
        perfurante: 'dmg-pierce', perfur: 'dmg-pierce',
        contundente: 'dmg-blunt', contund: 'dmg-blunt',
        fogo: 'dmg-fire', chama: 'dmg-fire',
        gelo: 'dmg-ice', frio: 'dmg-ice',
        raio: 'dmg-lightning', elétric: 'dmg-lightning',
        ácido: 'dmg-acid', acido: 'dmg-acid',
        necr: 'dmg-necrotic', necrótic: 'dmg-necrotic',
        radiant: 'dmg-radiant', divino: 'dmg-radiant',
        psíquic: 'dmg-psychic', mental: 'dmg-psychic',
    };
    const allClasses = [...new Set(Object.values(DAMAGE_MAP))];
    input.classList.remove(...allClasses);
    for (const [key, className] of Object.entries(DAMAGE_MAP)) {
        if (val.includes(key)) {
            input.classList.add(className);
            break;
        }
    }
}

function duplicarAtaque(index) {
    adicionarAtaqueUI(
        `${document.getElementById(`atk_nome_${index}`)?.value || "Ataque"} (Cópia)`,
        document.getElementById(`atk_teste_${index}`)?.value || "",
        document.getElementById(`atk_dano_${index}`)?.value || "",
        document.getElementById(`atk_critico_${index}`)?.value || "",
        document.getElementById(`atk_alcance_${index}`)?.value || "",
        document.getElementById(`atk_tipo_${index}`)?.value || "Outro",
        document.getElementById(`atk_desc_${index}`)?.value || "",
        null,
        document.getElementById(`atk_tipo_dano_${index}`)?.value || "",
        document.getElementById(`atk_origin_${index}`)?.value || ""
    );
}

function removerAtaque(btn) {
    const row = btn.closest('.item-row');
    if (!row) return;
    const index = row.dataset.index;
    const nome = document.getElementById(`atk_nome_${index}`)?.value || "este ataque";
    const confirmar = typeof showConfirm === 'function'
        ? (callback) => showConfirm(`Remover “${nome}”?`, callback, () => {}, "Remover ataque")
        : (callback) => { if (confirm(`Remover “${nome}”?`)) callback(); };

    confirmar(() => {
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.startsWith('atk_') && key.endsWith(`_${index}`)) delete dados[key];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        row.remove();
        atualizarTudo();
        filtrarAtaques();
        if (typeof showNotification === 'function') showNotification("Ataque removido.", "info");
    });
}

function limparAtaques() {
    const executar = () => {
        document.getElementById('ataques-container')?.replaceChildren();
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        Object.keys(dados).forEach(key => {
            if (key.startsWith('atk_')) delete dados[key];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        filtrarAtaques();
        if (typeof showNotification === 'function') showNotification("Todos os ataques foram removidos.", "success");
    };

    if (typeof showConfirm === 'function') {
        showConfirm("Remover todos os registros de ataques?", executar, () => {}, "Limpar ataques");
    } else if (confirm("Remover todos os registros de ataques?")) {
        executar();
    }
}

function resetarFiltrosAtaque() {
    const search = document.getElementById('search-ataque');
    const type = document.getElementById('filter-ataque-tipo');
    if (search) search.value = '';
    if (type) type.value = 'todos';
    filtrarAtaques();
    if (typeof showNotification === 'function') showNotification("Filtros limpos", "info", 2000);
}

function filtrarAtaques() {
    const termo = document.getElementById('search-ataque')?.value.trim().toLowerCase() || "";
    const filtroTipo = document.getElementById('filter-ataque-tipo')?.value || "todos";
    const rows = [...document.querySelectorAll('#ataques-container .item-row')];
    let contador = 0;

    rows.forEach(row => {
        const index = row.dataset.index;
        const nome = document.getElementById(`atk_nome_${index}`)?.value.toLowerCase() || "";
        const tipo = document.getElementById(`atk_tipo_${index}`)?.value || "Outro";
        const match = nome.includes(termo) && (filtroTipo === 'todos' || tipo === filtroTipo);
        row.hidden = !match;
        if (match) contador += 1;
    });

    const counter = document.getElementById('ataques-counter');
    if (counter) counter.textContent = `${contador} ${contador === 1 ? 'visível' : 'visíveis'}`;

    const summary = document.getElementById('ataques-summary-count');
    if (summary) summary.textContent = String(rows.length);

    const emptyState = document.getElementById('ataques-empty-state');
    if (emptyState) emptyState.hidden = contador !== 0;
}
