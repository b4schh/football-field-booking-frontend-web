import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

export default function ImageGallery({ images = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const count = images.length;

  // mở lightbox
  const openLightbox = (index = 0) => {
    setSelected(index);
    setLightboxOpen(true);
  };

  // đóng lightbox
  const closeLightbox = () => setLightboxOpen(false);

  const next = () => setSelected((prev) => (prev + 1) % images.length);
  const prev = () =>
    setSelected((prev) => (prev - 1 + images.length) % images.length);

  // Thêm handler để thay đổi index trực tiếp
  const handleIndexChange = (index) => setSelected(index);

  // Render placeholder nếu thiếu ảnh
  const getImg = (index) =>
    images[index] ? (
      <img
        src={images[index]}
        alt=""
        onClick={() => openLightbox(index)} // ẤN VÀO ẢNH ĐỂ MỞ LIGHTBOX
        className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
      />
    ) : (
      <div className="w-full h-full bg-gray-300 rounded-xl" />
    );

  return (
    <>
      <div className="relative w-full max-w-full h-[340px] grid grid-cols-12 grid-rows-12 gap-2">
        {/* === CASE 1 === */}
        {count === 1 && (
          <div className="col-span-12 row-span-12">{getImg(0)}</div>
        )}

        {/* === CASE 2 === */}
        {count === 2 && (
          <>
            <div className="col-span-12 row-span-6">{getImg(0)}</div>
            <div className="col-span-12 row-span-6">{getImg(1)}</div>
          </>
        )}

        {/* === CASE 3 === */}
        {count === 3 && (
          <>
            <div className="col-span-7 row-span-12">{getImg(0)}</div>
            <div className="col-span-5 row-span-6">{getImg(1)}</div>
            <div className="col-span-5 row-span-6">{getImg(2)}</div>
          </>
        )}

        {/* === CASE 4 === */}
        {count === 4 && (
          <>
            <div className="col-span-7 row-span-12">{getImg(0)}</div>
            <div className="col-span-5 row-span-4">{getImg(1)}</div>
            <div className="col-span-5 row-span-4">{getImg(2)}</div>
            <div className="col-span-5 row-span-4">{getImg(3)}</div>
          </>
        )}

        {/* === CASE 5+ === */}
        {count >= 5 && (
          <>
            {/* Ảnh 1 */}
            <div className="row-start-1 row-end-9 col-start-1 col-end-8">
              {getImg(0)}
            </div>

            {/* Ảnh 2 */}
            <div className="row-start-9 row-end-13 col-start-1 col-end-4">
              {getImg(1)}
            </div>

            {/* Ảnh 3 */}
            <div className="row-start-9 row-end-13 col-start-4 col-end-8">
              {getImg(2)}
            </div>

            {/* Ảnh 4 */}
            <div className="row-start-1 row-end-6 col-start-8 col-end-13">
              {getImg(3)}
            </div>

            {/* Ảnh 5 */}
            <div className="row-start-6 row-end-13 col-start-8 col-end-13">
              {getImg(4)}
            </div>
          </>
        )}

        {/* NÚT XEM TẤT CẢ */}
        {count > 5 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/40 text-white 
                       text-xs backdrop-blur-sm rounded-lg flex items-center gap-1 
                       hover:bg-black/60 transition-colors"
          >
            Xem tất cả ({count})
          </button>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          index={selected}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
          onIndexChange={handleIndexChange}
        />
      )}
    </>
  );
}