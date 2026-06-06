/**
 * UI Engine - Atualização de Barras e Tooltips
 */

window.aplicarBonusVisuais = function (bonusItens, dadosObj, breakdown = null) {
    // Campos que ficam coloridos quando têm bônus de item ativos
    ['movimentacao', 'defesa', 'status_info', 'sanidade_max', 'invocacoes_max'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const bonus = bonusItens[id] || 0;
        el.style.color = bonus > 0 ? '#4ade80' : (bonus < 0 ? '#ef4444' : 'var(--text-main)');
        if (bonus !== 0) {
            el.title = `Base: ${parseInt(el.value || 0) - bonus} | Bônus de Item: ${bonus > 0 ? '+' : ''}${bonus} | Total: ${el.value}`;
        }
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

    // Stats que não têm função própria de cálculo: o bonus de item precisa ser somado manualmente
    const statsComCalculo = new Set(['pv_max', 'pm_max']); // Calculados por atualizarVida/atualizarMana

    stats.forEach(s => {
        const elAtual = document.getElementById(s.atual);
        const elMax = document.getElementById(s.max);
        const current = elAtual ? (parseInt(elAtual.value) || 0) : (parseInt(dados[s.atual]) || 0);
        let max = parseInt(elMax?.tagName === 'INPUT' ? elMax.value : elMax?.innerText) || parseInt(dados[s.max]) || 1;
        // Aplica bônus de item para stats sem função de cálculo própria (ex: sanidade_max)
        if (!statsComCalculo.has(s.max)) {
            if (bonusItens[s.max]) max += bonusItens[s.max];
            // Soma ajustes personalizados (buffs/debuffs manuais fora de poderes/itens/raça)
            if (s.max === 'sanidade_max' && typeof somarAjustesManuais === 'function') {
                max += somarAjustesManuais(dados, 'sanidade_ajustes_manuais').total;
            }
        }

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