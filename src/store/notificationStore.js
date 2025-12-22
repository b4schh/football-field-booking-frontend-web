import { create } from "zustand";
import { notificationService } from "../services/notificationService";

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  lastId: null,
  isLoading: false,
  error: null,

  // SSE connection state
  isConnected: false,

  // Actions
  fetchNotifications: async (sinceId = null, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (sinceId) params.sinceId = sinceId;
      if (limit) params.limit = limit;

      const data = await notificationService.getNotifications(params);
      
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
        hasMore: data.hasMore || false,
        lastId: data.lastId || null,
        isLoading: false,
      });
      
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông báo";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  loadMoreNotifications: async () => {
    const { lastId, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });
    try {
      const data = await notificationService.getNotifications({ sinceId: lastId, limit: 50 });
      
      set((state) => ({
        notifications: [...state.notifications, ...(data.notifications || [])],
        hasMore: data.hasMore || false,
        lastId: data.lastId || null,
        isLoading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationService.getUnreadCount();
      set({ unreadCount: data.count || 0 });
      return { success: true, data };
    } catch (error) {
      return { success: false };
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  markMultipleAsRead: async (ids) => {
    try {
      await notificationService.markMultipleAsRead(ids);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          ids.includes(notif.id) ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - ids.length),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id);
      set((state) => {
        const deletedNotif = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter((notif) => notif.id !== id),
          unreadCount: deletedNotif && !deletedNotif.isRead 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount,
        };
      });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // SSE: Add new notification from real-time push
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // SSE connection status
  setConnected: (isConnected) => set({ isConnected }),

  clearError: () => set({ error: null }),
}));

export default useNotificationStore;
