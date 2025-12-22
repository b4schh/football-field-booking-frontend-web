import { IoLocationOutline } from "react-icons/io5";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { GiSoccerField } from "react-icons/gi";
import { MdAccessTime } from "react-icons/md";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { Link } from "react-router-dom";
import { getComplexImageUrl, COMPLEX_PLACEHOLDER } from "../../utils/imageHelper";
import { useAuthStore, useFavoriteStore } from "../../store";

export default function ComplexCard({ complex }) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  
  // Format địa chỉ
  if (!complex) return null;

  const address = [complex?.street, complex?.ward, complex?.province].filter(Boolean).join(", ");

  // Format giờ mở cửa
  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
  };

  // Placeholder image nếu không có ảnh
  const imageUrl = getComplexImageUrl(complex.mainImageUrl);

  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return; // Could show login modal here
    }
    
    await toggleFavorite(complex.id);
  };

  const isFav = isAuthenticated && isFavorite(complex.id);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col gap-4 h-full">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={complex.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to local placeholder image to prevent infinite loop
            if (e.target.src !== COMPLEX_PLACEHOLDER) {
              e.target.src = COMPLEX_PLACEHOLDER;
            }
          }}
        />
        
        {/* Favorite button */}
        {isAuthenticated && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
            title={isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            {isFav ? (
              <HiHeart className="text-red-500 text-xl" />
            ) : (
              <HiOutlineHeart className="text-gray-700 text-xl" />
            )}
          </button>
        )}
        
        {complex.status === 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Đang chờ duyệt
          </div>
        )}
        {!complex.isActive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Không hoạt động
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 gap-4">
        {/* Top info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[1.5rem]">
            {complex.name}
          </h3>

          <div className="flex flex-col gap-2 text-gray-700 text-sm">
            {/* Location */}
            <div className="flex items-start gap-2">
              <IoLocationOutline className="text-xl flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {address || "Chưa cập nhật địa chỉ"}
              </span>
            </div>

            {/* Phone */}
            {complex.phone && (
              <div className="flex items-center gap-2">
                <IoPhonePortraitOutline className="text-lg flex-shrink-0" />
                <span>{complex.phone}</span>
              </div>
            )}

            {/* Opening hours */}
            {complex.openingTime && complex.closingTime && (
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-lg flex-shrink-0" />
                <span>
                  {formatTime(complex.openingTime)} -{" "}
                  {formatTime(complex.closingTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        <Link
          to={`/complex/${complex.id}`}
          className="w-full bg-slate-800 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-slate-900 transition-all text-center"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
