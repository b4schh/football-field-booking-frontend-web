import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ComplexCard from "./ComplexCard";
import useRecommendation from "../../hooks/useRecommendation";

/**
 * RecommendationSection Component
 * Hiển thị danh sách cụm sân được gợi ý với horizontal scroll
 * 
 * @param {Object} props
 * @param {string} props.title - Tiêu đề section
 * @param {string} props.type - Loại recommendation: "similar", "smart", "personalized", "new-user"
 * @param {number} props.complexId - ID cụm sân (required khi type="similar")
 * @param {Object} props.params - Parameters cho API (province, ward, topK)
 * @param {number} props.limit - Số lượng items hiển thị (default: 10)
 */
export default function RecommendationSection({
  title = "Gợi ý dành cho bạn",
  type = "smart",
  complexId = null,
  params = {},
  limit = 10,
}) {
  const {
    recommendations,
    loading,
    error,
    strategy,
    fetchSimilarComplexes,
    fetchSmartRecommendations,
    fetchPersonalizedRecommendations,
    fetchNewUserRecommendations,
  } = useRecommendation();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch recommendations based on type
  useEffect(() => {
    const fetchParams = { ...params, topK: limit };

    switch (type) {
      case "similar":
        if (complexId) {
          fetchSimilarComplexes(complexId, limit);
        }
        break;
      case "personalized":
        fetchPersonalizedRecommendations(fetchParams);
        break;
      case "new-user":
        fetchNewUserRecommendations(fetchParams);
        break;
      case "smart":
      default:
        fetchSmartRecommendations(fetchParams);
        break;
    }
  }, [type, complexId, JSON.stringify(params), limit]);

  // Handle scroll
  const handleScroll = (direction) => {
    const container = document.getElementById(`recommendation-scroll-${type}`);
    if (!container) return;

    const scrollAmount = 320; // Width of one card + gap
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  // Update scroll buttons state
  const updateScrollButtons = () => {
    const container = document.getElementById(`recommendation-scroll-${type}`);
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = document.getElementById(`recommendation-scroll-${type}`);
    if (!container) return;

    container.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
    };
  }, [recommendations, type]);

  // Hiển thị strategy badge (chỉ để debug)
  const getStrategyBadge = () => {
    if (!strategy) return null;

    const strategyLabels = {
      "location-popularity": "📍 Gần bạn & Phổ biến",
      "content-based-user": "🎯 Cá nhân hóa",
      "complex-similarity": "🔗 Tương tự",
      "similarity": "🔗 Tương tự", // fallback
    };

    return (
      <span className="text-xs text-gray-500 font-normal ml-2">
        ({strategyLabels[strategy] || strategy})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:px-20">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải gợi ý...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 lg:px-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null; // Không hiển thị gì nếu không có gợi ý
  }

  // Nếu số lượng card <= 4, dùng grid layout giống Home
  const useGridLayout = recommendations.length <= 4;

  return (
    <section className="py-10 bg-blue-600">
      <div className="container mx-auto px-4 lg:px-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
          {title}
          {/* {getStrategyBadge()} */}
        </h2>
      </div>

      {/* Grid Layout (khi <= 4 items) */}
      {useGridLayout ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((complex) => (
            <ComplexCard
              key={complex.id}
              complex={{
                id: complex.id,
                name: complex.name,
                street: complex.street,
                ward: complex.ward,
                province: complex.province,
                mainImageUrl: complex.imageUrl,
                phone: complex.phone,
                openingTime: complex.openingTime,
                closingTime: complex.closingTime,
                totalFields: complex.totalFields,
                averageRating: complex.averageRating,
                totalReviews: complex.totalReviews || 0,
                isActive: complex.isActive,
                status: complex.status || 1,
              }}
            />
          ))}
        </div>
      ) : (
        /* Scroll Layout (khi > 4 items) */
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="text-2xl text-gray-700" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all"
              aria-label="Scroll right"
            >
              <FiChevronRight className="text-2xl text-gray-700" />
            </button>
          )}

          {/* Scrollable Grid */}
          <div
            id={`recommendation-scroll-${type}`}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {recommendations.map((complex) => (
              <div
                key={complex.id}
                className="flex-shrink-0 w-[300px]"
              >
                <ComplexCard
                  complex={{
                    id: complex.id,
                    name: complex.name,
                    street: complex.street,
                    ward: complex.ward,
                    province: complex.province,
                    mainImageUrl: complex.imageUrl,
                    phone: complex.phone,
                    openingTime: complex.openingTime,
                    closingTime: complex.closingTime,
                    totalFields: complex.totalFields,
                    averageRating: complex.averageRating,
                    totalReviews: complex.totalReviews || 0,
                    isActive: complex.isActive,
                    status: complex.status || 1,
                  }}
                />
                
                {/* Similarity Score (chỉ hiển thị khi có) */}
                {/* {complex.similarityScore !== undefined && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-green-600 font-semibold">
                      🎯 Độ tương đồng: {(complex.similarityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                )} */}
              </div>
            ))}
          </div>
        </div>
      )}

        {/* CSS for hiding scrollbar */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}
