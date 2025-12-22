import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdEdit, MdAdd, MdVisibility, MdDelete } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import ComplexStatusBadge from "../../../components/owner/ComplexStatusBadge";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import ComplexFormModal from "../../../components/owner/ComplexFormModal";
import FieldFormModal from "../../../components/owner/FieldFormModal";
import ComplexImageManager from "../../../components/owner/ComplexImageManager";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import complexService from "../../../services/complexService";
import useFields from "../../../hooks/useFields";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";

/**
 * STEP 3: Complex Detail Page
 * Hiển thị chi tiết Complex + danh sách Field
 */
export default function ComplexDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [complex, setComplex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { fields, loading: fieldsLoading, fetchFieldsByComplex, fetchFieldsByComplexWithTimeSlotCount, createField, updateField, deleteField, toggleFieldActive } = useFields();
  const [editingField, setEditingField] = useState(null);
  const [fieldSubmitting, setFieldSubmitting] = useState(false);

  useEffect(() => {
    loadComplexData();
  }, [id]);

  const loadComplexData = async () => {
    setLoading(true);
    try {
      const response = await complexService.getComplexById(id);
      setComplex(response.data);
      await fetchFieldsByComplexWithTimeSlotCount(id); // Sử dụng API mới
    } catch (error) {
      toast.error("Không thể tải dữ liệu cụm sân");
      navigate("/owner/complexes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplex = async (formData) => {
    setUpdating(true);
    try {
      await complexService.updateComplex(id, formData);
      toast.success("Cập nhật cụm sân thành công");
      setShowEditModal(false);
      loadComplexData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (isActive) => {
    try {
      await complexService.toggleComplexActive(id, isActive);
      toast.success(isActive ? "Đã kích hoạt cụm sân" : "Đã tắt cụm sân");
      setComplex((prev) => ({ ...prev, isActive }));
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleCreateField = async (formData) => {
    const result = await createField({ ...formData, complexId: id });
    if (result.success) {
      setShowFieldModal(false);
      // Navigate to field detail with nested URL
      if (result.data?.id) {
        navigate(`/owner/complexes/${id}/fields/${result.data.id}`);
      }
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sân này?")) return;
    await deleteField(fieldId, id);
  };

  const handleOpenEditField = (field) => {
    setEditingField(field);
    setShowFieldModal(true);
  };

  const handleUpdateField = async (formData) => {
    if (!editingField) return;
    setFieldSubmitting(true);
    try {
      await updateField(editingField.id, { ...formData, complexId: id });
      setShowFieldModal(false);
      setEditingField(null);
    } catch (error) {
      // toast handled in hook
    } finally {
      setFieldSubmitting(false);
    }
  };

  const handleToggleFieldActive = async (fieldId, isActive) => {
    await toggleFieldActive(fieldId, isActive, id);
  };

  const handleFieldClick = (field) => {
    navigate(`/owner/complexes/${id}/fields/${field.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Client-side pagination
  const paginatedFields = fields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(fields.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // DataTable columns
  const fieldColumns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "name",
      label: "Tên sân",
      render: (field) => <span className="font-semibold">{field.name}</span>,
    },
    {
      key: "fieldSize",
      label: "Loại sân",
      render: (field) => <span className="text-gray-600">{field.fieldSize || field.fieldType || "Chưa rõ"}</span>,
    },
    {
      key: "surfaceType",
      label: "Mặt sân",
      render: (field) => <span className="text-gray-600">{field.surfaceType || "Chưa có"}</span>,
    },
    {
      key: "timeSlotCount",
      label: "Khung giờ",
      render: (field) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {field.timeSlotCount || 0} khung
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (field) => (
        <ToggleSwitch
          enabled={field.isActive}
          onChange={(enabled) => handleToggleFieldActive(field.id, enabled)}
        />
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (field) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFieldClick(field);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Xem chi tiết"
          >
            <MdVisibility className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditField(field);
            }}
            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
            title="Chỉnh sửa"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteField(field.id);
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
    return <LoadingSkeleton />;
  }

  if (!complex) {
    return <EmptyState title="Không tìm thấy cụm sân" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={complex.name}
        breadcrumbs={[
          { label: "Trang chủ", path: "/owner" },
          { label: "Quản lý cụm sân", path: "/owner/complexes" },
          { label: complex.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/owner/complexes")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdArrowBack />
              Quay lại
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

      {/* Complex Info Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Main Image */}
        {complex.mainImageUrl && (
          <div className="w-full h-64 bg-gray-200">
            <img 
              src={complex.mainImageUrl} 
              alt={complex.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><span class="text-4xl text-slate-400">⚽</span></div>';
              }}
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Status & Active Toggle */}
          <div className="flex items-center gap-4">
            <ComplexStatusBadge status={complex.status} />
            <ToggleSwitch
              enabled={complex.isActive}
              onChange={handleToggleActive}
              label={complex.isActive ? "Đang hoạt động" : "Đã tắt"}
            />
          </div>

          {/* Rejection Notice */}
          {complex.status === 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <p className="font-semibold">Cụm sân bị từ chối</p>
              <p className="mt-1">Vui lòng chỉnh sửa thông tin và đợi Admin duyệt lại.</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
              <p className="font-medium text-gray-900">{complex.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Giờ hoạt động</p>
              <p className="font-medium text-gray-900">
                {complex.openingTime && complex.closingTime
                  ? `${formatTimeSpan(complex.openingTime)} - ${formatTimeSpan(complex.closingTime)}`
                  : "-"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{complex.street}, {complex.ward}, {complex.province}</p>
            </div>
          </div>

          {/* Description */}
          {complex.description && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Mô tả</p>
              <p className="text-gray-700 leading-relaxed">{complex.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
              <p className="text-gray-700">
                {new Date(complex.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cập nhật cuối</p>
              <p className="text-gray-700">
                {new Date(complex.updatedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complex Image Manager Section */}
      <ComplexImageManager complexId={id} />

      {/* Fields Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Danh sách sân con</h2>
          <button
            onClick={() => setShowFieldModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MdAdd />
            Thêm sân
          </button>
        </div>

        {fieldsLoading ? (
          <LoadingSkeleton />
        ) : fields.length === 0 ? (
          <EmptyState
            title="Chưa có sân nào"
            description="Thêm sân để bắt đầu quản lý khung giờ"
            actionLabel="Thêm sân"
            onAction={() => setShowFieldModal(true)}
          />
        ) : (
          <>
            <DataTable
              columns={fieldColumns}
              data={paginatedFields}
              onRowClick={handleFieldClick}
            />
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalRecords={fields.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ComplexFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateComplex}
        initialData={complex}
        loading={updating}
      />

      <FieldFormModal
        isOpen={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          setEditingField(null);
        }}
        onSubmit={editingField ? handleUpdateField : handleCreateField}
        complexId={id}
        initialData={editingField}
        loading={fieldSubmitting || fieldsLoading}
      />
    </div>
  );
}
