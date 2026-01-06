import { HiMenu } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../components/common/NotificationDropdown";

export default function DashboardHeader({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Get user role display name
  const getRoleDisplay = () => {
    if (!user?.roles || user.roles.length === 0) return "User";
    const role = user.roles[0];
    if (role === "Admin") return "Quản trị viên";
    if (role === "Owner") return "Chủ sân";
    if (role === "Customer") return "Khách hàng";
    return role;
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8">
      {/* Left: Menu toggle button for mobile */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <HiMenu className="text-2xl text-gray-700" />
      </button>

      {/* Right: Notification + User */}
      <div className="flex items-center gap-4">
        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
              <FiUser className="text-white text-lg" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-900">
                {user?.lastName} {user?.firstName} 
              </div>
              <div className="text-xs text-gray-500">{getRoleDisplay()}</div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.lastName} {user?.firstName}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to profile page
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Thông tin cá nhân
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
