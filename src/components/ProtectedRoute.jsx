import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { hasAnyRole, getRoleRedirectPath } from "../utils/roleHelpers";

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

  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles.length > 0) {
    if (!hasAnyRole(user, allowedRoles)) {
      // Redirect về trang phù hợp với role của user
      const userRedirectPath = getRoleRedirectPath(user);
      return <Navigate to={userRedirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
