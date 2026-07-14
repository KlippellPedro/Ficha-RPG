/** Controle do editor detalhado de ataques. */
let atkSendoEditadoIdx = null;

function criarCampoModalAtaque({ label, id, value = "", type = "text", placeholder = "", options = [] }) {
    const field = document.createElement('label');
    field.className = 'input-group atk-modal-field';

    const caption = document.createElement('span');
    caption.textContent = label;
    field.appendChild(caption);

    let control;
    if (type === 'select') {
        control = document.createElement('select');
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            control.appendChild(option);
        });
    } else if (type === 'textarea') {
        control = document.createElement('textarea');
        control.rows = 7;
    } else {
        control = document.createElement('input');
        control.type = type;
    }

    control.id = id;
    control.className = 'inv-input';
    control.placeholder = placeholder;
    control.value = value ?? "";
    field.appendChild(control);
    return field;
}

function abrirModalAtk(index) {
    const nomeInput = document.getElementById(`atk_nome_${index}`);
    const modalEl = document.getElementById('modal-ataque');
    const titleEl = document.getElementById('modal-ataque-title');
    const bodyEl = document.getElementById('modal-ataque-body');
    if (!nomeInput || !modalEl || !titleEl || !bodyEl) return;

    atkSendoEditadoIdx = String(index);
    const values = {
        nome: nomeInput.value,
        teste: document.getElementById(`atk_teste_${index}`)?.value || "",
        dano: document.getElementById(`atk_dano_${index}`)?.value || "",
        critico: document.getElementById(`atk_critico_${index}`)?.value || "",
        alcance: document.getElementById(`atk_alcance_${index}`)?.value || "",
        tipo: document.getElementById(`atk_tipo_${index}`)?.value || "Outro",
        desc: document.getElementById(`atk_desc_${index}`)?.value || "",
        tipoDano: document.getElementById(`atk_tipo_dano_${index}`)?.value || ""
    };

    modalEl.classList.add('ataque-details-dialog');
    modalEl.setAttribute('aria-labelledby', 'modal-ataque-title');
    const modalContent = modalEl.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.maxWidth = '880px';
        modalContent.style.width = 'min(92vw, 880px)';
    }
    titleEl.textContent = values.nome ? `Editar — ${values.nome}` : "Editar ataque";

    const intro = document.createElement('div');
    intro.className = 'atk-modal-intro';
    const kicker = document.createElement('span');
    kicker.className = 'page-section-eyebrow';
    kicker.textContent = "Configuração de combate";
    const introText = document.createElement('p');
    introText.textContent = "Ajuste a origem do teste, a expressão de dano e as propriedades usadas durante a cena.";
    intro.append(kicker, introText);

    const grid = document.createElement('div');
    grid.className = 'atk-modal-grid';
    grid.append(
        criarCampoModalAtaque({ label: "Tipo de ataque", id: "modal_atk_tipo", value: values.tipo, type: "select", options: TIPOS_ATAQUE }),
        criarCampoModalAtaque({ label: "Perícia ou teste", id: "modal_atk_teste", value: values.teste, placeholder: "Ex.: Luta" }),
        criarCampoModalAtaque({ label: "Dano", id: "modal_atk_dano", value: values.dano, placeholder: "Ex.: 1d8 + FOR" }),
        criarCampoModalAtaque({ label: "Tipo de dano", id: "modal_tipo_dano", value: values.tipoDano, placeholder: "Ex.: Cortante" }),
        criarCampoModalAtaque({ label: "Crítico", id: "modal_atk_critico", value: values.critico, placeholder: "Ex.: 19/x3" }),
        criarCampoModalAtaque({ label: "Alcance", id: "modal_atk_alcance", value: values.alcance, placeholder: "Ex.: Curto" })
    );

    const description = criarCampoModalAtaque({
        label: "Notas e efeitos especiais",
        id: "modal_atk_desc",
        value: values.desc,
        type: "textarea",
        placeholder: "Descreva condições, custos, munição ou efeitos adicionais..."
    });
    description.classList.add('atk-modal-description');

    bodyEl.className = 'modal-body atk-modal-body';
    bodyEl.replaceChildren(intro, grid, description);

    const footer = modalEl.querySelector('.modal-footer');
    if (footer) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn-modal-secondary';
        cancelButton.textContent = "Cancelar";
        cancelButton.addEventListener('click', fecharModalAtk);

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'btn-save-modal';
        saveButton.textContent = "Salvar alterações";
        saveButton.addEventListener('click', salvarDetalhesAtk);
        footer.replaceChildren(cancelButton, saveButton);
    }

    modalEl.addEventListener('close', () => { atkSendoEditadoIdx = null; }, { once: true });
    if (!modalEl.open) modalEl.showModal();
}

function fecharModalAtk() {
    const modal = document.getElementById('modal-ataque');
    if (modal?.open) fecharDialogoAnimado(modal);
}

function salvarDetalhesAtk() {
    if (atkSendoEditadoIdx === null) return;
    const index = atkSendoEditadoIdx;
    const assignments = {
        [`atk_tipo_${index}`]: 'modal_atk_tipo',
        [`atk_teste_${index}`]: 'modal_atk_teste',
        [`atk_dano_${index}`]: 'modal_atk_dano',
        [`atk_tipo_dano_${index}`]: 'modal_tipo_dano',
        [`atk_critico_${index}`]: 'modal_atk_critico',
        [`atk_alcance_${index}`]: 'modal_atk_alcance',
        [`atk_desc_${index}`]: 'modal_atk_desc'
    };

    Object.entries(assignments).forEach(([targetId, sourceId]) => {
        const target = document.getElementById(targetId);
        const source = document.getElementById(sourceId);
        if (target && source) target.value = source.value;
    });

    atualizarBadgeDano(index);
    atualizarResumoCardAtaque(index);
    if (typeof sincronizarAtaqueComInventario === 'function') sincronizarAtaqueComInventario(index);
    atualizarTudo();
    filtrarAtaques();
    if (typeof showNotification === 'function') showNotification("Ataque atualizado.", "success");
    fecharModalAtk();
}
