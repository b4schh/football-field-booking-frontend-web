import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const Step4Confirmation = ({ complexData, fieldsData, provinces, wards, sortTimeSlots }) => {
  const selectedProvince = provinces.find((p) => p.code == complexData.provinceCode);
  const selectedWard = wards.find((w) => w.code == complexData.wardCode);

  const totalFields = fieldsData.length;
  const totalTimeSlots = fieldsData.reduce((acc, field) => acc + field.timeSlots.length, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Xác nhận thông tin cụm sân</h2>
      <p className="text-gray-600 mb-4">
        Vui lòng kiểm tra lại toàn bộ thông tin trước khi gửi yêu cầu.
      </p>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
        <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
        <div className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> Sau khi gửi, cụm sân sẽ ở trạng thái{' '}
          <strong>Chờ duyệt</strong>. Quản trị viên sẽ xem xét và phê duyệt cụm sân của bạn.
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{totalFields}</div>
          <div className="text-sm text-gray-600 mt-1">Tổng số sân</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{totalTimeSlots}</div>
          <div className="text-sm text-gray-600 mt-1">Tổng số khung giờ</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">
            {totalFields > 0 ? Math.round(totalTimeSlots / totalFields) : 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Khung giờ TB/sân</div>
        </div>
      </div>

      {/* Complex Info */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          Thông tin cụm sân
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Tên cụm sân</label>
            <p className="text-base text-gray-900 mt-1">{complexData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
            <p className="text-base text-gray-900 mt-1">{complexData.phone}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Địa chỉ</label>
            <p className="text-base text-gray-900 mt-1">
              {complexData.address}
              {selectedWard && `, ${selectedWard.value}`}
              {selectedProvince && `, ${selectedProvince.value}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Giờ mở cửa</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              {complexData.openingTime}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Giờ đóng cửa</label>
            <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              {complexData.closingTime}
            </p>
          </div>
          {complexData.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Mô tả</label>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                {complexData.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fields and TimeSlots */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          Chi tiết các sân và khung giờ
        </h3>
        <div className="space-y-4">
          {fieldsData.map((field, index) => (
            <div key={field.tempId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-base">
                    {index + 1}. {field.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">Loại sân: {field.fieldType}</p>
                  {field.description && (
                    <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    field.timeSlots.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {field.timeSlots.length} khung giờ
                </span>
              </div>

              {field.timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sortTimeSlots(field.timeSlots).map((slot) => (
                    <div
                      key={slot.tempId}
                      className="bg-white border border-gray-300 rounded p-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-green-600 font-semibold">
                          {slot.price.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-600 italic">Chưa có khung giờ nào.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final Check */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm text-blue-800">
        <strong>Kiểm tra lần cuối:</strong> Đảm bảo tất cả thông tin đã chính xác trước khi nhấn{' '}
        <strong>"Gửi yêu cầu"</strong>.
      </div>
    </div>
  );
};

export default Step4Confirmation;
