/**
 * Orquestrador do Inventário
 * Centraliza as constantes e inicialização.
 * A lógica detalhada foi movida para inventario_ui.js, inventario_modais.js e inventario_carga.js.
 */

/**
 * Listas de opções compartilhadas para o Modal e UI
 */
const OPTIONS_ATTR = [
    { v: "nenhum", t: "-" }, { v: "forca", t: "FOR" }, { v: "destreza", t: "DES" },
    { v: "constituicao", t: "CON" }, { v: "inteligencia", t: "INT" }, { v: "sabedoria", t: "SAB" },
    { v: "carisma", t: "CAR" }, { v: "aura", t: "AUR" }, { v: "pv_max", t: "Vida Máx" },
    { v: "pm_max", t: "Mana Máx" }, { v: "defesa", t: "Defesa" }, { v: "movimentacao", t: "Movimento" },
    { v: "sanidade", t: "Sanidade" }, { v: "status_info", t: "Status" },
    { v: "dano", t: "Arma: Dano" }, { v: "critico", t: "Arma: Crítico" }, { v: "alcance", t: "Arma: Alcance" },
    { v: "acrobacia", t: "P: Acrobacia" }, { v: "adestramento", t: "P: Adestramento" },
    { v: "atuação", t: "P: Atuação" }, { v: "bloquear", t: "P: Bloquear" },
    { v: "conhecimento", t: "P: Conhecimento" }, { v: "corrompimento", t: "P: Corrompimento" },
    { v: "cura", t: "P: Cura" }, { v: "diplomacia", t: "P: Diplomacia" },
    { v: "enganação", t: "P: Enganação" }, { v: "fortitude", t: "P: Fortitude" },
    { v: "furtividade", t: "P: Furtividade" }, { v: "guerra", t: "P: Guerra" },
    { v: "iniciativa", t: "P: Iniciativa" }, { v: "intimidação", t: "P: Intimidação" },
    { v: "investigação", t: "P: Investigação" }, { v: "luta", t: "P: Luta" },
    { v: "manipulação", t: "P: Manipulação" }, { v: "misticismo", t: "P: Misticismo" },
    { v: "percepção", t: "P: Percepção" }, { v: "pilotagem", t: "P: Pilotagem" },
    { v: "pontaria", t: "P: Pontaria" }, { v: "reflexos", t: "P: Reflexos" },
    { v: "religião", t: "P: Religião" }, { v: "sobrevivência", t: "P: Sobrevivência" },
    { v: "vontade", t: "P: Vontade" }
];

const OPTIONS_ALCANCE = [
    { v: "toque", t: "Toque (0m)" }, { v: "curto", t: "Curto (5m)" },
    { v: "medio", t: "Médio (15m)" }, { v: "longo", t: "Longo (30m)" },
    { v: "longo_plus", t: "Longo+ (45m)" }, { v: "planetario", t: "Planetário (95m)" },
    { v: "estelar", t: "Estelar (150m)" }, { v: "universal", t: "Universal (360m)" },
    { v: "multiversal", t: "Multiversal (1km)" }
];

const OPTIONS_RARIDADE = [
    { v: "comum", t: "Comum" },
    { v: "incomum", t: "Incomum" },
    { v: "raro", t: "Raro" },
    { v: "epico", t: "Épico" },
    { v: "mitico", t: "Mítico" },
    { v: "especial", t: "Relíquia" }
];
document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // Identifica chaves de itens (ex: inv_nome_123)
    const itemIds = new Set();
    Object.keys(salvo).forEach(key => {
        if (key.startsWith('inv_nome_')) {
            itemIds.add(key.replace('inv_nome_', ''));
        }
    });

    if (itemIds.size > 0) {
        itemIds.forEach(id => {
            adicionarItemUI(
                salvo[`inv_nome_${id}`],
                salvo[`inv_peso_${id}`],
                salvo[`inv_qtd_${id}`],
                salvo[`inv_desc_${id}`],
                salvo[`inv_cat_${id}`] || "outros",
                salvo[`inv_raro_${id}`] || "comum",
                salvo[`inv_tipo_${id}`] || "simples_uma_mao",
                id,
                salvo[`inv_eqp_${id}`] || false,
                salvo[`inv_attr_${id}`] || "nenhum",
                salvo[`inv_mod_${id}`] || 0,
                salvo[`inv_alcance_${id}`] || "toque",
                salvo[`inv_dano_${id}`] || "", // Novo campo
                salvo[`inv_defesa_bonus_${id}`] || 0, // Novo campo
                salvo[`inv_efeito_${id}`] || "", // Novo campo
                salvo[`inv_cabo_${id}`] || "{}", // Proteção contra string vazia
                salvo[`inv_base_${id}`] || "{}", // Proteção contra string vazia
                salvo[`inv_defesa_penalidade_${id}`] || 0,
                salvo[`inv_mods_item_${id}`] || "{}",
                salvo[`inv_critico_${id}`] || "",
                salvo[`inv_tipo_dano_${id}`] || "",
                salvo[`inv_teste_${id}`] || ""
            );
            atualizarEstiloBonus(id);
            atualizarEstiloRaridade(id); // Garante que a raridade visual seja aplicada no carregamento
        });
    }

    ordenarItens();
    filtrarItens();
    atualizarTudo(); // Chama atualizarTudo uma única vez após carregar tudo
});