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

function contarCamposAliado(dados, prefixo) {
    return Object.keys(dados).filter(key => key.startsWith(prefixo) && String(dados[key] || '').trim()).length;
}

function atualizarResumoAliados(lista = getListaAliados()) {
    let ativos = 0;
    let emRisco = 0;
    let habilidades = 0;

    lista.forEach(id => {
        const dados = JSON.parse(localStorage.getItem(id)) || {};
        const pvAtual = Number(dados.pv_atual) || 0;
        const pvMax = Math.max(1, Number(dados.pv_max) || 1);
        if (pvAtual > 0) ativos += 1;
        if (pvAtual > 0 && pvAtual / pvMax <= 0.5) emRisco += 1;
        habilidades += contarCamposAliado(dados, 'atk_nome_') + contarCamposAliado(dados, 'mag_nome_');
    });

    const values = {
        'aliados-summary-count': lista.length,
        'aliados-active-count': ativos,
        'aliados-critical-count': emRisco,
        'aliados-ability-count': habilidades
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    });
    const counter = document.getElementById('aliados-counter');
    if (counter) counter.textContent = `${lista.length} ${lista.length === 1 ? 'aliado' : 'aliados'}`;
}

function adicionarNovoAliado() {
    const id = "ally_" + Date.now();
    const lista = getListaAliados();
    lista.push(id);

    localStorage.setItem(ALIADOS_KEY, JSON.stringify(lista));

    // Inicializa a ficha do aliado com valores padrão
    const dadosIniciais = {
        nome: "Novo Aliado",
        tipo_aliado: "complexo",
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
        xp_max: 1000,
        pericias_personalizadas: []
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

    container.replaceChildren();

    if (lista.length === 0) {
        if (emptyState) emptyState.hidden = false;
        atualizarResumoAliados(lista);
        return;
    }
    if (emptyState) emptyState.hidden = true;

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
            const corOriginal = dados.cor_tema || "#ff4444";
            const tema = prepararCorTema(corOriginal);
            colorInput.value = tema.cor;
            card.style.setProperty('--ally-accent', tema.cor);
            card.style.setProperty('--ally-accent-on', tema.corOn);
            card.style.setProperty('--ally-accent-on-soft', tema.corOnSoft);
            if (dados.cor_tema !== tema.cor) {
                dados.cor_tema = tema.cor;
                localStorage.setItem(id, JSON.stringify(dados));
            }
        }

        const tipoSelect = card.querySelector('.ally-tipo-select');
        if (tipoSelect) {
            tipoSelect.value = dados.tipo_aliado === 'simples' ? 'simples' : 'complexo';
            card.classList.toggle('ally-card--simples', tipoSelect.value === 'simples');
        }
        renderizarPericiasPersonalizadasAliado(card, dados);

        card.querySelector('.ally-pv-atual').value = dados.pv_atual || 0;
        card.querySelector('.ally-pv-max').value = dados.pv_max || 0;
        card.querySelector('.ally-pm-atual').value = dados.pm_atual || 0;
        card.querySelector('.ally-pm-max').value = dados.pm_max || 0;
        card.querySelector('.ally-sanidade-atual').value = dados.sanidade_atual || 0;
        card.querySelector('.ally-sanidade-max').value = dados.sanidade_max || 0;
        card.querySelector('.ally-defesa-input').value = dados.defesa || 0;
        card.querySelector('.ally-movimentacao-input').value = dados.movimentacao || 0;

        const attackCount = contarCamposAliado(dados, 'atk_nome_');
        const spellCount = contarCamposAliado(dados, 'mag_nome_');
        const buffCount = Array.isArray(dados.buffs_dono) ? dados.buffs_dono.length : 0;
        const attackCountEl = card.querySelector('.ally-attack-count');
        const spellCountEl = card.querySelector('.ally-spell-count');
        const buffCountEl = card.querySelector('.ally-buff-count');
        if (attackCountEl) attackCountEl.textContent = String(attackCount);
        if (spellCountEl) spellCountEl.textContent = String(spellCount);
        if (buffCountEl) buffCountEl.textContent = String(buffCount);

        atualizarBarrasCard(card);
        container.appendChild(clone);
    });
    atualizarResumoAliados(lista);
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
        const header = card.querySelector('.ally-identity-meta') || card.querySelector('.ally-header');
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

    const colorInput = card.querySelector('.ally-color-input');
    const tema = prepararCorTema(colorInput.value);
    colorInput.value = tema.cor; // sincroniza o swatch caso a cor tenha sido clareada
    dados.cor_tema = tema.cor;

    dados.pv_atual = parseInt(card.querySelector('.ally-pv-atual').value) || 0;
    dados.pv_max = parseInt(card.querySelector('.ally-pv-max').value) || 0;
    dados.pm_atual = parseInt(card.querySelector('.ally-pm-atual').value) || 0;
    dados.pm_max = parseInt(card.querySelector('.ally-pm-max').value) || 0;
    dados.sanidade_atual = parseInt(card.querySelector('.ally-sanidade-atual').value) || 0;
    dados.sanidade_max = parseInt(card.querySelector('.ally-sanidade-max').value) || 0;
    dados.defesa = parseInt(card.querySelector('.ally-defesa-input').value) || 0;
    dados.movimentacao = parseInt(card.querySelector('.ally-movimentacao-input').value) || 0;

    card.style.setProperty('--ally-accent', tema.cor);
    card.style.setProperty('--ally-accent-on', tema.corOn);
    card.style.setProperty('--ally-accent-on-soft', tema.corOnSoft);
    atualizarBarrasCard(card);
    localStorage.setItem(id, JSON.stringify(dados));
    atualizarResumoAliados();
}

/**
 * Alterna entre um aliado "Complexo" (com ficha completa própria, ideal para
 * NPCs/aliados detalhados) e "Simples" (só stats rápidos + perícias
 * personalizadas, ideal para animais/invocações que só precisam de um teste
 * ou outro, tipo um cão que só ataca).
 */
function alternarTipoAliado(select) {
    const card = select.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};
    dados.tipo_aliado = select.value === 'simples' ? 'simples' : 'complexo';
    localStorage.setItem(id, JSON.stringify(dados));
    card.classList.toggle('ally-card--simples', dados.tipo_aliado === 'simples');
}

/** Renderiza os chips de perícias personalizadas de um aliado "Simples" */
function renderizarPericiasPersonalizadasAliado(card, dados) {
    const lista = card.querySelector('.ally-custom-skills-list');
    if (!lista) return;
    lista.replaceChildren();

    const pericias = Array.isArray(dados.pericias_personalizadas) ? dados.pericias_personalizadas : [];
    if (pericias.length === 0) {
        const vazio = document.createElement('span');
        vazio.className = 'ally-custom-skills-empty';
        vazio.textContent = 'Nenhuma perícia adicionada ainda.';
        lista.appendChild(vazio);
        return;
    }

    pericias.forEach((pericia, index) => {
        const chip = document.createElement('span');
        chip.className = 'ally-skill-chip';

        const nome = document.createElement('span');
        nome.className = 'ally-skill-chip-nome';
        nome.textContent = pericia.nome || 'Perícia';

        const valor = document.createElement('strong');
        const numero = Number.parseInt(pericia.valor, 10) || 0;
        valor.textContent = `${numero >= 0 ? '+' : ''}${numero}`;

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'btn-remove-ally-skill';
        remover.setAttribute('aria-label', `Remover perícia ${pericia.nome || ''}`);
        remover.textContent = '×';
        remover.onclick = () => removerPericiaAliado(remover, index);

        chip.append(nome, valor, remover);
        lista.appendChild(chip);
    });
}

/** Adiciona uma perícia personalizada ao aliado "Simples" */
function adicionarPericiaAliado(btn) {
    const card = btn.closest('.ally-card');
    const id = card.dataset.id;
    const nomeInput = card.querySelector('.ally-skill-name-input');
    const valorInput = card.querySelector('.ally-skill-value-input');
    const nome = nomeInput.value.trim();
    if (!nome) {
        nomeInput.focus();
        return;
    }
    const valor = Number.parseInt(valorInput.value, 10) || 0;

    const dados = JSON.parse(localStorage.getItem(id)) || {};
    const pericias = Array.isArray(dados.pericias_personalizadas) ? dados.pericias_personalizadas : [];
    pericias.push({ nome, valor });
    dados.pericias_personalizadas = pericias;
    localStorage.setItem(id, JSON.stringify(dados));

    nomeInput.value = '';
    valorInput.value = '';
    nomeInput.focus();
    renderizarPericiasPersonalizadasAliado(card, dados);
}

/** Remove uma perícia personalizada do aliado "Simples" pelo índice */
function removerPericiaAliado(btn, index) {
    const card = btn.closest('.ally-card');
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};
    const pericias = Array.isArray(dados.pericias_personalizadas) ? dados.pericias_personalizadas : [];
    pericias.splice(index, 1);
    dados.pericias_personalizadas = pericias;
    localStorage.setItem(id, JSON.stringify(dados));
    renderizarPericiasPersonalizadasAliado(card, dados);
}

function criarModalColecaoAliado({ modalId, titleId, containerId, title }) {
    let modal = document.getElementById(modalId);
    if (modal) return modal;

    modal = document.createElement('dialog');
    modal.id = modalId;
    modal.className = 'modal-overlay ally-collection-dialog';
    modal.setAttribute('aria-labelledby', titleId);

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '840px';
    content.style.width = 'min(94vw, 840px)';
    const header = document.createElement('div');
    header.className = 'modal-header';
    const heading = document.createElement('h3');
    heading.id = titleId;
    heading.className = 'modal-title';
    heading.textContent = title;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-remove-class';
    close.setAttribute('aria-label', 'Fechar');
    close.textContent = '×';
    close.addEventListener('click', () => fecharDialogoAnimado(modal));
    header.append(heading, close);
    const body = document.createElement('div');
    body.id = containerId;
    body.className = 'modal-body ally-modal-list';
    content.append(header, body);
    modal.appendChild(content);
    document.body.appendChild(modal);
    return modal;
}

function criarMetaAliado(label, value) {
    const item = document.createElement('span');
    const caption = document.createElement('small');
    caption.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = String(value ?? '-');
    item.append(caption, strong);
    return item;
}

function preencherEstadoVazioAliado(container, message) {
    const empty = document.createElement('p');
    empty.className = 'ally-modal-empty';
    empty.textContent = message;
    container.replaceChildren(empty);
}

/** Abre o modal de visualização de ataques do aliado */
window.abrirModalAtaquesAliado = function (btn) {
    const card = btn.closest('.ally-card');
    if (!card) return;
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};
    const modal = criarModalColecaoAliado({
        modalId: 'modal-ally-attacks',
        titleId: 'modal-ally-attacks-title',
        containerId: 'ally-attacks-container',
        title: 'Ataques do aliado'
    });
    document.getElementById('modal-ally-attacks-title').textContent = `Ataques — ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-attacks-container');
    container.replaceChildren();

    const ataques = Object.keys(dados)
        .filter(key => key.startsWith('atk_nome_'))
        .map(key => {
            const index = key.replace('atk_nome_', '');
            return {
                index,
                nome: dados[key],
                dano: dados[`atk_dano_${index}`] || '0',
                teste: dados[`atk_teste_${index}`] || '0',
                critico: dados[`atk_critico_${index}`] || 'x2',
                alcance: dados[`atk_alcance_${index}`] || '-',
                especial: dados[`atk_especial_${index}`] || ''
            };
        });

    if (ataques.length === 0) {
        preencherEstadoVazioAliado(container, 'Nenhum ataque configurado para este aliado.');
    } else {
        ataques.forEach(attack => {
            const item = document.createElement('article');
            item.className = 'ally-attack-item ui-enter';
            const header = document.createElement('div');
            header.className = 'atk-header-row';
            const name = document.createElement('strong');
            name.className = 'atk-title';
            name.textContent = attack.nome || 'Ataque sem nome';
            const actions = document.createElement('div');
            actions.className = 'atk-actions';
            const test = document.createElement('span');
            test.className = 'atk-bonus';
            test.textContent = `Teste: ${attack.teste}`;
            const use = document.createElement('button');
            use.type = 'button';
            use.className = 'btn-use-atk';
            use.textContent = 'Atacar';
            use.addEventListener('click', () => window.usarAtaqueAliado(id, attack.index));
            actions.append(test, use);
            header.append(name, actions);
            const stats = document.createElement('div');
            stats.className = 'atk-stats-row';
            stats.append(
                criarMetaAliado('Dano', attack.dano),
                criarMetaAliado('Crítico', attack.critico),
                criarMetaAliado('Alcance', attack.alcance)
            );
            item.append(header, stats);
            if (attack.especial) {
                const special = document.createElement('p');
                special.className = 'atk-special-desc';
                special.textContent = attack.especial;
                item.appendChild(special);
            }
            container.appendChild(item);
        });
    }

    if (!modal.open) modal.showModal();
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
    if (!card) return;
    const id = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(id)) || {};

    const modal = criarModalColecaoAliado({
        modalId: 'modal-ally-spells',
        titleId: 'modal-ally-spells-title',
        containerId: 'ally-spells-container',
        title: 'Magias do aliado'
    });

    document.getElementById('modal-ally-spells-title').textContent = `Magias — ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-spells-container');
    container.replaceChildren();

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
        preencherEstadoVazioAliado(container, 'Nenhuma magia configurada para este aliado.');
    } else {
        magias.forEach(magia => {
            const item = document.createElement('article');
            item.className = 'ally-spell-item ui-enter';

            const header = document.createElement('div');
            header.className = 'spell-header-row';
            const name = document.createElement('strong');
            name.className = 'spell-title';
            name.textContent = magia.nome || 'Magia sem nome';
            const actions = document.createElement('div');
            actions.className = 'spell-actions';
            const cost = document.createElement('span');
            cost.className = 'spell-cost';
            cost.textContent = `${magia.custo} ${magia.tipoCusto}`;
            const use = document.createElement('button');
            use.type = 'button';
            use.className = 'btn-use-spell';
            use.textContent = 'Usar';
            use.addEventListener('click', () => window.usarMagiaAliado(id, magia.index));
            actions.append(cost, use);
            header.append(name, actions);

            const stats = document.createElement('div');
            stats.className = 'spell-stats-row';
            stats.append(
                criarMetaAliado('Círculo', magia.circulo),
                criarMetaAliado('Tempo', magia.tempo),
                criarMetaAliado('Alcance', magia.alcance)
            );
            item.append(header, stats);

            if (magia.descricao) {
                const description = document.createElement('p');
                description.className = 'spell-desc';
                description.textContent = magia.descricao;
                item.appendChild(description);
            }
            container.appendChild(item);
        });
    }

    if (!modal.open) modal.showModal();
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

function criarEntradaLogAliado(log) {
    const entry = document.createElement('article');
    entry.className = 'ally-log-entry ui-enter';

    const time = document.createElement('time');
    time.className = 'log-time';
    time.textContent = `[${log.hora || '--:--'}]`;

    const name = document.createElement('strong');
    name.textContent = log.nome || 'Aliado';
    const canUseColor = typeof log.cor === 'string'
        && typeof CSS !== 'undefined'
        && typeof CSS.supports === 'function'
        && CSS.supports('color', log.cor);
    name.style.color = canUseColor ? log.cor : 'var(--ui-page-accent)';

    const action = document.createElement('span');
    action.className = 'log-action';
    action.textContent = log.acao || '';

    entry.append(time, name, action);
    if (log.detalhe) {
        const detail = document.createElement('small');
        detail.textContent = log.detalhe;
        entry.appendChild(detail);
    }
    return entry;
}

function criarModalLogAliados(logsSalvos = []) {
    let modal = document.getElementById('modal-aliados-log');
    if (modal) return document.getElementById('aliados-log-container');

    modal = document.createElement('dialog');
    modal.id = 'modal-aliados-log';
    modal.className = 'modal-overlay ally-log-dialog';
    modal.setAttribute('aria-labelledby', 'modal-aliados-log-title');

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '760px';
    content.style.width = 'min(94vw, 760px)';

    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h3');
    title.id = 'modal-aliados-log-title';
    title.className = 'modal-title';
    title.textContent = 'Log de combate';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-remove-class';
    close.setAttribute('aria-label', 'Fechar log de combate');
    close.textContent = '×';
    close.addEventListener('click', () => fecharDialogoAnimado(modal));
    header.append(title, close);

    const logContainer = document.createElement('div');
    logContainer.id = 'aliados-log-container';
    logContainer.className = 'modal-body ally-log-list';
    logsSalvos.forEach(log => logContainer.appendChild(criarEntradaLogAliado(log)));

    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'btn-modal-secondary ally-log-clear';
    clear.textContent = 'Limpar log';
    clear.addEventListener('click', window.limparLogAliados);
    footer.appendChild(clear);

    content.append(header, logContainer, footer);
    modal.appendChild(content);
    document.body.appendChild(modal);
    return logContainer;
}

/**
 * Registra uma entrada no log de combate dos aliados.
 * O container é criado dinamicamente caso não exista no HTML.
 */
window.registrarLogAliado = function (nome, acao, detalhe, cor = "var(--primary-color)") {
    let logContainer = document.getElementById('aliados-log-container');

    if (!logContainer) {
        const logsSalvos = JSON.parse(localStorage.getItem(LOG_ALIADOS_KEY)) || [];
        logContainer = criarModalLogAliados(logsSalvos);
    }

    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

    const logData = { hora, nome, acao, detalhe, cor };

    // Salva no LocalStorage mantendo o limite de 50 mensagens
    let logs = JSON.parse(localStorage.getItem(LOG_ALIADOS_KEY)) || [];
    logs.unshift(logData);
    if (logs.length > 50) logs.pop();
    localStorage.setItem(LOG_ALIADOS_KEY, JSON.stringify(logs));

    const entrada = criarEntradaLogAliado(logData);

    logContainer.prepend(entrada);

    if (logContainer.children.length > 50) {
        logContainer.lastElementChild.remove();
    }
};

/** Limpa o log no DOM e no LocalStorage */
window.limparLogAliados = function () {
    const logContainer = document.getElementById('aliados-log-container');
    if (logContainer) logContainer.replaceChildren();
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

    if (modal) modal.showModal();
};

let currentAllyBuffId = null;

/** Abre o modal de definição de buffs que o aliado dá ao dono */
window.abrirModalBuffsAliado = function (btn) {
    const card = btn.closest('.ally-card');
    currentAllyBuffId = card.dataset.id;
    const dados = JSON.parse(localStorage.getItem(currentAllyBuffId)) || {};

    document.getElementById('modal-ally-buffs-title').innerText = `Buffs: ${dados.nome || 'Aliado'}`;
    const container = document.getElementById('ally-buffs-container');
    container.replaceChildren();

    const buffs = dados.buffs_dono || [];
    buffs.forEach(b => adicionarLinhaBuffAliado(b));

    const buffsModal = document.getElementById('modal-ally-buffs');
    if (buffsModal && !buffsModal.open) buffsModal.showModal();
}

/** Adiciona uma linha de modificador no modal */
window.adicionarLinhaBuffAliado = function (data = { attr: 'nenhum', mod: 0, isAdv: false }) {
    const container = document.getElementById('ally-buffs-container');
    if (!container) return;
    const normalized = data && typeof data === 'object'
        ? data
        : { attr: 'nenhum', mod: 0, isAdv: false };
    const categories = window.OPTIONS_CATEGORIZADAS || {};
    const skillOptions = Array.isArray(categories.pericia) ? categories.pericia : [];
    const weaponOptions = Array.isArray(categories.arma) ? categories.arma : [];
    const div = document.createElement('div');
    div.className = 'buff-row';

    // Identifica a categoria inicial baseada nos dados salvos
    let cat = normalized.isAdv ? 'vantagem' : 'ficha';
    if (!normalized.isAdv && normalized.attr !== 'nenhum') {
        if (skillOptions.some(option => option.v === normalized.attr)) cat = 'pericia';
        else if (weaponOptions.some(option => option.v === normalized.attr)) cat = 'arma';
    }

    const selectCat = document.createElement('select');
    selectCat.className = 'buff-cat header-input';
    selectCat.setAttribute('aria-label', 'Categoria do efeito');
    [
        ['ficha', 'Ficha'],
        ['pericia', 'Perícia'],
        ['arma', 'Arma'],
        ['vantagem', 'Vantagem']
    ].forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        selectCat.appendChild(option);
    });
    selectCat.value = cat;

    const selectAttr = document.createElement('select');
    selectAttr.className = 'buff-attr header-input';
    selectAttr.setAttribute('aria-label', 'Atributo afetado');

    const modifier = document.createElement('input');
    modifier.type = 'number';
    modifier.className = 'buff-mod header-input';
    modifier.value = String(Number.parseInt(normalized.mod, 10) || 0);
    modifier.title = 'Valor do modificador';
    modifier.setAttribute('aria-label', 'Valor do modificador');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-remove-class';
    remove.setAttribute('aria-label', 'Remover efeito');
    remove.textContent = '×';
    remove.addEventListener('click', () => div.remove());
    div.append(selectCat, selectAttr, modifier, remove);
    container.appendChild(div);

    const updateOptions = (currentVal = "nenhum") => {
        const options = Array.isArray(categories[selectCat.value]) ? categories[selectCat.value] : [];
        selectAttr.replaceChildren();
        options.forEach(item => {
            const option = document.createElement('option');
            option.value = String(item.v ?? 'nenhum');
            option.textContent = String(item.t ?? item.v ?? 'Sem nome');
            selectAttr.appendChild(option);
        });
        if (options.length === 0) {
            const option = document.createElement('option');
            option.value = 'nenhum';
            option.textContent = 'Nenhuma opção disponível';
            selectAttr.appendChild(option);
        }
        selectAttr.value = String(currentVal ?? 'nenhum');
        if (selectAttr.selectedIndex < 0) selectAttr.selectedIndex = 0;
    };

    selectCat.onchange = () => updateOptions();
    updateOptions(normalized.attr);
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
    const ownerCard = Array.from(document.querySelectorAll('.ally-card'))
        .find(card => card.dataset.id === currentAllyBuffId);
    const buffCount = ownerCard?.querySelector('.ally-buff-count');
    if (buffCount) buffCount.textContent = String(buffs.length);

    const buffsModalClose = document.getElementById('modal-ally-buffs');
    if (buffsModalClose && buffsModalClose.open) fecharDialogoAnimado(buffsModalClose);
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
