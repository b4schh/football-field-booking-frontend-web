import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdPeople, MdBlock, MdCheckCircle, MdSwapHoriz } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import useUserStore from "../../../store/userStore";
import { useToast } from "../../../store/toastStore";
import CreateUserModal from "../../../components/admin/CreateUserModal";
import EditUserModal from "../../../components/admin/EditUserModal";
import ChangeRoleModal from "../../../components/admin/ChangeRoleModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

/**
 * User Management Page for Admin
 * Quản lý người dùng - Table style với đầy đủ CRUD operations
 */
export default function UserManagement() {
  const toast = useToast();
  const {
    users,
    isLoading,
    pageIndex,
    pageSize,
    totalRecords,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
  } = useUserStore();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Loading states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPageSize, setCurrentPageSize] = useState(10);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchUsers(
      pageIndex,
      currentPageSize,
      searchTerm || null,
      roleFilter || null,
      statusFilter || null
    );
  };

  // Reload data when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(
        pageIndex,
        currentPageSize,
        searchTerm || null,
        roleFilter || null,
        statusFilter || null
      );
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter, pageIndex, currentPageSize]);

  // ==================== PAGINATION HANDLERS ====================

  const handlePageChange = (newPage) => {
    fetchUsers(
      newPage,
      currentPageSize,
      searchTerm || null,
      roleFilter || null,
      statusFilter || null
    );
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    fetchUsers(
      1,
      newPageSize,
      searchTerm || null,
      roleFilter || null,
      statusFilter || null
    );
  };

  // ==================== HANDLERS ====================

  const handleCreateUser = async (formData, setModalErrors) => {
    setCreating(true);
    const result = await createUser(formData);
    setCreating(false);

    if (result.success) {
      toast.success("Tạo người dùng thành công!");
      setShowCreateModal(false);
      await loadData();
    } else {
      // Kiểm tra nếu là lỗi email hoặc phone trùng
      const errorMessage = result.error || "Tạo người dùng thất bại!";
      
      if (errorMessage.toLowerCase().includes("email")) {
        setModalErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes("điện thoại") || errorMessage.toLowerCase().includes("phone")) {
        setModalErrors({ phone: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEditUser = async (formData) => {
    if (!selectedUser) return;

    setUpdating(true);
    const result = await updateUser(selectedUser.id, formData);
    setUpdating(false);

    if (result.success) {
      toast.success("Cập nhật người dùng thành công!");
      setShowEditModal(false);
      setSelectedUser(null);
      await loadData();
    } else {
      toast.error(result.error || "Cập nhật người dùng thất bại!");
    }
  };

  const handleChangeRole = async (roleId) => {
    if (!selectedUser) return;

    setUpdating(true);
    const result = await updateUserRole(selectedUser.id, roleId);
    setUpdating(false);

    if (result.success) {
      toast.success("Thay đổi vai trò thành công!");
      setShowRoleModal(false);
      setSelectedUser(null);
      await loadData();
    } else {
      toast.error(result.error || "Thay đổi vai trò thất bại!");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 1 ? 2 : 1; // Toggle between Active and Banned
    const result = await updateUserStatus(user.id, newStatus);

    if (result.success) {
      toast.success(
        newStatus === 2 ? "Đã khóa người dùng" : "Đã mở khóa người dùng"
      );
      await loadData();
    } else {
      toast.error(result.error || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    const result = await deleteUser(selectedUser.id);
    setDeleting(false);

    if (result.success) {
      toast.success("Xóa người dùng thành công!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      await loadData();
    } else {
      toast.error(result.error || "Xóa người dùng thất bại!");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // ==================== STATUS HELPERS ====================

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      1: { label: "Active", className: "bg-green-100 text-green-800" },
      2: { label: "Banned", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig[0];
    return (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

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
      key: "name",
      label: "Họ tên",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <MdPeople className="text-slate-500 text-xl" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {row.lastName} {row.firstName}
            </p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (row) => (
        <span className="text-gray-700">{row.phone || "Chưa có"}</span>
      ),
    },
    {
      key: "roles",
      label: "Vai trò",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roleNames && row.roleNames.length > 0 ? (
            row.roleNames.map((role, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => getStatusBadge(row.status),
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
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Chỉnh sửa"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRoleModal(row);
            }}
            className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
            title="Thay đổi vai trò"
          >
            <MdSwapHoriz className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={`p-2 rounded-lg transition-colors ${
              row.status === 1
                ? "hover:bg-red-50 text-red-600"
                : "hover:bg-green-50 text-green-600"
            }`}
            title={row.status === 1 ? "Khóa" : "Mở khóa"}
          >
            {row.status === 1 ? (
              <MdBlock className="text-lg" />
            ) : (
              <MdCheckCircle className="text-lg" />
            )}
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

  if (isLoading && users.length === 0) {
    return (
      <div>
        <PageHeader title="Quản lý người dùng" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <MdAdd className="text-xl" />
            Tạo người dùng mới
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
              <option value="Customer">Customer</option>
            </select>
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
              <option value="">Tất cả trạng thái</option>
              <option value="0">Inactive</option>
              <option value="1">Active</option>
              <option value="2">Banned</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || roleFilter || statusFilter) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Tìm thấy{" "}
              <span className="font-semibold">{totalRecords}</span> kết quả
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("");
                setStatusFilter("");
              }}
              className="text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Table or Empty State */}
      {users.length === 0 && !isLoading ? (
        <div className="bg-white rounded-xl shadow-md">
          <EmptyState
            icon={MdPeople}
            title="Chưa có người dùng nào"
            message="Bắt đầu bằng cách tạo người dùng đầu tiên"
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <MdAdd className="text-xl" />
                Tạo người dùng mới
              </button>
            }
          />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={users} />

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
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          isLoading={creating}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUser}
          user={selectedUser}
          isLoading={updating}
        />
      )}

      {showRoleModal && selectedUser && (
        <ChangeRoleModal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleChangeRole}
          user={selectedUser}
          isLoading={updating}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          isLoading={deleting}
          title="Xóa người dùng"
          message={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser.lastName} ${selectedUser.firstName}"? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
}
