import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";

export default function ManageFields() {
  const { user } = useAuthStore();
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // TODO: Fetch fields từ API
    console.log("Fetching fields for owner:", user?.id);
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý sân bóng</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Chủ sân: <span className="font-semibold">{user?.username || user?.email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Role: Owner (Role ID: {user?.role})
        </p>
        <div className="mt-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Thêm sân mới
          </button>
        </div>
        <div className="mt-6">
          <p className="text-gray-500">Chưa có sân nào được tạo.</p>
        </div>
      </div>
    </div>
  );
}
