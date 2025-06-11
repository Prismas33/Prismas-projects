// Script de tradução por força bruta
// Este script traduz diretamente os elementos da página, sem depender do script.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌍 Translation-force script loaded - DISABLED in favor of main script.js translation system');
    
    // This script is disabled to avoid conflicts with the main translation system
    // The main script.js now properly exposes window.i18n and handles all translations
    
    return; // Exit early to prevent any conflicts
    
    // Rest of the code is disabled
    setTimeout(() => {
        forceTranslate(currentLang);
    }, 500);

    // Listener para hashchange: traduzir imediatamente ao mudar o hash
    window.addEventListener('hashchange', function() {
        const lang = detectLang();
        localStorage.setItem('prismas33-lang', lang);
        forceTranslate(lang);
        updateActiveButton(lang);
    });

    // Configurar os botões de idioma
    setTimeout(setupLanguageButtons, 800);

    // Verificação adicional após algum tempo para garantir que a tradução foi aplicada
    setTimeout(() => {
        const heroTitle1 = document.querySelector('.hero-title .title-line:first-child');
        if (heroTitle1) {
            const currentText = heroTitle1.textContent.trim();
            const expectedPT = 'Tecnologia que';
            const expectedEN = 'Technology that';

            console.log(`🌍 Verificando tradução atual: [${currentText}]`);
            console.log(`🌍 Esperado PT: [${expectedPT}], esperado EN: [${expectedEN}]`);

            if ((currentLang === 'pt' && currentText !== expectedPT) || 
                (currentLang === 'en' && currentText !== expectedEN)) {
                console.warn('⚠️ Tradução não aparenta estar correta. Forçando nova tradução...');
                forceTranslate(currentLang);
            }
        }
    }, 1500);

    function setupLanguageButtons() {
        const ptButton = document.querySelector('.language-selector [href="#pt"], .language-selector [data-lang="pt"]');
        const enButton = document.querySelector('.language-selector [href="#en"], .language-selector [data-lang="en"]');
        
        if (ptButton) {
            ptButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Atualizar URL na barra de endereços
                try {
                    const newUrl = window.location.href.split('#')[0] + '#pt';
                    window.history.pushState({lang: 'pt'}, '', newUrl);
                    console.log(`🌐 URL atualizado para: ${newUrl}`);
                } catch (error) {
                    console.warn('⚠️ Não foi possível atualizar a URL:', error);
                }
                
                forceTranslate('pt');
                updateActiveButton('pt');
                return false;
            });
        } else {
            console.warn('⚠️ Botão PT não encontrado');
        }
        
        if (enButton) {
            enButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Atualizar URL na barra de endereços
                try {
                    const newUrl = window.location.href.split('#')[0] + '#en';
                    window.history.pushState({lang: 'en'}, '', newUrl);
                    console.log(`🌐 URL atualizado para: ${newUrl}`);
                } catch (error) {
                    console.warn('⚠️ Não foi possível atualizar a URL:', error);
                }
                
                forceTranslate('en');
                updateActiveButton('en');
                return false;
            });
        } else {
            console.warn('⚠️ Botão EN não encontrado');
        }
        
        // Atualizar estado inicial dos botões
        updateActiveButton(currentLang);
    }
    
    function updateActiveButton(lang) {
        document.querySelectorAll('.language-selector a, .language-selector button, .lang-btn').forEach(el => {
            el.classList.remove('active');
            
            // Verificar se este botão corresponde ao idioma atual
            let btnLang = null;
            
            // Verificar pelas várias formas de identificar o idioma do botão
            if (el.hasAttribute('data-lang')) {
                btnLang = el.getAttribute('data-lang');
            } else if (el.hasAttribute('href') && el.getAttribute('href').startsWith('#')) {
                btnLang = el.getAttribute('href').replace('#', '');
            } else if (el.textContent.trim().toLowerCase() === 'pt' || el.textContent.trim().toLowerCase() === 'en') {
                btnLang = el.textContent.trim().toLowerCase();
            }
            
            // Se corresponder ao idioma atual, marcar como ativo
            if (btnLang === lang) {
                el.classList.add('active');
            }
        });
    }
});

// Função principal de tradução forçada
function forceTranslate(lang) {
    console.log(`🌍 Forçando tradução para: ${lang}`);
    
    // Salvar idioma
    localStorage.setItem('prismas33-lang', lang);
    
    // Traduzir elementos da página
    try {
        // Seção Hero
        const heroTitle1 = document.querySelector('.hero-title .title-line:first-child');
        const heroTitle2 = document.querySelector('.hero-title .title-line.highlight');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        
        if (lang === 'en') {
            if (heroTitle1) {
                heroTitle1.textContent = 'Technology that';
                console.log('🌍 Hero title 1 traduzido (EN)');
            }
            
            if (heroTitle2) {
                heroTitle2.textContent = 'Refracts Solutions';
                console.log('🌍 Hero title 2 traduzido (EN)');
            }
            
            if (heroSubtitle) {
                heroSubtitle.innerHTML = 'Intelligent tools for developers,<br>companies and creative minds';
                console.log('🌍 Hero subtitle traduzido (EN)');
            }
            
        } else {
            if (heroTitle1) {
                heroTitle1.textContent = 'Tecnologia que';
                console.log('🌍 Hero title 1 traduzido (PT)');
            }
            
            if (heroTitle2) {
                heroTitle2.textContent = 'Refrata Soluções';
                console.log('🌍 Hero title 2 traduzido (PT)');
            }
            
            if (heroSubtitle) {
                heroSubtitle.innerHTML = 'Ferramentas inteligentes para desenvolvedores,<br>empresas e mentes criativas';
                console.log('🌍 Hero subtitle traduzido (PT)');
            }
        }
        
        // Botões
        const exploreBtn = document.querySelector('.cta-button.primary .button-text');
        const docBtn = document.querySelector('.cta-button.secondary .button-text');
        
        if (lang === 'en') {
            if (exploreBtn) {
                exploreBtn.textContent = 'Explore Apps';
                console.log('🌍 Explore button traduzido (EN)');
            }
            
            if (docBtn) {
                docBtn.textContent = 'Documentation';
                console.log('🌍 Doc button traduzido (EN)');
            }
        } else {
            if (exploreBtn) {
                exploreBtn.textContent = 'Explore os Apps';
                console.log('🌍 Explore button traduzido (PT)');
            }
            
            if (docBtn) {
                docBtn.textContent = 'Documentação';
                console.log('🌍 Doc button traduzido (PT)');
            }
        }
        
        // Stats
        const statLabels = document.querySelectorAll('.stat-label');
        if (statLabels.length === 3) {
            if (lang === 'en') {
                statLabels[0].textContent = 'Apps in Development';
                statLabels[1].textContent = 'Integrated Technologies';
                statLabels[2].textContent = 'Possibilities';
                console.log('🌍 Stat labels traduzidos (EN)');
            } else {
                statLabels[0].textContent = 'Apps em Desenvolvimento';
                statLabels[1].textContent = 'Tecnologias Integradas';
                statLabels[2].textContent = 'Possibilidades';
                console.log('🌍 Stat labels traduzidos (PT)');
            }
        }
        
        // Marketplace
        const sectionTitle = document.querySelector('.section-title');
        const sectionSubtitle = document.querySelector('.section-subtitle');
        
        if (lang === 'en') {
            if (sectionTitle) {
                sectionTitle.textContent = 'Coming Soon';
                console.log('🌍 Section title traduzido (EN)');
            }
            
            if (sectionSubtitle) {
                sectionSubtitle.textContent = 'Innovative applications in development';
                console.log('🌍 Section subtitle traduzido (EN)');
            }        } else {
            if (sectionTitle) {
                sectionTitle.textContent = 'Próximos Lançamentos';
                console.log('🌍 Section title traduzido (PT)');
            }
            
            if (sectionSubtitle) {
                sectionSubtitle.textContent = 'Inovações que estão chegando';
                console.log('🌍 Section subtitle traduzido (PT)');
            }
        }
        
        // Apps descriptions
        const appDescriptions = document.querySelectorAll('.app-description');
        if (appDescriptions.length > 0) {
            if (lang === 'en') {
                const enDescriptions = [
                    'Node.js → Android/EXE converter. Free your code from platforms.',
                    'AI-powered information organizer. Never lose an idea.',
                    'Educational games for children. Learning logic has never been so fun.',
                    'Perfect PDF → Word converter. Edit without errors.'
                ];
                
                appDescriptions.forEach((desc, index) => {
                    if (index < enDescriptions.length) {
                        desc.textContent = enDescriptions[index];
                    }
                });
                console.log('🌍 App descriptions traduzidos (EN)');
            } else {
                const ptDescriptions = [
                    'Conversor Node.js → Android/EXE. Liberte seu código de plataformas.',
                    'Organizador de informação com IA. Nunca perca uma ideia.',
                    'Jogos educativos para crianças. Aprender lógica nunca foi tão divertido.',
                    'Conversor PDF → Word perfeito. Edite sem erros.'
                ];
                
                appDescriptions.forEach((desc, index) => {
                    if (index < ptDescriptions.length) {
                        desc.textContent = ptDescriptions[index];
                    }
                });
                console.log('🌍 App descriptions traduzidos (PT)');
            }
        }
        
        // Notify buttons
        document.querySelectorAll('.notify-btn').forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                btn.innerHTML = '';
                btn.appendChild(icon);
                
                if (lang === 'en') {
                    btn.appendChild(document.createTextNode(' Notify Me'));
                } else {
                    btn.appendChild(document.createTextNode(' Avisar-me'));
                }
            }
        });
        console.log('🌍 Notify buttons traduzidos');
        
        // Se window.i18n existir, também atualiza
        if (window.i18n) {
            window.i18n.currentLang = lang;
            console.log('🌍 window.i18n.currentLang atualizado para:', lang);
            
            // Tenta usar o método nativo de tradução também
            try {
                window.i18n.translateePage();
                console.log('🌍 Chamado método nativo window.i18n.translateePage()');
            } catch(e) {
                console.warn('⚠️ Erro ao chamar método nativo de tradução:', e);
            }
        }
        
        console.log('🌍 Tradução forçada concluída com sucesso!');
        
    } catch (error) {
        console.error('🔴 Erro ao forçar tradução:', error);
    }
}

// Expor função globalmente para uso no console
window.forceTranslate = forceTranslate;
