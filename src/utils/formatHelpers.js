/**
 * Format TimeSpan từ backend (HH:mm:ss) thành HH:mm
 * @param {string} timeSpan - TimeSpan string from backend (e.g., "08:00:00")
 * @returns {string} Formatted time (e.g., "08:00")
 */
export function formatTimeSpan(timeSpan) {
  if (!timeSpan) return "";
  
  // Nếu đã là format HH:mm thì return luôn
  if (timeSpan.split(":").length === 2) {
    return timeSpan;
  }
  
  // Nếu là HH:mm:ss thì cắt bỏ :ss
  const parts = timeSpan.split(":");
  if (parts.length === 3) {
    return `${parts[0]}:${parts[1]}`;
  }
  
  return timeSpan;
}

/**
 * Convert HH:mm thành TimeSpan format cho backend
 * @param {string} time - Time string (e.g., "08:00")
 * @returns {string} TimeSpan format (e.g., "08:00:00")
 */
export function toTimeSpan(time) {
  if (!time) return "";
  
  // Nếu đã có :ss thì return luôn
  if (time.split(":").length === 3) {
    return time;
  }
  
  // Thêm :00 vào cuối
  return `${time}:00`;
}

/**
 * Format currency VND
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return "0 ₫";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format date to dd/mm/yyyy
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return "";
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime to dd/mm/yyyy HH:mm
 * @param {string|Date} datetime 
 * @returns {string}
 */
export function formatDateTime(datetime) {
  if (!datetime) return "";
  
  const d = new Date(datetime);
  const date = formatDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${date} ${hours}:${minutes}`;
}

/**
 * Format date to relative time (vừa xong, X phút trước, X giờ trước, X ngày trước)
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatRelativeDate(date) {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return "vừa xong";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
}
