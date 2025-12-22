import { useState, useEffect } from "react";
import dashboardApi from "../services/dashboardApi";

export default function useOwnerDashboard() {
  const [stats, setStats] = useState({
    totalComplexes: 0,
    totalFields: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch owner's complexes
      const complexesResponse = await dashboardApi.complexes.getMyComplexes();
      const complexes = complexesResponse.data.data || [];

      // Fetch all owner's bookings
      const bookingsResponse = await dashboardApi.bookings.getOwnerBookings();
      const bookings = bookingsResponse.data.data || [];

      // Calculate stats
      const totalFields = complexes.reduce((sum, complex) => sum + (complex.fieldCount || 0), 0);
      const pendingBookings = bookings.filter(b => b.bookingStatus === 1).length; // WaitingForApproval
      const confirmedBookings = bookings.filter(b => b.bookingStatus === 2 || b.bookingStatus === 5); // Confirmed or Completed
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalComplexes: complexes.length,
        totalFields,
        pendingBookings,
        totalRevenue,
      });

      // Get recent bookings (last 5)
      const sorted = [...bookings].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentBookings(sorted.slice(0, 5));

    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentBookings,
    loading,
    error,
    refreshData: fetchDashboardData,
  };
}
