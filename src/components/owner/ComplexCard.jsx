import { MdStore, MdCheckCircle, MdCancel, MdPending } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ComplexStatusBadge from "./ComplexStatusBadge";
import ToggleSwitch from "./ToggleSwitch";
import { formatTimeSpan } from "../../utils/formatHelpers";

/**
 * Card hiển thị Complex trong danh sách
 * Hiển thị: Name, Address, Status, isActive, số Field
 */
export default function ComplexCard({ complex, onToggleActive }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/owner/complexes/${complex.id}`);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleActive(complex.id, !complex.isActive);
  };

  const getStatusIcon = () => {
    switch (complex.status) {
      case 1: return <MdCheckCircle className="text-green-600" />;
      case 2: return <MdCancel className="text-red-600" />;
      default: return <MdPending className="text-yellow-600" />;
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Header with icon */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4 text-white flex items-center gap-3">
        <MdStore className="text-3xl" />
        <div className="flex-1">
          <h3 className="text-lg font-bold">{complex.name}</h3>
          <p className="text-sm text-slate-200">{complex.phone || "Chưa có SĐT"}</p>
        </div>
        {getStatusIcon()}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Address */}
        <div className="text-sm text-gray-600">
          <p className="line-clamp-2">
            {[complex.street, complex.ward, complex.province].filter(Boolean).join(", ") || "Chưa có địa chỉ"}
          </p>
        </div>

        {/* Status and Active Toggle */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <ComplexStatusBadge status={complex.status} />
          <div onClick={(e) => e.stopPropagation()}>
            <ToggleSwitch
              enabled={complex.isActive}
              onChange={(enabled) => onToggleActive(complex.id, enabled)}
              label={complex.isActive ? "Đang hoạt động" : "Đã tắt"}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Tạo: {new Date(complex.createdAt).toLocaleDateString("vi-VN")}
          </span>
          <span className="text-gray-600">
            {complex.openingTime && complex.closingTime 
              ? `${formatTimeSpan(complex.openingTime)} - ${formatTimeSpan(complex.closingTime)}`
              : "Chưa đặt giờ"}
          </span>
        </div>
      </div>
    </div>
  );
}
