const STORAGE_KEY = "ficha_rpg_dados";
const HISTORY_KEY = "ficha_rpg_historico";
const BACKUP_KEY = "ficha_rpg_backup";

/**
 * Core Engine - Sincroniza dados e dispara atualizações de UI se existirem na página
 */
function atualizarTudo() {
    let dados = {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            dados = JSON.parse(raw) || {};
        } catch (e) {
            console.error("ALERTA CRÍTICO: Banco de dados corrompido. Salvamento abortado para evitar perda de dados.", e);
            return;
        }
    }

    // Obtém racaKey cedo para uso em múltiplas funções
    const racaEl = document.getElementById("raca");
    const racaKey = (racaEl && racaEl.value) ? racaEl.value : (dados.raca || "nenhuma"); // Fallback para dados salvos se o elemento estiver vazio

    // 1. Calcula Nível Total (Baseado nas classes salvas ou na tela)
    const nivelTotal = calcularNivelTotalEngine(dados);

    // 2. Coleta dados de todos os inputs marcados para salvamento
    const inputsParaSalvar = document.querySelectorAll(".save-input");
    inputsParaSalvar.forEach(input => {
        const val = input.type === "checkbox" ? input.checked : input.value;
        dados[input.id] = val;
    });

    // 3. Resolve Nível e Atributos (Shared)
    dados.nivel = nivelTotal;
    if (document.getElementById("nivel")) document.getElementById("nivel").value = nivelTotal;

    const bonusItens = calcularBonusItens(dados);
    const infoAttr = engineCalcularAtributos(dados, bonusItens, racaKey);

    // Calcular status de Mana para Habilidades e Poderes
    const pmAtual = parseInt(dados.pm_atual) || 0;
    const pvAtual = parseInt(dados.pv_atual) || 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const id = row.dataset.index;
        let prefix = '';
        if (row.closest('#habilidades-container')) prefix = 'hab_';
        else if (row.closest('#poderes-container')) prefix = 'poder_';
        else if (row.closest('#magias-container')) prefix = 'mag_';

        if (prefix) {
            const custoStr = dados[`${prefix}custo_${id}`];
            const tipoCusto = dados[`${prefix}tipo_custo_${id}`];
            const custo = parseInt(custoStr);
            let isOk = true; // Assume que está ok por padrão

            if (!isNaN(custo) && custo > 0) {
                if (tipoCusto === "PM") {
                    isOk = (pmAtual >= custo);
                } else if (tipoCusto === "PV") {
                    isOk = (pvAtual >= custo);
                }
            }

            // Salva o status de "ok" para o recurso específico (PM ou PV)
            dados[`${prefix}recurso_ok_${id}`] = isOk;

            // Atualiza as cores em tempo real no DOM
            row.classList.remove('mana-ok', 'mana-insufficient');
            if (isOk) row.classList.add('mana-ok');
            else row.classList.add('mana-insufficient');
        }
    });

    // Mescla bônus de perícias da raça nos bônus de itens para o cálculo das perícias
    const racaData = (typeof RACAS_DATA !== 'undefined') ? RACAS_DATA[racaKey] : null;
    if (racaData && racaData.skillBonus) {
        Object.keys(racaData.skillBonus).forEach(sk => {
            const slug = sk.toLowerCase().replace(/\s/g, '_');
            bonusItens[slug] = (bonusItens[slug] || 0) + racaData.skillBonus[sk];
        });
    }

    // 4. Dispara hooks de UI específicos da página (se definidos)
    aplicarPericiasPorClasseEngine(dados);
    if (typeof atualizarDefesa === 'function') atualizarDefesa(infoAttr.mods, dados, bonusItens);
    if (typeof atualizarVida === 'function') atualizarVida(infoAttr.mods, dados, bonusItens);
    if (typeof atualizarMana === 'function') atualizarMana(infoAttr.mods, dados, bonusItens);
    if (typeof atualizarMovimento === 'function') atualizarMovimento(infoAttr.mods, dados, bonusItens);
    if (typeof verificarStatusInicial === 'function') verificarStatusInicial(infoAttr.mods);
    atualizarBarras(bonusItens);
    if (typeof verificarVisibilidadeClasses === 'function') verificarVisibilidadeClasses();
    if (typeof verificarAtributoVampiro === 'function') verificarAtributoVampiro(infoAttr, dados);
    if (typeof verificarAvisoAnimalia === 'function') verificarAvisoAnimalia(dados);
    if (typeof verificarExtraFada === 'function') verificarExtraFada(dados);
    if (typeof verificarExtraHibrido === 'function') verificarExtraHibrido(dados); // Movemos híbrido para cima
    if (typeof verificarExtraVampiro === 'function') verificarExtraVampiro(dados); // Nova chamada para verificar campos de Vampiro
    if (typeof verificarExtraEspirito === 'function') verificarExtraEspirito(dados); // Nova chamada para verificar campos de Espírito
    if (typeof verificarExtraMortoVivo === 'function') verificarExtraMortoVivo(dados); // Nova chamada para verificar campos de Morto-Vivo
    if (typeof atualizarPericias === 'function') atualizarPericias(nivelTotal, infoAttr.mods, bonusItens);
    if (typeof atualizarAtaques === 'function') atualizarAtaques(nivelTotal, infoAttr.mods, bonusItens);
    if (typeof atualizarRacaUI === 'function') atualizarRacaUI(racaKey); // Nova chamada para atualizar campos de raça
    if (typeof atualizarCarga === 'function') atualizarCarga(infoAttr, dados);
    aplicarBonusVisuais(bonusItens);

    // 5. Persistência
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

/**
 * Helper para obter lista de classes ativa (da tela ou do objeto de dados)
 */
function getClassesAtivas(dados) {
    const classes = [];
    const container = document.getElementById('classes-container');

    if (container) {
        container.querySelectorAll('.class-row').forEach(row => {
            const name = row.querySelector('[id^="class_name_"]')?.value;
            const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
            const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
            if (name) classes.push({ name, lvl, sub });
        });
    } else {
        Object.keys(dados).forEach(key => {
            if (key.startsWith('class_name_')) {
                const id = key.split('_').pop();
                classes.push({ name: dados[key], lvl: parseInt(dados[`class_lvl_${id}`]) || 0 });
            }
        });
    }
    return classes;
}

/**
 * Soma todos os bônus de itens marcados como 'equipado' no inventário
 */
function calcularBonusItens(dados) {
    const totais = {};

    // Aplica bônus de reflexos do Morcego se ativo
    if (dados.vampiro_forma_morcego) {
        totais['reflexos'] = (totais['reflexos'] || 0) + 6;
    }

    Object.keys(dados).forEach(key => {
        if (key.startsWith('inv_eqp_') && dados[key] === true) {
            const id = key.replace('inv_eqp_', '');

            // 1. Bônus por atributo manual (Modificador)
            const attr = dados[`inv_attr_${id}`];
            const val = parseInt(dados[`inv_mod_${id}`]) || 0;
            if (attr && attr !== 'nenhum') totais[attr] = (totais[attr] || 0) + val;

            // 2. Bônus automático de Defesa para Armaduras equipadas
            const categoria = dados[`inv_cat_${id}`];
            if (categoria === 'armaduras') {
                const defBonus = parseInt(dados[`inv_defesa_bonus_${id}`]) || 0;
                const defPenalty = parseInt(dados[`inv_defesa_penalidade_${id}`]) || 0;
                totais['defesa'] = (totais['defesa'] || 0) + defBonus - defPenalty;
            }

            // 3. Bônus de materiais (Centro e Base) para Armas equipadas
            if (categoria === 'armas') {
                ['cabo', 'base'].forEach(field => {
                    const raw = dados[`inv_${field}_${id}`];
                    if (raw && typeof raw === 'string' && raw.startsWith('{')) {
                        try {
                            const material = JSON.parse(raw);
                            let attrs = material.attributes || [];
                            if (material.attr && material.attr !== 'nenhum') {
                                attrs.push({ attr: material.attr, mod: material.mod });
                            }
                            attrs.forEach(a => {
                                if (a.attr && a.attr !== 'nenhum') {
                                    totais[a.attr] = (totais[a.attr] || 0) + (parseInt(a.mod) || 0);
                                }
                            });
                        } catch (e) { console.error(`Erro no material ${field} do item ${id}`); }
                    }
                });
            }

            // 4. Bônus de Modificações do Item (Simples/Marciais)
            const modsRaw = dados[`inv_mods_item_${id}`];
            if (modsRaw && typeof modsRaw === 'string' && modsRaw.startsWith('{')) {
                try {
                    const modsData = JSON.parse(modsRaw);
                    if (modsData.attributes && Array.isArray(modsData.attributes)) {
                        modsData.attributes.forEach(a => {
                            if (a.attr && a.attr !== 'nenhum') {
                                totais[a.attr] = (totais[a.attr] || 0) + (parseInt(a.mod) || 0);
                            }
                        });
                    }
                } catch (e) { console.error(`Erro nas modificações do item ${id}`); }
            }
        }
    });
    return totais;
}

/**
 * Aplica bônus de itens em campos simples que não são atributos (ex: Movimentação)
 */
function aplicarBonusVisuais(bonusItens) {
    const campos = ['movimentacao', 'defesa', 'sanidade', 'status_info'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const bonus = bonusItens[id] || 0;

            if (bonus > 0) el.style.color = '#4ade80'; // Verde para bônus
            else if (bonus < 0) el.style.color = '#ff5f5f'; // Vermelho para penalidade
            else el.style.color = (id === 'defesa') ? 'white' : 'white';

            el.title = bonus !== 0 ? `Bônus de Item: ${bonus >= 0 ? '+' : ''}${bonus}` : '';
        }
    });
}

/**
 * Atualiza visualmente as larguras das barras de status (PV/PM)
 */
function atualizarBarras(bonusItens = {}) {
    const stats = [
        { atual: 'pv_atual', max: 'pv_max', bar: 'bar-pv' },
        { atual: 'pm_atual', max: 'pm_max', bar: 'bar-pm' },
    ];

    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    stats.forEach(s => {
        const elAtual = document.getElementById(s.atual);
        const elMax = document.getElementById(s.max);

        // Se os elementos não existem na página (ex: no Inventário), busca no localStorage
        const current = elAtual ? (parseInt(elAtual.value) || 0) : (parseInt(dados[s.atual]) || 0);
        let maxTotal = elMax ? (parseInt(elMax.value) || 1) : (parseInt(dados[s.max]) || 1);

        // Se estamos em uma página sem os inputs (como Inventário), 
        // precisamos garantir que o bônus de item seja somado ao valor base salvo
        if (!elMax && bonusItens[s.max]) {
            maxTotal += bonusItens[s.max];
        }

        const barEl = document.getElementById(s.bar);

        if (barEl) {
            const porcentagem = Math.min(100, Math.max(0, (current / maxTotal) * 100));
            barEl.style.width = porcentagem + "%";
        }

        // Lógica para barras temporárias
        const elTemp = document.getElementById(`${s.atual.replace('_atual', '_temp')}`);
        const temp = elTemp ? (parseInt(elTemp.value) || 0) : (parseInt(dados[`${s.atual.replace('_atual', '_temp')}`]) || 0);
        const tempBarEl = document.getElementById(`${s.bar}-temp`);
        const tempBarControlsEl = tempBarEl ? tempBarEl.closest('.temp-bar-controls') : null;

        if (tempBarEl && tempBarControlsEl) {
            const tempPorcentagem = Math.min(100, Math.max(0, (temp / maxTotal) * 100));
            tempBarEl.style.width = tempPorcentagem + "%";
        }
    });
}

/**
 * Motor de cálculo de Nível Total
 */
function calcularNivelTotalEngine(dados) {
    const classes = getClassesAtivas(dados);
    let soma = 0;
    classes.forEach(c => {
        let lvl = c.lvl;
        if (c.name !== 'ceifeiro_almas' && lvl > 20) lvl = 20;
        soma += lvl;
    });
    return soma || 1;
}

/**
 * Motor central de Atributos. Lê da tela ou do storage.
 */
function engineCalcularAtributos(dadosObj, bonusItens = {}, racaKey) {
    const cache = { mods: {}, totals: {} };
    const attrInputs = document.querySelectorAll(".attr-input");
    const attrs = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];

    // Coleta bônus de raça (suporta Híbrido)
    let bonusRaca = {};
    let modBonusRaca = {};

    const processarRaca = (key) => {
        const rd = (typeof RACAS_DATA !== 'undefined') ? RACAS_DATA[key] : null;
        if (rd) {
            if (rd.bonus) Object.keys(rd.bonus).forEach(a => bonusRaca[a] = (bonusRaca[a] || 0) + rd.bonus[a]);
            if (rd.modBonus) Object.keys(rd.modBonus).forEach(a => modBonusRaca[a] = (modBonusRaca[a] || 0) + rd.modBonus[a]);
        }
    };

    processarRaca(racaKey);
    if (racaKey === 'hibrido') {
        processarRaca(dadosObj.hibrido_raca_1);
        processarRaca(dadosObj.hibrido_raca_2);
    }

    // Ganhos de atributos por classe (se definido no futuro no banco de dados)
    const classes = getClassesAtivas(dadosObj);
    const bonusClasses = {};
    classes.forEach(c => {
        const data = (typeof CLASSES_DATA !== 'undefined') ? CLASSES_DATA[c.name] : null;
        if (data && data.attrBonus) {
            Object.keys(data.attrBonus).forEach(a => bonusClasses[a] = (bonusClasses[a] || 0) + data.attrBonus[a]);
        }
    });

    if (attrInputs.length > 0) {
        attrInputs.forEach(input => {
            const totalBonus = (bonusItens[input.id] || 0) + (bonusRaca[input.id] || 0) + (bonusClasses[input.id] || 0);
            const modBonus = (modBonusRaca[input.id] || 0);

            // Buscamos o valor BASE (pontos investidos) salvo no localStorage
            let base = parseInt(dadosObj[input.id]);
            if (isNaN(base)) base = 10;

            // Se o usuário está digitando neste campo agora, atualizamos a BASE
            if (input === document.activeElement) {
                let valorDigitado = parseInt(input.value) || 0;
                // Consideramos que o usuário está editando o TOTAL, então calculamos a base inversa
                base = valorDigitado - totalBonus;
            }

            const total = base + totalBonus;
            const baseMod = Math.floor((total - 10) / 2);
            const finalMod = baseMod + modBonus;

            const display = document.getElementById(`mod${input.id.charAt(0).toUpperCase() + input.id.slice(1)}`);
            if (display) {
                display.innerText = (finalMod >= 0 ? "+" : "") + finalMod;

                // Atualiza o valor do input para o TOTAL apenas se o usuário não estiver editando ele
                if (input !== document.activeElement) {
                    input.value = total;
                }

                // Destaque visual se o bônus de item estiver afetando este atributo
                const bonus = bonusItens[input.id] || 0;
                if (bonus > 0) display.style.color = '#4ade80';
                else if (bonus < 0) display.style.color = '#ff5f5f';
                else display.style.color = '#ff4444';

                // Adiciona um título explicativo ao passar o mouse
                input.title = `Total: ${total} (Base: ${base}${bonusRaca[input.id] ? ' | Raça: ' + (bonusRaca[input.id] > 0 ? '+' : '') + bonusRaca[input.id] : ''})`;
            }

            // Salvamos o valor BASE para não inflar o cálculo no próximo save
            dadosObj[input.id] = base;
            cache.mods[input.id] = finalMod;
            cache.totals[input.id] = total;
        });
    } else {
        attrs.forEach(id => {
            let base = parseInt(dadosObj[id]);
            if (isNaN(base)) base = 10;
            const totalBonus = (bonusItens[id] || 0) + (bonusRaca[id] || 0) + (bonusClasses[id] || 0);
            const total = base + totalBonus;
            const baseMod = Math.floor((total - 10) / 2);
            cache.mods[id] = baseMod + (modBonusRaca[id] || 0);
            cache.totals[id] = total;
        });
    }
    return cache;
}

/**
 * Motor de Perícias Automáticas
 */
function aplicarPericiasPorClasseEngine(dados) {
    const trainedSkills = new Set();
    const classes = getClassesAtivas(dados);
    const racaKey = document.getElementById("raca")?.value || dados.raca || "nenhuma";

    const racaData = (typeof RACAS_DATA !== 'undefined') ? RACAS_DATA[racaKey] : null;
    if (racaData && racaData.skills) racaData.skills.forEach(sk => trainedSkills.add(sk.toLowerCase().replace(/\s/g, '_')));

    // Lógica para Espírito
    const h1 = document.getElementById('hibrido_raca_1')?.value || dados.hibrido_raca_1;
    const h2 = document.getElementById('hibrido_raca_2')?.value || dados.hibrido_raca_2;
    const isEspirito = racaKey === "espirito" || (racaKey === "hibrido" && (h1 === "espirito" || h2 === "espirito"));

    if (isEspirito) {
        if (dados.espirito_poder === 'assustador') trainedSkills.add('intimidação');
        if (dados.espirito_poder === 'possessao') trainedSkills.add('oficio_possessao');
    }

    // Só aplica no DOM se estivermos na página de perícias
    const skillRows = document.querySelectorAll('.skill-row');
    if (skillRows.length > 0) {
        skillRows.forEach(row => {
            const skillSlug = row.querySelector(".skill-bonus")?.id.replace('skill_bonus_', '');
            if (!skillSlug || skillSlug.startsWith('oficio_')) return;

            const trainingSelect = row.querySelector(".skill-training-select");
            if (trainedSkills.has(skillSlug)) {
                if (trainingSelect.value === "nenhum") {
                    trainingSelect.value = "treinado";
                    trainingSelect.dataset.classTrained = "true";
                }
            } else if (trainingSelect.dataset.classTrained === "true") {
                trainingSelect.value = "nenhum";
                delete trainingSelect.dataset.classTrained;
            }
        });
    }
}

/**
 * Funções auxiliares de Atributos (Shared)
 */
function atualizarAtributos(dadosObj, bonusItens = {}) {
    const racaEl = document.getElementById("raca");
    const racaKey = racaEl ? racaEl.value : (dadosObj.raca || "nenhuma");
    return engineCalcularAtributos(dadosObj, bonusItens, racaKey);
}

function alterarValor(id, delta) {
    const input = document.getElementById(id);
    if (input) {
        const newValue = Math.max(0, (parseInt(input.value) || 0) + delta);
        input.value = newValue;
        // Dispara atualizarTudo() para recalcular e atualizar as cores de habilidades/poderes
        // e também para salvar o novo valor de PV/PM atual.
        atualizarTudo();
    }
}

function exportarFicha() {
    // 1. Força a atualização imediata com o que estiver na tela no momento
    atualizarTudo();

    const dadosFicha = localStorage.getItem(STORAGE_KEY);
    const historico = localStorage.getItem(HISTORY_KEY) || "[]";

    // 2. Criamos um pacote que contém absolutamente tudo o que existe no banco de dados
    const pacoteCompleto = {
        dados: JSON.parse(dadosFicha),
        historico: JSON.parse(historico),
        exportadoEm: new Date().toLocaleString('pt-BR'),
        versaoSistema: "2.1"
    };

    const blob = new Blob([JSON.stringify(pacoteCompleto, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const nomeChar = document.getElementById('nome')?.value.replace(/\s+/g, '_').toLowerCase() || 'personagem';
    a.href = url;
    a.download = `ficha_${nomeChar}.json`;
    a.click();

    showNotification("Ficha e Histórico exportados com sucesso!", "success");
}

function importarFicha(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importado = JSON.parse(e.target.result);

            // 3. Lógica inteligente para suportar o formato novo e o antigo
            if (importado.dados) {
                // Formato Novo (Objeto empacotado)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(importado.dados));
                if (importado.historico) {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(importado.historico));
                }
            } else {
                // Formato Antigo (Dados diretos)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(importado));
            }

            showNotification("Importação concluída! Sincronizando...", "success");
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            showNotification("Erro ao importar: Arquivo inválido.", "error");
        }
    };
    reader.readAsText(file);
}

let notificationTimeout;

/**
 * Exibe uma notificação estilizada na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'info'|'success'|'error'|'warning'} type - O tipo de notificação para estilização.
 * @param {number} duration - Duração em milissegundos antes da notificação desaparecer.
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notificationEl = document.getElementById('global-notification');
    if (!notificationEl) return;

    const iconEl = notificationEl.querySelector('.icon');
    const messageEl = notificationEl.querySelector('.message');

    notificationEl.className = ''; // Limpa classes anteriores
    notificationEl.classList.add(type, 'show');
    messageEl.textContent = message;
    iconEl.textContent = { 'success': '✔', 'error': '✖', 'warning': '⚠', 'info': 'ℹ' }[type] || 'ℹ';

    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => notificationEl.classList.remove('show'), duration);
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

// Carregamento Inicial Genérico
document.addEventListener('DOMContentLoaded', () => {
    try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (salvo) {
            Object.keys(salvo).forEach(key => {
                const el = document.getElementById(key);
                // Só preenche se o elemento existir e não for parte de listas dinâmicas (que a ficha.js cuida)
                if (el && !el.id.startsWith('class_')) {
                    if (el.type === "checkbox") el.checked = salvo[key];
                    else el.value = salvo[key];
                }
            });
        }
    } catch (e) {
        console.warn("Nenhum dado prévio encontrado ou erro no JSON.");
    }

    // Listener global para inputs de salvamento
    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('save-input')) {
            atualizarTudo();
        }
    });

    // Inicia o sistema de backup automático (a cada 10 minutos)
    setInterval(realizarBackupAutomatico, 10 * 60 * 1000);
});

/**
 * Gera um backup silencioso no LocalStorage para recuperação de emergência
 */
function realizarBackupAutomatico() {
    // 1. Sincroniza o que está na tela antes de copiar para o backup
    atualizarTudo();

    const dadosBase = localStorage.getItem(STORAGE_KEY);
    if (!dadosBase) return;

    const historicoBase = localStorage.getItem(HISTORY_KEY) || "[]";

    const pacoteBackup = {
        dados: JSON.parse(dadosBase),
        historico: JSON.parse(historicoBase),
        backupEm: new Date().toLocaleString('pt-BR'),
        tipo: "automatico"
    };

    localStorage.setItem(BACKUP_KEY, JSON.stringify(pacoteBackup));
    console.log(`[Sistema] Backup automático realizado com sucesso em: ${pacoteBackup.backupEm}`);
}

/**
 * Restaura a ficha a partir do backup automático salvo no LocalStorage
 */
function restaurarBackupFicha() {
    const backupRaw = localStorage.getItem(BACKUP_KEY);
    if (!backupRaw) {
        showNotification("Nenhum backup encontrado para restauração.", "warning");
        return;
    }

    if (!confirm("Deseja restaurar o backup automático? Isso substituirá os dados atuais da tela.")) return;

    try {
        const pacote = JSON.parse(backupRaw);
        if (pacote.dados) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pacote.dados));
            if (pacote.historico) localStorage.setItem(HISTORY_KEY, JSON.stringify(pacote.historico));

            showNotification(`Backup de ${pacote.backupEm} restaurado!`, "success");
            setTimeout(() => location.reload(), 1200);
        }
    } catch (e) {
        showNotification("Erro ao processar o arquivo de backup.", "error");
    }
}

/**
 * Reseta todos os atributos base para 10
 */
function resetarAtributos() {
    if (!confirm("Deseja resetar todos os valores base de atributos para 10?")) return;

    const attrs = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    attrs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = 10;
        dados[id] = 10;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    atualizarTudo();
}