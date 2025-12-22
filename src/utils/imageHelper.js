/**
 * Helper functions for handling image URLs from MinIO storage
 */

import placeholderImage from '../assets/img/complex-placeholder-image.jpg';

const MINIO_BASE_URL = import.meta.env.VITE_MINIO_BASE_URL || 'http://localhost:9000';
export const COMPLEX_PLACEHOLDER = placeholderImage; // Export để dùng trong components
const AVATAR_PLACEHOLDER = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;

/**
 * Get full image URL by prepending MinIO base URL if needed
 * @param {string} imageUrl - The image URL path from API
 * @returns {string} - Full image URL with MinIO base URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path from backend (e.g., /bucket-name/object-name)
  // Just prepend the MinIO base URL
  const baseUrl = MINIO_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${baseUrl}${path}`;
};

/**
 * Get full URL for payment proof image
 * @param {string} paymentProofUrl - The payment proof URL from API
 * @returns {string} - Full payment proof URL
 */
export const getPaymentProofUrl = (paymentProofUrl) => {
  return getImageUrl(paymentProofUrl);
};

/**
 * Get full URL for complex/field image
 * @param {string} complexImageUrl - The complex image URL from API (object name only)
 * @returns {string} - Full complex image URL hoặc placeholder nếu không có
 */
export const getComplexImageUrl = (complexImageUrl) => {
  if (!complexImageUrl) {
    return COMPLEX_PLACEHOLDER;
  }
  return getImageUrl(complexImageUrl);
};

/**
 * Get full URL for user avatar
 * @param {string} avatarUrl - The avatar URL from API (object name only)
 * @param {string} fallbackName - Name to use for generated avatar if no URL
 * @returns {string} - Full avatar URL or generated avatar URL
 */
export const getAvatarUrl = (avatarUrl, fallbackName = 'User') => {
  if (avatarUrl) {
    return getImageUrl(avatarUrl);
  }
  
  // Fallback to UI Avatars API
  return AVATAR_PLACEHOLDER(fallbackName);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageFile = (file, maxSizeMB = 10) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)' };
  }
  
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Kích thước file không được vượt quá ${maxSizeMB}MB` };
  }
  
  return { valid: true, error: null };
};

/**
 * Create preview URL from file
 * @param {File} file - Image file
 * @returns {string} Preview URL
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL to free memory
 * @param {string} url - URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};
