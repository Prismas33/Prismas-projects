// Basic i18n implementation for Prismas33
window.i18n = {
    currentLang: 'en',
    translations: {
        pt: {
            heroTitle1: 'Tecnologia que',
            heroTitle2: 'Refrata Soluções',
            heroSubtitle: 'Ferramentas inteligentes para desenvolvedores, empresas e mentes criativas',
            essentialOnly: 'Apenas cookies essenciais foram mantidos.',
            cookiesSaved: 'Preferências de cookies guardadas!',
            notifyModalText: 'Seja notificado quando esta aplicação estiver disponível!',
            marketingRequired: 'Para receber notificações, precisa aceitar cookies de marketing nas configurações.',
            notificationSuccess: 'Notificação registada com sucesso!',
            dataDeleted: 'Todos os dados locais foram removidos.',
            dataExported: 'Dados pessoais exportados com sucesso.',
            comingSoonText: 'Em breve! Documentação disponível em breve.'
        },
        en: {
            heroTitle1: 'Technology that',
            heroTitle2: 'Refracts Solutions',
            heroSubtitle: 'Intelligent tools for developers, companies and creative minds',
            essentialOnly: 'Only essential cookies were kept.',
            cookiesSaved: 'Cookie preferences saved!',
            notifyModalText: 'Be notified when this app is available!',
            marketingRequired: 'To receive notifications, you need to accept marketing cookies in the settings.',
            notificationSuccess: 'Notification registered successfully!',
            dataDeleted: 'All local data has been removed.',
            dataExported: 'Personal data exported successfully.',
            comingSoonText: 'Coming soon! Documentation available soon.'
        }
    },
    setLanguage: function(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.translatePage();
        }
    },
    translate: function(key) {
        return this.translations[this.currentLang][key] || key;
    },
    translatePage: function() {
        // Example: update hero title and subtitle
        var title1 = document.querySelector('.hero-title .title-line:first-child');
        var title2 = document.querySelector('.hero-title .title-line.highlight');
        var subtitle = document.querySelector('.hero-subtitle');
        if (title1) title1.textContent = this.translate('heroTitle1');
        if (title2) title2.textContent = this.translate('heroTitle2');
        if (subtitle) subtitle.textContent = this.translate('heroSubtitle');
    }
};
