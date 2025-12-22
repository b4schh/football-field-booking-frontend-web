import { useState, useEffect } from "react";
import Modal from "../dashboard/Modal";
import FormInput from "../dashboard/FormInput";
import FormSelect from "../dashboard/FormSelect";
import FormTextarea from "../dashboard/FormTextarea";

/**
 * Form tạo/chỉnh sửa Field
 * Thuộc về Complex
 */
export default function FieldFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  complexId,
  initialData = null, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    complexId: complexId || initialData?.complexId || "",
    name: initialData?.name || "",
    fieldSize: initialData?.fieldSize || initialData?.fieldType || "",
    surfaceType: initialData?.surfaceType || "",
    description: initialData?.description || "",
  });

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      complexId: complexId || initialData?.complexId || "",
      name: initialData?.name || "",
      fieldSize: initialData?.fieldSize || initialData?.fieldType || "",
      surfaceType: initialData?.surfaceType || "",
      description: initialData?.description || "",
    });
    setErrors({});
  }, [isOpen, initialData, complexId]);

  const [errors, setErrors] = useState({});

  const fieldSizeOptions = [
    // { value: "", label: "Chọn kích thước sân" },
    { value: "Sân 5 người", label: "Sân 5 người" },
    { value: "Sân 7 người", label: "Sân 7 người" },
    { value: "Sân 11 người", label: "Sân 11 người" },
  ];

  const surfaceTypeOptions = [
    // { value: "", label: "Chọn loại mặt sân" },
    { value: "Cỏ tự nhiên", label: "Cỏ tự nhiên" },
    { value: "Cỏ nhân tạo", label: "Cỏ nhân tạo" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên sân là bắt buộc";
    if (!formData.fieldSize) newErrors.fieldSize = "Vui lòng chọn kích thước sân";
    if (!formData.surfaceType) newErrors.surfaceType = "Vui lòng chọn loại mặt sân";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Chỉnh sửa sân" : "Thêm sân mới"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Tên sân"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="VD: Sân A1"
          required
        />

        <FormSelect
          label="Kích thước sân"
          name="fieldSize"
          value={formData.fieldSize}
          onChange={handleChange}
          options={fieldSizeOptions}
          error={errors.fieldSize}
          required
        />

        <FormSelect
          label="Loại mặt sân"
          name="surfaceType"
          value={formData.surfaceType}
          onChange={handleChange}
          options={surfaceTypeOptions}
          error={errors.surfaceType}
        />
        <FormTextarea
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả về sân..."
          rows={3}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
