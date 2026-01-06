import { MdBlock, MdClose, MdEmail, MdWarning } from "react-icons/md";

/**
 * AccountBlockedModal Component
 * Hiển thị modal thông báo khi tài khoản bị khóa/vô hiệu hóa
 */
export default function AccountBlockedModal({ isOpen, onClose, message, type = "banned" }) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === "banned") {
      return <MdBlock className="text-6xl text-red-600" />;
    } else if (type === "inactive") {
      return <MdWarning className="text-6xl text-yellow-600" />;
    } else {
      return <MdBlock className="text-6xl text-gray-600" />;
    }
  };

  const getTitle = () => {
    if (type === "banned") {
      return "Tài khoản bị khóa";
    } else if (type === "inactive") {
      return "Tài khoản chưa kích hoạt";
    } else {
      return "Không thể đăng nhập";
    }
  };

  const getBgColor = () => {
    if (type === "banned") {
      return "bg-red-100";
    } else if (type === "inactive") {
      return "bg-yellow-100";
    } else {
      return "bg-gray-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        {/* Header with close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center pb-4">
          <div className={`w-24 h-24 ${getBgColor()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {getTitle()}
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Contact info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <MdEmail className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">
                  Cần hỗ trợ?
                </p>
                <p className="text-blue-700">
                  Liên hệ: <a href="mailto:support@example.com" className="underline hover:text-blue-800">support@example.com</a>
                </p>
                <p className="text-blue-700">
                  Hotline: <a href="tel:1900xxxx" className="underline hover:text-blue-800">1900 xxxx</a>
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Đóng
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
