import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSportsSoccer,
  MdVisibility,
} from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import FieldFormModal from "../../../components/owner/FieldFormModal";
import Modal from "../../../components/dashboard/Modal";
import useFields from "../../../hooks/useFields";
import fieldService from "../../../services/fieldService";
import { useToast } from "../../../store/toastStore";

/**
 * Field Management Page
 * Hiển thị tất cả sân của Owner (từ tất cả các Complex)
 */
export default function FieldManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const { fields, loading, pagination, fetchAllFields } = useFields();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states - split into temporary and applied
  const [filters, setFilters] = useState({
    complexId: "",
    fieldSize: "",
    surfaceType: "",
    isActive: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    complexId: "",
    fieldSize: "",
    surfaceType: "",
    isActive: "",
  });

  // Fetch data when page, pageSize, or appliedFilters change
  useEffect(() => {
    fetchAllFields({ pageIndex: currentPage, pageSize, filters: appliedFilters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, appliedFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle manual filter application
  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEditField = async (formData) => {
    if (!selectedField) return;

    setUpdating(true);
    try {
      await fieldService.updateField(selectedField.id, formData);
      toast.success("Cập nhật sân thành công");
      setShowEditModal(false);
      setSelectedField(null);
      fetchAllFields({ pageIndex: currentPage, pageSize, filters: appliedFilters });
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteField = async () => {
    if (!selectedField) return;

    setDeleting(true);
    try {
      await fieldService.deleteField(selectedField.id);
      toast.success("Xóa sân thành công");
      setShowDeleteModal(false);
      setSelectedField(null);
      fetchAllFields({ pageIndex: currentPage, pageSize, filters: appliedFilters });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa sân thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (fieldId, isActive) => {
    try {
      await fieldService.toggleFieldActive(fieldId, isActive);
      toast.success(isActive ? "Đã kích hoạt sân" : "Đã tắt sân");
      fetchAllFields({ pageIndex: currentPage, pageSize, filters: appliedFilters });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    }
  };

  const openEditModal = (field) => {
    setSelectedField(field);
    setShowEditModal(true);
  };

  const openDeleteModal = (field) => {
    setSelectedField(field);
    setShowDeleteModal(true);
  };

  const handleRowClick = (field) => {
    navigate(`/owner/complexes/${field.complexId}/fields/${field.id}`, {
      state: {
        from: "/owner/fields",
        fromLabel: "Quản lý sân",
        complexName: field.complexName,
      },
    });
  };

  // Get unique values for filters from current fields
  const uniqueComplexes = [
    ...new Map(
      fields.map((f) => [f.complexId, { id: f.complexId, name: f.complexName }])
    ).values(),
  ];
  const uniqueFieldSizes = [
    ...new Set(fields.map((f) => f.fieldSize || f.fieldType).filter(Boolean)),
  ];
  const uniqueSurfaceTypes = [
    ...new Set(fields.map((f) => f.surfaceType).filter(Boolean)),
  ];

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      complexId: "",
      fieldSize: "",
      surfaceType: "",
      isActive: "",
    });
    setAppliedFilters({
      complexId: "",
      fieldSize: "",
      surfaceType: "",
      isActive: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    appliedFilters.complexId ||
    appliedFilters.fieldSize ||
    appliedFilters.surfaceType ||
    appliedFilters.isActive !== "";

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.id}</span>
      ),
    },
    {
      key: "name",
      label: "Tên sân",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.name}</span>
      ),
    },
    {
      key: "complexName",
      label: "Cụm sân",
      render: (row) => (
        <span className="text-gray-600">{row.complexName || "Chưa rõ"}</span>
      ),
    },
    {
      key: "fieldSize",
      label: "Loại sân",
      render: (row) => (
        <span className="text-gray-600">
          {row.fieldSize || row.fieldType || "Chưa rõ"}
        </span>
      ),
    },
    {
      key: "surfaceType",
      label: "Mặt sân",
      render: (row) => (
        <span className="text-gray-600">{row.surfaceType || "Chưa có"}</span>
      ),
    },
    {
      key: "timeSlotCount",
      label: "Khung giờ",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {row.timeSlotCount || 0} khung
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
            title="Xem chi tiết"
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
        <PageHeader title="Quản lý sân" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý sân"
        actions={
          <button
            onClick={() => navigate("/owner/complexes")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Thêm sân mới
          </button>
        }
      />

      {fields.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdSportsSoccer}
            title="Chưa có sân nào"
            message="Tạo cụm sân và thêm sân để bắt đầu quản lý"
            action={
              <button
                onClick={() => navigate("/owner/complexes")}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Đi đến quản lý cụm sân
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Complex Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cụm sân
                </label>
                <select
                  value={filters.complexId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      complexId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả cụm sân</option>
                  {uniqueComplexes.map((complex) => (
                    <option key={complex.id} value={complex.id}>
                      {complex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại sân
                </label>
                <select
                  value={filters.fieldSize}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      fieldSize: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả loại sân</option>
                  {uniqueFieldSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Surface Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mặt sân
                </label>
                <select
                  value={filters.surfaceType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      surfaceType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Tất cả mặt sân</option>
                  {uniqueSurfaceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive: e.target.value,
                    }))
                  }
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
                  Hiển thị <span className="font-semibold">{pagination.totalRecords}</span> kết quả
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

          <DataTable
            columns={columns}
            data={fields}
            onRowClick={handleRowClick}
          />
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              totalRecords={pagination.totalRecords}
            />
          </div>
        </>
      )}

      {/* Edit Field Modal */}
      <FieldFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedField(null);
        }}
        onSubmit={handleEditField}
        complexId={selectedField?.complexId}
        initialData={selectedField}
        loading={updating}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedField(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa sân <strong>{selectedField?.name}</strong>
            ?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này sẽ xóa tất cả khung giờ của sân. Không thể hoàn tác.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedField(null);
              }}
              disabled={deleting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteField}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
