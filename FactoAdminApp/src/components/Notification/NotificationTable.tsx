import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import SearchBar from "../common/Searchbar";
import { DatePicker } from "../ui/datepicker";
import { NotificationModal } from "./NotificationModal";
import { saveAs } from "file-saver"; 
import { Download } from "lucide-react";
interface NotificationsType {
  _id: string;
  title: string;
  content: string;
}

export default function NotificationsTable({
  notificationsData,
  handleDelete,
  fetchData,
}: {
  notificationsData: NotificationsType[];
  handleDelete: (id: string) => void;
  fetchData: () => void;
}) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [viewNotification, setViewNotification] = useState<NotificationsType | null>(null);

  const closeViewModal = () => {
    setIsViewOpen(false);
    setViewNotification(null);
  };

  const handleCheckboxChange = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notificationsData.map((notification) => notification._id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleExport = () => {
    if (selectedNotifications.length === 0) {
      alert("No notifications selected for export.");
      return;
    }

    const exportData = notificationsData.filter((notification) =>
      selectedNotifications.includes(notification._id)
    );

    const headers = `"Title","Content"`;
    const rows = exportData
      .map(
        (notification) =>
          `"${notification.title.replace(/"/g, '""')}","${notification.content.replace(/"/g, '""')}"`
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    saveAs(blob, "notifications.csv");
  };

  const handleView = (notification: NotificationsType) => {
    setViewNotification(notification);
    setIsViewOpen(true);
  };

  const filteredNotifications = notificationsData.filter((notification) =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center my-2 gap-4">
        <SearchBar onChange={(value) => setSearchQuery(value)} />

        <div className="flex space-x-1">
          <DatePicker body="From" />
          <DatePicker body="To" />
        </div>
      </div>

      <Table>
        <TableCaption>A list of your notifications.</TableCaption>
        <TableHeader className="bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                aria-label="Select all notifications"
              />
            </TableHead>
            <TableHead>Sr.No</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredNotifications.map((notification, index) => (
            <TableRow key={notification._id}>
              <TableCell>
                <Checkbox
                  checked={selectedNotifications.includes(notification._id)}
                  onCheckedChange={() => handleCheckboxChange(notification._id)}
                  aria-label={`Select notification ${notification._id}`}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{notification.title}</TableCell>
              <TableCell className="font-inter line-clamp-2 text-gray-700">
                {notification.content}
              </TableCell>

              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleView(notification)}>View</Button>
                  <Button variant="destructive" onClick={() => handleDelete(notification._id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-white">
          <TableRow>
            <TableCell colSpan={5}>
              {selectedNotifications.length > 0 && (
                <div className="flex justify-between">
                  <span>
                    Selected Notifications: {selectedNotifications.length} of {filteredNotifications.length}
                  </span>
                  <Button onClick={handleExport}><Download /> Export Selected</Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {viewNotification && (
        <NotificationModal
          isOpen={isViewOpen}
          onClose={closeViewModal}
          fetchData={fetchData}
          notificationData={viewNotification}
        />
      )}
    </div>
  );
}
