import { useNavigate } from "react-router-dom";
import { MdSearchOff, MdHome, MdArrowBack } from "react-icons/md";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
            <MdSearchOff className="text-5xl text-slate-600" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          {/* 404 Number */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-slate-800">404</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Không tìm thấy trang
          </h2>
          
          <p className="text-gray-600 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>

          {/* Suggestions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Có thể bạn muốn:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Kiểm tra lại đường dẫn URL</li>
              <li>• Quay lại trang trước đó</li>
              <li>• Về trang chủ để tiếp tục</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              <MdArrowBack className="text-lg" />
              Quay lại
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
            >
              <MdHome className="text-lg" />
              Về trang chủ
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
}
