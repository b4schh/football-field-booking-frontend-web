import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";

export default function BookingHistory() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // TODO: Fetch booking history từ API
    console.log("Fetching booking history for user:", user?.id);
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lịch sử đặt sân</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Xin chào <span className="font-semibold">{user?.username || user?.email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Role: Customer (Role ID: {user?.role})
        </p>
        <div className="mt-6">
          <p className="text-gray-500">Chưa có lịch sử đặt sân nào.</p>
        </div>
      </div>
    </div>
  );
}
