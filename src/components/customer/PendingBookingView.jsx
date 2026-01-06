import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiClock, FiAlertCircle, FiCheckCircle, FiImage } from "react-icons/fi";
import useBookingStore from "../../store/bookingStore";
import { useToast } from "../../store/toastStore";
import ownerSettingsService from "../../services/ownerSettingsService";
import BookingInfoCard from "./BookingInfoCard";

export default function PendingBookingView({ booking, ownerBankInfo, loadingBankInfo }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { uploadPaymentProof, isLoading } = useBookingStore();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Calculate remaining time
    const holdExpiresAt = new Date(booking.holdExpiresAt);
    const now = new Date();
    const diff = Math.max(0, Math.floor((holdExpiresAt - now) / 1000));
    setTimeRemaining(diff);
    
    if (diff === 0) {
      setIsExpired(true);
      toast.error("Booking đã hết hạn giữ chỗ.");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 3000);
    }
  }, [booking.holdExpiresAt, navigate, toast]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            toast.error("Booking đã hết hạn giữ chỗ. Vui lòng đặt lại sân.");
            setTimeout(() => {
              navigate("/my-bookings");
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining, navigate, toast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn ảnh bill thanh toán");
      return;
    }

    const formData = new FormData();
    formData.append("PaymentProofImage", selectedFile);
    if (paymentNote) {
      formData.append("PaymentNote", paymentNote);
    }

    const result = await uploadPaymentProof(booking.id, formData);
    
    if (result.success) {
      toast.success("Upload bill thành công! Chờ chủ sân duyệt.");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } else {
      toast.error(result.error || "Upload thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {/* Countdown Timer */}
      <div className={`mb-6 p-6 rounded-xl ${isExpired ? 'bg-red-50 border-2 border-red-500' : 'bg-orange-50 border-2 border-orange-500'}`}>
        <div className="flex items-center gap-4">
          <FiClock className={isExpired ? 'text-red-600' : 'text-orange-600'} size={32} />
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${isExpired ? 'text-red-900' : 'text-orange-900'}`}>
              {isExpired ? 'ĐÃ HẾT THỜI GIAN GIỮ CHỖ' : 'Thời gian còn lại'}
            </h3>
            {!isExpired && (
              <p className="text-orange-700 mt-1">
                Vui lòng upload bill trong{' '}
                <span className="font-mono text-2xl font-bold text-orange-600">{formatTime(timeRemaining)}</span>
              </p>
            )}
            {isExpired && (
              <p className="text-red-700 mt-1">
                Booking đã bị hủy tự động. Vui lòng đặt lại sân.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Payment Info */}
        <div className="space-y-6">
          {/* QR Code & Bank Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chuyển khoản</h2>
            
            {/* QR Code */}
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
              {loadingBankInfo ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : ownerBankInfo?.bankQrCodeUrl ? (
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                  <img
                    src={ownerSettingsService.getFullImageUrl(ownerBankInfo.bankQrCodeUrl)}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <FiImage size={48} className="mx-auto mb-2" />
                    <p className="text-sm">QR Code chưa có</p>
                    <p className="text-xs mt-1">Vui lòng chuyển khoản thủ công</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="text-sm text-gray-600">Ngân hàng: </span>
                <span className="font-semibold">{ownerBankInfo?.bankName || "Đang tải..."}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Số tài khoản: </span>
                <span className="font-mono font-bold">{ownerBankInfo?.bankAccountNumber || "Đang tải..."}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Chủ tài khoản: </span>
                <span className="font-semibold">{ownerBankInfo?.bankAccountName || booking.ownerName || "Đang tải..."}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Số tiền: </span>
                <span className="font-bold text-blue-600 text-lg">{formatPrice(booking.depositAmount)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Nội dung CK: </span>
                <span className="font-mono font-bold">DAT SAN {booking.id}</span>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <BookingInfoCard booking={booking} />
        </div>

        {/* Right - Upload Bill */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload bill chuyển khoản</h2>
            
            {/* Upload Area */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExpired}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiUpload className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600 font-medium">Click để chọn ảnh bill</p>
                <p className="text-sm text-gray-500 mt-1">Hỗ trợ: JPG, PNG (tối đa 5MB)</p>
              </button>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Xem trước:</p>
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{selectedFile?.name}</p>
              </div>
            )}

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú (không bắt buộc)
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Nhập ghi chú về thanh toán..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                maxLength={255}
                disabled={isExpired}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading || isExpired}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang upload...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle size={20} />
                  <span>Xác nhận đã chuyển khoản</span>
                </>
              )}
            </button>

            {/* Back to My Bookings Button */}
            <button
              onClick={() => navigate("/my-bookings")}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition mt-3"
            >
              Quay về danh sách booking
            </button>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Chụp rõ nội dung và số tiền chuyển khoản</li>
                    <li>Chủ sân sẽ duyệt trong vòng 24 giờ</li>
                    <li>Không hoàn tiền nếu hủy sau khi được duyệt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
