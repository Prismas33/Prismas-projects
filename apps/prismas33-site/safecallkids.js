// SafeCallKids JavaScript - Language Switching, Firebase Integration and Interactions

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0q_UjhPFIc7TTx34GPBsUzKH-wNZXGEM",
    authDomain: "prismas33-1914c.firebaseapp.com",
    projectId: "prismas33-1914c",
    storageBucket: "prismas33-1914c.firebasestorage.app",
    messagingSenderId: "314506893839",
    appId: "1:314506893839:web:a1dd9c99c83824afb6a17a",
    measurementId: "G-3Q452XXC7Z"
};

// Initialize Firebase
let storage;
let auth;
let isFirebaseReady = false;

// Wait for Firebase to load
window.addEventListener('load', () => {
    if (typeof firebase !== 'undefined') {
        try {
            // Initialize Firebase app
            const app = firebase.initializeApp(firebaseConfig);
            storage = firebase.storage();
            
            // Try to initialize auth, but don't fail if it's not configured
            try {
                auth = firebase.auth();
                
                // Check if anonymous auth is enabled
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log('Firebase authenticated successfully');
                        isFirebaseReady = true;
                    } else {
                        // Try anonymous sign in
                        auth.signInAnonymously().then(() => {
                            isFirebaseReady = true;
                            console.log('Firebase anonymous auth successful');
                        }).catch((error) => {
                            console.warn('Firebase auth not configured, continuing without auth:', error);
                            isFirebaseReady = true; // Continue without auth
                        });
                    }
                });
            } catch (authError) {
                console.warn('Firebase auth not available, continuing without auth:', authError);
                isFirebaseReady = true; // Continue without auth
            }
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Show user-friendly error message
            showFirebaseError('Firebase não está disponível. Algumas funcionalidades podem estar limitadas.');
        }
    } else {
        console.warn('Firebase SDK not loaded');
        showFirebaseError('Firebase não foi carregado. Verifique sua conexão com a internet.');
    }
});

// Helper function to show Firebase errors to users
function showFirebaseError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'firebase-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

class SafeCallKids {
    constructor() {
        this.currentLanguage = 'pt';
        this.currentApkUrl = localStorage.getItem('safecallkids_apk_url') || null;
        this.init();
    }

    init() {
        this.setupLanguageSwitcher();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupAnimations();
        this.setupDownloadButtons();
        this.setupModal();
        this.setupFileUpload();
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
        
        // Update button states
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Update content
        this.updateLanguageContent(lang);
        
        // Update document language
        document.documentElement.lang = lang;
        
        // Update page title and meta description
        this.updateMetaContent(lang);
    }

    updateLanguageContent(lang) {
        const elements = document.querySelectorAll(`[data-${lang}]`);
        
        elements.forEach(element => {
            const content = element.getAttribute(`data-${lang}`);
            if (content) {
                element.textContent = content;
            }
        });
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
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.feature-card, .step, .stat');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Counter animation for statistics
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
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasStar = text.includes('★');
        const hasPercent = text.includes('%');
        
        let finalValue;
        let suffix = '';
        
        if (hasPlus) {
            finalValue = parseInt(text.replace(/[^\d]/g, ''));
            suffix = 'K+';
        } else if (hasStar) {
            finalValue = parseFloat(text.replace(/[^\d.]/g, ''));
            suffix = '★';
        } else if (hasPercent) {
            finalValue = parseFloat(text.replace(/[^\d.]/g, ''));
            suffix = '%';
        } else {
            finalValue = parseInt(text.replace(/[^\d]/g, ''));
            suffix = 'M+';
        }

        let currentValue = 0;
        const increment = finalValue / 50;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            if (hasStar) {
                element.textContent = currentValue.toFixed(1) + suffix;
            } else if (hasPercent) {
                element.textContent = currentValue.toFixed(1) + suffix;
            } else {
                element.textContent = Math.floor(currentValue) + suffix;
            }
        }, 30);
    }

    setupDownloadButtons() {
        // Play Store buttons (coming soon)
        const playStoreButtons = document.querySelectorAll('#playstore-btn, #playstore-download');
        playStoreButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!isFirebaseReady) {
                    this.showNotification(
                        this.currentLanguage === 'pt' 
                            ? 'Sistema de upload indisponível. Tente recarregar a página.' 
                            : 'Upload system unavailable. Try reloading the page.'
                    );
                    return;
                }
                
                this.showModal();
            });
        });

        // APK Direct download buttons
        const apkButtons = document.querySelectorAll('#apk-download-btn, #apk-direct-download');
        apkButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'translateY(-2px)';
                }, 100);

                if (this.currentApkUrl) {
                    this.downloadApk();
                } else {
                    this.showNotification(
                        this.currentLanguage === 'pt' 
                            ? 'APK ainda não disponível. Use o botão do Google Play para fazer upload.' 
                            : 'APK not available yet. Use Google Play button to upload.'
                    );
                }
            });
        });
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

    setupModal() {
        const modal = document.getElementById('uploadModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            this.hideModal();
        });

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('uploadModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('uploadModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset modal state
        this.resetModalState();
    }

    resetModalState() {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('uploadProgress').classList.add('hidden');
        document.getElementById('uploadSuccess').classList.add('hidden');
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        document.getElementById('apkFile').value = '';
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('apkFile');

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.apk')) {
                this.handleFileUpload(files[0]);
            } else {
                this.showNotification(
                    this.currentLanguage === 'pt' 
                        ? 'Por favor, selecione um arquivo APK válido.' 
                        : 'Please select a valid APK file.'
                );
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.name.endsWith('.apk')) {
                this.handleFileUpload(file);
            } else {
                this.showNotification(
                    this.currentLanguage === 'pt' 
                        ? 'Por favor, selecione um arquivo APK válido.' 
                        : 'Please select a valid APK file.'
                );
            }
        });

        // Click to select
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }    async handleFileUpload(file) {
        if (!storage) {
            this.showNotification(
                this.currentLanguage === 'pt' 
                    ? 'Firebase Storage não está disponível. Verifique sua conexão.' 
                    : 'Firebase Storage is not available. Check your connection.'
            );
            return;
        }

        // Check file size (limit to 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            this.showNotification(
                this.currentLanguage === 'pt' 
                    ? 'Arquivo muito grande. Máximo 100MB.' 
                    : 'File too large. Maximum 100MB.'
            );
            return;
        }

        try {
            // Show progress
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('uploadProgress').classList.remove('hidden');

            // Create storage reference with better path
            const timestamp = new Date().getTime();
            const fileName = `safecallkids_${timestamp}.apk`;
            
            // Try direct storage reference without authentication check
            const storageRef = storage.ref(`apks/${fileName}`);

            // Upload file with metadata
            const metadata = {
                contentType: 'application/vnd.android.package-archive',
                customMetadata: {
                    'uploaded': new Date().toISOString(),
                    'app': 'SafeCallKids',
                    'version': '1.0'
                }
            };

            console.log('Starting upload with file:', file.name, 'Size:', file.size);

            const uploadTask = storageRef.put(file, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById('progressFill').style.width = progress + '%';
                    document.getElementById('progressText').textContent = Math.round(progress) + '%';
                    
                    console.log(`Upload progress: ${progress}%`);
                },
                (error) => {
                    // Error handling with detailed messages
                    console.error('Upload error details:', error);
                    
                    let errorMessage = this.currentLanguage === 'pt' 
                        ? 'Erro no upload: ' 
                        : 'Upload error: ';
                    
                    switch (error.code) {
                        case 'storage/unauthorized':
                            errorMessage += this.currentLanguage === 'pt' 
                                ? 'Acesso negado. Configure as regras do Firebase Storage (veja FIREBASE_SETUP.md)' 
                                : 'Access denied. Configure Firebase Storage rules (see FIREBASE_SETUP.md)';
                            break;
                        case 'storage/canceled':
                            errorMessage += this.currentLanguage === 'pt' 
                                ? 'Upload cancelado pelo usuário.' 
                                : 'Upload canceled by user.';
                            break;
                        case 'storage/unknown':
                            errorMessage += this.currentLanguage === 'pt' 
                                ? 'Erro desconhecido. Verifique a conexão e tente novamente.' 
                                : 'Unknown error. Check connection and try again.';
                            break;
                        case 'storage/invalid-format':
                            errorMessage += this.currentLanguage === 'pt' 
                                ? 'Formato de arquivo inválido. Use apenas arquivos .apk' 
                                : 'Invalid file format. Use only .apk files';
                            break;
                        case 'storage/object-not-found':
                            errorMessage += this.currentLanguage === 'pt' 
                                ? 'Erro de configuração do Storage.' 
                                : 'Storage configuration error.';
                            break;
                        default:
                            errorMessage += this.currentLanguage === 'pt' 
                                ? `Código do erro: ${error.code}. Verifique as configurações do Firebase.` 
                                : `Error code: ${error.code}. Check Firebase configuration.`;
                    }
                    
                    this.showNotification(errorMessage);
                    this.resetModalState();
                },
                async () => {
                    // Success
                    try {
                        console.log('Upload completed, getting download URL...');
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        this.currentApkUrl = downloadURL;
                        
                        // Store URL in localStorage for persistence
                        localStorage.setItem('safecallkids_apk_url', downloadURL);
                        
                        // Show success
                        document.getElementById('uploadProgress').classList.add('hidden');
                        document.getElementById('uploadSuccess').classList.remove('hidden');
                        document.getElementById('downloadUrl').value = downloadURL;
                        
                        console.log('Download URL:', downloadURL);
                        
                        this.showNotification(
                            this.currentLanguage === 'pt' 
                                ? 'APK enviado com sucesso! Agora você pode baixar através do link direto.' 
                                : 'APK uploaded successfully! You can now download via direct link.'
                        );
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        this.showNotification(
                            this.currentLanguage === 'pt' 
                                ? 'Upload concluído, mas erro ao obter URL. Recarregue a página.' 
                                : 'Upload completed but error getting URL. Please reload the page.'
                        );
                    }
                }
            );

        } catch (error) {
            console.error('Upload initialization error:', error);
            let errorMessage = this.currentLanguage === 'pt' 
                ? 'Erro ao inicializar upload: ' 
                : 'Error initializing upload: ';
            
            if (error.message.includes('auth')) {
                errorMessage += this.currentLanguage === 'pt' 
                    ? 'Problema de autenticação. Habilite autenticação anônima no Firebase Console.' 
                    : 'Authentication issue. Enable anonymous authentication in Firebase Console.';
            } else {
                errorMessage += this.currentLanguage === 'pt' 
                    ? 'Verifique a conexão e configuração do Firebase.' 
                    : 'Check connection and Firebase configuration.';
            }
            
            this.showNotification(errorMessage);
            this.resetModalState();
        }
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
                    ? 'Download iniciado!' 
                    : 'Download started!'
            );
        }
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

// Global function for copying download link
function copyDownloadLink() {
    const downloadUrl = document.getElementById('downloadUrl');
    downloadUrl.select();
    downloadUrl.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        if (window.safeCallKidsApp) {
            window.safeCallKidsApp.showNotification(
                window.safeCallKidsApp.currentLanguage === 'pt' 
                    ? 'Link copiado para a área de transferência!' 
                    : 'Link copied to clipboard!'
            );
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.safeCallKidsApp = new SafeCallKids();
    
    // Set initial language based on browser preference
    const preferredLang = window.safeCallKidsApp.detectLanguage();
    window.safeCallKidsApp.switchLanguage(preferredLang);
});

// Additional CSS for mobile menu (injected via JavaScript)
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .nav-links.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        
        .nav-links a {
            padding: 10px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .nav-links a:last-child {
            border-bottom: none;
        }
    }
`;

// Inject mobile menu styles
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);
