import React, { useEffect, useState } from "react";
import * as Icons from "react-icons/ri";
import { ScrollArea } from "../ui/scroll-area";
import { NOTIFICATIONS } from "@/api/notifications";
import { showError, showSucccess } from "@/utils/toast";

interface NotificationType {
  _id: string;
  icon: string;
  content: string;
  createdAt: string;
}

const NotificationBar: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Notifications from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await NOTIFICATIONS.Get();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load notifications");
    } finally {
      showSucccess("Fetched Successfully")
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 md:max-w-lg lg:max-w-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-800 md:text-lg">Notifications</h2>
        <button className="text-sm text-gray-500 hover:text-gray-800 focus:outline-none">
          Today ▼
        </button>
      </div>

      <ScrollArea className="max-h-[3200px] sm:max-h-[280px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications available.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = Icons[notification.icon as keyof typeof Icons] || Icons.RiNotification2Line;
              return (
                <li
                  key={notification._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 ease-in-out"
                >
                  <div className="flex-shrink-0 p-2 bg-[#253483] text-white rounded-full">
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 md:text-sm">{notification.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationBar;
