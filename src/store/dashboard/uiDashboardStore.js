import { create } from "zustand";

const useUIDashboardStore = create((set) => ({
  sidebarCollapsed: false,
  modalState: {
    isOpen: false,
    type: null, // 'create', 'edit', 'delete', 'view'
    data: null,
  },

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openModal: (type, data = null) => set({
    modalState: {
      isOpen: true,
      type,
      data,
    },
  }),

  closeModal: () => set({
    modalState: {
      isOpen: false,
      type: null,
      data: null,
    },
  }),
}));

export default useUIDashboardStore;
