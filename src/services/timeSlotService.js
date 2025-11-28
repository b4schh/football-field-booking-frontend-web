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
   * @param {Object} timeSlotData - { fieldId, startTime, endTime, price }
   * @returns {Promise} Created timeslot
   */
  createTimeSlot: async (timeSlotData) => {
    const response = await api.post("/timeslots", timeSlotData);
    return response.data;
  },

  /**
   * Cập nhật khung giờ
   * @param {string|number} id - TimeSlot ID
   * @param {Object} timeSlotData - Updated data
   * @returns {Promise} Updated timeslot
   */
  updateTimeSlot: async (id, timeSlotData) => {
    const response = await api.put(`/timeslots/${id}`, timeSlotData);
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
};

export default timeSlotService;
