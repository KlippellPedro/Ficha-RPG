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
    modal.style.display = 'flex';
};

window.fecharModalGerenciarImagem = function () {
    const modal = document.getElementById('modal-image-manager');
    if (modal) modal.style.display = 'none';
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
        showNotification("Imagem muito pesada! Máximo 1MB.", "warning");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        dados.foto = e.target.result;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        location.reload();
    };
    reader.readAsDataURL(file);
};
