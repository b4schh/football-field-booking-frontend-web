import { useState, useEffect } from "react";
import {
  MdPeople,
  MdStorefront,
  MdBookOnline,
  MdAttachMoney,
  MdTrendingUp,
  MdStar,
  MdRefresh,
} from "react-icons/md";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import adminStatisticsService from "../../../services/adminStatisticsService";
import { useToast } from "../../../store/toastStore";
import { formatCurrency, formatDate } from "../../../utils/formatHelpers";

/**
 * Admin Dashboard Page
 * Tổng quan hệ thống cho Admin
 */
export default function AdminDashboard() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topComplexes, setTopComplexes] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data in parallel
      const [statsRes, revenueRes, complexesRes, customersRes, distributionRes, bookingsRes] = await Promise.all([
        adminStatisticsService.getDashboardStats(),
        adminStatisticsService.getRevenueChart(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          new Date().toISOString().split("T")[0]
        ),
        adminStatisticsService.getTopComplexes(5),
        adminStatisticsService.getTopCustomers(5),
        adminStatisticsService.getBookingStatusDistribution(),
        adminStatisticsService.getRecentBookings(10),
      ]);

      setStats(statsRes.data);
      setRevenueChart(revenueRes.data);
      setTopComplexes(complexesRes.data);
      setTopCustomers(customersRes.data);
      setStatusDistribution(distributionRes.data);
      setRecentBookings(bookingsRes.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        actions={
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MdRefresh />
            Làm mới
          </button>
        }
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <StatsCard
          icon={<MdPeople className="text-indigo-600" />}
          title="Tổng người dùng"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalCustomers || 0} khách, ${stats?.totalOwners || 0} chủ sân`}
          bgColor="bg-indigo-50/50"
        />

        {/* Total Complexes */}
        <StatsCard
          icon={<MdStorefront className="text-teal-600" />}
          title="Cụm sân"
          value={stats?.totalComplexes || 0}
          subtitle={`${stats?.activeComplexes || 0} hoạt động, ${stats?.totalFields || 0} sân`}
          bgColor="bg-teal-50/50"
        />

        {/* Total Bookings */}
        <StatsCard
          icon={<MdBookOnline className="text-violet-600" />}
          title="Tổng bookings"
          value={stats?.totalBookings || 0}
          subtitle={`${stats?.todayBookings || 0} hôm nay, ${stats?.completedBookings || 0} hoàn thành`}
          bgColor="bg-violet-50/50"
        />

        {/* Total Revenue */}
        <StatsCard
          icon={<MdAttachMoney className="text-amber-600" />}
          title="Tổng doanh thu"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle={`Tháng này: ${formatCurrency(stats?.thisMonthRevenue || 0)}`}
          bgColor="bg-amber-50/50"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdTrendingUp className="text-indigo-600" />
            Doanh thu 30 ngày gần đây
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} />
              <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
              <Tooltip
                labelFormatter={(val) => formatDate(val)}
                formatter={(val) => [formatCurrency(val), "Doanh thu"]}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân bố trạng thái Booking
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Complexes & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Complexes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdStorefront className="text-teal-600" />
            Top 5 Cụm sân
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topComplexes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
              <YAxis dataKey="complexName" type="category" width={120} />
              <Tooltip formatter={(val) => [formatCurrency(val), "Doanh thu"]} />
              <Bar dataKey="revenue" fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdPeople className="text-indigo-600" />
            Top 5 Khách hàng
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.customerName}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-sm text-gray-500">{customer.bookingCount} booking</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdBookOnline className="text-violet-600" />
          Bookings gần đây
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cụm sân / Sân</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày đặt</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{booking.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.complexName}</p>
                      <p className="text-sm text-gray-500">{booking.fieldName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(booking.bookingDate)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            icon={<MdStar className="text-yellow-600" />}
            title="Đánh giá"
            value={stats.totalReviews}
            subtitle={`Đánh giá trung bình: ${stats.averageRating.toFixed(1)}/5`}
            bgColor="bg-yellow-50/50"
          />
          <StatsCard
            icon={<MdBookOnline className="text-orange-600" />}
            title="Pending"
            value={stats.pendingBookings}
            subtitle={`Chờ duyệt: ${stats.waitingForApprovalBookings}`}
            bgColor="bg-orange-50/50"
          />
          <StatsCard
            icon={<MdTrendingUp className="text-emerald-600" />}
            title="Tuần này"
            value={formatCurrency(stats.thisWeekRevenue)}
            subtitle={`Hôm nay: ${formatCurrency(stats.todayRevenue)}`}
            bgColor="bg-emerald-50/50"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Stats Card Component
 */
function StatsCard({ icon, title, value, subtitle, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
      </div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
