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

    modal.showModal();
}

function fecharModalConfirm() {
    document.getElementById('modal-confirm').close();
    confirmCallback = null;
}

/**
 * Editor de Texto Expandido (Usado principalmente nas Notas)
 */
let targetTextareaId = null;

function abrirEditorTexto(targetId, title = "Editor de Texto") {
    targetTextareaId = targetId;
    const sourceEl = document.getElementById(targetId);
    const modalEl = document.getElementById('modal-text-editor');
    const textareaEl = document.getElementById('modal-text-editor-textarea');
    const titleEl = document.getElementById('modal-text-editor-title');

    if (!modalEl || !textareaEl) return;

    titleEl.innerText = title;
    textareaEl.value = sourceEl ? sourceEl.value : "";
    modalEl.showModal();
}

function fecharEditorTexto() {
    const modal = document.getElementById('modal-text-editor');
    if (modal) modal.close();
    targetTextareaId = null;
}

function confirmarEdicaoTexto() {
    const textarea = document.getElementById('modal-text-editor-textarea');
    if (textarea && targetTextareaId) {
        const targetEl = document.getElementById(targetTextareaId);
        if (targetEl) targetEl.value = textarea.value;
    }
    fecharEditorTexto();
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

    // Usa a constante global que agora já é sensível ao contexto de aliado
    let historico = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    container.innerHTML = historico.length ? historico.map(h => `
        <div style="display:flex; justify-content:space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">
            <span><strong style="color:var(--primary-color)">${h.nome}</strong> <small style="color:#888; margin-left:8px;">${h.timestamp}</small></span>
            <span style="color:#4ade80">-${h.custo} ${h.tipoCusto}</span>
        </div>
    `).join('') : '<p style="text-align:center; color:#888; padding:30px;">Nenhum uso registrado recentemente.</p>';

    modal.showModal();
}

/**
 * Limpa o histórico de uso do localStorage
 */
function limparHistorico() {
    showConfirm("Deseja realmente limpar todo o histórico de uso?", () => {
        localStorage.removeItem(HISTORY_KEY);
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
        <dialog id="modal-confirm" class="modal-overlay">
            <div class="modal-content">
                <h3 id="modal-confirm-title" class="modal-title">Confirmação</h3>
                <p id="modal-confirm-body" class="modal-body"></p>
                <div class="modal-footer">
                    <button type="button" class="btn-confirm-yes" onclick="confirmCallback(true)">Sim</button>
                    <button type="button" class="btn-confirm-no" onclick="confirmCallback(false)">Não</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Histórico (reutilizado de global.js)
    const historicoModalHtml = `
        <dialog id="modal-historico" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 style="color: var(--primary-color); margin: 0">Histórico de Conjuração</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="historico-lista"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: transparent; border: 1px dashed var(--primary-color); color: var(--primary-color); flex: 1;" onclick="limparHistorico()">Limpar</button>
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: white; flex: 2;" onclick="this.closest('dialog').close()">Fechar</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Personalização
    const personalizacaoModalHtml = `
        <dialog id="modal-config" class="modal-overlay">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 style="color: var(--primary-color); margin: 0">Aparência da Ficha</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Cor Primária</label>
                        <input type="color" id="input-theme-color"
                               value="${localStorage.getItem('ficha_rpg_tema') || '#ff4444'}"
                               style="width: 100%; height: 50px; cursor: pointer; background: none; border: 1px solid #333; border-radius: 8px;"
                               onchange="aplicarCorTema(this.value)">
                        <p style="font-size: 0.75rem; color: #666; margin-top: 6px;">Bordas, títulos e destaques principais.</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Cor Secundária</label>
                        <input type="color" id="input-theme-color-secondary"
                               value="${localStorage.getItem('ficha_rpg_tema_secundaria') || '#457b9d'}"
                               style="width: 100%; height: 50px; cursor: pointer; background: none; border: 1px solid #333; border-radius: 8px;"
                               onchange="aplicarCorSecundaria(this.value)">
                        <p style="font-size: 0.75rem; color: #666; margin-top: 6px;">Acentos complementares e elementos de combate.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: white; width: 100%" onclick="this.closest('dialog').close()">Salvar e Fechar</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Seleção de Classe
    const classSelectModalHtml = `
        <dialog id="modal-class-select" class="modal-overlay">
            <div class="modal-content" style="max-width: 520px; width: 95%;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: var(--primary-color)">Escolher Classe</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div style="padding: 4px 0 8px 0;">
                    <input type="text" id="modal-class-search"
                           placeholder="🔍  Buscar classe..."
                           oninput="filtrarModalClasse(this.value)"
                           style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:white;font-size:0.85rem;outline:none;box-sizing:border-box;"
                    />
                </div>
                <div class="modal-body" id="modal-class-select-list" style="max-height: 55vh; overflow-y: auto;"></div>
            </div>
        </dialog>
    `;

    // Modal de Ajuda de Cálculo (Usado na Ficha e Perícias)
    const ajudaModalHtml = `
        <dialog id="modal-calc-ajuda" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-calc-ajuda-title" class="modal-title" style="color: var(--primary-color)">Cálculo</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-calc-ajuda-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: var(--primary-color); color: white; width: 100%" onclick="this.closest('dialog').close()">Entendido</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Detalhes de Habilidade/Poder/Magia
    const habModalHtml = `
        <dialog id="modal-hab" class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-hab-title" class="modal-title" style="color: var(--primary-color)">Detalhes</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-hab-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </dialog>
    `;

    // Modal de Detalhes de Poder
    const podModalHtml = `
        <dialog id="modal-poder" class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-poder-title" class="modal-title" style="color: var(--primary-color)">Detalhes do Poder</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-poder-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </dialog>
    `;

    // Modal de Detalhes de Magia
    const magModalHtml = `
        <dialog id="modal-magia" class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-magia-title" class="modal-title" style="color: var(--primary-color)">Detalhes da Magia</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-magia-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </dialog>
    `;

    // Modal de Detalhes de Ataque
    const atkModalHtml = `
        <dialog id="modal-ataque" class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-ataque-title" class="modal-title" style="color: var(--primary-color)">Detalhes do Ataque</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-ataque-body"></div>
                <div class="modal-footer" style="display: flex; gap: 10px;"></div>
            </div>
        </dialog>
    `;

    // Modal de Detalhes de Nota (Diário)
    const notaModalHtml = `
        <dialog id="modal-nota" class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="modal-nota-title" class="modal-title" style="color: var(--primary-color)">Diário</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body" id="modal-nota-body"></div>
            </div>
        </dialog>
    `;

    // Modal de Editor de Texto Expandido
    const textEditorModalHtml = `
        <dialog id="modal-text-editor" class="modal-overlay">
            <div class="modal-content" style="max-width: 800px; width: 95%;">
                <div class="modal-header">
                    <h3 id="modal-text-editor-title" class="modal-title" style="color: var(--primary-color)">Editor de Texto</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body">
                    <textarea id="modal-text-editor-textarea" class="inv-input diario-escrita" style="min-height: 50vh; width: 100%;" placeholder="Escreva aqui os detalhes..."></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" onclick="confirmarEdicaoTexto()" style="width: 100%">Confirmar e Salvar</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Subclasse do Cientista (Nível 5)
    const cientistaModalHtml = `
        <dialog id="modal-cientista-subclasse" class="modal-overlay">
            <div class="modal-content" style="max-width: 500px; background: #18181b; border: 1px solid var(--primary-color); border-radius: 12px; padding: 20px;">
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
        </dialog>
    `;

    // Modal de Classe Única (Ceifeiro de Almas)
    const uniqueClassModalHtml = `
        <dialog id="modal-unique-class" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: #00ffd2">Classe Exclusiva</h3>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #ccc;">O Ceifeiro de Almas não permite outras classes. Se continuar, todas as suas outras classes serão removidas permanentemente. Deseja prosseguir?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: #00ffd2; color: white; flex: 1;" onclick="confirmarClasseUnica()">Sim, Aceitar</button>
                    <button type="button" class="btn-save-modal" style="background: #333; color: white; flex: 1;" onclick="cancelarClasseUnica()">Cancelar</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Poderes de Raça (Espírito e Morto-Vivo)
    const racePowersModalHtml = `
        <dialog id="modal-poder-espirito" class="modal-overlay">
            <div class="modal-content"><div class="modal-header"><h3 class="modal-title">Poder de Espírito</h3></div><div class="modal-body"><div class="modal-selection-list">
                <div class="selection-option" onclick="escolherPoderEspirito('assustador')"><strong>Assustador</strong><p>Ganha bônus em Intimidação.</p></div>
                <div class="selection-option" onclick="escolherPoderEspirito('possessao')"><strong>Possessão</strong><p>Ganha Ofício: Possessão.</p></div>
            </div></div></div>
        </dialog>
        <dialog id="modal-poder-morto" class="modal-overlay">
            <div class="modal-content"><div class="modal-header"><h3 class="modal-title">Poder de Morto-Vivo</h3></div><div class="modal-body"><div class="modal-selection-list">
                <div class="selection-option" onclick="escolherPoderMortoVivo('resistente')"><strong>Resistência</strong><p>Ignora penalidades leves.</p></div>
                <div class="selection-option" onclick="escolherPoderMortoVivo('fome')"><strong>Fome</strong><p>Cura ao consumir carne.</p></div>
            </div></div></div>
        </dialog>
    `;

    // Modal de Status Inicial (Carisma 3+)
    const statusModalHtml = `
        <dialog id="modal-status" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header"><h3 class="modal-title">Status Inicial</h3></div>
                <div class="modal-body"><p style="text-align: center; color: #ccc;">Escolha seu status social inicial:</p><div class="modal-selection-list">
                    <div class="selection-option" onclick="escolherStatus(1)"><strong>Status +1</strong><p>Bem visto pela sociedade.</p></div>
                    <div class="selection-option" onclick="escolherStatus(0)"><strong>Status 0</strong><p>Um cidadão comum.</p></div>
                    <div class="selection-option" onclick="escolherStatus(-1)"><strong>Status -1</strong><p>Pária ou mal visto.</p></div>
                </div></div>
            </div>
        </dialog>
    `;

    // Modal de Buffs de Habilidade (Passiva)
    const buffsModalHtml = `
        <dialog id="modal-pod-buffs" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-pod-buffs-title" class="modal-title" style="color: var(--primary-color)">Configurar Buffs</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body">
                    <div id="pod-buffs-container"></div>
                    <button type="button" class="btn-add-class" onclick="typeof adicionarLinhaBuffHab === 'function' ? adicionarLinhaBuffHab() : adicionarLinhaBuffPod()">+ Adicionar Modificador</button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="width: 100%">Salvar Buffs</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Level Up (Escolha de Classe)
    const levelUpModalHtml = `
        <dialog id="modal-level-up" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: #f59e0b">LEVEL UP!</h3>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #ccc; margin-bottom: 20px;">Você alcançou o XP necessário! Escolha qual classe deseja evoluir:</p>
                    <div id="level-up-class-list" class="modal-selection-list"></div>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Gerenciamento de Imagem (Zoom, Posição, Remover)
    const imageManagerModalHtml = `
        <dialog id="modal-image-manager" class="modal-overlay">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: var(--primary-color)">Ajustar Imagem</h3>
                    <button type="button" class="btn-remove-class" onclick="fecharModalGerenciarImagem()">×</button>
                </div>
                <div class="modal-body">
                    <div id="image-manager-preview-container" style="width: 150px; height: 150px; border-radius: 50%; border: 2px solid var(--primary-color); overflow: hidden; margin: 0 auto 20px; background: #000;">
                        <img id="image-manager-preview" src="" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.7rem;">Zoom</label>
                        <input type="range" id="img-manager-zoom" min="0.5" max="3" step="0.1" value="1" oninput="atualizarPreviewAjuste()">
                    </div>
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.7rem;">Posição Horizontal (X)</label>
                        <input type="range" id="img-manager-x" min="0" max="100" value="50" oninput="atualizarPreviewAjuste()">
                    </div>
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="font-size: 0.7rem;">Posição Vertical (Y)</label>
                        <input type="range" id="img-manager-y" min="0" max="100" value="50" oninput="atualizarPreviewAjuste()">
                    </div>
                </div>
                <div class="modal-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button type="button" class="btn-qty" style="width: 100%; height: 40px; border-color: #ef4444; color: #ef4444;" onclick="removerImagem()">Remover</button>
                    <button type="button" class="btn-save-modal" style="width: 100%;" onclick="salvarAjustesImagem()">Salvar</button>
                    <button type="button" class="btn-add-class" style="grid-column: span 2; margin-top: 0;" onclick="trocarImagemDesdeModal()">Trocar Foto</button>
                </div>
            </div>
        </dialog>
    `;

    // Modal de Buffs de Aliados para o Dono
    const allyBuffsModalHtml = `
        <dialog id="modal-ally-buffs" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-ally-buffs-title" class="modal-title" style="color: var(--primary-color)">Buffs de Aliado</h3>
                    <button type="button" class="btn-remove-class" onclick="this.closest('dialog').close()">×</button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 0.8rem; color: #888; margin-bottom: 15px; text-align: center;">Defina os bônus que este aliado concede ao personagem principal quando está ativo.</p>
                    <div id="ally-buffs-container"></div>
                    <button type="button" class="btn-add-class" style="width: 100%; margin-top: 10px;" onclick="adicionarLinhaBuffAliado()">+ Adicionar Bônus de Aliado</button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="width: 100%" onclick="salvarBuffsAliado()">Salvar Buffs</button>
                </div>
            </div>
        </dialog>
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
    body.insertAdjacentHTML('beforeend', textEditorModalHtml);
    body.insertAdjacentHTML('beforeend', cientistaModalHtml);
    body.insertAdjacentHTML('beforeend', uniqueClassModalHtml);
    body.insertAdjacentHTML('beforeend', racePowersModalHtml);
    body.insertAdjacentHTML('beforeend', statusModalHtml);
    body.insertAdjacentHTML('beforeend', buffsModalHtml);
    body.insertAdjacentHTML('beforeend', levelUpModalHtml);
    body.insertAdjacentHTML('beforeend', imageManagerModalHtml);
    body.insertAdjacentHTML('beforeend', allyBuffsModalHtml);
    body.insertAdjacentHTML('beforeend', classSelectModalHtml);

    // Injeta a notificação se ela ainda não existir na página
    if (!document.getElementById('global-notification')) {
        body.insertAdjacentHTML('beforeend', notificationHtml);
    }

    // Adiciona o botão de engrenagem apenas se NÃO estivermos no contexto de um aliado
    if (!allyId) {
        // Adiciona o botão de engrenagem flutuante no canto superior
        // Aumentamos o z-index para 2000 para garantir que ele fique ACIMA do menu (que é 1000)
        const btnConfig = `
            <button id="btn-open-config" 
                    onclick="const m = document.getElementById('modal-config'); if(m) m.showModal()"
                    title="Configurações de Aparência"
                    style="position: fixed; top: 12px; right: 80px; z-index: 2000; background: rgba(0,0,0,0.6); border: 1px solid var(--primary-color); color: var(--primary-color); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: 0.3s; box-shadow: 0 0 10px rgba(0,0,0,0.5); padding: 0 !important; line-height: 1;">
                ⚙
            </button>
        `;
        body.insertAdjacentHTML('beforeend', btnConfig);
    }
});