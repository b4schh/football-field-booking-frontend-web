import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdSecurity, MdKey } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import usePermissionStore from "../../../store/permissionStore";
import { useToast } from "../../../store/toastStore";
import CreateRoleModal from "../../../components/admin/CreateRoleModal";
import EditRoleModal from "../../../components/admin/EditRoleModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import AssignPermissionsModal from "../../../components/admin/AssignPermissionsModal";

/**
 * Role Management Page for Admin
 * Quản lý vai trò - Phong cách bảng
 */
export default function RoleManagement() {
  const toast = useToast();
  const {
    roles,
    permissions,
    groupedPermissions,
    rolesLoading,
    fetchRoles,
    fetchPermissions,
    fetchPermissionsGroupedByModule,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
  } = usePermissionStore();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignPermissionsModal, setShowAssignPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Loading states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchRoles(),
      fetchPermissions(),
      fetchPermissionsGroupedByModule(),
    ]);
  };

  // ==================== HANDLERS ====================

  const handleCreateRole = async (formData) => {
    setCreating(true);
    const result = await createRole(formData);
    setCreating(false);

    if (result.success) {
      toast.success("Tạo vai trò thành công!");
      setShowCreateModal(false);
      await fetchRoles();
    } else {
      toast.error(result.error || "Tạo vai trò thất bại!");
    }
  };

  const handleEditRole = async (formData) => {
    if (!selectedRole) return;

    setUpdating(true);
    const result = await updateRole(selectedRole.id, formData);
    setUpdating(false);

    if (result.success) {
      toast.success("Cập nhật vai trò thành công!");
      setShowEditModal(false);
      setSelectedRole(null);
      await fetchRoles();
    } else {
      toast.error(result.error || "Cập nhật vai trò thất bại!");
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    setDeleting(true);
    const result = await deleteRole(selectedRole.id);
    setDeleting(false);

    if (result.success) {
      toast.success("Xóa vai trò thành công!");
      setShowDeleteModal(false);
      setSelectedRole(null);
      await fetchRoles();
    } else {
      toast.error(result.error || "Xóa vai trò thất bại!");
    }
  };

  const handleAssignPermissions = async (permissionIds) => {
    if (!selectedRole) return;

    setAssigning(true);
    const result = await assignPermissionsToRole(selectedRole.id, permissionIds);
    setAssigning(false);

    if (result.success) {
      toast.success("Gán quyền thành công!");
      setShowAssignPermissionsModal(false);
      setSelectedRole(null);
      await fetchRoles();
    } else {
      toast.error(result.error || "Gán quyền thất bại!");
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const openAssignPermissionsModal = async (role) => {
    const result = await fetchRoleById(role.id);
    if (result.success) {
      setSelectedRole(result.data);
      setShowAssignPermissionsModal(true);
    } else {
      toast.error("Không thể tải thông tin vai trò!");
    }
  };

  // ==================== FILTERING ====================

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      searchTerm === "" ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && role.isActive) ||
      (statusFilter === "inactive" && !role.isActive);

    return matchesSearch && matchesStatus;
  });

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "name",
      label: "Tên vai trò",
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900">{row.name}</span>
          {row.description && (
            <p className="text-sm text-gray-500 mt-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "userCount",
      label: "Số người dùng",
      render: (row) => (
        <span className="text-gray-600">{row.userCount || 0} người dùng</span>
      ),
    },
    {
      key: "permissionCount",
      label: "Số quyền",
      render: (row) => (
        <span className="text-gray-600">{row.permissionCount || 0} quyền</span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (row) => (
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isActive ? "Hoạt động" : "Vô hiệu hóa"}
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
              openAssignPermissionsModal(row);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Gán quyền"
          >
            <MdKey className="text-lg" />
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

  // ==================== RENDER ====================

  if (rolesLoading && roles.length === 0) {
    return (
      <div>
        <PageHeader title="Quản lý vai trò" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý vai trò"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Tạo vai trò mới
          </button>
        }
      />

      {/* Search and Filters */}
      {roles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên vai trò hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-semibold">{filteredRoles.length}</span> kết quả
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
      {roles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdSecurity}
            title="Chưa có vai trò nào"
            message="Bắt đầu bằng cách tạo vai trò đầu tiên"
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Tạo vai trò mới
              </button>
            }
          />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">
            Không tìm thấy vai trò nào phù hợp với bộ lọc
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="mt-4 text-slate-600 hover:text-slate-800 font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredRoles} />
      )}

      {/* MODALS */}

      {showCreateModal && (
        <CreateRoleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRole}
          isLoading={creating}
        />
      )}

      {showEditModal && selectedRole && (
        <EditRoleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSubmit={handleEditRole}
          role={selectedRole}
          isLoading={updating}
        />
      )}

      {showDeleteModal && selectedRole && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}
          onConfirm={handleDeleteRole}
          isLoading={deleting}
          title="Xóa vai trò"
          message={`Bạn có chắc chắn muốn xóa vai trò "${selectedRole.name}"? Hành động này không thể hoàn tác.`}
        />
      )}

      {showAssignPermissionsModal && selectedRole && (
        <AssignPermissionsModal
          isOpen={showAssignPermissionsModal}
          onClose={() => {
            setShowAssignPermissionsModal(false);
            setSelectedRole(null);
          }}
          onSubmit={handleAssignPermissions}
          role={selectedRole}
          allPermissions={permissions}
          groupedPermissions={groupedPermissions}
          isLoading={assigning}
        />
      )}
    </div>
  );
}
