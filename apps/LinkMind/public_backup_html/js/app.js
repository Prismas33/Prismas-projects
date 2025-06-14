// LinkMind - Aplicação Principal
// Este arquivo contém as funcionalidades compartilhadas entre todas as páginas

class LinkMindApp {
    constructor() {
        this.init();
    }

    init() {
        // Registrar Service Worker para PWA
        this.registerServiceWorker();
        
        // Configurar notificações
        this.setupNotifications();
        
        // Configurar interceptadores de erro
        this.setupErrorHandling();
        
        // Configurar utilitários gerais
        this.setupUtils();
    }

    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
            } catch (error) {
                console.error('Erro ao registrar Service Worker:', error);
            }
        }
    }

    // Configurar notificações
    setupNotifications() {
        // Solicitar permissão para notificações ao carregar a aplicação
        if ('Notification' in window && Notification.permission === 'default') {
            // Não solicitar automaticamente, deixar para o usuário decidir
        }
    }

    // Configurar tratamento de erros
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Erro JavaScript:', e.error);
            this.showToast('Ocorreu um erro inesperado', 'error');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejeitada:', e.reason);
            this.showToast('Erro de conexão', 'error');
        });
    }

    // Configurar utilitários
    setupUtils() {
        // Adicionar método para escape de HTML globalmente
        window.escapeHtml = this.escapeHtml;
        window.formatDate = this.formatDate;
        window.showToast = this.showToast.bind(this);
    }

    // Utilitários
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString, options = {}) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return date.toLocaleDateString('pt-BR', defaultOptions);
    }

    // Sistema de Toast/Notificações
    showToast(message, type = 'info', duration = 5000) {
        // Remover toast existente se houver
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Criar novo toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                    border-left: 4px solid;
                }
                
                .toast-info { border-left-color: #3b82f6; }
                .toast-success { border-left-color: #10b981; }
                .toast-error { border-left-color: #ef4444; }
                .toast-warning { border-left-color: #f59e0b; }
                
                .toast-content {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    gap: 12px;
                }
                
                .toast-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }
                
                .toast-message {
                    flex: 1;
                    color: #374151;
                    font-weight: 500;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }
                
                .toast-close:hover {
                    background: #f3f4f6;
                    color: #374151;
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
                
                @media (max-width: 480px) {
                    .toast {
                        left: 20px;
                        right: 20px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Adicionar ao DOM
        document.body.appendChild(toast);

        // Remover automaticamente após duração especificada
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
    }

    getToastIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
    }

    // API Helper Methods
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Métodos específicos da API
    async login(email, password) {
        return this.apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(name, email, password) {
        return this.apiRequest('/api/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    async logout() {
        return this.apiRequest('/api/logout', {
            method: 'POST'
        });
    }

    async createIdea(ideaData) {
        return this.apiRequest('/api/ideas', {
            method: 'POST',
            body: JSON.stringify(ideaData)
        });
    }

    async getIdeas(searchTerm = '') {
        const url = searchTerm ? `/api/ideas?search=${encodeURIComponent(searchTerm)}` : '/api/ideas';
        return this.apiRequest(url);
    }

    async getSuggestions() {
        return this.apiRequest('/api/suggestions');
    }

    async getUserData() {
        return this.apiRequest('/api/user');
    }

    // Utilitários de UI
    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading">Carregando...</div>';
        }
    }

    hideLoading(element) {
        if (element) {
            const loading = element.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }

    // Validação de formulários
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateRequired(value) {
        return value && value.trim().length > 0;
    }

    // Gerenciamento de estado local
    setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar dados locais:', error);
        }
    }

    getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados locais:', error);
            return null;
        }
    }

    removeLocalData(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover dados locais:', error);
        }
    }

    // Debounce para otimizar buscas
    debounce(func, wait) {
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

    // Verificar conectividade
    isOnline() {
        return navigator.onLine;
    }

    // Setup de eventos de conectividade
    setupConnectivityEvents() {
        window.addEventListener('online', () => {
            this.showToast('Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('Você está offline', 'warning');
        });
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.linkMindApp = new LinkMindApp();
});

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkMindApp;
}
