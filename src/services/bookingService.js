import api from "./api";

/**
 * Booking Service
 * Xử lý các API calls liên quan đến đặt sân
 * Mapping đúng theo BookingsController backend
 */

export const bookingService = {
  /**
   * Tạo booking mới (Bước 1 - Customer)
   * POST /api/bookings
   * @param {Object} bookingData - { fieldId, timeSlotId, bookingDate, note }
   * @returns {Promise} Created booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  /**
   * Upload bill thanh toán cọc (Bước 2 - Customer)
   * POST /api/bookings/{id}/upload-payment
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
   * Duyệt booking (Bước 3 - Owner)
   * POST /api/bookings/{id}/approve
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  approveBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  },

  /**
   * Từ chối booking (Bước 3 - Owner)
   * POST /api/bookings/{id}/reject
   * @param {string|number} id - Booking ID
   * @param {string} reason - Lý do từ chối
   * @returns {Promise} Updated booking
   */
  rejectBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Hủy booking (Customer hoặc Owner)
   * POST /api/bookings/{id}/cancel
   * @param {string|number} id - Booking ID
   * @returns {Promise} Response
   */
  cancelBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  /**
   * Đánh dấu hoàn thành booking (Owner)
   * POST /api/bookings/{id}/complete
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  completeBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  },

  /**
   * Đánh dấu không đến (Owner)
   * POST /api/bookings/{id}/no-show
   * @param {string|number} id - Booking ID
   * @returns {Promise} Updated booking
   */
  markNoShow: async (id) => {
    const response = await api.post(`/bookings/${id}/no-show`);
    return response.data;
  },

  /**
   * Lấy booking của customer hiện tại
   * GET /api/bookings/my-bookings
   * @param {Object} params - Query parameters (status)
   * @returns {Promise} Customer's bookings
   */
  getMyBookings: async (params = {}) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  },

  /**
   * Lấy booking của owner hiện tại (có phân trang)
   * GET /api/bookings/owner-bookings
   * @param {Object} params - Query parameters (pageIndex, pageSize, status)
   * @returns {Promise} Owner's bookings với pagination metadata
   */
  getOwnerBookings: async (params = {}) => {
    const response = await api.get("/bookings/owner-bookings", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một booking
   * GET /api/bookings/{id}
   * @param {string|number} id - Booking ID
   * @returns {Promise} Booking details
   */
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Admin - Lấy tất cả bookings với filters (Admin only)
   * GET /api/bookings/admin/all
   * @param {Object} params - { pageIndex, pageSize, status, complexId, ownerId, customerId, fromDate, toDate, searchTerm }
   * @returns {Promise} All bookings với pagination
   */
  getAllBookingsForAdmin: async (params = {}) => {
    const response = await api.get("/bookings/admin/all", { params });
    return response.data;
  },

  /**
   * Admin - Force complete booking (testing purpose)
   * PATCH /api/admin/{id}/force-complete
   * @param {string|number} id - Booking ID
   * @returns {Promise} Response
   */
  adminForceComplete: async (id) => {
    const response = await api.patch(`/admin/${id}/force-complete`);
    return response.data;
  },
};

export default bookingService;
