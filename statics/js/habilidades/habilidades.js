/**
 * Lógica para gerenciar a lista dinâmica de habilidades
 */

/**
 * Função para "usar" uma habilidade, subtraindo o custo em PM da mana atual.
 */
function usarHabilidade(index) {
    const custoStr = document.getElementById(`hab_custo_${index}`).value.trim();
    const tipoCusto = document.getElementById(`hab_tipo_custo_${index}`).value;
    if (!custoStr || custoStr === "0") {
        showNotification("Esta habilidade não possui um custo numérico definido.", 'warning');
        return;
    }
    const custo = parseInt(custoStr);
    if (isNaN(custo) || custo <= 0) {
        showNotification("Custo inválido. Por favor, insira um número positivo.", 'warning'); //
        return;
    }
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (tipoCusto === "PM") {
        let recursoAtual = parseInt(dados.pm_atual) || 0;
        let recursoMax = parseInt(dados.pm_max) || 0;
        if (recursoAtual < custo) return showNotification(`Mana insuficiente! Você tem ${recursoAtual} PM, mas precisa de ${custo} PM.`, 'error');
        recursoAtual -= custo;
        dados.pm_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PM subtraídos. Mana atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "PV") {
        let recursoAtual = parseInt(dados.pv_atual) || 0;
        let recursoMax = parseInt(dados.pv_max) || 0;
        if (recursoAtual < custo) return showNotification(`Vida insuficiente! Você tem ${recursoAtual} PV, mas precisa de ${custo} PV.`, 'error');
        recursoAtual -= custo;
        dados.pv_atual = recursoAtual;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        registrarHistorico(document.getElementById(`hab_nome_${index}`).value || "Habilidade", custo, tipoCusto);
        showNotification(`Habilidade usada! ${custo} PV subtraídos. Vida atual: ${recursoAtual}/${recursoMax}.`, 'success');
        atualizarTudo();
    } else if (tipoCusto === "Outro") {
        showNotification(`Habilidade custa ${custo} de um recurso "Outro". Gerencie isso manualmente.`, 'info');
        atualizarTudo(); // Apenas para garantir que a UI seja atualizada
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (salvo) {
        const ids = new Set();
        Object.keys(salvo).forEach(k => { if (k.startsWith('hab_nome_')) ids.add(k.replace('hab_nome_', '')); });
        Array.from(ids).sort().forEach(idx => {
            adicionarHabilidadeUI(salvo[`hab_nome_${idx}`], salvo[`hab_tipo_${idx}`], salvo[`hab_custo_${idx}`], salvo[`hab_tipo_custo_${idx}`], salvo[`hab_desc_${idx}`], parseInt(idx), salvo[`hab_duracao_${idx}`], salvo[`hab_alcance_${idx}`], salvo[`hab_acao_${idx}`], salvo[`hab_classe_${idx}`], salvo[`hab_mods_${idx}`]);
        });
    }
    atualizarFiltroHabilidadesUI();
    atualizarTudo();
    filtrarHabilidades();
});
