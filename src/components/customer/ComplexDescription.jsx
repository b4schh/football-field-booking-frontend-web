import { useState } from "react";
import { MdDescription } from "react-icons/md";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function ComplexDescription({ description }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return (
      <div className="mt-8 bg-white rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <MdDescription size={24} className="text-blue-600" />
          <h3 className="text-xl font-bold">Mô tả chi tiết</h3>
        </div>
        
        <div className="flex flex-col bg-white items-center justify-center py-12 text-gray-400">
          <MdDescription size={48} className="mb-3 opacity-50" />
          <p className="text-base">Chưa có mô tả cho sân này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-2xl font-bold">Mô tả chi tiết</h3>
      </div>

      {/* TEXT */}
      <div
        className={`
          text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full block transition-all duration-300
          ${isExpanded ? "max-h-[2000px]" : "max-h-48 overflow-hidden"}
        `}
      >
        {description}
      </div>

      {/* BUTTON */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
      >
        {isExpanded ? (
          <>
            <span>Thu gọn</span>
            <FiChevronUp size={20} />
          </>
        ) : (
          <>
            <span>Xem thêm nội dung</span>
            <FiChevronDown size={20} />
          </>
        )}
      </button>
    </div>
  );
}
