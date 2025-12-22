import axios from "axios";

// Cấu hình base URL từ environment variables hoặc sử dụng giá trị mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag để tránh multiple refresh cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi và auto refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu request là refresh-token endpoint thì không retry
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        // Refresh token cũng fail, logout user
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-storage");
        
        // Stop token monitor
        if (typeof window !== 'undefined' && window.tokenMonitor) {
          window.tokenMonitor.stop();
        }
        
        window.location.href = "/";
        return Promise.reject(error);
      }

      // Don't retry for SSE endpoints - SSE handles its own retry logic
      if (originalRequest.url?.includes('/sse/stream')) {
        console.log('SSE 401 - Will be handled by SSE reconnect logic');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh, đợi refresh xong rồi retry
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Lấy auth store
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) {
        isRefreshing = false;
        
        // Stop token monitor
        if (typeof window !== 'undefined' && window.tokenMonitor) {
          window.tokenMonitor.stop();
        }
        
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const { state } = JSON.parse(authStorage);
        const refreshToken = state?.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Auto-refreshing token...');

        // Gọi API refresh token
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken, expiresAt, refreshTokenExpiresAt } = response.data.data;

        // Update localStorage
        const newAuthStorage = {
          state: {
            ...state,
            token: newToken,
            refreshToken: newRefreshToken,
            tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
            refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt).getTime() : null,
          },
          version: 0
        };
        localStorage.setItem("auth-storage", JSON.stringify(newAuthStorage));
        localStorage.setItem("token", newToken);

        // Update axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);
        isRefreshing = false;

        console.log('✅ Token auto-refreshed successfully');

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        console.error('❌ Auto-refresh failed:', refreshError);
        
        // Refresh failed, logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-storage");
        
        // Stop token monitor
        if (typeof window !== 'undefined' && window.tokenMonitor) {
          window.tokenMonitor.stop();
        }
        
        window.location.href = "/";
        
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error("Bạn không có quyền truy cập tài nguyên này");
          break;
        case 404:
          console.error("Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("Lỗi server");
          break;
        default:
          break;
      }
    } else if (error.request) {
      console.error("Không thể kết nối tới server");
    } else {
      console.error("Đã xảy ra lỗi:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function để set token (tương thích với code cũ)
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export default api;
