import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete, MdStore, MdVisibility } from "react-icons/md";
import { FaMagic } from "react-icons/fa";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import ComplexStatusBadge from "../../../components/owner/ComplexStatusBadge";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import ComplexFormModal from "../../../components/owner/ComplexFormModal";
import Modal from "../../../components/dashboard/Modal";
import useOwnerComplexes from "../../../hooks/useOwnerComplexes";
import complexService from "../../../services/complexService";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";

/**
 * STEP 1: Complex Management Page
 * Hiển thị danh sách Complex của Owner
 */
export default function ComplexManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const { complexes, loading, pagination, fetchComplexes } = useOwnerComplexes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComplex, setSelectedComplex] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const handleCreateComplex = async (formData) => {
    setCreating(true);
    try {
      const response = await complexService.createComplex(formData);
      toast.success("Tạo cụm sân thành công! Chờ Admin phê duyệt.");
      setShowCreateModal(false);
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo cụm sân thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleEditComplex = async (formData) => {
    if (!selectedComplex) return;
    
    setUpdating(true);
    try {
      await complexService.updateComplex(selectedComplex.id, formData);
      toast.success("Cập nhật cụm sân thành công");
      setShowEditModal(false);
      setSelectedComplex(null);
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComplex = async () => {
    if (!selectedComplex) return;
    
    setDeleting(true);
    try {
      await complexService.deleteComplex(selectedComplex.id);
      toast.success("Xóa cụm sân thành công");
      setShowDeleteModal(false);
      setSelectedComplex(null);
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa cụm sân thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (complexId, isActive) => {
    try {
      await complexService.toggleComplexActive(complexId, isActive);
      toast.success(isActive ? "Đã kích hoạt cụm sân" : "Đã tắt cụm sân");
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const openEditModal = (complex) => {
    setSelectedComplex(complex);
    setShowEditModal(true);
  };

  const openDeleteModal = (complex) => {
    setSelectedComplex(complex);
    setShowDeleteModal(true);
  };

  const handleRowClick = (complex) => {
    navigate(`/owner/complexes/${complex.id}`);
  };

  // Load complexes on mount và khi page hoặc pageSize thay đổi
  useEffect(() => {
    fetchComplexes({ pageIndex: currentPage, pageSize });
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi pageSize
  };

  // Filter complexes based on search and filters
  const filteredComplexes = complexes.filter((complex) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      complex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter (status là số: 0 = Pending, 1 = Approved, 2 = Rejected)
    const matchesStatus = statusFilter === "all" || complex.status === parseInt(statusFilter);

    // Active filter
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && complex.isActive) ||
      (activeFilter === "inactive" && !complex.isActive);

    return matchesSearch && matchesStatus && matchesActive;
  });

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "name",
      label: "Tên cụm sân",
      render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (row) => {
        const parts = [row.street, row.ward, row.province].filter(Boolean);
        return <span className="text-gray-600">{parts.join(", ") || "Chưa có địa chỉ"}</span>;
      },
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (row) => <span className="text-gray-600">{row.phone || "-"}</span>,
    },
    {
      key: "hours",
      label: "Giờ hoạt động",
      render: (row) => (
        <span className="text-gray-600">
          {row.openingTime && row.closingTime
            ? `${formatTimeSpan(row.openingTime)} - ${formatTimeSpan(row.closingTime)}`
            : "Chưa đặt"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => <ComplexStatusBadge status={row.status} />,
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
          title="Quản lý cụm sân"
          breadcrumbs={[
            { label: "Trang chủ", path: "/owner" },
            { label: "Quản lý cụm sân" }
          ]}
        />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý cụm sân"
        breadcrumbs={[
          { label: "Trang chủ", path: "/owner" },
          { label: "Quản lý cụm sân" }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/owner/complexes/setup-wizard')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <FaMagic className="text-lg" />
              Tạo nhanh (Wizard)
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              <MdAdd className="text-xl" />
              Tạo thông thường
            </button>
          </div>
        }
      />

      {/* Search and Filters */}
      {complexes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên, địa chỉ hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái phê duyệt
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="0">Chờ phê duyệt</option>
                <option value="1">Đã phê duyệt</option>
                <option value="2">Bị từ chối</option>
              </select>
            </div>

            {/* Active Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái hoạt động
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all" || activeFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-semibold">{filteredComplexes.length}</span> kết quả
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setActiveFilter("all");
                }}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {complexes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdStore}
            title="Chưa có cụm sân nào"
            message="Bắt đầu bằng cách tạo cụm sân đầu tiên của bạn"
            action={
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => navigate('/owner/complexes/setup-wizard')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <FaMagic className="text-xl" />
                  Tạo nhanh với Wizard
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <MdAdd className="text-xl" />
                  Tạo thông thường
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {filteredComplexes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Không tìm thấy cụm sân nào phù hợp với bộ lọc</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setActiveFilter("all");
                }}
                className="mt-4 text-slate-600 hover:text-slate-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredComplexes}
              onRowClick={handleRowClick}
            />
          )}
          {filteredComplexes.length > 0 && (
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
          )}
        </>
      )}

      {/* Create Complex Modal */}
      <ComplexFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateComplex}
        loading={creating}
      />

      {/* Edit Complex Modal */}
      <ComplexFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedComplex(null);
        }}
        onSubmit={handleEditComplex}
        initialData={selectedComplex}
        loading={updating}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedComplex(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa cụm sân <strong>{selectedComplex?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedComplex(null);
              }}
              disabled={deleting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteComplex}
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
