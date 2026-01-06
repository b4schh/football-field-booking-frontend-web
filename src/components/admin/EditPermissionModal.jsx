import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

/**
 * EditPermissionModal Component
 * Modal chỉnh sửa quyền
 */
export default function EditPermissionModal({
  isOpen,
  onClose,
  onSubmit,
  permission,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    permissionKey: "",
    description: "",
    module: "",
  });

  const [errors, setErrors] = useState({});

  // Load permission data when modal opens
  useEffect(() => {
    if (permission) {
      setFormData({
        permissionKey: permission.permissionKey || "",
        description: permission.description || "",
        module: permission.module || "",
      });
    }
  }, [permission]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.permissionKey.trim()) {
      newErrors.permissionKey = "Permission key là bắt buộc";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.permissionKey)) {
      newErrors.permissionKey =
        "Permission key chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa quyền</h2>
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
          {/* Permission Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="permissionKey"
              value={formData.permissionKey}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.permissionKey ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="VD: booking.approve"
              disabled={isLoading}
            />
            {errors.permissionKey && (
              <p className="text-red-500 text-sm mt-1">{errors.permissionKey}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Định dạng: module.action (VD: user.create, booking.approve)
            </p>
          </div>

          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module
            </label>
            <input
              type="text"
              name="module"
              value={formData.module}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="VD: User, Booking, Complex"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhóm quyền theo module để dễ quản lý
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Mô tả quyền..."
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
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
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
