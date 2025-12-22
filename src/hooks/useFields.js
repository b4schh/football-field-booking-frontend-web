import { useState, useCallback } from "react";
import fieldService from "../services/fieldService";
import { useToast } from "../store/toastStore";

/**
 * Hook quản lý Fields
 * Hỗ trợ CRUD và toggle isActive
 */
export default function useFields() {
  const [fields, setFields] = useState([]);
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
  const toast = useToast();

  /**
   * Lấy tất cả fields của owner
   */
  const fetchAllFields = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.getMyFields(params);
      setFields(response.data || []);
      
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
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách sân";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Lấy danh sách fields theo complexId
   */
  const fetchFieldsByComplex = useCallback(async (complexId, includeTimeSlotCount = false) => {
    if (!complexId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.getFieldsByComplexId(complexId, includeTimeSlotCount);
      setFields(response.data || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách sân";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Lấy danh sách fields theo complexId kèm timeslot count - API mới
   */
  const fetchFieldsByComplexWithTimeSlotCount = useCallback(async (complexId) => {
    if (!complexId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.getFieldsByComplexIdWithTimeSlotCount(complexId);
      setFields(response.data || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách sân";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Lấy chi tiết field với timeslots
   */
  const fetchFieldWithTimeSlots = useCallback(async (fieldId) => {
    if (!fieldId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.getFieldWithTimeSlots(fieldId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải chi tiết sân";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Tạo field mới
   */
  const createField = useCallback(async (fieldData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.createField(fieldData);
      toast.success("Tạo sân thành công");
      
      // Refresh danh sách nếu có complexId
      if (fieldData.complexId) {
        await fetchFieldsByComplex(fieldData.complexId);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Tạo sân thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchFieldsByComplex]);

  /**
   * Cập nhật field
   */
  const updateField = useCallback(async (fieldId, fieldData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fieldService.updateField(fieldId, fieldData);
      toast.success("Cập nhật sân thành công");
      
      // Refresh danh sách nếu có complexId
      if (fieldData.complexId) {
        await fetchFieldsByComplex(fieldData.complexId);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Cập nhật sân thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchFieldsByComplex]);

  /**
   * Xóa field
   */
  const deleteField = useCallback(async (fieldId, complexId) => {
    setLoading(true);
    setError(null);
    try {
      await fieldService.deleteField(fieldId);
      toast.success("Xóa sân thành công");
      
      // Refresh danh sách
      if (complexId) {
        await fetchFieldsByComplex(complexId);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Xóa sân thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchFieldsByComplex]);

  /**
   * Toggle trạng thái isActive
   */
  const toggleFieldActive = useCallback(async (fieldId, isActive, complexId) => {
    setLoading(true);
    setError(null);
    try {
      await fieldService.toggleFieldActive(fieldId, isActive);
      toast.success(isActive ? "Đã kích hoạt sân" : "Đã tắt sân");
      if (complexId) {
        await fetchFieldsByComplex(complexId);
      }
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Cập nhật trạng thái thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchFieldsByComplex]);

  return {
    fields,
    loading,
    error,
    pagination,
    fetchAllFields,
    fetchFieldsByComplex,
    fetchFieldsByComplexWithTimeSlotCount,
    fetchFieldWithTimeSlots,
    createField,
    updateField,
    deleteField,
    toggleFieldActive,
  };
}
