import api from "./api";

/**
 * Notification Service
 * Xử lý các API calls liên quan đến thông báo
 */

export const notificationService = {
  /**
   * Lấy danh sách thông báo
   * @param {Object} params - Query parameters
   * @returns {Promise} List of notifications
   */
  getNotifications: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  /**
   * Đánh dấu đã đọc
   * @param {string|number} id - Notification ID
   * @returns {Promise} Response
   */
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Đánh dấu tất cả đã đọc
   * @returns {Promise} Response
   */
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },

  /**
   * Xóa thông báo
   * @param {string|number} id - Notification ID
   * @returns {Promise} Response
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Xóa tất cả thông báo
   * @returns {Promise} Response
   */
  deleteAllNotifications: async () => {
    const response = await api.delete("/notifications/all");
    return response.data;
  },

  /**
   * Cập nhật cài đặt thông báo
   * @param {Object} settings - Notification settings
   * @returns {Promise} Updated settings
   */
  updateNotificationSettings: async (settings) => {
    const response = await api.put("/notifications/settings", settings);
    return response.data;
  },

  /**
   * Lấy cài đặt thông báo
   * @returns {Promise} Notification settings
   */
  getNotificationSettings: async () => {
    const response = await api.get("/notifications/settings");
    return response.data;
  },
};

export default notificationService;
