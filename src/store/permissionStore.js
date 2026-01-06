import { create } from "zustand";
import { permissionService } from "../services/permissionService";
import { roleService } from "../services/roleService";

const usePermissionStore = create((set, get) => ({
  // State - Permissions
  permissions: [],
  groupedPermissions: [],
  currentPermission: null,
  permissionsLoading: false,
  permissionsError: null,

  // Pagination states for permissions
  pageIndex: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,

  // State - Roles
  roles: [],
  currentRole: null,
  rolesLoading: false,
  rolesError: null,

  // State - Role-Permission Assignment
  assignmentLoading: false,
  assignmentError: null,

  // ==================== PERMISSION ACTIONS ====================

  /**
   * Fetch all permissions with pagination
   * @param {number} pageIndex - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @param {string} keyword - Search keyword (optional)
   * @param {string} module - Filter by module (optional)
   */
  fetchPermissions: async (pageIndex = 1, pageSize = 10, keyword = null, module = null) => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      const response = await permissionService.getAllPermissions(pageIndex, pageSize, keyword, module);
      set({
        permissions: response.data ?? [],
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
        permissionsLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách quyền";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Fetch permissions grouped by module
   */
  fetchPermissionsGroupedByModule: async () => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      const response = await permissionService.getPermissionsGroupedByModule();
      set({
        groupedPermissions: response.data ?? [],
        permissionsLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách quyền";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Fetch permission by ID
   */
  fetchPermissionById: async (id) => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      const response = await permissionService.getPermissionById(id);
      set({
        currentPermission: response.data,
        permissionsLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin quyền";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Create new permission
   */
  createPermission: async (data) => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      const response = await permissionService.createPermission(data);
      
      // Add to permissions list
      set((state) => ({
        permissions: [...state.permissions, response.data],
        permissionsLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tạo quyền mới";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update permission
   */
  updatePermission: async (id, data) => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      const response = await permissionService.updatePermission(id, data);

      // Update in permissions list
      set((state) => ({
        permissions: state.permissions.map((p) =>
          p.id === id ? response.data : p
        ),
        permissionsLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật quyền";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete permission
   */
  deletePermission: async (id) => {
    set({ permissionsLoading: true, permissionsError: null });
    try {
      await permissionService.deletePermission(id);

      // Remove from permissions list
      set((state) => ({
        permissions: state.permissions.filter((p) => p.id !== id),
        permissionsLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa quyền";
      set({
        permissionsError: errorMessage,
        permissionsLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // ==================== ROLE ACTIONS ====================

  /**
   * Fetch all roles
   */
  fetchRoles: async () => {
    set({ rolesLoading: true, rolesError: null });
    try {
      const response = await roleService.getAllRoles();
      set({
        roles: response.data ?? [],
        rolesLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách vai trò";
      set({
        rolesError: errorMessage,
        rolesLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Fetch role by ID (with permissions)
   */
  fetchRoleById: async (id) => {
    set({ rolesLoading: true, rolesError: null });
    try {
      const response = await roleService.getRoleById(id);
      set({
        currentRole: response.data,
        rolesLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin vai trò";
      set({
        rolesError: errorMessage,
        rolesLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Create new role
   */
  createRole: async (data) => {
    set({ rolesLoading: true, rolesError: null });
    try {
      const response = await roleService.createRole(data);

      // Add to roles list
      set((state) => ({
        roles: [...state.roles, response.data],
        rolesLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tạo vai trò mới";
      set({
        rolesError: errorMessage,
        rolesLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update role
   */
  updateRole: async (id, data) => {
    set({ rolesLoading: true, rolesError: null });
    try {
      const response = await roleService.updateRole(id, data);

      // Update in roles list
      set((state) => ({
        roles: state.roles.map((r) =>
          r.id === id ? { ...r, ...response.data } : r
        ),
        rolesLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật vai trò";
      set({
        rolesError: errorMessage,
        rolesLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete role
   */
  deleteRole: async (id) => {
    set({ rolesLoading: true, rolesError: null });
    try {
      await roleService.deleteRole(id);

      // Remove from roles list
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        rolesLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa vai trò";
      set({
        rolesError: errorMessage,
        rolesLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Assign permissions to role
   */
  assignPermissionsToRole: async (roleId, permissionIds) => {
    set({ assignmentLoading: true, assignmentError: null });
    try {
      await roleService.assignPermissionsToRole(roleId, permissionIds);

      // Reload role details to get updated permissions
      await get().fetchRoleById(roleId);

      set({ assignmentLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể gán quyền cho vai trò";
      set({
        assignmentError: errorMessage,
        assignmentLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Clear current permission
   */
  clearCurrentPermission: () => {
    set({ currentPermission: null });
  },

  /**
   * Clear current role
   */
  clearCurrentRole: () => {
    set({ currentRole: null });
  },

  /**
   * Clear all errors
   */
  clearErrors: () => {
    set({
      permissionsError: null,
      rolesError: null,
      assignmentError: null,
    });
  },
}));

export default usePermissionStore;
