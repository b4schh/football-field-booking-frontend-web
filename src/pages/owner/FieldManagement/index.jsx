import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete, MdSportsSoccer, MdVisibility } from "react-icons/md";
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

  useEffect(() => {
    fetchAllFields({ pageIndex: currentPage, pageSize });
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEditField = async (formData) => {
    if (!selectedField) return;
    
    setUpdating(true);
    try {
      await fieldService.updateField(selectedField.id, formData);
      toast.success("Cập nhật sân thành công");
      setShowEditModal(false);
      setSelectedField(null);
      fetchAllFields();
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
      fetchAllFields();
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
      fetchAllFields();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
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
        from: '/owner/fields',
        fromLabel: 'Quản lý sân',
        complexName: field.complexName 
      }
    });
  };

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "name",
      label: "Tên sân",
      render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    {
      key: "complexName",
      label: "Cụm sân",
      render: (row) => <span className="text-gray-600">{row.complexName || "Chưa rõ"}</span>,
    },
    {
      key: "fieldSize",
      label: "Loại sân",
      render: (row) => <span className="text-gray-600">{row.fieldSize || row.fieldType || "Chưa rõ"}</span>,
    },
    {
      key: "surfaceType",
      label: "Mặt sân",
      render: (row) => <span className="text-gray-600">{row.surfaceType || "Chưa có"}</span>,
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
        <PageHeader 
          title="Quản lý sân"
          breadcrumbs={[
            { label: "Trang chủ", path: "/owner" },
            { label: "Quản lý sân" }
          ]}
        />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý sân"
        breadcrumbs={[
          { label: "Trang chủ", path: "/owner" },
          { label: "Quản lý sân" }
        ]}
        actions={
          <button
            onClick={() => navigate('/owner/complexes')}
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
                onClick={() => navigate('/owner/complexes')}
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
          <DataTable
            columns={columns}
            data={fields}
            onRowClick={handleRowClick}
            searchable
            searchPlaceholder="Tìm kiếm sân..."
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
            Bạn có chắc chắn muốn xóa sân <strong>{selectedField?.name}</strong>?
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
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
