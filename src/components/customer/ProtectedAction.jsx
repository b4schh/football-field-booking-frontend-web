import { useAuthStore, useAuthModalStore } from "../../store";

/**
 * Component wrapper cho các action cần đăng nhập
 * Nếu chưa đăng nhập, tự động mở modal đăng nhập
 * Sau khi đăng nhập thành công, thực hiện action
 * 
 * @param {Function} onClick - Callback khi click (sẽ được gọi sau khi đăng nhập nếu cần)
 * @param {boolean} disabled - Disable action
 * @param {string} className - CSS classes
 * @param {ReactNode} children - Nội dung bên trong
 */
export default function ProtectedAction({ 
  children, 
  onClick, 
  disabled,
  className = "",
  ...restProps 
}) {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      
      // Mở modal đăng nhập và lưu callback
      openAuthModal(() => {
        // Sau khi đăng nhập thành công, thực hiện action ban đầu
        if (onClick) {
          onClick(e);
        }
      });
    } else {
      // Đã đăng nhập, thực hiện action bình thường
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className={className}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  );
}
