import { create } from "zustand";
import { notificationService } from "../services/notificationService";

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  settings: null,
  isLoading: false,
  error: null,

  // Actions
  fetchNotifications: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.getNotifications(params);
      set({ notifications: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông báo";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationService.getUnreadCount();
      set({ unreadCount: data.count || 0 });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tải số lượng thông báo chưa đọc";
      return { success: false, error: errorMessage };
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể đánh dấu đã đọc";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
        })),
        unreadCount: 0,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Không thể đánh dấu tất cả đã đọc";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((notif) => notif.id !== id),
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa thông báo";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteAllNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.deleteAllNotifications();
      set({ notifications: [], unreadCount: 0, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa tất cả thông báo";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchNotificationSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.getNotificationSettings();
      set({ settings: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải cài đặt thông báo";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateNotificationSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.updateNotificationSettings(
        settings
      );
      set({ settings: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật cài đặt thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useNotificationStore;
