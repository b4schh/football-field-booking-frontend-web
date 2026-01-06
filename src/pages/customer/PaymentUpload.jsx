import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useBookingStore from "../../store/bookingStore";
import { useToast } from "../../store/toastStore";
import ownerSettingsService from "../../services/ownerSettingsService";
import PendingBookingView from "../../components/customer/PendingBookingView";
import BookingDetailView from "../../components/customer/BookingDetailView";

export default function PaymentUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { fetchBookingById } = useBookingStore();
  
  const [booking, setBooking] = useState(null);
  const [ownerBankInfo, setOwnerBankInfo] = useState(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    const result = await fetchBookingById(id);
    if (result.success) {
      const bookingData = result.data.data;
      setBooking(bookingData);
      
      // Lấy thông tin ngân hàng của owner
      if (bookingData.ownerId) {
        await loadOwnerBankInfo(bookingData.ownerId);
      }
    } else {
      toast.error("Không thể tải thông tin booking");
      navigate("/my-bookings");
    }
  };

  const loadOwnerBankInfo = async (ownerId) => {
    try {
      setLoadingBankInfo(true);
      const response = await ownerSettingsService.getOwnerBankInfo(ownerId);
      
      if (response.success && response.data) {
        setOwnerBankInfo(response.data);
      }
    } catch (error) {
      console.error("Error loading owner bank info:", error);
      // Không hiển thị toast lỗi vì không phải lỗi critical
      // Customer vẫn có thể upload bill dù không có QR
    } finally {
      setLoadingBankInfo(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Render appropriate view based on booking status
  const isPending = booking.bookingStatus === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 md:px-8 lg:px-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isPending ? "Thanh toán tiền cọc" : "Chi tiết đặt sân"}
          </h1>
          {isPending && <p className="text-gray-600 mt-2">Mã booking: #{booking.id}</p>}
        </div>

        {/* Conditionally render based on booking status */}
        {isPending ? (
          <PendingBookingView 
            booking={booking} 
            ownerBankInfo={ownerBankInfo}
            loadingBankInfo={loadingBankInfo}
          />
        ) : (
          <BookingDetailView booking={booking} />
        )}
      </div>
    </div>
  );
}
