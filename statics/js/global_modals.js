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

    // Garante que a chave seja encontrada mesmo se global.js ainda não definiu a constante
    const historyKey = typeof HISTORY_KEY !== 'undefined' ? HISTORY_KEY : "ficha_rpg_historico";
    let historico = JSON.parse(localStorage.getItem(historyKey)) || [];

    container.innerHTML = historico.length ? historico.map(h => `
        <div style="display:flex; justify-content:space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">
            <span><strong style="color:var(--primary-color)">${h.nome}</strong> <small style="color:#888; margin-left:8px;">${h.timestamp}</small></span>
            <span style="color:#4ade80">-${h.custo} ${h.tipoCusto}</span>
        </div>
    `).join('') : '<p style="text-align:center; color:#888; padding:30px;">Nenhum uso registrado recentemente.</p>';

    modal.style.display = 'flex';
}

/**
 * Limpa o histórico de uso do localStorage
 */
function limparHistorico() {
    showConfirm("Deseja realmente limpar todo o histórico de uso?", () => {
        const historyKey = typeof HISTORY_KEY !== 'undefined' ? HISTORY_KEY : "ficha_rpg_historico";
        localStorage.removeItem(historyKey);
        if (typeof showNotification === 'function') showNotification("Histórico limpo com sucesso!", "success");
        abrirModalHistorico(); // Atualiza a visualização para mostrar que está vazio
    }, () => { }, "Limpar Histórico");
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
                    <h3 style="color: var(--primary-color); margin: 0">Histórico de Conjuração</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="historico-lista"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: transparent; border: 1px dashed var(--primary-color); color: var(--primary-color); flex: 1;" onclick="limparHistorico()">Limpar</button>
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: black; flex: 2;" onclick="this.closest('.modal-overlay').style.display = 'none'">Fechar</button>
                </div>
            </div>
        </div>
    `;

    // Modal de Personalização
    const personalizacaoModalHtml = `
        <div id="modal-config" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 style="color: var(--primary-color); margin: 0">Aparência da Ficha</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px; color: #ccc;">Cor Principal do Sistema</label>
                        <input type="color" id="input-theme-color" 
                               value="${localStorage.getItem('ficha_rpg_tema') || '#ff4444'}" 
                               style="width: 100%; height: 50px; cursor: pointer; background: none; border: 1px solid #333; border-radius: 8px;"
                               onchange="aplicarCorTema(this.value)">
                    </div>
                    <p style="font-size: 0.8rem; color: #888; text-align: center;">Isso alterará a cor de bordas, títulos e destaques em todas as páginas.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: black; width: 100%" onclick="this.closest('.modal-overlay').style.display = 'none'">Salvar e Fechar</button>
                </div>
            </div>
        </div>
    `;

    // Modal de Ajuda de Cálculo (Usado na Ficha e Perícias)
    const ajudaModalHtml = `
        <div id="modal-calc-ajuda" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-calc-ajuda-title" class="modal-title" style="color: var(--primary-color)">Cálculo</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-calc-ajuda-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: black; width: 100%" onclick="this.closest('.modal-overlay').style.display = 'none'">Entendido</button>
                </div>
            </div>
        </div>
    `;

    // Modal de Detalhes de Habilidade/Poder/Magia
    const habModalHtml = `
        <div id="modal-hab" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-hab-title" class="modal-title" style="color: var(--primary-color)">Detalhes</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-hab-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </div>
    `;

    // Modal de Detalhes de Poder
    const podModalHtml = `
        <div id="modal-poder" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-poder-title" class="modal-title" style="color: var(--primary-color)">Detalhes do Poder</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-poder-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </div>
    `;

    // Modal de Detalhes de Magia
    const magModalHtml = `
        <div id="modal-magia" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-magia-title" class="modal-title" style="color: var(--primary-color)">Detalhes da Magia</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-magia-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </div>
    `;

    // Modal de Detalhes de Ataque
    const atkModalHtml = `
        <div id="modal-ataque" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-ataque-title" class="modal-title" style="color: var(--primary-color)">Detalhes do Ataque</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-ataque-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </div>
    `;

    // Modal de Detalhes de Nota (Diário)
    const notaModalHtml = `
        <div id="modal-nota" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-nota-title" class="modal-title" style="color: var(--primary-color)">Diário</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body" id="modal-nota-body"></div>
            </div>
        </div>
    `;

    // Modal de Subclasse do Cientista (Nível 5)
    const cientistaModalHtml = `
        <div id="modal-cientista-subclasse" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: var(--primary-color)">Especialização de Cientista</h3>
                    <button type="button" class="btn-remove-class" onclick="fecharModalCientistaSubclasse()">×</button>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #ccc; margin-bottom: 15px;">Você atingiu o nível 5! Escolha sua área de especialização:</p>
                    <div class="modal-selection-list">
                        <div class="selection-option" onclick="escolherSubclasseCientista(currentCientistaIndex, 'Ferreiro')">
                            <strong>Ferreiro</strong>
                            <p>Especialista em forja, armamentos e durabilidade física.</p>
                        </div>
                        <div class="selection-option" onclick="escolherSubclasseCientista(currentCientistaIndex, 'Químico')">
                            <strong>Químico</strong>
                            <p>Mestre em compostos químicos, poções e reações.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Modal de Classe Única (Ceifeiro de Almas)
    const uniqueClassModalHtml = `
        <div id="modal-unique-class" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: #00ffd2">Classe Exclusiva</h3>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #ccc;">O Ceifeiro de Almas não permite outras classes. Se continuar, todas as suas outras classes serão removidas permanentemente. Deseja prosseguir?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: #00ffd2; color: black; flex: 1;" onclick="confirmarClasseUnica()">Sim, Aceitar</button>
                    <button type="button" class="btn-save-modal" style="background: #333; color: white; flex: 1;" onclick="cancelarClasseUnica()">Cancelar</button>
                </div>
            </div>
        </div>
    `;

    // Modal de Poderes de Raça (Espírito e Morto-Vivo)
    const racePowersModalHtml = `
        <div id="modal-poder-espirito" class="modal-overlay" style="display: none;">
            <div class="modal-content"><div class="modal-header"><h3 class="modal-title">Poder de Espírito</h3></div><div class="modal-body"><div class="modal-selection-list">
                <div class="selection-option" onclick="escolherPoderEspirito('assustador')"><strong>Assustador</strong><p>Ganha bônus em Intimidação.</p></div>
                <div class="selection-option" onclick="escolherPoderEspirito('possessao')"><strong>Possessão</strong><p>Ganha Ofício: Possessão.</p></div>
            </div></div></div>
        </div>
        <div id="modal-poder-morto" class="modal-overlay" style="display: none;">
            <div class="modal-content"><div class="modal-header"><h3 class="modal-title">Poder de Morto-Vivo</h3></div><div class="modal-body"><div class="modal-selection-list">
                <div class="selection-option" onclick="escolherPoderMortoVivo('resistente')"><strong>Resistência</strong><p>Ignora penalidades leves.</p></div>
                <div class="selection-option" onclick="escolherPoderMortoVivo('fome')"><strong>Fome</strong><p>Cura ao consumir carne.</p></div>
            </div></div></div>
        </div>
    `;

    // Modal de Status Inicial (Carisma 3+)
    const statusModalHtml = `
        <div id="modal-status" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header"><h3 class="modal-title">Status Inicial</h3></div>
                <div class="modal-body"><p style="text-align: center; color: #ccc;">Escolha seu status social inicial:</p><div class="modal-selection-list">
                    <div class="selection-option" onclick="escolherStatus(1)"><strong>Status +1</strong><p>Bem visto pela sociedade.</p></div>
                    <div class="selection-option" onclick="escolherStatus(0)"><strong>Status 0</strong><p>Um cidadão comum.</p></div>
                    <div class="selection-option" onclick="escolherStatus(-1)"><strong>Status -1</strong><p>Pária ou mal visto.</p></div>
                </div></div>
            </div>
        </div>
    `;

    // Modal de Buffs de Habilidade (Passiva)
    const buffsModalHtml = `
        <div id="modal-pod-buffs" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-pod-buffs-title" class="modal-title" style="color: var(--primary-color)">Configurar Buffs</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('.modal-overlay').style.display = 'none'">×</button>
                </div>
                <div class="modal-body">
                    <div id="pod-buffs-container"></div>
                    <button type="button" class="btn-add-class" onclick="typeof adicionarLinhaBuffHab === 'function' ? adicionarLinhaBuffHab() : adicionarLinhaBuffPod()">+ Adicionar Modificador</button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="width: 100%">Salvar Buffs</button>
                </div>
            </div>
        </div>
    `;

    // Elemento de Notificação Global
    const notificationHtml = `
        <div id="global-notification">
            <span class="icon"></span>
            <span class="message"></span>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', confirmModalHtml);
    body.insertAdjacentHTML('beforeend', historicoModalHtml);
    body.insertAdjacentHTML('beforeend', ajudaModalHtml);
    body.insertAdjacentHTML('beforeend', personalizacaoModalHtml);
    body.insertAdjacentHTML('beforeend', habModalHtml);
    body.insertAdjacentHTML('beforeend', podModalHtml);
    body.insertAdjacentHTML('beforeend', magModalHtml);
    body.insertAdjacentHTML('beforeend', atkModalHtml);
    body.insertAdjacentHTML('beforeend', notaModalHtml);
    body.insertAdjacentHTML('beforeend', cientistaModalHtml);
    body.insertAdjacentHTML('beforeend', uniqueClassModalHtml);
    body.insertAdjacentHTML('beforeend', racePowersModalHtml);
    body.insertAdjacentHTML('beforeend', statusModalHtml);
    body.insertAdjacentHTML('beforeend', buffsModalHtml);

    // Injeta a notificação se ela ainda não existir na página
    if (!document.getElementById('global-notification')) {
        body.insertAdjacentHTML('beforeend', notificationHtml);
    }

    // Adiciona o botão de engrenagem flutuante no canto superior
    // Aumentamos o z-index para 2000 para garantir que ele fique ACIMA do menu (que é 1000)
    const btnConfig = `
        <button id="btn-open-config" 
                onclick="const m = document.getElementById('modal-config'); if(m) m.style.display = 'flex'"
                title="Configurações de Aparência"
                style="position: fixed; top: 12px; right: 80px; z-index: 2000; background: rgba(0,0,0,0.6); border: 1px solid var(--primary-color); color: var(--primary-color); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: 0.3s; box-shadow: 0 0 10px rgba(0,0,0,0.5); padding: 0 !important; line-height: 1;">
            ⚙
        </button>
    `;
    body.insertAdjacentHTML('beforeend', btnConfig);
});