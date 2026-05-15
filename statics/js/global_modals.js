/**
 * Lógica para modais globais (Confirmação, Histórico, Ajuda de Cálculo)
 */

let confirmCallback = null;

/**
 * Exibe um modal de confirmação customizado.
 * @param {string} message - A mensagem a ser exibida no modal.
 * @param {function} onConfirm - Callback a ser executado se o usuário confirmar.
 * @param {function} onCancel - Callback a ser executado se o usuário cancelar (opcional).
 * @param {string} title - Título do modal (opcional).
 */
function showConfirm(message, onConfirm, onCancel = () => { }, title = "Confirmação") {
    const modal = document.getElementById('modal-confirm');
    if (!modal) {
        console.error("Modal de confirmação não encontrado. Usando alert() como fallback.");
        if (confirm(message)) onConfirm();
        else onCancel();
        return;
    }

    document.getElementById('modal-confirm-title').innerText = title;
    document.getElementById('modal-confirm-body').innerText = message;

    confirmCallback = (result) => {
        fecharModalConfirm();
        if (result) onConfirm();
        else onCancel();
    };

    modal.style.display = 'flex';
}

function fecharModalConfirm() {
    document.getElementById('modal-confirm').style.display = 'none';
    confirmCallback = null;
}

/**
 * Registra o uso de uma habilidade ou poder no histórico
 */
function registrarHistorico(nome, custo, tipoCusto) {
    let historico = [];
    try {
        historico = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) { historico = []; }

    historico.unshift({
        nome: nome,
        custo: custo,
        tipoCusto: tipoCusto,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    if (historico.length > 20) historico.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historico));
}

function abrirModalHistorico() {
    const modal = document.getElementById('modal-historico');
    const container = document.getElementById('historico-lista');
    if (!modal || !container) return;

    let historico = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    container.innerHTML = historico.length ? historico.map(h => `
        <div style="display:flex; justify-content:space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">
            <span><strong style="color:#ff4444">${h.nome}</strong> <small style="color:#888; margin-left:8px;">${h.timestamp}</small></span>
            <span style="color:#4ade80">-${h.custo} ${h.tipoCusto}</span>
        </div>
    `).join('') : '<p style="text-align:center; color:#888; padding:30px;">Nenhum uso registrado recentemente.</p>';

    modal.style.display = 'flex';
}

// Injeta os modais globais no body ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (!body) return;

    // Modal de Confirmação
    const confirmModalHtml = `
        <div id="modal-confirm" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <h3 id="modal-confirm-title" class="modal-title">Confirmação</h3>
                <p id="modal-confirm-body" class="modal-body"></p>
                <div class="modal-footer">
                    <button type="button" class="btn-confirm-yes" onclick="confirmCallback(true)">Sim</button>
                    <button type="button" class="btn-confirm-no" onclick="confirmCallback(false)">Não</button>
                </div>
            </div>
        </div>
    `;

    // Modal de Histórico (reutilizado de global.js)
    const historicoModalHtml = `
        <div id="modal-historico" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 style="color: #3b82f6; margin: 0">Histórico de Conjuração</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="historico-lista"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: #3b82f6; width: 100%" onclick="this.closest('.modal-overlay').style.display = 'none'">Fechar</button>
                </div>
            </div>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', confirmModalHtml);
    body.insertAdjacentHTML('beforeend', historicoModalHtml);
});