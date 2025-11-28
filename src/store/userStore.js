import { create } from "zustand";
import { userService } from "../services/userService";

const useUserStore = create((set, get) => ({
  // State
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Actions
  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getUsers(params);

      if (data.data) {
        set({
          users: data.data,
          pagination: {
            page: data.page || 1,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
          },
          isLoading: false,
        });
      } else {
        set({ users: data, isLoading: false });
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách users";
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

  toggleUserBan: async (id, banned, reason = "") => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.toggleUserBan(id, banned, reason);
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? data : user)),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Thao tác thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  changeUserRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.changeUserRole(id, role);
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? data : user)),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Thay đổi role thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.createUser(userData);
      set((state) => ({
        users: [...state.users, data],
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo user thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

export default useUserStore;
