import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
  FaCopy,
  FaChevronDown,
  FaChevronUp,
  FaBolt,
  FaPencilAlt,
} from "react-icons/fa";
import api from "../../services/api";
import { useLocationStore } from "../../store";

const FIELD_TYPE_OPTIONS = [
  { value: "Sân 5 người", label: "Sân 5 người" },
  { value: "Sân 7 người", label: "Sân 7 người" },
  { value: "Sân 11 người", label: "Sân 11 người" },
];

const ComplexSetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Step 1: Complex Info
  const [complexData, setComplexData] = useState({
    name: "",
    address: "",
    provinceCode: "",
    wardCode: "",
    phoneNumber: "",
    openingTime: "06:00",
    closingTime: "23:00",
    description: "",
  });

  // Step 2 & 3: Fields with TimeSlots (merged)
  const [fieldsData, setFieldsData] = useState([
    {
      tempId: Date.now(),
      name: "Sân 1",
      fieldType: "Sân 5 người",
      description: "",
      timeSlots: [],
    },
  ]);

  // Quick add modal state
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddConfig, setQuickAddConfig] = useState({
    count: 5,
    namePattern: "Sân {number}",
    fieldType: "Sân 5 người",
  });

  // Accordion state for Step 3
  const [expandedFields, setExpandedFields] = useState([]);

  // TimeSlot form state (per field)
  const [timeSlotForms, setTimeSlotForms] = useState({});

  // Edit mode state for timeslots
  const [editingTimeSlot, setEditingTimeSlot] = useState(null); // { fieldTempId, slotTempId }
  const [editingSlotData, setEditingSlotData] = useState(null); // { startTime, endTime, price }

  // Location store
  const {
    provinces,
    fetchProvinces,
    fetchWardsByProvince,
    isLoadingProvinces,
    isLoadingWards,
    wardsCache,
    getProvinceByName,
  } = useLocationStore();

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Load wards when province changes
  const handleProvinceChange = async (provinceCode) => {
    setComplexData({ ...complexData, provinceCode, wardCode: "" });
    if (provinceCode) {
      await fetchWardsByProvince(provinceCode);
    }
  };

  // ==================== FIELD MANAGEMENT ====================

  const addField = () => {
    const newField = {
      tempId: Date.now(),
      name: `Sân ${fieldsData.length + 1}`,
      fieldType: "Sân 5 người",
      description: "",
      timeSlots: [],
    };
    setFieldsData([...fieldsData, newField]);
  };

  const removeField = (tempId) => {
    if (fieldsData.length === 1) {
      alert("Phải có ít nhất 1 sân");
      return;
    }
    setFieldsData(fieldsData.filter((f) => f.tempId !== tempId));
    setExpandedFields(expandedFields.filter((id) => id !== tempId));
  };

  const updateField = (tempId, updates) => {
    setFieldsData(
      fieldsData.map((f) => (f.tempId === tempId ? { ...f, ...updates } : f))
    );
  };

  const handleQuickAdd = () => {
    const startIndex = fieldsData.length + 1;
    const newFields = [];

    for (let i = 0; i < quickAddConfig.count; i++) {
      const fieldNumber = startIndex + i;
      const name = quickAddConfig.namePattern.replace("{number}", fieldNumber);
      newFields.push({
        tempId: Date.now() + i,
        name,
        fieldType: quickAddConfig.fieldType,
        description: "",
        timeSlots: [],
      });
    }

    setFieldsData([...fieldsData, ...newFields]);
    setShowQuickAddModal(false);
    setQuickAddConfig({
      count: 5,
      namePattern: "Sân {number}",
      fieldType: "Sân 5 người",
    });
  };

  // ==================== TIMESLOT MANAGEMENT ====================

  const isTimeSlotOverlapping = (
    fieldTempId,
    newStartTime,
    newEndTime,
    excludeSlotTempId = null
  ) => {
    const field = fieldsData.find((f) => f.tempId === fieldTempId);
    if (!field || field.timeSlots.length === 0) return false;

    // Convert time strings to minutes for easier comparison
    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const newStart = toMinutes(newStartTime);
    const newEnd = toMinutes(newEndTime);

    // Check if new slot overlaps with any existing slot (except the one being edited)
    return field.timeSlots.some((slot) => {
      if (excludeSlotTempId && slot.tempId === excludeSlotTempId) return false;

      const existingStart = toMinutes(slot.startTime);
      const existingEnd = toMinutes(slot.endTime);

      // Two slots overlap if: start1 < end2 AND start2 < end1
      return newStart < existingEnd && existingStart < newEnd;
    });
  };

  const sortTimeSlots = (slots) => {
    return [...slots].sort((a, b) => {
      const toMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  };

  const initTimeSlotForm = (fieldTempId) => {
    if (!timeSlotForms[fieldTempId]) {
      setTimeSlotForms({
        ...timeSlotForms,
        [fieldTempId]: { startTime: "06:00", endTime: "07:30", price: 200000 },
      });
    }
  };

  const updateTimeSlotForm = (fieldTempId, updates) => {
    setTimeSlotForms({
      ...timeSlotForms,
      [fieldTempId]: { ...timeSlotForms[fieldTempId], ...updates },
    });
  };

  const addTimeSlot = (fieldTempId) => {
    const form = timeSlotForms[fieldTempId];
    if (!form || !form.startTime || !form.endTime || !form.price) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate time range
    if (form.startTime >= form.endTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    // Check for overlapping timeslots
    if (isTimeSlotOverlapping(fieldTempId, form.startTime, form.endTime)) {
      alert(
        "Khung giờ này bị trùng với khung giờ đã có. Vui lòng chọn khung giờ khác."
      );
      return;
    }

    const newSlot = {
      tempId: Date.now(),
      startTime: form.startTime,
      endTime: form.endTime,
      price: parseFloat(form.price),
    };

    setFieldsData(
      fieldsData.map((f) => {
        if (f.tempId === fieldTempId) {
          const updatedSlots = sortTimeSlots([...f.timeSlots, newSlot]);
          return { ...f, timeSlots: updatedSlots };
        }
        return f;
      })
    );

    // Auto-set next time slot: start = current end, end = start + 90 minutes
    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };
    
    const toTimeString = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const nextStartMinutes = toMinutes(form.endTime);
    const nextEndMinutes = nextStartMinutes + 90; // Default 90 minutes duration
    
    setTimeSlotForms({
      ...timeSlotForms,
      [fieldTempId]: { 
        startTime: toTimeString(nextStartMinutes), 
        endTime: toTimeString(nextEndMinutes), 
        price: form.price // Keep the same price
      },
    });
  };

  const removeTimeSlot = (fieldTempId, slotTempId) => {
    setFieldsData(
      fieldsData.map((f) =>
        f.tempId === fieldTempId
          ? {
              ...f,
              timeSlots: f.timeSlots.filter((ts) => ts.tempId !== slotTempId),
            }
          : f
      )
    );
  };

  const startEditTimeSlot = (fieldTempId, slot) => {
    setEditingTimeSlot({ fieldTempId, slotTempId: slot.tempId });
    setEditingSlotData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
    });
  };

  const cancelEditTimeSlot = () => {
    setEditingTimeSlot(null);
    setEditingSlotData(null);
  };

  const saveEditTimeSlot = () => {
    if (!editingTimeSlot || !editingSlotData) return;

    const { fieldTempId, slotTempId } = editingTimeSlot;

    // Validate
    if (
      !editingSlotData.startTime ||
      !editingSlotData.endTime ||
      !editingSlotData.price
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (editingSlotData.startTime >= editingSlotData.endTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    // Check for overlapping (exclude current slot being edited)
    if (
      isTimeSlotOverlapping(
        fieldTempId,
        editingSlotData.startTime,
        editingSlotData.endTime,
        slotTempId
      )
    ) {
      alert(
        "Khung giờ này bị trùng với khung giờ khác. Vui lòng chọn khung giờ khác."
      );
      return;
    }

    // Update the slot
    setFieldsData(
      fieldsData.map((f) => {
        if (f.tempId === fieldTempId) {
          const updatedSlots = f.timeSlots.map((slot) =>
            slot.tempId === slotTempId
              ? {
                  ...slot,
                  ...editingSlotData,
                  price: parseFloat(editingSlotData.price),
                }
              : slot
          );
          return { ...f, timeSlots: sortTimeSlots(updatedSlots) };
        }
        return f;
      })
    );

    cancelEditTimeSlot();
  };

  const applyTimeSlotsToAll = (sourceFieldTempId) => {
    const sourceField = fieldsData.find((f) => f.tempId === sourceFieldTempId);
    if (!sourceField || sourceField.timeSlots.length === 0) {
      alert("Sân này chưa có khung giờ");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn áp dụng ${
        sourceField.timeSlots.length
      } khung giờ của "${sourceField.name}" cho ${
        fieldsData.length - 1
      } sân còn lại?`
    );

    if (confirmed) {
      setFieldsData(
        fieldsData.map((f) => {
          if (f.tempId === sourceFieldTempId) return f;

          // Copy slots with new tempIds
          const copiedSlots = sourceField.timeSlots.map((slot, index) => ({
            ...slot,
            tempId: Date.now() + Math.random() + index,
          }));

          return { ...f, timeSlots: [...copiedSlots] };
        })
      );
    }
  };

  // ==================== ACCORDION TOGGLE ====================

  const toggleFieldAccordion = (fieldTempId) => {
    if (expandedFields.includes(fieldTempId)) {
      setExpandedFields(expandedFields.filter((id) => id !== fieldTempId));
    } else {
      setExpandedFields([...expandedFields, fieldTempId]);
      initTimeSlotForm(fieldTempId);
    }
  };

  // ==================== VALIDATION ====================

  const getDuplicateFieldNames = () => {
    const names = fieldsData.map((f) => f.name.trim().toLowerCase());
    const duplicates = names.filter(
      (name, index) => name && names.indexOf(name) !== index
    );
    return [...new Set(duplicates)];
  };

  const hasDuplicateFieldNames = () => {
    return getDuplicateFieldNames().length > 0;
  };

  const isFieldNameDuplicate = (fieldName) => {
    const trimmedName = fieldName.trim().toLowerCase();
    if (!trimmedName) return false;
    return (
      fieldsData.filter((f) => f.name.trim().toLowerCase() === trimmedName)
        .length > 1
    );
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return (
        complexData.name &&
        complexData.address &&
        complexData.provinceCode &&
        complexData.wardCode
      );
    }
    if (currentStep === 2) {
      return (
        fieldsData.length > 0 &&
        fieldsData.every((f) => f.name.trim()) &&
        !hasDuplicateFieldNames()
      );
    }
    if (currentStep === 3) {
      return fieldsData.every((f) => f.timeSlots.length > 0);
    }
    return true;
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const province = provinces.find(
        (p) => p.code == complexData.provinceCode // Use == for type coercion
      );
      const ward = wardsCache[complexData.provinceCode]?.find(
        (w) => w.code == complexData.wardCode // Use == for type coercion
      );

      const payload = {
        complex: {
          name: complexData.name,
          street: complexData.address,
          province: province?.value || null,
          ward: ward?.value || null,
          phone: complexData.phoneNumber || null,
          openingTime: `${complexData.openingTime}:00`,
          closingTime: `${complexData.closingTime}:00`,
          description: complexData.description || null,
        },
        fields: fieldsData.map((field) => ({
          name: field.name,
          fieldType: field.fieldType,
          description: field.description,
          customTimeSlots: field.timeSlots.map((slot) => ({
            startTime: `${slot.startTime}:00`,
            endTime: `${slot.endTime}:00`,
            price: slot.price,
          })),
        })),
        timeSlotTemplate: null,
        applyTemplateToAllFields: false,
      };

      const response = await api.post("/complexes/owner/bulk-setup", payload);

      if (response.data?.isSuccess) {
        setSuccess("Tạo cụm sân thành công! Đang chuyển hướng...");
        // Navigate after 1.5 seconds to show success message
        setTimeout(() => {
          navigate("/owner/complexes");
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo cụm sân nhanh
          </h1>
          <p className="text-gray-600">
            Tạo cụm sân với nhiều sân con và khung giờ tùy chỉnh
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${
                    currentStep === step
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentStep > step
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step ? <FaCheck /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Thông tin cụm sân</span>
            <span className="text-sm text-gray-600">Thiết lập sân</span>
            <span className="text-sm text-gray-600">Khung giờ</span>
            <span className="text-sm text-gray-600">Xác nhận</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <FaCheck className="text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <FaTimes className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Step 1: Complex Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin cụm sân</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cụm sân <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={complexData.name}
                  onChange={(e) =>
                    setComplexData({ ...complexData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Sân bóng Thể Thao XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={complexData.address}
                  onChange={(e) =>
                    setComplexData({ ...complexData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Số nhà, tên đường"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={complexData.provinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoadingProvinces}
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={complexData.wardCode}
                    onChange={(e) =>
                      setComplexData({
                        ...complexData,
                        wardCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!complexData.provinceCode || isLoadingWards}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {(wardsCache[complexData.provinceCode] || []).map(
                      (ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={complexData.phoneNumber}
                  onChange={(e) =>
                    setComplexData({
                      ...complexData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0901234567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    value={complexData.openingTime}
                    onChange={(e) =>
                      setComplexData({
                        ...complexData,
                        openingTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    value={complexData.closingTime}
                    onChange={(e) =>
                      setComplexData({
                        ...complexData,
                        closingTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={complexData.description}
                  onChange={(e) =>
                    setComplexData({
                      ...complexData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả về cụm sân của bạn..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Field Cards */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Thiết lập sân ({fieldsData.length} sân)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuickAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <FaBolt />
                    Thêm nhiều sân
                  </button>
                  <button
                    onClick={addField}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FaPlus />
                    Thêm 1 sân
                  </button>
                </div>
              </div>

              {hasDuplicateFieldNames() && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <FaTimes className="text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium">
                      Tên sân bị trùng lặp!
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      Các tên bị trùng:{" "}
                      <strong>{getDuplicateFieldNames().join(", ")}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {fieldsData.map((field, index) => {
                  const isDuplicate = isFieldNameDuplicate(field.name);
                  return (
                    <div
                      key={field.tempId}
                      className={`border rounded-lg p-4 transition-colors ${
                        isDuplicate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">
                          Sân #{index + 1}
                        </span>
                        {fieldsData.length > 1 && (
                          <button
                            onClick={() => removeField(field.tempId)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Xóa sân"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên sân <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) =>
                              updateField(field.tempId, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Ví dụ: Sân 1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại sân
                          </label>
                          <select
                            value={field.fieldType}
                            onChange={(e) =>
                              updateField(field.tempId, {
                                fieldType: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {FIELD_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={field.description}
                            onChange={(e) =>
                              updateField(field.tempId, {
                                description: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={2}
                            placeholder="Mô tả về sân..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: TimeSlots Accordion */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Thiết lập khung giờ cho từng sân
              </h2>
              <p className="text-gray-600 mb-4">
                Thêm khung giờ cho từng sân. Bạn có thể thêm khung giờ cho một
                sân và áp dụng cho tất cả các sân còn lại.
              </p>

              <div className="space-y-3">
                {fieldsData.map((field) => {
                  const isExpanded = expandedFields.includes(field.tempId);
                  const form = timeSlotForms[field.tempId] || {
                    startTime: "06:00",
                    endTime: "08:00",
                    price: 200000,
                  };

                  return (
                    <div
                      key={field.tempId}
                      className="border border-gray-300 rounded-lg overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleFieldAccordion(field.tempId)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <FaChevronUp className="text-blue-600" />
                          ) : (
                            <FaChevronDown className="text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {field.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            - {field.fieldType}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            field.timeSlots.length > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {field.timeSlots.length} khung giờ
                        </span>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-white">
                          {/* Add TimeSlot Form */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Thêm khung giờ mới
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Giờ bắt đầu
                                </label>
                                <input
                                  type="time"
                                  value={form.startTime}
                                  onChange={(e) =>
                                    updateTimeSlotForm(field.tempId, {
                                      startTime: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Giờ kết thúc
                                </label>
                                <input
                                  type="time"
                                  value={form.endTime}
                                  onChange={(e) =>
                                    updateTimeSlotForm(field.tempId, {
                                      endTime: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Giá (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  value={form.price}
                                  onChange={(e) =>
                                    updateTimeSlotForm(field.tempId, {
                                      price: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  min="0"
                                  step="1000"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  onClick={() => addTimeSlot(field.tempId)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  <FaPlus />
                                  Thêm
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* TimeSlots Table */}
                          {field.timeSlots.length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  Danh sách khung giờ
                                </h4>
                                {fieldsData.length > 1 && (
                                  <button
                                    onClick={() =>
                                      applyTimeSlotsToAll(field.tempId)
                                    }
                                    className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    <FaCopy />
                                    Áp dụng cho tất cả
                                  </button>
                                )}
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-300 px-4 py-2 text-left">
                                        Giờ bắt đầu
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-left">
                                        Giờ kết thúc
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-right">
                                        Giá
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-center">
                                        Thao tác
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sortTimeSlots(field.timeSlots).map(
                                      (slot) => {
                                        const isEditing =
                                          editingTimeSlot?.fieldTempId ===
                                            field.tempId &&
                                          editingTimeSlot?.slotTempId ===
                                            slot.tempId;

                                        return (
                                          <tr
                                            key={slot.tempId}
                                            className="hover:bg-gray-50"
                                          >
                                            {isEditing ? (
                                              <>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="time"
                                                    value={
                                                      editingSlotData.startTime
                                                    }
                                                    onChange={(e) =>
                                                      setEditingSlotData({
                                                        ...editingSlotData,
                                                        startTime:
                                                          e.target.value,
                                                      })
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="time"
                                                    value={
                                                      editingSlotData.endTime
                                                    }
                                                    onChange={(e) =>
                                                      setEditingSlotData({
                                                        ...editingSlotData,
                                                        endTime: e.target.value,
                                                      })
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="number"
                                                    value={
                                                      editingSlotData.price
                                                    }
                                                    onChange={(e) =>
                                                      setEditingSlotData({
                                                        ...editingSlotData,
                                                        price: e.target.value,
                                                      })
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                                                    min="0"
                                                    step="1000"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2 text-center">
                                                  <div className="flex items-center justify-center gap-1">
                                                    <button
                                                      onClick={saveEditTimeSlot}
                                                      className="text-green-600 hover:text-green-700 p-1"
                                                      title="Lưu"
                                                    >
                                                      <FaCheck />
                                                    </button>
                                                    <button
                                                      onClick={
                                                        cancelEditTimeSlot
                                                      }
                                                      className="text-gray-600 hover:text-gray-700 p-1"
                                                      title="Hủy"
                                                    >
                                                      <FaTimes />
                                                    </button>
                                                  </div>
                                                </td>
                                              </>
                                            ) : (
                                              <>
                                                <td className="border border-gray-300 px-4 py-2">
                                                  {slot.startTime}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                  {slot.endTime}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                  {slot.price.toLocaleString()}đ
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                  <div className="flex items-center justify-center gap-1">
                                                    <button
                                                      onClick={() =>
                                                        startEditTimeSlot(
                                                          field.tempId,
                                                          slot
                                                        )
                                                      }
                                                      className="text-blue-600 hover:text-blue-700 p-1"
                                                      title="Chỉnh sửa"
                                                    >
                                                      <FaPencilAlt />
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        removeTimeSlot(
                                                          field.tempId,
                                                          slot.tempId
                                                        )
                                                      }
                                                      className="text-red-600 hover:text-red-700 p-1"
                                                      title="Xóa"
                                                    >
                                                      <FaTrash />
                                                    </button>
                                                  </div>
                                                </td>
                                              </>
                                            )}
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500 text-sm">
                              Chưa có khung giờ nào. Hãy thêm khung giờ đầu
                              tiên!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Xác nhận thông tin</h2>

              {/* Complex Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  THÔNG TIN CỤM SÂN
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong>Tên:</strong>
                    </div>
                    <div>{complexData.name}</div>

                    <div>
                      <strong>Địa chỉ:</strong>
                    </div>
                    <div>{complexData.address}</div>

                    <div>
                      <strong>Tỉnh/Thành:</strong>
                    </div>
                    <div>
                      {provinces.find((p) => p.code === complexData.provinceCode)?.label || 'Chưa chọn'}
                    </div>

                    <div>
                      <strong>Phường/Xã:</strong>
                    </div>
                    <div>
                      {wardsCache[complexData.provinceCode]?.find((w) => w.code === complexData.wardCode)?.label || 'Chưa chọn'}
                    </div>

                    <div>
                      <strong>Giờ hoạt động:</strong>
                    </div>
                    <div>
                      {complexData.openingTime} - {complexData.closingTime}
                    </div>

                    {complexData.phoneNumber && (
                      <>
                        <div>
                          <strong>Điện thoại:</strong>
                        </div>
                        <div>{complexData.phoneNumber}</div>
                      </>
                    )}

                    {complexData.description && (
                      <>
                        <div>
                          <strong>Mô tả:</strong>
                        </div>
                        <div>{complexData.description}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fields List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  DANH SÁCH SÂN ({fieldsData.length} sân)
                </h3>
                <div className="space-y-4">
                  {fieldsData.map((field) => (
                    <div
                      key={field.tempId}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {field.name} - {field.fieldType}
                          </h4>
                          {field.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              Mô tả: {field.description}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {field.timeSlots.length} khung giờ
                        </span>
                      </div>

                      {field.timeSlots.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Khung giờ:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {field.timeSlots.map((slot) => (
                              <div
                                key={slot.tempId}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                              >
                                <span className="text-gray-700">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {slot.price.toLocaleString()}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📊 THỐNG KÊ
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Tổng số sân:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {fieldsData.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tổng số khung giờ:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {fieldsData.reduce(
                        (sum, f) => sum + f.timeSlots.length,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Lưu ý:</strong> Sau khi tạo, cụm sân sẽ ở trạng
                  thái <strong>Chờ duyệt</strong>. Admin sẽ xem xét và phê duyệt
                  trong thời gian sớm nhất.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              currentStep === 1
                ? navigate("/owner/complexes")
                : setCurrentStep(currentStep - 1)
            }
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FaArrowLeft />
            {currentStep === 1 ? "Hủy" : "Quay lại"}
          </button>

          <div className="text-sm text-gray-600">Bước {currentStep} / 4</div>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp theo
              <FaArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaCheck />
                  Tạo cụm sân
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Thêm nhiều sân nhanh</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng sân
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quickAddConfig.count}
                  onChange={(e) =>
                    setQuickAddConfig({
                      ...quickAddConfig,
                      count: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mẫu tên sân
                </label>
                <input
                  type="text"
                  value={quickAddConfig.namePattern}
                  onChange={(e) =>
                    setQuickAddConfig({
                      ...quickAddConfig,
                      namePattern: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Sân {number}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dùng {"{number}"} để đánh số tự động
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại sân chung
                </label>
                <select
                  value={quickAddConfig.fieldType}
                  onChange={(e) =>
                    setQuickAddConfig({
                      ...quickAddConfig,
                      fieldType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {FIELD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">
                  <strong>Xem trước:</strong> Sẽ tạo {quickAddConfig.count} sân
                  với tên từ "
                  {quickAddConfig.namePattern.replace(
                    "{number}",
                    fieldsData.length + 1
                  )}
                  " đến "
                  {quickAddConfig.namePattern.replace(
                    "{number}",
                    fieldsData.length + quickAddConfig.count
                  )}
                  "
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuickAddModal(false);
                  setQuickAddConfig({
                    count: 5,
                    namePattern: "Sân {number}",
                    fieldType: "Sân 5 người",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleQuickAdd}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thêm sân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexSetupWizard;
