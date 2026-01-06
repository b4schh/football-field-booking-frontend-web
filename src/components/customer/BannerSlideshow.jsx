import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { bannerService } from "../../services/bannerService";

export default function BannerSlideshow() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await bannerService.getActiveBanners();
        if (response.success && response.data) {
          setBanners(response.data);
        }
      } catch (error) {
        console.error("Error loading banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-200 animate-pulse">
        <div className="container mx-auto px-4 lg:px-20 h-full flex items-center justify-center">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Không hiển thị gì nếu không có banner
  }

  return (
    <section
      className="relative w-full h-[300px] md:h-[600px] bg-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {banner.link ? (
              <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.title || `Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Title Overlay (nếu có) */}
            {banner.title && (
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
                <div className="container mx-auto px-4 lg:px-20">
                  <h3 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-white text-sm md:text-base mt-2 drop-shadow-lg max-w-2xl">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 group"
            aria-label="Previous banner"
          >
            <FiChevronLeft className="text-xl md:text-2xl text-gray-800 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 group"
            aria-label="Next banner"
          >
            <FiChevronRight className="text-xl md:text-2xl text-gray-800 group-hover:text-blue-600" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
