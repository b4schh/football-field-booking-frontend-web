import { CiSearch } from "react-icons/ci";
import { FaAngleDown } from "react-icons/fa6";
import { RiResetLeftLine } from "react-icons/ri";

function Divider() {
  return <div className="w-px h-6 bg-gray-400/60" />;
}

function FilterDropdown({ label, value }) {
  return (
    <div className="flex flex-col flex-1 min-w-[80px]">
      <div className="flex items-center gap-1">
        <p className="text-[15px] text-black">{label}</p>
        <FaAngleDown size={14} className="text-gray-600" />
      </div>
      <p className="text-[15px] text-gray-500">{value}</p>
    </div>
  );
}

export default function SearchFilter() {
  return (
    <section className="py-4 bg-[#f6f6f6]">
      <div className="container mx-auto px-2 lg:px-20">
        <div className="bg-white rounded-lg">
          <div className="flex items-center px-4 py-3 gap-3">
            {/* Search box */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md flex-shrink-0 w-[300px] lg:w-[450px]">
              <CiSearch className="text-gray-600" />
              <p className="text-[13px] text-gray-500">Tìm sân bóng</p>
            </div>

            <Divider />

            {/* Filters */}
            <FilterDropdown label="Khu vực" value="Tất cả" />
            <Divider />

            <FilterDropdown label="Đánh giá" value="Tất cả" />
            <Divider />

            <FilterDropdown label="Mức giá" value="Tất cả" />

            <Divider />

            {/* Search button */}
            <button className="bg-[#142239] text-white px-4 py-2 rounded-md text-[15px]">
              Tìm sân
            </button>

            {/* Reset button */}
            <button className="bg-[#e21f1d] text-white p-2 rounded-md">
              <RiResetLeftLine size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
