import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row justify-between gap-16">
        {/* LEFT SECTION */}
        <div className="lg:w-[480px] flex flex-col justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden">
              <img
                src="/src/assets/img/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-2xl font-bold text-white">DATSAN247</span>
          </div>

          {/* Social icons */}
          <div className="flex gap-4 mt-6">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <FaFacebookF className="text-white text-lg" />
            </div>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <FaInstagram className="text-white text-lg" />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Top link rows */}
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            {/* 3 columns */}
            <div className="flex gap-20">
              {/* Dịch vụ */}
              <div className="flex flex-col gap-6">
                <p className="text-gray-300 text-xs opacity-50">Dịch vụ</p>
                <div className="flex flex-col gap-1 text-sm">
                  <span>Trang chủ</span>
                  <span>Danh sách sân</span>
                  <span>Đăng ký sử dụng</span>
                </div>
              </div>

              {/* Thông tin */}
              <div className="flex flex-col gap-6">
                <p className="text-gray-300 text-xs opacity-50">Thông tin</p>
                <div className="flex flex-col gap-1 text-sm">
                  <span>Giới thiệu</span>
                  <span>Hợp tác</span>
                  <span>Hotline: ...</span>
                  <span>Email: ...</span>
                  <span>Địa chỉ: ...</span>
                </div>
              </div>

              {/* Chính sách */}
              <div className="flex flex-col gap-6">
                <p className="text-gray-300 text-xs opacity-50">Chính sách</p>
                <div className="flex flex-col gap-1 text-sm">
                  <span>Chính sách bảo mật</span>
                  <span>Điều khoản sử dụng</span>
                </div>
              </div>
            </div>

            {/* Button Liên hệ hợp tác */}
            <button className="h-fit bg-amber-700 px-6 py-3 rounded-full text-sm hover:bg-amber-600 transition">
              Liên hệ hợp tác
            </button>
          </div>

          {/* Bottom info */}
          <div className="flex justify-between items-end mt-20 relative">
            {/* Contact info + small yellow line */}
            <div className="flex flex-col gap-1 text-sm relative">
              <span>+84 ...</span>
              <span>info@logoipsum.com</span>

              {/* Horizontal line */}
              <span className="absolute -top-6 w-12 h-[2px] bg-amber-700"></span>
            </div>

            {/* Copyright */}
            <span className="text-xs opacity-50 text-gray-300">
              © 2025 — Copyright
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
