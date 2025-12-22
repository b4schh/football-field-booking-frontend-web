import api from "./api";

/**
 * Complex Image Service
 * Xử lý các API calls liên quan đến ảnh cụm sân
 */

export const complexImageService = {
  /**
   * Upload ảnh cụm sân
   * @param {string|number} complexId - Complex ID
   * @param {FormData} formData - Form data chứa file và description
   * @returns {Promise} Uploaded image info
   */
  uploadImage: async (complexId, formData) => {
    const response = await api.post(`/complex-images/${complexId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách ảnh của cụm sân
   * @param {string|number} complexId - Complex ID
   * @returns {Promise} List of images
   */
  getComplexImages: async (complexId) => {
    const response = await api.get(`/complex-images/${complexId}`);
    return response.data;
  },

  /**
   * Xóa ảnh cụm sân
   * @param {string|number} imageId - Image ID
   * @returns {Promise} Response
   */
  deleteImage: async (imageId) => {
    const response = await api.delete(`/complex-images/${imageId}`);
    return response.data;
  },

  /**
   * Đặt ảnh làm ảnh chính của cụm sân
   * @param {string|number} imageId - Image ID
   * @returns {Promise} Response
   */
  setMainImage: async (imageId) => {
    const response = await api.put(`/complex-images/${imageId}/set-main`);
    return response.data;
  },
};

export default complexImageService;
