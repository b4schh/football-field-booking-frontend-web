import { useState } from "react";
import BannerSlideshow from "../components/customer/BannerSlideshow";
import SearchBar from "../components/customer/SearchBar";
import ComplexListGrid from "../components/customer/ComplexListGrid";
import RecommendationSection from "../components/customer/RecommendationSection";
import useUserLocation from "../hooks/useUserLocation";
import { FiMapPin } from "react-icons/fi";

export default function Home() {
  const { location, source, isDetecting } = useUserLocation();
  const [searchLocation, setSearchLocation] = useState(null);

  // Use search location if available, otherwise use detected location
  const effectiveLocation = searchLocation || location;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <SearchBar onLocationChange={setSearchLocation} />
        
        {/* Banner Slideshow - Events Section */}
        <BannerSlideshow />
        
        {/* Location Badge */}
        {effectiveLocation?.province && (
          <div className="container mx-auto px-4 lg:px-20 -mt-4 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm">
              <FiMapPin className="text-blue-600" />
              <span className="text-blue-700">
                Đang hiển thị sân tại: <strong>{effectiveLocation.province}</strong>
                {effectiveLocation.ward && `, ${effectiveLocation.ward}`}
              </span>
              {source === "auto" && (
                <span className="text-blue-500 text-xs">(Tự động phát hiện)</span>
              )}
            </div>
          </div>
        )}

        {isDetecting && (
          <div className="container mx-auto px-4 lg:px-20 -mt-4 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Đang phát hiện vị trí...</span>
            </div>
          </div>
        )}
        
        {/* Smart Recommendation Section with Location */}
        <RecommendationSection
          title="Gợi ý dành cho bạn"
          type="smart"
          params={{
            province: effectiveLocation?.province,
            ward: effectiveLocation?.ward,
          }}
          limit={4}
        />
        
        <ComplexListGrid />
      </main>
    </div>
  );
}
