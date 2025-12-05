import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiImage, FiFileText, FiStar, FiEdit } from "react-icons/fi";
import BookingInfoCard from "./BookingInfoCard";
import ReviewForm from "./ReviewForm";
import { getPaymentProofUrl } from "../../utils/imageHelper";
import { getReviewByBookingId } from "../../services/reviewService";

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
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Check if user has already reviewed this booking
  useEffect(() => {
    const fetchUserReview = async () => {
      if (booking.bookingStatus === 5) { // Only for completed bookings
        setLoadingReview(true);
        try {
          const review = await getReviewByBookingId(booking.id);
          console.log(`[BookingDetailView] Review check for booking ${booking.id}:`, review ? 'Found' : 'Not found');
          setUserReview(review);
        } catch (error) {
          console.error("Failed to load user review:", error);
          setUserReview(null);
        } finally {
          setLoadingReview(false);
        }
      }
    };

    fetchUserReview();
  }, [booking.id, booking.bookingStatus]);

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

  const handleReviewSuccess = async () => {
    // Reload user review after successful submission
    try {
      const review = await getReviewByBookingId(booking.id);
      setUserReview(review);
    } catch (error) {
      console.error("Failed to reload user review:", error);
    }
  };

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

          {/* User Review Display - Show full review if exists */}
          {booking.bookingStatus === 5 && userReview && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Đánh giá của bạn</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <FiEdit size={16} />
                  Chỉnh sửa
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={20}
                      className={star <= userReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{userReview.rating}/5</span>
                <span className="text-sm text-gray-500">
                  • {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{userReview.comment}</p>

              {/* Images */}
              {userReview.images && userReview.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {userReview.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Review ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              {userReview.helpfulCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    👍 {userReview.helpfulCount} người thấy đánh giá này hữu ích
                  </p>
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

            {/* Review Button - Only for completed bookings */}
            {booking.bookingStatus === 5 && !loadingReview && !userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FiStar size={20} />
                Viết đánh giá
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          booking={booking}
          existingReview={userReview}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}
