import { createPortal } from "react-dom";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function ImageLightbox({ images, index, onClose, onPrev, onNext, onIndexChange }) {
  const [touchStart, setTouchStart] = useState(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Touch swipe (mobile)
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      diff > 0 ? onNext() : onPrev();
    }
    setTouchStart(null);
  };

  if (!images || images.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent 
                   flex items-center justify-between px-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white/90 text-sm font-medium">
          {index + 1} / {images.length}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white/90 text-2xl p-2 hover:bg-white/10 rounded-lg transition-all"
          title="Close (Esc)"
        >
          <FiX />
        </button>
      </div>

      {/* Main image area */}
      <div className="flex items-center justify-center w-full h-full px-4 md:px-20">

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="hidden md:flex text-white/80 text-5xl p-4 hover:bg-white/10 rounded-full transition-all 
                       hover:scale-110 active:scale-95"
            title="Previous (←)"
          >
            <FiChevronLeft />
          </button>
        )}

        {/* Image */}
        <div
          className="flex-1 flex items-center justify-center mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[index]}
            className="
              max-h-[85vh] max-w-[85vw]
              object-contain rounded-lg shadow-2xl
              transition-all duration-300
            "
            alt={`Image ${index + 1}`}
            loading="lazy"
          />
        </div>

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="hidden md:flex text-white/80 text-5xl p-4 hover:bg-white/10 rounded-full transition-all 
                       hover:scale-110 active:scale-95"
            title="Next (→)"
          >
            <FiChevronRight />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent 
                     pt-8 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2 overflow-x-auto px-6 pb-2 
                          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onIndexChange?.(i)}
                className={`
                  flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 
                  transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${
                    i === index
                      ? "border-white shadow-xl scale-105"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={`Thumbnail ${i + 1}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile navigation dots */}
      {images.length > 1 && (
        <div className="md:hidden absolute top-20 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((_, i) => (
            <div
              key={i}
              className={`
                h-1.5 rounded-full transition-all duration-200
                ${i === index ? "w-8 bg-white" : "w-1.5 bg-white/40"}
              `}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
