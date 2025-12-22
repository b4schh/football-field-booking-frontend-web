import { Routes, Route } from "react-router-dom";
import RoleBasedLayout from "../components/dashboard/RoleBasedLayout";
import { ROLES } from "../utils/roleHelpers";

// Import pages
import AdminDashboardPage from "../pages/admin/AdminDashboard";
import AdminComplexes from "../pages/admin/AdminComplexes";
import ManageUsers from "../pages/admin/ManageUsers";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RoleBasedLayout role="admin" allowedRoles={[ROLES.ADMIN]} />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="complexes" element={<AdminComplexes />} />
        {/* Thêm các routes khác cho Admin tại đây:
        <Route path="fields" element={...} />
        <Route path="bookings" element={...} />
        <Route path="settings" element={...} />
        */}
      </Route>
    </Routes>
  );
}
