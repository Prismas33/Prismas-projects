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
