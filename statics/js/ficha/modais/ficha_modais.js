/**
 * Centralização de todos os modais da página da Ficha
 */

let pendingUniqueSelect = null;
let currentCientistaIndex = null;

/**
 * MODAL DE AJUDA: Detalhamento de Cálculos (Atributos, Vida, Mana, etc)
 */
function abrirModalCalculoGenerico(alias) {
    // Mapeia o nome amigável passado no HTML para o ID real do input
    const idMap = {
        'vida': 'pv_max',
        'mana': 'pm_max',
        'defesa': 'defesa',
        'movimentacao': 'movimentacao',
        'sanidade': 'sanidade',
        'status_info': 'status_info'
    };

    const elId = idMap[alias] || alias;
    const el = document.getElementById(elId);
    if (!el) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) return;

    // Define um nome bonito para o título do modal
    const nameMap = {
        'pv_max': 'Vida Máxima',
        'pm_max': 'Mana Máxima',
        'status_info': 'Status',
        'movimentacao': 'Movimentação',
        'defesa': 'Defesa',
        'sanidade': 'Sanidade'
    };
    let displayName = nameMap[elId] || elId.toUpperCase();
    title.innerText = `Cálculo de ${displayName}`;

    const fullTitle = el.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Sem detalhes.";
    const items = breakdownPart.split(' | ');

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            ${items.map(item => {
        const colored = item
            .replace(/Base: (\d+)/g, '<span class="calc-label-base">Base: $1</span>')
            .replace(/(\+\d+)/g, '<span class="calc-label-bonus-pos">$1</span>')
            .replace(/(\-\d+)/g, '<span class="calc-label-bonus-neg">$1</span>');
        return `
                <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid var(--primary-color); font-size: 0.9rem;">
                    ${colored}
                </div>`;
    }).join('')}
            <div class="calc-label-total" style="background: var(--primary-glow); border-radius: 4px; padding: 12px; text-align: center; border-top: none;">
                Total: ${el.value}
            </div>
        </div>
    `;
    modal.showModal();
}

const mostrarAjudaCalculo = abrirModalCalculoGenerico;
const mostrarAjudaCalculoGenerico = abrirModalCalculoGenerico;
const mostrarAjudaAtributo = abrirModalCalculoGenerico;

/**
 * MODAL DE CLASSE: Cientista e Classe Única
 */
function abrirModalCientistaSubclasse(index) {
    currentCientistaIndex = index;
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) modal.showModal();
}

function fecharModalCientistaSubclasse() {
    const modal = document.getElementById('modal-cientista-subclasse');
    if (modal) fecharDialogoAnimado(modal);
    currentCientistaIndex = null;
}

function escolherSubclasseCientista(index, subclasse) {
    if (index === null) return;
    const subInput = document.getElementById(`class_sub_${index}`);
    const nameSel = document.getElementById(`class_name_${index}`);
    if (subInput && nameSel) {
        subInput.value = subclasse;
        if (typeof formatarNomeClasseCientista === 'function') formatarNomeClasseCientista(nameSel, subclasse);
    }
    fecharModalCientistaSubclasse();
    atualizarTudo();
}

function confirmarClasseUnica() {
    showConfirm("O Ceifeiro de Almas é uma classe exclusiva. Se você continuar, todas as suas outras classes serão removidas permanentemente. Deseja prosseguir?", () => {
        if (!pendingUniqueSelect) return;
        const targetRow = pendingUniqueSelect.closest('.class-row');
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        document.querySelectorAll('.class-row').forEach(row => {
            if (row !== targetRow) {
                // Dispara o efeito épico de alma escapando da linha removida
                if (typeof criarEfeitoAlmaEscapando === 'function') criarEfeitoAlmaEscapando(row);
                else if (typeof criarEfeitoFumaca === 'function') criarEfeitoFumaca(row);

                const nameSelect = row.querySelector('[id^="class_name_"]');
                const index = nameSelect?.id.split('_').pop();
                if (index) {
                    delete dados[`class_name_${index}`];
                    delete dados[`class_lvl_${index}`];
                    delete dados[`class_sub_${index}`];
                }

                // Pequeno atraso para o efeito visual de fumaça ser percebido antes da remoção
                setTimeout(() => row.remove(), 300);
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        if (typeof atualizarEstiloClasse === 'function') atualizarEstiloClasse(pendingUniqueSelect);

        const modalUnique = document.getElementById('modal-unique-class');
        if (modalUnique) fecharDialogoAnimado(modalUnique);

        pendingUniqueSelect = null;
        atualizarTudo();
        showNotification("Classe Ceifeiro de Almas ativada. Outras classes removidas.", "success");
    }, () => {
        if (pendingUniqueSelect) pendingUniqueSelect.value = ""; // Reseta a seleção da classe

        const modalUnique = document.getElementById('modal-unique-class');
        if (modalUnique) fecharDialogoAnimado(modalUnique);

        pendingUniqueSelect = null;
        atualizarTudo();
        showNotification("Seleção de Ceifeiro de Almas cancelada.", "info");
    }, "Classe Única Detectada");
}

function cancelarClasseUnica() {
    if (pendingUniqueSelect) pendingUniqueSelect.value = "";
    fecharDialogoAnimado(document.getElementById('modal-unique-class'));
    pendingUniqueSelect = null;
    atualizarTudo();
}

/**
 * MODAL DE AJUSTES PERSONALIZADOS: Vida/Mana/Sanidade Máximas fora de poderes/itens/raça
 * Permite ao jogador registrar uma LISTA de ganhos e/ou perdas (buffs e debuffs) dos
 * valores máximos vindos de situações especiais — maldições, bênçãos, eventos únicos,
 * regras de mesa, etc — podendo ter quantos modificadores forem necessários.
 * Cada entrada é salva como { valor, motivo } em uma lista JSON por status.
 */
let ajusteVitalAtual = null;

const AJUSTE_VITAL_MAP = {
    vida: { campo: 'pv_ajustes_manuais', label: 'Vida' },
    mana: { campo: 'pm_ajustes_manuais', label: 'Mana' },
    sanidade: { campo: 'sanidade_ajustes_manuais', label: 'Sanidade' }
};

function abrirAjustePersonalizado(tipo) {
    const cfg = AJUSTE_VITAL_MAP[tipo];
    if (!cfg) return;

    const modal = document.getElementById('modal-ajuste-vital');
    const title = document.getElementById('modal-ajuste-vital-title');
    const container = document.getElementById('ajuste-vital-container');
    if (!modal || !title || !container) return;

    ajusteVitalAtual = tipo;
    title.innerText = `Ajustes Personalizados de ${cfg.label} Máxima`;
    container.innerHTML = '';

    let lista = [];
    try {
        const raw = document.getElementById(cfg.campo)?.value;
        if (raw) lista = JSON.parse(raw);
    } catch (e) { lista = []; }
    if (!Array.isArray(lista)) lista = [];
    if (lista.length === 0) lista = [{ valor: 0, motivo: '' }];

    lista.forEach(item => adicionarLinhaAjusteVital(item));

    modal.showModal();
}

function adicionarLinhaAjusteVital(data = { valor: 0, motivo: '' }) {
    const container = document.getElementById('ajuste-vital-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'ajuste-vital-row';
    div.innerHTML = `
        <input type="number" class="ajuste-vital-valor header-input" value="${parseInt(data.valor) || 0}" title="Valor do ajuste (use negativo para penalidades)" placeholder="+/-" />
        <input type="text" class="ajuste-vital-motivo header-input" value="${(data.motivo || '').replace(/"/g, '&quot;')}" placeholder="Motivo / Origem (opcional)" />
        <button type="button" class="btn-remove-class" onclick="this.closest('.ajuste-vital-row').remove()">×</button>
    `;
    container.appendChild(div);
}

function salvarAjustePersonalizado() {
    const cfg = AJUSTE_VITAL_MAP[ajusteVitalAtual];
    if (!cfg) return;

    const container = document.getElementById('ajuste-vital-container');
    const linhas = container ? container.querySelectorAll('.ajuste-vital-row') : [];
    const lista = [];

    linhas.forEach(row => {
        const valor = parseInt(row.querySelector('.ajuste-vital-valor')?.value) || 0;
        const motivo = (row.querySelector('.ajuste-vital-motivo')?.value || '').trim();
        if (valor !== 0 || motivo !== '') lista.push({ valor, motivo });
    });

    const destino = document.getElementById(cfg.campo);
    if (destino) destino.value = lista.length ? JSON.stringify(lista) : '';

    const modal = document.getElementById('modal-ajuste-vital');
    if (modal) fecharDialogoAnimado(modal);

    const tipoSalvo = ajusteVitalAtual;
    ajusteVitalAtual = null;
    atualizarTudo();

    if (typeof showNotification === 'function') {
        const cfgLabel = AJUSTE_VITAL_MAP[tipoSalvo]?.label || '';
        showNotification(`Ajustes personalizados de ${cfgLabel} Máxima salvos!`, 'success');
    }
}

/**
 * Atualiza o tooltip dos botões "±" de Vida/Mana/Sanidade com um resumo dos
 * ajustes personalizados ativos no momento (chamado a cada recálculo da ficha).
 */
function atualizarAjustesPersonalizadosUI(dados) {
    if (typeof somarAjustesManuais !== 'function') return;

    Object.keys(AJUSTE_VITAL_MAP).forEach(tipo => {
        const cfg = AJUSTE_VITAL_MAP[tipo];
        const btn = document.querySelector(`.btn-calc-ajuste[onclick="abrirAjustePersonalizado('${tipo}')"]`);
        if (!btn) return;

        const resultado = somarAjustesManuais(dados, cfg.campo);
        if (resultado.total === 0 || resultado.detalhes.length === 0) {
            btn.title = `Ajuste personalizado de ${cfg.label} Máxima (eventos, maldições, bênçãos e outras situações que não sejam poderes/itens)`;
            btn.classList.remove('btn-calc-ajuste-ativo');
        } else {
            const resumo = resultado.detalhes.map(d => d.replace('Ajuste Personalizado: ', '')).join(' | ');
            btn.title = `Ajustes ativos (total ${resultado.total >= 0 ? '+' : ''}${resultado.total}): ${resumo}`;
            btn.classList.add('btn-calc-ajuste-ativo');
        }
    });
}

/**
 * MODAL DE RAÇA E STATUS
 */
function escolherPoderEspirito(poder) {
    const inputPoder = document.getElementById("espirito_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        fecharDialogoAnimado(document.getElementById('modal-poder-espirito'));
        atualizarTudo();
    }
}

function escolherPoderMortoVivo(poder) {
    const inputPoder = document.getElementById("morto_vivo_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        fecharDialogoAnimado(document.getElementById('modal-poder-morto'));
        atualizarTudo();
    }
}

function escolherPoderAnimalia(poder) {
    const inputPoder = document.getElementById("animalia_poder");
    if (inputPoder) {
        inputPoder.value = poder;
        fecharDialogoAnimado(document.getElementById('modal-poder-animalia'));
        atualizarTudo();
    }
}

function escolherFamiliaFada(familia) {
    const input = document.getElementById("fada_familia");
    if (input) {
        input.value = familia;
        fecharDialogoAnimado(document.getElementById('modal-familia-fada'));
        atualizarTudo();
    }
}

function escolherStatus(valor) {
    const inputStatus = document.getElementById('status_info');
    if (inputStatus) inputStatus.value = (valor > 0 ? "+" : "") + valor;
    const inputDef = document.getElementById('status_inicial_definido');
    if (inputDef) inputDef.value = "true";
    const modal = document.getElementById('modal-status');
    if (modal) fecharDialogoAnimado(modal);
    atualizarTudo();
}
