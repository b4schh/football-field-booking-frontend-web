import { Routes, Route } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import OwnerLayout from "./layouts/OwnerLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roleHelpers";

import Home from "./pages/Home";
import CustomerProfile from "./pages/customer/CustomerProfile";
import AuthDemoPage from "./pages/customer/AuthDemoPage";
import BookingHistory from "./pages/customer/BookingHistory";
import ComplexDetailPage from "./pages/customer/ComplexDetailPage";
import BookingConfirmation from "./pages/customer/BookingConfirmation";
import PaymentUpload from "./pages/customer/PaymentUpload";
import MyBookings from "./pages/customer/MyBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ManageFields from "./pages/owner/ManageFields";
import { ToastContainer } from "./components/common/Toast";
import useToastStore from "./store/toastStore";

function App() {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      <Routes>
      {/* Public Routes - Customer */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="complex/:id" element={<ComplexDetailPage />} />
        <Route path="auth-demo" element={<AuthDemoPage />} />
        
        {/* Protected Customer Routes - Chỉ Customer */}
        <Route 
          path="booking/confirm" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <BookingConfirmation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="booking/:id/payment" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <PaymentUpload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-bookings" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <MyBookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="booking-history" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <BookingHistory />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Admin Routes - Chỉ Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route 
          index 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <ManageUsers />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Owner Routes - Chỉ Owner */}
      <Route path="/owner" element={<OwnerLayout />}>
        <Route 
          index 
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="fields" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <ManageFields />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
    <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default App;
