document.addEventListener('DOMContentLoaded', () => {
    renderizarAliados();

    // Automação: Se os dados mudarem em outra aba (na ficha completa), 
    // a página de aliados se atualiza sozinha.
    window.addEventListener('storage', (e) => {
        if (e.key === ALIADOS_KEY || e.key.startsWith('ally_')) {
            renderizarAliados();
        }
    });
});

function getListaAliados() {
    return JSON.parse(localStorage.getItem(ALIADOS_KEY)) || [];
}

function adicionarNovoAliado() {
    const id = "ally_" + Date.now();
    const lista = getListaAliados();
    lista.push(id);

    localStorage.setItem(ALIADOS_KEY, JSON.stringify(lista));

    // Inicializa a ficha do aliado com valores padrão
    const dadosIniciais = {
        nome: "Novo Aliado",
        pv_atual: 20, pv_max: 20,
        pm_atual: 10, pm_max: 10,
        sanidade_atual: 100, sanidade_max: 100,
        defesa: 10, movimentacao: 3,
        raca: "humano",
        forca: 10, destreza: 10, constituicao: 10,
        inteligencia: 10, sabedoria: 10, carisma: 10, aura: 10,
        foto: "",
        nivel: 1,
        xp_atual: 0,
        xp_max: 1000
    };
    localStorage.setItem(id, JSON.stringify(dadosIniciais));

    renderizarAliados();
    showNotification("Novo aliado criado!", "success");
}

function renderizarAliados() {
    const container = document.getElementById('aliados-container');
    const template = document.getElementById('ally-card-template');
    const emptyState = document.getElementById('empty-state');
    const lista = getListaAliados();

    container.innerHTML = '';

    if (lista.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    lista.forEach(id => {
        const dados = JSON.parse(localStorage.getItem(id)) || {};
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.ally-card');

        card.dataset.id = id;
        // Preenchimento dos campos garantindo que nomes de chaves batam com a ficha
        card.querySelector('.ally-nivel-input').value = dados.nivel || 1;
        // 'nome' na ficha, 'nome' aqui
        card.querySelector('.ally-name-input').value = dados.nome || dados.char_nome || "";

        const avatarImg = card.querySelector('.ally-avatar-img');
        if (avatarImg) {
            if (dados.foto) {
                avatarImg.src = dados.foto;
                // Aplica estilos de zoom/posição salvos
                if (typeof aplicarEstilosAvatar === 'function') {
                    aplicarEstilosAvatar(avatarImg, dados);
                }
            } else {
                avatarImg.src = "https://ui-avatars.com/api/?name=?&background=0d0d0f&color=ff4444";
            }
        }

        const colorInput = card.querySelector('.ally-color-input');
        if (colorInput) {
            colorInput.value = dados.cor_tema || "#ff4444";
            card.style.borderTopColor = colorInput.value;
        }

        card.querySelector('.ally-pv-atual').value = dados.pv_atual || 0;
        card.querySelector('.ally-pv-max').value = dados.pv_max || 0;
        card.querySelector('.ally-pm-atual').value = dados.pm_atual || 0;
        card.querySelector('.ally-pm-max').value = dados.pm_max || 0;
        card.querySelector('.ally-sanidade-atual').value = dados.sanidade_atual || 0;
        card.querySelector('.ally-sanidade-max').value = dados.sanidade_max || 0;
        card.querySelector('.ally-defesa-input').value = dados.defesa || 0;
        card.querySelector('.ally-movimentacao-input').value = dados.movimentacao || 0;

        // Adiciona botão de visualização rápida de ataques ao rodapé
        const footer = card.querySelector('.ally-footer');
        if (footer) {
            const btnAtk = document.createElement('button');
            btnAtk.className = 'btn-export-ally';
            btnAtk.innerHTML = '⚔';
            btnAtk.title = 'Ver Ataques';
            btnAtk.onclick = () => window.abrirModalAtaquesAliado(btnAtk);
            footer.insertBefore(btnAtk, footer.firstChild);
        }

        if (footer) {
            const btnMag = document.createElement('button');
            btnMag.className = 'btn-export-ally';
            btnMag.innerHTML = '🪄';
            btnMag.title = 'Ver Magias';
            btnMag.onclick = () => window.abrirModalMagiasAliado(btnMag);
            footer.insertBefore(btnMag, footer.firstChild);
        }

        atualizarBarrasCard(card);
        container.appendChild(clone);
    });
}

function atualizarBarrasCard(card) {
    const pvAtual = parseInt(card.querySelector('.ally-pv-atual').value) || 0;
    const pvMax = parseInt(card.querySelector('.ally-pv-max').value) || 1;
    const pmAtual = parseInt(card.querySelector('.ally-pm-atual').value) || 0;
    const pmMax = parseInt(card.querySelector('.ally-pm-max').value) || 1;
    const sanAtual = parseInt(card.querySelector('.ally-sanidade-atual').value) || 0;
    const sanMax = parseInt(card.querySelector('.ally-sanidade-max').value) || 1;

    // Badge de status baseado em HP %
    const pctPvStatus = pvAtual / Math.max(1, pvMax);
    let badge = card.querySelector('.ally-status-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'ally-status-badge';
        const header = card.querySelector('.ally-header');
        if (header) header.appendChild(badge);
    }
    if (pvAtual <= 0) {
        badge.textContent = 'MORTO'; badge.className = 'ally-status-badge status-dead';
    } else if (pctPvStatus <= 0.25) {
        badge.textContent = 'CRÍTICO'; badge.className = 'ally-status-badge status-critical';
    } else if (pctPvStatus <= 0.5) {
        badge.textContent = 'FERIDO'; badge.className = 'ally-status-badge status-wounded';
    } else {
        badge.textContent = 'VIVO'; badge.className = 'ally-status-badge status-alive';
    }

    const barPv = card.querySelector('.ally-bar-pv');
    const barPm = card.querySelector('.ally-bar-pm');
    const barSan = card.querySelector('.ally-bar-sanity');

    if (barPv) {
        const pctPv = Math.min(100, Math.max(0, (pvAtual / pvMax) * 100));
        barPv.style.width = pctPv + '%';

        const barOuter = barPv.closest('.ally-bar-outer');
        if (pctPv <= 35) barOuter.classList.add('critical-pulse');
        else barOuter.classList.remove('critical-pulse');
    }

    if (barPm) {
        const pctPm = Math.min(100, Math.max(0, (pmAtual / pmMax) * 100));
        barPm.style.width = pctPm + '%';

        const barOuter = barPm.closest('.ally-bar-outer');
        if (pctPm <= 35) barOuter.classList.add('mana-unstable');
        else barOuter.classList.remove('mana-unstable');
    }

    if (barSan) {
        const pctSan = Math.min(100, Math.max(0, (sanAtual / sanMax) * 100));
        barSan.style.width = pctSan + '%';

        const barOuter = barSan.closest('.ally-bar-outer');
        if (pctSan <= 35) barOuter.classList.add('sanity-unstable');
        else barOuter.classList.remove('sanity-unstable');
    }
}

function salvarStatusAliado(input) {
    const card = input.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};

    dados.nome = card.querySelector('.ally-name-input').value;
    dados.char_nome = dados.nome; // Mantém compatibilidade com o campo da ficha
    dados.cor_tema = card.querySelector('.ally-color-input').value;
    dados.pv_atual = parseInt(card.querySelector('.ally-pv-atual').value) || 0;
    dados.pv_max = parseInt(card.querySelector('.ally-pv-max').value) || 0;
    dados.pm_atual = parseInt(card.querySelector('.ally-pm-atual').value) || 0;
    dados.pm_max = parseInt(card.querySelector('.ally-pm-max').value) || 0;
    dados.sanidade_atual = parseInt(card.querySelector('.ally-sanidade-atual').value) || 0;
    dados.sanidade_max = parseInt(card.querySelector('.ally-sanidade-max').value) || 0;
    dados.defesa = parseInt(card.querySelector('.ally-defesa-input').value) || 0;
    dados.movimentacao = parseInt(card.querySelector('.ally-movimentacao-input').value) || 0;

    card.style.borderTopColor = dados.cor_tema;
    atualizarBarrasCard(card);
    localStorage.setItem(id, JSON.stringify(dados));
}

/** Abre o modal de visualização de ataques do aliado */
window.abrirModalAtaquesAliado = function (btn) {
    const card = btn.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};

    let modal = document.getElementById('modal-ally-attacks');
    if (!modal) {
        const html = `
            <div id="modal-ally-attacks" class="modal-overlay" style="display: none; z-index: 3000;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 id="modal-ally-attacks-title" class="modal-title">Ataques</h3>
                        <button type="button" class="btn-remove-class" onclick="document.getElementById('modal-ally-attacks').style.display='none'">×</button>
                    </div>
                    <div class="modal-body" id="ally-attacks-container" style="max-height: 500px; overflow-y: auto;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('modal-ally-attacks');
    }

    document.getElementById('modal-ally-attacks-title').innerText = `Ataques: ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-attacks-container');
    container.innerHTML = '';

    // Filtra os ataques nos dados do aliado (padrão atk_nome_IDX)
    const ataques = Object.keys(dados)
        .filter(k => k.startsWith('atk_nome_'))
        .map(key => {
            const index = key.replace('atk_nome_', '');
            return {
                index: index,
                nome: dados[key],
                dano: dados[`atk_dano_${index}`] || '0',
                teste: dados[`atk_teste_${index}`] || '0',
                critico: dados[`atk_critico_${index}`] || 'x2',
                alcance: dados[`atk_alcance_${index}`] || '-',
                especial: dados[`atk_especial_${index}`] || ''
            };
        });

    if (ataques.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum ataque configurado para este aliado.</p>';
    } else {
        container.innerHTML = ataques.map(a => `
            <div class="ally-attack-item">
                <div class="atk-header-row">
                    <strong class="atk-title">${a.nome}</strong>
                    <div class="atk-actions">
                        <span class="atk-bonus">Teste: ${a.teste}</span>
                        <button class="btn-use-atk" onclick="window.usarAtaqueAliado('${id}', '${a.index}')">Atacar</button>
                    </div>
                </div>
                <div class="atk-stats-row">
                    <span>Dano: <strong>${a.dano}</strong></span>
                    <span>Crítico: ${a.critico}</span>
                    <span>Alcance: ${a.alcance}</span>
                </div>
                ${a.especial ? `<p class="atk-special-desc">${a.especial}</p>` : ''}
            </div>
        `).join('');
    }

    modal.style.display = 'flex';
}

/** 
 * Registra o uso de um ataque do aliado no log de combate.
 */
window.usarAtaqueAliado = function (id, index) {
    const dados = JSON.parse(localStorage.getItem(id)) || {};
    const nomeAtk = dados[`atk_nome_${index}`];
    const dano = dados[`atk_dano_${index}`] || '0';

    if (typeof window.registrarLogAliado === 'function') {
        window.registrarLogAliado(dados.nome || 'Aliado', `atacou com ${nomeAtk}`, `(Dano: ${dano})`, "#ff4444");
    }

    if (typeof showNotification === 'function') {
        showNotification(`${dados.nome || 'Aliado'} atacou com ${nomeAtk}!`, "success");
    }
};

/** Abre o modal de visualização de magias do aliado */
window.abrirModalMagiasAliado = function (btn) {
    const card = btn.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};

    let modal = document.getElementById('modal-ally-spells');
    if (!modal) {
        const html = `
            <div id="modal-ally-spells" class="modal-overlay" style="display: none; z-index: 3000;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 id="modal-ally-spells-title" class="modal-title">Magias</h3>
                        <button type="button" class="btn-remove-class" onclick="document.getElementById('modal-ally-spells').style.display='none'">×</button>
                    </div>
                    <div class="modal-body" id="ally-spells-container" style="max-height: 500px; overflow-y: auto;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('modal-ally-spells');
    }

    document.getElementById('modal-ally-spells-title').innerText = `Magias: ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-spells-container');
    container.innerHTML = '';

    // Filtra as magias nos dados do aliado (padrão mag_nome_IDX)
    const magias = Object.keys(dados)
        .filter(k => k.startsWith('mag_nome_'))
        .map(key => {
            const index = key.replace('mag_nome_', '');
            return {
                index: index,
                nome: dados[key],
                custo: dados[`mag_custo_${index}`] || '0',
                tipoCusto: dados[`mag_tipo_custo_${index}`] || 'PM',
                circulo: dados[`mag_circulo_${index}`] || '1º',
                tempo: dados[`mag_tempo_${index}`] || 'Padrão',
                alcance: dados[`mag_alcance_${index}`] || '-',
                descricao: dados[`mag_descricao_${index}`] || ''
            };
        });

    if (magias.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhuma magia configurada para este aliado.</p>';
    } else {
        container.innerHTML = magias.map(m => `
            <div class="ally-spell-item">
                <div class="spell-header-row">
                    <strong class="spell-title">${m.nome}</strong>
                    <div class="spell-actions">
                        <span class="spell-cost">${m.custo} ${m.tipoCusto}</span>
                        <button class="btn-use-spell" onclick="window.usarMagiaAliado('${id}', '${m.index}')">Usar</button>
                    </div>
                </div>
                <div class="spell-stats-row">
                    <span>Círculo: ${m.circulo}</span>
                    <span>Tempo: ${m.tempo}</span>
                    <span>Alcance: ${m.alcance}</span>
                </div>
                ${m.descricao ? `<p class="spell-desc">${m.descricao}</p>` : ''}
            </div>
        `).join('');
    }

    modal.style.display = 'flex';
}

/** 
 * Executa a magia do aliado e consome os recursos automaticamente.
 * Garante que os valores sejam numéricos e a UI seja sincronizada.
 */
window.usarMagiaAliado = function (id, index) {
    const dados = JSON.parse(localStorage.getItem(id)) || {};
    const nomeMagia = dados[`mag_nome_${index}`];
    const custo = parseInt(dados[`mag_custo_${index}`]) || 0;
    const tipoCusto = dados[`mag_tipo_custo_${index}`] || "PM";

    // Conversão de segurança para garantir que temos números
    let pvAtual = parseInt(dados.pv_atual) || 0;
    let pmAtual = parseInt(dados.pm_atual) || 0;

    if (tipoCusto === "PM") {
        if (pmAtual < custo) {
            if (typeof showNotification === 'function') showNotification("Mana insuficiente!", "error");
            return;
        }
        pmAtual -= custo;
        dados.pm_atual = pmAtual;
    } else {
        if (pvAtual < custo) {
            if (typeof showNotification === 'function') showNotification("Vida insuficiente!", "error");
            return;
        }
        pvAtual -= custo;
        dados.pv_atual = pvAtual;
    }

    localStorage.setItem(id, JSON.stringify(dados));

    const card = document.querySelector(`.ally-card[data-id="${id}"]`);
    if (card) {
        const pvInput = card.querySelector('.ally-pv-atual');
        const pmInput = card.querySelector('.ally-pm-atual');
        if (pvInput) pvInput.value = pvAtual;
        if (pmInput) pmInput.value = pmAtual;
        if (typeof atualizarBarrasCard === 'function') atualizarBarrasCard(card);
    }

    const btnRefresh = card?.querySelector('.btn-export-ally[title="Ver Magias"]');
    if (btnRefresh) window.abrirModalMagiasAliado(btnRefresh);

    // Registra no log de combate
    if (typeof window.registrarLogAliado === 'function') {
        window.registrarLogAliado(dados.nome || 'Aliado', `usou ${nomeMagia}`, `(-${custo} ${tipoCusto})`, "#a855f7");
    }

    if (typeof showNotification === 'function') {
        showNotification(`${dados.nome || 'Aliado'} usou ${nomeMagia}! (-${custo} ${tipoCusto})`, "success");
    }
};

const LOG_ALIADOS_KEY = "ficha_rpg_aliados_log";

/**
 * Registra uma entrada no log de combate dos aliados.
 * O container é criado dinamicamente caso não exista no HTML.
 */
window.registrarLogAliado = function (nome, acao, detalhe, cor = "var(--primary-color)") {
    let logContainer = document.getElementById('aliados-log-container');

    if (!logContainer) {
        const modal = document.createElement('div');
        modal.id = 'modal-aliados-log';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: var(--primary-color)">Log de Combate</h3>
                    <button type="button" class="btn-remove-class" onclick="document.getElementById('modal-aliados-log').style.display='none'">×</button>
                </div>
                <div class="modal-body" id="aliados-log-container" style="max-height: 400px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 5px;">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-save-modal" style="background: transparent; border: 1px dashed var(--primary-color); color: var(--primary-color); width: 100%" onclick="window.limparLogAliados()">Limpar Log</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        logContainer = document.getElementById('aliados-log-container');

        // Carrega logs salvos ao criar o container para garantir persistência após F5
        const logsSalvos = JSON.parse(localStorage.getItem(LOG_ALIADOS_KEY)) || [];
        logContainer.innerHTML = logsSalvos.map(h => `
            <div class="ally-log-entry">
                <span class="log-time">[${h.hora}]</span>
                <strong style="color: ${h.cor}">${h.nome}</strong> 
                <span>${h.acao}</span> 
                <small>${h.detalhe}</small>
            </div>
        `).join('');
    }

    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

    const logData = { hora, nome, acao, detalhe, cor };

    // Salva no LocalStorage mantendo o limite de 50 mensagens
    let logs = JSON.parse(localStorage.getItem(LOG_ALIADOS_KEY)) || [];
    logs.unshift(logData);
    if (logs.length > 50) logs.pop();
    localStorage.setItem(LOG_ALIADOS_KEY, JSON.stringify(logs));

    const entrada = document.createElement('div');
    entrada.className = 'ally-log-entry';
    entrada.innerHTML = `
        <span class="log-time">[${hora}]</span>
        <strong style="color: ${cor}">${nome}</strong> 
        <span>${acao}</span> 
        <small>${detalhe}</small>
    `;

    logContainer.prepend(entrada);

    if (logContainer.children.length > 50) {
        logContainer.lastElementChild.remove();
    }
};

/** Limpa o log no DOM e no LocalStorage */
window.limparLogAliados = function () {
    const logContainer = document.getElementById('aliados-log-container');
    if (logContainer) logContainer.innerHTML = '';
    localStorage.removeItem(LOG_ALIADOS_KEY);
};

/**
 * Garante a exibição do log de combate, mesmo que nenhuma ação tenha sido tomada ainda.
 */
window.mostrarLogAliados = function () {
    let modal = document.getElementById('modal-aliados-log');
    if (!modal) {
        // Se não houver logs salvos, inicializa com uma mensagem, caso contrário carrega o histórico
        const logsSalvos = JSON.parse(localStorage.getItem(LOG_ALIADOS_KEY)) || [];
        if (logsSalvos.length === 0) {
            window.registrarLogAliado("Sistema", "Log de combate inicializado.", "", "var(--text-muted)");
        } else {
            window.registrarLogAliado("Sistema", "Histórico recuperado.", "", "var(--text-muted)");
        }
        modal = document.getElementById('modal-aliados-log');
    }

    if (modal) modal.style.display = 'flex';
};

let currentAllyBuffId = null;

/** Abre o modal de definição de buffs que o aliado dá ao dono */
window.abrirModalBuffsAliado = function (btn) {
    const card = btn.closest('.ally-card');
    currentAllyBuffId = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(currentAllyBuffId)) || {};

    document.getElementById('modal-ally-buffs-title').innerText = `Buffs: ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-buffs-container');
    container.innerHTML = '';

    const buffs = dados.buffs_dono || [];
    buffs.forEach(b => adicionarLinhaBuffAliado(b));

    document.getElementById('modal-ally-buffs').style.display = 'flex';
}

/** Adiciona uma linha de modificador no modal */
window.adicionarLinhaBuffAliado = function (data = { attr: 'nenhum', mod: 0, isAdv: false }) {
    const container = document.getElementById('ally-buffs-container');
    const div = document.createElement('div');
    div.className = 'buff-row';

    // Identifica a categoria inicial baseada nos dados salvos
    let cat = data.isAdv ? 'vantagem' : 'ficha';
    if (!data.isAdv && data.attr !== 'nenhum') {
        if (window.OPTIONS_CATEGORIZADAS.pericia.some(o => o.v === data.attr)) cat = 'pericia';
        else if (window.OPTIONS_CATEGORIZADAS.arma && window.OPTIONS_CATEGORIZADAS.arma.some(o => o.v === data.attr)) cat = 'arma';
    }

    div.innerHTML = `
        <select class="buff-cat header-input">
            <option value="ficha" ${cat === 'ficha' ? 'selected' : ''}>Ficha</option>
            <option value="pericia" ${cat === 'pericia' ? 'selected' : ''}>Perícia</option>
            <option value="arma" ${cat === 'arma' ? 'selected' : ''}>Arma</option>
            <option value="vantagem" ${cat === 'vantagem' ? 'selected' : ''}>Vantagem</option>
        </select>
        <select class="buff-attr header-input"></select>
        <input type="number" class="buff-mod header-input" value="${data.mod}" title="Valor">
        <button type="button" class="btn-remove-class" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);

    const selectCat = div.querySelector('.buff-cat');
    const selectAttr = div.querySelector('.buff-attr');

    const updateOptions = (currentVal = "nenhum") => {
        const options = window.OPTIONS_CATEGORIZADAS[selectCat.value] || [];
        selectAttr.innerHTML = options.map(o => `<option value="${o.v}" ${o.v === currentVal ? 'selected' : ''}>${o.t}</option>`).join('');
    };

    selectCat.onchange = () => updateOptions();
    updateOptions(data.attr);
}

/** Salva a lista de buffs no banco de dados do aliado */
window.salvarBuffsAliado = function () {
    if (!currentAllyBuffId) return;
    const container = document.getElementById('ally-buffs-container');
    const rows = container.querySelectorAll('.buff-row');
    const buffs = [];

    rows.forEach(row => {
        const cat = row.querySelector('.buff-cat').value;
        const attr = row.querySelector('.buff-attr').value;
        const mod = parseInt(row.querySelector('.buff-mod').value) || 0;

        if (attr !== 'nenhum') buffs.push({ attr, mod, isAdv: cat === 'vantagem' });
    });

    const dados = JSON.parse(localStorage.getItem(currentAllyBuffId)) || {};
    dados.buffs_dono = buffs;
    localStorage.setItem(currentAllyBuffId, JSON.stringify(dados));

    document.getElementById('modal-ally-buffs').style.display = 'none';
    showNotification("Buffs do aliado salvos!", "success");

    // Dispara o evento de storage manualmente para atualizar a ficha principal na hora
    const lista = getListaAliados();
    localStorage.setItem(ALIADOS_KEY, JSON.stringify(lista));

    // Se estivermos na página de aliados, mas a ficha estiver aberta em outra aba, 
    // o motor global de lá vai sentir a mudança. 
    // Se o global.js estiver nesta página, rodamos:
    if (typeof atualizarTudo === 'function') atualizarTudo();
}

function triggerAllyImageInput(container) {
    const card = container.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};

    if (dados.foto && typeof abrirModalGerenciarImagem === 'function') {
        abrirModalGerenciarImagem(id);
    } else {
        container.querySelector('.ally-image-input').click();
    }
}

function salvarImagemAliado(input) {
    const card = input.closest('.ally-card');
    const id = card.dataset.id;
    const file = input.files[0];
    if (!file) return;

    // Verifica se o arquivo é muito grande (opcional, localStorage tem limite de ~5MB)
    if (file.size > 1024 * 1024) { // 1MB limit
        showNotification("A imagem é muito pesada! Tente uma menor que 1MB.", "warning");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        const dados = JSON.parse(localStorage.getItem(id)) || {};
        dados.foto = base64;
        // Reseta ajustes
        dados.foto_zoom = 1;
        dados.foto_x = 50;
        dados.foto_y = 50;

        localStorage.setItem(id, JSON.stringify(dados));

        const avatarImg = card.querySelector('.ally-avatar-img');
        avatarImg.src = base64;
        if (typeof aplicarEstilosAvatar === 'function') aplicarEstilosAvatar(avatarImg, dados);

        showNotification("Foto do aliado atualizada!", "success");
    };
    reader.readAsDataURL(file);
}

function removerAliado(btn) {
    showConfirm("Tem certeza que deseja remover este aliado? Todos os dados da ficha dele serão apagados.", () => {
        const card = btn.closest('.ally-card');
        const id = card.dataset.id;

        let lista = getListaAliados();
        lista = lista.filter(item => item !== id);

        localStorage.setItem(ALIADOS_KEY, JSON.stringify(lista));
        localStorage.removeItem(id); // Apaga a ficha do aliado

        card.remove();
        if (lista.length === 0) renderizarAliados();
        showNotification("Aliado removido.", "info");
    });
}

function abrirFichaAliado(btn) {
    const id = btn.closest('.ally-card').dataset.id;
    // O ID já vem com "ally_", o global.js espera apenas a parte após o prefixo se usarmos params
    const cleanId = id.replace('ally_', '');
    window.location.href = `ficha.html?allyId=${cleanId}`;
}

function exportarFichaAliado(btn) {
    const id = btn.closest('.ally-card').dataset.id;
    const dados = localStorage.getItem(id);
    if (!dados) return;

    const blob = new Blob([dados], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aliado_${JSON.parse(dados).nome || 'sem_nome'}.json`;
    a.click();
}

function importarFichaComoAliado(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importado = JSON.parse(e.target.result);
            const dadosAliado = importado.dados || importado;

            const id = "ally_" + Date.now();
            const lista = getListaAliados();
            lista.push(id);

            localStorage.setItem(ALIADOS_KEY, JSON.stringify(lista));
            localStorage.setItem(id, JSON.stringify(dadosAliado));

            renderizarAliados();
            showNotification("Ficha importada como novo aliado!", "success");
        } catch (err) {
            showNotification("Erro ao importar: Arquivo inválido.", "error");
        }
    };
    reader.readAsText(file);
}