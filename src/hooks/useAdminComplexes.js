import { useState, useEffect } from "react";
import dashboardApi from "../services/dashboardApi";

export default function useAdminComplexes() {
  const [complexes, setComplexes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplexes = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        pageIndex: page,
        pageSize: 10,
      };
      
      if (searchTerm) {
        params.name = searchTerm;
      }

      const response = await dashboardApi.complexes.getComplexes(params);
      const { data, pageIndex, totalPages, totalRecords, pageSize } = response.data;

      setComplexes(data || []);
      setPagination({
        currentPage: pageIndex,
        totalPages,
        totalRecords,
        pageSize,
        hasNextPage: pageIndex < totalPages,
        hasPreviousPage: pageIndex > 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const createComplex = async (data) => {
    try {
      const response = await dashboardApi.complexes.createComplexAsAdmin(data);
      await fetchComplexes(pagination.currentPage); // Refresh current page
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Tạo cụm sân thất bại" 
      };
    }
  };

  const updateComplex = async (id, data) => {
    try {
      const response = await dashboardApi.complexes.updateComplex(id, data);
      await fetchComplexes(pagination.currentPage); // Refresh current page
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Cập nhật cụm sân thất bại" 
      };
    }
  };

  const deleteComplex = async (id) => {
    try {
      await dashboardApi.complexes.deleteComplex(id);
      await fetchComplexes(pagination.currentPage); // Refresh current page
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Xóa cụm sân thất bại" 
      };
    }
  };

  useEffect(() => {
    fetchComplexes();
  }, []);

  return {
    complexes,
    pagination,
    loading,
    error,
    fetchComplexes,
    createComplex,
    updateComplex,
    deleteComplex,
  };
}
