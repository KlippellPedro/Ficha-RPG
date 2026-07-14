/**
 * Engine de Imagens - Gerenciamento de Avatares e Ajustes Visuais
 */

window.currentImgTargetId = null;

window.triggerCharImageInput = function (container) {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (dados.foto) {
        window.abrirModalGerenciarImagem(null);
    } else {
        const input = container.querySelector('input[type="file"]');
        if (input) input.click();
    }
};

window.abrirModalGerenciarImagem = function (targetId) {
    window.currentImgTargetId = targetId;
    const key = targetId || STORAGE_KEY;
    const dados = JSON.parse(localStorage.getItem(key)) || {};

    const modal = document.getElementById('modal-image-manager');
    const preview = document.getElementById('image-manager-preview');

    if (!modal || !preview || !dados.foto) return;

    preview.src = dados.foto;
    document.getElementById('img-manager-zoom').value = dados.foto_zoom || 1;
    document.getElementById('img-manager-x').value = dados.foto_x || 50;
    document.getElementById('img-manager-y').value = dados.foto_y || 50;

    window.atualizarPreviewAjuste();
    modal.showModal();
};

window.fecharModalGerenciarImagem = function () {
    const modal = document.getElementById('modal-image-manager');
    if (modal) fecharDialogoAnimado(modal);
};

window.atualizarPreviewAjuste = function () {
    const preview = document.getElementById('image-manager-preview');
    const zoom = document.getElementById('img-manager-zoom').value;
    const x = document.getElementById('img-manager-x').value;
    const y = document.getElementById('img-manager-y').value;

    if (preview) {
        preview.style.transform = `scale(${zoom})`;
        preview.style.objectPosition = `${x}% ${y}%`;
        preview.style.transformOrigin = `${x}% ${y}%`;
    }
};

window.salvarAjustesImagem = function () {
    const key = window.currentImgTargetId || STORAGE_KEY;
    const dados = JSON.parse(localStorage.getItem(key)) || {};

    dados.foto_zoom = document.getElementById('img-manager-zoom').value;
    dados.foto_x = document.getElementById('img-manager-x').value;
    dados.foto_y = document.getElementById('img-manager-y').value;

    localStorage.setItem(key, JSON.stringify(dados));
    window.fecharModalGerenciarImagem();

    if (window.location.pathname.includes('ficha.html')) {
        const mainImg = document.getElementById('char-avatar-img');
        if (mainImg) window.aplicarEstilosAvatar(mainImg, dados);
    } else if (typeof renderizarAliados === 'function') {
        renderizarAliados();
    }
    showNotification("Ajustes de imagem salvos!", "success");
};

window.removerImagem = function () {
    showConfirm("Deseja remover a foto permanentemente?", () => {
        const key = window.currentImgTargetId || STORAGE_KEY;
        const dados = JSON.parse(localStorage.getItem(key)) || {};
        delete dados.foto;
        delete dados.foto_zoom;
        delete dados.foto_x;
        delete dados.foto_y;
        localStorage.setItem(key, JSON.stringify(dados));
        window.fecharModalGerenciarImagem();
        location.reload();
    });
};

window.trocarImagemDesdeModal = function () {
    window.fecharModalGerenciarImagem();
    // Se window.currentImgTargetId for nulo, estamos na ficha principal
    if (!window.currentImgTargetId) {
        document.getElementById('char-image-input').click();
    } else {
        // Se for aliado, precisamos achar o card e clicar no input dele
        const card = document.querySelector(`.ally-card[data-id="${window.currentImgTargetId}"]`);
        if (card) card.querySelector('.ally-image-input').click();
    }
};

window.aplicarEstilosAvatar = function (imgEl, dados) {
    if (!imgEl || !dados) return;
    const zoom = dados.foto_zoom || 1;
    const x = dados.foto_x || 50;
    const y = dados.foto_y || 50;
    imgEl.style.objectFit = 'cover';
    imgEl.style.transform = `scale(${zoom})`;
    imgEl.style.objectPosition = `${x}% ${y}%`;
    imgEl.style.transformOrigin = `${x}% ${y}%`;
};

window.salvarImagemPersonagem = function (input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
        showNotification("A imagem é muito pesada! Tente uma menor que 1MB.", "warning");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados.foto = base64;
        // Reseta ajustes ao trocar de foto
        dados.foto_zoom = 1;
        dados.foto_x = 50;
        dados.foto_y = 50;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));

        const img = document.getElementById('char-avatar-img');
        if (img) {
            img.src = base64;
            window.aplicarEstilosAvatar(img, dados);
        }
        showNotification("Avatar atualizado!", "success");
    };
    reader.readAsDataURL(file);
};
