/**
 * Engine de Cálculos - Atributos, Nível e Bônus de Itens/Poderes
 */

/**
 * Soma uma lista de ajustes personalizados (buffs/debuffs manuais) salva em formato JSON
 * em um campo da ficha. Usado para Vida, Mana e Sanidade Máximas — ganhos ou perdas que
 * NÃO vêm de poderes, habilidades, itens ou raça (maldições, bênçãos, eventos, regras de mesa, etc).
 * Cada entrada da lista tem o formato { valor: number, motivo: string }.
 *
 * @param {object} dados - Objeto de dados da ficha (coletado pelo atualizarTudo)
 * @param {string} campo - Nome do campo onde a lista (string JSON) está salva
 * @returns {{ total: number, detalhes: string[] }} Soma total e linhas formatadas para exibição
 */
window.somarAjustesManuais = function (dados, campo) {
    let lista = [];
    try {
        const raw = dados ? dados[campo] : null;
        if (raw) lista = JSON.parse(raw);
    } catch (e) { lista = []; }
    if (!Array.isArray(lista)) lista = [];

    let total = 0;
    const detalhes = [];
    lista.forEach(item => {
        const valor = parseInt(item && item.valor) || 0;
        if (valor === 0) return;
        total += valor;
        const motivo = ((item && item.motivo) || '').trim();
        detalhes.push(`Ajuste Personalizado: ${valor >= 0 ? '+' : ''}${valor}${motivo ? ` (${motivo})` : ''}`);
    });

    return { total, detalhes };
};

window.getClassesAtivas = function (dados) {
    const classes = [];
    const container = document.getElementById('classes-container');

    if (container && container.querySelector('.class-row')) {
        container.querySelectorAll('.class-row').forEach(row => {
            const name = row.querySelector('[id^="class_name_"]')?.value;
            const lvl = parseInt(row.querySelector('[id^="class_lvl_"]')?.value) || 0;
            const sub = row.querySelector('[id^="class_sub_"]')?.value || "";
            if (name) classes.push({ name, lvl, sub });
        });
        return classes;
    }

    Object.keys(dados).forEach(key => {
        if (key.startsWith('class_name_')) {
            const id = key.split('_').pop();
            classes.push({
                name: dados[key],
                lvl: parseInt(dados[`class_lvl_${id}`]) || 0,
                sub: dados[`class_sub_${id}`] || ""
            });
        }
    });
    return classes;
}

window.calcularNivelTotalEngine = function (dados) {
    const classes = getClassesAtivas(dados);
    let soma = 0;
    classes.forEach(c => soma += c.lvl);
    return soma;
}

window.calcularBonusItens = function (dados) {
    const totais = {};
    const fontes = {};
    const addBonus = (attr, val, nome) => {
        if (!attr || attr === 'nenhum' || val === 0) return;
        totais[attr] = (totais[attr] || 0) + val;
        if (!fontes[attr]) fontes[attr] = [];
        fontes[attr].push(`${nome} (${val > 0 ? '+' : ''}${val})`);
    };

    if (dados.vampiro_forma_morcego) addBonus('reflexos', 6, 'Forma de Morcego');

    Object.keys(dados).forEach(key => {
        if (key.startsWith('inv_eqp_') && dados[key] === true) {
            const id = key.replace('inv_eqp_', '');
            const nome = dados[`inv_nome_${id}`] || "Item";
            const attr = dados[`inv_attr_${id}`];
            const val = parseInt(dados[`inv_mod_${id}`]) || 0;
            addBonus(attr, val, nome);

            const categoria = dados[`inv_cat_${id}`];
            if (categoria === 'armaduras') {
                addBonus('defesa', parseInt(dados[`inv_defesa_bonus_${id}`]) || 0, nome);
                addBonus('movimentacao', -(parseInt(dados[`inv_defesa_penalidade_${id}`]) || 0), `${nome} (Peso)`);
            }

            // Processa materiais (cabo e base) com suporte a formato contextual por categoria
            ['cabo', 'base'].forEach(f => {
                const raw = dados[`inv_${f}_${id}`];
                if (raw && raw.startsWith('{')) {
                    try {
                        const mat = JSON.parse(raw);
                        const matName = mat.nome || (f === 'cabo' ? 'Centro' : 'Base');

                        let attributesToProcess = [];
                        if (Array.isArray(mat.attributes)) {
                            attributesToProcess = mat.attributes;
                        } else if (mat.attributes && typeof mat.attributes === 'object') {
                            attributesToProcess = mat.attributes[categoria] || mat.attributes['geral'] || [];
                        }

                        attributesToProcess.forEach(a => {
                            const val = parseInt(a.mod);
                            if (!isNaN(val)) {
                                addBonus(a.isAdv ? `adv_${a.attr}` : a.attr, val, `${nome} (${matName})`);
                            }
                        });
                    } catch (e) { }
                }
            });

            // ─── MODIFICAÇÕES DO ITEM (encantamentos, melhorias) ─────────────────
            const modsRaw = dados[`inv_mods_item_${id}`];
            if (modsRaw && modsRaw.startsWith('{')) {
                try {
                    const modsData = JSON.parse(modsRaw);
                    (modsData.attributes || []).forEach(a => {
                        const val = parseInt(a.mod);
                        if (!isNaN(val) && a.attr && a.attr !== 'nenhum') {
                            addBonus(a.isAdv ? `adv_${a.attr}` : a.attr, val, `${nome} (Modificação)`);
                        }
                    });
                } catch (e) { }
            }

            // ─── RARIDADE DO ITEM ─────────────────────────────────────────────────
            const raroRaw = dados[`inv_raro_${id}`];
            if (raroRaw && raroRaw.startsWith('{')) {
                try {
                    const raroData = JSON.parse(raroRaw);
                    const rarLabel = raroData.raridade ? raroData.raridade.charAt(0).toUpperCase() + raroData.raridade.slice(1) : 'Raro';
                    (raroData.attributes || []).forEach(a => {
                        const val = parseInt(a.mod);
                        if (!isNaN(val) && a.attr && a.attr !== 'nenhum') {
                            addBonus(a.isAdv ? `adv_${a.attr}` : a.attr, val, `${nome} (${rarLabel})`);
                        }
                    });
                } catch (e) { }
            }
        }
    });
    return { totals: totais, sources: fontes };
}

window.engineCalcularAtributos = function (dadosObj, bonusItens = {}, racaKey, breakdown = null) {
    const cache = { mods: {}, totals: {} };
    const attrInputs = document.querySelectorAll(".attr-input");
    let bonusRaca = {}, modBonusRaca = {};

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

    // Poder "Eu tô morto?" (Morto-Vivo): cancela a penalidade de -1 de Carisma da raça
    const mortoVivoAtivo = racaKey === 'morto_vivo' ||
        (racaKey === 'hibrido' && (dadosObj.hibrido_raca_1 === 'morto_vivo' || dadosObj.hibrido_raca_2 === 'morto_vivo'));
    const mortoVivoPoder = dadosObj.morto_vivo_poder || document.getElementById('morto_vivo_poder')?.value || '';
    if (mortoVivoAtivo && mortoVivoPoder === 'eu_to_morto') {
        bonusRaca.carisma = (bonusRaca.carisma || 0) + 1;
    }

    const attrs = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "aura", "status_info"];

    attrs.forEach(id => {
        const input = document.getElementById(id);
        const totalBonus = (bonusItens[id] || 0) + (bonusRaca[id] || 0);
        const modBonus = (modBonusRaca[id] || 0);

        // 1. Calcula os bônus externos primeiro
        let bonusExtraMod = 0;
        let fonteExtraMod = "";
        if (id === 'status_info') {
            const modCarisma = cache.mods['carisma'] || 0;
            if (modCarisma >= 3) {
                bonusExtraMod = 1; // Bônus por ser influente
                fonteExtraMod = "Carisma (Influência) (+1)";
            } else if (modCarisma <= -1) {
                bonusExtraMod = -1; // Penalidade por ser antisocial
                fonteExtraMod = "Carisma (Antisocial) (-1)";
            }
        }

        // Correção: Se for status_info, o padrão é 0. Para os demais atributos core, o padrão é 10.
        const defaultValue = (id === 'status_info') ? 0 : 10;

        // 2. Determina a BASE. Se estivermos editando, subtraímos os bônus do valor digitado.
        let base = input === document.activeElement
            ? (parseInt(input.value) || 0) - totalBonus - bonusExtraMod
            : (dadosObj[id] !== undefined && dadosObj[id] !== "" ? parseInt(dadosObj[id]) : defaultValue);

        if (isNaN(base)) base = defaultValue;

        // 3. Soma tudo para o TOTAL final
        const total = base + totalBonus + bonusExtraMod;

        // Status Info não usa a fórmula de modificador (Total - 10) / 2
        let finalMod = 0;
        if (id !== 'status_info') {
            finalMod = Math.floor((total - 10) / 2) + modBonus;
        }

        const display = document.getElementById(`mod${id.charAt(0).toUpperCase() + id.slice(1)}`);
        if (display && id !== 'status_info') {
            display.innerText = (finalMod >= 0 ? "+" : "") + finalMod;
        }

        if (input) {
            if (input && input !== document.activeElement) input.value = total;

            let details = [`Base: ${base}`];
            if (fonteExtraMod) details.push(fonteExtraMod);
            if (bonusRaca[id]) details.push(`Raça: ${bonusRaca[id] > 0 ? '+' : ''}${bonusRaca[id]}`);
            if (modBonus !== 0) details.push(`Mod. Raça: ${modBonus > 0 ? '+' : ''}${modBonus}`);

            if (breakdown) {
                const sources = [
                    ...(breakdown.itens[id] || []),
                    ...(breakdown.poderes[id] || []),
                    ...(breakdown.habilidades[id] || []),
                    ...(breakdown.aliados[id] || []),
                    ...(breakdown.racaManual[id] || []),
                    ...(breakdown.event[id] || [])
                ];
                sources.forEach(s => details.push(s));
            }
            input.title = `Total: ${total} (${details.join(' | ')})`;
        }

        dadosObj[id] = base;
        cache.mods[id] = finalMod;
        cache.totals[id] = total;
    });
    return cache;
}

window.aplicarPericiasPorClasseEngine = function (dados) {
    const trainedSkills = new Set();
    const racaKey = document.getElementById("raca")?.value || dados.raca || "nenhuma";
    const racaData = (typeof RACAS_DATA !== 'undefined') ? RACAS_DATA[racaKey] : null;
    if (racaData?.skills) racaData.skills.forEach(sk => trainedSkills.add(sk.toLowerCase().replace(/\s/g, '_')));

    const skillRows = document.querySelectorAll('.skill-row');
    if (skillRows.length > 0) {
        skillRows.forEach(row => {
            const slug = row.querySelector(".skill-bonus")?.id.replace('skill_bonus_', '');
            const trainingSelect = row.querySelector(".skill-training-select");
            if (trainedSkills.has(slug) && trainingSelect.value === "nenhum") {
                trainingSelect.value = "treinado";
            }
        });
    }
}