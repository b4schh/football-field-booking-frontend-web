import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import fieldService from "../../../services/fieldService";
import complexService from "../../../services/complexService";
import timeSlotService from "../../../services/timeSlotService";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";

/**
 * Admin Field Detail Page - View Only
 * Hiển thị chi tiết Field + danh sách TimeSlot (Read-only)
 */
export default function AdminFieldDetail() {
  const { complexId, fieldId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [field, setField] = useState(null);
  const [complex, setComplex] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadFieldData();
  }, [fieldId, complexId]);

  const loadFieldData = async () => {
    setLoading(true);
    try {
      const [fieldResponse, complexResponse, timeSlotsResponse] = await Promise.all([
        fieldService.getFieldById(fieldId),
        complexService.getComplexById(complexId),
        timeSlotService.getTimeSlotsByField(fieldId),
      ]);
      
      setField(fieldResponse.data);
      setComplex(complexResponse.data);
      setTimeSlots(timeSlotsResponse.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu sân");
      navigate("/admin/complexes");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFieldActive = async (isActive) => {
    try {
      await fieldService.toggleFieldActive(fieldId, isActive);
      toast.success(isActive ? "Đã kích hoạt sân" : "Đã tắt sân");
      setField((prev) => ({ ...prev, isActive }));
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleToggleTimeSlotActive = async (timeSlotId, isActive) => {
    try {
      await timeSlotService.toggleTimeSlotActive(timeSlotId, isActive);
      toast.success(isActive ? "Đã kích hoạt khung giờ" : "Đã tắt khung giờ");
      // Reload timeslots
      const timeSlotsResponse = await timeSlotService.getTimeSlotsByField(fieldId);
      setTimeSlots(timeSlotsResponse.data || []);
    } catch (error) {
      toast.error("Cập nhật trạng thái khung giờ thất bại");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Client-side pagination
  const paginatedTimeSlots = timeSlots.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(timeSlots.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // DataTable columns
  const timeSlotColumns = [
    {
      key: "id",
      label: "ID",
      render: (slot) => (
        <span className="font-semibold text-gray-900">{slot.id}</span>
      ),
    },
    {
      key: "startTime",
      label: "Giờ bắt đầu",
      render: (slot) => (
        <span className="font-semibold">{formatTimeSpan(slot.startTime)}</span>
      ),
    },
    {
      key: "endTime",
      label: "Giờ kết thúc",
      render: (slot) => (
        <span className="font-semibold">{formatTimeSpan(slot.endTime)}</span>
      ),
    },
    {
      key: "duration",
      label: "Thời lượng",
      render: (slot) => {
        // Calculate duration in minutes
        const start = slot.startTime.split(':');
        const end = slot.endTime.split(':');
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        const duration = endMinutes - startMinutes;
        
        return (
          <span className="text-gray-600">
            {duration} phút
          </span>
        );
      },
    },
    {
      key: "price",
      label: "Giá tiền",
      render: (slot) => (
        <span className="font-semibold text-green-600">
          {slot.price?.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (slot) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            enabled={slot.isActive}
            onChange={(enabled) => handleToggleTimeSlotActive(slot.id, enabled)}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!field) {
    return <EmptyState title="Không tìm thấy sân" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={field.name}
        breadcrumbs={[
          { label: "Quản lý cụm sân", path: "/admin/complexes" },
          {
            label: complex?.name || "Chi tiết cụm sân",
            path: `/admin/complexes/${complexId}`,
          },
          { label: field.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/admin/complexes/${complexId}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdArrowBack />
              Quay lại
            </button>
          </div>
        }
      />

      {/* Field Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Thông tin sân
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 font-medium">Mã sân</label>
              <p className="text-lg text-gray-900">#{field.id}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Tên sân</label>
              <p className="text-lg font-semibold text-gray-900">{field.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Thuộc cụm sân</label>
              <p className="text-gray-900">{complex?.name || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Loại sân</label>
              <p className="text-gray-900">
                {field.fieldSize || field.fieldType || "Chưa rõ"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Mặt sân</label>
              <p className="text-gray-900">{field.surfaceType || "Chưa có"}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 font-medium">Complex ID</label>
              <p className="text-lg text-gray-900">#{field.complexId}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Trạng thái hoạt động</label>
              <div className="mt-2">
                <ToggleSwitch
                  enabled={field.isActive}
                  onChange={handleToggleFieldActive}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 font-medium">Số khung giờ</label>
              <p className="text-2xl font-bold text-blue-600">{timeSlots.length}</p>
            </div>

            {field.mainImageUrl && (
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-2">
                  Hình ảnh sân
                </label>
                <img
                  src={field.mainImageUrl}
                  alt={field.name}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {field.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="text-sm text-gray-500 font-medium block mb-2">
              Mô tả
            </label>
            <p className="text-gray-700 whitespace-pre-line">{field.description}</p>
          </div>
        )}
      </div>

      {/* TimeSlots Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách khung giờ ({timeSlots.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Xem thông tin chi tiết các khung giờ của sân
            </p>
          </div>
        </div>

        {timeSlots.length === 0 ? (
          <EmptyState
            title="Chưa có khung giờ nào"
            description="Sân này chưa có khung giờ nào được tạo"
          />
        ) : (
          <>
            <DataTable
              columns={timeSlotColumns}
              data={paginatedTimeSlots}
              emptyMessage="Không có dữ liệu"
            />

            {timeSlots.length > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={timeSlots.length}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}

        {/* Price Summary */}
        {timeSlots.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Giá thấp nhất</div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.min(...timeSlots.map(t => t.price)).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Giá cao nhất</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.max(...timeSlots.map(t => t.price)).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Giá trung bình</div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(
                    timeSlots.reduce((sum, t) => sum + t.price, 0) / timeSlots.length
                  ).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Đang hoạt động</div>
                <div className="text-lg font-bold text-yellow-600">
                  {timeSlots.filter(t => t.isActive).length}/{timeSlots.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
