import api from "./api";

/**
 * Admin Statistics Service
 * Xử lý các API calls liên quan đến thống kê của Admin
 */

export const adminStatisticsService = {
  /**
   * Lấy thống kê dashboard tổng quan
   * GET /api/statistics/admin/dashboard
   */
  getDashboardStats: async () => {
    const response = await api.get("/statistics/admin/dashboard");
    return response.data;
  },

  /**
   * Lấy dữ liệu biểu đồ tăng trưởng hệ thống
   * GET /api/statistics/admin/growth?startDate=&endDate=
   */
  getSystemGrowthChart: async (startDate, endDate) => {
    const response = await api.get("/statistics/admin/growth", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Lấy top cụm sân theo doanh thu
   * GET /api/statistics/admin/top-complexes?limit=10
   */
  getTopComplexes: async (limit = 10) => {
    const response = await api.get("/statistics/admin/top-complexes", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Lấy top khách hàng theo chi tiêu
   * GET /api/statistics/admin/top-customers?limit=10
   */
  getTopCustomers: async (limit = 10) => {
    const response = await api.get("/statistics/admin/top-customers", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Lấy phân bố trạng thái booking
   * GET /api/statistics/admin/booking-distribution
   */
  getBookingStatusDistribution: async () => {
    const response = await api.get("/statistics/admin/booking-distribution");
    return response.data;
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   * GET /api/statistics/admin/revenue?startDate=&endDate=
   */
  getRevenueChart: async (startDate, endDate) => {
    const response = await api.get("/statistics/admin/revenue", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Lấy danh sách bookings gần đây
   * GET /api/statistics/admin/recent-bookings?limit=10
   */
  getRecentBookings: async (limit = 10) => {
    const response = await api.get("/statistics/admin/recent-bookings", {
      params: { limit },
    });
    return response.data;
  },
};

export default adminStatisticsService;
