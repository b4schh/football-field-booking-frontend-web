import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  MdAdminPanelSettings,
  MdRateReview,
  MdSecurity,
  MdExpandMore,
  MdExpandLess,
  MdGroup,
  MdKey,
  MdAssessment,
  MdReport,
  MdArticle,
  MdNewspaper,
  MdHelp,
  MdHistory
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
    { path: "/owner/reviews", label: "Quản lý đánh giá", icon: MdRateReview },
    { path: "/owner/images", label: "Quản lý ảnh", icon: MdImage },
    { path: "/owner/settings", label: "Cài đặt", icon: MdSettings },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
    { path: "/admin/users", label: "Quản lý người dùng", icon: MdPeople },
    { 
      label: "Quản lý phân quyền", 
      icon: MdSecurity,
      submenu: [
        { path: "/admin/roles", label: "Vai trò", icon: MdGroup },
        { path: "/admin/permissions", label: "Quyền hạn", icon: MdKey },
      ]
    },
    { path: "/admin/complexes", label: "Quản lý cụm sân", icon: MdStore },
    { path: "/admin/bookings", label: "Quản lý Booking", icon: MdBookOnline },
    { path: "/admin/reports", label: "Báo cáo & Thống kê", icon: MdAssessment },
    { path: "/admin/disputes", label: "Xử lý khiếu nại", icon: MdReport },
    { 
      label: "Quản lý nội dung", 
      icon: MdArticle,
      submenu: [
        { path: "/admin/news", label: "Tin tức", icon: MdNewspaper },
        { path: "/admin/faqs", label: "FAQ", icon: MdHelp },
      ]
    },
    { path: "/admin/system-config", label: "Cấu hình hệ thống", icon: MdAdminPanelSettings },
    { path: "/admin/activity-logs", label: "Nhật ký hoạt động", icon: MdHistory },
  ]
};

export default function Sidebar({ role, collapsed, onToggle }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = menuConfig[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
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
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Menu item with submenu
          if (item.submenu) {
            const isOpen = openSubmenu === item.label;
            const hasActiveSubmenu = item.submenu.some(sub => 
              window.location.pathname.startsWith(sub.path)
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    hasActiveSubmenu || isOpen
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  } ${collapsed ? 'justify-center' : 'justify-between'}`}
                  title={collapsed ? item.label : ''}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-xl flex-shrink-0" />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && (
                    isOpen ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />
                  )}
                </button>
                
                {/* Submenu */}
                {!collapsed && isOpen && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                              isActive
                                ? 'bg-slate-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                            }`
                          }
                        >
                          <SubIcon className="text-lg flex-shrink-0" />
                          <span className="font-medium text-sm">{subItem.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          // Regular menu item
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
