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

    // Verificar se os botões de idioma precisam ser inicializados manualmente
    setTimeout(() => {
        if (window.initializeLanguageSwitchers) {
            console.log('Inicializando seletores de idioma automaticamente');
            window.initializeLanguageSwitchers();
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
