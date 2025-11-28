import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const TOAST_TYPES = {
  success: {
    icon: FiCheckCircle,
    className: 'bg-green-50 border-green-500 text-green-800',
    iconColor: 'text-green-500'
  },
  error: {
    icon: FiAlertCircle,
    className: 'bg-red-50 border-red-500 text-red-800',
    iconColor: 'text-red-500'
  },
  info: {
    icon: FiInfo,
    className: 'bg-blue-50 border-blue-500 text-blue-800',
    iconColor: 'text-blue-500'
  },
  warning: {
    icon: FiAlertCircle,
    className: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    iconColor: 'text-yellow-500'
  }
};

export function Toast({ id, type = 'info', message, duration = 3000, onClose }) {
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg max-w-md animate-slide-in ${config.className}`}>
      <Icon className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} size={20} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition"
      >
        <FiX size={18} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}
