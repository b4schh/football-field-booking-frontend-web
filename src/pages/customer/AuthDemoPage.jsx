import { useAuthStore } from "../../store";
import ProtectedActionDemo from "../../components/customer/ProtectedActionDemo";

export default function AuthDemoPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 Demo Hệ thống Xác thực
          </h1>
          <p className="text-gray-600">
            Kiểm tra các chức năng đăng nhập, đăng ký và protected actions
          </p>
        </div>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Trạng thái đăng nhập
          </h2>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user?.firstName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm text-green-600 font-medium">
                  ✅ Đã đăng nhập
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg">?</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Chưa đăng nhập</p>
                <p className="text-sm text-gray-600">
                  Click vào icon User ở header để đăng nhập
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Protected Actions Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ProtectedActionDemo />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 Hướng dẫn sử dụng
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>1.</strong> Click vào icon <strong>User</strong> ở góc
              phải header để mở popup đăng nhập
            </li>
            <li>
              <strong>2.</strong> Có thể chuyển đổi giữa{" "}
              <strong>Đăng nhập</strong> và <strong>Đăng ký</strong>
            </li>
            <li>
              <strong>3.</strong> Sau khi đăng nhập, icon User sẽ chuyển thành{" "}
              <strong>Avatar</strong> với menu dropdown
            </li>
            <li>
              <strong>4.</strong> Thử click các button{" "}
              <strong>Protected Action</strong> ở trên khi chưa đăng nhập
            </li>
            <li>
              <strong>5.</strong> Popup sẽ tự động mở và sau khi đăng nhập,
              action sẽ được thực hiện
            </li>
          </ul>
        </div>

        {/* Test Accounts */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🧪 Tài khoản test
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4 border">
              <p className="font-medium text-gray-700">Customer</p>
              <p className="text-sm text-gray-600 mt-1">
                Email: <code className="bg-gray-100 px-2 py-1 rounded">customer@test.com</code>
              </p>
              <p className="text-sm text-gray-600">
                Password: <code className="bg-gray-100 px-2 py-1 rounded">Password@123</code>
              </p>
            </div>
            <div className="bg-white rounded p-4 border">
              <p className="font-medium text-gray-700">Owner</p>
              <p className="text-sm text-gray-600 mt-1">
                Email: <code className="bg-gray-100 px-2 py-1 rounded">owner@test.com</code>
              </p>
              <p className="text-sm text-gray-600">
                Password: <code className="bg-gray-100 px-2 py-1 rounded">Password@123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✨ Tính năng đã hoàn thành
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Popup đăng nhập/đăng ký
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Validation form đầy đủ
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Chuyển đổi Login ↔ Register
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Protected Actions wrapper
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                User menu dropdown
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Persist session với Zustand
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Tự động gọi callback sau login
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Token management tự động
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
