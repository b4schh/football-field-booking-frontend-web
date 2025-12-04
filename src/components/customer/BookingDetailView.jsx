import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiImage, FiFileText } from "react-icons/fi";
import BookingInfoCard from "./BookingInfoCard";
import { getPaymentProofUrl } from "../../utils/imageHelper";

const BOOKING_STATUS = {
  0: { label: "Chờ upload bill", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: FiClock },
  1: { label: "Chờ duyệt", color: "bg-blue-100 text-blue-800 border-blue-300", icon: FiClock },
  2: { label: "Đã xác nhận", color: "bg-green-100 text-green-800 border-green-300", icon: FiCheckCircle },
  3: { label: "Bị từ chối", color: "bg-red-100 text-red-800 border-red-300", icon: FiXCircle },
  4: { label: "Đã hủy", color: "bg-gray-100 text-gray-800 border-gray-300", icon: FiXCircle },
  5: { label: "Hoàn thành", color: "bg-purple-100 text-purple-800 border-purple-300", icon: FiCheckCircle },
  6: { label: "Hết hạn", color: "bg-orange-100 text-orange-800 border-orange-300", icon: FiAlertCircle },
  7: { label: "Không đến", color: "bg-red-100 text-red-800 border-red-300", icon: FiXCircle }
};

export default function BookingDetailView({ booking }) {
  const navigate = useNavigate();
  const status = BOOKING_STATUS[booking.bookingStatus] || BOOKING_STATUS[0];
  const StatusIcon = status.icon;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusMessage = () => {
    switch (booking.bookingStatus) {
      case 1:
        return {
          type: "info",
          title: "Đang chờ chủ sân duyệt",
          message: "Bill thanh toán của bạn đã được gửi đi. Chủ sân sẽ xác nhận trong vòng 24 giờ.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-500",
          textColor: "text-blue-800"
        };
      case 2:
        return {
          type: "success",
          title: "Booking đã được xác nhận",
          message: "Chủ sân đã xác nhận đặt sân của bạn. Vui lòng đến đúng giờ và thanh toán phần còn lại tại sân.",
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
          textColor: "text-green-800"
        };
      case 3:
        return {
          type: "error",
          title: "Booking bị từ chối",
          message: booking.rejectionReason || "Chủ sân đã từ chối đặt sân của bạn. Vui lòng liên hệ để biết thêm chi tiết.",
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
          textColor: "text-red-800"
        };
      case 4:
        return {
          type: "warning",
          title: "Booking đã bị hủy",
          message: "Đặt sân này đã bị hủy.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-500",
          textColor: "text-gray-800"
        };
      case 5:
        return {
          type: "success",
          title: "Booking đã hoàn thành",
          message: "Cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-500",
          textColor: "text-purple-800"
        };
      case 6:
        return {
          type: "warning",
          title: "Booking đã hết hạn",
          message: "Thời gian giữ chỗ đã hết. Booking đã bị hủy tự động.",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-500",
          textColor: "text-orange-800"
        };
      case 7:
        return {
          type: "error",
          title: "Không đến",
          message: "Bạn đã không đến theo lịch đặt.",
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
          textColor: "text-red-800"
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <>
      {/* Status Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.color} flex items-center gap-2`}>
            <StatusIcon size={18} />
            {status.label}
          </span>
          <span className="text-gray-600">Mã booking: #{booking.id}</span>
        </div>
        
        {statusMessage && (
          <div className={`p-6 rounded-xl border-l-4 ${statusMessage.borderColor} ${statusMessage.bgColor}`}>
            <div className="flex items-start gap-3">
              <StatusIcon className={statusMessage.textColor} size={24} />
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${statusMessage.textColor} mb-1`}>
                  {statusMessage.title}
                </h3>
                <p className={`${statusMessage.textColor} text-sm`}>
                  {statusMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          <BookingInfoCard booking={booking} />

          {/* Payment Proof (if uploaded) */}
          {booking.paymentProofUrl && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bill đã upload</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FiImage className="text-blue-600" size={24} />
                  <span className="font-semibold text-gray-900">Ảnh chuyển khoản</span>
                </div>
                <img
                  src={getPaymentProofUrl(booking.paymentProofUrl)}
                  alt="Payment proof"
                  className="w-full max-h-96 object-contain bg-white rounded-lg border border-gray-300"
                />
              </div>
              {booking.paymentNote && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiFileText className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Ghi chú thanh toán</div>
                      <div className="text-gray-900">{booking.paymentNote}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử trạng thái</h2>
            <div className="space-y-4">
              {booking.createdAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 rounded-full p-2">
                      <FiCheckCircle className="text-white" size={16} />
                    </div>
                    {booking.uploadedAt && <div className="w-0.5 h-full bg-blue-300 mt-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold text-gray-900">Tạo booking</div>
                    <div className="text-sm text-gray-600">{formatDateTime(booking.createdAt)}</div>
                  </div>
                </div>
              )}

              {booking.uploadedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 rounded-full p-2">
                      <FiCheckCircle className="text-white" size={16} />
                    </div>
                    {booking.confirmedAt && <div className="w-0.5 h-full bg-blue-300 mt-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold text-gray-900">Upload bill</div>
                    <div className="text-sm text-gray-600">{formatDateTime(booking.uploadedAt)}</div>
                  </div>
                </div>
              )}

              {booking.confirmedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-green-600 rounded-full p-2">
                      <FiCheckCircle className="text-white" size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Xác nhận</div>
                    <div className="text-sm text-gray-600">{formatDateTime(booking.confirmedAt)}</div>
                  </div>
                </div>
              )}

              {booking.rejectedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-red-600 rounded-full p-2">
                      <FiXCircle className="text-white" size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Từ chối</div>
                    <div className="text-sm text-gray-600">{formatDateTime(booking.rejectedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
            <button
              onClick={() => navigate("/my-bookings")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Quay về danh sách
            </button>
            
            {booking.bookingStatus === 2 && (
              <button
                onClick={() => navigate("/")}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition"
              >
                Đặt sân khác
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
