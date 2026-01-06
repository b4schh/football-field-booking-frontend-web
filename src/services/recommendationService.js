import api from "./api";

/**
 * Recommendation Service
 * Xử lý các API calls liên quan đến hệ thống gợi ý cụm sân
 */

export const recommendationService = {
  /**
   * Lấy danh sách cụm sân tương tự (Complex-to-Complex Similarity)
   * Dùng khi user xem chi tiết 1 cụm sân
   * @param {number} complexId - ID của cụm sân hiện tại
   * @param {number} topK - Số lượng cụm sân tương tự (mặc định 10)
   * @returns {Promise} List of similar complexes with similarity scores
   */
  getSimilarComplexes: async (complexId, topK = 10) => {
    const response = await api.get(`/recommendations/similar-complex/${complexId}`, {
      params: { topK },
    });
    return response.data;
  },

  /**
   * Gợi ý cụm sân cho user mới (Location-based + Popularity)
   * Dùng khi user chưa có lịch sử booking
   * @param {Object} params - { province, ward, topK }
   * @returns {Promise} Recommended complexes for new users
   */
  getRecommendationsForNewUser: async (params = {}) => {
    const response = await api.get("/recommendations/new-user", { params });
    return response.data;
  },

  /**
   * Gợi ý cụm sân cá nhân hóa (Content-based Filtering)
   * Dùng khi user đã có lịch sử booking
   * Yêu cầu: User phải đăng nhập (JWT token)
   * @param {Object} params - { province, topK }
   * @returns {Promise} Personalized recommendations based on booking history
   */
  getPersonalizedRecommendations: async (params = {}) => {
    const response = await api.get("/recommendations/personalized", { params });
    return response.data;
  },

  /**
   * Smart Recommendation - Tự động chọn strategy tốt nhất
   * Logic:
   * - Nếu user login + có booking → Personalized
   * - Nếu không → Location-based
   * @param {Object} params - { province, ward, topK }
   * @returns {Promise} Smart recommendations
   */
  getSmartRecommendations: async (params = {}) => {
    const response = await api.get("/recommendations/smart", { params });
    return response.data;
  },
};

export default recommendationService;
