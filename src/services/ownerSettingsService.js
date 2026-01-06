import api from "./api";

/**
 * Service xử lý các API calls liên quan đến Owner Settings
 * - Lấy thông tin settings của owner
 * - Cập nhật thông tin ngân hàng
 * - Upload QR code
 */

const ownerSettingsService = {
  /**
   * Lấy thông tin settings của owner
   * GET /api/owner/settings
   * @returns {Promise} Response chứa owner settings và system defaults
   */
  getSettings: async () => {
    try {
      const response = await api.get("/owner/settings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cập nhật thông tin settings chung
   * PUT /api/owner/settings
   * @param {Object} data - Dữ liệu cập nhật
   * @param {number} data.depositRate - Tỷ lệ đặt cọc
   * @param {number} data.minBookingNotice - Thời gian đặt trước tối thiểu
   * @param {boolean} data.allowReview - Cho phép đánh giá
   * @returns {Promise} Response thành công
   */
  updateSettings: async (data) => {
    try {
      const response = await api.put("/owner/settings", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cập nhật thông tin ngân hàng và upload QR code
   * PUT /api/owner/settings/bank-info
   * @param {Object} data - Dữ liệu ngân hàng
   * @param {string} data.bankName - Tên ngân hàng
   * @param {string} data.bankAccountNumber - Số tài khoản
   * @param {string} data.bankAccountName - Tên chủ tài khoản
   * @param {File} data.qrCodeImage - File ảnh QR code (optional)
   * @returns {Promise} Response thành công
   */
  updateBankInfo: async (data) => {
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("bankName", data.bankName);
      formData.append("bankAccountNumber", data.bankAccountNumber);
      formData.append("bankAccountName", data.bankAccountName);
      
      if (data.qrCodeImage) {
        formData.append("qrCodeImage", data.qrCodeImage);
      }

      const response = await api.put("/owner/settings/bank-info", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Kiểm tra xem owner đã có đầy đủ thông tin ngân hàng chưa
   * GET /api/owner/settings/bank-info/validate
   * @returns {Promise<boolean>} True nếu đã có đầy đủ thông tin
   */
  validateBankInfo: async () => {
    try {
      const response = await api.get("/owner/settings/bank-info/validate");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Lấy thông tin ngân hàng của owner theo ownerId (dành cho customer xem)
   * GET /api/owner/settings/by-owner/{ownerId}
   * @param {number} ownerId - ID của owner
   * @returns {Promise} Response chứa bank info của owner
   */
  getOwnerBankInfo: async (ownerId) => {
    try {
      const response = await api.get(`/owner/settings/by-owner/${ownerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Lấy full URL của ảnh QR code từ relative path
   * @param {string} relativePath - Đường dẫn tương đối từ backend
   * @returns {string} Full URL của ảnh
   */
  getFullImageUrl: (relativePath) => {
    if (!relativePath) return "";
    
    // Nếu đã là full URL thì trả về luôn
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return relativePath;
    }
    
    // Ghép với base URL của MinIO
    const minioBaseUrl = import.meta.env.VITE_MINIO_BASE_URL || "http://localhost:9000";
    return `${minioBaseUrl}${relativePath}`;
  },
};

export default ownerSettingsService;
