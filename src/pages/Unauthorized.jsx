import { useNavigate } from "react-router-dom";
import { MdLock, MdHome, MdArrowBack } from "react-icons/md";

export default function Unauthorized({ userRole, requiredRoles }) {
  const navigate = useNavigate();

  const getRoleName = (role) => {
    const roleNames = {
      'Admin': 'Quản trị viên',
      'Owner': 'Chủ sân',
      'Customer': 'Khách hàng'
    };
    return roleNames[role] || role;
  };

  const getHomePath = () => {
    if (userRole === 'Admin') return '/admin';
    if (userRole === 'Owner') return '/owner';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <MdLock className="text-5xl text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Không có quyền truy cập
          </h1>
          
          <p className="text-gray-600 mb-2">
            Bạn không có quyền truy cập vào trang này.
          </p>

          {userRole && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Vai trò hiện tại:</span> {getRoleName(userRole)}
              </p>
              {requiredRoles && requiredRoles.length > 0 && (
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-semibold">Yêu cầu:</span>{' '}
                  {requiredRoles.map(getRoleName).join(', ')}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>

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
              onClick={() => navigate(getHomePath())}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
            >
              <MdHome className="text-lg" />
              Về trang chủ
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Mã lỗi: 403 - Forbidden
        </p>
      </div>
    </div>
  );
}
