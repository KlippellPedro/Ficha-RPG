/**
 * Lógica para gerenciar as Condições Ativas da Ficha
 */

function initCondicoes() {
    renderCondicoes();
}

function abrirModalNovaCondicao() {
    const modal = document.getElementById('modal-nova-condicao');
    if (modal) {
        document.getElementById('condicao-nome').value = '';
        document.getElementById('condicao-desc').value = '';
        document.getElementById('condicao-penalidade').value = '';
        modal.showModal();
    }
}

function fecharModalNovaCondicao() {
    const modal = document.getElementById('modal-nova-condicao');
    if (modal) {
        modal.classList.add('modal-closing');
        setTimeout(() => {
            modal.close();
            modal.classList.remove('modal-closing');
        }, 150); // Tempo da animação de saída
    }
}

function salvarNovaCondicao() {
    const nome = document.getElementById('condicao-nome').value.trim();
    const desc = document.getElementById('condicao-desc').value.trim();
    const pen = document.getElementById('condicao-penalidade').value.trim();

    if (!nome) {
        alert("O nome da condição é obrigatório.");
        return;
    }

    const jsonInput = document.getElementById('condicoes_ativas_json');
    let condicoes = [];
    try {
        condicoes = JSON.parse(jsonInput.value || "[]");
    } catch (e) { condicoes = []; }

    condicoes.push({
        id: Date.now().toString(),
        nome: nome,
        descricao: desc,
        penalidade: pen
    });

    jsonInput.value = JSON.stringify(condicoes);
    
    // Atualizar no localStorage disparando atualizarTudo (que chama engineSalvarStatus)
    if (typeof atualizarTudo === 'function') {
        atualizarTudo();
    }
    
    renderCondicoes();
    fecharModalNovaCondicao();
}

function removerCondicao(idToRemove) {
    const jsonInput = document.getElementById('condicoes_ativas_json');
    let condicoes = [];
    try {
        condicoes = JSON.parse(jsonInput.value || "[]");
    } catch (e) { condicoes = []; }

    condicoes = condicoes.filter(c => c.id !== idToRemove);
    jsonInput.value = JSON.stringify(condicoes);
    
    if (typeof atualizarTudo === 'function') {
        atualizarTudo();
    }
    
    renderCondicoes();
}

function renderCondicoes() {
    const jsonInput = document.getElementById('condicoes_ativas_json');
    const list = document.getElementById('condicoes-list');
    
    if (!jsonInput || !list) return;

    let condicoes = [];
    try {
        condicoes = JSON.parse(jsonInput.value || "[]");
    } catch (e) { condicoes = []; }

    list.innerHTML = '';
    
    if (condicoes.length === 0) {
        list.innerHTML = '<span style="color: #666; font-size: 0.8rem; font-style: italic; align-self: center; margin-top: 10px;">Nenhuma condição ativa</span>';
        return;
    }

    condicoes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'condicao-card';
        item.style.cssText = 'background: rgba(255, 68, 68, 0.1); border: 1px solid var(--primary-color); border-radius: 6px; padding: 10px; position: relative; animation: popIn 0.3s ease;';
        
        let descHtml = c.descricao ? `<div style="font-size: 0.75rem; color: #ccc; margin-top: 4px;">${c.descricao}</div>` : '';
        let penHtml = c.penalidade ? `<div style="font-size: 0.7rem; color: var(--primary-color); margin-top: 6px; font-weight: bold;">[ ${c.penalidade} ]</div>` : '';

        item.innerHTML = `
            <div style="font-weight: bold; color: white; padding-right: 25px;">${c.nome}</div>
            ${descHtml}
            ${penHtml}
            <button type="button" onclick="removerCondicao('${c.id}')" style="position: absolute; top: 5px; right: 5px; background: transparent; border: none; color: var(--primary-color); font-size: 1.2rem; cursor: pointer; opacity: 0.7; transition: 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
        `;
        list.appendChild(item);
    });
}

// Hook na inicialização da ficha para dar tempo de carregar os dados
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderCondicoes, 500); 
});
