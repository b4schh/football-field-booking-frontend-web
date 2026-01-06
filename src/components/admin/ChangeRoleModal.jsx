import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import usePermissionStore from "../../store/permissionStore";

/**
 * ChangeRoleModal Component
 * Modal thay đổi role của người dùng
 */
export default function ChangeRoleModal({ isOpen, onClose, onSubmit, user, isLoading }) {
  const { roles, fetchRoles } = usePermissionStore();
  const [selectedRoleId, setSelectedRoleId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && user.roleIds && user.roleIds.length > 0) {
      setSelectedRoleId(user.roleIds[0].toString());
    } else if (user && user.roleNames && user.roleNames.length > 0 && roles.length > 0) {
      // Fallback: tìm role ID từ role name
      const role = roles.find(r => r.name === user.roleNames[0]);
      if (role) {
        setSelectedRoleId(role.id.toString());
      }
    }
  }, [user, roles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoleId) {
      onSubmit(parseInt(selectedRoleId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Thay đổi vai trò</h2>
            <p className="text-sm text-gray-600 mt-1">
              Người dùng: <span className="font-medium">{user?.firstName} {user?.lastName}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Vai trò hiện tại: <span className="font-medium text-gray-700">{user?.roleNames?.join(", ") || "Chưa có"}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedRoleId}
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
