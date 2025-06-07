// Prismas 33 - JavaScript Functions

// Global Variables
let cookieManager;

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
        this.showNotification('Apenas cookies essenciais foram mantidos.', 'info');
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
        this.showNotification('Preferências de cookies guardadas!', 'success');
        
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
        };
        
        appNameInput.value = appName;
        modalText.textContent = `Seja notificado quando o ${appTitles[appName]} estiver disponível!`;
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
    
    // Check if marketing cookies are accepted
    if (cookieManager && !cookieManager.cookieConsent.marketing) {
        if (cookieManager) {
            cookieManager.showNotification('Para receber notificações, precisa aceitar cookies de marketing nas configurações.', 'info');
        }
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.classList.remove('hidden');
        
        // Store notification request
        const notifications = JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
        notifications.push({
            email: email,
            app: appName,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('prismas33_notifications', JSON.stringify(notifications));
        
        setTimeout(() => {
            closeNotifyModal();
            if (cookieManager) {
                cookieManager.showNotification('Notificação registada com sucesso!', 'success');
            }
        }, 2000);
    }, 1000);
}

function showComingSoon() {
    if (cookieManager) {
        cookieManager.showNotification('Esta funcionalidade estará disponível em breve!', 'info');
    }
}

// ===== PRIVACY COMPLIANCE UTILITIES =====
function requestDataDeletion() {
    localStorage.removeItem('prismas33_cookie_consent');
    localStorage.removeItem('prismas33_notifications');
    if (cookieManager) {
        cookieManager.showNotification('Todos os dados locais foram removidos.', 'success');
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
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (cookieManager) {
        cookieManager.showNotification('Dados pessoais exportados com sucesso.', 'success');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CookieManager');
    cookieManager = new CookieManager();
    
    // Make functions globally available
    window.openPrivacyModal = openPrivacyModal;
    window.openTermsModal = openTermsModal;
    window.openCookieSettingsModal = openCookieSettingsModal;
    window.scrollToMarketplace = scrollToMarketplace;
    window.openNotifyModal = openNotifyModal;
    window.closeNotifyModal = closeNotifyModal;
    window.handleNotifySubmit = handleNotifySubmit;
    window.showComingSoon = showComingSoon;
    window.requestDataDeletion = requestDataDeletion;
    window.exportUserData = exportUserData;
});
