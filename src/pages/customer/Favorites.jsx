import { useEffect } from "react";
import { HiOutlineHeart } from "react-icons/hi";
import PageContainer from "../../components/customer/PageContainer";
import ComplexCard from "../../components/customer/ComplexCard";
import RecommendationSection from "../../components/customer/RecommendationSection";
import { useFavoriteStore, useAuthStore } from "../../store";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const { favorites, fetchMyFavorites, isLoading, error } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    fetchMyFavorites();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchMyFavorites()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sân yêu thích của tôi
            </h1>
            <p className="text-gray-600">
              Danh sách các sân bóng bạn đã lưu để dễ dàng theo dõi
            </p>
          </div>

          {/* Content */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl">
              <HiOutlineHeart size={80} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Chưa có sân yêu thích
              </h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Khám phá và thêm các sân bóng vào danh sách yêu thích để dễ dàng tìm kiếm sau này
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Khám phá sân bóng
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-semibold text-gray-900">{favorites.length}</span> sân
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((complex) => (
                  <ComplexCard key={complex.id} complex={complex} />
                ))}
              </div>
            </>
          )}
        </div>
      </PageContainer>

      {/* Personalized Recommendations for authenticated users */}
      {favorites.length > 0 && (
        <RecommendationSection
          title="Gợi ý dựa trên lịch sử của bạn"
          type="personalized"
          limit={4}
        />
      )}
    </>
  );
}
