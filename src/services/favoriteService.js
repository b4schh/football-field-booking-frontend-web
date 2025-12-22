import api from "./api";

/**
 * Favorite Service
 * Xử lý các API calls liên quan đến sân yêu thích
 */

export const favoriteService = {
  /**
   * Lấy danh sách sân yêu thích của user
   * @returns {Promise} List of favorite complexes
   */
  getMyFavorites: async () => {
    const response = await api.get("/favorites/my-favorites");
    return response.data?.data || response.data;
  },

  /**
   * Kiểm tra xem sân có phải yêu thích không
   * @param {string|number} complexId - Complex ID
   * @returns {Promise} { isFavorite: boolean }
   */
  isFavorite: async (complexId) => {
    const response = await api.get(`/favorites/${complexId}/is-favorite`);
    return response.data?.data || response.data;
  },

  /**
   * Toggle trạng thái yêu thích (thêm/xóa)
   * @param {string|number} complexId - Complex ID
   * @returns {Promise} { isFavorite: boolean, message: string }
   */
  toggleFavorite: async (complexId) => {
    const response = await api.post(`/favorites/${complexId}/toggle`);
    return response.data?.data || response.data;
  },
};

export default favoriteService;
