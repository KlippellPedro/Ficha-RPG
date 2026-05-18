/**
 * Lógica de UI para dispositivos móveis
 */

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.top-menu');
    const links = document.querySelector('.menu-links');

    if (menu && links) {
        // Cria o botão de menu hambúrguer
        const mobileBtn = document.createElement('button');
        mobileBtn.id = 'mobile-menu-toggle';
        mobileBtn.setAttribute('type', 'button');
        mobileBtn.innerHTML = '☰';

        menu.prepend(mobileBtn);

        // Toggle de visibilidade
        mobileBtn.addEventListener('click', () => {
            links.classList.toggle('active');
            mobileBtn.innerHTML = links.classList.contains('active') ? '✕' : '☰';
        });

        // Fecha o menu ao clicar em qualquer link
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('active');
                mobileBtn.innerHTML = '☰';
            });
        });

        // Fecha o menu se clicar fora dele
        document.addEventListener('click', (e) => {
            if (links.classList.contains('active') && !menu.contains(e.target)) {
                links.classList.remove('active');
                mobileBtn.innerHTML = '☰';
            }
        });
    }
});