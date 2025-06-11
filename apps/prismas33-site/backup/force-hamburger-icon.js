// Força o ícone de hambúrguer no botão de menu mobile no carregamento da página
(function() {
    // Executar imediatamente
    const forceMenuIcon = function() {
        // Forçar o ícone correto
        const menuToggle = document.getElementById('mobileMenuToggle');
        if (menuToggle) {
            // Remover qualquer ícone existente
            const existingIcon = menuToggle.querySelector('i');
            if (existingIcon) {
                existingIcon.remove();
            }
            
            // Criar e adicionar um novo ícone de hambúrguer
            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-bars';
            menuToggle.prepend(newIcon);
            
            console.log('Menu icon forced to hamburger');
        }
    };
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceMenuIcon);
    } else {
        forceMenuIcon();
    }
    
    // Executar novamente após um pequeno atraso para garantir
    setTimeout(forceMenuIcon, 100);
})();
