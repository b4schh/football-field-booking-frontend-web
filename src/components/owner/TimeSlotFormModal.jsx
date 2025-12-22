import { useState } from "react";
import Modal from "../dashboard/Modal";
import FormInput from "../dashboard/FormInput";

/**
 * Form tạo/chỉnh sửa TimeSlot
 * Thuộc về Field
 */
export default function TimeSlotFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  fieldId,
  initialData = null, 
  loading = false,
  existingSlots = [] // Để validate trùng giờ
}) {
  const [formData, setFormData] = useState({
    fieldId: fieldId || initialData?.fieldId || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    price: initialData?.price ?? "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.startTime) newErrors.startTime = "Giờ bắt đầu là bắt buộc";
    if (!formData.endTime) newErrors.endTime = "Giờ kết thúc là bắt buộc";

    // Validate end > start
    if (formData.startTime && formData.endTime) {
      const start = formData.startTime.split(":").map(Number);
      const end = formData.endTime.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];

      if (endMinutes <= startMinutes) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
      }

      // Check trùng giờ với các slot khác (nếu không edit)
      if (!initialData) {
        const isOverlap = existingSlots.some((slot) => {
          const slotStart = slot.startTime.split(":").map(Number);
          const slotEnd = slot.endTime.split(":").map(Number);
          const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
          const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];

          return (
            (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
            (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
            (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes)
          );
        });

        if (isOverlap) {
          newErrors.startTime = "Khung giờ bị trùng với khung giờ khác";
        }
      }
    }

    if (!formData.price && formData.price !== 0) newErrors.price = "Giá tiền là bắt buộc";
    if (formData.price && Number(formData.price) <= 0) newErrors.price = "Giá tiền phải lớn hơn 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Ensure price is numeric
    const payload = { ...formData, price: formData.price === '' ? null : parseFloat(formData.price) };
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Giờ bắt đầu"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
          />

          <FormInput
            label="Giờ kết thúc"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            error={errors.endTime}
            required
          />
          <FormInput
            label="Giá tiền (đ)"
            name="price"
            type="number"
            step="1000"
            min="0"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            required
          />
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium">Lưu ý:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Khung giờ không được trùng với khung giờ đã có</li>
            <li>Giờ kết thúc phải sau giờ bắt đầu</li>
          </ul>
        </div>

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
