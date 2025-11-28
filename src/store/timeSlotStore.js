import { create } from "zustand";
import { timeSlotService } from "../services/timeSlotService";

const useTimeSlotStore = create((set, get) => ({
  // State
  timeSlots: [],
  currentTimeSlot: null,
  isLoading: false,
  error: null,

  // Actions
  fetchTimeSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await timeSlotService.getTimeSlots();
      set({ timeSlots: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách khung giờ";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchTimeSlotById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await timeSlotService.getTimeSlotById(id);
      set({ currentTimeSlot: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin khung giờ";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchTimeSlotsByFieldId: async (fieldId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await timeSlotService.getTimeSlotsByFieldId(fieldId);
      set({ timeSlots: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách khung giờ";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createTimeSlot: async (timeSlotData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await timeSlotService.createTimeSlot(timeSlotData);
      set((state) => ({
        timeSlots: [...state.timeSlots, data],
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo khung giờ thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateTimeSlot: async (id, timeSlotData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await timeSlotService.updateTimeSlot(id, timeSlotData);
      set((state) => ({
        timeSlots: state.timeSlots.map((slot) =>
          slot.id === id ? data : slot
        ),
        currentTimeSlot:
          state.currentTimeSlot?.id === id ? data : state.currentTimeSlot,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật khung giờ thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteTimeSlot: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await timeSlotService.deleteTimeSlot(id);
      set((state) => ({
        timeSlots: state.timeSlots.filter((slot) => slot.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xóa khung giờ thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentTimeSlot: () => set({ currentTimeSlot: null }),
}));

export default useTimeSlotStore;
