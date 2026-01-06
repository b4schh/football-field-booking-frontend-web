import { useState } from "react";
import BankInfoForm from "../../components/owner/BankInfoForm";

/**
 * Trang cài đặt cho Owner
 * - Cập nhật thông tin ngân hàng
 * - Upload QR code
 */
const OwnerSettings = () => {
  const [activeTab, setActiveTab] = useState("bank");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin tài khoản và cài đặt của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("bank")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "bank"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Thông tin ngân hàng
                </div>
              </button>
              
              {/* Có thể thêm tabs khác sau này */}
              {/* <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "general"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Cài đặt chung
                </div>
              </button> */}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "bank" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Thông tin ngân hàng
                  </h2>
                  <p className="text-gray-600">
                    Cập nhật thông tin tài khoản ngân hàng để nhận thanh toán từ khách hàng.
                    Thông tin này sẽ được sử dụng để tạo mã QR thanh toán.
                  </p>
                </div>

                <BankInfoForm 
                  onSuccess={() => {
                    // Có thể reload hoặc chuyển trang
                  }}
                />
              </div>
            )}

            {activeTab === "general" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Cài đặt chung
                  </h2>
                  <p className="text-gray-600">
                    Cấu hình các thông số mặc định cho sân của bạn
                  </p>
                </div>
                
                {/* Form cài đặt chung - có thể implement sau */}
                <div className="text-center py-12 text-gray-500">
                  Chức năng đang được phát triển
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin hỗ trợ */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Sau khi cập nhật thông tin ngân hàng thành công, 
                các sân của bạn sẽ được hiển thị trên hệ thống. Nếu gặp vấn đề, 
                vui lòng liên hệ bộ phận hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;
