import { useState, useEffect, useMemo } from "react";
import DateRangePicker from "./DateRangePicker";
import useBookingDraftStore from "../../store/bookingDraftStore";
import useComplexStore from "../../store/complexStore";
import { useParams } from "react-router-dom";

export default function FieldSchedule({ complexData }) {
  const { id } = useParams();
  const { availabilityData, fetchAvailability, isAvailabilityLoading } =
    useComplexStore();

  // State quản lý ngày
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [endDate, setEndDate] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  });

  // State chọn sân và khung giờ
  const [selectedFieldFilter, setSelectedFieldFilter] = useState("all");
  const [timeFrame, setTimeFrame] = useState("morning"); // morning / afternoon

  // Booking draft store
  const {
    selectedSlot,
    selectedField: draftField,
    selectedDate: draftDate,
    setBookingDraft,
    clearBookingDraft,
  } = useBookingDraftStore();

  // Format ngày cho API (yyyy-MM-dd)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch availability khi component mount
  useEffect(() => {
    if (id) {
      fetchAvailability(id, formatDateForAPI(startDate), 7);
    }
    // eslint-disable-next-line
  }, [id]);

  // Xử lý thay đổi khoảng ngày
  const handleDateRangeChange = (newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    
    if (id) {
      fetchAvailability(id, formatDateForAPI(newStart), 7);
    }
  };

  // Lấy danh sách tất cả time slots từ availability data
  const allTimeSlots = useMemo(() => {
    if (!availabilityData?.days?.length) return [];
    
    // Lấy time slots từ ngày đầu tiên và sort
    return [...availabilityData.days[0].timeSlots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [availabilityData]);

  // Filter time slots theo khung giờ (sáng/chiều)
  const filteredTimeSlots = useMemo(() => {
    return allTimeSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0], 10);
      return timeFrame === "morning" ? hour < 12 : hour >= 12;
    });
  }, [allTimeSlots, timeFrame]);

  // Format functions
  const formatTime = (timeString) => timeString.slice(0, 5);
  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  
  const getDayLabel = (date) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return days[date.getDay()];
  };
  
  const formatDate = (date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Parse date string sang Date object
  // Fix: Tạo Date ở local timezone, không bị ảnh hưởng bởi UTC conversion
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    // Tạo Date với local timezone (giờ Việt Nam)
    const date = new Date(year, month - 1, day);
    // Set thời gian về đầu ngày để tránh lỗi timezone
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Xử lý click vào slot
  const handleSlotClick = (fieldAvailability, dayData, timeSlotData) => {
    if (fieldAvailability.isPast || fieldAvailability.isBooked) return;
    
    const date = parseDate(dayData.date);
    
    // Tạo object field với đầy đủ thông tin từ availability data
    const field = {
      id: fieldAvailability.fieldId,
      name: fieldAvailability.fieldName,
      fieldType: fieldAvailability.fieldSize || 'Không rõ', // Dùng fieldSize từ API
      surfaceType: fieldAvailability.surfaceType,
    };
    
    // Tạo object timeSlot với đầy đủ thông tin
    const timeSlot = {
      id: fieldAvailability.timeSlotId,
      price: fieldAvailability.price,
      startTime: timeSlotData.startTime,
      endTime: timeSlotData.endTime,
    };
    
    // Debug: Log thông tin slot được chọn
    console.group('🎯 SLOT CLICKED - Debug Info');
    console.log('📅 Date:', dayData.date, '→', date);
    console.log('⚽ Field:', field);
    console.log('⏰ TimeSlot:', timeSlot);
    console.log('📦 Field Availability:', fieldAvailability);
    console.log('🏟️  Complex Data:', complexData);
    
    // Payload sẽ được gửi lên (dự kiến)
    const expectedPayload = {
      fieldId: field.id,
      timeSlotId: timeSlot.id,
      bookingDate: dayData.date, // Format: yyyy-MM-dd
      // Thông tin bổ sung (không gửi lên nhưng dùng để hiển thị)
      _meta: {
        fieldName: field.name,
        fieldType: field.fieldType,
        price: timeSlot.price,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        complexId: id,
        complexName: complexData?.name,
      }
    };
    console.log('📤 Expected Payload:', expectedPayload);
    console.groupEnd();
    
    // Check nếu đang chọn cùng 1 slot thì clear
    const isSame =
      draftField?.id === field.id &&
      draftDate?.getTime() === date.getTime() &&
      selectedSlot?.id === timeSlot.id;
    
    if (isSame) {
      console.log('❌ Deselecting slot');
      clearBookingDraft();
    } else {
      console.log('✅ Selecting slot and saving to draft store');
      setBookingDraft(field, timeSlot, date, complexData);
    }
  };

  // Render slot cell
  const renderSlotCell = (dayData, timeSlot) => {
    // Tìm time slot tương ứng trong ngày
    const slotData = dayData.timeSlots.find(
      (s) => s.startTime === timeSlot.startTime && s.endTime === timeSlot.endTime
    );
    
    if (!slotData) {
      return <div className="text-xs text-gray-400">-</div>;
    }

    // Filter fields theo selectedFieldFilter
    let fieldsToShow = slotData.fields;
    if (selectedFieldFilter !== "all") {
      fieldsToShow = fieldsToShow.filter((f) => f.fieldId === Number(selectedFieldFilter));
    }

    if (fieldsToShow.length === 0) {
      return <div className="text-xs text-gray-400">-</div>;
    }

    return (
      <div className="flex flex-col gap-1">
        {fieldsToShow.map((fieldAvail) => {
          const isPast = fieldAvail.isPast;
          const isBooked = fieldAvail.isBooked;
          const available = !isPast && !isBooked;
          
          const date = parseDate(dayData.date);
          const isSelected =
            draftField?.id === fieldAvail.fieldId &&
            draftDate?.getTime() === date.getTime() &&
            selectedSlot?.id === fieldAvail.timeSlotId;

          return (
            <button
              key={fieldAvail.fieldId}
              disabled={!available}
              onClick={() => handleSlotClick(fieldAvail, dayData, slotData)}
              className={`
                px-3 py-2 rounded-lg text-xs transition-all font-medium w-full
                ${
                  isSelected
                    ? "bg-blue-600 text-white border border-blue-700"
                    : available
                    ? "bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }
              `}
            >
              <div>
                {available
                  ? formatPrice(fieldAvail.price)
                  : isPast
                  ? "Quá giờ"
                  : "Hết chỗ"}
              </div>
              {selectedFieldFilter === "all" && (
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {fieldAvail.fieldName}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white rounded-xl p-6">
      {/* Header với DateRangePicker và Time Frame buttons */}
      <div className="flex items-center justify-between mb-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTimeFrame("morning")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              timeFrame === "morning"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Khung sáng
          </button>
          <button
            onClick={() => setTimeFrame("afternoon")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              timeFrame === "afternoon"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Khung chiều
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isAvailabilityLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải lịch sân...</p>
        </div>
      )}

      {/* No data state */}
      {!isAvailabilityLoading &&
        (!availabilityData || !availabilityData.days || availabilityData.days.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu lịch sân
          </div>
        )}

      {/* Field filter dropdown */}
      {!isAvailabilityLoading && availabilityData?.days?.length > 0 && (
        <div className="mb-4 relative w-48">
          <select
            value={selectedFieldFilter}
            onChange={(e) => setSelectedFieldFilter(e.target.value)}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              appearance-none pr-10
            "
          >
            <option value="all">Tất cả sân</option>
            {complexData?.fields?.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Schedule table */}
      {!isAvailabilityLoading &&
        availabilityData?.days?.length > 0 &&
        filteredTimeSlots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table header */}
              <thead>
                <tr>
                  <th className="border bg-gray-50 p-3 text-left font-semibold sticky left-0 z-10">
                    Ngày
                  </th>
                  {filteredTimeSlots.map((slot, idx) => (
                    <th
                      key={idx}
                      className="border bg-gray-50 p-3 text-center min-w-[140px] font-semibold"
                    >
                      <div>{formatTime(slot.startTime)}</div>
                      <div className="text-xs font-normal text-gray-500">
                        {formatTime(slot.endTime)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {availabilityData.days.map((dayData, dayIdx) => {
                  const date = parseDate(dayData.date);
                  
                  return (
                    <tr key={dayIdx}>
                      {/* Date column */}
                      <td className="border p-3 bg-gray-50 sticky left-0 z-10">
                        <div className="font-medium">{getDayLabel(date)}</div>
                        <div className="text-xs text-gray-500">{formatDate(date)}</div>
                      </td>

                      {/* Time slot columns */}
                      {filteredTimeSlots.map((timeSlot, slotIdx) => (
                        <td key={slotIdx} className="border p-2 align-top">
                          {renderSlotCell(dayData, timeSlot)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
