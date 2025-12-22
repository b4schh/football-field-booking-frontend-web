import { useState, useEffect } from "react";
import Modal from "../dashboard/Modal";
import FormInput from "../dashboard/FormInput";
import FormSelect from "../dashboard/FormSelect";
import FormTextarea from "../dashboard/FormTextarea";
import useLocationStore from "../../store/locationStore";

/**
 * Form tạo/chỉnh sửa Complex
 * Dành cho Owner
 */
export default function ComplexFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    street: initialData?.street || "",
    ward: initialData?.ward || "",
    province: initialData?.province || "",
    phone: initialData?.phone || "",
    openingTime: initialData?.openingTime || "",
    closingTime: initialData?.closingTime || "",
    description: initialData?.description || "",
  });

  const [errors, setErrors] = useState({});
  const { 
    provinces, 
    fetchProvinces, 
    fetchWardsByProvince, 
    getProvinceByName,
    isLoadingProvinces,
    isLoadingWards 
  } = useLocationStore();
  const [wards, setWards] = useState([]);

  // Load provinces on mount (will use cache if available)
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Load wards when province changes (with cache)
  useEffect(() => {
    const loadWards = async () => {
      if (formData.province) {
        const province = getProvinceByName(formData.province);
        if (province?.code) {
          const wardOptions = await fetchWardsByProvince(province.code);
          setWards(wardOptions);
        }
      } else {
        setWards([]);
        setFormData(prev => ({ ...prev, ward: "" }));
      }
    };
    
    loadWards();
  }, [formData.province, getProvinceByName, fetchWardsByProvince]);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        street: initialData.street || "",
        ward: initialData.ward || "",
        province: initialData.province || "",
        phone: initialData.phone || "",
        // Convert HH:mm:ss to HH:mm for time input
        openingTime: initialData.openingTime ? initialData.openingTime.substring(0, 5) : "",
        closingTime: initialData.closingTime ? initialData.closingTime.substring(0, 5) : "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  // Removed old loadProvinces and loadWards functions - now using store

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên cụm sân là bắt buộc";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.province.trim()) newErrors.province = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.ward.trim()) newErrors.ward = "Phường/Xã là bắt buộc";
    
    // Validate time format HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (formData.openingTime && !timeRegex.test(formData.openingTime)) {
      newErrors.openingTime = "Định dạng giờ không hợp lệ (HH:mm)";
    }
    if (formData.closingTime && !timeRegex.test(formData.closingTime)) {
      newErrors.closingTime = "Định dạng giờ không hợp lệ (HH:mm)";
    }

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
      title={initialData ? "Chỉnh sửa cụm sân" : "Tạo cụm sân mới"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên cụm sân */}
        <FormInput
          label="Tên cụm sân"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="VD: Sân bóng ABC"
          required
        />

        {/* Địa chỉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Tỉnh/Thành phố"
            name="province"
            value={formData.province}
            onChange={handleChange}
            options={provinces}
            error={errors.province}
            placeholder={isLoadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
            disabled={isLoadingProvinces}
            required
          />
          <FormSelect
            label="Phường/Xã"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            options={wards}
            error={errors.ward}
            placeholder={isLoadingWards ? "Đang tải..." : formData.province ? "Chọn Phường/Xã" : "Chọn Tỉnh/TP trước"}
            disabled={!formData.province || isLoadingWards}
            required
          />
        </div>

        <FormInput
          label="Đường/Số nhà"
          name="street"
          value={formData.street}
          onChange={handleChange}
          error={errors.street}
          placeholder="VD: 123 Đường Láng"
        />

        {/* Thông tin liên hệ */}
        <FormInput
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="VD: 0912345678"
          required
        />

        {/* Giờ mở cửa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Giờ mở cửa"
            name="openingTime"
            type="time"
            value={formData.openingTime}
            onChange={handleChange}
            error={errors.openingTime}
          />
          <FormInput
            label="Giờ đóng cửa"
            name="closingTime"
            type="time"
            value={formData.closingTime}
            onChange={handleChange}
            error={errors.closingTime}
          />
        </div>

        {/* Mô tả */}
        <FormTextarea
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Mô tả về cụm sân của bạn..."
          rows={4}
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
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
