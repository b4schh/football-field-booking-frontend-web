import { create } from "zustand";
import { complexService } from "../services/complexService";

const useComplexStore = create((set, get) => ({
  // State
  complexes: [],
  currentComplex: null,
  myComplexes: [],
  availabilityData: null,
  isLoading: false,
  isAvailabilityLoading: false,
  error: null,
  currentSearchParams: null, // Store current search params for pagination
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },

  // Actions
  fetchComplexes: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      // If there are current search params and no new search-specific params provided,
      // use search endpoint with pagination
      const state = get();
      let response;
      
      if (state.currentSearchParams && !params.name && !params.province) {
        // Continue with search using stored params + new pagination
        const searchParams = {
          ...state.currentSearchParams,
          pageIndex: params.pageIndex || 1,
          pageSize: params.pageSize || 12,
        };
        response = await complexService.searchComplexes(searchParams);
      } else {
        // Regular fetch without search
        response = await complexService.getComplexes(params);
        set({ currentSearchParams: null }); // Clear search params
      }

      set({
        complexes: response.data ?? [],
        pagination: {
          pageIndex: response.pageIndex,
          pageSize: response.pageSize,
          totalRecords: response.totalRecords,
          totalPages: response.totalPages,
          hasNextPage: response.pageIndex < response.totalPages,
          hasPreviousPage: response.pageIndex > 1,
        },
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      console.error("❌ fetchComplexes ERROR:", err);

      set({
        isLoading: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách cụm sân",
      });

      return { success: false };
    }
  },

  fetchComplexById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getComplexById(id);
      set({ currentComplex: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin cụm sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchComplexWithFields: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getComplexWithFields(id);
      set({ currentComplex: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin cụm sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchComplexFullDetails: async (id, date = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getComplexFullDetails(id, date);
      set({ currentComplex: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin cụm sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchComplexWeeklyDetails: async (id, startDate = null, endDate = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getComplexWeeklyDetails(
        id,
        startDate,
        endDate
      );
      set({ currentComplex: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải thông tin cụm sân theo tuần";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchAvailability: async (id, startDate = null, days = 7) => {
    set({ isAvailabilityLoading: true, error: null });
    try {
      const response = await complexService.getAvailability(
        id,
        startDate,
        days
      );
      set({ availabilityData: response.data, isAvailabilityLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin availability";
      set({ error: errorMessage, isAvailabilityLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  searchComplexes: async (searchParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.searchComplexes(searchParams);

      // Store search params for pagination
      const { pageIndex, pageSize, ...filterParams } = searchParams;
      
      set({
        complexes: response.data || [],
        currentSearchParams: filterParams, // Store filter params (without pagination)
        pagination: {
          pageIndex: response.pageIndex || 1,
          pageSize: response.pageSize || 10,
          totalRecords: response.totalRecords || 0,
          totalPages: response.totalPages || 0,
          hasPreviousPage: response.hasPreviousPage || false,
          hasNextPage: response.hasNextPage || false,
        },
        isLoading: false,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Tìm kiếm thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchMyComplexes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getMyComplexes();
      set({ myComplexes: response.data || [], isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải danh sách cụm sân của bạn";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createComplex: async (complexData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.createComplex(complexData);
      set((state) => ({
        complexes: [...state.complexes, response.data],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo cụm sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateComplex: async (id, complexData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.updateComplex(id, complexData);
      set((state) => ({
        complexes: state.complexes.map((complex) =>
          complex.id === id ? response.data : complex
        ),
        currentComplex:
          state.currentComplex?.id === id
            ? response.data
            : state.currentComplex,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật cụm sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteComplex: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await complexService.deleteComplex(id);
      set((state) => ({
        complexes: state.complexes.filter((complex) => complex.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xóa cụm sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Tạo cụm sân (Admin)
  createComplexByAdmin: async (complexData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.createComplexByAdmin(complexData);
      set((state) => ({
        complexes: [...state.complexes, response.data],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo cụm sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Lấy danh sách cụm sân theo Owner ID (Admin)
  fetchComplexesByOwnerId: async (ownerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await complexService.getComplexesByOwnerId(ownerId);
      set({ complexes: response.data || [], isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách cụm sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentComplex: () => set({ currentComplex: null }),
  clearAvailabilityData: () => set({ availabilityData: null }),
  clearSearchParams: () => set({ currentSearchParams: null }),
}));

export default useComplexStore;
