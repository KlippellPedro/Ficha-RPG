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

    if (!modal || !title || !body) return;

    const row = display.closest('.skill-row');
    const skillName = row.querySelector('.skill-name')?.textContent || row.querySelector('.skill-name-input')?.value || "Perícia";
    title.innerText = `Cálculo: ${skillName}`;

    const fullTitle = display.title || "";
    const breakdownPart = fullTitle.includes('(') ? fullTitle.substring(fullTitle.indexOf('(') + 1, fullTitle.lastIndexOf(')')) : "Detalhes não encontrados.";
    const items = breakdownPart.split(' | ');

    // Pega o nível atual para mostrar a tabela de treino dinâmica
    const nivel = parseInt(document.getElementById('nivel')?.value) || 1;

    const formulaHtml = `
        <div style="margin-bottom: 12px; background: var(--primary-glow); padding: 10px; border-radius: 4px; border: 1px solid var(--primary-glow); font-size: 0.8rem; color: var(--primary-color); text-align: center;">
            <strong>Fórmula:</strong> Atributo + Treino + Itens/Poderes + Manual
        </div>
    `;

    const treinoTabela = `
        <div style="margin-top: 15px; border-top: 1px dashed var(--primary-glow); padding-top: 10px;">
            <label style="color: var(--primary-color); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Referência de Treino (Nível ${nivel}):</label>
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
            .replace(/Base: (\d+)/g, '<span class="calc-label-base">Base: $1</span>')
            .replace(/(\+\d+)/g, '<span class="calc-label-bonus-pos">$1</span>')
            .replace(/(\-\d+)/g, '<span class="calc-label-bonus-neg">$1</span>');
        return `<div style="padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; border-left: 3px solid var(--primary-color); font-size: 0.85rem;">${colored}</div>`;
    }).join('')}
            ${treinoTabela}
            <div class="calc-label-total" style="background: var(--primary-glow); border-radius: 4px; padding: 12px; text-align: center; border-top: none;">Total: ${display.innerText}</div>
        </div>
    `;

    modal.style.display = 'flex';
}
