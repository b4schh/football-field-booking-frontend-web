import { create } from "zustand";
import { bookingService } from "../services/bookingService";

const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  myBookings: [],
  isLoading: false,
  error: null,

  // Actions
  fetchBookings: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.getBookings(filters);
      set({ bookings: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách đặt sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchBookingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getBookingById(id);
      const booking = response.data; // Extract data from ApiResponse
      set({ currentBooking: booking, isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin đặt sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.createBooking(bookingData);
      // Backend returns: { data: { success, message, data: BookingDto } }
      const booking = response.data; // This is the BookingDto
      set((state) => ({
        bookings: [...state.bookings, booking],
        currentBooking: booking,
        isLoading: false,
      }));
      return { success: true, data: booking }; // Return BookingDto directly
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đặt sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateBooking: async (id, bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.updateBooking(id, bookingData);
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking:
          state.currentBooking?.id === id ? data : state.currentBooking,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật đặt sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  cancelBooking: async (id, reason = "") => {
    set({ isLoading: true, error: null });
    try {
      await bookingService.cancelBooking(id, reason);
      set((state) => ({
        bookings: state.bookings.filter((booking) => booking.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Hủy đặt sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Lấy booking của user
  fetchMyBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getMyBookings(params);
      const bookings = response.data || []; // Extract data from ApiResponse
      set({ myBookings: bookings, isLoading: false });
      return { success: true, data: bookings };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải booking của bạn";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Check availability
  checkAvailability: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.checkAvailability(bookingData);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể kiểm tra lịch trống";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

      // Xác nhận booking (Owner/Admin)
  approveBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.approveBooking(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Duyệt booking thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Từ chối booking (Owner/Admin)
  rejectBooking: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.rejectBooking(id, reason);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Từ chối booking thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Upload payment proof
  uploadPaymentProof: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.uploadPaymentProof(id, formData);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? { ...booking, ...data } : booking
        ),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload bill thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Hoàn thành booking (Owner)
  completeBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.completeBooking(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Hoàn thành booking thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Đánh dấu không đến (Owner)
  markNoShow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.markNoShow(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đánh dấu no-show thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Lấy booking của owner
  fetchOwnerBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getOwnerBookings(params);
      // backend returns ApiResponse { success, message, statusCode, data: [...] }
      const bookings = response?.data || [];
      set({ bookings: bookings, isLoading: false });
      return { success: true, data: bookings };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải booking của owner";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentBooking: () => set({ currentBooking: null }),
}));

export default useBookingStore;
