import { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut, FiSettings, FiHeart } from "react-icons/fi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { useAuthStore } from "../../store";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const menuItems = [
    {
      icon: FiUser,
      label: "Thông tin cá nhân",
      onClick: () => {
        navigate("/profile");
        setIsOpen(false);
      },
    },
    {
      icon: HiOutlineClipboardList,
      label: "Lịch sử đặt sân",
      onClick: () => {
        navigate("/my-bookings");
        setIsOpen(false);
      },
    },
    {
      icon: FiHeart,
      label: "Sân yêu thích",
      onClick: () => {
        navigate("/favorites");
        setIsOpen(false);
      },
    },
    {
      icon: FiSettings,
      label: "Cài đặt",
      onClick: () => {
        navigate("/settings");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.firstName?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition"
              >
                <item.icon className="text-gray-600" size={18} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition text-red-600"
            >
              <FiLogOut size={18} />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
