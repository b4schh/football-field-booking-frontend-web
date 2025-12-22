import React from 'react';
import { FaTimes, FaPlus, FaBolt, FaTrash } from 'react-icons/fa';
import { FIELD_TYPE_OPTIONS } from '../constants';

const Step2FieldSetup = ({
  fieldsData,
  addField,
  removeField,
  updateField,
  hasDuplicateFieldNames,
  getDuplicateFieldNames,
  isFieldNameDuplicate,
  setShowQuickAddModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Thiết lập sân ({fieldsData.length} sân)</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <FaBolt />
            Thêm nhiều sân
          </button>
          <button
            onClick={addField}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FaPlus />
            Thêm 1 sân
          </button>
        </div>
      </div>

      {hasDuplicateFieldNames() && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <FaTimes className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium">Tên sân bị trùng lặp!</p>
            <p className="text-red-700 text-sm mt-1">
              Các tên bị trùng: <strong>{getDuplicateFieldNames().join(', ')}</strong>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {fieldsData.map((field, index) => {
          const isDuplicate = isFieldNameDuplicate(field.name);
          return (
            <div
              key={field.tempId}
              className={`border rounded-lg p-4 transition-colors ${
                isDuplicate
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Sân #{index + 1}</span>
                {fieldsData.length > 1 && (
                  <button
                    onClick={() => removeField(field.tempId)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Xóa sân"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sân <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.tempId, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ví dụ: Sân 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại sân
                  </label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => updateField(field.tempId, { fieldType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {FIELD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={field.description}
                    onChange={(e) =>
                      updateField(field.tempId, { description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                    placeholder="Mô tả về sân..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step2FieldSetup;
