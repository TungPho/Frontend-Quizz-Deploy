import { useContext, useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { QuizzContext } from "../context/ContextProvider";
import { toast } from "react-toastify";

const NotificationComponent = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { socket, notifications, setNotifications } = useContext(QuizzContext);
  // Mock notification data

  useEffect(() => {
    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info("Bạn có thông báo mới!");
    });

    return () => {
      socket.off("newNotification");
    };
  }, [setNotifications, socket]);

  const handleNotificationAction = async (notificationId, accepted) => {
    const currentNotification = notifications.find(
      (noti) => noti._id === notificationId
    );
    setNotifications(
      notifications.map((notif) =>
        notif._id === notificationId
          ? { ...notif, isAccepted: accepted }
          : notif
      )
    );
    // update notifications
    const reqUpdateState = fetch(
      `http://localhost:3000/api/v1/notification/${currentNotification._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAccepted: true,
        }),
      }
    );
    socket.emit("notificationResponse", currentNotification, accepted);

    // Show toast based on action
    toast.success(accepted ? "Đã chấp nhận thông báo" : "Đã từ chối thông báo");
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffHours = Math.round((now - notifDate) / (1000 * 60 * 60));

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.round(diffHours / 24)} ngày trước`;
  };

  // Click outside handling
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".notification-panel")) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative notification-panel">
      <button
        className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 relative"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      >
        <CiBellOn className="text-xl text-gray-600" />
        {notifications.filter((n) => n.isAccepted === null).length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <div
        className={`absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
          isNotificationOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-800 text-lg">Thông báo</h3>
          {notifications.length > 0 && (
            <button
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => {
                // Mark all as read functionality would go here
                toast.info("Đã đánh dấu tất cả là đã đọc");
              }}
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-5 text-center text-gray-500">
              Bạn không có thông báo nào
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  notification.isAccepted === null ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-gray-700 font-medium">
                    {notification.content}
                  </p>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>

                {notification.isAccepted === null && (
                  <div className="flex justify-end space-x-3 mt-3">
                    <button
                      onClick={() =>
                        handleNotificationAction(notification._id, false)
                      }
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-400 text-white text-sm rounded transition-colors"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() =>
                        handleNotificationAction(notification._id, true)
                      }
                      className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                    >
                      Chấp nhận
                    </button>
                  </div>
                )}

                {notification.isAccepted === true && (
                  <div className="flex justify-end mt-1">
                    <span className="text-sm text-green-500">Đã chấp nhận</span>
                  </div>
                )}

                {notification.isAccepted === false && (
                  <div className="flex justify-end mt-1">
                    <span className="text-sm text-gray-500">Đã từ chối</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              // View all notifications functionality
              toast.info("Chuyển đến trang tất cả thông báo");
            }}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
