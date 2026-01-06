import api from "./api";

/**
 * Role Service
 * Xử lý các API calls liên quan đến quản lý vai trò
 */

export const roleService = {
  /**
   * Lấy tất cả roles
   * @returns {Promise} List of roles
   */
  getAllRoles: async () => {
    const response = await api.get("/roles");
    return response.data;
  },

  /**
   * Lấy chi tiết role theo ID (bao gồm permissions)
   * @param {number} id - Role ID
   * @returns {Promise} Role details with permissions
   */
  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Tạo role mới
   * @param {Object} data - { name, description, isActive }
   * @returns {Promise} Created role
   */
  createRole: async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
  },

  /**
   * Cập nhật role
   * @param {number} id - Role ID
   * @param {Object} data - { name, description, isActive }
   * @returns {Promise} Updated role
   */
  updateRole: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Xóa role
   * @param {number} id - Role ID
   * @returns {Promise} Success message
   */
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  /**
   * Gán permissions cho role
   * @param {number} id - Role ID
   * @param {Array<number>} permissionIds - List of permission IDs
   * @returns {Promise} Success message
   */
  assignPermissionsToRole: async (id, permissionIds) => {
    const response = await api.post(`/roles/${id}/permissions`, { 
      permissionIds 
    });
    return response.data;
  },

  /**
   * Lấy danh sách permissions của role
   * @param {number} id - Role ID
   * @returns {Promise} List of permissions
   */
  getRolePermissions: async (id) => {
    const response = await api.get(`/roles/${id}/permissions`);
    return response.data;
  },
};
