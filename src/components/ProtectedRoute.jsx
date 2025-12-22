import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { hasAnyRole } from "../utils/roleHelpers";
import Unauthorized from "../pages/Unauthorized";

/**
 * ProtectedRoute Component
 * Bảo vệ routes dựa trên authentication và role
 * 
 * @param {ReactNode} children - Component con cần bảo vệ
 * @param {Array<string>} allowedRoles - Mảng các role names được phép truy cập (vd: ['Customer', 'Owner'])
 * @param {string} redirectTo - Đường dẫn redirect khi không có quyền (mặc định: "/")
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/" 
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // Kiểm tra đăng nhập - redirect về trang chủ nếu chưa login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles.length > 0) {
    if (!hasAnyRole(user, allowedRoles)) {
      // Hiển thị trang Unauthorized thay vì redirect
      const userRole = user?.roles?.[0] || null;
      return <Unauthorized userRole={userRole} requiredRoles={allowedRoles} />;
    }
  }

  return children;
};

export default ProtectedRoute;
