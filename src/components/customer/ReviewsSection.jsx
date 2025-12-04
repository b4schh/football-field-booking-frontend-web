import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaThumbsUp } from "react-icons/fa";
import { FiThumbsUp, FiMessageSquare } from "react-icons/fi";
import useReviewStore from "../../store/reviewStore";
import { getRoleDisplayName } from "../../utils/roleHelpers";
import { getAvatarUrl } from "../../utils/imageHelper";
import ProtectedAction from "./ProtectedAction";

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

function ReviewCard({ review, onVoteHelpful, onUnvoteHelpful, isVoted }) {
  const [showAllImages, setShowAllImages] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const displayImages = showAllImages ? review.images : review.images.slice(0, 3);
  const remainingImages = review.images.length - 3;
  
  // Generate avatar URL if not provided
  const avatarUrl = getAvatarUrl(review.user.avatar, review.user.name);

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={avatarUrl}
          alt={review.user.name}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1">
          {/* User Info */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
              <p className="text-xs text-gray-500">{review.user.role}</p>
            </div>
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={review.rating} />
          </div>

          {/* Comment */}
          <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

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

          {/* Actions */}
          <div className="flex items-center gap-4 text-gray-500">
            <ProtectedAction
              onClick={() => isVoted ? onUnvoteHelpful(review.id) : onVoteHelpful(review.id)}
              className={`flex items-center gap-2 text-sm transition ${
                isVoted 
                  ? 'text-blue-600 hover:text-blue-700 font-medium' 
                  : 'hover:text-blue-600'
              }`}
            >
              {isVoted ? <FaThumbsUp size={16} /> : <FiThumbsUp size={16} />}
              <span>Hữu ích ({review.helpful})</span>
            </ProtectedAction>
            <button className="flex items-center gap-2 text-sm hover:text-blue-600 transition">
              <FiMessageSquare size={16} />
              <span>Trả lời</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection({ complexId }) {
  const { 
    reviews, 
    statistics, 
    pagination,
    isLoading,
    error,
    fetchComplexReviews,
    loadMoreReviews,
    voteHelpful,
    unvoteHelpful
  } = useReviewStore();
  
  const [sortBy, setSortBy] = useState("newest"); // newest, highest, lowest

  // Fetch reviews khi component mount hoặc complexId thay đổi
  useEffect(() => {
    if (complexId) {
      fetchComplexReviews(complexId, 1, 10);
    }
  }, [complexId, fetchComplexReviews]);

  // Handle vote helpful
  const handleVoteHelpful = async (reviewId) => {
    const result = await voteHelpful(reviewId);
    if (!result.success) {
      alert(result.error || "Không thể vote review này");
    }
  };

  // Handle unvote helpful
  const handleUnvoteHelpful = async (reviewId) => {
    const result = await unvoteHelpful(reviewId);
    if (!result.success) {
      alert(result.error || "Không thể hủy vote review này");
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (complexId) {
      loadMoreReviews(complexId);
    }
  };

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    return 0;
  });

  // Loading state
  if (isLoading && reviews.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl p-6">
        <div className="text-center py-8">Đang tải đánh giá...</div>
      </div>
    );
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl p-6">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  // No reviews state
  if (reviews.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">Đánh giá từ khách hàng</h3>
        <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào</div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl p-6">
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

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-gray-900">
          Tất cả đánh giá ({statistics.totalReviews})
        </h4>
        <div className="relative w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
          >
            <option value="newest">Mới nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            onVoteHelpful={handleVoteHelpful}
            onUnvoteHelpful={handleUnvoteHelpful}
            isVoted={review.isVotedByCurrentUser}
          />
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasNextPage && (
        <div className="mt-8 text-center">
          <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
}
