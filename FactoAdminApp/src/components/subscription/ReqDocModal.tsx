import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { DOCUMENTS } from "@/api/documents";
import { showError, showSucccess } from "@/utils/toast";

interface ReqDocProps {
  isOpen: boolean;
  onClose: () => void;
  fetchDocuments?: () => void; 
  reqDocData?: any;
  id:string;
}

export function ReqDocModal({ isOpen, onClose,fetchDocuments,reqDocData,id }: ReqDocProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isMandatory: true,
  });

  useEffect(() => {
    if (reqDocData) {
      setFormData({
        title: reqDocData.title || "",
        description: reqDocData.description || "",
        isMandatory:  reqDocData.isMandatory ?? true,
      });
      setIsEdit(true);
    } else {
      setFormData({ title: "", description: "", isMandatory:true });
      setIsEdit(false);
    }
  }, [reqDocData]);

  const clearModal = () => {
    setFormData({ title: "", description: "", isMandatory: true });
    setIsEdit(false);
  };

  const handleCloseModal = () => {
    clearModal();
    onClose();
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isMandatory" ? value === "true" : value,
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await DOCUMENTS.PostDocuments(id,formData);

      if (response.success) {
        handleCloseModal();
        fetchDocuments?.();
        showSucccess(response.message || "Document created successfully");
      } else {
        showError(response.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error during submit:", error);
      showError("An error occurred while creating the document");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!reqDocData?._id) {
      showError("ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await DOCUMENTS.UpdateDocuments({
        _id: reqDocData._id,
        title: formData.title,
        description: formData.description,
          isMandatory: formData.isMandatory,
      });

      if (response.success) {
        handleCloseModal();
        fetchDocuments?.();
        showSucccess(response.message || "Document updated successfully");
      } else {
        showError(response.message || "Failed to update document");
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
      <DialogContent className="rounded-md font-outfit">
        <DialogHeader>
          <DialogTitle className="text-base font-inter">
        
            {isEdit ? "Edit Required Document" : "Add Required Document"}
            </DialogTitle>
        </DialogHeader>
        <form 
          onSubmit={isEdit ? handleEditSubmit : handleSubmit}
          className="space-y-4 border border-gray-300 p-5 rounded-md">
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Document Title"
              required
            />
          </div>
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Document Description"
              rows={3}
              required
            />
          </div>
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="isMandatory" className="text-sm font-medium">Is Mandatory</label>
            <select
              id="isMandatory"
              name="isMandatory"
              value={formData.isMandatory.toString()}
              onChange={handleChange}
              className="rounded-md border border-gray-300 p-2"
              required
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex justify-between m-auto">
            <Button variant="outline"  onClick={handleCloseModal} className="w-full mx-1 text-black border">
              Cancel
            </Button>
            <Button type="submit" className="w-full mx-1 text-white hover:bg-[#3449b4]" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
    </Dialog>
  );
}
