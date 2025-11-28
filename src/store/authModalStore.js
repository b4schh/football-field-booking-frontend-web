import { create } from "zustand";

const useAuthModalStore = create((set) => ({
  // State
  isOpen: false,
  onSuccessCallback: null,

  // Actions
  openAuthModal: (callback) => {
    set({
      isOpen: true,
      onSuccessCallback: callback || null,
    });
  },

  closeAuthModal: () => {
    set({
      isOpen: false,
      onSuccessCallback: null,
    });
  },

  handleSuccess: () => {
    set((state) => {
      if (state.onSuccessCallback) {
        state.onSuccessCallback();
      }
      return {
        isOpen: false,
        onSuccessCallback: null,
      };
    });
  },
}));

export default useAuthModalStore;
