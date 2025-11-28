import api from "./api";

/**
 * Review Service - Quản lý các API liên quan đến reviews
 */

/**
 * Lấy danh sách review của complex với pagination và statistics
 * @param {number} complexId - ID của complex
 * @param {number} pageIndex - Số trang (mặc định: 1)
 * @param {number} pageSize - Số lượng review mỗi trang (mặc định: 10)
 * @returns {Promise} Response chứa reviews, statistics và pagination
 */
export const getComplexReviews = async (complexId, pageIndex = 1, pageSize = 10) => {
  const response = await api.get(`/reviews/complex/${complexId}/paginated`, {
    params: { pageIndex, pageSize }
  });
  return response.data;
};

/**
 * Lấy danh sách tất cả review của complex (không phân trang)
 * @param {number} complexId - ID của complex
 * @returns {Promise} Response chứa danh sách reviews
 */
export const getComplexReviewsSimple = async (complexId) => {
  const response = await api.get(`/reviews/complex/${complexId}`);
  return response.data;
};

/**
 * Lấy điểm trung bình của complex
 * @param {number} complexId - ID của complex
 * @returns {Promise} Response chứa điểm trung bình
 */
export const getComplexAverageRating = async (complexId) => {
  const response = await api.get(`/reviews/complex/${complexId}/average-rating`);
  return response.data;
};

/**
 * Lấy danh sách review của field
 * @param {number} fieldId - ID của field
 * @returns {Promise} Response chứa danh sách reviews
 */
export const getFieldReviews = async (fieldId) => {
  const response = await api.get(`/reviews/field/${fieldId}`);
  return response.data;
};

/**
 * Lấy điểm trung bình của field
 * @param {number} fieldId - ID của field
 * @returns {Promise} Response chứa điểm trung bình
 */
export const getFieldAverageRating = async (fieldId) => {
  const response = await api.get(`/reviews/field/${fieldId}/average-rating`);
  return response.data;
};

/**
 * Lấy thông tin chi tiết của một review
 * @param {number} reviewId - ID của review
 * @returns {Promise} Response chứa thông tin review
 */
export const getReviewById = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Lấy danh sách review của user hiện tại
 * @returns {Promise} Response chứa danh sách reviews của user
 */
export const getMyReviews = async () => {
  const response = await api.get(`/reviews/my-reviews`);
  return response.data;
};

/**
 * Tạo review mới
 * @param {FormData} formData - Form data chứa thông tin review (rating, comment, images, fieldId)
 * @returns {Promise} Response chứa thông tin review vừa tạo
 */
export const createReview = async (formData) => {
  const response = await api.post(`/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Cập nhật review
 * @param {number} reviewId - ID của review
 * @param {object} updateData - Dữ liệu cập nhật (rating, comment)
 * @returns {Promise} Response xác nhận cập nhật
 */
export const updateReview = async (reviewId, updateData) => {
  const response = await api.put(`/reviews/${reviewId}`, updateData);
  return response.data;
};

/**
 * Xóa review của user
 * @param {number} reviewId - ID của review
 * @returns {Promise} Response xác nhận xóa
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Vote review là hữu ích
 * @param {number} reviewId - ID của review
 * @returns {Promise} Response xác nhận vote
 */
export const voteHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/vote-helpful`);
  return response.data;
};

/**
 * Hủy vote review hữu ích
 * @param {number} reviewId - ID của review
 * @returns {Promise} Response xác nhận hủy vote
 */
export const unvoteHelpful = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}/vote-helpful`);
  return response.data;
};

export default {
  getComplexReviews,
  getComplexReviewsSimple,
  getComplexAverageRating,
  getFieldReviews,
  getFieldAverageRating,
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
  unvoteHelpful
};
