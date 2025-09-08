import { toast } from 'sonner';

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      action: options?.action,
      duration: 4000,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: 6000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      action: options?.action,
      duration: 4000,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  }
};

// Toasts específicos para ações comuns
export const appToasts = {
  patientSaved: () => showToast.success('Paciente salvo com sucesso!'),
  patientDeleted: () => showToast.success('Paciente removido com sucesso!'),
  procedureSaved: () => showToast.success('Procedimento registrado!'),
  dataLoaded: () => showToast.info('Dados atualizados'),
  syncError: () => showToast.error('Erro ao sincronizar dados', {
    description: 'Verifique sua conexão e tente novamente',
    action: {
      label: 'Tentar novamente',
      onClick: () => window.location.reload()
    }
  }),
  offlineMode: () => showToast.info('Modo offline ativado', {
    description: 'Alguns recursos podem estar limitados'
  })
};
