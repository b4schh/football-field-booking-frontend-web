/**
 * Helper functions để xử lý API responses và errors
 */

/**
 * Format error message từ API response
 */
export const formatErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      `Lỗi ${error.response.status}: ${error.response.statusText}`
    );
  } else if (error.request) {
    // Request made but no response
    return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
  } else {
    // Something else happened
    return error.message || "Đã xảy ra lỗi không xác định";
  }
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is permission error
 */
export const isPermissionError = (error) => {
  return error.response?.status === 403;
};

/**
 * Handle API response with success/error
 */
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: formatErrorMessage(error),
    };
  }
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};
