import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MdArrowBack,
  MdEdit,
  MdAdd,
  MdDelete,
  MdVisibility,
} from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import FieldFormModal from "../../../components/owner/FieldFormModal";
import TimeSlotFormModal from "../../../components/owner/TimeSlotFormModal";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/dashboard/Modal";
import fieldService from "../../../services/fieldService";
import complexService from "../../../services/complexService";
import useTimeSlots from "../../../hooks/useTimeSlots";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";
import api from "../../../services/api";

/**
 * STEP 5: Field Detail Page
 * Hiển thị chi tiết Field + danh sách TimeSlot
 */
export default function FieldDetail() {
  const { complexId, fieldId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [field, setField] = useState(null);
  const [complex, setComplex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [cloneData, setCloneData] = useState({
    newFieldName: "",
    includeTimeSlots: true,
  });
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showEditTimeSlotModal, setShowEditTimeSlotModal] = useState(false);
  const [showDeleteTimeSlotModal, setShowDeleteTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [updatingTimeSlot, setUpdatingTimeSlot] = useState(false);
  const [deletingTimeSlot, setDeletingTimeSlot] = useState(false);

  const {
    timeSlots,
    loading: timeSlotsLoading,
    fetchTimeSlotsByField,
    createTimeSlot,
    deleteTimeSlot,
    updateTimeSlot,
    toggleTimeSlotActive,
  } = useTimeSlots();

  useEffect(() => {
    loadFieldData();
  }, [fieldId, complexId]);

  const loadFieldData = async () => {
    setLoading(true);
    try {
      const [fieldResponse, complexResponse] = await Promise.all([
        fieldService.getFieldById(fieldId),
        complexService.getComplexById(complexId),
      ]);
      setField(fieldResponse.data);
      setComplex(complexResponse.data);
      await fetchTimeSlotsByField(fieldId);
    } catch (error) {
      toast.error("Không thể tải dữ liệu sân");
      navigate("/owner/complexes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (formData) => {
    setUpdating(true);
    try {
      await fieldService.updateField(fieldId, formData);
      toast.success("Cập nhật sân thành công");
      setShowEditModal(false);
      loadFieldData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (isActive) => {
    try {
      await fieldService.toggleFieldActive(fieldId, isActive);
      toast.success(isActive ? "Đã kích hoạt sân" : "Đã tắt sân");
      setField((prev) => ({ ...prev, isActive }));
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleCreateTimeSlot = async (formData) => {
    const result = await createTimeSlot({ ...formData, fieldId: fieldId });
    if (result.success) {
      setShowTimeSlotModal(false);
    }
  };

  const handleDeleteTimeSlotConfirm = async () => {
    if (!selectedTimeSlot) return;

    setDeletingTimeSlot(true);
    try {
      const result = await deleteTimeSlot(selectedTimeSlot.id, fieldId);
      if (result.success) {
        setShowDeleteTimeSlotModal(false);
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa khung giờ thất bại");
    } finally {
      setDeletingTimeSlot(false);
    }
  };

  const handleToggleTimeSlotActive = async (timeSlotId, isActive) => {
    await toggleTimeSlotActive(timeSlotId, isActive, fieldId);
  };

  const openEditTimeSlotModal = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowEditTimeSlotModal(true);
  };

  const openDeleteTimeSlotModal = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowDeleteTimeSlotModal(true);
  };

  const handleEditTimeSlot = async (formData) => {
    if (!selectedTimeSlot) return;

    setUpdatingTimeSlot(true);
    try {
      const result = await updateTimeSlot(selectedTimeSlot.id, { ...formData, fieldId });
      if (result.success) {
        setShowEditTimeSlotModal(false);
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingTimeSlot(false);
    }
  };

  const handleCloneField = async () => {
    if (!cloneData.newFieldName.trim()) {
      toast.error("Vui lòng nhập tên sân mới");
      return;
    }

    setCloning(true);
    try {
      const response = await api.post(`/fields/${fieldId}/clone`, cloneData);
      if (response.data?.isSuccess) {
        toast.success("Sao chép sân thành công!");
        setShowCloneModal(false);
        setCloneData({ newFieldName: "", includeTimeSlots: true });
        // Navigate to complex detail to see the new field
        navigate(`/owner/complexes/${complexId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Sao chép sân thất bại");
    } finally {
      setCloning(false);
    }
  };

  const handleBackToComplex = () => {
    // Nếu user đến từ trang Quản lý sân, quay về đó
    if (location.state?.from === "/owner/fields") {
      navigate("/owner/fields");
    } else if (complexId) {
      // Ngược lại, quay về trang chi tiết Complex
      navigate(`/owner/complexes/${complexId}`);
    } else {
      navigate("/owner/complexes");
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
        <ToggleSwitch
          enabled={slot.isActive}
          onChange={(enabled) => handleToggleTimeSlotActive(slot.id, enabled)}
        />
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
              openEditTimeSlotModal(row);
            }}
            className="p-2 hover:bg-green-50 rounded-lg text-green-600"
            title="Chỉnh sửa"
          >
            <MdEdit className="text-lg" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteTimeSlotModal(row);
            }}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
            title="Xóa"
          >
            <MdDelete className="text-lg" />
          </button>
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
        breadcrumbs={
          location.state?.from === "/owner/fields"
            ? [
                { label: "Quản lý sân", path: "/owner/fields" },
                { label: field.name },
              ]
            : [
                { label: "Quản lý cụm sân", path: "/owner/complexes" },
                {
                  label: complex?.name || "Chi tiết cụm sân",
                  path: `/owner/complexes/${complexId}`,
                },
                { label: field.name },
              ]
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToComplex}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdArrowBack />
              Quay lại
            </button>
            <button
              onClick={() => setShowCloneModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaCopy />
              Sao chép sân
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <MdEdit />
              Chỉnh sửa
            </button>
          </div>
        }
      />

      {/* Field Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <ToggleSwitch
              enabled={field.isActive}
              onChange={handleToggleActive}
              label={field.isActive ? "Đang hoạt động" : "Đã tắt"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-600">Loại sân</p>
                <p className="font-semibold">
                  {field.fieldSize || field.fieldType || "Chưa rõ"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loại mặt sân</p>
                <p className="font-semibold">
                  {field.surfaceType || "Chưa có"}
                </p>
              </div>
            </div>

            {field.description && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Mô tả</p>
                <p className="text-gray-800 mt-1">{field.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TimeSlots Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Danh sách khung giờ
          </h2>
          <button
            onClick={() => setShowTimeSlotModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MdAdd />
            Thêm khung giờ
          </button>
        </div>

        {timeSlotsLoading ? (
          <LoadingSkeleton />
        ) : timeSlots.length === 0 ? (
          <EmptyState
            title="Chưa có khung giờ nào"
            description="Thêm khung giờ để khách hàng có thể đặt sân"
            actionLabel="Thêm khung giờ"
            onAction={() => setShowTimeSlotModal(true)}
          />
        ) : (
          <>
            <DataTable columns={timeSlotColumns} data={paginatedTimeSlots} />
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalRecords={timeSlots.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <FieldFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateField}
        complexId={field.complexId}
        initialData={field}
        loading={updating}
      />

      <TimeSlotFormModal
        isOpen={showTimeSlotModal}
        onClose={() => setShowTimeSlotModal(false)}
        onSubmit={handleCreateTimeSlot}
        fieldId={fieldId}
        existingSlots={timeSlots}
        loading={timeSlotsLoading}
      />

      {/* Clone Field Modal */}
      <Modal
        isOpen={showCloneModal}
        onClose={() => {
          setShowCloneModal(false);
          setCloneData({ newFieldName: "", includeTimeSlots: true });
        }}
        title="Sao chép sân"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tạo một bản sao của <strong>{field.name}</strong> với cùng cấu hình.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sân mới <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={cloneData.newFieldName}
              onChange={(e) =>
                setCloneData({ ...cloneData, newFieldName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder={`Ví dụ: ${field.name} - Bản sao`}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeTimeSlots"
              checked={cloneData.includeTimeSlots}
              onChange={(e) =>
                setCloneData({
                  ...cloneData,
                  includeTimeSlots: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="includeTimeSlots" className="text-sm text-gray-700">
              Sao chép cả khung giờ ({timeSlots.length} khung)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Sân mới sẽ thuộc cùng cụm sân{" "}
              <strong>{complex?.name}</strong> và có cùng loại sân, mô tả.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowCloneModal(false);
                setCloneData({ newFieldName: "", includeTimeSlots: true });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={cloning}
            >
              Hủy
            </button>
            <button
              onClick={handleCloneField}
              disabled={cloning || !cloneData.newFieldName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {cloning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang sao chép...
                </>
              ) : (
                <>
                  <FaCopy />
                  Sao chép
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {showEditTimeSlotModal && selectedTimeSlot && (
        <TimeSlotFormModal
          isOpen={showEditTimeSlotModal}
          onClose={() => {
            setShowEditTimeSlotModal(false);
            setSelectedTimeSlot(null);
          }}
          onSubmit={handleEditTimeSlot}
          initialData={selectedTimeSlot}
          isLoading={updatingTimeSlot}
          mode="edit"
        />
      )}

      {showDeleteTimeSlotModal && selectedTimeSlot && (
        <Modal
          isOpen={showDeleteTimeSlotModal}
          onClose={() => {
            setShowDeleteTimeSlotModal(false);
            setSelectedTimeSlot(null);
          }}
          title="Xác nhận xóa"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa khung giờ{" "}
              <strong>
                {formatTimeSpan(selectedTimeSlot.startTime)} -{" "}
                {formatTimeSpan(selectedTimeSlot.endTime)}
              </strong>{" "}
              không?
            </p>
            <p className="text-sm text-red-600">
              Lưu ý: Các booking đã đặt trong khung giờ này sẽ bị ảnh hưởng.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteTimeSlotModal(false);
                  setSelectedTimeSlot(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={deletingTimeSlot}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTimeSlotConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deletingTimeSlot}
              >
                {deletingTimeSlot ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
