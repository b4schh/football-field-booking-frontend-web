import { Routes, Route } from "react-router-dom";
import RoleBasedLayout from "../components/dashboard/RoleBasedLayout";
import { ROLES } from "../utils/roleHelpers";

// Import pages
import OwnerDashboardPage from "../pages/owner/OwnerDashboard/";
import FieldManagement from "../pages/owner/FieldManagement";
import ComplexManagement from "../pages/owner/ComplexManagement";
import ComplexDetail from "../pages/owner/ComplexManagement/ComplexDetail";
import FieldDetail from "../pages/owner/FieldManagement/FieldDetail";
import TimeSlotManagement from "../pages/owner/TimeSlotManagement";
import ComplexSetupWizard from "../components/owner/ComplexSetupWizard";
import OwnerBookingManagement from "../pages/owner/BookingManagement";
import BookingDetail from "../pages/owner/BookingManagement/BookingDetail";
import ReviewManagement from "../pages/owner/ReviewManagement";
import OwnerSettings from "../pages/owner/OwnerSettings";

export default function OwnerRoutes() {
  return (
    <Routes>
      <Route element={<RoleBasedLayout role="owner" allowedRoles={[ROLES.OWNER]} />}>
        <Route index element={<OwnerDashboardPage />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        
        {/* Complex Management Routes */}
        <Route path="complexes" element={<ComplexManagement />} />
        <Route path="complexes/setup-wizard" element={<ComplexSetupWizard />} />
        <Route path="complexes/:id" element={<ComplexDetail />} />
        <Route path="complexes/:complexId/fields/:fieldId" element={<FieldDetail />} />
        
        {/* Field Management Routes */}
        <Route path="fields" element={<FieldManagement />} />
        
        {/* TimeSlot Management Routes */}
        <Route path="timeslots" element={<TimeSlotManagement />} />
        
        {/* Booking Management Routes */}
        <Route path="bookings" element={<OwnerBookingManagement/>} />
        <Route path="bookings/:id" element={<BookingDetail/>} />

        {/* Review Management Routes */}
        <Route path="reviews" element={<ReviewManagement />} />

        <Route path="settings" element={<OwnerSettings />} />

        {/* Các routes khác sẽ được thêm sau:
        <Route path="image element={...} />
        <Route path="settings" element={...} />
        */}
      </Route>
    </Routes>
  );
}
