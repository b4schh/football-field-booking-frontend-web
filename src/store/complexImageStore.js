import { create } from "zustand";
import { complexImageService } from "../services/complexImageService";

const useComplexImageStore = create((set, get) => ({
  // State
  images: [],
  isLoading: false,
  error: null,

  // Actions
  fetchComplexImages: async (complexId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await complexImageService.getComplexImages(complexId);
      set({ images: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách ảnh";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  uploadImage: async (complexId, formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await complexImageService.uploadImage(complexId, formData);
      set((state) => ({
        images: [...state.images, data],
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload ảnh thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteImage: async (imageId) => {
    set({ isLoading: true, error: null });
    try {
      await complexImageService.deleteImage(imageId);
      set((state) => ({
        images: state.images.filter((img) => img.id !== imageId),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xóa ảnh thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearImages: () => set({ images: [] }),
}));

export default useComplexImageStore;
