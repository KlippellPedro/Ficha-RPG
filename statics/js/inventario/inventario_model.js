/**
 * Modelo de dados do Inventário.
 *
 * Substitui o formato antigo (cada item era um punhado de elementos DOM com
 * id sufixado por índice — inv_nome_<id>, inv_peso_<id>, etc, com raridade e
 * materiais guardados como JSON dentro de uma string dentro de um atributo)
 * por um único array normalizado (`dados.inventario`), onde cada item é um
 * objeto plano com todos os campos sempre presentes.
 */

const TIPOS_INVENTARIO_INFO = {
    armas: { icone: '⚔', nome: 'Armas', equipavel: true },
    armaduras: { icone: '🛡', nome: 'Armaduras', equipavel: true },
    consumiveis: { icone: '🧪', nome: 'Consumíveis', equipavel: false },
    item_magico: { icone: '✨', nome: 'Itens Mágicos', equipavel: false },
    outros: { icone: '📦', nome: 'Outros', equipavel: false },
};
window.TIPOS_INVENTARIO_INFO = TIPOS_INVENTARIO_INFO;

function _invTexto(v, max = 300) {
    return String(v ?? '').trim().slice(0, max);
}

function _invNumero(v, { min = 0, max = 999999, padrao = 0 } = {}) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : padrao;
}

/** Escapa texto para uso seguro em HTML gerado por template string. */
function _escapeHTML(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
window._escapeHTML = _escapeHTML;

/** Escapa um valor para uso seguro dentro de atributos HTML com aspas duplas. */
function _escapeAttr(s) {
    return _escapeHTML(s).replace(/"/g, '&quot;');
}
window._escapeAttr = _escapeAttr;

/**
 * Normaliza uma lista de bônus de atributo ({attr, mod, isAdv}). `mod` pode
 * ser um número OU uma notação de dado (ex: "2d6", "1d4") — vem assim de
 * materiais.js — por isso não é convertido para número aqui, só preservado.
 */
function _invAtributos(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 20).map(a => ({
        attr: _invTexto(a?.attr, 40) || 'nenhum',
        mod: (a && a.mod !== undefined) ? a.mod : 0,
        isAdv: Boolean(a?.isAdv),
    }));
}

/**
 * Materiais (Centro/Base de armas) guardam {nome, attributes}. Alguns raros
 * registros podem ter `attributes` como objeto {armas:[], itens:[], geral:[]}
 * em vez de array simples — achata usando a categoria do item, mesma lógica
 * defensiva de calcularBonusItens em global_calculations.js.
 */
function _invNormalizarMaterial(raw, categoriaItem) {
    if (!raw || typeof raw !== 'object') return { nome: '', attributes: [] };
    let attrs = raw.attributes;
    if (!Array.isArray(attrs) && attrs && typeof attrs === 'object') {
        attrs = attrs[categoriaItem] || attrs.geral || [];
    }
    return { nome: _invTexto(raw.nome, 60), attributes: _invAtributos(attrs) };
}

const _TIPOS_VALIDOS = Object.keys(TIPOS_INVENTARIO_INFO);

/**
 * Soma os bônus de CD Máxima (durabilidade) vindos de materiais/mods/raridade
 * de um item — usado tanto para exibição quanto para sincronizar com Ataques.
 */
function _calcularCdBonus(item) {
    let bonus = 0;
    [item.materialCabo?.attributes, item.materialBase?.attributes, item.mods, item.raridadeBonus].forEach(lista => {
        (lista || []).forEach(a => { if (a.attr === 'cd_max') bonus += parseInt(a.mod) || 0; });
    });
    return bonus;
}
window._calcularCdBonus = _calcularCdBonus;

/**
 * Converte um objeto bruto (de qualquer origem — migração legada, JSON
 * importado, ou um item novo em branco) num item de inventário válido,
 * com todos os campos presentes e sanitizados. Campos que não se aplicam à
 * categoria do item ficam com seus valores padrão, nunca undefined.
 */
function normalizarItemInventario(raw = {}, indiceFallback = 0) {
    const tipo = _TIPOS_VALIDOS.includes(raw.tipo) ? raw.tipo : 'outros';
    const opcoesRaridade = (typeof OPTIONS_RARIDADE !== 'undefined' ? OPTIONS_RARIDADE : []).map(o => o.v);
    const raridade = opcoesRaridade.includes(raw.raridade) ? raw.raridade : 'comum';

    return {
        id: _invTexto(raw.id, 60) || `item-${Date.now()}-${indiceFallback}`,
        nome: _invTexto(raw.nome, 100) || 'Item sem nome',
        tipo,
        subtipoArma: _invTexto(raw.subtipoArma, 40) || 'simples_uma_mao',
        atkTipo: _invTexto(raw.atkTipo, 30) || 'Corpo-a-Corpo',
        quantidade: _invNumero(raw.quantidade, { min: 1, max: 9999, padrao: 1 }),
        peso: _invNumero(raw.peso, { max: 9999 }),
        descricao: _invTexto(raw.descricao, 2000),
        equipado: Boolean(raw.equipado),
        favorito: Boolean(raw.favorito),
        raridade,
        raridadeBonus: _invAtributos(raw.raridadeBonus),
        materialCabo: _invNormalizarMaterial(raw.materialCabo, tipo),
        materialBase: _invNormalizarMaterial(raw.materialBase, tipo),
        mods: _invAtributos(raw.mods),
        cdAtual: _invNumero(raw.cdAtual, { max: 99999, padrao: 10 }),
        cdMax: _invNumero(raw.cdMax, { min: 1, max: 99999, padrao: 10 }),
        attrMod: _invTexto(raw.attrMod, 40) || 'nenhum',
        valMod: _invNumero(raw.valMod, { min: -999, max: 999 }),
        efeito: _invTexto(raw.efeito, 500),
        dano: _invTexto(raw.dano, 60),
        critico: _invTexto(raw.critico, 30),
        tipoDano: _invTexto(raw.tipoDano, 40),
        alcance: _invTexto(raw.alcance, 30) || 'toque',
        teste: _invTexto(raw.teste, 40),
        defesaBonus: _invNumero(raw.defesaBonus, { min: -999, max: 999 }),
        defesaPenalidade: _invNumero(raw.defesaPenalidade, { min: 0, max: 999 }),
    };
}
window.normalizarItemInventario = normalizarItemInventario;

/**
 * Migra o formato legado (chaves soltas inv_nome_<id>, inv_peso_<id>, ...)
 * para `dados.inventario = [item, ...]`. Idempotente: se `dados.inventario`
 * já é um array, não faz nada. NÃO apaga as chaves inv_*_<id> legadas —
 * ficam inertes no blob como rede de segurança contra perda de dados.
 */
function migrarInventarioLegado(dados) {
    if (Array.isArray(dados.inventario)) return dados;

    const ids = new Set();
    Object.keys(dados).forEach(k => {
        if (k.startsWith('inv_nome_')) ids.add(k.replace('inv_nome_', ''));
    });

    if (ids.size === 0) {
        dados.inventario = [];
        return dados;
    }

    const parseJSON = (v, fallback) => {
        try { return (v && typeof v === 'string' && v.startsWith('{')) ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
    };

    let itens = [...ids].map(id => {
        const raro = parseJSON(dados[`inv_raro_${id}`], { raridade: 'comum', attributes: [] });
        const mods = parseJSON(dados[`inv_mods_item_${id}`], { attributes: [] });
        const cabo = parseJSON(dados[`inv_cabo_${id}`], { nome: '', attributes: [] });
        const base = parseJSON(dados[`inv_base_${id}`], { nome: '', attributes: [] });

        return normalizarItemInventario({
            id: String(id),
            nome: dados[`inv_nome_${id}`],
            tipo: dados[`inv_cat_${id}`],
            subtipoArma: dados[`inv_tipo_${id}`],
            atkTipo: dados[`inv_atk_tipo_${id}`],
            quantidade: dados[`inv_qtd_${id}`],
            peso: dados[`inv_peso_${id}`],
            descricao: dados[`inv_desc_${id}`],
            equipado: dados[`inv_eqp_${id}`] === true || dados[`inv_eqp_${id}`] === 'true',
            raridade: typeof raro === 'string' ? raro : raro.raridade,
            raridadeBonus: (raro && raro.attributes) || [],
            materialCabo: cabo,
            materialBase: base,
            mods: (mods && mods.attributes) || [],
            cdAtual: dados[`inv_cd_atual_${id}`],
            cdMax: dados[`inv_cd_max_${id}`],
            attrMod: dados[`inv_attr_${id}`],
            valMod: dados[`inv_mod_${id}`],
            efeito: dados[`inv_efeito_${id}`],
            dano: dados[`inv_dano_${id}`],
            critico: dados[`inv_critico_${id}`],
            tipoDano: dados[`inv_tipo_dano_${id}`],
            alcance: dados[`inv_alcance_${id}`],
            teste: dados[`inv_teste_${id}`],
            defesaBonus: dados[`inv_defesa_bonus_${id}`],
            defesaPenalidade: dados[`inv_defesa_penalidade_${id}`],
        }, 0);
    });

    // Aplica a ordem manual salva (drag-and-drop) do formato antigo, se existir
    const chaveOrdem = typeof STORAGE_KEY_INVENTORY_ORDER !== 'undefined' ? STORAGE_KEY_INVENTORY_ORDER : 'inventory_order';
    let ordemSalva = null;
    try { ordemSalva = JSON.parse(localStorage.getItem(chaveOrdem)); } catch (e) { ordemSalva = null; }

    if (Array.isArray(ordemSalva) && ordemSalva.length) {
        itens.sort((a, b) => {
            let ia = ordemSalva.indexOf(a.id), ib = ordemSalva.indexOf(b.id);
            if (ia === -1) ia = 9999;
            if (ib === -1) ib = 9999;
            return ia - ib;
        });
    } else {
        itens.sort((a, b) => {
            if (a.equipado !== b.equipado) return a.equipado ? -1 : 1;
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });
    }

    dados.inventario = itens;
    return dados;
}
window.migrarInventarioLegado = migrarInventarioLegado;

/** Lê o inventário do localStorage, migrando o formato antigo automaticamente se necessário. */
function carregarInventario() {
    let dados = {};
    try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { dados = {}; }

    const jaEstavaMigrado = Array.isArray(dados.inventario);
    dados = migrarInventarioLegado(dados);
    if (!jaEstavaMigrado) localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

    return dados.inventario;
}
window.carregarInventario = carregarInventario;

/** Único ponto de escrita do inventário no localStorage. */
function persistirInventario(lista) {
    let dados = {};
    try { dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { dados = {}; }
    dados.inventario = lista;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}
window.persistirInventario = persistirInventario;
