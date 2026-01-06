import PropTypes from "prop-types";
import { getBookingStatusLabel, getBookingStatusColor } from "../../utils/bookingHelpers";

/**
 * Booking Status Badge Component
 * Hiển thị trạng thái booking với màu sắc tương ứng
 */
export default function BookingStatusBadge({ status }) {
  const label = getBookingStatusLabel(status);
  const colorClasses = getBookingStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      {label}
    </span>
  );
}

BookingStatusBadge.propTypes = {
  status: PropTypes.number.isRequired,
};
