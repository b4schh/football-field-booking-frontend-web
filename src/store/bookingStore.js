import { create } from "zustand";
import { bookingService } from "../services/bookingService";

/**
 * Booking Store
 * Quản lý state cho toàn bộ booking flow
 */
const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  myBookings: [],
  ownerBookings: [],
  ownerBookingsPagination: {
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  isLoading: false,
  error: null,

  // Actions

  /**
   * Tạo booking mới (Customer - Bước 1)
   */
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.createBooking(bookingData);
      const booking = response.data;
      set((state) => ({
        bookings: [...state.bookings, booking],
        currentBooking: booking,
        isLoading: false,
      }));
      return { success: true, data: booking };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đặt sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Upload payment proof (Customer - Bước 2)
   */
  uploadPaymentProof: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.uploadPaymentProof(id, formData);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
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

  /**
   * Duyệt booking (Owner - Bước 3)
   */
  approveBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.approveBooking(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
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

  /**
   * Từ chối booking (Owner - Bước 3)
   */
  rejectBooking: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.rejectBooking(id, reason);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
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

  /**
   * Hủy booking (Customer hoặc Owner)
   */
  cancelBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.cancelBooking(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        myBookings: state.myBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Hủy đặt sân thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Hoàn thành booking (Owner)
   */
  completeBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.completeBooking(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
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

  /**
   * Đánh dấu không đến (Owner)
   */
  markNoShow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.markNoShow(id);
      const data = response.data;
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        ownerBookings: state.ownerBookings.map((booking) =>
          booking.id === id ? data : booking
        ),
        currentBooking: state.currentBooking?.id === id ? data : state.currentBooking,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đánh dấu không đến thất bại";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Lấy booking của customer
   */
  fetchMyBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getMyBookings(params);
      const bookings = response.data || [];
      set({ myBookings: bookings, isLoading: false });
      return { success: true, data: bookings };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải booking của bạn";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Lấy booking của owner với phân trang
   */
  fetchOwnerBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getOwnerBookings(params);
      const bookings = response?.data || [];
      const pagination = {
        pageIndex: response?.pageIndex || 1,
        pageSize: response?.pageSize || 10,
        totalRecords: response?.totalRecords || 0,
        totalPages: response?.totalPages || 0,
        hasPreviousPage: response?.hasPreviousPage || false,
        hasNextPage: response?.hasNextPage || false,
      };
      set({ 
        ownerBookings: bookings, 
        ownerBookingsPagination: pagination,
        isLoading: false 
      });
      return { success: true, data: bookings, pagination };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách booking";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Lấy chi tiết booking
   */
  fetchBookingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getBookingById(id);
      const booking = response.data;
      set({ currentBooking: booking, isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin đặt sân";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  clearCurrentBooking: () => set({ currentBooking: null }),
}));

export default useBookingStore;
