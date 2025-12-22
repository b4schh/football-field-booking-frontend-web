import { MdStore, MdSportsSoccer, MdBookOnline, MdAttachMoney } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import CardStat from "../../../components/dashboard/CardStat";
import DataTable from "../../../components/dashboard/DataTable";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import useOwnerDashboard from "../../../hooks/useOwnerDashboard";

export default function OwnerDashboard() {
  const { stats, recentBookings, loading, error } = useOwnerDashboard();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get booking status label
  const getBookingStatusLabel = (status) => {
    const statusMap = {
      0: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
      1: { label: "Chờ duyệt", color: "bg-blue-100 text-blue-800" },
      2: { label: "Đã xác nhận", color: "bg-green-100 text-green-800" },
      3: { label: "Đã từ chối", color: "bg-red-100 text-red-800" },
      4: { label: "Đã hủy", color: "bg-gray-100 text-gray-800" },
      5: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
      6: { label: "Hết hạn", color: "bg-gray-100 text-gray-800" },
      7: { label: "Không đến", color: "bg-red-100 text-red-800" },
    };
    return statusMap[status] || { label: "Không xác định", color: "bg-gray-100 text-gray-800" };
  };

  // Table columns for recent bookings
  const columns = [
    {
      key: "complexName",
      label: "Cụm sân",
      render: (row) => row.complexName || "-",
    },
    {
      key: "fieldName",
      label: "Sân",
      render: (row) => row.fieldName || "-",
    },
    {
      key: "customerName",
      label: "Khách hàng",
      render: (row) => row.customerName || "-",
    },
    {
      key: "bookingDate",
      label: "Ngày đặt",
      render: (row) => formatDate(row.bookingDate),
    },
    {
      key: "timeSlot",
      label: "Khung giờ",
      render: (row) => `${row.startTime?.substring(0, 5)} - ${row.endTime?.substring(0, 5)}`,
    },
    {
      key: "totalAmount",
      label: "Tổng tiền",
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => {
        const status = getBookingStatusLabel(row.bookingStatus);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        breadcrumbs={[
          { label: "Owner", path: "/owner" },
          { label: "Dashboard" }
        ]}
      />

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardStat
            icon={MdStore}
            title="Tổng cụm sân"
            value={stats.totalComplexes}
            color="blue"
          />
          <CardStat
            icon={MdSportsSoccer}
            title="Tổng sân"
            value={stats.totalFields}
            color="green"
          />
          <CardStat
            icon={MdBookOnline}
            title="Đặt sân chờ duyệt"
            value={stats.pendingBookings}
            color="yellow"
          />
          <CardStat
            icon={MdAttachMoney}
            title="Doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            color="purple"
          />
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Đặt sân gần đây</h2>
        
        {loading ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : recentBookings.length > 0 ? (
          <DataTable
            columns={columns}
            data={recentBookings}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            hasNextPage={false}
            hasPreviousPage={false}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md">
            <EmptyState
              icon={MdBookOnline}
              title="Chưa có đặt sân nào"
              message="Các đặt sân của khách hàng sẽ hiển thị tại đây"
            />
          </div>
        )}
      </div>
    </div>
  );
}
