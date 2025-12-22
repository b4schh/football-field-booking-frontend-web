import { useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdStore } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import DataTable from "../../../components/dashboard/DataTable";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import Modal from "../../../components/dashboard/Modal";
import FormInput from "../../../components/dashboard/FormInput";
import FormTextarea from "../../../components/dashboard/FormTextarea";
import useAdminComplexes from "../../../hooks/useAdminComplexes";

export default function AdminComplexes() {
  const { 
    complexes, 
    pagination, 
    loading, 
    error,
    fetchComplexes,
    createComplex,
    updateComplex,
    deleteComplex 
  } = useAdminComplexes();

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'create', 'edit', 'delete'
    data: null,
  });

  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    street: "",
    ward: "",
    province: "",
    phone: "",
    openingTime: "",
    closingTime: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Open modal
  const openModal = (type, data = null) => {
    setModalState({ isOpen: true, type, data });
    
    if (type === 'edit' && data) {
      setFormData({
        ownerId: data.ownerId || "",
        name: data.name || "",
        street: data.street || "",
        ward: data.ward || "",
        province: data.province || "",
        phone: data.phone || "",
        openingTime: data.openingTime?.substring(0, 5) || "",
        closingTime: data.closingTime?.substring(0, 5) || "",
        description: data.description || "",
      });
    } else if (type === 'create') {
      setFormData({
        ownerId: "",
        name: "",
        street: "",
        ward: "",
        province: "",
        phone: "",
        openingTime: "",
        closingTime: "",
        description: "",
      });
    }
    
    setFormErrors({});
  };

  // Close modal
  const closeModal = () => {
    setModalState({ isOpen: false, type: null, data: null });
    setFormData({
      ownerId: "",
      name: "",
      street: "",
      ward: "",
      province: "",
      phone: "",
      openingTime: "",
      closingTime: "",
      description: "",
    });
    setFormErrors({});
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (modalState.type === 'create') {
      if (!formData.ownerId) errors.ownerId = "Owner ID là bắt buộc";
    }
    if (!formData.name) errors.name = "Tên cụm sân là bắt buộc";
    if (!formData.province) errors.province = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.phone) errors.phone = "Số điện thoại là bắt buộc";
    if (!formData.openingTime) errors.openingTime = "Giờ mở cửa là bắt buộc";
    if (!formData.closingTime) errors.closingTime = "Giờ đóng cửa là bắt buộc";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    
    const payload = {
      ...formData,
      openingTime: formData.openingTime + ":00",
      closingTime: formData.closingTime + ":00",
      ownerId: parseInt(formData.ownerId),
    };

    let result;
    if (modalState.type === 'create') {
      result = await createComplex(payload);
    } else if (modalState.type === 'edit') {
      result = await updateComplex(modalState.data.id, payload);
    }

    setSubmitting(false);

    if (result.success) {
      closeModal();
    } else {
      alert(result.error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setSubmitting(true);
    const result = await deleteComplex(modalState.data.id);
    setSubmitting(false);

    if (result.success) {
      closeModal();
    } else {
      alert(result.error);
    }
  };

  // Get status label
  const getStatusLabel = (complex) => {
    if (!complex.isActive) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Không hoạt động</span>;
    }
    if (complex.status === 0) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Hoạt động</span>;
  };

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => row.id,
    },
    {
      key: "name",
      label: "Tên cụm sân",
      render: (row) => row.name,
    },
    {
      key: "ownerName",
      label: "Chủ sân",
      render: (row) => row.ownerName || "-",
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (row) => {
        const parts = [row.street, row.ward, row.province].filter(Boolean);
        return parts.join(", ") || "-";
      },
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (row) => row.phone || "-",
    },
    {
      key: "fieldCount",
      label: "Số sân",
      render: (row) => row.fieldCount || 0,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => getStatusLabel(row),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('edit', row);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Chỉnh sửa"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('delete', row);
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
        title="Quản lý cụm sân" 
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Quản lý cụm sân" }
        ]}
        actions={
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Thêm cụm sân
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton type="table" rows={10} />
      ) : complexes.length > 0 ? (
        <DataTable
          columns={columns}
          data={complexes}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => fetchComplexes(page)}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          searchable
          onSearch={(term) => fetchComplexes(1, term)}
          searchPlaceholder="Tìm kiếm cụm sân..."
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdStore}
            title="Chưa có cụm sân nào"
            message="Nhấn nút 'Thêm cụm sân' để tạo cụm sân mới"
            action={
              <button
                onClick={() => openModal('create')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Thêm cụm sân
              </button>
            }
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen && (modalState.type === 'create' || modalState.type === 'edit')}
        onClose={closeModal}
        title={modalState.type === 'create' ? 'Thêm cụm sân mới' : 'Chỉnh sửa cụm sân'}
        size="lg"
      >
        <div className="space-y-4">
          {modalState.type === 'create' && (
            <FormInput
              label="Owner ID"
              name="ownerId"
              type="number"
              value={formData.ownerId}
              onChange={handleInputChange}
              error={formErrors.ownerId}
              required
              placeholder="Nhập ID của chủ sân"
            />
          )}

          <FormInput
            label="Tên cụm sân"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            required
            placeholder="Nhập tên cụm sân"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Đường/Số nhà"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Ví dụ: 123 Lê Lợi"
            />
            <FormInput
              label="Phường/Xã"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              placeholder="Ví dụ: Bến Thành"
            />
            <FormInput
              label="Tỉnh/Thành phố"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              error={formErrors.province}
              required
              placeholder="Ví dụ: Hồ Chí Minh"
            />
          </div>

          <FormInput
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            error={formErrors.phone}
            required
            placeholder="Nhập số điện thoại"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Giờ mở cửa"
              name="openingTime"
              type="time"
              value={formData.openingTime}
              onChange={handleInputChange}
              error={formErrors.openingTime}
              required
            />
            <FormInput
              label="Giờ đóng cửa"
              name="closingTime"
              type="time"
              value={formData.closingTime}
              onChange={handleInputChange}
              error={formErrors.closingTime}
              required
            />
          </div>

          <FormTextarea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả về cụm sân..."
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={closeModal}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : (modalState.type === 'create' ? 'Tạo mới' : 'Cập nhật')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa cụm sân <strong>{modalState.data?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={closeModal}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
