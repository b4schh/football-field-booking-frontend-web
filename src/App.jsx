import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomerLayout from "./layouts/CustomerLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roleHelpers";
import { useNotificationSSE } from "./hooks";
import { tokenMonitor } from "./services/tokenMonitor";
import AccountBlockedModal from "./components/common/AccountBlockedModal";

// Import Customer pages
import Home from "./pages/Home";
import CustomerProfile from "./pages/customer/CustomerProfile";
import ComplexDetailPage from "./pages/customer/ComplexDetailPage";
import BookingConfirmation from "./pages/customer/BookingConfirmation";
import PaymentUpload from "./pages/customer/PaymentUpload";
import MyBookings from "./pages/customer/MyBookings";
import Favorites from "./pages/customer/Favorites";

// Import Router modules
import AdminRoutes from "./router/AdminRoutes";
import OwnerRoutes from "./router/OwnerRoutes";
import NotFound from "./pages/NotFound";

import { ToastContainer } from "./components/common/Toast";
import useToastStore from "./store/toastStore";
import { useAuthStore, useFavoriteStore } from "./store";

function App() {
  const { toasts, removeToast } = useToastStore();
  const { isAuthenticated, user, refreshAccessToken } = useAuthStore();
  const { fetchMyFavorites } = useFavoriteStore();
  
  // State for account blocked modal
  const [blockedInfo, setBlockedInfo] = useState({ show: false, message: "", type: "banned" });
  
  // Kết nối SSE cho real-time notifications
  useNotificationSSE();
  
  // Listen for account blocked events from API interceptor
  useEffect(() => {
    const handleAccountBlocked = (event) => {
      const { message } = event.detail;
      
      // Determine type based on message
      let type = "banned";
      if (message.includes("chưa được kích hoạt")) {
        type = "inactive";
      } else if (message.includes("đã bị xóa")) {
        type = "deleted";
      }
      
      setBlockedInfo({ show: true, message, type });
    };
    
    window.addEventListener('accountBlocked', handleAccountBlocked);
    
    return () => {
      window.removeEventListener('accountBlocked', handleAccountBlocked);
    };
  }, []);

  // Initialize token monitor when app loads
  useEffect(() => {
    if (isAuthenticated) {
      // Start token monitoring
      tokenMonitor.start(
        () => useAuthStore.getState(),
        () => useAuthStore.getState().refreshAccessToken()
      );
      
      console.log('🔐 Token monitoring initialized');
    } else {
      // Stop monitoring when not authenticated
      tokenMonitor.stop();
    }

    return () => {
      tokenMonitor.stop();
    };
  }, [isAuthenticated]);

  // Load favorites khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes(ROLES.CUSTOMER)) {
      fetchMyFavorites();
    }
  }, [isAuthenticated, user, fetchMyFavorites]);

  return (
    <>
      <Routes>
        {/* Public Routes - Customer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="complex/:id" element={<ComplexDetailPage />} />

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
            path="favorites"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Favorites />
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
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Owner Routes */}
        <Route path="/owner/*" element={<OwnerRoutes />} />

        {/* 404 - Not Found - Catch all routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Global Account Blocked Modal */}
      <AccountBlockedModal
        isOpen={blockedInfo.show}
        onClose={() => {
          setBlockedInfo({ show: false, message: "", type: "banned" });
        }}
        message={blockedInfo.message}
        type={blockedInfo.type}
      />
    </>
  );
}

export default App;
