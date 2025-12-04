import { jwtDecode } from "jwt-decode";

/**
 * Token Helpers
 * Các utility functions để làm việc với JWT tokens
 */

/**
 * Kiểm tra token đã hết hạn chưa
 * @param {string} token - JWT token
 * @returns {boolean} true nếu token đã hết hạn
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Kiểm tra token sắp hết hạn (trong vòng X giây)
 * @param {string} token - JWT token
 * @param {number} thresholdSeconds - Ngưỡng thời gian (giây), mặc định 300 (5 phút)
 * @returns {boolean} true nếu token sắp hết hạn
 */
export const isTokenExpiringSoon = (token, thresholdSeconds = 300) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < thresholdSeconds;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Lấy thời gian còn lại của token (milliseconds)
 * @param {string} token - JWT token
 * @returns {number} Thời gian còn lại (ms), hoặc 0 nếu đã hết hạn
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeRemaining = (decoded.exp - currentTime) * 1000;
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error('Error decoding token:', error);
    return 0;
  }
};

/**
 * Lấy user ID từ token
 * @param {string} token - JWT token
 * @returns {string|null} User ID hoặc null
 */
export const getUserIdFromToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.nameid || decoded.sub || decoded.UserId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Lấy roles từ token
 * @param {string} token - JWT token
 * @returns {Array<string>} Mảng roles
 */
export const getRolesFromToken = (token) => {
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);
    const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    if (!roleClaim) return [];
    return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

/**
 * Lấy email từ token
 * @param {string} token - JWT token
 * @returns {string|null} Email hoặc null
 */
export const getEmailFromToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.email || 
           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
           null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Format thời gian còn lại thành human-readable string
 * @param {number} milliseconds - Thời gian (ms)
 * @returns {string} Chuỗi format: "5 phút", "2 giờ", etc.
 */
export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return 'Đã hết hạn';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  if (minutes > 0) return `${minutes} phút`;
  return `${seconds} giây`;
};

export default {
  isTokenExpired,
  isTokenExpiringSoon,
  getTokenTimeRemaining,
  getUserIdFromToken,
  getRolesFromToken,
  getEmailFromToken,
  formatTimeRemaining,
};
