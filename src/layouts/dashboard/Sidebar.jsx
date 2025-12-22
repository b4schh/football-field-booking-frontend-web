import { NavLink, useNavigate } from "react-router-dom";
import { 
  MdDashboard, 
  MdStore, 
  MdSportsSoccer,
  MdSchedule,
  MdBookOnline,
  MdPeople,
  MdSettings,
  MdLogout,
  MdImage,
  MdAccessTime,
  MdAdminPanelSettings
} from "react-icons/md";
import { useAuthStore } from "../../store";

// Menu config cho từng role
const menuConfig = {
  owner: [
    { path: "/owner/dashboard", label: "Dashboard", icon: MdDashboard },
    { path: "/owner/complexes", label: "Quản lý cụm sân", icon: MdStore },
    { path: "/owner/fields", label: "Quản lý sân", icon: MdSportsSoccer },
    { path: "/owner/timeslots", label: "Quản lý khung giờ", icon: MdAccessTime },
    { path: "/owner/bookings", label: "Quản lý đặt sân", icon: MdBookOnline },
    { path: "/owner/images", label: "Quản lý ảnh", icon: MdImage },
    { path: "/owner/settings", label: "Cài đặt", icon: MdSettings },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
    { path: "/admin/users", label: "Quản lý người dùng", icon: MdPeople },
    { path: "/admin/complexes", label: "Quản lý cụm sân", icon: MdStore },
    { path: "/admin/fields", label: "Quản lý sân", icon: MdSportsSoccer },
    { path: "/admin/bookings", label: "Quản lý đặt sân", icon: MdBookOnline },
    { path: "/admin/settings", label: "Cấu hình hệ thống", icon: MdAdminPanelSettings },
  ]
};

export default function Sidebar({ role, collapsed, onToggle }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = menuConfig[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-800 text-white transition-all duration-300 z-40 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white">
            <img
              src="/src/assets/img/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold">DATSAN247</span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : ''}
            >
              <Icon className="text-xl flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-slate-700 p-3">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Đăng xuất' : ''}
        >
          <MdLogout className="text-xl flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
}
