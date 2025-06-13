// Menu JS - Consolidado
// Combinação de mobile-menu.js, menu-icon.js e force-hamburger-icon.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing menu...');
    
    // Força a exibição do botão do menu mobile
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('mobileMenuClose');
    const iconBars = document.getElementById('menuIconBars');
    const iconClose = document.getElementById('menuIconClose');
    
    if (!menuToggle) {
        console.error('Menu toggle button not found');
        return;
    }
    
    console.log('Menu toggle button found');
    
    // Certifique-se de que o botão está visível
    menuToggle.style.display = 'flex';
    
    // Função para alternar o menu
    function toggleMenu() {
        console.log('Menu toggle clicked');
        
        if (mobileOverlay) {
            mobileOverlay.classList.toggle('active');
            console.log('Mobile overlay toggled');
            
            // Adicionar classe quando o menu está aberto para controlar overflow
            document.body.classList.toggle('mobile-menu-open');
            
            // Alternar entre os dois ícones
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
        }
    }
    
    // Função para fechar o menu
    function closeMenu() {
        console.log('Closing menu...');
        
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        }
        
        // Reset dos ícones do menu
        if (iconBars && iconClose) {
            iconBars.style.display = 'block';
            iconClose.style.display = 'none';
        }
    }
    
    // Adicionar evento de clique ao botão do menu
    menuToggle.addEventListener('click', toggleMenu);
    
    // Fechar o menu mobile ao clicar no botão de fechar
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    // Fechar o menu mobile ao clicar em um link de navegação
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });    
    // Sincronização dos botões de idioma
    const mobileLangBtns = document.querySelectorAll('.mobile-lang-btn');
    const mainLangBtns = document.querySelectorAll('.lang-btn');
    
    // Função para sincronizar botões de idioma
    function syncLanguageButtons() {
        const activeMain = document.querySelector('.lang-btn.active');
        if (activeMain && mobileLangBtns.length > 0) {
            const lang = activeMain.getAttribute('data-lang');
            mobileLangBtns.forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    // Sincronizar na abertura do menu
    menuToggle.addEventListener('click', function() {
        setTimeout(syncLanguageButtons, 100);
    });
    
    // Clique nos botões mobile troca idioma no topo
    mobileLangBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            // Atualizar botões mobile
            mobileLangBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Sincronizar com botões do topo
            mainLangBtns.forEach(mainBtn => {
                if (mainBtn.getAttribute('data-lang') === lang) {
                    mainBtn.classList.add('active');
                } else {
                    mainBtn.classList.remove('active');
                }
            });
            
            // Disparar evento para o language-switcher.js
            const event = new CustomEvent('languageChanged', { detail: { lang: lang } });
            document.dispatchEvent(event);
        });
    });
    
    // Força o ícone correto do menu mobile na inicialização
    function forceMenuIcon() {
        if (menuToggle && iconBars && iconClose) {
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
    
    // Executar inicializações
    forceMenuIcon();
    syncLanguageButtons();
    
    // Garantir após um pequeno atraso
    setTimeout(() => {
        forceMenuIcon();
        syncLanguageButtons();
    }, 100);
    
    console.log('Menu initialization complete');
});
