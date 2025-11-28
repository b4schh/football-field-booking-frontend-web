import axios from "axios";

// Cấu hình base URL từ environment variables hoặc sử dụng giá trị mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Response interceptor - xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      switch (error.response.status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;
        case 403:
          // Không có quyền truy cập
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
      // Request được gửi nhưng không nhận được response
      console.error("Không thể kết nối tới server");
    } else {
      // Lỗi khác
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
