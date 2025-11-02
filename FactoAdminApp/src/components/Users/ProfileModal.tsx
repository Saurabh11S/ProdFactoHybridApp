import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USERS } from "@/api/user";
import { showError, showSucccess } from "@/utils/toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
  userId: string;
}

export function ProfileModal({
  isOpen,
  onClose,
  userId,
  fetchData,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    aadharNumber: "",
    panNumber: "",
    dateOfBirth: "",
  });

  const fetchUserData = async (id: string) => {
    try {
      const response = await USERS.GetById(id);
      if (response.data && response.data.user) {
        setFormData(response.data.user);
      } else {
        console.warn("No user data found for ID:", id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData(userId);
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await USERS.Update({
        _id: userId,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        dateOfBirth: formData.dateOfBirth,
      });

      if (response.success) {
        setIsEditing(false);
        showSucccess(response.message || "Profile updated successfully");
        fetchUserData(userId);
        fetchData();
      } else {
        showError(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error during update:", error);
      showError(
        error.response?.data?.message || "An error occurred while updating"
      );
    }
  };

  // if (!formData.fullName && !isEditing) {
  //   return <p>Loading...</p>;
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-11 font-poppins">
        <DialogTitle>Users Profile</DialogTitle>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{formData.fullName}</p>
                <p className="text-gray-500 text-base">{formData.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline">Payment History</Button>
            </div>
          </div>
        </DialogHeader>

        {/* Form for user profile data */}
        <form className="grid grid-cols-2 gap-4 mt-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              name="fullName"
              placeholder="Your Full Name"
              value={formData.fullName || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <Input
              name="email"
              placeholder="example@gmail.com"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <Input
              name="phoneNumber"
              placeholder="Phone number"
              value={formData.phoneNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <Input
              name="dateOfBirth"
              type="date"
              placeholder="Date of Birth"
              value={
                formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""
              }
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Aadhar Number
            </label>
            <Input
              name="aadharNumber"
              placeholder="Aadhar Number"
              value={formData.aadharNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">PAN Number</label>
            <Input
              name="panNumber"
              placeholder="PAN Number"
              value={formData.panNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </form>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isEditing ? (
            <Button onClick={handleEditClick}>Edit Profile</Button>
          ) : (
            <Button onClick={handleSaveClick}>Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
