import { useState, useCallback } from "react";
import timeSlotService from "../services/timeSlotService";
import { useToast } from "../store/toastStore";

/**
 * Hook quản lý TimeSlots
 * Hỗ trợ CRUD và toggle isActive
 */
export default function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const toast = useToast();

  /**
   * Lấy danh sách timeslots theo fieldId
   */
  const fetchTimeSlotsByField = useCallback(async (fieldId) => {
    if (!fieldId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await timeSlotService.getTimeSlotsByFieldId(fieldId);
      setTimeSlots(response.data || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách khung giờ";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Tạo timeslot mới
   */
  const createTimeSlot = useCallback(async (timeSlotData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await timeSlotService.createTimeSlot(timeSlotData);
      toast.success("Tạo khung giờ thành công");
      
      // Refresh danh sách nếu có fieldId
      if (timeSlotData.fieldId) {
        await fetchTimeSlotsByField(timeSlotData.fieldId);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Tạo khung giờ thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchTimeSlotsByField]);

  /**
   * Cập nhật timeslot
   */
  const updateTimeSlot = useCallback(async (timeSlotId, timeSlotData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await timeSlotService.updateTimeSlot(timeSlotId, timeSlotData);
      toast.success("Cập nhật khung giờ thành công");
      
      // Refresh danh sách nếu có fieldId
      if (timeSlotData.fieldId) {
        await fetchTimeSlotsByField(timeSlotData.fieldId);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Cập nhật khung giờ thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchTimeSlotsByField]);

  /**
   * Xóa timeslot
   */
  const deleteTimeSlot = useCallback(async (timeSlotId, fieldId) => {
    setLoading(true);
    setError(null);
    try {
      await timeSlotService.deleteTimeSlot(timeSlotId);
      toast.success("Xóa khung giờ thành công");
      
      // Refresh danh sách
      if (fieldId) {
        await fetchTimeSlotsByField(fieldId);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Xóa khung giờ thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast, fetchTimeSlotsByField]);

  /**
   * Toggle trạng thái isActive
   */
  const toggleTimeSlotActive = useCallback(async (timeSlotId, isActive, fieldId) => {
    setLoading(true);
    setError(null);
    try {
      await timeSlotService.toggleTimeSlotActive(timeSlotId, isActive);
      toast.success(isActive ? "Đã kích hoạt khung giờ" : "Đã tắt khung giờ");
      // Refresh danh sách
      if (fieldId) {
        await fetchTimeSlotsByField(fieldId);
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
  }, [toast, fetchTimeSlotsByField]);

  /**
   * Lấy tất cả timeslots của owner (with pagination)
   */
  const fetchOwnerTimeSlots = useCallback(async (params = {}) => {
    const { pageIndex = 1, pageSize = 10 } = params;
    
    setLoading(true);
    setError(null);
    try {
      const response = await timeSlotService.getOwnerTimeSlots(pageIndex, pageSize);
      setTimeSlots(response.data || []);
      setPagination({
        pageIndex: response.pageIndex || pageIndex,
        pageSize: response.pageSize || pageSize,
        totalRecords: response.totalRecords || 0,
        totalPages: response.totalPages || 0,
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false,
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách khung giờ";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timeSlots,
    loading,
    error,
    pagination,
    fetchTimeSlotsByField,
    fetchOwnerTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    toggleTimeSlotActive,
  };
}
