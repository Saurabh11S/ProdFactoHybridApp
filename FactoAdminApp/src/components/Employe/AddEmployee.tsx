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
import { showError, showSucccess } from "@/utils/toast";
import { EMPLOYEE } from "@/api/employee";
  
  interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    fetchData: () => void;
  }
  
  export function AddEmployee({ isOpen, onClose,fetchData }: AddUserModalProps) {
    const [formData, setFormData] = useState({
      fullName: "",
      phoneNumber: "",
      email: "",
    });
    const [loading, setLoading] = useState(false);
  
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
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(), // Keep as string, backend expects string
      };
  
      setLoading(true);
      try {
        console.log("Submitting payload:", payload);
        const response = await EMPLOYEE.PostEmployee(payload);
  
        if (response.success) {
          onClose();
          fetchData();
          showSucccess(response.message || response.status?.message || "Employee created successfully.");
          // Reset form
          setFormData({
            fullName: "",
            phoneNumber: "",
            email: "",
          });
        } else {
          showError(response.message || response.status?.message || "An error occurred.");
        }
      } catch (error: any) {
        console.error("Error during employee creation:", error);
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          showError("Network error: Unable to connect to server. Please check your connection and try again.");
        } else {
          const errorMessage = 
            error.response?.data?.message || 
            error.response?.data?.status?.message ||
            error.message ||
            "Failed to create employee. Please check your input and try again.";
          showError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
 

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-6 font-outfit">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Employee</DialogTitle>
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
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
  
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-[#344054]">Email</label>
              <Input
                name="email"
                placeholder="Example@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
  

         
  
          <DialogFooter className="mt-6 flex justify-between">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
            type="submit"
             className="w-1/2"
             disabled={loading}
             >{loading ? "Creating..." : "Add Employee"}</Button>
          </DialogFooter> 
          </form>
        </DialogContent>
        
      </Dialog>
    );
  }
  