import { useParams } from "react-router-dom";
import { getComplexImageUrl } from "../../utils/imageHelper";
import { useEffect } from "react";
import { FiMapPin } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { PiShareNetworkLight } from "react-icons/pi";
import { CiHeart } from "react-icons/ci";
import {
  FaWifi,
  FaUtensils,
  FaBottleWater,
  FaBath,
  FaSquareParking,
} from "react-icons/fa6";
import ImageGallery from "../../components/customer/ImageGallery";
import FieldSchedule from "../../components/customer/FieldSchedule";
import ComplexDescription from "../../components/customer/ComplexDescription";
import ReviewsSection from "../../components/customer/ReviewsSection";
import FloatingBookingPreview from "../../components/customer/FloatingBookingPreview";
import useComplexStore from "../../store/complexStore";
import useReviewStore from "../../store/reviewStore";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}

function Service({ icon, label }) {
  return (
    <div className="flex items-center gap-2 w-full text-xs text-black">
      <div>{icon}</div>
      <span>{label}</span>
    </div>
  );
}

export default function ComplexDetailPage() {
  const description =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const { id } = useParams();
  const { currentComplex, fetchComplexFullDetails, isLoading, error } =
    useComplexStore();
  const { statistics } = useReviewStore();

  useEffect(() => {
    if (id) {
      // Fetch complex với full details (bao gồm fields và timeSlots có giá)
      fetchComplexFullDetails(id);
    }
  }, [id, fetchComplexFullDetails]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-8 lg:px-20 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 md:px-8 lg:px-20 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!currentComplex) {
    return (
      <div className="container mx-auto px-6 md:px-8 lg:px-20 py-8">
        <div className="text-center">Không tìm thấy thông tin sân</div>
      </div>
    );
  }

  // Lấy giá thấp nhất và cao nhất từ tất cả timeslots
  const allPrices =
    currentComplex.fields?.flatMap(
      (field) => field.timeSlots?.map((slot) => slot.price) || []
    ) || [];
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format thời gian
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // "06:00:00" -> "06:00"
  };

  // Lấy địa chỉ đầy đủ
  const fullAddress = [
    currentComplex.street,
    currentComplex.ward,
    currentComplex.province,
  ]
    .filter(Boolean)
    .join(", ");

  // Tạo danh sách ảnh từ API hoặc dùng placeholder
  const images =
    currentComplex.images?.length > 0
      ? currentComplex.images.map((img) => getComplexImageUrl(img.imageUrl))
      : [
          "/src/assets/img/complex-placeholder-image.jpg",
          "/src/assets/img/complex-placeholder-image.jpg",
          "/src/assets/img/complex-placeholder-image.jpg",
        ];

  return (
    <div className="container mx-auto px-6 md:px-8 lg:px-20 py-8">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h2 className="text-2xl font-bold">{currentComplex.name}</h2>

        {/* Info Row */}
        <div className="flex justify-between items-center py-2">
          {/* Address */}
          <div className="flex items-center gap-2">
            <FiMapPin size={18} className="text-black" />
            <p className="text-base text-black">{fullAddress}</p>
          </div>

          {/* Rating + Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <p className="text-base">
                Đánh giá: {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : 'Chưa có'}/5
              </p>
              <FaStar size={20} className="text-yellow-400" />
              <p className="text-base text-black">
                ({statistics.totalReviews} đánh giá)
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-stone-300" />

            <div className="flex items-center gap-2 text-black">
              <PiShareNetworkLight size={20} />
              <CiHeart size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------ MAIN CONTENT ------------ */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* LEFT – IMAGE GALLERY */}
        <div className="flex-[3]">
          <ImageGallery images={images} />
        </div>

        {/* RIGHT – FIELD INFO CARD */}
        <div className="flex-[1] bg-white rounded-xl p-4 flex flex-col gap-3">
          {/* Label */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-400 rounded" />
            <p className="text-sm font-bold">Thông tin sân</p>
          </div>

          {/* Info rows */}
          <InfoRow
            label="Giờ mở cửa:"
            value={`${formatTime(currentComplex.openingTime)} - ${formatTime(
              currentComplex.closingTime
            )}`}
          />
          <InfoRow
            label="Số sân thi đấu:"
            value={`${currentComplex.fields?.length || 0} sân`}
          />
          <InfoRow
            label="Giá sân:"
            value={`${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
          />
          <InfoRow label="Giá sân giờ vàng:" value={formatPrice(maxPrice)} />
          <InfoRow
            label="Số điện thoại chủ sân:"
            value={currentComplex.phone || "Chưa cập nhật"}
          />

          {/* Services */}
          <div className="bg-neutral-100 p-4 rounded-xl flex flex-col gap-3">
            <p className="text-xs font-bold">Dịch vụ tiện ích</p>

            <div className="grid grid-cols-2 gap-3">
              <Service icon={<FaWifi />} label="Wifi" />
              <Service icon={<FaSquareParking />} label="Bãi đỗ xe" />
              <Service icon={<FaUtensils />} label="Đồ ăn" />
              <Service icon={<FaBottleWater />} label="Nước uống" />
              <Service icon={<FaBath />} label="Phòng tắm miễn phí" />
            </div>
          </div>
        </div>
      </div>

      {/* Field Schedule Section */}
      <FieldSchedule complexData={currentComplex} />

      {/* Description Section */}
      <ComplexDescription description={description} />

      {/* Reviews Section */}
      <ReviewsSection complexId={id} />

      {/* Floating Booking Preview */}
      <FloatingBookingPreview />
    </div>
  );
}