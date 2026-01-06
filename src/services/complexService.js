import api from "./api";

/**
 * Complex Service
 * Xử lý các API calls liên quan đến quản lý cụm sân
 */

export const complexService = {
  /**
   * Lấy danh sách cụm sân (có phân trang)
   * @param {Object} params - { pageIndex, pageSize }
   * @returns {Promise} Paged list of complexes
   */
  getComplexes: async (params = {}) => {
    const response = await api.get("/complexes", { params });
    return response.data;
  },

  /**
   * Lấy danh sách tất cả cụm sân cho Admin (bao gồm pending, rejected)
   * @param {Object} params - { pageIndex, pageSize, status }
   * @returns {Promise} Paged list of all complexes
   */
  getAllComplexesForAdmin: async (params = {}) => {
    const response = await api.get("/complexes/admin/all", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết cụm sân theo ID
   * @param {string|number} id - Complex ID
   * @returns {Promise} Complex details
   */
  getComplexById: async (id) => {
    const response = await api.get(`/complexes/${id}`);
    return response.data;
  },

  /**
   * Admin only - Lấy chi tiết cụm sân với rating, review count, và images
   * @param {string|number} id - Complex ID
   * @returns {Promise} Admin complex details with rating, reviews, and images
   */
  getComplexAdminDetails: async (id) => {
    const response = await api.get(`/complexes/${id}/admin-details`);
    return response.data;
  },

  /**
   * Lấy cụm sân với danh sách sân con
   * @param {string|number} id - Complex ID
   * @returns {Promise} Complex with fields
   */
  getComplexWithFields: async (id) => {
    const response = await api.get(`/complexes/${id}/with-fields`);
    return response.data;
  },

  /**
   * Lấy cụm sân với thông tin đầy đủ (fields + timeslots + availability)
   * @param {string|number} id - Complex ID
   * @param {string} date - Ngày kiểm tra (YYYY-MM-DD), optional
   * @returns {Promise} Full complex details
   */
  getComplexFullDetails: async (id, date = null) => {
    const params = date ? { date } : {};
    const response = await api.get(`/complexes/${id}/full-details`, { params });
    return response.data;
  },

  /**
   * Lấy cụm sân với availability theo từng ngày trong tuần
   * @param {string|number} id - Complex ID
   * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD), optional
   * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD), optional
   * @returns {Promise} Weekly complex details with daily availability
   */
  getComplexWeeklyDetails: async (id, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/complexes/${id}/weekly-details`, { params });
    return response.data;
  },

  /**
   * Lấy availability của complex theo từng ngày
   * @param {string|number} id - Complex ID
   * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD), optional
   * @param {number} days - Số ngày lấy (1-30), mặc định 7
   * @returns {Promise} Availability data
   */
  getAvailability: async (id, startDate = null, days = 7) => {
    const params = { days };
    if (startDate) params.startDate = startDate;
    const response = await api.get(`/complexes/${id}/availability`, { params });
    return response.data;
  },

  /**
   * Tìm kiếm cụm sân
   * @param {Object} searchParams - Search criteria
   * @returns {Promise} Search results with pagination
   */
  searchComplexes: async (searchParams) => {
    const response = await api.get("/complexes/search", { params: searchParams });
    return response.data;
  },

  /**
   * Lấy danh sách cụm sân của Owner hiện tại
   * @param {Object} params - Query parameters (pageIndex, pageSize)
   * @returns {Promise} Owner's complexes
   */
  getMyComplexes: async (params = {}) => {
    const response = await api.get("/complexes/owner/my-complexes", { params });
    return response.data;
  },

  /**
   * Lấy danh sách cụm sân theo Owner ID (Admin only)
   * @param {string|number} ownerId - Owner ID
   * @returns {Promise} Owner's complexes
   */
  getComplexesByOwnerId: async (ownerId) => {
    const response = await api.get(`/complexes/admin/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Tạo cụm sân mới (Owner)
   * @param {Object} complexData - Complex information
   * @returns {Promise} Created complex
   */
  createComplex: async (complexData) => {
    // Convert time format HH:mm to HH:mm:ss for TimeSpan
    const payload = {
      ...complexData,
      openingTime: complexData.openingTime ? `${complexData.openingTime}:00` : null,
      closingTime: complexData.closingTime ? `${complexData.closingTime}:00` : null,
    };
    const response = await api.post("/complexes/owner", payload);
    return response.data;
  },

  /**
   * Tạo cụm sân mới (Admin)
   * @param {Object} complexData - Complex information (bao gồm ownerId)
   * @returns {Promise} Created complex
   */
  createComplexByAdmin: async (complexData) => {
    // Convert time format HH:mm to HH:mm:ss for TimeSpan
    const payload = {
      ...complexData,
      openingTime: complexData.openingTime ? `${complexData.openingTime}:00` : null,
      closingTime: complexData.closingTime ? `${complexData.closingTime}:00` : null,
    };
    const response = await api.post("/complexes/admin", payload);
    return response.data;
  },

  /**
   * Cập nhật cụm sân
   * @param {string|number} id - Complex ID
   * @param {Object} complexData - Updated complex data
   * @returns {Promise} Updated complex
   */
  updateComplex: async (id, complexData) => {
    // Convert time format HH:mm to HH:mm:ss for TimeSpan if present
    const payload = { ...complexData };
    if (payload.openingTime && payload.openingTime.length === 5) {
      payload.openingTime = `${payload.openingTime}:00`;
    }
    if (payload.closingTime && payload.closingTime.length === 5) {
      payload.closingTime = `${payload.closingTime}:00`;
    }
    const response = await api.put(`/complexes/${id}`, payload);
    return response.data;
  },

  /**
   * Xóa cụm sân
   * @param {string|number} id - Complex ID
   * @returns {Promise} Response
   */
  deleteComplex: async (id) => {
    const response = await api.delete(`/complexes/${id}`);
    return response.data;
  },

  /**
   * Toggle isActive status của Complex (API mới)
   * @param {string|number} id - Complex ID
   * @param {boolean} isActive - New isActive status
   * @returns {Promise} Updated complex
   */
  toggleComplexActive: async (id, isActive) => {
    const response = await api.patch(`/complexes/${id}/toggle-active`, isActive, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  /**
   * Phê duyệt cụm sân (Admin only)
   * @param {string|number} id - Complex ID
   * @returns {Promise} Response
   */
  approveComplex: async (id) => {
    const response = await api.patch(`/complexes/${id}/approve`);
    return response.data;
  },

  /**
   * Từ chối cụm sân (Admin only)
   * @param {string|number} id - Complex ID
   * @param {string} reason - Lý do từ chối (optional)
   * @returns {Promise} Response
   */
  rejectComplex: async (id, reason = "") => {
    const response = await api.patch(`/complexes/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Gửi lại yêu cầu phê duyệt cho cụm sân bị từ chối (Owner only)
   * @param {string|number} id - Complex ID
   * @returns {Promise} Response
   */
  resubmitComplex: async (id) => {
    const response = await api.patch(`/complexes/${id}/resubmit`);
    return response.data;
  },
};

export default complexService;
