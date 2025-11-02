import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { NOTIFICATIONS } from "@/api/notifications";
import { showError, showSucccess } from "@/utils/toast";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData?: () => void; 
  notificationData?: any;
}

export function NotificationModal({
  isOpen,
  onClose,
  fetchData,
  notificationData,
}: NotificationModalProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (notificationData) {
      setFormData({
        title: notificationData.title || "",
        content: notificationData.content || "",
      });
      setIsEdit(true);
    } else {
      setFormData({ title: "", content: "" });
      setIsEdit(false);
    }
  }, [notificationData]);

  const clearModal = () => {
    setFormData({ title: "", content: "" });
    setIsEdit(false);
  };

  const handleCloseModal = () => {
    clearModal();
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await NOTIFICATIONS.Post(formData);

      if (response.success) {
        handleCloseModal();
        fetchData?.();
        showSucccess(response.message || "Notification created successfully");
      } else {
        showError(response.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error during submit:", error);
      showError("An error occurred while creating the notification");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!notificationData?._id) {
      showError("Notification ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await NOTIFICATIONS.Update({
        _id: notificationData._id,
        title: formData.title,
        content: formData.content,
      });

      if (response.success) {
        handleCloseModal();
        fetchData?.();
        showSucccess(response.message || "Notification updated successfully");
      } else {
        showError(response.message || "Failed to update notification");
      }
    } catch (error: any) {
      console.error("Error during edit:", error);
      showError(error.response?.data?.message || "An error occurred while updating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="rounded-md font-outfit"
        aria-describedby="notification-description"
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-inter">
              {isEdit ? "Edit Notification" : "Add Notification"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription id="notification-description">
          {isEdit
            ? "Modify the details of the existing notification."
            : "Fill out the fields below to create a new notification."}
        </DialogDescription>

        <form
          onSubmit={isEdit ? handleEditSubmit : handleSubmit}
          className="space-y-4 border border-gray-300 p-5 rounded-md"
        >
          <div className="flex flex-col space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Notification Title
            </label>
            <Input
              type="text"
              name="title"
              placeholder="Enter Notification Title"
              className="rounded-md"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter Content"
              className="rounded-md resize-none"
              value={formData.content || ""}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-between m-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="w-full mx-1 text-black border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-1 text-white hover:bg-[#3449b4]"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
    </Dialog>
  );
}
