import { useState, useCallback } from "react";
import recommendationService from "../services/recommendationService";

/**
 * Hook quản lý Recommendations
 * Hỗ trợ 4 loại recommendation:
 * 1. Similar Complexes - Gợi ý cụm sân tương tự
 * 2. New User - Gợi ý cho user mới
 * 3. Personalized - Gợi ý cá nhân hóa (yêu cầu login)
 * 4. Smart - Tự động chọn strategy tốt nhất
 */
export default function useRecommendation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null); // Lưu strategy được sử dụng

  /**
   * Lấy danh sách cụm sân tương tự
   */
  const fetchSimilarComplexes = useCallback(async (complexId, topK = 10) => {
    setLoading(true);
    setError(null);
    setStrategy("similar");
    try {
      const response = await recommendationService.getSimilarComplexes(complexId, topK);
      const complexes = response.data?.complexes || [];
      const usedStrategy = response.data?.recommendationType || "similarity";
      setRecommendations(complexes);
      setStrategy(usedStrategy);
      return { success: true, data: complexes, strategy: usedStrategy };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải gợi ý";
      setError(errorMsg);
      setRecommendations([]);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy gợi ý cho user mới (Location-based + Popularity)
   */
  const fetchNewUserRecommendations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    setStrategy("new-user");
    try {
      const response = await recommendationService.getRecommendationsForNewUser(params);
      const complexes = response.data?.complexes || [];
      const usedStrategy = response.data?.recommendationType || "location-popularity";
      setRecommendations(complexes);
      setStrategy(usedStrategy);
      return { success: true, data: complexes, strategy: usedStrategy };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải gợi ý";
      setError(errorMsg);
      setRecommendations([]);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy gợi ý cá nhân hóa (yêu cầu login)
   */
  const fetchPersonalizedRecommendations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    setStrategy("personalized");
    try {
      const response = await recommendationService.getPersonalizedRecommendations(params);
      const complexes = response.data?.complexes || [];
      const usedStrategy = response.data?.recommendationType || "content-based";
      setRecommendations(complexes);
      setStrategy(usedStrategy);
      return { success: true, data: complexes, strategy: usedStrategy };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải gợi ý";
      setError(errorMsg);
      setRecommendations([]);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Smart recommendation - Tự động chọn strategy tốt nhất
   */
  const fetchSmartRecommendations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    setStrategy("smart");
    try {
      const response = await recommendationService.getSmartRecommendations(params);
      const complexes = response.data?.complexes || [];
      const usedStrategy = response.data?.recommendationType || "unknown";
      setRecommendations(complexes);
      setStrategy(usedStrategy);
      return { success: true, data: complexes, strategy: usedStrategy };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải gợi ý";
      setError(errorMsg);
      setRecommendations([]);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setStrategy(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    strategy,
    fetchSimilarComplexes,
    fetchNewUserRecommendations,
    fetchPersonalizedRecommendations,
    fetchSmartRecommendations,
    reset,
  };
}
