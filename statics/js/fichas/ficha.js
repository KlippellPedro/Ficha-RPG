/**
 * Orquestrador da Ficha de Personagem
 * Este arquivo coordena a visibilidade e a inicialização.
 * A lógica detalhada foi movida para ficha_classes.js, ficha_racas.js, ficha_status.js e ficha_efeitos.js.
 */

/**
 * Centraliza a verificação de visibilidade de seções especiais baseadas na classe
 */
function verificarVisibilidadeClasses() {
    const ambientTypes = [];
    const visibilityMap = { 'section-extras': false, 'section-avatar': false, 'section-lutador': false, 'section-amante': false, 'section-deus': false, 'section-diplomata': false, 'section-amigo': false, 'section-contrabandista': false, 'section-ceifeiro': false, 'section-demonio': false, 'section-anjo': false };
    document.querySelectorAll('[id^="class_name_"]').forEach(select => {
        if (select.value === 'ceifeiro_almas') ambientTypes.push('soul');
        if (select.value === 'anjo') ambientTypes.push('feather');
        if (select.value === 'demonio') ambientTypes.push('ember');
        const data = CLASSES_DATA[select.value];
        if (data) {
            if (data.showExtras) visibilityMap['section-extras'] = true;
            if (data.showAvatar) visibilityMap['section-avatar'] = true;
            if (data.showLutador) visibilityMap['section-lutador'] = true;
            if (data.showAmante) visibilityMap['section-amante'] = true;
            if (data.showDeus) visibilityMap['section-deus'] = true;
            if (data.showDiplomata) visibilityMap['section-diplomata'] = true;
            if (data.showAmigo) visibilityMap['section-amigo'] = true;
            if (data.showContrabandista) visibilityMap['section-contrabandista'] = true;
            if (data.showCeifeiro) visibilityMap['section-ceifeiro'] = true;
            if (data.showDemonio) visibilityMap['section-demonio'] = true;
            if (data.showAnjo) visibilityMap['section-anjo'] = true;
        }
    });

    // Lógica de Subclasse por linha (Cientista Lvl 5+)
    document.querySelectorAll('.class-row').forEach(row => {
        const nameSel = row.querySelector('[id^="class_name_"]');
        const lvlInp = row.querySelector('[id^="class_lvl_"]');
        const subInput = row.querySelector('[id^="class_sub_"]');
        const index = nameSel?.id.split('_').pop();

        if (nameSel && lvlInp && subInput) {
            const isCientista = nameSel.value === 'cientista';
            const lvl = parseInt(lvlInp.value) || 0;

            if (isCientista) {
                // Se o nível for resetado para baixo de 5, limpamos a subclasse salva
                if (lvl < 5 && subInput.value !== "") {
                    subInput.value = "";
                }

                const hasSubclass = subInput.value !== '';
                formatarNomeClasseCientista(nameSel, subInput.value);

                // Dispara o modal automaticamente ao atingir nível 5 sem subclasse
                if (lvl >= 5 && !hasSubclass && currentCientistaIndex === null) {
                    abrirModalCientistaSubclasse(index);
                }

                if (lvl >= 5 && hasSubclass) {
                    row.classList.add('cientista-lvl5-row');
                } else {
                    row.classList.remove('cientista-lvl5-row');
                }
            }
        }
    });

    // Gerencia o estilo de dualidade no container principal
    const container = document.querySelector('.container');
    if (container) {
        const isDual = ambientTypes.includes('feather') && ambientTypes.includes('ember');
        container.classList.toggle('container-dual-alignment', isDual);
    }

    // Ativa ou desativa os efeitos ambientes dinâmicos
    gerenciarEfeitosAmbientes(ambientTypes);

    // Se for Ceifeiro de Almas, não permite adicionar outras classes (esconde o botão)
    const btnAdd = document.querySelector('.btn-add-class');
    if (btnAdd) btnAdd.style.display = ambientTypes.includes('soul') ? 'none' : 'block';

    for (const [id, visible] of Object.entries(visibilityMap)) {
        const el = document.getElementById(id);
        if (el) {
            // Mantém layout flex para extras e grid para o resto das seções de cabeçalho
            if (id === 'section-extras') el.style.display = visible ? 'flex' : 'none';
            else el.style.display = visible ? 'grid' : 'none';
        }
    }
}


// Inicialização da Ficha
document.addEventListener('DOMContentLoaded', () => {
    // Popular seletor de Raças
    const racaSelect = document.getElementById('raca');
    if (racaSelect && typeof RACAS_DATA !== 'undefined') {
        racaSelect.innerHTML = Object.keys(RACAS_DATA).map(key =>
            `<option value="${key}">${RACAS_DATA[key].nome}</option>`
        ).join('');

        // Força a restauração da raça salva imediatamente após popular as opções
        const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (salvo && salvo.raca) {
            racaSelect.value = salvo.raca;
        }
    }

    // Popular seletores de raças híbridas
    const h1 = document.getElementById('hibrido_raca_1');
    const h2 = document.getElementById('hibrido_raca_2');
    if (h1 && h2 && typeof RACAS_DATA !== 'undefined') {
        const hybridOptions = Object.keys(RACAS_DATA)
            .filter(key => key !== 'hibrido' && key !== 'nenhuma')
            .map(key => `<option value="${key}">${RACAS_DATA[key].nome}</option>`)
            .join('');
        h1.innerHTML = hybridOptions;
        h2.innerHTML = hybridOptions;

        // Restaura os valores salvos para os seletores híbridos
        const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (salvo && salvo.hibrido_raca_1) h1.value = salvo.hibrido_raca_1;
        if (salvo && salvo.hibrido_raca_2) h2.value = salvo.hibrido_raca_2;
    }

    let salvo = null;
    try {
        salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) { }

    if (salvo) {
        // Busca todas as classes salvas e recria na ordem correta
        const classesEncontradas = Object.keys(salvo)
            .filter(k => k.startsWith('class_name_'));

        // Ordenação numérica para evitar que class_name_10 venha antes de class_name_2
        classesEncontradas.sort((a, b) => {
            return parseInt(a.split('_').pop()) - parseInt(b.split('_').pop());
        });

        if (classesEncontradas.length > 0) {
            classesEncontradas.forEach(key => {
                const idx = key.split('_').pop();
                adicionarClasseUI(salvo[key], salvo[`class_lvl_${idx}`], parseInt(idx), salvo[`class_sub_${idx}`]);

                // Garante que o estado visual e limites de nível sejam aplicados no carregamento
                const selectEl = document.getElementById(`class_name_${idx}`);
                if (selectEl) atualizarEstiloClasse(selectEl);
            });
        }
    } else { adicionarClasseUI(); } // Só adiciona se for a primeira vez absoluta (sem localStorage)
    atualizarTudo(); // Chama atualizarTudo uma única vez após carregar tudo
});