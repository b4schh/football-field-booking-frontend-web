import React from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaCopy,
  FaPencilAlt,
  FaTrash,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

const Step3TimeSlotSetup = ({
  fieldsData,
  expandedFields,
  toggleFieldAccordion,
  timeSlotForms,
  updateTimeSlotForm,
  addTimeSlot,
  removeTimeSlot,
  applyTimeSlotsToAll,
  sortTimeSlots,
  editingTimeSlot,
  editingSlotData,
  setEditingSlotData,
  startEditTimeSlot,
  cancelEditTimeSlot,
  saveEditTimeSlot,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Thiết lập khung giờ cho từng sân</h2>
      <p className="text-gray-600 mb-4">
        Thêm khung giờ cho từng sân. Bạn có thể thêm khung giờ cho một sân và áp dụng cho tất cả
        các sân còn lại.
      </p>

      <div className="space-y-3">
        {fieldsData.map((field) => {
          const isExpanded = expandedFields.includes(field.tempId);
          const form = timeSlotForms[field.tempId] || {
            startTime: '06:00',
            endTime: '08:00',
            price: 200000,
          };

          return (
            <div
              key={field.tempId}
              className="border border-gray-300 rounded-lg overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleFieldAccordion(field.tempId)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <FaChevronUp className="text-blue-600" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">{field.name}</span>
                  <span className="text-sm text-gray-600">- {field.fieldType}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    field.timeSlots.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {field.timeSlots.length} khung giờ
                </span>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  {/* Add TimeSlot Form */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Thêm khung giờ mới</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giờ bắt đầu
                        </label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) =>
                            updateTimeSlotForm(field.tempId, { startTime: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giờ kết thúc
                        </label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) =>
                            updateTimeSlotForm(field.tempId, { endTime: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá (VNĐ)
                        </label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) =>
                            updateTimeSlotForm(field.tempId, { price: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => addTimeSlot(field.tempId)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <FaPlus />
                          Thêm
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TimeSlots Table */}
                  {field.timeSlots.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Danh sách khung giờ</h4>
                        {fieldsData.length > 1 && (
                          <button
                            onClick={() => applyTimeSlotsToAll(field.tempId)}
                            className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FaCopy />
                            Áp dụng cho tất cả
                          </button>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">
                                Giờ bắt đầu
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left">
                                Giờ kết thúc
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Giá</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortTimeSlots(field.timeSlots).map((slot) => {
                              const isEditing =
                                editingTimeSlot?.fieldTempId === field.tempId &&
                                editingTimeSlot?.slotTempId === slot.tempId;

                              return (
                                <tr key={slot.tempId} className="hover:bg-gray-50">
                                  {isEditing ? (
                                    <>
                                      <td className="border border-gray-300 px-2 py-2">
                                        <input
                                          type="time"
                                          value={editingSlotData.startTime}
                                          onChange={(e) =>
                                            setEditingSlotData({
                                              ...editingSlotData,
                                              startTime: e.target.value,
                                            })
                                          }
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-2 py-2">
                                        <input
                                          type="time"
                                          value={editingSlotData.endTime}
                                          onChange={(e) =>
                                            setEditingSlotData({
                                              ...editingSlotData,
                                              endTime: e.target.value,
                                            })
                                          }
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-2 py-2">
                                        <input
                                          type="number"
                                          value={editingSlotData.price}
                                          onChange={(e) =>
                                            setEditingSlotData({
                                              ...editingSlotData,
                                              price: e.target.value,
                                            })
                                          }
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                                          min="0"
                                          step="1000"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-2 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={saveEditTimeSlot}
                                            className="text-green-600 hover:text-green-700 p-1"
                                            title="Lưu"
                                          >
                                            <FaCheck />
                                          </button>
                                          <button
                                            onClick={cancelEditTimeSlot}
                                            className="text-gray-600 hover:text-gray-700 p-1"
                                            title="Hủy"
                                          >
                                            <FaTimes />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="border border-gray-300 px-4 py-2">
                                        {slot.startTime}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2">
                                        {slot.endTime}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-right">
                                        {slot.price.toLocaleString()}đ
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() =>
                                              startEditTimeSlot(field.tempId, slot)
                                            }
                                            className="text-blue-600 hover:text-blue-700 p-1"
                                            title="Chỉnh sửa"
                                          >
                                            <FaPencilAlt />
                                          </button>
                                          <button
                                            onClick={() =>
                                              removeTimeSlot(field.tempId, slot.tempId)
                                            }
                                            className="text-red-600 hover:text-red-700 p-1"
                                            title="Xóa"
                                          >
                                            <FaTrash />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Chưa có khung giờ nào. Hãy thêm khung giờ đầu tiên!
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step3TimeSlotSetup;
