/**
 * Orquestrador das Notas
 */

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const indices = Object.keys(salvo)
        .filter(k => k.startsWith('nota_titulo_'))
        .map(k => k.replace('nota_titulo_', ''))
        .sort((a, b) => a - b);

    indices.forEach(idx => {
        adicionarNotaUI(salvo[`nota_titulo_${idx}`], salvo[`nota_tipo_${idx}`], salvo[`nota_desc_${idx}`], idx, salvo[`nota_campos_${idx}`], salvo[`nota_fav_${idx}`] === true, salvo[`nota_data_${idx}`] || "");
    });

    atualizarTudo();
    ordenarNotas();
    filtrarNotas();

    // Adiciona o ouvinte para a barra de pesquisa funcionar em tempo real
    document.getElementById('search-nota')?.addEventListener('input', filtrarNotas);
    document.getElementById('search-nota-desc')?.addEventListener('input', filtrarNotas);
});