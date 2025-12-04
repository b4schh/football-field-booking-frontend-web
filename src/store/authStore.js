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
      refreshToken: null,
      tokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isRefreshing: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { token, refreshToken, user, expiresAt, refreshTokenExpiresAt } = response.data;

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
            refreshToken: refreshToken,
            tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
            refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt).getTime() : null,
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
          const { token, refreshToken, user, expiresAt, refreshTokenExpiresAt } = response.data;

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
              refreshToken: refreshToken,
              tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
              refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt).getTime() : null,
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
          refreshToken: null,
          tokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          isAuthenticated: false,
          error: null,
          isRefreshing: false,
        });
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const state = get();
        
        // Đang refresh rồi thì không refresh nữa
        if (state.isRefreshing) {
          return false;
        }

        // Check refresh token còn hạn không
        if (state.refreshTokenExpiresAt && Date.now() >= state.refreshTokenExpiresAt) {
          console.log('Refresh token đã hết hạn');
          get().logout();
          return false;
        }

        if (!state.refreshToken) {
          return false;
        }

        set({ isRefreshing: true });

        try {
          const response = await authService.refreshToken(state.refreshToken);
          const { token, refreshToken, user, expiresAt, refreshTokenExpiresAt } = response.data;

          // Decode token để lấy roles
          let userData = user;
          if (userData && token) {
            const decodedToken = jwtDecode(token);
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
            refreshToken: refreshToken,
            tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
            refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt).getTime() : null,
            isAuthenticated: true,
            isRefreshing: false,
            error: null,
          });

          return true;
        } catch (error) {
          console.error('Refresh token failed:', error);
          set({ isRefreshing: false });
          get().logout();
          return false;
        }
      },

      // Check token validity và tự động refresh nếu cần
      checkAuth: async () => {
        const state = get();
        
        if (!state.token) {
          return false;
        }

        try {
          const decodedToken = jwtDecode(state.token);
          const currentTime = Date.now() / 1000;
          const tokenExp = decodedToken.exp;

          // Token còn hạn > 5 phút
          if (tokenExp > currentTime + 300) {
            return true;
          }

          // Token sắp hết hạn hoặc đã hết hạn, thử refresh
          if (tokenExp <= currentTime + 300) {
            console.log('Token sắp hết hạn, đang refresh...');
            const refreshed = await get().refreshAccessToken();
            return refreshed;
          }

          return true;
        } catch (error) {
          console.error('Check auth error:', error);
          return false;
        }
      },

      // Kiểm tra token có cần refresh không (dùng cho interceptor)
      shouldRefreshToken: () => {
        const state = get();
        
        if (!state.token || !state.tokenExpiresAt) {
          return false;
        }

        // Nếu token còn hơn 5 phút thì không cần refresh
        const timeUntilExpiry = state.tokenExpiresAt - Date.now();
        return timeUntilExpiry < 5 * 60 * 1000; // 5 phút
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
