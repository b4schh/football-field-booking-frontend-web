import api from "./api";

/**
 * Field Service
 * Xử lý các API calls liên quan đến quản lý sân bóng
 */

export const fieldService = {
    /**
     * Toggle isActive status của Field (API mới)
     * @param {string|number} id - Field ID
     * @param {boolean} isActive - New isActive status
     * @returns {Promise} Updated field
     */
    toggleFieldActive: async (id, isActive) => {
      const response = await api.patch(`/fields/${id}/toggle-active`, isActive, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
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
   * Lấy danh sách sân của mình (Owner) - có pagination và filters
   * @param {number} pageIndex - Page number
   * @param {number} pageSize - Items per page
   * @param {Object} filters - Filter parameters (searchTerm, complexId, fieldSize, surfaceType, isActive)
   * @returns {Promise} Paged list of owner's fields
   */
  getMyFields: async (pageIndex = 1, pageSize = 10, filters = {}) => {
    const params = {
      pageIndex,
      pageSize,
      ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      ...(filters.complexId && { complexId: filters.complexId }),
      ...(filters.fieldSize && { fieldSize: filters.fieldSize }),
      ...(filters.surfaceType && { surfaceType: filters.surfaceType }),
      ...(filters.isActive !== "" && { isActive: filters.isActive === "true" })
    };
    const response = await api.get("/fields/owner/my-fields", { params });
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
   * @param {boolean} includeTimeSlotCount - Include timeslot count in response
   * @returns {Promise} List of fields
   */
  getFieldsByComplexId: async (complexId, includeTimeSlotCount = false) => {
    const params = includeTimeSlotCount ? { includeTimeSlotCount: true } : {};
    const response = await api.get(`/fields/complex/${complexId}`, { params });
    return response.data;
  },

  /**
   * Lấy danh sách sân theo Complex ID kèm số lượng timeslot - API mới
   * @param {string|number} complexId - Complex ID
   * @returns {Promise} List of fields with timeslot count
   */
  getFieldsByComplexIdWithTimeSlotCount: async (complexId) => {
    const response = await api.get(`/fields/complex/${complexId}/with-timeslot-count`);
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
