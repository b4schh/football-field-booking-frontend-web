import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { hasAnyRole } from "../../utils/roleHelpers";
import Unauthorized from "../../pages/Unauthorized";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

/**
 * RoleBasedLayout Component
 * Kiểm tra quyền trước khi render layout
 * Nếu không có quyền -> hiển thị Unauthorized (không có sidebar)
 * Nếu có quyền -> render DashboardLayout với Outlet
 */
export default function RoleBasedLayout({ role, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập -> redirect về trang chủ
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Đã đăng nhập nhưng không có quyền -> hiển thị Unauthorized (không sidebar)
  if (!hasAnyRole(user, allowedRoles)) {
    const userRole = user?.roles?.[0] || null;
    return <Unauthorized userRole={userRole} requiredRoles={allowedRoles} />;
  }

  // Có quyền -> render DashboardLayout bình thường
  return (
    <DashboardLayout role={role}>
      <Outlet />
    </DashboardLayout>
  );
}
