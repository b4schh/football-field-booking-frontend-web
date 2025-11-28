import { create } from "zustand";
import { fieldService } from "../services/fieldService";

const useFieldStore = create((set, get) => ({
  // State
  fields: [],
  currentField: null,
  featuredFields: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Actions
  fetchFields: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFields(filters);
      
      // Nếu API trả về pagination
      if (data.data) {
        set({
          fields: data.data,
          pagination: {
            page: data.page || 1,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
          },
          isLoading: false,
        });
      } else {
        // Nếu API chỉ trả về array
        set({ fields: data, isLoading: false });
      }
      
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchFieldById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFieldById(id);
      set({ currentField: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchFieldWithTimeSlots: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFieldWithTimeSlots(id);
      set({ currentField: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchFieldsByComplexId: async (complexId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFieldsByComplexId(complexId);
      set({ fields: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createField: async (fieldData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.createField(fieldData);
      set((state) => ({
        fields: [...state.fields, data],
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateField: async (id, fieldData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.updateField(id, fieldData);
      set((state) => ({
        fields: state.fields.map((field) =>
          field.id === id ? data : field
        ),
        currentField:
          state.currentField?.id === id ? data : state.currentField,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteField: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await fieldService.deleteField(id);
      set((state) => ({
        fields: state.fields.filter((field) => field.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xóa sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Tìm kiếm sân
  searchFields: async (searchParams) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.searchFields(searchParams);
      set({ fields: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tìm kiếm thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Lấy sân nổi bật
  fetchFeaturedFields: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFeaturedFields(limit);
      set({ featuredFields: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải sân nổi bật";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Lấy lịch trống
  fetchAvailableSlots: async (id, params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getAvailableSlots(id, params);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải lịch trống";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Upload ảnh sân
  uploadFieldImages: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.uploadFieldImages(id, formData);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload ảnh thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentField: () => set({ currentField: null }),
}));

export default useFieldStore;
