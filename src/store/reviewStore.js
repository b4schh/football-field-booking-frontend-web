import { create } from "zustand";
import * as reviewService from "../services/reviewService";

/**
 * Review Store - Quản lý state cho reviews
 */
const useReviewStore = create((set, get) => ({
  // State
  reviews: [],
  statistics: {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  },
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  },
  currentReview: null,
  myReviews: [],
  isLoading: false,
  error: null,

  // Actions

  /**
   * Lấy danh sách review của complex với pagination
   */
  fetchComplexReviews: async (complexId, pageIndex = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.getComplexReviews(complexId, pageIndex, pageSize);
      
      if (response.success) {
        set({
          reviews: response.data.reviews,
          statistics: response.data.statistics,
          pagination: response.pagination,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || "Không thể tải danh sách đánh giá",
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Đã xảy ra lỗi khi tải đánh giá",
        isLoading: false
      });
    }
  },

  /**
   * Lấy danh sách review đơn giản (không phân trang)
   */
  fetchComplexReviewsSimple: async (complexId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.getComplexReviewsSimple(complexId);
      
      if (response.success) {
        set({
          reviews: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || "Không thể tải danh sách đánh giá",
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Đã xảy ra lỗi khi tải đánh giá",
        isLoading: false
      });
    }
  },

  /**
   * Tải thêm reviews (load more)
   */
  loadMoreReviews: async (complexId) => {
    const { pagination } = get();
    if (!pagination.hasNextPage) return;

    set({ isLoading: true, error: null });
    try {
      const nextPage = pagination.pageIndex + 1;
      const response = await reviewService.getComplexReviews(
        complexId, 
        nextPage, 
        pagination.pageSize
      );
      
      if (response.success) {
        set(state => ({
          reviews: [...state.reviews, ...response.data.reviews],
          pagination: response.pagination,
          isLoading: false
        }));
      } else {
        set({ 
          error: response.message || "Không thể tải thêm đánh giá",
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Đã xảy ra lỗi khi tải thêm đánh giá",
        isLoading: false
      });
    }
  },

  /**
   * Lấy điểm trung bình của complex
   */
  fetchComplexAverageRating: async (complexId) => {
    try {
      const response = await reviewService.getComplexAverageRating(complexId);
      
      if (response.success) {
        set(state => ({
          statistics: {
            ...state.statistics,
            averageRating: response.data
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  },

  /**
   * Lấy thông tin chi tiết của một review
   */
  fetchReviewById: async (reviewId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.getReviewById(reviewId);
      
      if (response.success) {
        set({
          currentReview: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || "Không thể tải thông tin đánh giá",
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Đã xảy ra lỗi khi tải đánh giá",
        isLoading: false
      });
    }
  },

  /**
   * Lấy danh sách review của user hiện tại
   */
  fetchMyReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.getMyReviews();
      
      if (response.success) {
        set({
          myReviews: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || "Không thể tải danh sách đánh giá của bạn",
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Đã xảy ra lỗi khi tải đánh giá",
        isLoading: false
      });
    }
  },

  /**
   * Tạo review mới
   */
  createReview: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.createReview(formData);
      
      if (response.success) {
        set(state => ({
          reviews: [response.data, ...state.reviews],
          isLoading: false
        }));
        return { success: true, data: response.data };
      } else {
        set({ 
          error: response.message || "Không thể tạo đánh giá",
          isLoading: false 
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi tạo đánh giá";
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Cập nhật review
   */
  updateReview: async (reviewId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.updateReview(reviewId, updateData);
      
      if (response.success) {
        set(state => ({
          reviews: state.reviews.map(review => 
            review.id === reviewId 
              ? { ...review, ...updateData } 
              : review
          ),
          myReviews: state.myReviews.map(review => 
            review.id === reviewId 
              ? { ...review, ...updateData } 
              : review
          ),
          isLoading: false
        }));
        return { success: true };
      } else {
        set({ 
          error: response.message || "Không thể cập nhật đánh giá",
          isLoading: false 
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật đánh giá";
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Xóa review
   */
  deleteReview: async (reviewId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewService.deleteReview(reviewId);
      
      if (response.success) {
        set(state => ({
          reviews: state.reviews.filter(review => review.id !== reviewId),
          myReviews: state.myReviews.filter(review => review.id !== reviewId),
          isLoading: false
        }));
        return { success: true };
      } else {
        set({ 
          error: response.message || "Không thể xóa đánh giá",
          isLoading: false 
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi xóa đánh giá";
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Vote review là hữu ích
   */
  voteHelpful: async (reviewId) => {
    try {
      const response = await reviewService.voteHelpful(reviewId);
      
      if (response.success) {
        set(state => ({
          reviews: state.reviews.map(review => 
            review.id === reviewId 
              ? { ...review, helpful: review.helpful + 1, isVotedByCurrentUser: true } 
              : review
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi vote";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Hủy vote review hữu ích
   */
  unvoteHelpful: async (reviewId) => {
    try {
      const response = await reviewService.unvoteHelpful(reviewId);
      
      if (response.success) {
        set(state => ({
          reviews: state.reviews.map(review => 
            review.id === reviewId 
              ? { ...review, helpful: Math.max(0, review.helpful - 1), isVotedByCurrentUser: false } 
              : review
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi hủy vote";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Reset store về trạng thái ban đầu
   */
  reset: () => {
    set({
      reviews: [],
      statistics: {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      },
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      },
      currentReview: null,
      myReviews: [],
      isLoading: false,
      error: null
    });
  }
}));

export default useReviewStore;
