import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { USERS } from "@/api/user";
import { showError, showSucccess } from "@/utils/toast";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
}

export function AddUserModal({ isOpen, onClose, fetchData }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    aadharNumber: "",
    panNumber: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Validate Full Name
    if (!formData.fullName) errors.push("Full Name is required.");

    // Validate Phone Number (10-digit Indian mobile number)
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.push("Please enter a valid 10-digit Indian mobile number.");
    }

    // Validate Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    // Validate Password
    if (!formData.password || formData.password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }

    // Validate Aadhar Number (12 digits)
    if (!/^\d{12}$/.test(formData.aadharNumber)) {
      errors.push("Please enter a valid 12-digit Aadhar number.");
    }

    // Validate PAN Number (e.g., ABCDE1234F)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      errors.push("Please enter a valid PAN number (e.g., ABCDE1234F).");
    }

    // Validate Date of Birth (must be at least 18 years old)
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const isOver18 =
      age > 18 || (age === 18 && today >= new Date(dob.setFullYear(dob.getFullYear() + 18)));

    if (!isOver18) {
      errors.push("Date of Birth must indicate an age of at least 18 years.");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors.join(" "));
      return;
    }

    const payload = {
      ...formData,
      phoneNumber: Number(formData.phoneNumber),
      aadharNumber: Number(formData.aadharNumber),
    };

    try {
      console.log("Submitting payload:", payload);
      const response = await USERS.PostUser(payload);


      if (response.success) {
        onClose();
        fetchData();
        showSucccess(response.message || "User created successfully.");
      } else {
        showError(response.message || "An error occurred.");
      }
    } catch (error: any) {
      console.error("Error during user creation:", error);
      showError(
        error.response?.data?.message ||
          "Failed to create user. Please check your input and try again."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 font-outfit">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#344054]">Full Name</label>
            <Input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#344054]">Phone Number</label>
            <Input
              name="phoneNumber"
              type="number"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-[#344054]">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-[#344054]">Password</label>
            <Input
              name="password"
              type="password"
              placeholder="******"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#344054]">Date of Birth</label>
            <Input
              name="dateOfBirth"
              type="date"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#344054]">Aadhar Number</label>
            <Input
              name="aadharNumber"
              type="number"
              placeholder="xxxx xxx xxxx"
              value={formData.aadharNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-[#344054]">PAN Number</label>
            <Input
              name="panNumber"
              placeholder="xxx xxx xxx"
              value={formData.panNumber}
              onChange={handleInputChange}
            />
          </div>

          <DialogFooter className="mt-6 flex justify-between">
            <Button variant="outline" className="w-1/2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="w-1/2">
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
    </Dialog>
  );
}
