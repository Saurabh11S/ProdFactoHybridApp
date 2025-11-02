import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { useEffect, useState } from "react";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EMPLOYEE } from "@/api/employee";
import { showError, showSucccess } from "@/utils/toast";
import { DialogTitle } from "@radix-ui/react-dialog";
  
  interface EmployeeProfileProps {
    isOpen: boolean;
    onClose: () => void;
    fetchData: () => void;
  userId: string;
  }
  
  export function EmployeeProfile({ isOpen, onClose,fetchData,userId }: EmployeeProfileProps) {
    const [isEditing, setIsEditing] = useState(false); 
    const [formData, setFormData] = useState({
      _id: "",
      email: "",
      fullName: "",
      phoneNumber: "",
    });

    const fetchEmployeeData = async (id: string) => {
      try {
        const response = await EMPLOYEE.GetById(id);
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
      if (userId) fetchEmployeeData(userId);
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
        const response = await EMPLOYEE.Update({
          _id: userId,
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,

        });
    
        if (response.success) {
          setIsEditing(false); 
          showSucccess(response.message || "Profile updated successfully");
          fetchEmployeeData(userId); 
          fetchData();
        } else {
          showError(response.message || "Failed to update profile");
        }
      } catch (error: any) {
        console.error("Error during update:", error);
        showError(error.response?.data?.message || "An error occurred while updating");
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-4xl p-11 font-poppins">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
  
                <div>
                  <p className="font-medium text-lg">{formData.fullName} </p>
                  <p className="text-gray-500 text-base">{formData.email}</p>
                </div>
              </div>
  
            </div>
          </DialogHeader>
  
          <form className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1 ">Full Name</label>
              <Input
                name="fullName"
                placeholder="Your Full Name"
                className="text-gray-500"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Input
                name="email"
                placeholder="Example@gmail.com"
                className="text-gray-500"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                name="phoneNumber"
                placeholder="Phone number"
                className="text-gray-500"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>

          </form>
  
          <DialogFooter className="mt-6">
            <Button variant="outline" className="w-32" onClick={onClose}>
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
  