import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";

export default function ManageUsers() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    owners: 0,
    admins: 0,
  });

  useEffect(() => {
    // TODO: Fetch users từ API
    console.log("Fetching all users for admin:", user?.id);
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Admin: <span className="font-semibold">{user?.username || user?.email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Role: Admin (Role ID: {user?.role})
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Tổng người dùng</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Khách hàng</p>
            <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-600">Chủ sân</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.owners}</p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-gray-600">Quản trị viên</p>
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-500">Danh sách người dùng sẽ hiển thị ở đây.</p>
        </div>
      </div>
    </div>
  );
}
