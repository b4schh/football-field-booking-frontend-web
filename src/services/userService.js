import api from "./api";

/**
 * User Service
 * Xử lý các API calls liên quan đến quản lý user
 */

export const userService = {
  /**
   * Lấy danh sách users (Admin)
   * @param {Object} params - Query parameters
   * @returns {Promise} List of users
   */
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  /**
   * Lấy thông tin user theo ID
   * @param {string|number} id - User ID
   * @returns {Promise} User details
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin user
   * @param {string|number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Cập nhật profile của user hiện tại
   * @param {Object} profileData - Profile data
   * @returns {Promise} Updated profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  /**
   * Upload avatar
   * @param {FormData} formData - Form data chứa file avatar
   * @returns {Promise} Avatar URL
   */
  uploadAvatar: async (formData) => {
    const response = await api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Xóa user (Admin)
   * @param {string|number} id - User ID
   * @returns {Promise} Response
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Cấm/Mở cấm user (Admin)
   * @param {string|number} id - User ID
   * @param {boolean} banned - true: cấm, false: mở cấm
   * @param {string} reason - Lý do
   * @returns {Promise} Updated user
   */
  toggleUserBan: async (id, banned, reason = "") => {
    const response = await api.put(`/users/${id}/ban`, { banned, reason });
    return response.data;
  },

  /**
   * Thay đổi role user (Admin)
   * @param {string|number} id - User ID
   * @param {string} role - New role (customer, owner, admin)
   * @returns {Promise} Updated user
   */
  changeUserRole: async (id, role) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Tạo user mới (Admin)
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  /**
   * Lấy thống kê user (Admin)
   * @returns {Promise} User statistics
   */
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },
};

export default userService;
