import React, { useRef, useState } from "react";
import ComplexCard from "./ComplexCard";

export default function FeaturedCards() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Fake data (giữ nguyên như trước)
  const items = [
    {
      id: 1,
      name: "Sân bóng Mỹ Đình",
      ward: "Phường Mỹ Đình 1",
      province: "Hà Nội",
      phone: "0988 123 456",
      openingTime: "06:00:00",
      closingTime: "22:00:00",
      imageUrl: "https://placehold.co/348x192?text=San+1",
      status: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Sân bóng Phú Thọ",
      ward: "Phường 15",
      province: "TP Hồ Chí Minh",
      phone: "0909 888 777",
      openingTime: "07:00:00",
      closingTime: "23:00:00",
      imageUrl: "https://placehold.co/348x192?text=San+2",
      status: 1,
      isActive: true,
    },
    {
      id: 3,
      name: "Sân bóng Hòa Xuân",
      ward: "Hòa Xuân",
      province: "Đà Nẵng",
      phone: "0933 555 222",
      openingTime: "05:30:00",
      closingTime: "21:00:00",
      imageUrl: "https://placehold.co/348x192?text=San+3",
      status: 0,
      isActive: true,
    },
    {
      id: 4,
      name: "Sân bóng Quận 7",
      ward: "Tân Phong",
      province: "TP Hồ Chí Minh",
      phone: "0977 333 111",
      openingTime: "06:00:00",
      closingTime: "22:00:00",
      imageUrl: "https://placehold.co/348x192?text=San+4",
      status: 1,
      isActive: false,
    },
  ];

  // --- Drag to scroll handlers ---
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);

  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1; // tốc độ kéo
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="py-10 bg-blue-600">
      <div className="container mx-auto px-2 lg:px-20">
        <h2 className="text-white text-2xl font-bold mb-6">Sân nổi bật</h2>

        <div
          ref={scrollRef}
          className="flex gap-6 pb-3 cursor-grab select-none"
          style={{
            overflow: "hidden", // ❌ bỏ scrollbar
            whiteSpace: "nowrap",
          }}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] flex-shrink-0 inline-block"
            >
              <ComplexCard complex={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
