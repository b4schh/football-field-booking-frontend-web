/**
 * Helper functions for handling image URLs from MinIO storage
 */

const MINIO_BASE_URL = import.meta.env.VITE_MINIO_BASE_URL || 'http://localhost:9000';

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
  
  // If it's a relative path, prepend MinIO base URL
  // Remove leading slash if present to avoid double slashes
  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  return `${MINIO_BASE_URL}/${path}`;
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
 * @param {string} complexImageUrl - The complex image URL from API
 * @returns {string} - Full complex image URL
 */
export const getComplexImageUrl = (complexImageUrl) => {
  return getImageUrl(complexImageUrl);
};

/**
 * Get full URL for user avatar
 * @param {string} avatarUrl - The avatar URL from API
 * @param {string} fallbackName - Name to use for generated avatar if no URL
 * @returns {string} - Full avatar URL or generated avatar URL
 */
export const getAvatarUrl = (avatarUrl, fallbackName = 'User') => {
  if (avatarUrl) {
    return getImageUrl(avatarUrl);
  }
  
  // Fallback to UI Avatars API
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3b82f6&color=fff`;
};
