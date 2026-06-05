// Detecta se estamos no contexto de um aliado via URL
const urlParams = new URLSearchParams(window.location.search);
window.allyId = urlParams.get('allyId');

// Chaves de Armazenamento Dinâmicas: Se houver allyId, usa uma chave isolada
window.STORAGE_KEY = window.allyId ? `ally_${window.allyId}` : "ficha_rpg_dados";
window.HISTORY_KEY = window.allyId ? `ally_hist_${window.allyId}` : "ficha_rpg_historico";

window.BACKUP_KEY = "ficha_rpg_backup";
window.THEME_KEY = "ficha_rpg_tema";
window.THEME_KEY_SECONDARY = "ficha_rpg_tema_secundaria";
window.DLCS_KEY = "ficha_rpg_dlcs";
window.ALIADOS_KEY = "ficha_rpg_aliados";
window.STORAGE_KEY_INVENTORY_ORDER = window.allyId ? `ally_inv_order_${window.allyId}` : "ficha_rpg_inventario_order";
window.STORAGE_KEY_HABILIDADES_ORDER = window.allyId ? `ally_hab_order_${window.allyId}` : "ficha_rpg_hab_order";
window.STORAGE_KEY_PODERES_ORDER = window.allyId ? `ally_pod_order_${window.allyId}` : "ficha_rpg_pod_order";
window.STORAGE_KEY_MAGIAS_ORDER = window.allyId ? `ally_mag_order_${window.allyId}` : "ficha_rpg_mag_order";
window.STORAGE_KEY_ATAQUES_ORDER = window.allyId ? `ally_atk_order_${window.allyId}` : "ficha_rpg_atk_order";
window.STORAGE_KEY_NOTAS_ORDER = window.allyId ? `ally_notas_order_${window.allyId}` : "ficha_rpg_notas_order";

window.OPTIONS_CATEGORIZADAS = { // Torna a constante globalmente acessível
    ficha: [
        { v: "nenhum",          t: "-"                },
        // ── Atributos base ──────────────────────────────
        { v: "forca",           t: "FOR"              },
        { v: "destreza",        t: "DES"              },
        { v: "constituicao",    t: "CON"              },
        { v: "inteligencia",    t: "INT"              },
        { v: "sabedoria",       t: "SAB"              },
        { v: "carisma",         t: "CAR"              },
        { v: "aura",            t: "AUR"              },
        // ── Recursos máximos ────────────────────────────
        { v: "pv_max",          t: "Vida Máx"         },
        { v: "pm_max",          t: "Mana Máx"         },
        { v: "sanidade_max",    t: "Sanidade Máx"     },
        // ── Stats de combate ────────────────────────────
        { v: "defesa",          t: "Defesa"           },
        { v: "movimentacao",    t: "Movimento"        },
        { v: "invocacoes_max",  t: "Invocações Máx"   },
        // ── Outros ──────────────────────────────────────
        { v: "status_info",     t: "Status"           },
        { v: "xp_max",          t: "XP Máx"           }
    ],
    // Categoria exclusiva para propriedades de item/equipamento
    item: [
        { v: "nenhum",  t: "-"                     },
        { v: "cd_max",  t: "Durabilidade Máx (CD)" }
    ],
    pericia: [
        { v: "todas", t: "TODAS AS PERÍCIAS" },
        { v: "acrobacia", t: "Acrobacia" }, { v: "adestramento", t: "Adestramento" },
        { v: "atuação", t: "Atuação" }, { v: "bloquear", t: "Bloquear" },
        { v: "conhecimento", t: "Conhecimento" }, { v: "corrompimento", t: "Corrompimento" },
        { v: "cura", t: "Cura" }, { v: "diplomacia", t: "Diplomacia" },
        { v: "enganação", t: "Enganação" }, { v: "fortitude", t: "Fortitude" },
        { v: "furtividade", t: "Furtividade" }, { v: "guerra", t: "Guerra" },
        { v: "iniciativa", t: "Iniciativa" }, { v: "intimidação", t: "Intimidação" },
        { v: "investigação", t: "Investigação" }, { v: "luta", t: "Luta" },
        { v: "manipulação", t: "Manipulação" }, { v: "misticismo", t: "Misticismo" },
        { v: "percepção", t: "Percepção" }, { v: "pilotagem", t: "Pilotagem" },
        { v: "pontaria", t: "Pontaria" }, { v: "reflexos", t: "Reflexos" },
        { v: "religião", t: "Religião" }, { v: "sobrevivência", t: "Sobrevivência" },
        { v: "vontade", t: "Vontade" }
    ],
    arma: [
        { v: "dano", t: "Dano" },
        { v: "critico", t: "Crítico" },
        { v: "teste", t: "Acerto" },
        { v: "alcance", t: "Alcance" },
        { v: "tipo_dano", t: "Tipo de Dano" }
    ],
    vantagem: [
        { v: "nenhum", t: "-" },
        { v: "todas", t: "TODAS AS PERÍCIAS" },
        { v: "acrobacia", t: "Acrobacia" }, { v: "adestramento", t: "Adestramento" }, { v: "atuação", t: "Atuação" }, { v: "bloquear", t: "Bloquear" }, { v: "conhecimento", t: "Conhecimento" }, { v: "corrompimento", t: "Corrompimento" }, { v: "cura", t: "Cura" }, { v: "diplomacia", t: "Diplomacia" }, { v: "enganação", t: "Enganação" }, { v: "fortitude", t: "Fortitude" }, { v: "furtividade", t: "Furtividade" }, { v: "guerra", t: "Guerra" }, { v: "iniciativa", t: "Iniciativa" }, { v: "intimidação", t: "Intimidação" }, { v: "investigação", t: "Investigação" }, { v: "luta", t: "Luta" }, { v: "manipulação", t: "Manipulação" }, { v: "misticismo", t: "Misticismo" }, { v: "percepção", t: "Percepção" }, { v: "pilotagem", t: "Pilotagem" }, { v: "pontaria", t: "Pontaria" }, { v: "reflexos", t: "Reflexos" }, { v: "religião", t: "Religião" }, { v: "sobrevivência", t: "Sobrevivência" }, { v: "vontade", t: "Vontade" }
    ]
};

/**
 * Gerencia estados visuais críticos para PV, PM e Sanidade
 */
function gerenciarEstadosCriticos() {
    const getVal = (id) => parseInt(document.getElementById(id)?.value) || 0;
    const porcentagem = (atual, max) => (atual / Math.max(1, max)) * 100;

    const pv_at = getVal('pv_atual');
    const pv_mx = getVal('pv_max');
    const pm_at = getVal('pm_atual');
    const pm_mx = getVal('pm_max');
    const san_at = getVal('sanidade_atual');
    const san_mx = getVal('sanidade_max');

    // PV Crítico
    const pctPv = porcentagem(pv_at, pv_mx);
    const pvBar = document.getElementById('pv_atual')?.closest('.bar-outer');
    if (pvBar) {
        if (pctPv <= 35) {
            pvBar.classList.add('critical-pulse');
            document.body.classList.add('hp-critical');
        } else {
            pvBar.classList.remove('critical-pulse');
            document.body.classList.remove('hp-critical');
        }
    }

    // PM Crítico
    const pctPm = porcentagem(pm_at, pm_mx);
    const pmBar = document.getElementById('pm_atual')?.closest('.bar-outer');
    if (pmBar) {
        if (pctPm <= 35) pmBar.classList.add('mana-unstable');
        else pmBar.classList.remove('mana-unstable');
    }

    // Sanidade Crítica
    const pctSan = porcentagem(san_at, san_mx);
    const sanBar = document.getElementById('sanidade_atual')?.closest('.bar-outer');
    if (sanBar) {
        if (pctSan <= 35) sanBar.classList.add('sanity-unstable');
        else sanBar.classList.remove('sanity-unstable');
    }
}

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

    // 1. Coleta dados de todos os inputs marcados para salvamento PRIMEIRO
    const inputsParaSalvar = document.querySelectorAll(".save-input");
    inputsParaSalvar.forEach(input => {
        // Ignora campos de atributo e vantagens de perícia na coleta bruta.
        // Eles possuem lógica própria de Base vs Total nos motores específicos.
        if (input.classList.contains('attr-input') || input.classList.contains('skill-adv') || input.id === 'status_info') return;

        const val = input.type === "checkbox" ? input.checked : input.value;
        dados[input.id] = val;
    });

    // 2. Calcula Nível Total com base nos dados recém coletados
    const nivelTotal = calcularNivelTotalEngine(dados);

    const racaEl = document.getElementById("raca");
    const racaKey = dados.raca || "nenhuma";

    // 3. Resolve Nível e Atributos (Shared)
    dados.nivel = nivelTotal;
    if (document.getElementById("nivel")) document.getElementById("nivel").value = nivelTotal;

    // 4. Resolve XP Máximo baseado no nível (Verifica se xp.js está carregado)
    const xpMax = typeof getXPNecessario === 'function' ? getXPNecessario(nivelTotal) : 1000;
    dados.xp_max = xpMax;
    const xpMaxEl = document.getElementById('xp_max');
    const xpMaxDisp = document.getElementById('xp_max_display');

    // Coleta o XP atual diretamente do input ou do banco de dados do aliado
    const xpAtualEl = document.getElementById('xp_atual');
    const xpAtualVal = xpAtualEl ? (parseInt(xpAtualEl.value) || 0) : (parseInt(dados.xp_atual) || 0);

    if (xpMaxEl) xpMaxEl.innerText = xpMax;
    if (xpMaxDisp) {
        xpMaxDisp.innerText = xpMax;
        const faltante = Math.max(0, xpMax - xpAtualVal);
        xpMaxDisp.title = `Faltam ${faltante} XP para o próximo nível`;
    }
    if (typeof validarXP === 'function') validarXP(); // Verifica se atingiu o limite

    // 1.5 Lógica de Modo de Evento
    const modoEventoAtivo = document.getElementById('modo_evento')?.checked || false;
    const sectionEvento = document.getElementById('section-event-bonuses');
    if (sectionEvento) sectionEvento.style.display = modoEventoAtivo ? 'block' : 'none';

    const eventBonuses = {};
    const eventSources = {};

    if (modoEventoAtivo) {
        const eventFields = {
            'pv_max': 'event_pv_max', 'pm_max': 'event_pm_max',
            'defesa': 'event_defesa', 'movimentacao': 'event_movimentacao',
            'forca': 'event_forca', 'destreza': 'event_destreza',
            'constituicao': 'event_constituicao', 'inteligencia': 'event_inteligencia',
            'sabedoria': 'event_sabedoria', 'carisma': 'event_carisma', 'aura': 'event_aura',
            'sanidade_max': 'event_sanidade_max'
        };

        Object.entries(eventFields).forEach(([key, inputId]) => {
            const val = parseInt(dados[inputId]) || 0;
            if (val !== 0) {
                eventBonuses[key] = val;
                if (!eventSources[key]) eventSources[key] = [];
                eventSources[key].push(`Evento (${val > 0 ? '+' : ''}${val})`);
            }
        });
    }

    const resultadoItens = calcularBonusItens(dados);
    const bonusItensPuros = resultadoItens.totals;
    const bonusPoderes = {};
    const bonusHabilidades = {};
    const fontesPoderes = {}; // { forca: ["Poder X (+2)"] }
    const fontesHabilidades = {};

    // Soma bônus vindos de Poderes (Buffs passivos)
    Object.keys(dados).forEach(key => {
        if (key.startsWith('poder_pv_bonus_')) bonusPoderes['pv_max'] = (bonusPoderes['pv_max'] || 0) + (parseInt(dados[key]) || 0);
        if (key.startsWith('poder_pm_bonus_')) bonusPoderes['pm_max'] = (bonusPoderes['pm_max'] || 0) + (parseInt(dados[key]) || 0);

        // Bônus de Poderes — Passiva/legado: sempre | Ativa: apenas com buff_ativo='true'
        if (key.startsWith('poder_mods_') && typeof dados[key] === 'string' && dados[key].startsWith('[')) {
            const id = key.replace('poder_mods_', '');
            const nome = dados[`poder_nome_${id}`] || "Poder";
            const buffAtivo = dados[`poder_buff_ativo_${id}`];
            const modoP = dados[`poder_modo_${id}`]; // 'Ativa', 'Passiva', ou undefined (legado)
            const isPassivaOuLegado = !modoP || modoP === 'Passiva' || buffAtivo === 'legado';
            // Aplica se: passiva/legado (sempre) OU ativa com buff ativo
            if (isPassivaOuLegado || buffAtivo === 'true') {
                try {
                    const mods = JSON.parse(dados[key]);
                    mods.forEach(m => {
                        const val = parseInt(m.mod);
                        if (!isNaN(val) && m.attr && m.attr !== 'nenhum') {
                            const target = m.isAdv ? `adv_${m.attr}` : m.attr;
                            bonusPoderes[target] = (bonusPoderes[target] || 0) + val;
                            if (!fontesPoderes[target]) fontesPoderes[target] = [];
                            const label = `${nome} (${val > 0 ? '+' : ''}${val})${buffAtivo === 'true' ? ' [Ativo]' : ''}`;
                            fontesPoderes[target].push(label);
                        }
                    });
                } catch (e) { console.error("Erro ao processar modificações do poder:", key); }
            }
        }

        // Bônus de Habilidades — Passiva: sempre ativo | Ativa/Reação: só se buff_ativo = 'true'
        if (key.startsWith('hab_mods_') && typeof dados[key] === 'string' && dados[key].startsWith('[')) {
            const id = key.replace('hab_mods_', '');
            const nome = dados[`hab_nome_${id}`] || "Habilidade";
            const tipo = dados[`hab_tipo_${id}`];
            const buffAtivo = dados[`hab_buff_ativo_${id}`];
            const deveAplicar = tipo === 'Passiva' || buffAtivo === 'true';
            if (deveAplicar) {
                try {
                    const mods = JSON.parse(dados[key]);
                    mods.forEach(m => {
                        const val = parseInt(m.mod);
                        if (!isNaN(val) && m.attr && m.attr !== 'nenhum') {
                            const target = m.isAdv ? `adv_${m.attr}` : m.attr;
                            bonusHabilidades[target] = (bonusHabilidades[target] || 0) + val;
                            if (!fontesHabilidades[target]) fontesHabilidades[target] = [];
                            const label = `${nome} (${val > 0 ? '+' : ''}${val})${buffAtivo === 'true' ? ' [Ativo]' : ''}`;
                            fontesHabilidades[target].push(label);
                        }
                    });
                } catch (e) { console.error("Erro ao processar modificações da habilidade:", key); }
            }
        }

        // Bônus de Magias — aplica somente se buff_ativo = 'true'
        if (key.startsWith('mag_mods_') && typeof dados[key] === 'string' && dados[key].startsWith('[')) {
            const id = key.replace('mag_mods_', '');
            const nome = dados[`mag_nome_${id}`] || "Magia";
            if (dados[`mag_buff_ativo_${id}`] === 'true') {
                try {
                    const mods = JSON.parse(dados[key]);
                    mods.forEach(m => {
                        const val = parseInt(m.mod);
                        if (!isNaN(val) && m.attr && m.attr !== 'nenhum') {
                            const target = m.isAdv ? `adv_${m.attr}` : m.attr;
                            bonusHabilidades[target] = (bonusHabilidades[target] || 0) + val;
                            if (!fontesHabilidades[target]) fontesHabilidades[target] = [];
                            fontesHabilidades[target].push(`${nome} (${val > 0 ? '+' : ''}${val}) [Magia Ativa]`);
                        }
                    });
                } catch (e) { console.error("Erro ao processar modificações da magia:", key); }
            }
        }
    });

    // 3.5 Soma bônus vindos de Aliados (Buffs definidos para o dono)
    const bonusAliados = {};
    const fontesAliados = {};
    const listaAliados = JSON.parse(localStorage.getItem(ALIADOS_KEY)) || [];

    listaAliados.forEach(id => {
        const allyData = JSON.parse(localStorage.getItem(id));
        // Só aplica bônus se não for a própria ficha do aliado sendo editada
        if (allyData && allyData.buffs_dono && Array.isArray(allyData.buffs_dono) && STORAGE_KEY !== id) {
            const allyNome = allyData.nome || "Aliado";
            allyData.buffs_dono.forEach(b => {
                const val = parseInt(b.mod);
                if (!isNaN(val) && b.attr && b.attr !== 'nenhum') {
                    const target = b.isAdv ? `adv_${b.attr}` : b.attr;
                    bonusAliados[target] = (bonusAliados[target] || 0) + val;
                    if (!fontesAliados[target]) fontesAliados[target] = [];
                    fontesAliados[target].push(`${allyNome} (${val > 0 ? '+' : ''}${val})`);
                }
            });
        }
    });

    // Consolida tudo em um único objeto de bônus para manter compatibilidade com outras funções
    const bonusItens = { ...bonusItensPuros };
    [bonusPoderes, bonusHabilidades, eventBonuses, bonusAliados].forEach(src => {
        Object.keys(src).forEach(k => bonusItens[k] = (bonusItens[k] || 0) + src[k]);
    });

    const breakdown = {
        itens: resultadoItens.sources,
        poderes: fontesPoderes,
        habilidades: fontesHabilidades,
        aliados: fontesAliados,
        racaManual: {},
        event: eventSources
    };

    // Coleta bônus manuais para as raças especiais (Deus, Anjo, Demônio, etc)
    const racasComBonusExtra = ["deus", "escolhido", "corrompido", "anjo", "demonio", "semideus"];
    const possuiBonusManual = racasComBonusExtra.includes(racaKey) ||
        (racaKey === "hibrido" && (racasComBonusExtra.includes(dados.hibrido_raca_1) || racasComBonusExtra.includes(dados.hibrido_raca_2)));

    if (possuiBonusManual) {
        const manualFields = {
            'pv_max': 'pv_extra_raca', 'pm_max': 'pm_extra_raca',
            'defesa': 'defesa_extra_raca', 'movimentacao': 'movimento_extra_raca',
            'forca': 'forca_extra_raca', 'destreza': 'destreza_extra_raca',
            'constituicao': 'constituicao_extra_raca', 'inteligencia': 'inteligencia_extra_raca',
            'sabedoria': 'sabedoria_extra_raca', 'carisma': 'carisma_extra_raca', 'aura': 'aura_extra_raca'
        };

        Object.entries(manualFields).forEach(([key, inputId]) => {
            const val = parseInt(dados[inputId]) || 0;
            if (val !== 0) {
                bonusItens[key] = (bonusItens[key] || 0) + val;
                if (!breakdown.racaManual[key]) breakdown.racaManual[key] = [];
                breakdown.racaManual[key].push(`Bônus de Raça Manual (${val > 0 ? '+' : ''}${val})`);
            }
        });
    }

    const infoAttr = engineCalcularAtributos(dados, bonusItens, racaKey, breakdown);

    // Calcular status de Mana para Habilidades e Poderes
    const pmAtual = parseInt(dados.pm_atual) || 0;
    const pvAtual = parseInt(dados.pv_atual) || 0;
    const isCorrompido = racaKey === "corrompido" || (racaKey === "hibrido" && (dados.hibrido_raca_1 === "corrompido" || dados.hibrido_raca_2 === "corrompido"));

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
                    if (isCorrompido) isOk = (pvAtual >= custo);
                    else isOk = (pmAtual >= custo);
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
    if (typeof verificarProgressaoHabilidades === 'function') verificarProgressaoHabilidades(dados);
    if (typeof atualizarDefesa === 'function') atualizarDefesa(infoAttr.mods, dados, bonusItens, breakdown);
    if (typeof atualizarVida === 'function') atualizarVida(infoAttr.mods, dados, bonusItens, breakdown);
    if (typeof atualizarMana === 'function') atualizarMana(infoAttr.mods, dados, bonusItens, breakdown);
    if (typeof atualizarMovimento === 'function') atualizarMovimento(infoAttr.mods, dados, bonusItens, breakdown);
    if (typeof verificarStatusInicial === 'function') verificarStatusInicial(infoAttr.mods);
    if (typeof verificarVisibilidadeClasses === 'function') verificarVisibilidadeClasses();
    if (typeof verificarExtraDeusEscolhido === 'function') verificarExtraDeusEscolhido(dados);
    if (typeof verificarCorrompido === 'function') verificarCorrompido(dados);
    if (typeof verificarAtributoVampiro === 'function') verificarAtributoVampiro(infoAttr, dados);
    if (typeof verificarAvisoAnimalia === 'function') verificarAvisoAnimalia(dados);
    if (typeof verificarExtraFada === 'function') verificarExtraFada(dados);
    if (typeof verificarExtraHibrido === 'function') verificarExtraHibrido(dados); // Movemos híbrido para cima
    if (typeof verificarExtraVampiro === 'function') verificarExtraVampiro(dados); // Nova chamada para verificar campos de Vampiro
    if (typeof verificarExtraEspirito === 'function') verificarExtraEspirito(dados); // Nova chamada para verificar campos de Espírito
    if (typeof verificarExtraMortoVivo === 'function') verificarExtraMortoVivo(dados); // Nova chamada para verificar campos de Morto-Vivo
    if (typeof atualizarPericias === 'function') {
        atualizarPericias(nivelTotal, infoAttr.mods, bonusItens, dados, breakdown);
    }

    // Atualiza cores e tooltips de Status, Defesa e Movimentação
    if (typeof aplicarBonusVisuais === 'function') {
        aplicarBonusVisuais(bonusItens, dados, breakdown);
    }

    if (typeof atualizarAtaques === 'function') atualizarAtaques(nivelTotal, infoAttr.mods, bonusItens);
    if (typeof atualizarRacaUI === 'function') atualizarRacaUI(racaKey); // Nova chamada para atualizar campos de raça
    if (typeof atualizarCarga === 'function') atualizarCarga(infoAttr, dados);
    atualizarBarras(bonusItens);

    // Agora chama o gerenciador por último, garantindo que os elementos já tenham os valores finais
    gerenciarEstadosCriticos();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
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
        input.dataset.prevVal = String(newValue);
        atualizarTudo();
    }
}

// ── Input aritmético nas barras de status ────────────────────────
function barInputFocus(inputEl) {
    inputEl.dataset.prevVal = inputEl.value;
    inputEl.select();
}

function barInputKeydown(e, inputEl) {
    if (e.key === 'Enter') {
        e.preventDefault();
        barInputApply(inputEl);
        inputEl.blur();
    } else if (e.key === 'Escape') {
        inputEl.value = inputEl.dataset.prevVal || inputEl.value;
        inputEl.blur();
    }
}

function barInputApply(inputEl) {
    const raw = (inputEl.value || '').trim();
    const prev = parseInt(inputEl.dataset.prevVal) || 0;
    let newVal;

    if (/^[+-]\d+(\.\d+)?$/.test(raw)) {
        // Aritmético: +15 ou -8 → aplica sobre o valor anterior
        newVal = Math.max(0, Math.round(prev + parseFloat(raw)));
    } else if (raw !== '' && !isNaN(parseFloat(raw))) {
        newVal = Math.max(0, Math.round(parseFloat(raw)));
    } else {
        newVal = prev; // Input inválido → restaura
    }

    inputEl.value = newVal;
    inputEl.dataset.prevVal = String(newVal);
    atualizarTudo();
}

window.currentImgTargetId = null; // Armazena se estamos editando ficha principal ou um aliado específico

window.triggerCharImageInput = function (container) {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (dados.foto) {
        window.abrirModalGerenciarImagem(null); // null indica que usa STORAGE_KEY
    } else {
        const input = container.querySelector('input[type="file"]');
        if (input) input.click();
    }
};

window.abrirModalGerenciarImagem = function (targetId) {
    window.currentImgTargetId = targetId;
    const key = targetId || STORAGE_KEY;
    const dados = JSON.parse(localStorage.getItem(key)) || {};

    const modal = document.getElementById('modal-image-manager');
    const preview = document.getElementById('image-manager-preview');

    if (!modal || !preview || !dados.foto) return;

    preview.src = dados.foto;

    // Carrega valores salvos ou padrões
    document.getElementById('img-manager-zoom').value = dados.foto_zoom || 1;
    document.getElementById('img-manager-x').value = dados.foto_x || 50;
    document.getElementById('img-manager-y').value = dados.foto_y || 50;

    window.atualizarPreviewAjuste();
    modal.showModal();
};

window.fecharModalGerenciarImagem = function () {
    const modal = document.getElementById('modal-image-manager');
    if (modal) modal.close();
};

window.atualizarPreviewAjuste = function () {
    const preview = document.getElementById('image-manager-preview');
    const zoom = document.getElementById('img-manager-zoom').value;
    const x = document.getElementById('img-manager-x').value;
    const y = document.getElementById('img-manager-y').value;

    if (preview) {
        preview.style.transform = `scale(${zoom})`;
        preview.style.objectPosition = `${x}% ${y}%`;
        preview.style.transformOrigin = `${x}% ${y}%`;
    }
};

window.salvarAjustesImagem = function () {
    const key = window.currentImgTargetId || STORAGE_KEY;
    const dados = JSON.parse(localStorage.getItem(key)) || {};

    dados.foto_zoom = document.getElementById('img-manager-zoom').value;
    dados.foto_x = document.getElementById('img-manager-x').value;
    dados.foto_y = document.getElementById('img-manager-y').value;

    localStorage.setItem(key, JSON.stringify(dados));
    window.fecharModalGerenciarImagem();

    // Se estivermos na ficha, atualiza o avatar da ficha
    if (window.location.pathname.includes('ficha.html')) {
        const mainImg = document.getElementById('char-avatar-img');
        if (mainImg) window.aplicarEstilosAvatar(mainImg, dados);
    } else if (typeof renderizarAliados === 'function') {
        renderizarAliados();
    }
    showNotification("Ajustes de imagem salvos!", "success");
};

window.removerImagem = function () {
    showConfirm("Deseja remover a foto permanentemente?", () => {
        const key = window.currentImgTargetId || STORAGE_KEY;
        const dados = JSON.parse(localStorage.getItem(key)) || {};

        delete dados.foto;
        delete dados.foto_zoom;
        delete dados.foto_x;
        delete dados.foto_y;

        localStorage.setItem(key, JSON.stringify(dados));
        window.fecharModalGerenciarImagem();
        location.reload(); // Recarrega para limpar o estado visual
    });
};

window.trocarImagemDesdeModal = function () {
    window.fecharModalGerenciarImagem();
    // Se window.currentImgTargetId for nulo, estamos na ficha principal
    if (!window.currentImgTargetId) {
        document.getElementById('char-image-input').click();
    } else {
        // Se for aliado, precisamos achar o card e clicar no input dele
        const card = document.querySelector(`.ally-card[data-id="${window.currentImgTargetId}"]`);
        if (card) card.querySelector('.ally-image-input').click();
    }
};

window.aplicarEstilosAvatar = function (imgEl, dados) {
    if (!imgEl || !dados) return;
    const zoom = dados.foto_zoom || 1;
    const x = dados.foto_x || 50;
    const y = dados.foto_y || 50;

    imgEl.style.objectFit = 'cover';
    imgEl.style.transform = `scale(${zoom})`;
    imgEl.style.objectPosition = `${x}% ${y}%`;
    imgEl.style.transformOrigin = `${x}% ${y}%`;
};

window.salvarImagemPersonagem = function (input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
        if (typeof showNotification === 'function') showNotification("A imagem é muito pesada! Tente uma menor que 1MB.", "warning");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados.foto = base64;
        // Reseta ajustes ao trocar de foto
        dados.foto_zoom = 1;
        dados.foto_x = 50;
        dados.foto_y = 50;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

        const img = document.getElementById('char-avatar-img');
        if (img) {
            img.src = base64;
            window.aplicarEstilosAvatar(img, dados);
        }
        if (typeof showNotification === 'function') showNotification("Avatar atualizado!", "success");
    };
    reader.readAsDataURL(file);
};

function exportarFicha() {
    // 1. Força a atualização imediata com o que estiver na tela no momento
    atualizarTudo();

    const dadosFicha = localStorage.getItem(STORAGE_KEY);
    const historico = localStorage.getItem(HISTORY_KEY) || "[]";

    // 2. Criamos um pacote que contém absolutamente tudo o que existe no banco de dados
    const pacoteCompleto = {
        dados: JSON.parse(dadosFicha),
        historico: JSON.parse(historico),
        // Inclui as ordens personalizadas no pacote de exportação
        habilidadesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_HABILIDADES_ORDER) || "[]"),
        poderesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_PODERES_ORDER) || "[]"),
        magiasOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_MAGIAS_ORDER) || "[]"),
        ataquesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_ATAQUES_ORDER) || "[]"),
        notasOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_NOTAS_ORDER) || "[]"),
        inventarioOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY_ORDER) || "[]"),
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
                // Restaura as ordens personalizadas
                if (importado.habilidadesOrder) localStorage.setItem(STORAGE_KEY_HABILIDADES_ORDER, JSON.stringify(importado.habilidadesOrder));
                if (importado.poderesOrder) localStorage.setItem(STORAGE_KEY_PODERES_ORDER, JSON.stringify(importado.poderesOrder));
                if (importado.magiasOrder) localStorage.setItem(STORAGE_KEY_MAGIAS_ORDER, JSON.stringify(importado.magiasOrder));
                if (importado.ataquesOrder) localStorage.setItem(STORAGE_KEY_ATAQUES_ORDER, JSON.stringify(importado.ataquesOrder));
                if (importado.notasOrder) localStorage.setItem(STORAGE_KEY_NOTAS_ORDER, JSON.stringify(importado.notasOrder));
                if (importado.inventarioOrder) localStorage.setItem(STORAGE_KEY_INVENTORY_ORDER, JSON.stringify(importado.inventarioOrder));

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
 * Aplica uma cor customizada ao tema da ficha
 */
function aplicarCorTema(cor) {
    if (!cor) return;
    document.documentElement.style.setProperty('--primary-color', cor);

    // Gera uma versão com transparência para o brilho (glow)
    const r = parseInt(cor.slice(1, 3), 16);
    const g = parseInt(cor.slice(3, 5), 16);
    const b = parseInt(cor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);

    // Se estivermos editando um aliado, salvamos a cor nos dados dele.
    // Caso contrário, salvamos no tema global da ficha.
    if (allyId) {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados.cor_tema = cor;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } else {
        localStorage.setItem(THEME_KEY, cor);
    }
}

/**
 * Aplica a cor secundária ao tema da ficha
 */
function aplicarCorSecundaria(cor) {
    if (!cor) return;
    document.documentElement.style.setProperty('--secondary-color', cor);

    const r = parseInt(cor.slice(1, 3), 16);
    const g = parseInt(cor.slice(3, 5), 16);
    const b = parseInt(cor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--secondary-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);

    localStorage.setItem(THEME_KEY_SECONDARY, cor);
}

/**
 * Verifica se uma DLC específica está ativa
 */
window.isDlcAtiva = function (dlcId) {
    if (!dlcId) return true;
    let activeDlcs = JSON.parse(localStorage.getItem(DLCS_KEY));
    if (!activeDlcs || !Array.isArray(activeDlcs) || activeDlcs.length === 0) activeDlcs = ['atual'];
    return activeDlcs.includes(dlcId);
};

/**
 * Alterna o estado de uma DLC e atualiza a interface
 */
window.toggleDlc = function (input) {
    let activeDlcs = JSON.parse(localStorage.getItem(DLCS_KEY));
    if (!activeDlcs || !Array.isArray(activeDlcs) || activeDlcs.length === 0) activeDlcs = ['atual'];
    if (input.checked) {
        if (!activeDlcs.includes(input.value)) activeDlcs.push(input.value);
    } else {
        activeDlcs = activeDlcs.filter(id => id !== input.value);
    }
    localStorage.setItem(DLCS_KEY, JSON.stringify(activeDlcs));

    // Atualiza Raças
    if (typeof initRaces === 'function') initRaces();

    // Atualiza todos os seletores de classe existentes na tela
    document.querySelectorAll('[id^="class_name_"]').forEach(select => {
        const currentVal = select.value;
        const classesDB = window.CLASSES_DATA || {};
        const options = Object.keys(classesDB)
            .filter(key => !classesDB[key].dlc || isDlcAtiva(classesDB[key].dlc))
            .map(key => `<option value="${key}" ${currentVal === key ? 'selected' : ''}>${classesDB[key].nome || key}</option>`)
            .join('');
        select.innerHTML = '<option value="">Selecione...</option>' + options;
    });

    if (typeof atualizarTudo === 'function') atualizarTudo();
    showNotification("Configuração de DLCs atualizada!", "info", 2000);
};

window.initDlcs = function () {
    const container = document.getElementById('dlc-selector-container');
    if (!container) return;

    let activeDlcs = JSON.parse(localStorage.getItem(DLCS_KEY));
    if (!activeDlcs || !Array.isArray(activeDlcs) || activeDlcs.length === 0) activeDlcs = ['atual'];
    const dlcs = [
        { id: 'atual', nome: 'Atual' },
        { id: 'normalidade', nome: 'Normalidade' },
        { id: 'passado', nome: 'Passado' },
        { id: 'futuro', nome: 'Futuro' },
        { id: 'olimpo', nome: 'Olimpo' }
    ];

    container.innerHTML = `
        <label class="dlc-label">Módulos de Expansão (DLCs)</label>
        <div class="dlc-checkbox-grid">
            ${dlcs.map(dlc => `
                <label class="dlc-checkbox-item">
                    <input type="checkbox" value="${dlc.id}" ${activeDlcs.includes(dlc.id) ? 'checked' : ''} onchange="toggleDlc(this)">
                    <span>${dlc.nome}</span>
                </label>
            `).join('')}
        </div>
    `;
};

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

            // Carrega a foto se existir
            const charImg = document.getElementById('char-avatar-img');
            if (charImg) {
                if (salvo.foto) {
                    charImg.src = salvo.foto;
                    aplicarEstilosAvatar(charImg, salvo);
                } else {
                    charImg.src = "https://ui-avatars.com/api/?name=?&background=0d0d0f&color=ff4444";
                }
            }
        }

        // Se estivermos em um aliado na página de ficha, injeta um aviso visual
        if (allyId && window.location.pathname.includes('ficha.html')) {
            const container = document.querySelector('.container');
            if (container) {
                const allyNotice = document.createElement('div');
                allyNotice.style.cssText = `
                    background: var(--primary-glow);
                    border: 1px dashed var(--primary-color);
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                    color: var(--primary-color);
                `;
                const nomeAliado = salvo ? (salvo.nome || "Aliado") : "Aliado";
                allyNotice.innerHTML = `MODO DE EDIÇÃO DO ALIADO: <span>${nomeAliado}</span>`;
                container.prepend(allyNotice);
            }
        }

        // Carrega o tema: Prioridade para a cor do aliado se estiver no contexto de um
        let temaParaAplicar = localStorage.getItem(THEME_KEY);
        if (allyId && salvo && salvo.cor_tema) {
            temaParaAplicar = salvo.cor_tema;
        }
        if (temaParaAplicar) aplicarCorTema(temaParaAplicar);

        // Carrega cor secundária
        const temaSecundario = localStorage.getItem(THEME_KEY_SECONDARY);
        if (temaSecundario) aplicarCorSecundaria(temaSecundario);

    } catch (e) {
        console.warn("Nenhum dado prévio encontrado ou erro no JSON.");
    }

    // Listener global para inputs de salvamento
    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('save-input')) {
            atualizarTudo();
        }
    });

    // Listener para fechar notificação ao clicar
    document.body.addEventListener('click', (e) => {
        const notificationEl = e.target.closest('#global-notification');
        if (notificationEl && notificationEl.classList.contains('show')) {
            clearTimeout(notificationTimeout);
            notificationEl.classList.remove('show');
        }
    });

    // Inicia o sistema de backup automático (a cada 10 minutos)
    setInterval(realizarBackupAutomatico, 10 * 60 * 1000);

    // Sincronização em tempo real entre abas (Ficha <-> Dashboard)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            const novosDados = JSON.parse(e.newValue);
            if (!novosDados) return;

            // Atualiza apenas os inputs de salvamento que não estão sendo focados pelo usuário
            document.querySelectorAll('.save-input').forEach(input => {
                if (document.activeElement !== input && novosDados[input.id] !== undefined) {
                    if (input.type === "checkbox") input.checked = novosDados[input.id];
                    else input.value = novosDados[input.id];
                }
            });
            atualizarTudo();
        }
    });
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
    showConfirm("Deseja resetar todos os valores base de atributos para 10? Isso ignorará bônus temporários e retornará a base ao valor padrão.", () => {
        const attrs = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura"];
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        attrs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = 10;
            dados[id] = 10;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        atualizarTudo();
        showNotification("Atributos resetados para 10 com sucesso.", "success");
    }, () => {
        showNotification("Reset de atributos cancelado.", "info");
    }, "Resetar Atributos");
}

/**
 * Limpa todos os dados salvos da ficha (Dados Principais e Histórico)
 */
function limparTodaFicha() {
    if (typeof showConfirm === 'function') {
        showConfirm("Tem certeza que deseja apagar TODOS os dados do personagem? Isso removerá atributos, classes, inventário e histórico permanentemente.", () => {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(HISTORY_KEY);
            showNotification("Ficha resetada com sucesso! Reiniciando...", "success");
            setTimeout(() => location.reload(), 1200);
        }, () => {
            showNotification("Ação cancelada.", "info");
        }, "Limpar Toda a Ficha");
    }
}