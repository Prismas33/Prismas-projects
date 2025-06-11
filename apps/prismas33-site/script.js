// Prismas 33 - JavaScript Functions

// Executar após carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        // For EmailJS v4+, use only the object form for init
        emailjs.init({ publicKey: 'BABNdz0y37DwfGJ9P' });
        console.log('EmailJS initialized successfully');
    } else {
        console.error('EmailJS library not loaded');
    }

    // --- Language hash detection on page load ---
    let hashLang = null;
    if (window.location.hash === '#en') hashLang = 'en';
    if (window.location.hash === '#pt') hashLang = 'pt';

    // If hashLang is present, override localStorage and set language
    if (hashLang) {
        localStorage.setItem('prismas33-lang', hashLang);
        if (window.i18n) {
            window.i18n.setLanguage(hashLang);
        }
    }

    // Verificar se os botões de idioma precisam ser inicializados manualmente
    setTimeout(() => {
        if (window.initializeLanguageSwitchers) {
            console.log('Inicializando seletores de idioma automaticamente');
            window.initializeLanguageSwitchers();
        }
        
        // Verificar e garantir que o i18n está funcionando
        if (window.i18n) {
            console.log('🌐 Verificando sistema de tradução...');
            // Forçar uma chamada manual do translateePage para garantir que tudo esteja traduzido
            try {
                window.i18n.translateePage();
                console.log('🌐 Tradução inicial forçada concluída');
            } catch (error) {
                console.error('🔴 Erro ao forçar tradução inicial:', error);
            }
        } else {
            console.error('🔴 i18n não está disponível após carregamento da página!');
        }
    }, 1000);

    // Verificação adicional com um pequeno atraso para garantir carregamento completo
    setTimeout(() => {
        if (window.i18n) {
            console.log('🌐 Verificação adicional do sistema de idiomas');
            // Se existir, verificar se a tradução foi aplicada
            if (document.querySelector('.hero-title .title-line:first-child')) {
                const currentText = document.querySelector('.hero-title .title-line:first-child').textContent;
                const expectedPT = window.i18n.translations.pt.heroTitle1;
                const expectedEN = window.i18n.translations.en.heroTitle1;
                const currentLang = window.i18n.currentLang;
                console.log(`🌐 Verificação de tradução: [${currentText}], esperado PT: [${expectedPT}], esperado EN: [${expectedEN}]`);
                if ((currentLang === 'pt' && currentText !== expectedPT) || 
                    (currentLang === 'en' && currentText !== expectedEN)) {
                    console.warn('⚠️ A tradução não parece ter sido aplicada! Forçando nova tradução...');
                    window.i18n.translateePage();
                }
            }
        }
    }, 2000);
});

// ===== INTERNATIONALIZATION SYSTEM =====
class I18n {
    constructor() {
        // Auto-detect language from browser on first visit
        const savedLang = localStorage.getItem('prismas33-lang');
        if (!savedLang) {
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLang = browserLang.startsWith('pt') ? 'pt' : 'en';
        } else {
            this.currentLang = savedLang;
        }
        
        this.translations = {
            pt: {
                // Hero Section
                heroTitle1: "Tecnologia que",
                heroTitle2: "Refrata Soluções",
                heroSubtitle: "Ferramentas inteligentes para desenvolvedores,<br>empresas e mentes criativas",
                exploreApps: "Explore os Apps",
                documentation: "Documentação",
                
                // Stats
                appsInDev: "Apps em Desenvolvimento",                techIntegrated: "Tecnologias Integradas",
                possibilities: "Possibilidades",
                  // Marketplace
                comingSoon: "Em Breve",
                innovativeApps: "Aplicações inovadoras em desenvolvimento",
                notifyMe: "Avisar-me",
                
                // Apps descriptions
                nexus5Desc: "Conversor Node.js → Android/EXE. Liberte seu código de plataformas.",
                cerebra7Desc: "Organizador de informação com IA. Nunca perca uma ideia.",
                puzzle33Desc: "Jogos educativos para crianças. Aprender lógica nunca foi tão divertido.",
                docflow4Desc: "Conversor PDF → Word perfeito. Edite sem erros.",
                
                // Cookies
                cookieTitle: "Este website utiliza cookies",
                cookieText: "Utilizamos cookies para melhorar a sua experiência de navegação, analisar o tráfego do site e personalizar conteúdo. Pode gerir as suas preferências de cookies em qualquer momento.",
                acceptAll: "Aceitar Todos",
                reject: "Rejeitar",
                configure: "Configurar",
                cookieSettings: "Configurações de Cookies",
                essentialCookies: "Cookies Essenciais",
                essentialDesc: "Necessários para o funcionamento básico do website",
                analyticalCookies: "Cookies Analíticos",
                analyticalDesc: "Ajudam-nos a compreender como os visitantes utilizam o website",
                marketingCookies: "Cookies de Marketing",
                marketingDesc: "Utilizados para personalizar anúncios e conteúdo",
                savePreferences: "Guardar Preferências",                // Footer
                contact: "Contacto",
                terms: "Termos e Condições",
                privacy: "Política de Privacidade",
                configureCookies: "Configurar Cookies",
                companyTagline: "Tecnologia que Refrata Soluções",
                established: "Estabelecida em 2020 • Portugal",
                footerSignature: "© 2025 Todos os direitos reservados.",
                ownershipInfo: "owned by Prismas e Quadriláteros Unip. Lda.",
                legalNotice: "Este website cumpre o RGPD (Regulamento Geral sobre a Proteção de Dados).",// Notifications
                notifyModalTitle: "Receba Notificações",                notifyModalText: "Seja notificado quando esta aplicação estiver disponível!",
                emailPlaceholder: "o-seu@email.com",
                notifyButton: "Avisar-me",
                thankYou: "Obrigado! Será notificado em breve.",
                  // Coming Soon
                comingSoonTitle: "Em Breve",
                comingSoonText: "Esta funcionalidade estará disponível em breve!",
                  // Notifications
                cookiesSaved: "Preferências de cookies guardadas!",
                essentialOnly: "Apenas cookies essenciais foram mantidos.",
                marketingRequired: "Para receber notificações, precisa de aceitar cookies de marketing nas configurações.",
                notificationSuccess: "Notificação registada com sucesso!",
                dataDeleted: "Todos os dados locais foram removidos.",
                dataExported: "Dados pessoais exportados com sucesso.",
                
                // Contact Modal
                contactModalTitle: "Entre em Contacto",
                contactModalIntro: "Envie-nos uma mensagem e entraremos em contacto o mais breve possível.",
                contactNameLabel: "Nome *",
                contactNamePlaceholder: "O seu nome completo",
                contactEmailLabel: "Email *",
                contactEmailPlaceholder: "o-seu@email.com",
                contactSubjectLabel: "Assunto *",
                contactSubjectPlaceholder: "Assunto da mensagem",
                contactMessageLabel: "Mensagem *",
                contactMessagePlaceholder: "Escreva a sua mensagem aqui...",
                contactSendButton: "Enviar Mensagem",
                contactSending: "A enviar...",
                contactFormSuccess: "Mensagem enviada com sucesso!",
                contactFormError: "Ocorreu um erro ao enviar. Tente novamente.",
                contactFormRequired: "Por favor, preencha todos os campos obrigatórios.",
                
                // Privacy Policy
                privacySection1: "1. Responsável pelo Tratamento de Dados",
                privacySection2: "2. Dados Recolhidos",
                privacySection3: "3. Finalidades do Tratamento",
                privacySection4: "4. Base Legal",
                privacySection5: "5. Partilha de Dados",
                privacySection6: "6. Direitos dos Titulares",
                privacySection7: "7. Retenção de Dados",
                privacySection8: "8. Contacto",
                
                // Terms Sections
                termsSection1: "1. Aceitação dos Termos",
                termsSection2: "2. Uso do Website",
                termsSection3: "3. Propriedade Intelectual",
                termsSection4: "4. Limitação de Responsabilidade",
                termsSection5: "5. Modificações",
                termsSection6: "6. Lei Aplicável",
                termsSection7: "7. Contacto",
            },
            en: {
                // Hero Section
                heroTitle1: "Technology that",
                heroTitle2: "Refracts Solutions",
                heroSubtitle: "Intelligent tools for developers,<br>companies and creative minds",
                exploreApps: "Explore Apps",
                documentation: "Documentation",
                
                // Stats
                appsInDev: "Apps in Development",
                techIntegrated: "Integrated Technologies",
                possibilities: "Possibilities",
                
                // Marketplace
                comingSoon: "Coming Soon",
                innovativeApps: "Innovative applications in development",
                notifyMe: "Notify Me",
                
                // Apps descriptions
                nexus5Desc: "Node.js → Android/EXE converter. Free your code from platforms.",
                cerebra7Desc: "AI-powered information organizer. Never lose an idea.",
                puzzle33Desc: "Educational games for children. Learning logic has never been so fun.",
                docflow4Desc: "Perfect PDF → Word converter. Edit without errors.",
                
                // Cookies
                cookieTitle: "This website uses cookies",
                cookieText: "We use cookies to improve your browsing experience, analyze site traffic and personalize content. You can manage your cookie preferences at any time.",
                acceptAll: "Accept All",
                reject: "Reject",
                configure: "Configure",
                cookieSettings: "Cookie Settings",
                essentialCookies: "Essential Cookies",
                essentialDesc: "Necessary for basic website functionality",
                analyticalCookies: "Analytical Cookies",
                analyticalDesc: "Help us understand how visitors use the website",
                marketingCookies: "Marketing Cookies",
                marketingDesc: "Used to personalize ads and content",
                savePreferences: "Save Preferences",
                  // Footer
                contact: "Contact",
                terms: "Terms and Conditions",
                privacy: "Privacy Policy",
                configureCookies: "Configure Cookies",
                companyTagline: "Technology that Refracts Solutions",
                established: "Established in 2020 • Portugal",
                footerSignature: "© 2025 All rights reserved.",
                ownershipInfo: "owned by Prismas e Quadriláteros Unip. Lda.",
                legalNotice: "This website complies with GDPR (General Data Protection Regulation).",
                
                // Notifications
                notifyModalTitle: "Get Notifications",
                notifyModalText: "Be notified when this app becomes available!",
                emailPlaceholder: "your@email.com",
                notifyButton: "Notify Me",
                thankYou: "Thank you! You will be notified soon.",                // Coming Soon
                comingSoonTitle: "Coming Soon",
                comingSoonText: "This feature will be available soon!",
                
                // Notifications
                cookiesSaved: "Cookie preferences saved!",
                essentialOnly: "Only essential cookies were kept.",
                marketingRequired: "To receive notifications, you need to accept marketing cookies in settings.",
                notificationSuccess: "Notification registered successfully!",
                dataDeleted: "All local data has been removed.",
                dataExported: "Personal data exported successfully.",

                // Contact Modal
                contactModalTitle: "Contact Us",
                contactModalIntro: "Send us a message and we will get back to you as soon as possible.",
                contactNameLabel: "Name *",
                contactNamePlaceholder: "Your full name",
                contactEmailLabel: "Email *",
                contactEmailPlaceholder: "your@email.com",
                contactSubjectLabel: "Subject *",
                contactSubjectPlaceholder: "Message subject",
                contactMessageLabel: "Message *",
                contactMessagePlaceholder: "Write your message here...",
                contactSendButton: "Send Message",
                contactSending: "Sending...",
                contactFormSuccess: "Message sent successfully!",
                contactFormError: "An error occurred while sending. Please try again.",
                contactFormRequired: "Please fill in all required fields.",

                // Privacy Policy
                privacySection1: "1. Data Controller",
                privacySection2: "2. Data Collected",
                privacySection3: "3. Purposes of Processing",
                privacySection4: "4. Legal Basis",
                privacySection5: "5. Data Sharing",
                privacySection6: "6. Data Subject Rights",
                privacySection7: "7. Data Retention",
                privacySection8: "8. Contact",
                
                // Terms Sections
                termsSection1: "1. Acceptance of Terms",
                termsSection2: "2. Website Use",
                termsSection3: "3. Intellectual Property",
                termsSection4: "4. Limitation of Liability",
                termsSection5: "5. Modifications",
                termsSection6: "6. Governing Law",
                termsSection7: "7. Contact",
            }
        };
        this.init();
    }    init() {
        console.log('🌐 I18n init() chamado');
        try {
            console.log('🌐 Traduzindo a página inicialmente...');
            this.translateePage();
        } catch (error) {
            console.error('🔴 Erro ao traduzir página no init():', error);
        }
        
        try {
            console.log('🌐 Configurando seletor de idiomas...');
            this.setupLanguageSelector();
        } catch (error) {
            console.error('🔴 Erro ao configurar seletor de idiomas:', error);
        }
        
        // Verificação adicional para garantir que a tradução foi aplicada
        setTimeout(() => {
            console.log('🌐 Verificando se tradução foi aplicada...');
            
            // Verificar um elemento visível comum para ter certeza que foi traduzido
            const heroTitle1 = document.querySelector('.hero-title .title-line:first-child');
            if (heroTitle1) {
                const currentText = heroTitle1.textContent;
                const expectedText = this.translate('heroTitle1');
                console.log(`🌐 Tradução atual: [${currentText}], esperada: [${expectedText}]`);
                
                if (currentText !== expectedText) {
                    console.warn('⚠️ Tradução não aplicada! Tentando novamente...');
                    this.translateePage();
                }
            }
        }, 1000);
    }    translate(key) {
        console.log(`🔍 Traduzindo chave: "${key}" para idioma: "${this.currentLang}"`);
        
        // Verificar se a chave existe no idioma atual
        if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
            const translated = this.translations[this.currentLang][key];
            console.log(`✅ Tradução encontrada: "${translated}"`);
            return translated;
        } else {
            console.warn(`⚠️ Tradução não encontrada para chave: "${key}" no idioma: "${this.currentLang}"`);
            
            // Tentar fallback para o outro idioma
            const fallbackLang = this.currentLang === 'pt' ? 'en' : 'pt';
            if (this.translations[fallbackLang] && this.translations[fallbackLang][key]) {
                console.log(`↩️ Usando fallback para: "${fallbackLang}"`);
                return this.translations[fallbackLang][key];
            }
            
            return key;
        }
    }setLanguage(lang) {
        console.log('🌐 setLanguage called with:', lang);
        console.log('🌐 Previous language:', this.currentLang);
        
        this.currentLang = lang;
        localStorage.setItem('prismas33-lang', lang);
        
        console.log('🌐 Language set to:', this.currentLang);
        console.log('🌐 Starting page translation...');
        
        try {
            console.log('🌐 Calling translateePage()...');
            this.translateePage();
            console.log('🌐 Page translation completed successfully');
        } catch (error) {
            console.error('🔴 Error during page translation:', error);
        }
        
        try {
            console.log('🌐 Updating language selector...');
            this.updateLanguageSelector();
            console.log('🌐 Language selector updated');
        } catch (error) {
            console.error('🔴 Error updating language selector:', error);
        }
        
        console.log('🌐 Language change completed');
    }    translateePage() {
        console.log('🌐 translateePage() iniciado - traduzindo para:', this.currentLang);
        
        try {
            // Hero Section
            console.log('🌐 Traduzindo Hero Section...');
            const heroTitle1 = document.querySelector('.hero-title .title-line:first-child');
            const heroTitle2 = document.querySelector('.hero-title .title-line.highlight');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            
            if (heroTitle1) {
                console.log('🌐 Traduzindo heroTitle1:', this.translate('heroTitle1'));
                heroTitle1.textContent = this.translate('heroTitle1');
            } else {
                console.warn('⚠️ Elemento heroTitle1 não encontrado');
            }
            
            if (heroTitle2) {
                console.log('🌐 Traduzindo heroTitle2:', this.translate('heroTitle2'));
                heroTitle2.textContent = this.translate('heroTitle2');
            } else {
                console.warn('⚠️ Elemento heroTitle2 não encontrado');
            }
            
            if (heroSubtitle) {
                console.log('🌐 Traduzindo heroSubtitle:', this.translate('heroSubtitle'));
                heroSubtitle.innerHTML = this.translate('heroSubtitle');
            } else {
                console.warn('⚠️ Elemento heroSubtitle não encontrado');
            }

            // Buttons
            console.log('🌐 Traduzindo Botões...');
            const exploreBtn = document.querySelector('.cta-button.primary .button-text');
            const docBtn = document.querySelector('.cta-button.secondary .button-text');
            
            if (exploreBtn) {
                exploreBtn.textContent = this.translate('exploreApps');
            } else {
                console.warn('⚠️ Elemento exploreBtn não encontrado');
            }
            
            if (docBtn) {
                docBtn.textContent = this.translate('documentation');
            } else {
                console.warn('⚠️ Elemento docBtn não encontrado');
            }

            // Stats
            console.log('🌐 Traduzindo Stats...');
            const statLabels = document.querySelectorAll('.stat-label');
            const statTranslations = ['appsInDev', 'techIntegrated', 'possibilities'];
            
            if (statLabels.length > 0) {
                statLabels.forEach((label, index) => {
                    if (statTranslations[index]) {
                        label.textContent = this.translate(statTranslations[index]);
                    }
                });
            } else {
                console.warn('⚠️ Elementos statLabels não encontrados');
            }

            // Marketplace
            console.log('🌐 Traduzindo Marketplace...');
            const sectionTitle = document.querySelector('.section-title');
            const sectionSubtitle = document.querySelector('.section-subtitle');
            
            if (sectionTitle) {
                sectionTitle.textContent = this.translate('comingSoon');
            } else {
                console.warn('⚠️ Elemento sectionTitle não encontrado');
            }
            
            if (sectionSubtitle) {
                sectionSubtitle.textContent = this.translate('innovativeApps');
            } else {
                console.warn('⚠️ Elemento sectionSubtitle não encontrado');
            }

            // App descriptions
            console.log('🌐 Traduzindo Descrições de Apps...');
            const appDescriptions = [
                { selector: '[data-app="nexus5"] .app-description', key: 'nexus5Desc' },
                { selector: '[data-app="cerebra7"] .app-description', key: 'cerebra7Desc' },
                { selector: '[data-app="puzzle33"] .app-description', key: 'puzzle33Desc' },
                { selector: '[data-app="docflow4"] .app-description', key: 'docflow4Desc' }
            ];

            appDescriptions.forEach(app => {
                const element = document.querySelector(app.selector);
                if (element) {
                    element.textContent = this.translate(app.key);
                } else {
                    console.warn(`⚠️ Elemento ${app.selector} não encontrado`);
                }
            });

            // Notify buttons
            console.log('🌐 Traduzindo Botões de Notificação...');
            const notifyBtns = document.querySelectorAll('.notify-btn');
            if (notifyBtns.length > 0) {
                notifyBtns.forEach(btn => {
                    // Abordagem direta - substituir o conteúdo após o ícone
                    const icon = btn.querySelector('i');
                    if (icon) {
                        // Limpar o botão e recriar seu conteúdo
                        btn.innerHTML = '';
                        btn.appendChild(icon);
                        btn.appendChild(document.createTextNode(' ' + this.translate('notifyMe')));
                    } else {
                        // Se não encontrar o ícone, apenas atualiza o texto completo
                        btn.textContent = this.translate('notifyMe');
                    }
                });
            } else {
                console.warn('⚠️ Elementos notifyBtns não encontrados');
            }

            // Cookies, Footer e Modals
            console.log('🌐 Traduzindo Cookies, Footer e Modais...');
            try {
                this.translateCookies();
            } catch (error) {
                console.error('🔴 Erro ao traduzir cookies:', error);
            }
            
            try {
                this.translateFooter();
            } catch (error) {
                console.error('🔴 Erro ao traduzir footer:', error);
            }
            
            try {
                this.translateModals();
            } catch (error) {
                console.error('🔴 Erro ao traduzir modais:', error);
            }
            
            console.log('✅ Tradução da página concluída!');
        } catch (error) {
            console.error('🔴 Erro durante a tradução da página:', error);
        }
    }

    translateCookies() {
        const cookieTitle = document.querySelector('.cookie-text h4');
        const cookieText = document.querySelector('.cookie-text p');
        const acceptAllBtn = document.getElementById('acceptAllCookies');
        const rejectBtn = document.getElementById('rejectCookies');
        const configureBtn = document.getElementById('configureCookies');

        if (cookieTitle) cookieTitle.textContent = this.translate('cookieTitle');
        if (cookieText) cookieText.textContent = this.translate('cookieText');
        if (acceptAllBtn) acceptAllBtn.textContent = this.translate('acceptAll');
        if (rejectBtn) rejectBtn.textContent = this.translate('reject');
        if (configureBtn) configureBtn.textContent = this.translate('configure');

        // Cookie settings modal
        const settingsTitle = document.querySelector('.cookie-settings-modal h3');
        if (settingsTitle) settingsTitle.textContent = this.translate('cookieSettings');

        const categoryTitles = document.querySelectorAll('.cookie-category h4');
        const categoryDescs = document.querySelectorAll('.cookie-category p');
        const categoryTranslations = [
            { title: 'essentialCookies', desc: 'essentialDesc' },
            { title: 'analyticalCookies', desc: 'analyticalDesc' },
            { title: 'marketingCookies', desc: 'marketingDesc' }
        ];

        categoryTitles.forEach((title, index) => {
            if (categoryTranslations[index]) {
                title.textContent = this.translate(categoryTranslations[index].title);
            }
        });

        categoryDescs.forEach((desc, index) => {
            if (categoryTranslations[index]) {
                desc.textContent = this.translate(categoryTranslations[index].desc);
            }
        });

        const saveBtn = document.getElementById('saveCookieSettings');
        const acceptAllFromSettingsBtn = document.getElementById('acceptAllFromSettings');
        
        if (saveBtn) saveBtn.textContent = this.translate('savePreferences');
        if (acceptAllFromSettingsBtn) acceptAllFromSettingsBtn.textContent = this.translate('acceptAll');
    }    translateFooter() {
        // Traduzir links do rodapé (se existirem)
        const footerLinks = document.querySelectorAll('.footer-links a');
        const linkTranslations = ['contact', 'terms', 'privacy', 'configureCookies'];
        footerLinks.forEach((link, index) => {
            if (linkTranslations[index]) {
                link.textContent = this.translate(linkTranslations[index]);
            }
        });

        // Traduzir slogan da empresa
        const companyTagline = document.querySelector('.company-tagline');
        if (companyTagline) {
            companyTagline.textContent = this.translate('companyTagline');
        }

        // Traduzir informação de estabelecimento
        const established = document.querySelector('.established');
        if (established) {
            established.textContent = this.translate('established');
        }

        // Traduzir copyright
        const signature = document.querySelector('.footer-signature .copyright-info p:first-child');
        if (signature) {
            signature.textContent = this.translate('footerSignature');
        }

        // Traduzir informação de propriedade
        const ownershipText = document.querySelector('.ownership-info p:first-child');
        if (ownershipText) {
            ownershipText.innerHTML = this.translate('ownershipInfo').replace('Prismas e Quadriláteros Unip. Lda.', '<strong>Prismas e Quadriláteros Unip. Lda.</strong>');
        }

        // Traduzir links legais no copyright
        const legalLinks = document.querySelectorAll('.legal-links a');
        const legalLinkTranslations = ['contact', 'privacy', 'terms', 'configureCookies'];
        legalLinks.forEach((link, index) => {
            if (legalLinkTranslations[index]) {
                link.textContent = this.translate(legalLinkTranslations[index]);
            }
        });
    }

    translateModals() {
        // Notify modal
        const notifyModalTitle = document.querySelector('#notifyModal h3');
        const notifyModalText = document.getElementById('modalText');
        const emailInput = document.getElementById('emailInput');
        const notifyBtn = document.querySelector('#notifyForm button[type="submit"]');
        const successMessage = document.querySelector('#successMessage span');

        if (notifyModalTitle) notifyModalTitle.textContent = this.translate('notifyModalTitle');
        if (notifyModalText) notifyModalText.textContent = this.translate('notifyModalText');
        if (emailInput) emailInput.placeholder = this.translate('emailPlaceholder');
        if (notifyBtn) notifyBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${this.translate('notifyButton')}`;
        if (successMessage) successMessage.textContent = this.translate('thankYou');
        
        // Contact modal
        const contactModalTitle = document.querySelector('#contactModal .modal-header h3');
        const contactModalIntro = document.querySelector('#contactModal p');
        const contactNameLabel = document.querySelector('label[for="contactName"]');
        const contactNameInput = document.getElementById('contactName');
        const contactEmailLabel = document.querySelector('label[for="contactEmail"]');
        const contactEmailInput = document.getElementById('contactEmail');
        const contactSubjectLabel = document.querySelector('label[for="contactSubject"]');
        const contactSubjectInput = document.getElementById('contactSubject');
        const contactMessageLabel = document.querySelector('label[for="contactMessage"]');
        const contactMessageInput = document.getElementById('contactMessage');
        const contactSendBtn = document.getElementById('contactSubmitBtn');
        const contactSuccessMessage = document.querySelector('#contactSuccessMessage span');

        if (contactModalTitle) contactModalTitle.textContent = this.translate('contactModalTitle');
        if (contactModalIntro) contactModalIntro.textContent = this.translate('contactModalIntro');
        if (contactNameLabel) contactNameLabel.textContent = this.translate('contactNameLabel');
        if (contactNameInput) contactNameInput.placeholder = this.translate('contactNamePlaceholder');
        if (contactEmailLabel) contactEmailLabel.textContent = this.translate('contactEmailLabel');
        if (contactEmailInput) contactEmailInput.placeholder = this.translate('contactEmailPlaceholder');
        if (contactSubjectLabel) contactSubjectLabel.textContent = this.translate('contactSubjectLabel');
        if (contactSubjectInput) contactSubjectInput.placeholder = this.translate('contactSubjectPlaceholder');
        if (contactMessageLabel) contactMessageLabel.textContent = this.translate('contactMessageLabel');
        if (contactMessageInput) contactMessageInput.placeholder = this.translate('contactMessagePlaceholder');
        if (contactSendBtn) contactSendBtn.innerHTML = `<i class=\"fas fa-paper-plane\"></i> ${this.translate('contactSendButton')}`;
        if (contactSuccessMessage) contactSuccessMessage.textContent = this.translate('contactFormSuccess');

        // Terms & Privacy modals
        const termsTitle = document.querySelector('#termsModal .modal-header h3');
        if (termsTitle) termsTitle.textContent = this.translate('terms');
        const privacyTitle = document.querySelector('#privacyModal .modal-header h3');
        if (privacyTitle) privacyTitle.textContent = this.translate('privacy');
        const cookieSettingsTitle = document.querySelector('#cookieSettingsModal .modal-header h3');
        if (cookieSettingsTitle) cookieSettingsTitle.textContent = this.translate('cookieSettings');

        // Also translate all h4 and static text in privacy/terms/cookies modals
        // Privacy Policy
        const privacyContent = document.querySelector('#privacyModal .privacy-content');
        if (privacyContent) {
            const h4s = privacyContent.querySelectorAll('h4');
            const ps = privacyContent.querySelectorAll('p');
            const uls = privacyContent.querySelectorAll('ul');
            // Add translation keys for each section if not present
            const privacyKeys = [
                'privacySection1', 'privacySection2', 'privacySection3', 'privacySection4', 'privacySection5', 'privacySection6', 'privacySection7', 'privacySection8'
            ];
            h4s.forEach((h4, i) => {
                if (this.translations[this.currentLang][privacyKeys[i]]) {
                    h4.textContent = this.translate(privacyKeys[i]);
                }
            });
            // Optionally translate paragraphs and list items if you add keys
        }
        // Terms & Conditions
        const termsContent = document.querySelector('#termsModal .terms-content');
        if (termsContent) {
            const h4s = termsContent.querySelectorAll('h4');
            const ps = termsContent.querySelectorAll('p');
            const termsKeys = [
                'termsSection1', 'termsSection2', 'termsSection3', 'termsSection4', 'termsSection5', 'termsSection6', 'termsSection7'
            ];
            h4s.forEach((h4, i) => {
                if (this.translations[this.currentLang][termsKeys[i]]) {
                    h4.textContent = this.translate(termsKeys[i]);
                }
            });
        }
    }    setupLanguageSelector() {
        console.log('🌐 setupLanguageSelector chamado');
        
        // Verificar se a função global de inicialização existe
        if (window.initializeLanguageSwitchers) {
            console.log('🌐 Usando função global initializeLanguageSwitchers para configurar seletores');
            window.initializeLanguageSwitchers();
        } else {
            // Se não existir, cai para o comportamento padrão
            console.log('🌐 Usando comportamento padrão para configurar seletores');
            this.updateLanguageSelector();
            
            // Tentar adicionar clique manual nos botões
            const langBtns = document.querySelectorAll('.lang-btn');
            console.log(`🌐 Encontrados ${langBtns.length} botões para configurar manualmente`);
            
            langBtns.forEach(btn => {
                let lang = null;
                
                if (btn.hasAttribute('data-lang')) {
                    lang = btn.getAttribute('data-lang');
                } else if (btn.hasAttribute('href')) {
                    lang = btn.getAttribute('href').replace('#', '');
                }
                
                if (lang) {
                    console.log(`🌐 Configurando clique para botão ${lang}`);
                    
                    // Remover eventos existentes
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Adicionar novo evento de clique
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log(`🌐 Botão ${lang} clicado através do setupLanguageSelector`);
                        this.setLanguage(lang);
                    });
                }
            });
        }
    }updateLanguageSelector() {
        console.log('updateLanguageSelector called, current lang:', this.currentLang);
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            // Verificar todas as possíveis fontes para o idioma do botão
            let lang = null;
            
            // Primeiro, verificar data-lang (mais explícito)
            if (btn.hasAttribute('data-lang')) {
                lang = btn.getAttribute('data-lang');
            } 
            // Segundo, verificar href
            else if (btn.hasAttribute('href')) {
                lang = btn.getAttribute('href').replace('#', '');
            }
            // Por último, tentar inferir do texto
            else {
                const text = btn.textContent.trim().toLowerCase();
                if (text === 'pt' || text === 'português') {
                    lang = 'pt';
                } else if (text === 'en' || text === 'english') {
                    lang = 'en';
                }
            }
            
            if (lang) {
                const isActive = lang === this.currentLang;
                console.log(`Language button: ${lang}, current: ${this.currentLang}, active: ${isActive}`);
                btn.classList.toggle('active', isActive);
                
                // Se identificamos o idioma, garantir que o elemento tem href e data-lang
                if (!btn.hasAttribute('href')) {
                    btn.setAttribute('href', `#${lang}`);
                }
                if (!btn.hasAttribute('data-lang')) {
                    btn.setAttribute('data-lang', lang);
                }
            }
        });
        
        // Tentar chamar a função global de inicialização se existir
        if (window.initializeLanguageSwitchers) {
            // Não é necessário chamar aqui, apenas se as bandeiras forem alteradas manualmente
        }
    }
}

// Global Variables
let cookieManager;
let i18n;

// ===== COOKIE MANAGEMENT SYSTEM =====
class CookieManager {
    constructor() {
        this.cookieConsent = this.getCookieConsent();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkCookieConsent();
    }

    setupEventListeners() {
        // Cookie Banner Events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'acceptAllCookies') {
                this.acceptAllCookies();
            } else if (e.target.id === 'rejectCookies') {
                this.rejectAllCookies();
            } else if (e.target.id === 'configureCookies') {
                this.openCookieSettings();
            } else if (e.target.id === 'closeCookieSettings') {
                this.closeCookieSettings();
            } else if (e.target.id === 'saveCookieSettings') {
                this.saveCookiePreferences();
            } else if (e.target.id === 'acceptAllFromSettings') {
                this.acceptAllFromSettings();
            } else if (e.target.id === 'closePrivacy') {
                this.closeModal('privacyModal');
            } else if (e.target.id === 'closeTerms') {
                this.closeModal('termsModal');
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    checkCookieConsent() {
        console.log('Checking cookie consent:', this.cookieConsent);
        if (!this.cookieConsent.hasConsented) {
            setTimeout(() => this.showCookieBanner(), 1000);
        }
    }

    showCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        console.log('Showing cookie banner:', banner);
        if (banner) {
            banner.classList.add('show');
        }
    }

    hideCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        console.log('Hiding cookie banner:', banner);
        if (banner) {
            banner.classList.remove('show');
        }
    }

    acceptAllCookies() {
        console.log('Accepting all cookies');
        const consent = {
            hasConsented: true,
            essential: true,
            analytical: true,
            marketing: true,
            timestamp: Date.now()
        };
        
        this.setCookieConsent(consent);
        this.hideCookieBanner();
        this.showNotification('Preferências de cookies guardadas!', 'success');
        this.enableAnalytics();
        this.enableMarketing();
    }

    rejectAllCookies() {
        console.log('Rejecting all cookies');
        const consent = {
            hasConsented: true,
            essential: true,
            analytical: false,
            marketing: false,
            timestamp: Date.now()
        };
          this.setCookieConsent(consent);
        this.hideCookieBanner();
        this.showNotification(i18n ? i18n.translate('essentialOnly') : 'Apenas cookies essenciais foram mantidos.', 'info');
        this.disableAnalytics();
        this.disableMarketing();
    }

    openCookieSettings() {
        console.log('Opening cookie settings');
        this.hideCookieBanner();
        this.showModal('cookieSettingsModal');
        this.loadCookiePreferences();
    }

    closeCookieSettings() {
        this.closeModal('cookieSettingsModal');
        if (!this.cookieConsent.hasConsented) {
            setTimeout(() => this.showCookieBanner(), 500);
        }
    }

    saveCookiePreferences() {
        const analytical = document.getElementById('analyticalCookies')?.checked || false;
        const marketing = document.getElementById('marketingCookies')?.checked || false;
        
        const consent = {
            hasConsented: true,
            essential: true,
            analytical: analytical,
            marketing: marketing,
            timestamp: Date.now()
        };
          this.setCookieConsent(consent);
        this.closeModal('cookieSettingsModal');
        this.showNotification(i18n ? i18n.translate('cookiesSaved') : 'Preferências de cookies guardadas!', 'success');
        
        if (analytical) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        if (marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }
    }

    acceptAllFromSettings() {
        const analyticalCheckbox = document.getElementById('analyticalCookies');
        const marketingCheckbox = document.getElementById('marketingCookies');
        
        if (analyticalCheckbox) analyticalCheckbox.checked = true;
        if (marketingCheckbox) marketingCheckbox.checked = true;
        
        this.saveCookiePreferences();
    }

    loadCookiePreferences() {
        const consent = this.getCookieConsent();
        const analyticalCheckbox = document.getElementById('analyticalCookies');
        const marketingCheckbox = document.getElementById('marketingCookies');
        
        if (analyticalCheckbox) analyticalCheckbox.checked = consent.analytical;
        if (marketingCheckbox) marketingCheckbox.checked = consent.marketing;
    }

    getCookieConsent() {
        const consent = localStorage.getItem('prismas33_cookie_consent');
        if (consent) {
            try {
                return JSON.parse(consent);
            } catch (e) {
                console.error('Error parsing cookie consent:', e);
            }
        }
        return {
            hasConsented: false,
            essential: true,
            analytical: false,
            marketing: false,
            timestamp: null
        };
    }

    setCookieConsent(consent) {
        localStorage.setItem('prismas33_cookie_consent', JSON.stringify(consent));
        this.cookieConsent = consent;
        console.log('Cookie consent saved:', consent);
    }

    enableAnalytics() {
        console.log('Analytics enabled');
        // Here you would initialize Google Analytics, etc.
    }

    disableAnalytics() {
        console.log('Analytics disabled');
        // Here you would disable/remove analytics tracking
    }

    enableMarketing() {
        console.log('Marketing cookies enabled');
        // Here you would enable marketing tracking, pixels, etc.
    }

    disableMarketing() {
        console.log('Marketing cookies disabled');
        // Here you would disable marketing tracking
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');
        
        if (!icon || !text) return;
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `notification-icon ${icons[type] || icons.info}`;
        text.textContent = message;
        
        // Reset classes
        notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// ===== MODAL FUNCTIONS =====
function openPrivacyModal() {
    if (cookieManager) {
        cookieManager.showModal('privacyModal');
    }
}

function openTermsModal() {
    if (cookieManager) {
        cookieManager.showModal('termsModal');
    }
}

function openCookieSettingsModal() {
    if (cookieManager) {
        cookieManager.showModal('cookieSettingsModal');
        cookieManager.loadCookiePreferences();
    }
}

// ===== MARKETPLACE FUNCTIONS =====
function scrollToMarketplace() {
    const marketplace = document.getElementById('marketplace');
    if (marketplace) {
        marketplace.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function openNotifyModal(appName) {
    const modal = document.getElementById('notifyModal');
    const appNameInput = document.getElementById('appName');
    const modalText = document.getElementById('modalText');
    
    if (modal && appNameInput && modalText) {
        const appTitles = {
            'nexus5': 'Nexus 5',
            'cerebra7': 'Cerebra 7',
            'puzzle33': 'Puzzle 33',
            'docflow4': 'DocFlow 4'
        };        appNameInput.value = appName;
        const baseText = i18n ? i18n.translate('notifyModalText') : 'Seja notificado quando esta aplicação estiver disponível!';
        modalText.textContent = baseText.replace('esta aplicação', appTitles[appName] || 'esta aplicação');
        modal.style.display = 'block';
    }
}

function closeNotifyModal() {
    const modal = document.getElementById('notifyModal');
    const form = document.getElementById('notifyForm');
    const successMessage = document.getElementById('successMessage');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (form) {
        form.style.display = 'block';
    }
    
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function handleNotifySubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const appName = document.getElementById('appName').value;
    const form = document.getElementById('notifyForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Check if marketing cookies are accepted
    if (cookieManager && !cookieManager.cookieConsent.marketing) {
        if (cookieManager) {
            cookieManager.showNotification(i18n ? i18n.translate('marketingRequired') : 'Para receber notificações, precisa aceitar cookies de marketing nas configurações.', 'info');
        }
        return;
    }
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
    
    // Try to save to Firebase Firestore
    if (window.firestoreDb && window.firestoreCollection && window.firestoreAddDoc && window.firestoreServerTimestamp) {
        const notificationsRef = window.firestoreCollection(window.firestoreDb, 'notifications');
        
        const notificationData = {
            email: email,
            appName: appName,
            timestamp: window.firestoreServerTimestamp(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer || 'direct',
            status: 'pending'
        };
        
        window.firestoreAddDoc(notificationsRef, notificationData)
            .then((docRef) => {
                console.log('✅ Notificação salva no Firestore com ID:', docRef.id);
                
                // Also store locally as backup
                const notifications = JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
                notifications.push({
                    id: docRef.id,
                    email: email,
                    app: appName,
                    timestamp: new Date().toISOString(),
                    saved_to_firebase: true
                });
                localStorage.setItem('prismas33_notifications', JSON.stringify(notifications));
                
                // Show success
                showSubmissionSuccess(form, successMessage, submitBtn);
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar no Firestore:', error);
                
                // Fallback to localStorage only
                const notifications = JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
                notifications.push({
                    email: email,
                    app: appName,
                    timestamp: new Date().toISOString(),
                    saved_to_firebase: false,
                    error: error.message
                });
                localStorage.setItem('prismas33_notifications', JSON.stringify(notifications));
                
                // Show success anyway (user doesn't need to know about technical issues)
                showSubmissionSuccess(form, successMessage, submitBtn);
            });
    } else {
        console.warn('⚠️ Firebase não disponível, salvando apenas localmente');
        
        // Fallback to localStorage only
        const notifications = JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
        notifications.push({
            email: email,
            app: appName,
            timestamp: new Date().toISOString(),
            saved_to_firebase: false,
            error: 'Firebase not available'
        });
        localStorage.setItem('prismas33_notifications', JSON.stringify(notifications));
        
        // Show success
        setTimeout(() => {
            showSubmissionSuccess(form, successMessage, submitBtn);
        }, 1000);
    }
}

function showSubmissionSuccess(form, successMessage, submitBtn) {
    if (form) form.style.display = 'none';
    if (successMessage) successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        closeNotifyModal();
        if (cookieManager) {
            cookieManager.showNotification(i18n ? i18n.translate('notificationSuccess') : 'Notificação registada com sucesso!', 'success');
        }
        
        // Reset form for next use
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        if (successMessage) successMessage.classList.add('hidden');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Notificar-me';
        }
    }, 2000);
}

function showComingSoon() {
    if (cookieManager && i18n) {
        cookieManager.showNotification(i18n.translate('comingSoonText'), 'info');
    }
}

// ===== PRIVACY COMPLIANCE UTILITIES =====
function requestDataDeletion() {
    localStorage.removeItem('prismas33_cookie_consent');    localStorage.removeItem('prismas33_notifications');
    if (cookieManager) {
        cookieManager.showNotification(i18n ? i18n.translate('dataDeleted') : 'Todos os dados locais foram removidos.', 'success');
    }
}

function exportUserData() {
    const data = {
        cookieConsent: localStorage.getItem('prismas33_cookie_consent'),
        notifications: localStorage.getItem('prismas33_notifications'),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prismas33-dados-pessoais.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);    URL.revokeObjectURL(url);
    
    if (cookieManager) {
        cookieManager.showNotification(i18n ? i18n.translate('dataExported') : 'Dados pessoais exportados com sucesso.', 'success');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CookieManager');
    cookieManager = new CookieManager();
    i18n = new I18n();
    
    // Make i18n globally available
    window.i18n = i18n;
    
    // Initialize language switcher after i18n is created
    initializeLanguageSwitchers();
    
    // Setup modal close buttons
    setupModalCloseButtons();
    
    // Make functions globally available
    window.openPrivacyModal = openPrivacyModal;
    window.openTermsModal = openTermsModal;
    window.openCookieSettingsModal = openCookieSettingsModal;
    window.scrollToMarketplace = scrollToMarketplace;    window.openNotifyModal = openNotifyModal;
    window.closeNotifyModal = closeNotifyModal;
    window.handleNotifySubmit = handleNotifySubmit;
    window.showComingSoon = showComingSoon;
    window.requestDataDeletion = requestDataDeletion;
    window.exportUserData = exportUserData;
    window.openContactModal = openContactModal;
    window.closeContactModal = closeContactModal;
    window.handleContactSubmit = handleContactSubmit;
    window.sendContactEmail = sendContactEmail;
});

// Setup modal close buttons
function setupModalCloseButtons() {
    // Close button for notify modal
    const closeNotify = document.getElementById('closeNotify');
    if (closeNotify) {
        closeNotify.onclick = closeNotifyModal;
    }
    
    // Close button for contact modal
    const closeContact = document.getElementById('closeContact');
    if (closeContact) {
        closeContact.onclick = closeContactModal;
    }
    
    // Close button for privacy modal
    const closePrivacy = document.getElementById('closePrivacy');
    if (closePrivacy) {
        closePrivacy.onclick = () => {
            const modal = document.getElementById('privacyModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
    
    // Close button for terms modal
    const closeTerms = document.getElementById('closeTerms');
    if (closeTerms) {
        closeTerms.onclick = () => {
            const modal = document.getElementById('termsModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
    
    // Close button for cookie settings modal
    const closeCookieSettings = document.getElementById('closeCookieSettings');
    if (closeCookieSettings) {
        closeCookieSettings.onclick = () => {
            const modal = document.getElementById('cookieSettingsModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const modals = ['notifyModal', 'contactModal', 'privacyModal', 'termsModal', 'cookieSettingsModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    };
}

// Initialize language switchers
function initializeLanguageSwitchers() {
    console.log('Initializing language switchers...');
    
    if (!window.i18n) {
        console.warn('i18n object not available');
        return;
    }
    
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Found', langButtons.length, 'language buttons');
    
    if (!langButtons.length) {
        console.warn('No language buttons found');
        return;
    }
    
    // Remove any existing event listeners first
    langButtons.forEach((button, index) => {
        // Create a new clean button to avoid listener conflicts
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Get the fresh buttons
    const freshButtons = document.querySelectorAll('.lang-btn');
    
    // Add click event to each language button
    freshButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.getAttribute('href'));
        
        // Add event listener that captures clicks on the button or its children
        button.addEventListener('click', function(e) {
            console.log('Language button clicked!', this.getAttribute('href'));
            e.preventDefault();
            e.stopPropagation();
            
            // Get the language code from href attribute
            const href = this.getAttribute('href');
            if (!href) {
                console.error('No href attribute found on button');
                return;
            }
            
            const lang = href.replace('#', '');
            console.log('Switching to language:', lang);
            
            if (lang && window.i18n) {
                try {
                    // Set language using the I18n class method
                    window.i18n.setLanguage(lang);
                    console.log('Language change completed successfully');
                    
                    // Update active states
                    updateLanguageActiveState();
                } catch (error) {
                    console.error('Error during language switch:', error);
                }
            } else {
                console.error('Could not determine language or i18n not available');
            }
        });
        
        // Also add styles to ensure the button and its contents are clickable
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        
        // Ensure spans inside don't interfere
        const spans = button.querySelectorAll('span');
        spans.forEach(span => {
            span.style.pointerEvents = 'none';
        });
    });
    
    // Set initial active state
    updateLanguageActiveState();
    console.log('Language switchers initialized successfully');
}

// Update active state of language buttons
function updateLanguageActiveState() {
    console.log('Updating language active state...');
    
    if (!window.i18n) {
        console.warn('i18n object not available for updating active state');
        return;
    }
    
    const currentLang = window.i18n.currentLang;
    const langButtons = document.querySelectorAll('.lang-btn');
    
    console.log(`Current language: ${currentLang}, buttons found: ${langButtons.length}`);
    
    langButtons.forEach(btn => {
        const btnLang = btn.getAttribute('href').replace('#', '');
        const shouldBeActive = btnLang === currentLang;
        
        console.log(`Button ${btnLang}: should be active = ${shouldBeActive}`);
        
        // Remove and add class as needed
        if (shouldBeActive) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    console.log('Active state update completed');
}

// ===== CONTACT MODAL FUNCTIONS =====
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const form = document.getElementById('contactForm');
        if (form) form.reset();
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('contactName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function sendContactEmail(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('contactSubmitBtn');
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('contactSuccessMessage');
    const successMessageText = successMessage ? successMessage.querySelector('span') : null;
    if (!form || !submitBtn) return;

    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');    // Validate required fields
    if (!name || !email || !subject || !message) {
        showNotification('error', i18n ? i18n.translate('contactFormRequired') : 'Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Tradução dinâmica do botão
    const sendingText = i18n ? (i18n.currentLang === 'en' ? 'Sending...' : 'A enviar...') : 'A enviar...';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${sendingText}`;    // Envio via EmailJS
    emailjs.send('service_ol8niqo', 'template_i0h927g', {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message
    }, 'BABNdz0y37DwfGJ9P')
    .then(function(response) {
        // Hide form, show success message inside modal
        if (form) form.style.display = 'none';
        if (successMessage && successMessageText) {
            successMessageText.textContent = i18n ? i18n.translate('contactFormSuccess') : 'Mensagem enviada com sucesso!';
            successMessage.classList.remove('hidden');
        }
        // Reset button immediately
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${i18n ? i18n.translate('contactSendButton') : 'Enviar Mensagem'}`;
        // Optionally clear fields
        form.reset();
        // Close modal after delay
        setTimeout(() => {
            if (successMessage) successMessage.classList.add('hidden');
            if (form) form.style.display = 'block';
            closeContactModal();
        }, 2200);    }, function(error) {
        showNotification('error', i18n ? i18n.translate('contactFormError') : 'Ocorreu um erro ao enviar. Tente novamente.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${i18n ? i18n.translate('contactSendButton') : 'Enviar Mensagem'}`;
    });
}

function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
      // Validate required fields
    if (!name || !email || !subject || !message) {
        showNotification('error', i18n ? i18n.translate('contactFormRequired') : 'Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('error', 'Por favor, insira um email válido.');
        return;
    }
    
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('contactSuccessMessage');
    const submitBtn = document.getElementById('contactSubmitBtn');
    
    if (!submitBtn) return;
    
    // Disable submit button and show loading
    const sendingText = i18n ? i18n.translate('contactSending') : 'A enviar...';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${sendingText}`;      // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS not loaded');
        showNotification('error', 'Serviço de email não disponível. Tente novamente mais tarde.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${i18n ? i18n.translate('contactSendButton') : 'Enviar Mensagem'}`;
        return;
    }
      // Send email via EmailJS
    emailjs.send('service_ol8niqo', 'template_i0h927g', {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message
    }, 'BABNdz0y37DwfGJ9P')
    .then(function(response) {
        console.log('Email sent successfully:', response);
        
        // Hide form, show success message
        if (form) form.style.display = 'none';
        if (successMessage) {
            const successText = successMessage.querySelector('span');
            if (successText) {
                successText.textContent = i18n ? i18n.translate('contactFormSuccess') : 'Mensagem enviada com sucesso!';
            }
            successMessage.classList.remove('hidden');
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${i18n ? i18n.translate('contactSendButton') : 'Enviar Mensagem'}`;
        
        // Clear form
        form.reset();
        
        // Close modal after delay
        setTimeout(() => {
            if (successMessage) successMessage.classList.add('hidden');
            if (form) form.style.display = 'block';
            closeContactModal();
        }, 2500);          }, function(error) {
        console.error('Email send error:', error);
        showNotification('error', i18n ? i18n.translate('contactFormError') : 'Ocorreu um erro ao enviar. Tente novamente.');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${i18n ? i18n.translate('contactSendButton') : 'Enviar Mensagem'}`;
    });
}

// NOTE: Language switching functionality is now handled by language-switcher.js

// Show notification function (if not already defined)
function showNotification(type, message, duration = 5000) {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
    const notificationText = notification.querySelector('.notification-text');
    const notificationIcon = notification.querySelector('.notification-icon');
    
    if (!notificationText || !notificationIcon) {
        console.error('Notification elements not found');
        return;
    }
    
    // Set notification text
    notificationText.textContent = message;
    
    // Set appropriate icon based on type
    notification.className = 'notification show ' + type;
    
    if (type === 'success') {
        notificationIcon.className = 'notification-icon fas fa-check-circle';
    } else if (type === 'error') {
        notificationIcon.className = 'notification-icon fas fa-exclamation-circle';
    } else if (type === 'info') {
        notificationIcon.className = 'notification-icon fas fa-info-circle';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}
