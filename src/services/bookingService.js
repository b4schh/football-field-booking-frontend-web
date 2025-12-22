import api from "./api";

/**
 * Booking Service
 * Xử lý các API calls liên quan đến đặt sân
 */

export const bookingService = {
  /**
   * Lấy danh sách booking
   * @param {Object} params - Query parameters (status, date, etc.)
   * @returns {Promise} List of bookings
   */
  getBookings: async (params = {}) => {
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một booking
   * @param {string|number} id - Booking ID
   * @returns {Promise} Booking details
   */
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Tạo booking mới
   * @param {Object} bookingData - { fieldId, timeSlotId, bookingDate, note }
   * @returns {Promise} Created booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  /**
   * Upload bill thanh toán cọc (Bước 2 của booking flow)
   * @param {string|number} id - Booking ID
   * @param {FormData} formData - Form data chứa file ảnh bill
   * @returns {Promise} Updated booking
   */
  uploadPaymentProof: async (id, formData) => {
    const response = await api.post(`/bookings/${id}/upload-payment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Duyệt booking (Owner - Bước 3)
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  approveBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  },

  /**
   * Từ chối booking (Owner - Bước 3)
   * @param {string|number} id - Booking ID
   * @param {string} reason - Lý do từ chối
   * @returns {Promise} Updated booking
   */
  rejectBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Cập nhật booking
   * @param {string|number} id - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise} Updated booking
   */
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  /**
   * Hủy booking
   * @param {string|number} id - Booking ID
   * @param {string} reason - Lý do hủy (optional)
   * @returns {Promise} Response
   */
  cancelBooking: async (id, reason = "") => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Hoàn thành booking
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  completeBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  },

  /**
   * Lấy booking của customer hiện tại
   * @param {Object} params - Query parameters
   * @returns {Promise} Customer's bookings
   */
  getMyBookings: async (params = {}) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  },

  /**
   * Lấy booking của owner hiện tại
   * @param {Object} params - Query parameters
   * @returns {Promise} Owner's bookings
   */
  getOwnerBookings: async (params = {}) => {
    const response = await api.get("/bookings/owner-bookings", { params });
    return response.data;
  },

  /**
   * Hoàn thành booking (Owner)
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  completeBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  },

  /**
   * Kiểm tra khả năng đặt sân (stub - backend may implement `/bookings/check-availability`)
   * @param {Object} bookingData
   */
  checkAvailability: async (bookingData) => {
    const response = await api.post(`/bookings/check-availability`, bookingData);
    return response.data;
  },

  /**
   * Đánh dấu không đến (Owner)
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  markNoShow: async (id) => {
    const response = await api.post(`/bookings/${id}/no-show`);
    return response.data;
  },
};

export default bookingService;
