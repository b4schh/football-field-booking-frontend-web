import { HiOutlineUserGroup, HiOutlinePencil, HiOutlineTrash, HiOutlineKey } from "react-icons/hi2";

/**
 * RoleCard Component
 * Hiển thị thông tin vai trò dạng card
 */
export default function RoleCard({ role, onEdit, onDelete, onAssignPermissions }) {
  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getStatusText = (isActive) => {
    return isActive ? "Hoạt động" : "Vô hiệu hóa";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <HiOutlineUserGroup className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(
                role.isActive
              )}`}
            >
              {getStatusText(role.isActive)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {role.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {role.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <HiOutlineUserGroup className="text-gray-400" size={16} />
          <span className="text-sm text-gray-600">
            {role.userCount || 0} người dùng
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineKey className="text-gray-400" size={16} />
          <span className="text-sm text-gray-600">
            {role.permissionCount || 0} quyền
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAssignPermissions}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <HiOutlineKey size={16} />
          Gán quyền
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <HiOutlinePencil size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <HiOutlineTrash size={18} />
        </button>
      </div>
    </div>
  );
}
