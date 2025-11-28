import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { setAuthToken } from "../services/api";
import { jwtDecode } from "jwt-decode";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { token, user } = response.data;

          // Decode token để lấy roles từ JWT claims
          let userData = user;
          if (userData && token) {
            const decodedToken = jwtDecode(token);
            // Extract roles from JWT claims (ClaimTypes.Role)
            const roleClaims = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (roleClaims) {
              userData.roles = Array.isArray(roleClaims) ? roleClaims : [roleClaims];
            } else {
              userData.roles = userData.roleNames || [];
            }
          }

          setAuthToken(token);
          set({
            user: userData,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Đăng nhập thất bại";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          const { token, user } = response.data;

          if (token && user) {
            // Decode token để lấy roles từ JWT claims
            const decodedToken = jwtDecode(token);
            const roleClaims = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (roleClaims) {
              user.roles = Array.isArray(roleClaims) ? roleClaims : [roleClaims];
            } else {
              user.roles = user.roleNames || [];
            }

            setAuthToken(token);
            set({
              user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false });
          }

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Đăng ký thất bại";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        setAuthToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      clearError: () => {
        set({ error: null });
      },

      // Check token validity
      checkAuth: () => {
        const token = get().token;
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp < currentTime) {
              // Token expired
              get().logout();
              return false;
            }
            return true;
          } catch (error) {
            get().logout();
            return false;
          }
        }
        return false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
