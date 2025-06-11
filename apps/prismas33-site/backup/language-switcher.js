// Language Switcher for Prismas33 - Simplified Helper
document.addEventListener('DOMContentLoaded', function() {
    console.log('Language switcher helper loaded - simplified version');
    
    // Wait for the main script to initialize i18n
    setTimeout(() => {
        if (window.i18n) {
            console.log('✅ i18n object found - main translation system is working');
            console.log('Current language:', window.i18n.currentLang);
        } else {
            console.warn('⚠️ i18n object not found - main translation system may have issues');
        }
    }, 1000);
});

// Keep the global status check function for debugging
window.checkLanguageStatus = function() {
    console.log('=== LANGUAGE STATUS CHECK ===');
    console.log('i18n available:', !!window.i18n);
    if (window.i18n) {
        console.log('Current language:', window.i18n.currentLang);
        console.log('Available translations:', Object.keys(window.i18n.translations));
    }
    
    const buttons = document.querySelectorAll('.lang-btn');
    console.log('Buttons found:', buttons.length);
    buttons.forEach((btn, i) => {
        console.log(`Button ${i}:`, {
            href: btn.getAttribute('href'),
            'data-lang': btn.getAttribute('data-lang'),
            active: btn.classList.contains('active'),
            text: btn.textContent.trim()
        });
    });
    console.log('=== END STATUS CHECK ===');
};

// Test function for manual language switching
window.testLanguageSwitch = function(lang) {
    console.log('Manual language switch test to:', lang);
    if (window.i18n) {
        window.i18n.setLanguage(lang);
        console.log('Test completed, current language:', window.i18n.currentLang);
    } else {
        console.error('i18n object not available');
    }
};

function checkLanguageSwitcher() {
    // Check if i18n object exists
    if (window.i18n) {
        console.log('i18n object found:', window.i18n);
        console.log('Current language:', window.i18n.currentLang);
        
        // Check language buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        console.log('Language buttons found:', langButtons.length);
        
        // Check if active class is set correctly
        langButtons.forEach(btn => {
            // Verifica se o botão tem href, caso contrário usa o texto ou data-lang
            let btnLang;
            if (btn.hasAttribute('href')) {
                btnLang = btn.getAttribute('href').replace('#', '');
            } else if (btn.hasAttribute('data-lang')) {
                btnLang = btn.getAttribute('data-lang');
            } else {
                btnLang = btn.textContent.trim().toLowerCase();
            }
            
            const isActive = btn.classList.contains('active');
            console.log(`Button ${btnLang}: active = ${isActive}`);
        });
    } else {
        console.warn('i18n object not found!');
    }
}

// Nova função para corrigir botões de idioma se necessário
function fixLanguageSwitcher() {
    console.log('Verificando e corrigindo botões de idioma...');
    const langButtons = document.querySelectorAll('.language-selector a, .language-selector button');
    
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            // Garantir que os botões têm a classe lang-btn
            if (!btn.classList.contains('lang-btn')) {
                console.log('Adicionando classe lang-btn a:', btn);
                btn.classList.add('lang-btn');
            }
            
            // Garantir que os botões têm o atributo href
            if (!btn.hasAttribute('href')) {
                let lang;
                
                // Tentar obter o idioma do data-lang ou do texto
                if (btn.hasAttribute('data-lang')) {
                    lang = btn.getAttribute('data-lang');
                } else if (btn.textContent.trim().toLowerCase() === 'pt' || 
                           btn.textContent.trim().toLowerCase() === 'português') {
                    lang = 'pt';
                } else if (btn.textContent.trim().toLowerCase() === 'en' || 
                           btn.textContent.trim().toLowerCase() === 'english') {
                    lang = 'en';
                }
                
                if (lang) {
                    console.log(`Adicionando href="#${lang}" ao botão`);
                    btn.setAttribute('href', `#${lang}`);
                }
            }
        });
        
        // Se i18n existir, atualize o estado ativo
        if (window.i18n) {
            window.i18n.updateLanguageSelector();
        }
        
        console.log('Correção dos botões de idioma concluída.');
    } else {
        console.warn('Nenhum botão de idioma encontrado para corrigir!');
    }
}

function addDebugListeners() {
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Adding debug listeners to', langButtons.length, 'buttons');
    
    langButtons.forEach((btn, index) => {
        // Add a debug listener BEFORE other listeners
        btn.addEventListener('click', function(e) {
            // Obter o idioma do botão de várias fontes possíveis
            let lang = null;
            if (btn.hasAttribute('href')) {
                lang = btn.getAttribute('href').replace('#', '');
            } else if (btn.hasAttribute('data-lang')) {
                lang = btn.getAttribute('data-lang');
            } else {
                lang = btn.textContent.trim().toLowerCase();
            }
            
            console.log(`DEBUG: Button ${index} (${lang}) clicked!`);
            console.log('Target:', e.target);
            console.log('Current target:', e.currentTarget);
            console.log('Href:', this.getAttribute('href'));
            console.log('Data-lang:', this.getAttribute('data-lang'));
            console.log('Text content:', this.textContent.trim());
            console.log('Event default prevented?', e.defaultPrevented);
            
            // Se o botão não tiver href, mas tiver o idioma de alguma outra forma
            // vamos forçar a mudança de idioma manualmente
            if (!this.hasAttribute('href') && lang && window.i18n) {
                console.log(`Forçando mudança de idioma para: ${lang}`);
                window.i18n.setLanguage(lang);
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // Use capture phase
        
        // Check if button has existing listeners
        const href = btn.getAttribute('href') || btn.getAttribute('data-lang') || btn.textContent.trim();
        console.log(`Button ${index} (${href}):`, {
            onclick: btn.onclick,
            hasEventListeners: btn.addEventListener.toString()
        });
    });
}

function forceLanguageTest() {
    console.log('=== FORCE LANGUAGE TEST ===');
    
    if (!window.i18n) {
        console.error('Cannot test: i18n object not available');
        return;
    }
    
    // Verificar botões antes do teste
    console.log('Estado dos botões antes do teste:');
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach((btn, i) => {
        const href = btn.getAttribute('href');
        const dataLang = btn.getAttribute('data-lang');
        const text = btn.textContent.trim();
        console.log(`Botão ${i}: href=${href}, data-lang=${dataLang}, text=${text}, active=${btn.classList.contains('active')}`);
    });
    
    console.log('Testing PT to EN switch...');
    window.i18n.setLanguage('en');
    
    setTimeout(() => {
        console.log('Current language after EN switch:', window.i18n.currentLang);
        
        // Verificar estado dos botões após primeira mudança
        console.log('Estado dos botões após mudar para EN:');
        buttons.forEach((btn, i) => {
            console.log(`Botão ${i}: active=${btn.classList.contains('active')}`);
        });
        
        console.log('Testing EN to PT switch...');
        window.i18n.setLanguage('pt');
        
        setTimeout(() => {
            console.log('Current language after PT switch:', window.i18n.currentLang);
            
            // Verificar estado dos botões após segunda mudança
            console.log('Estado dos botões após mudar para PT:');
            buttons.forEach((btn, i) => {
                console.log(`Botão ${i}: active=${btn.classList.contains('active')}`);
            });
            
            console.log('=== FORCE TEST COMPLETED ===');
        }, 1000);
    }, 1000);
}

// Global test function
window.testLanguageSwitch = function(lang) {
    console.log('Manual language switch test to:', lang);
    if (window.i18n) {
        window.i18n.setLanguage(lang);
        console.log('Test completed, current language:', window.i18n.currentLang);
    } else {
        console.error('i18n object not available');
    }
};

// Global status check function
window.checkLanguageStatus = function() {
    console.log('=== LANGUAGE STATUS CHECK ===');
    console.log('i18n available:', !!window.i18n);
    if (window.i18n) {
        console.log('Current language:', window.i18n.currentLang);
    }
    
    const buttons = document.querySelectorAll('.lang-btn');
    console.log('Buttons found:', buttons.length);
    buttons.forEach((btn, i) => {
        console.log(`Button ${i}:`, {
            href: btn.getAttribute('href'),
            'data-lang': btn.getAttribute('data-lang'),
            active: btn.classList.contains('active'),
            text: btn.textContent.trim()
        });
    });
    console.log('=== END STATUS CHECK ===');
};

// Função global para inicializar ou reparar os seletores de idioma
window.initializeLanguageSwitchers = function() {
    console.log('Inicializando seletores de idioma manualmente...');
    
    // Garantir que todos os elementos de seleção de idioma têm classe .lang-btn
    const langContainer = document.querySelector('.language-selector');
    if (langContainer) {
        const langElements = langContainer.querySelectorAll('a, button, span');
        
        langElements.forEach(el => {
            // Adicionar classe lang-btn se não existir
            if (!el.classList.contains('lang-btn')) {
                el.classList.add('lang-btn');
            }
            
            // Verificar se o elemento tem href ou data-lang
            let lang = null;
            
            // Primeiro, tentar obter do href
            if (el.hasAttribute('href') && el.getAttribute('href').startsWith('#')) {
                lang = el.getAttribute('href').replace('#', '');
            } 
            // Se não, tentar obter do data-lang
            else if (el.hasAttribute('data-lang')) {
                lang = el.getAttribute('data-lang');
            }
            // Caso contrário, inferir do texto
            else {
                const text = el.textContent.trim().toLowerCase();
                if (text === 'pt' || text === 'português') {
                    lang = 'pt';
                } else if (text === 'en' || text === 'english') {
                    lang = 'en';
                }
            }
            
            // Se identificamos o idioma, garantir que o elemento tem href e data-lang
            if (lang) {
                if (!el.hasAttribute('href')) {
                    el.setAttribute('href', `#${lang}`);
                }
                if (!el.hasAttribute('data-lang')) {
                    el.setAttribute('data-lang', lang);
                }
                
                // Verificar se o elemento atual deve ter a classe active
                if (window.i18n && window.i18n.currentLang === lang) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
                
                // Remover eventos antigos para evitar duplicação
                const oldEl = el.cloneNode(true);
                el.parentNode.replaceChild(oldEl, el);
                el = oldEl;
                
                // Adicionar event listener para garantir que clique funcione
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.i18n) {
                        console.log(`🌐 Alterando idioma para: ${lang}`);
                        window.i18n.setLanguage(lang);
                        
                        // Forçar atualização do conteúdo - estratégia adicional
                        setTimeout(function() {
                            console.log(`🔄 Forçando atualização adicional para: ${lang}`);
                            if (window.i18n.currentLang === lang) {
                                console.log('🔄 Executando nova tradução...');
                                window.i18n.translateePage();
                            }
                        }, 100);
                    }
                });
            }
        });
        
        console.log('Inicialização dos seletores de idioma concluída.');
    } else {
        console.warn('Container de seleção de idioma não encontrado!');
    }
    
    // Atualizar seletores se o i18n estiver disponível
    if (window.i18n) {
        window.i18n.updateLanguageSelector();
    }
    
    // Adicionar evento global para monitorar cliques nos botões de idioma
    document.addEventListener('click', function(e) {
        // Verificar se o clique foi em um botão de idioma ou em um filho dele
        let targetEl = e.target;
        let isLangButton = false;
        
        // Verificar o elemento clicado e seus pais
        while (targetEl && targetEl !== document.body) {
            if (targetEl.classList && targetEl.classList.contains('lang-btn')) {
                isLangButton = true;
                break;
            }
            targetEl = targetEl.parentNode;
        }
        
        // Se for um botão de idioma, forçar atualização
        if (isLangButton && window.i18n) {
            console.log('🔄 Evento global de clique detectado em botão de idioma');
            
            // Obter o idioma do botão
            let lang;
            if (targetEl.hasAttribute('data-lang')) {
                lang = targetEl.getAttribute('data-lang');
            } else if (targetEl.hasAttribute('href')) {
                lang = targetEl.getAttribute('href').replace('#', '');
            }
            
            if (lang) {
                setTimeout(function() {
                    console.log(`🔄 Garantindo atualização para: ${lang}`);
                    if (window.i18n.currentLang === lang) {
                        window.i18n.translateePage();
                    }
                }, 200);
            }
        }
    });
};
