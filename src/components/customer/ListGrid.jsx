import React from "react";
import ComplexCard from "./ComplexCard";

export default function ListGrid() {
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: `Sân bóng BKC Linh Đường`,
  }));

  return (
    <section className="py-10 bg-neutral-100">
      <div className="container mx-auto px-2 lg:px-20">
        <h2 className="text-[#142239] text-2xl font-bold mb-6">
          Danh sách sân
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <ComplexCard key={it.id} title={it.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
