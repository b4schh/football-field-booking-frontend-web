import { Routes, Route } from "react-router-dom";
import RoleBasedLayout from "../components/dashboard/RoleBasedLayout";
import { ROLES } from "../utils/roleHelpers";

// Import pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminComplexManagement from "../pages/admin/ComplexManagement";
import AdminComplexDetail from "../pages/admin/ComplexManagement/ComplexDetail";
import AdminFieldDetail from "../pages/admin/ComplexManagement/FieldDetail";
import AdminBookingManagement from "../pages/admin/BookingManagement";
import ManageUsers from "../pages/admin/ManageUsers";
import UserManagement from "../pages/admin/UserManagement";
import RoleManagement from "../pages/admin/RoleManagement";
import PermissionManagement from "../pages/admin/PermissionManagement";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RoleBasedLayout role="admin" allowedRoles={[ROLES.ADMIN]} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="complexes" element={<AdminComplexManagement />} />
        <Route path="complexes/:id" element={<AdminComplexDetail />} />
        <Route path="complexes/:complexId/fields/:fieldId" element={<AdminFieldDetail />} />
        <Route path="bookings" element={<AdminBookingManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="permissions" element={<PermissionManagement />} />
        {/* Thêm các routes khác cho Admin tại đây:
        <Route path="reviews" element={...} />
        <Route path="settings" element={...} />
        */}
      </Route>
    </Routes>
  );
}
