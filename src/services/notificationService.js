import api from "./api";

/**
 * Notification Service
 * Xử lý các API calls liên quan đến thông báo
 */

export const notificationService = {
  /**
   * Lấy danh sách thông báo
   * @param {Object} params - Query parameters (sinceId, limit)
   * @returns {Promise} List of notifications with pagination
   */
  getNotifications: async (params = {}) => {
    const response = await api.get("/notification", { params });
    return response.data?.data || response.data;
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    const response = await api.get("/notification/unread-count");
    return response.data?.data || response.data;
  },

  /**
   * Đánh dấu đã đọc
   * @param {string|number} id - Notification ID
   * @returns {Promise} Response
   */
  markAsRead: async (id) => {
    const response = await api.post("/notification/mark-read", { notificationId: id });
    return response.data?.data || response.data;
  },

  /**
   * Đánh dấu nhiều thông báo đã đọc
   * @param {Array} ids - Array of notification IDs
   * @returns {Promise} Response
   */
  markMultipleAsRead: async (ids) => {
    const response = await api.post("/notification/mark-multiple-read", { notificationIds: ids });
    return response.data?.data || response.data;
  },

  /**
   * Đánh dấu tất cả đã đọc
   * @returns {Promise} Response
   */
  markAllAsRead: async () => {
    const response = await api.post("/notification/mark-all-read");
    return response.data?.data || response.data;
  },

  /**
   * Xóa thông báo
   * @param {string|number} id - Notification ID
   * @returns {Promise} Response
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notification/${id}`);
    return response.data?.data || response.data;
  },
};

export default notificationService;
