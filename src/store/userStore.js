import { create } from "zustand";
import { userService } from "../services/userService";

const useUserStore = create((set, get) => ({
  // State
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  
  // Pagination states
  pageIndex: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,

  // Actions
  fetchUsers: async (pageIndex = 1, pageSize = 10, keyword = null, role = null, status = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsers(pageIndex, pageSize, keyword, role, status);
      set({
        users: response.data ?? [],
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách người dùng";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getUserById(id);
      set({ currentUser: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin user";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.updateUser(id, userData);
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? data : user)),
        currentUser: state.currentUser?.id === id ? data : state.currentUser,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật user thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.updateProfile(profileData);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật profile thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  uploadAvatar: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.uploadAvatar(formData);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload avatar thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xóa user thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateUserStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await userService.updateUserStatus(id, status);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật trạng thái thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateUserRole: async (id, roleId) => {
    set({ isLoading: true, error: null });
    try {
      await userService.updateUserRole(id, roleId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật role thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.createUser(userData);
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo người dùng thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

export default useUserStore;
