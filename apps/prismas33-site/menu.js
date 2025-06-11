// Menu JS - Consolidado
// Combinação de mobile-menu.js, menu-icon.js e force-hamburger-icon.js

document.addEventListener('DOMContentLoaded', function() {
    // Força a exibição do botão do menu mobile
    const menuToggle = document.getElementById('mobileMenuToggle');
    if (menuToggle) {
        console.log('Menu toggle button found');
        
        // Certifique-se de que o botão está visível
        menuToggle.style.display = 'flex';
        
        // Adicionar evento de clique ao botão do menu
        menuToggle.addEventListener('click', function() {
            console.log('Menu toggle clicked');
            
            // Toggle do overlay do menu mobile
            const mobileOverlay = document.getElementById('mobileMenuOverlay');
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('active');
                console.log('Mobile overlay toggled');
                
                // Adicionar classe quando o menu está aberto para controlar overflow
                document.body.classList.toggle('mobile-menu-open');
            }
            
            // Alternar entre os dois ícones
            const iconBars = document.getElementById('menuIconBars');
            const iconClose = document.getElementById('menuIconClose');
            
            if (iconBars && iconClose) {
                if (mobileOverlay.classList.contains('active')) {
                    // Se o menu está aberto, mostre o X e esconda o hambúrguer
                    iconBars.style.display = 'none';
                    iconClose.style.display = 'block';
                } else {
                    // Se o menu está fechado, mostre o hambúrguer e esconda o X
                    iconBars.style.display = 'block';
                    iconClose.style.display = 'none';
                }
            }
        });
        
        // Fechar o menu mobile ao clicar no botão de fechar
        const closeBtn = document.getElementById('mobileMenuClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                const mobileOverlay = document.getElementById('mobileMenuOverlay');
                if (mobileOverlay) {
                    mobileOverlay.classList.remove('active');
                    // Remover classe quando o menu é fechado
                    document.body.classList.remove('mobile-menu-open');
                }
                // Reset dos ícones do menu
                const iconBars = document.getElementById('menuIconBars');
                const iconClose = document.getElementById('menuIconClose');
                if (iconBars && iconClose) {
                    iconBars.style.display = 'block';
                    iconClose.style.display = 'none';
                }
            });
        }
        
        // Fechar o menu mobile ao clicar em um link de navegação
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                const mobileOverlay = document.getElementById('mobileMenuOverlay');
                if (mobileOverlay) {
                    mobileOverlay.classList.remove('active');
                    // Remover classe quando o menu é fechado
                    document.body.classList.remove('mobile-menu-open');
                }
                // Reset dos ícones do menu
                const iconBars = document.getElementById('menuIconBars');
                const iconClose = document.getElementById('menuIconClose');
                if (iconBars && iconClose) {
                    iconBars.style.display = 'block';
                    iconClose.style.display = 'none';
                }
            });
        });
        
        // Sincronizar botões de idioma do menu mobile com os botões principais
        const mobileLangBtns = document.querySelectorAll('.mobile-lang-btn');
        mobileLangBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                
                // Atualize a classe ativa nos botões de idioma do menu mobile
                mobileLangBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Encontre o botão correspondente no language switcher principal e clique nele
                const mainLangBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
                if (mainLangBtn) {
                    mainLangBtn.click();
                }
            });
        });
    } else {
        console.error('Menu toggle button not found');
    }
    
    // Força o ícone correto do menu mobile na inicialização
    const forceMenuIcon = function() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        if (menuToggle) {
            const iconBars = document.getElementById('menuIconBars');
            const iconClose = document.getElementById('menuIconClose');
            if (iconBars && iconClose) {
                const mobileOverlay = document.getElementById('mobileMenuOverlay');
                if (mobileOverlay && mobileOverlay.classList.contains('active')) {
                    // Se o menu está aberto
                    iconBars.style.display = 'none';
                    iconClose.style.display = 'block';
                } else {
                    // Se o menu está fechado
                    iconBars.style.display = 'block';
                    iconClose.style.display = 'none';
                }
            }
        }
    };
    
    // Executar no carregamento da página e após um pequeno atraso para garantir
    forceMenuIcon();
    setTimeout(forceMenuIcon, 100);
});
