import { FIELD_TYPE_OPTIONS, DEFAULT_QUICK_ADD_CONFIG } from '../constants';

const QuickAddModal = ({ show, onClose, onAdd, fieldsCount }) => {
  const [config, setConfig] = React.useState(DEFAULT_QUICK_ADD_CONFIG);

  const handleAdd = () => {
    onAdd(config);
    onClose();
    setConfig(DEFAULT_QUICK_ADD_CONFIG);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Thêm nhiều sân nhanh</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng sân</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.count}
              onChange={(e) =>
                setConfig({
                  ...config,
                  count: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu tên sân</label>
            <input
              type="text"
              value={config.namePattern}
              onChange={(e) =>
                setConfig({
                  ...config,
                  namePattern: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Sân {number}"
            />
            <p className="text-xs text-gray-500 mt-1">Dùng {'{number}'} để đánh số tự động</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại sân chung</label>
            <select
              value={config.fieldType}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fieldType: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {FIELD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm text-gray-700">
              <strong>Xem trước:</strong> Sẽ tạo {config.count} sân với tên từ "
              {config.namePattern.replace('{number}', fieldsCount + 1)}" đến "
              {config.namePattern.replace('{number}', fieldsCount + config.count)}"
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              onClose();
              setConfig(DEFAULT_QUICK_ADD_CONFIG);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Thêm sân
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
