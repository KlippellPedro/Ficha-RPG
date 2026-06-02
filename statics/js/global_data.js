/**
 * Gerenciamento de Dados - Import, Export, Backup e DLCs
 */

window.exportarFicha = function () {
    atualizarTudo();
    const pacote = {
        dados: JSON.parse(localStorage.getItem(STORAGE_KEY)),
        historico: JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"),
        habilidadesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_HABILIDADES_ORDER) || "[]"),
        poderesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_PODERES_ORDER) || "[]"),
        magiasOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_MAGIAS_ORDER) || "[]"),
        ataquesOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_ATAQUES_ORDER) || "[]"),
        inventarioOrder: JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY_ORDER) || "[]"),
        notasOrder: JSON.parse(localStorage.getItem(window.STORAGE_KEY_NOTAS_ORDER) || "[]"),
        exportadoEm: new Date().toLocaleString('pt-BR'),
        versaoSistema: "2.5"
    };
    const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ficha_${(document.getElementById('nome')?.value || 'personagem').toLowerCase()}.json`;
    a.click();
    showNotification("Ficha exportada!", "success");
}

window.importarFicha = function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imp = JSON.parse(e.target.result);
            const dados = imp.dados || imp;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            if (imp.historico) localStorage.setItem(HISTORY_KEY, JSON.stringify(imp.historico));
            if (imp.habilidadesOrder) localStorage.setItem(STORAGE_KEY_HABILIDADES_ORDER, JSON.stringify(imp.habilidadesOrder));
            if (imp.poderesOrder) localStorage.setItem(STORAGE_KEY_PODERES_ORDER, JSON.stringify(imp.poderesOrder));
            if (imp.magiasOrder) localStorage.setItem(STORAGE_KEY_MAGIAS_ORDER, JSON.stringify(imp.magiasOrder));
            if (imp.ataquesOrder) localStorage.setItem(STORAGE_KEY_ATAQUES_ORDER, JSON.stringify(imp.ataquesOrder));
            if (imp.notasOrder) localStorage.setItem(window.STORAGE_KEY_NOTAS_ORDER, JSON.stringify(imp.notasOrder));
            if (imp.inventarioOrder) localStorage.setItem(STORAGE_KEY_INVENTORY_ORDER, JSON.stringify(imp.inventarioOrder));
            showNotification("Ficha importada!", "success");
            setTimeout(() => location.reload(), 1000);
        } catch (err) { showNotification("Arquivo inválido.", "error"); }
    };
    reader.readAsText(file);
}

window.realizarBackupAutomatico = function () {
    atualizarTudo();
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return;
    const pacote = {
        dados: JSON.parse(dados),
        historico: JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"),
        backupEm: new Date().toLocaleString('pt-BR'),
        tipo: "automatico"
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(pacote));
}

window.isDlcAtiva = (id) => {
    if (!id) return true;
    let active = JSON.parse(localStorage.getItem(DLCS_KEY)) || ['atual'];
    return active.includes(id);
};

window.toggleDlc = (input) => {
    let active = JSON.parse(localStorage.getItem(DLCS_KEY)) || ['atual'];
    if (input.checked) { if (!active.includes(input.value)) active.push(input.value); }
    else { active = active.filter(i => i !== input.value); }
    localStorage.setItem(DLCS_KEY, JSON.stringify(active));
    if (typeof initRaces === 'function') initRaces();
    atualizarTudo();
    showNotification("DLCs atualizadas!", "info", 2000);
};

window.initDlcs = () => {
    const container = document.getElementById('dlc-selector-container');
    if (!container) return;
    let active = JSON.parse(localStorage.getItem(DLCS_KEY)) || ['atual'];
    const dlcs = [{ id: 'atual', n: 'Atual' }, { id: 'normalidade', n: 'Normalidade' }, { id: 'passado', n: 'Passado' }, { id: 'futuro', n: 'Futuro' }, { id: 'olimpo', n: 'Olimpo' }];
    container.innerHTML = `<label class="dlc-label">DLCs</label><div class="dlc-checkbox-grid">
        ${dlcs.map(d => `<label class="dlc-checkbox-item">
            <input type="checkbox" value="${d.id}" ${active.includes(d.id) ? 'checked' : ''} onchange="toggleDlc(this)">
            <span>${d.n}</span>
        </label>`).join('')}</div>`;
};