/**
 * Lógica de Carga e Peso
 */
function atualizarCarga(infoAttr, dados) {
    const forcaVal = infoAttr.totals['forca'] || parseInt(dados.forca) || 10;
    const cargaMax = forcaVal * 3;

    let cargaAtual = 0;
    (dados.inventario || []).forEach(item => {
        cargaAtual += (item.peso || 0) * (item.quantidade || 0);
    });

    const displayAtual = document.getElementById('display-carga-atual');
    const displayMax = document.getElementById('display-carga-max');
    const bar = document.getElementById('weight-bar-inner');
    const warning = document.getElementById('weight-warning');

    if (displayAtual) displayAtual.innerText = cargaAtual.toFixed(1);
    if (displayMax) displayMax.innerText = cargaMax.toFixed(1);

    const ratio = (cargaAtual / cargaMax);
    const porcentagem = Math.min(100, ratio * 100);

    if (bar) {
        bar.style.width = porcentagem + "%";
        if (ratio > 1.0) {
            bar.style.background = "var(--danger)";
            bar.classList.add('pulse-critical-bar');
        } else if (ratio > 0.8) {
            bar.style.background = "#f59e0b";
            bar.classList.remove('pulse-critical-bar');
        } else {
            bar.style.background = "linear-gradient(90deg, #ff4444, #4ade80)";
            bar.classList.remove('pulse-critical-bar');
        }
    }
    if (warning) warning.style.display = ratio > 1.0 ? 'block' : 'none';

    // Shake visual no painel de peso quando excede
    const weightStats = document.querySelector('.weight-stats');
    if (weightStats) {
        if (ratio > 1.0) {
            if (!weightStats.classList.contains('weight-overloaded')) {
                weightStats.classList.add('weight-overloaded');
                // Re-dispara a animação de shake
                weightStats.classList.remove('weight-shake');
                void weightStats.offsetWidth; // reflow
                weightStats.classList.add('weight-shake');
            }
        } else {
            weightStats.classList.remove('weight-overloaded', 'weight-shake');
        }
    }
}