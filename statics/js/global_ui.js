/**
 * UI Engine - Atualização de Barras e Tooltips
 */

window.aplicarBonusVisuais = function (bonusItens, dadosObj, breakdown = null) {
    ['movimentacao', 'defesa', 'status_info'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const bonus = bonusItens[id] || 0;
        el.style.color = bonus > 0 ? '#4ade80' : (bonus < 0 ? '#ef4444' : 'var(--text-main)');
    });
}

window.atualizarBarras = function (bonusItens = {}, dadosObj = null) {
    const stats = [
        { atual: 'pv_atual', max: 'pv_max', bar: 'bar-pv' },
        { atual: 'pm_atual', max: 'pm_max', bar: 'bar-pm' },
        { atual: 'sanidade_atual', max: 'sanidade_max', bar: 'bar-sanidade' },
        { atual: 'xp_atual', max: 'xp_max', bar: 'bar-xp' },
    ];
    const dados = dadosObj || (JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    const isCorrompido = dados.raca === "corrompido" || dados.hibrido_raca_1 === "corrompido" || dados.hibrido_raca_2 === "corrompido";

    stats.forEach(s => {
        const elAtual = document.getElementById(s.atual);
        const elMax = document.getElementById(s.max);
        const current = elAtual ? (parseInt(elAtual.value) || 0) : (parseInt(dados[s.atual]) || 0);
        let max = parseInt(elMax?.tagName === 'INPUT' ? elMax.value : elMax?.innerText) || parseInt(dados[s.max]) || 1;
        if (!elMax && bonusItens[s.max]) max += bonusItens[s.max];

        const barEl = document.getElementById(s.bar);
        if (barEl) {
            const pct = Math.min(100, Math.max(0, (current / max) * 100));
            barEl.style.width = pct + "%";
            if (s.bar === 'bar-pv') {
                barEl.classList.toggle('pv-corrompido-color', isCorrompido);
                barEl.classList.toggle('pv-color', !isCorrompido);
            }
            if (s.bar === 'bar-xp') {
                barEl.classList.toggle('xp-near-level-up', pct >= 90);
                barEl.title = `Progresso: ${current}/${max} (Faltam ${Math.max(0, max - current)} XP)`;
            }
        }
    });
}