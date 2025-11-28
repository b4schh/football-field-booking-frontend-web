import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function DateRangePicker({ startDate, endDate, onDateRangeChange }) {
  const formatRange = () =>
    `${startDate.toLocaleDateString("vi-VN")} - ${endDate.toLocaleDateString("vi-VN")}`;

  const shift = (days) => {
    const ns = new Date(startDate);
    ns.setDate(ns.getDate() + days);
    const ne = new Date(ns); // Tạo endDate từ startDate mới
    ne.setDate(ne.getDate() + 6); // Luôn là 6 ngày sau startDate (tổng 7 ngày)
    console.log('DateRangePicker shift:', { 
      oldStart: startDate.toISOString().split('T')[0], 
      oldEnd: endDate.toISOString().split('T')[0],
      newStart: ns.toISOString().split('T')[0], 
      newEnd: ne.toISOString().split('T')[0] 
    });
    onDateRangeChange(ns, ne);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => shift(-7)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <FiChevronLeft size={20} />
      </button>

      <div className="min-w-[240px] text-center font-medium text-base">
        {formatRange()}
      </div>

      <button
        onClick={() => shift(7)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}
