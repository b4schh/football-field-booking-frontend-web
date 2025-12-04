import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * Custom hook để quản lý authentication
 * Tự động check token và refresh nếu cần
 */
export const useAuth = (requireAuth = false) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    if (requireAuth) {
      // Async function để check auth
      const verifyAuth = async () => {
        const isValid = await checkAuth();
        if (!isValid) {
          logout();
          navigate("/");
        }
      };
      
      verifyAuth();
    }
  }, [requireAuth, checkAuth, logout, navigate]);

  return { user, isAuthenticated };
};

/**
 * Custom hook để check role
 */
export const useRole = (allowedRoles = []) => {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (role) => {
    if (!isAuthenticated || !user) return false;
    return user.role === role || user.roles?.includes(role);
  };

  const hasAnyRole = () => {
    if (allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => hasRole(role));
  };

  return { hasRole, hasAnyRole, userRole: user?.role };
};
