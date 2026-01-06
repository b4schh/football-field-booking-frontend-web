import { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getComplexReviews } from "../../services/reviewService";
import { useToast } from "../../store/toastStore";
import { getAvatarUrl } from "../../utils/imageHelper";

/**
 * Star Rating Component
 */
function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <FaStar key={star} size={size} className="text-yellow-400" />
        ) : (
          <FaRegStar key={star} size={size} className="text-gray-300" />
        )
      ))}
    </div>
  );
}

/**
 * Rating Bar Component
 */
function RatingBar({ stars, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-12">{stars} sao</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
    </div>
  );
}

/**
 * Review Card Component
 */
function ReviewCard({ review }) {
  const [showAllImages, setShowAllImages] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      if (diffMinutes < 1) return "Vừa xong";
      return `${diffMinutes} phút trước`;
    }
    
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    
    if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createdTime = new Date(review.createdAt).getTime();
  const updatedTime = new Date(review.updatedAt).getTime();
  const isEdited = review.updatedAt && (updatedTime - createdTime > 1000);
  const displayDate = isEdited ? review.updatedAt : review.createdAt;

  const displayImages = showAllImages ? review.images : review.images.slice(0, 3);
  const remainingImages = review.images.length - 3;
  
  const userName = review.user?.name || 'Người dùng';
  const userAvatar = review.user?.avatar;
  
  // Lấy chữ cái đầu của tên
  const getInitials = (name) => {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0]?.toUpperCase() || 'U';
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex gap-4">
        {/* Avatar */}
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getInitials(userName)}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {/* User Info */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{userName}</h4>
            </div>
            <span className="text-xs text-gray-400">
              {isEdited ? `Lần cuối chỉnh sửa ${formatDate(displayDate)}` : formatDate(displayDate)}
            </span>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={review.rating} />
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {displayImages.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={image}
                      alt={`Review ${idx + 1}`}
                      className="w-40 h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(image, '_blank')}
                    />
                    {idx === 2 && remainingImages > 0 && !showAllImages && (
                      <div
                        onClick={() => setShowAllImages(true)}
                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/70 transition"
                      >
                        <span className="text-white font-semibold">+{remainingImages}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {showAllImages && remainingImages > 0 && (
                <button
                  onClick={() => setShowAllImages(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  Thu gọn
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ComplexReviewsSection - Hiển thị reviews của complex cho owner
 */
export default function ComplexReviewsSection({ complexId }) {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadReviews();
  }, [complexId, currentPage]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await getComplexReviews(complexId, currentPage, pageSize);
      setReviews(response.data?.reviews || []);
      setStatistics(response.data?.statistics || null);
      setTotalPages(response.data?.totalPages || 1);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch (error) {
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="text-center py-8">Đang tải đánh giá...</div>
      </div>
    );
  }

  // No reviews state
  if (!statistics || statistics.totalReviews === 0) {
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">Đánh giá từ khách hàng</h3>
        <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <h3 className="text-xl font-bold mb-6">Đánh giá từ khách hàng</h3>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {statistics.averageRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(statistics.averageRating)} size={20} />
          <p className="text-sm text-gray-500 mt-2">{statistics.totalReviews} đánh giá</p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={statistics.ratingCounts[stars] || 0}
              total={statistics.totalReviews}
            />
          ))}
        </div>
      </div>

      {/* Reviews Header */}
      <h4 className="font-semibold text-gray-900 mb-6">
        Tất cả đánh giá ({statistics.totalReviews})
      </h4>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id}>
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="mt-8 text-center">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
}
