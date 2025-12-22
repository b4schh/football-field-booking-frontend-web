import api from "./api";

/**
 * TimeSlot Service
 * Xử lý các API calls liên quan đến quản lý khung giờ
 */

export const timeSlotService = {
  /**
   * Lấy danh sách khung giờ
   * @returns {Promise} List of timeslots
   */
  getTimeSlots: async () => {
    const response = await api.get("/timeslots");
    return response.data;
  },

  /**
   * Lấy khung giờ theo ID
   * @param {string|number} id - TimeSlot ID
   * @returns {Promise} TimeSlot details
   */
  getTimeSlotById: async (id) => {
    const response = await api.get(`/timeslots/${id}`);
    return response.data;
  },

  /**
   * Lấy khung giờ theo Field ID
   * @param {string|number} fieldId - Field ID
   * @returns {Promise} List of timeslots
   */
  getTimeSlotsByFieldId: async (fieldId) => {
    const response = await api.get(`/timeslots/field/${fieldId}`);
    return response.data;
  },

  /**
   * Tạo khung giờ mới
   * @param {Object} timeSlotData - { fieldId, startTime, endTime }
   * @returns {Promise} Created timeslot
   */
  createTimeSlot: async (timeSlotData) => {
    // Convert time format HH:mm to HH:mm:ss for TimeSpan
    const payload = {
      ...timeSlotData,
      startTime: timeSlotData.startTime ? `${timeSlotData.startTime}:00` : null,
      endTime: timeSlotData.endTime ? `${timeSlotData.endTime}:00` : null,
    };
    const response = await api.post("/timeslots", payload);
    return response.data;
  },

  /**
   * Cập nhật khung giờ
   * @param {string|number} id - TimeSlot ID
   * @param {Object} timeSlotData - Updated data
   * @returns {Promise} Updated timeslot
   */
  updateTimeSlot: async (id, timeSlotData) => {
    // Convert time format HH:mm to HH:mm:ss for TimeSpan if present
    const payload = { ...timeSlotData };
    if (payload.startTime && payload.startTime.length === 5) {
      payload.startTime = `${payload.startTime}:00`;
    }
    if (payload.endTime && payload.endTime.length === 5) {
      payload.endTime = `${payload.endTime}:00`;
    }
    const response = await api.put(`/timeslots/${id}`, payload);
    return response.data;
  },

  /**
   * Xóa khung giờ
   * @param {string|number} id - TimeSlot ID
   * @returns {Promise} Response
   */
  deleteTimeSlot: async (id) => {
    const response = await api.delete(`/timeslots/${id}`);
    return response.data;
  },

  /**
   * Toggle isActive status của TimeSlot (API mới)
   * @param {string|number} id - TimeSlot ID
   * @param {boolean} isActive - New isActive status
   * @returns {Promise} Updated timeslot
   */
  toggleTimeSlotActive: async (id, isActive) => {
    const response = await api.patch(`/timeslots/${id}/toggle-active`, isActive, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  /**
   * Lấy tất cả timeslots của owner (with pagination)
   * @param {number} pageIndex - Page number (default 1)
   * @param {number} pageSize - Items per page (default 10)
   * @returns {Promise} Paged timeslots của owner
   */
  getOwnerTimeSlots: async (pageIndex = 1, pageSize = 10) => {
    const response = await api.get(`/timeslots/owner/my-time-slots`, {
      params: { pageIndex, pageSize }
    });
    return response.data;
  },
};

export default timeSlotService;
