import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
import { useState } from "react";
import { REQCALL } from "@/api/reqcall";
import { showError, showSucccess } from "@/utils/toast";
  
  interface ReqCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    fetchData: () => void;
  }

  
  export function ReqCallModal({ isOpen, onClose,fetchData }: ReqCallModalProps) {

    // const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
  
    const [formData, setFormData] = useState({
      phoneNo: "",
    });

    const clearModal = () => {
        setFormData({ phoneNo: "" });
        // setIsEdit(false);
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
          const response = await REQCALL.Post(formData);
    
          if (response.success) {
            handleCloseModal();
            fetchData();
            showSucccess(response.message || "Request created successfully");
          } else {
            showError(response.message || "An error occurred");
          }
        } catch (error) {
          console.error("Error during submit:", error);
          showError("An error occurred while creating the request");
        } finally {
          setLoading(false);
        }
      };
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-md font-outfit">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-base font-inter">Add Contact</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 border border-gray-300 p-5 rounded-md">
            <div className="flex flex-col space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
               Phone Number
              </label>
              <Input 
                id="phoneNumber" 
                name="phoneNo" 
                type="tel" 
                value={formData.phoneNo} 
                onChange={handleChange} 
                placeholder="Phone Number" 
                className="rounded-md" 
                />
            </div>

            <div className="flex justify-between m-auto">
              <Button variant="outline" onClick={onClose} className="w-full mx-1 text-black border">
                Cancel
              </Button>
              <Button type="submit" className=" w-full mx-1 text-white hover:bg-[#3449b4]">
                {loading? "Saving...":"Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
        
      </Dialog>
    );
  }
  