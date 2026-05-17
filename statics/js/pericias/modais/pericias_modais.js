/**
 * Centralização de modais e interface de ajuda da página de Perícias
 */

/**
 * Abre o modal de ajuda detalhando o cálculo da perícia e os valores de treinamento
 */
function mostrarAjudaSkill(skillSlug) {
    const bonusInput = document.getElementById(`skill_bonus_${skillSlug}`);
    const display = bonusInput?.closest('.skill-row')?.querySelector('.skill-total');

    if (!display) return;

    const modal = document.getElementById('modal-calc-ajuda');
    const title = document.getElementById('modal-calc-ajuda-title');
    const body = document.getElementById('modal-calc-ajuda-body');

    if (!modal || !title || !body) {
        console.error("Erro Crítico: O Modal de Ajuda não foi encontrado no HTML desta página.");
        return;
    }

    const row = display.closest('.skill-row');
    const skillName = row.querySelector('.skill-name')?.textContent || row.querySelector('.skill-name-input')?.value || "Perícia";
    title.innerText = `Cálculo: ${skillName}`;

    const fullTitle = display.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Detalhes não encontrados.";
    const items = breakdownPart.split(' | ');

    // Pega o nível atual para mostrar a tabela de treino dinâmica
    const nivel = parseInt(document.getElementById('nivel')?.value) || 1;

    const formulaHtml = `
        <div style="margin-bottom: 12px; background: rgba(255,68,68,0.1); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,68,68,0.3); font-size: 0.8rem; color: #ff4444; text-align: center;">
            <strong>Fórmula:</strong> Atributo + Treino + Itens/Poderes + Manual
        </div>
    `;

    const treinoTabela = `
        <div style="margin-top: 15px; border-top: 1px dashed rgba(255,68,68,0.3); padding-top: 10px;">
            <label style="color: #ff4444; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Referência de Treino (Nível ${nivel}):</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px; font-size: 0.8rem; color: #bbb;">
                <span>• Nenhum: <strong>+0</strong></span>
                <span>• Treinado: <strong>+${Math.floor(nivel / 2)}</strong> (lvl/2)</span>
                <span>• Profissional: <strong>+${Math.floor(nivel / 2) + 4}</strong> (lvl/2 +4)</span>
                <span>• Mestre: <strong>+${nivel + 4}</strong> (lvl +4)</span>
                <span>• Ancião: <strong>+${nivel + 6}</strong> (lvl +6)</span>
            </div>
        </div>
    `;

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
            ${formulaHtml}
            ${items.map(item => {
        const colored = item
            .replace(/(\+\d+)/g, '<span style="color: #4ade80; font-weight: bold;">$1</span>')
            .replace(/(\-\d+)/g, '<span style="color: #ff5f5f; font-weight: bold;">$1</span>');
        return `<div style="padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid #ff4444; font-size: 0.85rem;">${colored}</div>`;
    }).join('')}
            ${treinoTabela}
            <div style="margin-top: 10px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 4px; color: #ff4444; font-weight: bold; font-size: 1.1rem; text-align: center;">Total: ${display.innerText}</div>
        </div>
    `;

    modal.style.display = 'flex';
}
