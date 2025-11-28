/**
 * Role Helper Functions
 * Utility functions để làm việc với RBAC system
 */

// Role constants
export const ROLES = {
  CUSTOMER: 'Customer',
  OWNER: 'Owner',
  ADMIN: 'Admin'
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {Object} user - User object với thuộc tính roles (array)
 * @param {string} roleName - Tên role cần kiểm tra
 * @returns {boolean}
 */
export const hasRole = (user, roleName) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.includes(roleName);
};

/**
 * Kiểm tra user có ít nhất một trong các roles
 * @param {Object} user - User object với thuộc tính roles (array)
 * @param {Array<string>} roleNames - Mảng các role names cần kiểm tra
 * @returns {boolean}
 */
export const hasAnyRole = (user, roleNames) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || !Array.isArray(roleNames)) {
    return false;
  }
  return roleNames.some(roleName => user.roles.includes(roleName));
};

/**
 * Kiểm tra user có tất cả các roles
 * @param {Object} user - User object với thuộc tính roles (array)
 * @param {Array<string>} roleNames - Mảng các role names cần kiểm tra
 * @returns {boolean}
 */
export const hasAllRoles = (user, roleNames) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || !Array.isArray(roleNames)) {
    return false;
  }
  return roleNames.every(roleName => user.roles.includes(roleName));
};

/**
 * Kiểm tra user có phải là Customer không
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isCustomer = (user) => {
  return hasRole(user, ROLES.CUSTOMER);
};

/**
 * Kiểm tra user có phải là Owner không
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isOwner = (user) => {
  return hasRole(user, ROLES.OWNER);
};

/**
 * Kiểm tra user có phải là Admin không
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Lấy role chính của user (role đầu tiên trong mảng)
 * @param {Object} user - User object
 * @returns {string|null}
 */
export const getPrimaryRole = (user) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return null;
  }
  return user.roles[0];
};

/**
 * Lấy redirect path dựa trên primary role
 * @param {Object} user - User object
 * @returns {string}
 */
export const getRoleRedirectPath = (user) => {
  const primaryRole = getPrimaryRole(user);
  
  switch (primaryRole) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.OWNER:
      return '/owner';
    case ROLES.CUSTOMER:
    default:
      return '/';
  }
};

/**
 * Lấy display name của role để hiển thị cho user
 * @param {string} roleName - Tên role
 * @returns {string}
 */
export const getRoleDisplayName = (roleName) => {
  const roleDisplayNames = {
    [ROLES.CUSTOMER]: 'Khách hàng',
    [ROLES.OWNER]: 'Chủ sân',
    [ROLES.ADMIN]: 'Quản trị viên'
  };
  
  return roleDisplayNames[roleName] || roleName;
};

/**
 * Lấy display text cho user (hiển thị role chính hoặc danh sách roles)
 * @param {Object} user - User object
 * @param {boolean} showAll - Hiển thị tất cả roles hay chỉ role chính
 * @returns {string}
 */
export const getUserRoleDisplay = (user, showAll = false) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return 'Người dùng';
  }
  
  if (showAll) {
    return user.roles.map(role => getRoleDisplayName(role)).join(', ');
  }
  
  const primaryRole = getPrimaryRole(user);
  return primaryRole ? getRoleDisplayName(primaryRole) : 'Người dùng';
};

/**
 * Kiểm tra user có nhiều roles không
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const hasMultipleRoles = (user) => {
  return user && user.roles && Array.isArray(user.roles) && user.roles.length > 1;
};

export default {
  ROLES,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isCustomer,
  isOwner,
  isAdmin,
  getPrimaryRole,
  getRoleRedirectPath,
  getRoleDisplayName,
  getUserRoleDisplay,
  hasMultipleRoles
};
