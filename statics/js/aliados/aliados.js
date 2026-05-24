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

    const barPv = card.querySelector('.ally-bar-pv');
    const barPm = card.querySelector('.ally-bar-pm');
    const barSan = card.querySelector('.ally-bar-sanity');

    if (barPv) {
        const pctPv = Math.min(100, Math.max(0, (pvAtual / pvMax) * 100));
        barPv.style.width = pctPv + '%';
        barPv.style.filter = pctPv < 25 ? 'brightness(1.5) drop-shadow(0 0 5px red)' : 'none';
    }

    if (barPm) {
        const pctPm = Math.min(100, Math.max(0, (pmAtual / pmMax) * 100));
        barPm.style.width = pctPm + '%';
    }

    if (barSan) {
        const pctSan = Math.min(100, Math.max(0, (sanAtual / sanMax) * 100));
        barSan.style.width = pctSan + '%';
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