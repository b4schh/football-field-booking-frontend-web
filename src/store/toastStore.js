import { create } from 'zustand';

let toastId = 0;

const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = ++toastId;
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }]
    }));
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  }
}));

export default useToastStore;

// Helper hooks
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  
  return {
    success: (message, duration) => addToast({ type: 'success', message, duration }),
    error: (message, duration) => addToast({ type: 'error', message, duration }),
    info: (message, duration) => addToast({ type: 'info', message, duration }),
    warning: (message, duration) => addToast({ type: 'warning', message, duration })
  };
};
