import { useState, useCallback } from "react";
import complexService from "../services/complexService";

/**
 * Hook quản lý Complexes cho Owner
 * Tự động load dữ liệu khi khởi tạo
 */
export default function useOwnerComplexes() {
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchComplexes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await complexService.getMyComplexes(params);
      setComplexes(response.data || []);
      
      // Cập nhật pagination nếu có
      if (response.pageIndex !== undefined) {
        setPagination({
          currentPage: response.pageIndex,
          pageSize: response.pageSize,
          totalRecords: response.totalRecords,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        });
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải dữ liệu";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createComplex = useCallback(async (data) => {
    try {
      const response = await complexService.createComplex(data);
      await fetchComplexes(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Tạo cụm sân thất bại" 
      };
    }
  }, [fetchComplexes]);

  const updateComplex = useCallback(async (id, data) => {
    try {
      const response = await complexService.updateComplex(id, data);
      await fetchComplexes(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Cập nhật cụm sân thất bại" 
      };
    }
  }, [fetchComplexes]);

  const deleteComplex = useCallback(async (id) => {
    try {
      await complexService.deleteComplex(id);
      await fetchComplexes(); // Refresh list
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Xóa cụm sân thất bại" 
      };
    }
  }, [fetchComplexes]);

  return {
    complexes,
    loading,
    error,
    pagination,
    fetchComplexes,
    createComplex,
    updateComplex,
    deleteComplex,
  };
}
