// Correção específica para o ícone do menu mobile
document.addEventListener('DOMContentLoaded', function() {
    // Força o ícone correto do menu mobile ao carregar a página
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        const icon = menuToggle.querySelector('i');
        if (icon) {
            // Garante que o ícone seja sempre o hambúrguer quando o menu está fechado
            icon.className = 'fas fa-bars';
        }
        
        // Verifica se o menu overlay está ativo e ajusta o ícone
        const mobileOverlay = document.getElementById('mobileMenuOverlay');
        if (mobileOverlay && !mobileOverlay.classList.contains('active')) {
            // Se o menu não estiver ativo, garanta que o ícone seja o hambúrguer
            icon.className = 'fas fa-bars';
        }
    }
    
    // Adicionar classe quando o menu está aberto para controlar overflow
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            document.body.classList.toggle('mobile-menu-open');
        });
    }
    
    // Garantir que o ícone correto seja sempre exibido ao carregar a página
    window.addEventListener('load', function() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (menuToggle) {
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
});
