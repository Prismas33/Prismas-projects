// SafeCallKids JavaScript - Clean Version (Direct Download Only)
// Language Switching and Direct APK Download

class SafeCallKids {
    constructor() {
        this.currentLanguage = 'pt';
        // Direct APK URL from Firebase Storage
        this.currentApkUrl = 'https://firebasestorage.googleapis.com/v0/b/prismas33-1914c.firebasestorage.app/o/apks%2Fsafecallkids_1749638790127.apk?alt=media&token=68ef2062-c4ea-4450-939b-be8605fbffab';
        this.init();
    }

    init() {
        this.setupLanguageSwitcher();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupAnimations();
        this.setupDownloadButtons();
    }

    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });

        // Set initial language
        this.updateLanguageContent(this.currentLanguage);
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Update content
        this.updateLanguageContent(lang);
        this.updateMetaContent(lang);
    }

    updateLanguageContent(lang) {
        const elements = document.querySelectorAll('[data-pt][data-en]');
        
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    updateMetaContent(lang) {
        const titles = {
            pt: 'SafeCallKids - Protegendo Crianças de Chamadas Indesejadas',
            en: 'SafeCallKids - Protecting Children from Unwanted Calls'
        };

        const descriptions = {
            pt: 'SafeCallKids protege suas crianças bloqueando chamadas de números desconhecidos. Apenas contatos salvos podem ligar.',
            en: 'SafeCallKids protects your children by blocking calls from unknown numbers. Only saved contacts can call.'
        };

        document.title = titles[lang];
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', descriptions[lang]);
        }
    }

    setupScrollEffects() {
        const header = document.querySelector('.header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });

        // Smooth scrolling for anchor links
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 70; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
                
                // Toggle icon
                const icon = menuToggle.querySelector('i');
                if (menuToggle.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });

            // Close menu when clicking on a link
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.querySelector('i').className = 'fas fa-bars';
                });
            });
        }
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .step-card, .stat-card');
        animateElements.forEach(el => observer.observe(el));

        // Setup counter animation
        this.setupCounterAnimation();
    }

    setupCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const start = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(target * easeOutQuart);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        updateCounter();
    }    setupDownloadButtons() {
        // Google Play buttons - Show "Coming Soon" message
        const playStoreButtons = document.querySelectorAll('#playstore-btn, #playstore-download');
        playStoreButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'translateY(-2px)';
                }, 100);

                // Show "Coming Soon" message
                this.showNotification(
                    this.currentLanguage === 'pt' 
                        ? 'Em breve na Google Play Store! Por enquanto, use o download direto da APK.' 
                        : 'Coming soon to Google Play Store! For now, use the direct APK download.'
                );
            });
        });

        // APK Direct download buttons - Actually download
        const apkButtons = document.querySelectorAll('#apk-download-btn, #apk-direct-download');
        apkButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'translateY(-2px)';
                }, 100);

                // Download directly
                this.downloadApk();
            });
        });
    }

    downloadApk() {
        if (this.currentApkUrl) {
            // Create download link
            const link = document.createElement('a');
            link.href = this.currentApkUrl;
            link.download = 'SafeCallKids.apk';
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification(
                this.currentLanguage === 'pt' 
                    ? 'Download iniciado! Verifique sua pasta de downloads.' 
                    : 'Download started! Check your downloads folder.'
            );
        } else {
            this.showNotification(
                this.currentLanguage === 'pt' 
                    ? 'Erro: Link de download não encontrado.' 
                    : 'Error: Download link not found.'
            );
        }
    }

    showNotification(message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #5DADE2 0%, #3498DB 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // Utility method to detect user's preferred language
    detectLanguage() {
        const browserLang = navigator.language.slice(0, 2);
        return ['pt', 'en'].includes(browserLang) ? browserLang : 'en';
    }
}

// Global function for language switching (called from HTML)
function switchLanguage(lang) {
    if (window.safeCallKidsApp) {
        window.safeCallKidsApp.switchLanguage(lang);
    }
}

// Prismas modal functions
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openCookieSettingsModal() {
    const modal = document.getElementById('cookieSettingsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Contact Form Handler
function handleContactSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('contactSubmitBtn');
    const successMessage = document.getElementById('contactSuccessMessage');
    const form = document.getElementById('contactForm');
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simulate sending (replace with actual email service)
    setTimeout(() => {
        form.style.display = 'none';
        successMessage.classList.remove('hidden');
        
        // Reset form after 3 seconds
        setTimeout(() => {
            form.style.display = 'block';
            successMessage.classList.add('hidden');
            form.reset();
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            submitBtn.disabled = false;
            closeModal('contactModal');
        }, 3000);
    }, 2000);
}

// Cookie Management Functions
function showCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner && !localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            banner.style.display = 'flex';
        }, 1000);
    }
}

function acceptAllCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('analyticalCookies', 'true');
    localStorage.setItem('marketingCookies', 'true');
    document.getElementById('cookieBanner').style.display = 'none';
}

function rejectAllCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('analyticalCookies', 'false');
    localStorage.setItem('marketingCookies', 'false');
    document.getElementById('cookieBanner').style.display = 'none';
    closeModal('cookieSettingsModal');
}

function saveCookiePreferences() {
    const analytical = document.getElementById('analyticalCookies').checked;
    const marketing = document.getElementById('marketingCookies').checked;
    
    localStorage.setItem('cookieConsent', 'customized');
    localStorage.setItem('analyticalCookies', analytical);
    localStorage.setItem('marketingCookies', marketing);
    
    document.getElementById('cookieBanner').style.display = 'none';
    closeModal('cookieSettingsModal');
}

function showComingSoon() {
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-clock"></i>
            <span>Em breve disponível!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modal Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Contact Modal
    const closeContact = document.getElementById('closeContact');
    if (closeContact) {
        closeContact.addEventListener('click', () => closeModal('contactModal'));
    }
    
    // Privacy Modal
    const closePrivacy = document.getElementById('closePrivacy');
    if (closePrivacy) {
        closePrivacy.addEventListener('click', () => closeModal('privacyModal'));
    }
    
    // Terms Modal
    const closeTerms = document.getElementById('closeTerms');
    if (closeTerms) {
        closeTerms.addEventListener('click', () => closeModal('termsModal'));
    }
    
    // Cookie Settings Modal
    const closeCookieSettings = document.getElementById('closeCookieSettings');
    if (closeCookieSettings) {
        closeCookieSettings.addEventListener('click', () => closeModal('cookieSettingsModal'));
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = ['contactModal', 'privacyModal', 'termsModal', 'cookieSettingsModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) {
                closeModal(modalId);
            }
        });
    });
    
    // Load cookie preferences
    const analyticalCookies = document.getElementById('analyticalCookies');
    const marketingCookies = document.getElementById('marketingCookies');
    
    if (analyticalCookies) {
        analyticalCookies.checked = localStorage.getItem('analyticalCookies') === 'true';
    }
    if (marketingCookies) {
        marketingCookies.checked = localStorage.getItem('marketingCookies') === 'true';
    }
    
    // Show cookie banner if needed
    showCookieBanner();
});

// Additional CSS for mobile menu and animations (injected via JavaScript)
const additionalStyles = `
    @media (max-width: 768px) {
        .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 999;
        }

        .nav-links.active {
            transform: translateX(0);
        }

        .nav-links a {
            font-size: 1.2rem;
            margin: 1rem 0;
            padding: 1rem 2rem;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .nav-links a:hover {
            background: rgba(93, 173, 226, 0.1);
            transform: translateX(10px);
        }

        .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: none;
            background: none;
            cursor: pointer;
            z-index: 1000;
        }

        .mobile-menu-toggle i {
            font-size: 1.5rem;
            color: #333;
            transition: transform 0.3s ease;
        }

        .mobile-menu-toggle.active i {
            transform: rotate(90deg);
        }
    }

    /* Fade-in animation */
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Button hover effects */
    .btn {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .btn:active {
        transform: translateY(0);
    }

    /* Notification styles are already included in the showNotification method */
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Additional notification popup styles
const notificationStyles = `
    .notification-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    }
    
    .notification-popup .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Inject notification styles
const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);
