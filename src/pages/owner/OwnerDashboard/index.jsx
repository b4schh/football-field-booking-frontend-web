import { motion } from "framer-motion";
import { MdRefresh } from "react-icons/md";
import useOwnerDashboard from "../../../hooks/useOwnerDashboard";
import PageHeader from "../../../components/dashboard/PageHeader";
import StatCard from "../../../components/owner/dashboard/StatCard";
import RevenueChart from "../../../components/owner/dashboard/RevenueChart";
import RecentBookings from "../../../components/owner/dashboard/RecentBookings";
import UpcomingBookings from "../../../components/owner/dashboard/UpcomingBookings";
import TopPeakHours from "../../../components/owner/dashboard/TopPeakHours";
import ComplexesOverview from "../../../components/owner/dashboard/ComplexesOverview";
import BankInfoWarning from "../../../components/owner/BankInfoWarning";

export default function OwnerDashboard() {
  const {
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
    refreshData,
    onPeriodChange,
    currentPeriod,
    weekCount,
    onWeekCountChange,
  } = useOwnerDashboard();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title="Dashboard"
            actions={
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-700"
              >
                <MdRefresh className={loading ? "animate-spin" : ""} />
                <span className="text-sm font-medium">Làm mới</span>
              </button>
            }
          />
        </motion.div>

        {/* Bank Info Warning */}
        <BankInfoWarning />

        {/* Stats Grid - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Doanh thu"
            value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            subtitle={`Hôm nay: ${(stats.todayRevenue / 1000).toFixed(0)}K`}
          />

          <StatCard
            title="Booking"
            value={stats.todayBookings}
            subtitle={`Hoàn thành: ${stats.completedBookings}`}
          />

          <StatCard
            title="Chờ duyệt"
            value={stats.pendingBookings}
            subtitle={`${(stats.pendingRevenue / 1000).toFixed(0)}K chờ thu`}
          />

          <StatCard
            title="Tỷ lệ sử dụng"
            value={`${stats.occupancyRate.toFixed(0)}%`}
            subtitle={`${stats.activeFields}/${stats.totalFields} sân`}
          />
        </div>

        {/* Main Content - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 8/12 */}
          <div className="lg:col-span-8 space-y-6">
            <RevenueChart
              data={revenueChart}
              loading={revenueLoading}
              onPeriodChange={onPeriodChange}
              currentPeriod={currentPeriod}
              weekCount={weekCount}
              onWeekCountChange={onWeekCountChange}
            />
          </div>

          {/* Right Column - 4/12 */}
          <div className="lg:col-span-4 space-y-6">
            <UpcomingBookings bookings={upcomingBookings} loading={loading} />
            {/* <TopPeakHours peakHours={bookingsByHour} loading={loading} /> */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentBookings bookings={recentBookings} loading={loading} />
          <ComplexesOverview complexes={complexes} loading={loading} />
        </div>
      </div>
    </div>
  );
}
