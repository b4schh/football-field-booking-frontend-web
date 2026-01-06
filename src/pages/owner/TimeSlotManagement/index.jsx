import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete, MdAccessTime, MdVisibility } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import TimeSlotFormModal from "../../../components/owner/TimeSlotFormModal";
import Modal from "../../../components/dashboard/Modal";
import useTimeSlots from "../../../hooks/useTimeSlots";
import useOwnerComplexes from "../../../hooks/useOwnerComplexes";
import useFields from "../../../hooks/useFields";
import timeSlotService from "../../../services/timeSlotService";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";

/**
 * TimeSlot Management Page
 * Hiển thị tất cả khung giờ của Owner (từ tất cả các Field)
 */
export default function TimeSlotManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const { timeSlots, loading, pagination, fetchOwnerTimeSlots } = useTimeSlots();
  const { complexes, fetchComplexes } = useOwnerComplexes();
  const { fields, fetchAllFields } = useFields();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Temporary filter states (while user is typing/selecting)
  const [filters, setFilters] = useState({
    complexId: "",
    fieldId: "",
    timeSlot: "",
    isActive: ""
  });

  // Applied filter states (actually used in API call)
  const [appliedFilters, setAppliedFilters] = useState({
    complexId: "",
    fieldId: "",
    timeSlot: "",
    isActive: ""
  });

  useEffect(() => {
    fetchOwnerTimeSlots({ 
      pageIndex: currentPage, 
      pageSize,
      filters: {
        complexId: appliedFilters.complexId,
        fieldId: appliedFilters.fieldId,
        isActive: appliedFilters.isActive
      }
    });
  }, [currentPage, pageSize, appliedFilters, fetchOwnerTimeSlots]);

  // Fetch all complexes and fields for filter dropdowns (only once on mount)
  useEffect(() => {
    fetchComplexes({ pageIndex: 1, pageSize: 1000 }); // Fetch all complexes
    fetchAllFields({ pageIndex: 1, pageSize: 1000 }); // Fetch all fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEditTimeSlot = async (formData) => {
    if (!selectedTimeSlot) return;
    
    setUpdating(true);
    try {
      await timeSlotService.updateTimeSlot(selectedTimeSlot.id, formData);
      toast.success("Cập nhật khung giờ thành công");
      setShowEditModal(false);
      setSelectedTimeSlot(null);
      fetchOwnerTimeSlots({ pageIndex: currentPage, pageSize });
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTimeSlot = async () => {
    if (!selectedTimeSlot) return;
    
    setDeleting(true);
    try {
      await timeSlotService.deleteTimeSlot(selectedTimeSlot.id);
      toast.success("Xóa khung giờ thành công");
      setShowDeleteModal(false);
      setSelectedTimeSlot(null);
      fetchOwnerTimeSlots({ pageIndex: currentPage, pageSize });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa khung giờ thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (timeSlotId, isActive) => {
    try {
      await timeSlotService.toggleTimeSlotActive(timeSlotId, isActive);
      toast.success(isActive ? "Đã kích hoạt khung giờ" : "Đã tắt khung giờ");
      fetchOwnerTimeSlots({ 
        pageIndex: currentPage, 
        pageSize,
        filters: {
          complexId: appliedFilters.complexId,
          fieldId: appliedFilters.fieldId,
          isActive: appliedFilters.isActive
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  // Apply filters
  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const openEditModal = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowEditModal(true);
  };

  const openDeleteModal = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowDeleteModal(true);
  };

  const handleRowClick = (timeSlot) => {
    // Navigate to field detail page
    navigate(`/owner/complexes/${timeSlot.complexId}/fields/${timeSlot.fieldId}`);
  };

  // Get unique values for filters from full datasets
  const uniqueComplexes = complexes || [];
  
  // Filter fields based on selected complex
  const filteredFieldsByComplex = filters.complexId 
    ? (fields || []).filter(field => field.complexId === parseInt(filters.complexId))
    : [];
  
  // Note: Time slot filter removed as it's not efficient to filter by specific time ranges server-side

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      complexId: "",
      fieldId: "",
      timeSlot: "",
      isActive: ""
    });
    setAppliedFilters({
      complexId: "",
      fieldId: "",
      timeSlot: "",
      isActive: ""
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const hasActiveFilters = appliedFilters.complexId || appliedFilters.fieldId || appliedFilters.isActive !== "";

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "fieldName",
      label: "Sân",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.fieldName || "Chưa rõ"}</div>
          <div className="text-sm text-gray-500">{row.complexName || ""}</div>
        </div>
      ),
    },
    {
      key: "time",
      label: "Khung giờ",
      render: (row) => (
        <span className="font-medium text-gray-700">
          {formatTimeSpan(row.startTime)} - {formatTimeSpan(row.endTime)}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Thời lượng",
      render: (row) => {
        // Calculate duration in minutes
        const start = row.startTime?.split(':');
        const end = row.endTime?.split(':');
        if (start && end) {
          const startMins = parseInt(start[0]) * 60 + parseInt(start[1]);
          const endMins = parseInt(end[0]) * 60 + parseInt(end[1]);
          const duration = endMins - startMins;
          return <span className="text-gray-600">{duration} phút</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: "price",
      label: "Giá tiền",
      render: (row) => (
        <span className="font-semibold text-green-600">
          {row.price?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Hoạt động",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            enabled={row.isActive}
            onChange={(enabled) => handleToggleActive(row.id, enabled)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Xem chi tiết sân"
          >
            <MdVisibility className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
            title="Chỉnh sửa"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(row);
            }}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
            title="Xóa"
          >
            <MdDelete className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader 
          title="Quản lý khung giờ"
          breadcrumbs={[
            { label: "Quản lý khung giờ" }
          ]}
        />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý khung giờ"
        breadcrumbs={[
          { label: "Quản lý khung giờ" }
        ]}
        actions={
          <button
            onClick={() => navigate('/owner/fields')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Thêm khung giờ mới
          </button>
        }
      />

      {timeSlots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdAccessTime}
            title="Chưa có khung giờ nào"
            message="Thêm khung giờ cho các sân để khách hàng có thể đặt chỗ"
            action={
              <button
                onClick={() => navigate('/owner/fields')}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Đi đến quản lý sân
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Complex Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cụm sân
                </label>
                <select
                  value={filters.complexId}
                  onChange={(e) => {
                    const newComplexId = e.target.value;
                    setFilters(prev => ({ 
                      ...prev, 
                      complexId: newComplexId,
                      fieldId: "" // Reset field when complex changes
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả cụm sân</option>
                  {uniqueComplexes.map(complex => (
                    <option key={complex.id} value={complex.id}>
                      {complex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sân
                </label>
                <select
                  value={filters.fieldId}
                  onChange={(e) => setFilters(prev => ({ ...prev, fieldId: e.target.value }))}
                  disabled={!filters.complexId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {filters.complexId ? "Tất cả sân" : "Vui lòng chọn cụm sân trước"}
                  </option>
                  {filteredFieldsByComplex.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ngưng</option>
                </select>
              </div>
            </div>

            {/* Search and Reset Buttons */}
            <div className="mt-4 flex justify-between items-center">
              {hasActiveFilters && (
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{pagination.totalRecords}</span> khung giờ
                </p>
              )}
              <div className="flex gap-3 ml-auto">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors font-medium border border-gray-300"
                  >
                    Xóa bộ lọc
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <DataTable 
              columns={columns} 
              data={timeSlots}
              onRowClick={handleRowClick}
            />
            
            <Pagination
              currentPage={pagination.pageIndex}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalRecords={pagination.totalRecords}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTimeSlot && (
        <TimeSlotFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTimeSlot(null);
          }}
          onSubmit={handleEditTimeSlot}
          initialData={selectedTimeSlot}
          isLoading={updating}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTimeSlot && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTimeSlot(null);
          }}
          title="Xác nhận xóa"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa khung giờ <strong>{formatTimeSpan(selectedTimeSlot.startTime)} - {formatTimeSpan(selectedTimeSlot.endTime)}</strong> không?
            </p>
            <p className="text-sm text-red-600">
              Lưu ý: Các booking đã đặt trong khung giờ này sẽ bị ảnh hưởng.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTimeSlot(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTimeSlot}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
