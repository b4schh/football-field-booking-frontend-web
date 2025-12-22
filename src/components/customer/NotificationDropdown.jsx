import { useState, useRef, useEffect } from "react";
import { HiOutlineBell } from "react-icons/hi2";
import { 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineInformationCircle,
  HiOutlineClock 
} from "react-icons/hi";
import useNotificationStore from "../../store/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Load notifications and unread count when component mounts (not just on open)
  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
    fetchUnreadCount();
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMoreNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 1: // Success
        return <HiOutlineCheckCircle className="text-green-500" size={20} />;
      case 2: // Error
        return <HiOutlineXCircle className="text-red-500" size={20} />;
      case 3: // Warning
        return <HiOutlineClock className="text-yellow-500" size={20} />;
      default: // Info
        return <HiOutlineInformationCircle className="text-blue-500" size={20} />;
    }
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
      >
        <HiOutlineBell size={18} className="text-[#10243A]" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-gray-500">({unreadCount} mới)</span>
              )}
            </h3>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <HiOutlineBell size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                      !notif.isRead ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {notif.title}
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Đánh dấu đã đọc"
                              >
                                <HiOutlineCheckCircle size={16} className="text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notif.id)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                              title="Xóa"
                            >
                              <HiOutlineXCircle size={16} className="text-gray-500" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notif.createdAt)}
                          </span>
                          
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="px-4 py-3 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {isLoading ? "Đang tải..." : "Xem thêm"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
