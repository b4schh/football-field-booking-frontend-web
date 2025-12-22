import React from 'react';

const Step1ComplexInfo = ({ complexData, setComplexData, provinces, wardsCache, isLoadingProvinces, isLoadingWards, handleProvinceChange }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Thông tin cụm sân</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên cụm sân <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={complexData.name}
          onChange={(e) => setComplexData({ ...complexData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: Sân bóng Thể Thao XYZ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={complexData.address}
          onChange={(e) => setComplexData({ ...complexData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Số nhà, tên đường"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-600">*</span>
          </label>
          <select
            value={complexData.provinceCode}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingProvinces}
          >
            <option value="">-- Chọn tỉnh/thành phố --</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã <span className="text-red-600">*</span>
          </label>
          <select
            value={complexData.wardCode}
            onChange={(e) => setComplexData({ ...complexData, wardCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={!complexData.provinceCode || isLoadingWards}
          >
            <option value="">-- Chọn phường/xã --</option>
            {(wardsCache[complexData.provinceCode] || []).map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          value={complexData.phoneNumber}
          onChange={(e) => setComplexData({ ...complexData, phoneNumber: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="0901234567"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
          <input
            type="time"
            value={complexData.openingTime}
            onChange={(e) => setComplexData({ ...complexData, openingTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
          <input
            type="time"
            value={complexData.closingTime}
            onChange={(e) => setComplexData({ ...complexData, closingTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={complexData.description}
          onChange={(e) => setComplexData({ ...complexData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Mô tả về cụm sân của bạn..."
        />
      </div>
    </div>
  );
};

export default Step1ComplexInfo;
