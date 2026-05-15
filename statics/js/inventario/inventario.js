/**
 * Orquestrador do Inventário
 * Centraliza as constantes e inicialização.
 * A lógica detalhada foi movida para inventario_ui.js, inventario_modais.js e inventario_carga.js.
 */

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
                salvo[`inv_teste_${id}`] || "",
                salvo[`inv_atk_tipo_${id}`] || "Corpo-a-Corpo"
            );
            atualizarEstiloBonus(id);
            atualizarEstiloRaridade(id); // Garante que a raridade visual seja aplicada no carregamento
        });
    }

    ordenarItens();
    filtrarItens();
    atualizarTudo(); // Chama atualizarTudo uma única vez após carregar tudo
});