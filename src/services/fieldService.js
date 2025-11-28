import api from "./api";

/**
 * Field Service
 * Xử lý các API calls liên quan đến quản lý sân bóng
 */

export const fieldService = {
  /**
   * Lấy danh sách sân (có pagination)
   * @param {Object} params - Query parameters (pageIndex, pageSize)
   * @returns {Promise} Paged list of fields
   */
  getFields: async (params = {}) => {
    const response = await api.get("/fields", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một sân
   * @param {string|number} id - Field ID
   * @returns {Promise} Field details
   */
  getFieldById: async (id) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },

  /**
   * Lấy sân với danh sách khung giờ
   * @param {string|number} id - Field ID
   * @returns {Promise} Field with timeslots
   */
  getFieldWithTimeSlots: async (id) => {
    const response = await api.get(`/fields/${id}/with-timeslots`);
    return response.data;
  },

  /**
   * Lấy danh sách sân theo Complex ID
   * @param {string|number} complexId - Complex ID
   * @returns {Promise} List of fields
   */
  getFieldsByComplexId: async (complexId) => {
    const response = await api.get(`/fields/complex/${complexId}`);
    return response.data;
  },

  /**
   * Tạo sân mới (Owner/Admin)
   * @param {Object} fieldData - Field information
   * @returns {Promise} Created field
   */
  createField: async (fieldData) => {
    const response = await api.post("/fields", fieldData);
    return response.data;
  },

  /**
   * Cập nhật thông tin sân
   * @param {string|number} id - Field ID
   * @param {Object} fieldData - Updated field data
   * @returns {Promise} Updated field
   */
  updateField: async (id, fieldData) => {
    const response = await api.put(`/fields/${id}`, fieldData);
    return response.data;
  },

  /**
   * Xóa sân
   * @param {string|number} id - Field ID
   * @returns {Promise} Response
   */
  deleteField: async (id) => {
    const response = await api.delete(`/fields/${id}`);
    return response.data;
  },
};

export default fieldService;
