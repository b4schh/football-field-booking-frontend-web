import api from "./api";

/**
 * Authentication Service
 * Xử lý các API calls liên quan đến authentication
 */

export const authService = {
  /**
   * Đăng nhập
   * @param {Object} credentials - { username, password } hoặc { email, password }
   * @returns {Promise} Response chứa token và user info
   */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise} Response chứa token và user info
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise} User info
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export default authService;
