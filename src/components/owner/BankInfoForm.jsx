import { useState, useEffect, useRef } from "react";
import bankListData from "../../constants/bank-list.json";
import ownerSettingsService from "../../services/ownerSettingsService";
import { useToast } from "../../store/toastStore";

/**
 * Component form để Owner cập nhật thông tin ngân hàng
 * - Chọn ngân hàng từ danh sách
 * - Nhập số tài khoản và tên chủ tài khoản
 * - Upload ảnh QR code
 */
const BankInfoForm = ({ onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const fileInputRef = useRef(null);
  const bankDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  const [errors, setErrors] = useState({});

  // Lấy danh sách ngân hàng từ file JSON
  const bankList = bankListData.data || [];

  // Lọc danh sách ngân hàng theo từ khóa tìm kiếm
  const filteredBanks = bankList.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load thông tin ngân hàng hiện tại (nếu có)
  useEffect(() => {
    loadCurrentBankInfo();
  }, []);

  // Handle click outside để đóng dropdown ngân hàng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setShowBankList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadCurrentBankInfo = async () => {
    try {
      setInitialLoading(true);
      const response = await ownerSettingsService.getSettings();
      
      if (response.data?.data) {
        const { bankName, bankAccountNumber, bankAccountName, bankQrCodeUrl } = response.data.data;
        
        setFormData({
          bankName: bankName || "",
          bankAccountNumber: bankAccountNumber || "",
          bankAccountName: bankAccountName || "",
        });

        // Set searchTerm để hiển thị ngân hàng đã chọn
        if (bankName) {
          setSearchTerm(bankName);
        }

        // Set preview cho QR code hiện tại
        if (bankQrCodeUrl) {
          const fullUrl = ownerSettingsService.getFullImageUrl(bankQrCodeUrl);
          setQrPreview(fullUrl);
        }
      }
    } catch (error) {
      console.error("Error loading bank info:", error);
      // Không hiển thị toast lỗi vì có thể chưa có dữ liệu
    } finally {
      setInitialLoading(false);
    }
  };

  const handleBankSelect = (bank) => {
    setFormData({
      ...formData,
      bankName: `${bank.shortName} - ${bank.name}`,
    });
    setSearchTerm(`${bank.shortName} - ${bank.name}`);
    setShowBankList(false);
    setErrors({ ...errors, bankName: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData({ ...formData, bankName: value });
    setShowBankList(true);
    setErrors({ ...errors, bankName: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    setQrFile(file);
    
    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setQrFile(null);
    setQrPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Vui lòng chọn ngân hàng";
    }

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = "Vui lòng nhập số tài khoản";
    } else if (!/^\d+$/.test(formData.bankAccountNumber)) {
      newErrors.bankAccountNumber = "Số tài khoản chỉ được chứa số";
    }

    if (!formData.bankAccountName.trim()) {
      newErrors.bankAccountName = "Vui lòng nhập tên chủ tài khoản";
    }

    if (!qrPreview) {
      newErrors.qrCodeImage = "Vui lòng upload ảnh QR code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName,
        qrCodeImage: qrFile, // Có thể null nếu không thay đổi
      };

      await ownerSettingsService.updateBankInfo(submitData);
      
      toast.success("Cập nhật thông tin ngân hàng thành công!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating bank info:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin ngân hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông báo quan trọng */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Quan trọng:</strong> Bạn cần cập nhật đầy đủ thông tin ngân hàng để các sân của bạn có thể hiển thị trên hệ thống.
            </p>
          </div>
        </div>
      </div>

      {/* Chọn ngân hàng */}
      <div className="relative" ref={bankDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngân hàng <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowBankList(true)}
            placeholder="Tìm kiếm ngân hàng..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.bankName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {showBankList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <img
                      src={bank.logo}
                      alt={bank.shortName}
                      className="w-10 h-10 object-contain mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{bank.shortName}</div>
                      <div className="text-sm text-gray-500">{bank.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">Không tìm thấy ngân hàng</div>
              )}
            </div>
          )}
        </div>
        {errors.bankName && (
          <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
        )}
      </div>

      {/* Số tài khoản */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="bankAccountNumber"
          value={formData.bankAccountNumber}
          onChange={handleInputChange}
          placeholder="Nhập số tài khoản"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.bankAccountNumber ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.bankAccountNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.bankAccountNumber}</p>
        )}
      </div>

      {/* Tên chủ tài khoản */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên chủ tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="bankAccountName"
          value={formData.bankAccountName}
          onChange={handleInputChange}
          placeholder="VD: NGUYEN VAN A"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase ${
            errors.bankAccountName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.bankAccountName && (
          <p className="mt-1 text-sm text-red-500">{errors.bankAccountName}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Tên chủ tài khoản phải giống với tên trên tài khoản ngân hàng (không dấu, viết hoa)
        </p>
      </div>

      {/* Upload QR Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh QR Code <span className="text-red-500">*</span>
        </label>
        
        {qrPreview ? (
          <div className="relative inline-block">
            <img
              src={qrPreview}
              alt="QR Code Preview"
              className="w-64 h-64 object-contain border-2 border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Chọn ảnh QR Code
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Hỗ trợ: JPG, PNG. Tối đa 5MB
            </p>
          </div>
        )}
        
        {errors.qrCodeImage && (
          <p className="mt-1 text-sm text-red-500">{errors.qrCodeImage}</p>
        )}
      </div>

      {/* Nút submit */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            "Lưu thông tin"
          )}
        </button>
      </div>
    </form>
  );
};

export default BankInfoForm;
