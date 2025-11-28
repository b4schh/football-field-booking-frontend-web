import ProtectedAction from "./ProtectedAction";
import { FiHeart, FiBookmark, FiCalendar } from "react-icons/fi";

/**
 * Component demo minh họa cách sử dụng ProtectedAction
 * Các button này sẽ yêu cầu đăng nhập trước khi thực hiện action
 */
export default function ProtectedActionDemo() {
  const handleLike = () => {
    alert("Đã thêm vào danh sách yêu thích!");
  };

  const handleBookmark = () => {
    alert("Đã lưu sân!");
  };

  const handleBooking = () => {
    alert("Chuyển đến trang đặt sân!");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Các action cần đăng nhập:</h3>
      
      <div className="flex gap-3">
        {/* Button yêu thích - cần đăng nhập */}
        <ProtectedAction onClick={handleLike}>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
            <FiHeart />
            <span>Yêu thích</span>
          </button>
        </ProtectedAction>

        {/* Button lưu sân - cần đăng nhập */}
        <ProtectedAction onClick={handleBookmark}>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
            <FiBookmark />
            <span>Lưu sân</span>
          </button>
        </ProtectedAction>

        {/* Button đặt sân - cần đăng nhập */}
        <ProtectedAction onClick={handleBooking}>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <FiCalendar />
            <span>Đặt sân ngay</span>
          </button>
        </ProtectedAction>
      </div>

      <p className="text-sm text-gray-600">
        ℹ️ Nếu chưa đăng nhập, click vào các button trên sẽ mở popup đăng nhập.
        Sau khi đăng nhập thành công, action sẽ được thực hiện tự động.
      </p>
    </div>
  );
}
