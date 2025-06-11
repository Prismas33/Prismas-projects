// SafeCallKids JavaScript - Modern Firebase v9+ SDK Implementation
// Language Switching, Firebase Integration and Interactions

// Import Firebase modules (for module bundler environments)
// For direct HTML use, we'll use the global Firebase v9+ SDK

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

// Initialize Firebase v9+ SDK
let storage;
let auth;
let app;
let isFirebaseReady = false;

// Initialize Firebase when the page loads
window.addEventListener('load', () => {
    initializeFirebase();
});

async function initializeFirebase() {
    try {
        // Check if Firebase v9+ SDK is available
        if (typeof window.firebase?.initializeApp === 'function') {
            // Initialize Firebase
            app = window.firebase.initializeApp(firebaseConfig);
            console.log('Firebase v9+ initialized successfully');
            
            // Initialize Storage
            if (window.firebase.getStorage) {
                storage = window.firebase.getStorage(app);
                console.log('Firebase Storage initialized');
            }
            
            // Initialize Auth (optional)
            if (window.firebase.getAuth) {
                auth = window.firebase.getAuth(app);
                console.log('Firebase Auth initialized');
                
                // Try anonymous authentication if available
                if (window.firebase.signInAnonymously) {
                    try {
                        await window.firebase.signInAnonymously(auth);
                        console.log('Anonymous authentication successful');
                    } catch (authError) {
                        console.warn('Anonymous auth not available, continuing without auth:', authError);
                    }
                }
            }
            
            isFirebaseReady = true;
            updateFirebaseStatus('connected');
            
        } else if (typeof window.firebase?.initializeApp === 'undefined' && typeof firebase !== 'undefined') {
            // Fallback to Firebase v8 SDK
            app = firebase.initializeApp(firebaseConfig);
            storage = firebase.storage();
            auth = firebase.auth();
            
            // Try anonymous sign in
            try {
                await auth.signInAnonymously();
                console.log('Firebase v8 anonymous auth successful');
            } catch (authError) {
                console.warn('Auth not configured, continuing without auth:', authError);
            }
            
            isFirebaseReady = true;
            updateFirebaseStatus('connected');
            console.log('Firebase v8 fallback initialized');
        } else {
            throw new Error('Firebase SDK not loaded');
        }
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        updateFirebaseStatus('error', error.message);
        showFirebaseError('Firebase não está disponível. Funcionalidades de upload limitadas.');
    }
}

// Update Firebase status indicator
function updateFirebaseStatus(status, message = '') {
    const statusIndicator = document.getElementById('firebase-status');
    if (statusIndicator) {
        statusIndicator.className = `firebase-status ${status}`;
        const statusText = {
            'connecting': 'Conectando ao Firebase...',
            'connected': 'Firebase conectado',
            'error': `Erro no Firebase: ${message}`
        };
        statusIndicator.textContent = statusText[status] || 'Status desconhecido';
    }
}

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
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 6000);
}

// Modern Firebase Storage Upload Function
async function uploadFileToStorage(file, onProgress, onError, onSuccess) {
    if (!storage || !isFirebaseReady) {
        throw new Error('Firebase Storage not available');
    }

    try {
        // Create storage reference
        const timestamp = new Date().getTime();
        const fileName = `safecallkids_${timestamp}.apk`;
        
        let storageRef;
        let uploadTask;
        
        if (window.firebase?.ref && window.firebase?.uploadBytesResumable) {
            // Firebase v9+ modular SDK
            storageRef = window.firebase.ref(storage, `apks/${fileName}`);
            
            const metadata = {
                contentType: 'application/vnd.android.package-archive',
                customMetadata: {
                    'uploaded': new Date().toISOString(),
                    'app': 'SafeCallKids',
                    'version': '1.0'
                }
            };
            
            console.log('Using Firebase v9+ modular SDK for upload');
            uploadTask = window.firebase.uploadBytesResumable(storageRef, file, metadata);
            
            // Monitor upload progress
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    console.error('Firebase v9+ upload error:', error);
                    // Try fallback to v8 compat
                    tryCompatUpload(file, onProgress, onError, onSuccess);
                },
                async () => {
                    try {
                        const downloadURL = await window.firebase.getDownloadURL(uploadTask.snapshot.ref);
                        onSuccess(downloadURL);
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        onError(error);
                    }
                }
            );
        } else {
            // Try Firebase v8 compat
            tryCompatUpload(file, onProgress, onError, onSuccess);
        }
        
    } catch (error) {
        console.error('Upload initialization error:', error);
        onError(error);
    }
}

// Fallback function for Firebase v8 compat
function tryCompatUpload(file, onProgress, onError, onSuccess) {
    try {
        console.log('Trying Firebase v8 compat SDK as fallback');
        
        // Create storage reference with Firebase v8 compat
        const timestamp = new Date().getTime();
        const fileName = `safecallkids_${timestamp}.apk`;
        
        let storageRef;
        if (typeof firebase !== 'undefined' && firebase.storage) {
            storageRef = firebase.storage().ref(`apks/${fileName}`);
        } else {
            throw new Error('No Firebase SDK available');
        }
        
        const metadata = {
            contentType: 'application/vnd.android.package-archive',
            customMetadata: {
                'uploaded': new Date().toISOString(),
                'app': 'SafeCallKids',
                'version': '1.0'
            }
        };
        
        const uploadTask = storageRef.put(file, metadata);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error('Firebase v8 compat upload error:', error);
                onError(error);
            },
            async () => {
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    onSuccess(downloadURL);
                } catch (error) {
                    console.error('Error getting download URL:', error);
                    onError(error);
                }
            }
        );
        
    } catch (error) {
        console.error('Compat upload failed:', error);
        onError(error);
    }
}

class SafeCallKids {    constructor() {
        this.currentLanguage = 'pt';
        // Set the APK URL directly to the uploaded file
        this.currentApkUrl = 'https://firebasestorage.googleapis.com/v0/b/prismas33-1914c.firebasestorage.app/o/apks%2Fsafecallkids_1749638790127.apk?alt=media&token=68ef2062-c4ea-4450-939b-be8605fbffab';
        this.init();
    }init() {
        this.setupLanguageSwitcher();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupAnimations();
        this.setupDownloadButtons();
        // Removed: this.setupModal();
        // Removed: this.setupFileUpload();
        // Removed: this.addFirebaseStatusIndicator();
    }

    addFirebaseStatusIndicator() {
        // Add Firebase status indicator to the page
        const statusDiv = document.createElement('div');
        statusDiv.id = 'firebase-status';
        statusDiv.className = 'firebase-status connecting';
        statusDiv.textContent = 'Conectando ao Firebase...';
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusDiv);
        
        // Add CSS for different states
        const statusStyles = document.createElement('style');
        statusStyles.textContent = `
            .firebase-status.connecting {
                background: #ffa500;
                color: white;
            }
            .firebase-status.connected {
                background: #28a745;
                color: white;
            }
            .firebase-status.error {
                background: #dc3545;
                color: white;
            }
        `;
        document.head.appendChild(statusStyles);
        
        updateFirebaseStatus('connecting');
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
        
        // Update Firebase status indicator
        this.updateFirebaseStatusText(lang);
    }

    updateFirebaseStatusText(lang) {
        const statusIndicator = document.getElementById('firebase-status');
        if (statusIndicator && isFirebaseReady) {
            statusIndicator.textContent = lang === 'pt' ? 'Firebase conectado' : 'Firebase connected';
        }
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
    }    setupDownloadButtons() {
        // Play Store buttons - now just download directly
        const playStoreButtons = document.querySelectorAll('#playstore-btn, #playstore-download');
        playStoreButtons.forEach(btn => {
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

                // Download directly
                this.downloadApk();
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
    }

    async handleFileUpload(file) {
        if (!storage || !isFirebaseReady) {
            this.showNotification(
                this.currentLanguage === 'pt' 
                    ? 'Firebase Storage não está disponível. Verifique a configuração.' 
                    : 'Firebase Storage is not available. Check configuration.'
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

            console.log('Starting upload with file:', file.name, 'Size:', file.size);

            // Use the modern upload function
            await uploadFileToStorage(
                file,
                // Progress callback
                (progress) => {
                    document.getElementById('progressFill').style.width = progress + '%';
                    document.getElementById('progressText').textContent = Math.round(progress) + '%';
                    console.log(`Upload progress: ${progress}%`);
                },                // Error callback
                (error) => {
                    console.error('Upload error details:', error);
                    
                    let errorMessage = this.currentLanguage === 'pt' 
                        ? 'Erro no upload: ' 
                        : 'Upload error: ';
                    
                    // Check for CORS-related errors
                    if (error.message && (error.message.includes('CORS') || error.message.includes('ERR_FAILED'))) {
                        errorMessage += this.currentLanguage === 'pt' 
                            ? 'Erro de CORS. Verifique se o Firebase Storage está configurado corretamente e aguarde 5-10 minutos após configurar as regras.' 
                            : 'CORS error. Check if Firebase Storage is configured correctly and wait 5-10 minutes after setting up rules.';
                    } else {
                        switch (error.code) {
                            case 'storage/unauthorized':
                                errorMessage += this.currentLanguage === 'pt' 
                                    ? 'Acesso negado. Configure as regras do Firebase Storage (veja TROUBLESHOOTING.md)' 
                                    : 'Access denied. Configure Firebase Storage rules (see TROUBLESHOOTING.md)';
                                break;
                            case 'storage/canceled':
                                errorMessage += this.currentLanguage === 'pt' 
                                    ? 'Upload cancelado pelo usuário.' 
                                    : 'Upload canceled by user.';
                                break;
                            case 'storage/unknown':
                                errorMessage += this.currentLanguage === 'pt' 
                                    ? 'Erro desconhecido. Verifique a conexão e as regras do Storage.' 
                                    : 'Unknown error. Check connection and Storage rules.';
                                break;
                            case 'storage/retry-limit-exceeded':
                                errorMessage += this.currentLanguage === 'pt' 
                                    ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' 
                                    : 'Too many attempts. Wait a few minutes and try again.';
                                break;
                            default:
                                errorMessage += this.currentLanguage === 'pt' 
                                    ? `Código do erro: ${error.code || 'CORS/Network'}. Verifique as configurações do Firebase Storage.` 
                                    : `Error code: ${error.code || 'CORS/Network'}. Check Firebase Storage configuration.`;
                        }
                    }
                    
                    this.showNotification(errorMessage);
                    this.resetModalState();
                },
                // Success callback
                (downloadURL) => {
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
                }
            );

        } catch (error) {
            console.error('Upload initialization error:', error);
            let errorMessage = this.currentLanguage === 'pt' 
                ? 'Erro ao inicializar upload: ' 
                : 'Error initializing upload: ';
            
            if (error.message.includes('Firebase Storage not available')) {
                errorMessage += this.currentLanguage === 'pt' 
                    ? 'Firebase Storage não está configurado corretamente.' 
                    : 'Firebase Storage is not configured correctly.';
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

// Additional CSS for mobile menu and status indicator (injected via JavaScript)
const additionalStyles = `
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
        
        .firebase-status {
            bottom: 10px !important;
            right: 10px !important;
            font-size: 11px !important;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
