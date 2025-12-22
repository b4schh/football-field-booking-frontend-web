import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../../services/api';
import { useLocationStore } from '../../../store';
import { useFieldManagement } from './hooks/useFieldManagement';
import { useTimeSlotManagement } from './hooks/useTimeSlotManagement';
import ProgressBar from './components/ProgressBar';
import QuickAddModal from './components/QuickAddModal';
import Step1ComplexInfo from './steps/Step1ComplexInfo';

const ComplexSetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Complex data
  const [complexData, setComplexData] = useState({
    name: '',
    address: '',
    provinceCode: '',
    wardCode: '',
    phoneNumber: '',
    openingTime: '06:00',
    closingTime: '23:00',
    description: '',
  });

  // Field management
  const fieldManagement = useFieldManagement();
  const { fieldsData, setFieldsData } = fieldManagement;

  // TimeSlot management
  const timeSlotManagement = useTimeSlotManagement(fieldsData, setFieldsData);

  // Quick add modal
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  // Accordion state
  const [expandedFields, setExpandedFields] = useState([]);

  // Location store
  const {
    provinces,
    fetchProvinces,
    fetchWardsByProvince,
    isLoadingProvinces,
    isLoadingWards,
    wardsCache,
  } = useLocationStore();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const handleProvinceChange = async (provinceCode) => {
    setComplexData({ ...complexData, provinceCode, wardCode: '' });
    if (provinceCode) {
      await fetchWardsByProvince(provinceCode);
    }
  };

  const toggleFieldAccordion = (fieldTempId) => {
    if (expandedFields.includes(fieldTempId)) {
      setExpandedFields(expandedFields.filter((id) => id !== fieldTempId));
    } else {
      setExpandedFields([...expandedFields, fieldTempId]);
      timeSlotManagement.initTimeSlotForm(fieldTempId);
    }
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
        !fieldManagement.hasDuplicateFieldNames()
      );
    }
    if (currentStep === 3) {
      return fieldsData.every((f) => f.timeSlots.length > 0);
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const province = provinces.find((p) => p.code == complexData.provinceCode);
      const ward = wardsCache[complexData.provinceCode]?.find(
        (w) => w.code == complexData.wardCode
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

      const response = await api.post('/complexes/owner/bulk-setup', payload);

      if (response.data?.isSuccess) {
        setSuccess('Tạo cụm sân thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/owner/complexes');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo cụm sân nhanh</h1>
          <p className="text-gray-600">
            Tạo cụm sân với nhiều sân con và khung giờ tùy chỉnh
          </p>
        </div>

        <ProgressBar currentStep={currentStep} />

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
          {currentStep === 1 && (
            <Step1ComplexInfo
              complexData={complexData}
              setComplexData={setComplexData}
              provinces={provinces}
              wardsCache={wardsCache}
              isLoadingProvinces={isLoadingProvinces}
              isLoadingWards={isLoadingWards}
              handleProvinceChange={handleProvinceChange}
            />
          )}

          {/* TODO: Implement Step 2, 3, 4 components */}
          {currentStep === 2 && <div>Step 2 - Field Setup (TODO)</div>}
          {currentStep === 3 && <div>Step 3 - TimeSlot Setup (TODO)</div>}
          {currentStep === 4 && <div>Step 4 - Confirmation (TODO)</div>}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              currentStep === 1
                ? navigate('/owner/complexes')
                : setCurrentStep(currentStep - 1)
            }
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FaArrowLeft />
            {currentStep === 1 ? 'Hủy' : 'Quay lại'}
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
      <QuickAddModal
        show={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onAdd={(config) => {
          fieldManagement.handleQuickAdd(config);
          setShowQuickAddModal(false);
        }}
        fieldsCount={fieldsData.length}
      />
    </div>
  );
};

export default ComplexSetupWizard;
