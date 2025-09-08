// PWA utilities for better user experience

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as InstallPromptEvent;
      this.showInstallBanner();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showToast('App instalado com sucesso!', 'success');
    });

    // Check for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.showToast('Nova versão disponível! Recarregue a página.', 'info');
      });
    }
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      this.showToast('Instalação não disponível neste momento', 'error');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.showToast('Instalando...', 'info');
        return true;
      } else {
        this.showToast('Instalação cancelada', 'info');
        return false;
      }
    } catch (error) {
      console.error('Erro ao instalar:', error);
      this.showToast('Erro durante a instalação', 'error');
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  private showInstallBanner() {
    if (this.isInstalled) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 transform translate-y-full transition-transform duration-300';
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="font-medium">Instalar FaceMind</h3>
          <p class="text-sm text-blue-100">Acesso rápido direto da tela inicial</p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button id="pwa-install-btn" class="bg-white text-blue-600 px-4 py-2 rounded font-medium text-sm hover:bg-blue-50 transition-colors">
            Instalar
          </button>
          <button id="pwa-dismiss-btn" class="text-blue-200 hover:text-white p-2">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    
    // Animate in
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    // Event listeners
    banner.querySelector('#pwa-install-btn')?.addEventListener('click', () => {
      this.installApp();
    });

    banner.querySelector('#pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });

    // Auto hide after 10 seconds
    setTimeout(() => {
      if (document.getElementById('pwa-install-banner')) {
        this.hideInstallBanner();
      }
    }, 10000);
  }

  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 300);
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-blue-600 text-white'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  getInstallStatus(): boolean {
    return this.isInstalled;
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Utility functions
export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isOnline = (): boolean => navigator.onLine;

export const addToHomeScreenPrompt = (): void => {
  pwaManager.installApp();
};
