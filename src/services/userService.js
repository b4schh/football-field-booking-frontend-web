import api from "./api";

/**
 * User Service
 * Xử lý các API calls liên quan đến quản lý user
 */

export const userService = {
  /**
   * Lấy danh sách users với phân trang và filter (Admin)
   * @param {number} pageIndex - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @param {string} keyword - Search keyword (optional)
   * @param {string} role - Filter by role (optional)
   * @param {number} status - Filter by status (optional)
   * @returns {Promise} Paginated list of users
   */
  getUsers: async (pageIndex = 1, pageSize = 10, keyword = null, role = null, status = null) => {
    const params = { pageIndex, pageSize };
    if (keyword) params.keyword = keyword;
    if (role) params.role = role;
    if (status !== null && status !== undefined) params.status = status;
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
   * Cập nhật trạng thái user (Ban/Unban) (Admin)
   * @param {string|number} id - User ID
   * @param {number} status - Status (0: Inactive, 1: Active, 2: Banned)
   * @returns {Promise} Updated user
   */
  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cập nhật role user (Admin)
   * @param {string|number} id - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise} Updated user
   */
  updateUserRole: async (id, roleId) => {
    const response = await api.patch(`/users/${id}/role`, { roleId });
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
  getUserStatistics: async () => {
    const response = await api.get("/users/statistics");
    return response.data;
  },
};

export default userService;
