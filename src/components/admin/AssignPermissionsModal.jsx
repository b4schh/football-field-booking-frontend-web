import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { MdClose, MdExpandMore, MdExpandLess } from "react-icons/md";

/**
 * AssignPermissionsModal Component
 * Modal gán quyền cho vai trò
 */
export default function AssignPermissionsModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  allPermissions,
  groupedPermissions,
  isLoading,
}) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModules, setOpenModules] = useState(new Set());

  // Load current role permissions when modal opens
  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPermissionIds(role.permissions.map((p) => p.id));
    }
  }, [role]);

  const toggleModule = (moduleName) => {
    setOpenModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleName)) {
        newSet.delete(moduleName);
      } else {
        newSet.add(moduleName);
      }
      return newSet;
    });
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleModule = (modulePermissions) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const allSelected = moduleIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !moduleIds.includes(id))
      );
    } else {
      // Select all
      setSelectedPermissionIds((prev) => [
        ...prev,
        ...moduleIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedPermissionIds);
  };

  // Filter grouped permissions by search term
  const filteredGroupedPermissions = groupedPermissions
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (p) =>
          p.permissionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.permissions.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gán quyền cho vai trò
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Vai trò: <span className="font-medium">{role?.name}</span> - Đã chọn:{" "}
              <span className="font-medium text-green-600">
                {selectedPermissionIds.length}
              </span>{" "}
              quyền
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <CiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm quyền..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {filteredGroupedPermissions.map((group) => {
              const moduleIds = group.permissions.map((p) => p.id);
              const allSelected = moduleIds.every((id) =>
                selectedPermissionIds.includes(id)
              );
              const someSelected =
                moduleIds.some((id) => selectedPermissionIds.includes(id)) &&
                !allSelected;

              return (
                <div key={group.module} className="bg-gray-50 rounded-lg p-4">
                  {/* Module Header with Select All */}
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleModule(group.module)}
                  >
                    <div className="flex items-center gap-2">
                      {openModules.has(group.module) ? (
                        <MdExpandLess className="text-gray-600 text-xl" />
                      ) : (
                        <MdExpandMore className="text-gray-600 text-xl" />
                      )}
                      <label 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected;
                          }}
                          onChange={() => handleToggleModule(group.permissions)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold text-gray-900">
                          {group.module || "Không phân loại"}
                        </span>
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">
                      {group.permissions.filter((p) =>
                        selectedPermissionIds.includes(p.id)
                      ).length}{" "}
                      / {group.permissions.length}
                    </span>
                  </div>

                  {/* Permissions Grid - Only show when expanded */}
                  {openModules.has(group.module) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={() => handleTogglePermission(permission.id)}
                            className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono font-medium text-gray-900 break-all">
                              {permission.permissionKey}
                            </p>
                            {permission.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGroupedPermissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm
                  ? "Không tìm thấy quyền nào"
                  : "Chưa có quyền nào trong hệ thống"}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
