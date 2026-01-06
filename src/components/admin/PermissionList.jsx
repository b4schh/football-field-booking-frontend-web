import { HiOutlineKey, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

/**
 * PermissionList Component
 * Hiển thị danh sách permissions nhóm theo module
 */
export default function PermissionList({ groupedPermissions, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      {groupedPermissions.map((group) => (
        <div key={group.module} className="bg-gray-50 rounded-lg p-6">
          {/* Module Header */}
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineKey className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">
              {group.module || "Không phân loại"}
            </h3>
            <span className="ml-auto text-sm text-gray-500">
              {group.permissions.length} quyền
            </span>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.permissions.map((permission) => (
              <div
                key={permission.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium text-gray-900 break-all">
                      {permission.permissionKey}
                    </p>
                    {permission.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {permission.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onEdit(permission)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <HiOutlinePencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(permission)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {groupedPermissions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HiOutlineKey size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">Chưa có quyền nào</p>
        </div>
      )}
    </div>
  );
}
