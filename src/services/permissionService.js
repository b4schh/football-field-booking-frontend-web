import api from "./api";

/**
 * Permission Service
 * Xử lý các API calls liên quan đến quản lý quyền
 */

export const permissionService = {
  /**
   * Lấy tất cả permissions
   * @param {number} pageIndex - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @param {string} keyword - Search keyword (optional)
   * @param {string} module - Filter by module (optional)
   * @returns {Promise} Paginated list of permissions
   */
  getAllPermissions: async (pageIndex = 1, pageSize = 10, keyword = null, module = null) => {
    const params = { pageIndex, pageSize };
    if (keyword) params.keyword = keyword;
    if (module) params.module = module;
    const response = await api.get("/permissions", { params });
    return response.data;
  },

  /**
   * Lấy permissions nhóm theo module
   * @returns {Promise} Permissions grouped by module
   */
  getPermissionsGroupedByModule: async () => {
    const response = await api.get("/permissions/grouped");
    return response.data;
  },

  /**
   * Lấy permissions theo module
   * @param {string} module - Tên module
   * @returns {Promise} List of permissions in module
   */
  getPermissionsByModule: async (module) => {
    const response = await api.get(`/permissions/module/${module}`);
    return response.data;
  },

  /**
   * Lấy chi tiết permission theo ID
   * @param {number} id - Permission ID
   * @returns {Promise} Permission details
   */
  getPermissionById: async (id) => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  /**
   * Tạo permission mới
   * @param {Object} data - { permissionKey, description, module }
   * @returns {Promise} Created permission
   */
  createPermission: async (data) => {
    const response = await api.post("/permissions", data);
    return response.data;
  },

  /**
   * Cập nhật permission
   * @param {number} id - Permission ID
   * @param {Object} data - { permissionKey, description, module }
   * @returns {Promise} Updated permission
   */
  updatePermission: async (id, data) => {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },

  /**
   * Xóa permission
   * @param {number} id - Permission ID
   * @returns {Promise} Success message
   */
  deletePermission: async (id) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};
