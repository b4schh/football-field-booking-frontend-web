import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdKey } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import usePermissionStore from "../../../store/permissionStore";
import { useToast } from "../../../store/toastStore";
import CreatePermissionModal from "../../../components/admin/CreatePermissionModal";
import EditPermissionModal from "../../../components/admin/EditPermissionModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

/**
 * Permission Management Page for Admin
 * Quản lý quyền hạn - Phong cách bảng
 */
export default function PermissionManagement() {
  const toast = useToast();
  const {
    permissions,
    groupedPermissions,
    permissionsLoading,
    pageIndex,
    pageSize,
    totalRecords,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchPermissions,
    fetchPermissionsGroupedByModule,
    createPermission,
    updatePermission,
    deletePermission,
  } = usePermissionStore();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Loading states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [currentPageSize, setCurrentPageSize] = useState(10);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchPermissions(pageIndex, currentPageSize, searchTerm || null, moduleFilter !== "all" ? moduleFilter : null),
      fetchPermissionsGroupedByModule()
    ]);
  };

  // Reload data when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPermissions(pageIndex, currentPageSize, searchTerm || null, moduleFilter !== "all" ? moduleFilter : null);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, moduleFilter, pageIndex, currentPageSize]);

  // ==================== PAGINATION HANDLERS ====================

  const handlePageChange = (newPage) => {
    fetchPermissions(newPage, currentPageSize, searchTerm || null, moduleFilter !== "all" ? moduleFilter : null);
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    fetchPermissions(1, newPageSize, searchTerm || null, moduleFilter !== "all" ? moduleFilter : null);
  };

  // ==================== HANDLERS ====================

  const handleCreatePermission = async (formData) => {
    setCreating(true);
    const result = await createPermission(formData);
    setCreating(false);

    if (result.success) {
      toast.success("Tạo quyền thành công!");
      setShowCreateModal(false);
      await loadData();
    } else {
      toast.error(result.error || "Tạo quyền thất bại!");
    }
  };

  const handleEditPermission = async (formData) => {
    if (!selectedPermission) return;

    setUpdating(true);
    const result = await updatePermission(selectedPermission.id, formData);
    setUpdating(false);

    if (result.success) {
      toast.success("Cập nhật quyền thành công!");
      setShowEditModal(false);
      setSelectedPermission(null);
      await loadData();
    } else {
      toast.error(result.error || "Cập nhật quyền thất bại!");
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    setDeleting(true);
    const result = await deletePermission(selectedPermission.id);
    setDeleting(false);

    if (result.success) {
      toast.success("Xóa quyền thành công!");
      setShowDeleteModal(false);
      setSelectedPermission(null);
      await loadData();
    } else {
      toast.error(result.error || "Xóa quyền thất bại!");
    }
  };

  const openEditModal = (permission) => {
    setSelectedPermission(permission);
    setShowEditModal(true);
  };

  const openDeleteModal = (permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  // ==================== FILTERING ====================

  // Get unique modules for filter
  const uniqueModules = [
    ...new Set(groupedPermissions.map((g) => g.module).filter(Boolean)),
  ];

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.id}</span>
      ),
    },
    {
      key: "permissionKey",
      label: "Permission Key",
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-gray-900">
            {row.permissionKey}
          </span>
          {row.description && (
            <p className="text-sm text-gray-500 mt-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (row) => (
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
          {row.module || "Không phân loại"}
        </span>
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

  // ==================== RENDER ====================

  if (permissionsLoading && permissions.length === 0) {
    return (
      <div>
        <PageHeader title="Quản lý quyền hạn" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý quyền hạn"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Tạo quyền mới
          </button>
        }
      />

      {/* Search and Filters */}
      {permissions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo permission key hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module
              </label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">Tất cả module</option>
                {uniqueModules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || moduleFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold">
                  {totalRecords}
                </span>{" "}
                kết quả
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setModuleFilter("all");
                }}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table or Empty State */}
      {permissions.length === 0 && !permissionsLoading ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdKey}
            title="Chưa có quyền nào"
            message="Bắt đầu bằng cách tạo quyền đầu tiên"
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Tạo quyền mới
              </button>
            }
          />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={permissions} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pageIndex}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                pageSize={currentPageSize}
                onPageSizeChange={handlePageSizeChange}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </>
      )}

      {/* MODALS */}

      {showCreateModal && (
        <CreatePermissionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePermission}
          isLoading={creating}
        />
      )}

      {showEditModal && selectedPermission && (
        <EditPermissionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPermission(null);
          }}
          onSubmit={handleEditPermission}
          permission={selectedPermission}
          isLoading={updating}
        />
      )}

      {showDeleteModal && selectedPermission && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPermission(null);
          }}
          onConfirm={handleDeletePermission}
          isLoading={deleting}
          title="Xóa quyền"
          message={`Bạn có chắc chắn muốn xóa quyền "${selectedPermission.permissionKey}"? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
}
