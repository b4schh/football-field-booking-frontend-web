/**
 * Booking Status Constants and Helper Functions
 */

// Booking Status Enum (match backend)
export const BOOKING_STATUS = {
  PENDING: 0,              // Khách vừa tạo booking, chưa upload bill
  WAITING_FOR_APPROVAL: 1, // Khách đã upload bill, chờ chủ sân duyệt
  CONFIRMED: 2,            // Chủ sân đã duyệt cọc, giữ sân thành công
  REJECTED: 3,             // Chủ sân từ chối bill
  CANCELLED: 4,            // Khách hoặc chủ sân hủy booking
  COMPLETED: 5,            // Trận đấu đã diễn ra, thanh toán đầy đủ
  EXPIRED: 6,              // Hết thời gian giữ chỗ, khách không upload bill
  NO_SHOW: 7,              // Khách không đến sân
};

// Status labels
export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: "Chờ thanh toán",
  [BOOKING_STATUS.WAITING_FOR_APPROVAL]: "Chờ duyệt",
  [BOOKING_STATUS.CONFIRMED]: "Đã xác nhận",
  [BOOKING_STATUS.REJECTED]: "Bị từ chối",
  [BOOKING_STATUS.CANCELLED]: "Đã hủy",
  [BOOKING_STATUS.COMPLETED]: "Hoàn thành",
  [BOOKING_STATUS.EXPIRED]: "Hết hạn",
  [BOOKING_STATUS.NO_SHOW]: "Không đến",
};

// Status colors (Tailwind classes)
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [BOOKING_STATUS.WAITING_FOR_APPROVAL]: "bg-blue-100 text-blue-800 border-blue-200",
  [BOOKING_STATUS.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
  [BOOKING_STATUS.REJECTED]: "bg-red-100 text-red-800 border-red-200",
  [BOOKING_STATUS.CANCELLED]: "bg-gray-100 text-gray-800 border-gray-200",
  [BOOKING_STATUS.COMPLETED]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [BOOKING_STATUS.EXPIRED]: "bg-orange-100 text-orange-800 border-orange-200",
  [BOOKING_STATUS.NO_SHOW]: "bg-red-100 text-red-800 border-red-200",
};

/**
 * Get status label
 */
export const getBookingStatusLabel = (status) => {
  return BOOKING_STATUS_LABELS[status] || "Không xác định";
};

/**
 * Get status color classes
 */
export const getBookingStatusColor = (status) => {
  return BOOKING_STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (status) => {
  return [
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.WAITING_FOR_APPROVAL,
    BOOKING_STATUS.CONFIRMED,
  ].includes(status);
};

/**
 * Check if booking can be approved/rejected (owner)
 */
export const canModerateBooking = (status) => {
  return status === BOOKING_STATUS.WAITING_FOR_APPROVAL;
};

/**
 * Check if booking can be marked complete/no-show (owner)
 */
export const canMarkCompleteOrNoShow = (status, bookingDate) => {
  if (status !== BOOKING_STATUS.CONFIRMED) return false;
  
  // Only after booking date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const booking = new Date(bookingDate);
  booking.setHours(0, 0, 0, 0);
  
  return booking <= today;
};

/**
 * Get all status options for filter dropdown
 */
export const getAllBookingStatuses = () => {
  return Object.keys(BOOKING_STATUS).map((key) => ({
    value: BOOKING_STATUS[key],
    label: BOOKING_STATUS_LABELS[BOOKING_STATUS[key]],
  }));
};
