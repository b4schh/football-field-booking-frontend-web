import { useState, useEffect, useCallback, useRef } from "react";
import dashboardApi from "../services/dashboardApi";

export default function useOwnerDashboard() {
  const [stats, setStats] = useState({
    totalComplexes: 0,
    totalFields: 0,
    activeFields: 0,
    pendingBookings: 0,
    todayBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingRevenue: 0,
    occupancyRate: 0,
    avgBookingValue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [topFields, setTopFields] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [bookingsByHour, setBookingsByHour] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [weekCount, setWeekCount] = useState(8);
  
  // Ref để cancel previous requests khi đổi period nhanh
  const abortControllerRef = useRef(null);

  const periodTypeMap = {
    'daily': 0,
    'weekly': 1,
    'monthly': 2,
    'quarterly': 3,
    'yearly': 4
  };

  // Helper function để format date thành YYYY-MM-DD theo local timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateRange = useCallback((period, customWeekCount = null) => {
    const today = new Date();
    let start, end;
    
    // Dùng customWeekCount nếu được cung cấp, không thì dùng state weekCount
    const activeWeekCount = customWeekCount !== null ? customWeekCount : weekCount;

    switch (period) {
      case 'daily': {
        // Tuần hiện tại: từ thứ 2 đến CN (7 ngày)
        const dayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        start = new Date(today);
        start.setDate(today.getDate() - daysFromMonday);
        start.setHours(0, 0, 0, 0);
        
        end = new Date(start);
        end.setDate(start.getDate() + 6); // +6 ngày = CN (tổng 7 ngày)
        end.setHours(23, 59, 59, 999);
        
        const startDateStr = formatDateLocal(start);
        const endDateStr = formatDateLocal(end);
        
        console.log('[Daily] Today:', today.toLocaleDateString('vi-VN'), 'DayOfWeek:', dayOfWeek);
        console.log('[Daily] Start (T2):', start.toLocaleDateString('vi-VN'), '| Date obj:', start.getDate());
        console.log('[Daily] End (CN):', end.toLocaleDateString('vi-VN'), '| Date obj:', end.getDate());
        console.log('[Daily] Local Date Strings:', startDateStr, 'to', endDateStr);
        break;
      }
      case 'weekly': {
        /**
         * Logic hiển thị theo tuần:
         * - Tuần bắt đầu từ Thứ 2 và kết thúc vào Chủ nhật
         * - weekCount = số tuần muốn hiển thị
         * - Hiển thị weekCount tuần gần nhất, kết thúc ở tuần hiện tại
         * 
         * Ví dụ: Hôm nay là Thứ 4 24/12/2025, weekCount = 8
         * - Thứ 2 tuần hiện tại: 22/12/2025
         * - Chủ nhật tuần hiện tại: 28/12/2025
         * - Start: Thứ 2 của tuần thứ 8 (7 tuần trước): 27/10/2025
         * - End: Chủ nhật tuần hiện tại: 28/12/2025
         * - Range: 27/10 đến 28/12 = 63 ngày nhưng chỉ lấy từ Thứ 2 đến CN
         */
        
        // Bước 1: Tìm Thứ 2 của tuần hiện tại
        const dayOfWeek = today.getDay(); // 0=CN, 1=T2, 2=T3,..., 6=T7
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // CN=6, T2=0, T3=1,...
        
        const currentWeekMonday = new Date(today);
        currentWeekMonday.setDate(today.getDate() - daysFromMonday);
        currentWeekMonday.setHours(0, 0, 0, 0);
        
        // Bước 2: Tính Chủ nhật của tuần hiện tại
        const currentWeekSunday = new Date(currentWeekMonday);
        currentWeekSunday.setDate(currentWeekMonday.getDate() + 6);
        currentWeekSunday.setHours(23, 59, 59, 999);
        
        // Bước 3: Start = Thứ 2 của tuần đầu tiên (lùi về activeWeekCount-1 tuần)
        start = new Date(currentWeekMonday);
        start.setDate(currentWeekMonday.getDate() - (7 * (activeWeekCount - 1)));
        start.setHours(0, 0, 0, 0);
        
        // Bước 4: End = Chủ nhật của tuần hiện tại
        end = new Date(currentWeekSunday);
        
        // Debug logging
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const totalWeeks = totalDays / 7;
        const startDateStr = formatDateLocal(start);
        const endDateStr = formatDateLocal(end);
        
        console.log('=== WEEKLY PERIOD DEBUG ===');
        console.log('[Weekly] activeWeekCount:', activeWeekCount, '(state:', weekCount, ')');
        console.log('[Weekly] Hôm nay:', today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        console.log('[Weekly] Thứ 2 tuần này:', currentWeekMonday.toLocaleDateString('vi-VN'));
        console.log('[Weekly] CN tuần này:', currentWeekSunday.toLocaleDateString('vi-VN'));
        console.log('[Weekly] activeWeekCount:', activeWeekCount);
        console.log('[Weekly] Start (T2):', start.toLocaleDateString('vi-VN'), '| Date obj:', start.getDate());
        console.log('[Weekly] End (CN):', end.toLocaleDateString('vi-VN'), '| Date obj:', end.getDate());
        console.log('[Weekly] Total:', totalDays, 'ngày =', totalWeeks, 'tuần');
        console.log('[Weekly] Local Date Strings:', startDateStr, 'to', endDateStr);
        console.log('========================');
        break;
      }
      case 'monthly': {
        // 12 tháng của năm hiện tại
        start = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0); // 1/1
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); // 31/12
        break;
      }
      case 'quarterly': {
        // 4 quý của năm hiện tại
        start = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0); // 1/1
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); // 31/12
        break;
      }
      case 'yearly': {
        // 3 năm gần nhất
        start = new Date(today.getFullYear() - 2, 0, 1, 0, 0, 0, 0);
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      }
      default: {
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(today);
        start.setDate(today.getDate() + diffToMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      }
    }

    return { start, end };
  }, [weekCount]);

  const fetchRevenueData = useCallback(async (period, customWeekCount = null) => {
    // Cancel previous request nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo AbortController mới
    abortControllerRef.current = new AbortController();

    setRevenueLoading(true);
    try {
      const periodType = periodTypeMap[period];
      const { start, end } = getDateRange(period, customWeekCount);
      
      // Format dates theo local timezone để tránh timezone offset
      const startDateStr = formatDateLocal(start);
      const endDateStr = formatDateLocal(end);
      
      console.log('[Revenue API] Period:', period, 'Type:', periodType, 'CustomWeekCount:', customWeekCount);
      console.log('[Revenue API] Sending dates:', startDateStr, 'to', endDateStr);
      
      const response = await dashboardApi.ownerStatistics.getRevenueSummary(
        periodType,
        startDateStr,
        endDateStr
      );
      
      const data = response.data.data || [];
      console.log('[Revenue API] Received data points:', data.length);
      console.log('[Revenue API] Data:', data.map(d => ({ date: d.startDate, revenue: d.totalRevenue })));
      
      setRevenueChart(data.map(item => ({
        date: item.startDate,
        period: item.period,
        revenue: item.totalRevenue,
        bookingCount: item.totalBookings
      })));
    } catch (err) {
      // Bỏ qua lỗi nếu request bị cancel
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('[Revenue API] Request cancelled');
        return;
      }
      console.error('Error fetching revenue data:', err);
    } finally {
      setRevenueLoading(false);
    }
  }, [getDateRange]);

  const fetchDashboardData = useCallback(async (skipRevenueData = false) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard statistics
      const statsResponse = await dashboardApi.ownerStatistics.getDashboardStats();
      const statsData = statsResponse.data.data;
      
      setStats({
        totalComplexes: statsData.totalComplexes,
        totalFields: statsData.totalFields,
        activeFields: statsData.activeFields,
        pendingBookings: statsData.pendingBookings,
        todayBookings: statsData.todayBookings,
        completedBookings: statsData.completedBookings,
        cancelledBookings: statsData.cancelledBookings,
        totalRevenue: statsData.totalRevenue,
        todayRevenue: statsData.todayRevenue,
        pendingRevenue: statsData.pendingRevenue,
        occupancyRate: statsData.occupancyRate,
        avgBookingValue: statsData.avgBookingValue,
      });

      // Fetch revenue data (chỉ lần đầu hoặc khi refresh)
      if (!skipRevenueData) {
        await fetchRevenueData(revenuePeriod);
      }

      // Fetch top fields
      const topFieldsResponse = await dashboardApi.ownerStatistics.getTopFields(5);
      const topFieldsData = topFieldsResponse.data.data || [];
      setTopFields(topFieldsData.map(item => ({
        id: item.fieldId,
        name: item.fieldName,
        count: item.bookingCount,
      })));

      // Fetch upcoming bookings
      const upcomingResponse = await dashboardApi.ownerStatistics.getUpcomingBookings(3);
      const upcomingData = upcomingResponse.data.data || [];
      setUpcomingBookings(upcomingData);

      // Fetch peak hours
      const peakHoursResponse = await dashboardApi.ownerStatistics.getPeakHours();
      const peakHoursData = peakHoursResponse.data.data || [];
      setBookingsByHour(peakHoursData.map(item => ({
        hour: item.hour,
        count: item.bookingCount,
      })));

      // Fetch recent bookings
      const bookingsResponse = await dashboardApi.bookings.getOwnerBookings();
      const bookings = bookingsResponse.data.data || [];
      const sortedRecent = [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(sortedRecent);

      // Fetch complexes
      const complexesResponse = await dashboardApi.complexes.getMyComplexes();
      const complexesData = complexesResponse.data.data || [];
      setComplexes(complexesData);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [fetchRevenueData, revenuePeriod]); // revenuePeriod chỉ dùng cho initial load

  const handlePeriodChange = useCallback(async (period) => {
    setRevenuePeriod(period);
    // Chỉ fetch revenue data, không fetch toàn bộ dashboard
    await fetchRevenueData(period);
  }, [fetchRevenueData]);

  const handleWeekCountChange = useCallback(async (newWeekCount) => {
    console.log('[WeekCount] Changing from', weekCount, 'to', newWeekCount);
    setWeekCount(newWeekCount);
    // Fetch lại data với weekCount mới (truyền trực tiếp để tránh stale closure)
    if (revenuePeriod === 'weekly') {
      console.log('[WeekCount] Fetching revenue data with new weekCount:', newWeekCount);
      await fetchRevenueData('weekly', newWeekCount);
    }
  }, [revenuePeriod, fetchRevenueData, weekCount]);

  // Chỉ fetch initial data một lần khi mount
  useEffect(() => {
    fetchDashboardData();
    
    // Cleanup: cancel request khi unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency để chỉ chạy lần đầu

  return {
    stats,
    recentBookings,
    upcomingBookings,
    topFields,
    revenueChart,
    bookingsByHour,
    complexes,
    loading,
    revenueLoading,
    error,
    refreshData: fetchDashboardData,
    onPeriodChange: handlePeriodChange,
    currentPeriod: revenuePeriod,
    weekCount,
    onWeekCountChange: handleWeekCountChange,
  };
}
