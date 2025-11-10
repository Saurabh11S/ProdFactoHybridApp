import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { showError, showSucccess } from "@/utils/toast";
import { QUERIES } from "@/api/query";

interface RecentQueryProps {
  isOpen: boolean;
  onClose: () => void;
  query: any;
  fetchData?:()=>void;
}

export function RecentQuery({ isOpen, onClose, query,fetchData }: RecentQueryProps) {
  const defaultQuery = { query: "", comment: "" }; 
  const queryData = query || defaultQuery;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ comment: string }>({
    comment: "",
  });

  useEffect(() => {
    if (queryData?.comment) {
      setFormData({ comment: queryData.comment });
      setIsEdit(true);
    } else {
      setFormData({ comment: "" });
      setIsEdit(false);
    }
  }, [queryData.comment]);

  const clearModal = () => {
    setFormData({ comment: "" });
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

    if (!queryData?.query) {
      showError("Query is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await QUERIES.Update({
        _id: query._id,
        comment: formData.comment,
      });

      if (response.success) {
        handleCloseModal();
        fetchData?.();
        showSucccess(response.message || "Query updated successfully");
      } else {
        showError(response.message || "Failed to update query");
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
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-inter">Recent Query</DialogTitle>
          </div>
        </DialogHeader>
        <form
          className="space-y-4 border border-gray-300 p-5 rounded-md"
          onSubmit={handleSubmit}
        >
          <div className="flex">
            <label htmlFor="query" className="w-2/5 text-sm font-medium">
              Query:
            </label>
            <p className="text-sm font-inter text-gray-600">{queryData.query}</p>
          </div>
          <div className="flex flex-col space-y-2 border-2 border-gray-400 p-5 rounded-md">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment
            </label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Add Comment"
              value={formData.comment}
              onChange={handleChange}
              className="rounded-md resize-none border-gray-300"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex justify-between m-auto">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="w-full mx-1 text-black border"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-1 text-white hover:bg-[#3449b4]"
              disabled={loading}
            >
              {loading ? "Processing..." : isEdit ? "Edit" : "Add Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
    </Dialog>
  );
}

