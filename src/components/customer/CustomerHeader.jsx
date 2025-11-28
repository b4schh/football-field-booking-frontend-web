import { HiOutlineBell } from "react-icons/hi2";
import { FiUser } from "react-icons/fi";
import { useAuthStore, useAuthModalStore } from "../../store";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { isOpen, openAuthModal, closeAuthModal, handleSuccess } = useAuthModalStore();

  const handleUserIconClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 md:px-8 lg:px-20 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden">
              <img
                src="/src/assets/img/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            
            <span className="text-2xl font-bold text-gray-900">DATSAN247</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition">
              <HiOutlineBell size={18} className="text-[#10243A]" />
            </button>

            {/* User button/menu */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={handleUserIconClick}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
              >
                <FiUser size={18} className="text-[#10243A]" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
