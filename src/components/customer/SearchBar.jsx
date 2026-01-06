import { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FaAngleDown, FaCheck, FaFilter } from "react-icons/fa6";
import { RiResetLeftLine } from "react-icons/ri";
import { useComplexStore } from "../../store";
import { locationService } from "../../services";

function Divider() {
  return <div className="w-px h-6 bg-gray-400/60" />;
}

// Dropdown component with select functionality
function FilterDropdown({ label, value, options, onChange, placeholder = "Tất cả" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 min-w-[100px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col text-left"
      >
        <div className="flex items-center gap-1">
          <p className="text-[15px] text-black font-medium">{label}</p>
          <FaAngleDown
            size={14}
            className={`text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        <p className="text-[15px] text-gray-500 truncate">
          {value || placeholder}
        </p>
      </button>

      {isOpen && options && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.label);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                value === option.label ? "bg-green-50" : ""
              }`}
            >
              <span className="text-[14px]">{option.label}</span>
              {value === option.label && (
                <FaCheck size={14} className="text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Surface Type options
const SURFACE_TYPES = [
  { value: null, label: "Tất cả" },
  { value: "Cỏ tự nhiên", label: "Cỏ tự nhiên" },
  { value: "Cỏ nhân tạo", label: "Cỏ nhân tạo" },
];

// Field Size options
const FIELD_SIZES = [
  { value: null, label: "Tất cả" },
  { value: "Sân 5 người", label: "Sân 5 người" },
  { value: "Sân 7 người", label: "Sân 7 người" },
  { value: "Sân 11 người ", label: "Sân 11 người" },
];

// Price range options
const PRICE_RANGES = [
  { value: null, label: "Tất cả" },
  { value: "0-200000", label: "Dưới 200k" },
  { value: "200000-400000", label: "200k - 400k" },
  { value: "400000-600000", label: "400k - 600k" },
  { value: "600000-1000000", label: "600k - 1tr" },
  { value: "1000000-999999999", label: "Trên 1tr" },
];

// Rating options
const RATING_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: "4.5-5", label: "4.5★ trở lên" },
  { value: "4-5", label: "4★ trở lên" },
  { value: "3.5-5", label: "3.5★ trở lên" },
  { value: "3-5", label: "3★ trở lên" },
];

export default function SearchBar({ onLocationChange }) {
  const { searchComplexes, fetchComplexes, clearSearchParams } = useComplexStore();
  
  // Location data from API
  const [provinces, setProvinces] = useState([{ value: null, label: "Tất cả" }]);
  const [wards, setWards] = useState([{ value: null, label: "Tất cả" }]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  
  const [searchName, setSearchName] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Tất cả");
  const [selectedWard, setSelectedWard] = useState("Tất cả");
  const [selectedSurfaceType, setSelectedSurfaceType] = useState("Tất cả");
  const [selectedFieldSize, setSelectedFieldSize] = useState("Tất cả");
  const [selectedRating, setSelectedRating] = useState("Tất cả");
  const [selectedPrice, setSelectedPrice] = useState("Tất cả");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await locationService.getProvinces();
        
        if (data && Array.isArray(data)) {
          const provinceOptions = [
            { value: null, label: "Tất cả" },
            ...data.map(province => ({
              value: province.code,
              label: province.name
            }))
          ];
          setProvinces(provinceOptions);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch wards when province changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedProvinceCode) {
        setWards([{ value: null, label: "Tất cả" }]);
        return;
      }

      setIsLoadingWards(true);
      try {
        const data = await locationService.getWardsByProvince(selectedProvinceCode);
        if (data && Array.isArray(data)) {
          const wardOptions = [
            { value: null, label: "Tất cả" },
            ...data.map(ward => ({
              value: ward.code,
              label: ward.name
            }))
          ];
          setWards(wardOptions);
        }
      } catch (error) {
        console.error("Failed to fetch wards:", error);
        setWards([{ value: null, label: "Tất cả" }]);
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchWards();
  }, [selectedProvinceCode]);

  // Handle province selection
  const handleProvinceChange = (provinceName) => {
    setSelectedProvince(provinceName);
    
    // Find province code for fetching wards
    const province = provinces.find(p => p.label === provinceName);
    setSelectedProvinceCode(province?.value || null);
    
    // Reset ward selection when province changes
    setSelectedWard("Tất cả");

    // Notify parent component about location change
    if (onLocationChange) {
      onLocationChange({
        province: provinceName === "Tất cả" ? null : provinceName,
        ward: null,
      });
    }
  };

  // Handle ward selection
  const handleWardChange = (wardName) => {
    setSelectedWard(wardName);

    // Notify parent component about location change
    if (onLocationChange) {
      onLocationChange({
        province: selectedProvince === "Tất cả" ? null : selectedProvince,
        ward: wardName === "Tất cả" ? null : wardName,
      });
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);

    // Build search params
    const searchParams = {
      pageIndex: 1,
      pageSize: 12,
    };

    // Add name if entered
    if (searchName.trim()) {
      searchParams.name = searchName.trim();
    }

    // Add province filter
    if (selectedProvince && selectedProvince !== "Tất cả") {
      searchParams.province = selectedProvince;
    }

    // Add ward filter
    if (selectedWard && selectedWard !== "Tất cả") {
      searchParams.ward = selectedWard;
    }

    // Add surface type filter
    if (selectedSurfaceType && selectedSurfaceType !== "Tất cả") {
      searchParams.surfaceType = selectedSurfaceType;
    }

    // Add field size filter
    if (selectedFieldSize && selectedFieldSize !== "Tất cả") {
      searchParams.fieldSize = selectedFieldSize;
    }

    // Add rating filter
    if (selectedRating && selectedRating !== "Tất cả") {
      const ratingOption = RATING_OPTIONS.find(r => r.label === selectedRating);
      if (ratingOption?.value) {
        const [min, max] = ratingOption.value.split("-");
        searchParams.minRating = parseFloat(min);
        searchParams.maxRating = parseFloat(max);
      }
    }

    // Add price filter
    if (selectedPrice && selectedPrice !== "Tất cả") {
      const priceOption = PRICE_RANGES.find(p => p.label === selectedPrice);
      if (priceOption?.value) {
        const [min, max] = priceOption.value.split("-");
        searchParams.minPrice = parseFloat(min);
        searchParams.maxPrice = parseFloat(max);
      }
    }

    await searchComplexes(searchParams);
    setIsSearching(false);
  };

  const handleReset = async () => {
    setSearchName("");
    setSelectedProvince("Tất cả");
    setSelectedProvinceCode(null);
    setSelectedWard("Tất cả");
    setSelectedSurfaceType("Tất cả");
    setSelectedFieldSize("Tất cả");
    setSelectedRating("Tất cả");
    setSelectedPrice("Tất cả");
    
    // Notify parent component about location reset
    if (onLocationChange) {
      onLocationChange(null);
    }
    
    // Clear search params and fetch all complexes without filters
    clearSearchParams();
    await fetchComplexes({ pageIndex: 1, pageSize: 12 });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-4 bg-[#f6f6f6]">
      <div className="container mx-auto px-2 lg:px-20">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Main search row - always visible */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center px-4 py-3 gap-3">
            {/* Search box */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md flex-shrink-0 w-full lg:w-[350px] hover:bg-gray-200 transition-colors">
              <CiSearch className="text-gray-600" size={20} />
              <input
                type="text"
                placeholder="Tìm sân bóng theo tên..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-transparent text-[14px] text-gray-700 placeholder:text-gray-500 outline-none flex-1"
              />
            </div>

            {/* Desktop: Show all filters inline */}
            <div className="hidden lg:flex items-center gap-3 flex-1">
              <Divider />

              <FilterDropdown
                label="Tỉnh/Thành"
                value={selectedProvince}
                options={provinces}
                onChange={handleProvinceChange}
                placeholder={isLoadingProvinces ? "Đang tải..." : "Tất cả"}
              />
              
              <Divider />

              <FilterDropdown
                label="Phường/Xã"
                value={selectedWard}
                options={wards}
                onChange={handleWardChange}
                placeholder={isLoadingWards ? "Đang tải..." : "Tất cả"}
              />
              
              <Divider />

              <FilterDropdown
                label="Loại sân"
                value={selectedSurfaceType}
                options={SURFACE_TYPES}
                onChange={setSelectedSurfaceType}
              />
              
              <Divider />

              <FilterDropdown
                label="Số người"
                value={selectedFieldSize}
                options={FIELD_SIZES}
                onChange={setSelectedFieldSize}
              />
              
              <Divider />

              <FilterDropdown
                label="Đánh giá"
                value={selectedRating}
                options={RATING_OPTIONS}
                onChange={setSelectedRating}
              />
              
              <Divider />

              <FilterDropdown
                label="Mức giá"
                value={selectedPrice}
                options={PRICE_RANGES}
                onChange={setSelectedPrice}
              />

              <Divider />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {/* Mobile: Filter toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-gray-600 text-white px-4 py-2 rounded-md text-[15px] hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaFilter size={16} />
                Bộ lọc
              </button>

              {/* Search button */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#142239] text-white px-5 py-2 rounded-md text-[15px] hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <CiSearch size={18} />
                    <span className="hidden sm:inline">Tìm sân</span>
                  </>
                )}
              </button>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="bg-[#e21f1d] text-white p-2 rounded-md hover:bg-[#c71a18] transition-colors"
                title="Đặt lại bộ lọc"
              >
                <RiResetLeftLine size={18} />
              </button>
            </div>
          </div>

          {/* Mobile: Collapsible filters */}
          {showFilters && (
            <div className="lg:hidden border-t border-gray-200 px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <FilterDropdown
                  label="Tỉnh/Thành"
                  value={selectedProvince}
                  options={provinces}
                  onChange={handleProvinceChange}
                  placeholder={isLoadingProvinces ? "Đang tải..." : "Tất cả"}
                />

                <FilterDropdown
                  label="Phường/Xã"
                  value={selectedWard}
                  options={wards}
                  onChange={handleWardChange}
                  placeholder={isLoadingWards ? "Đang tải..." : "Tất cả"}
                />

                <FilterDropdown
                  label="Loại sân"
                  value={selectedSurfaceType}
                  options={SURFACE_TYPES}
                  onChange={setSelectedSurfaceType}
                />

                <FilterDropdown
                  label="Số người"
                  value={selectedFieldSize}
                  options={FIELD_SIZES}
                  onChange={setSelectedFieldSize}
                />

                <FilterDropdown
                  label="Đánh giá"
                  value={selectedRating}
                  options={RATING_OPTIONS}
                  onChange={setSelectedRating}
                />

                <FilterDropdown
                  label="Mức giá"
                  value={selectedPrice}
                  options={PRICE_RANGES}
                  onChange={setSelectedPrice}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
