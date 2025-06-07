// Smooth scrolling and animations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initializeAnimations();
    
    // Initialize intersection observer for scroll animations
    initializeScrollAnimations();
    
    // Initialize email storage
    initializeEmailStorage();
});

// Scroll to marketplace section
function scrollToMarketplace() {
    const marketplace = document.getElementById('marketplace');
    marketplace.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Modal functionality
function openNotifyModal(appName) {
    const modal = document.getElementById('notifyModal');
    const appNameInput = document.getElementById('appName');
    const modalText = document.getElementById('modalText');
    const successMessage = document.getElementById('successMessage');
    const form = document.getElementById('notifyForm');
    
    // App names mapping
    const appNames = {
        'nexus5': 'Nexus 5',
        'cerebra7': 'Cerebra 7',
        'puzzle33': 'Puzzle 33',
        'docflow4': 'DocFlow 4'
    };
      // Reset modal state
    form.style.display = 'flex';
    successMessage.classList.add('hidden');
    document.getElementById('emailInput').value = '';
    
    // Set app name and update text
    appNameInput.value = appName;
    modalText.textContent = `Seja notificado quando o ${appNames[appName]} estiver disponível!`;
    
    // Show modal with animation
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on email input
    setTimeout(() => {
        document.getElementById('emailInput').focus();
    }, 300);
}

function closeNotifyModal() {
    const modal = document.getElementById('notifyModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle form submission
function handleNotifySubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const appName = document.getElementById('appName').value;
    const form = document.getElementById('notifyForm');
    const successMessage = document.getElementById('successMessage');
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('Por favor, insira um email válido.');
        return;
    }
    
    // Store email in localStorage (in a real app, this would be sent to a server)
    storeEmailNotification(email, appName);
      // Show success message
    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    
    // Auto close modal after 2 seconds
    setTimeout(() => {
        closeNotifyModal();
    }, 2000);
    
    // Track conversion (in a real app, this would be analytics)
    trackNotificationSignup(appName, email);
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Store email notification
function storeEmailNotification(email, appName) {
    const notifications = JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
    
    // Check if email is already registered for this app
    const existingNotification = notifications.find(n => n.email === email && n.app === appName);
    
    if (!existingNotification) {
        notifications.push({
            email: email,
            app: appName,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('prismas33_notifications', JSON.stringify(notifications));
    }
}

// Initialize email storage
function initializeEmailStorage() {
    if (!localStorage.getItem('prismas33_notifications')) {
        localStorage.setItem('prismas33_notifications', '[]');
    }
}

// Track notification signup (placeholder for analytics)
function trackNotificationSignup(appName, email) {
    console.log(`Notification signup: ${appName} - ${email}`);
    
    // In a real application, you would send this to your analytics service
    // Example: gtag('event', 'notification_signup', { app_name: appName });
}

// Show error message
function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;
        document.body.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Show error
    setTimeout(() => {
        errorElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide error after 3 seconds
    setTimeout(() => {
        errorElement.style.transform = 'translateX(100%)';
    }, 3000);
}

// Show coming soon message
function showComingSoon() {
    showError('Em breve! Esta funcionalidade estará disponível.');
}

// Initialize animations
function initializeAnimations() {
    // Add stagger animation to app cards
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('app-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                
                if (entry.target.classList.contains('section-header')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);
    
    // Observe app cards
    document.querySelectorAll('.app-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe section headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(30px)';
        header.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(header);
    });
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('notifyModal');
    if (event.target === modal) {
        closeNotifyModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('notifyModal');
        if (modal.style.display === 'block') {
            closeNotifyModal();
        }
    }
});

// Parallax effect for hero background
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
});

// Enhanced app card interactions
document.addEventListener('DOMContentLoaded', function() {
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        // Add mouse move effect
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    });
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(function() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);

// Add loading state for buttons
function addButtonLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    button.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

// Enhanced form submission with loading state
function handleNotifySubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const appName = document.getElementById('appName').value;
    const form = document.getElementById('notifyForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('.submit-btn');
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('Por favor, insira um email válido.');
        return;
    }
    
    // Add loading state
    addButtonLoadingState(submitBtn);
    
    // Store email and show success after delay
    setTimeout(() => {
        storeEmailNotification(email, appName);
          form.style.display = 'none';
        successMessage.classList.remove('hidden');
        
        trackNotificationSignup(appName, email);
        
        // Auto close modal after 2 seconds
        setTimeout(() => {
            closeNotifyModal();
        }, 2000);
    }, 1500);
}

// Debug function to check stored notifications
function getStoredNotifications() {
    return JSON.parse(localStorage.getItem('prismas33_notifications') || '[]');
}

// Console welcome message
console.log(`
🔸 Prismas 33 - Tecnologia que Refrata Soluções
🧠 Site desenvolvido com tecnologias modernas
📧 Notificações armazenadas: ${getStoredNotifications().length}
🚀 Pronto para o futuro!
`);

console.log('Stored notifications:', getStoredNotifications());
