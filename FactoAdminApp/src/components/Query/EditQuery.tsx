import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { QUERIES } from "@/api/query";
import { showError, showSucccess } from "@/utils/toast";

interface EditQueryProps {
  isOpen: boolean;
  onClose: () => void;
  queryData: { _id: string; query: string; comment: string } | null;
  fetchData?: () => void;
}

export function EditQuery({ isOpen, onClose, queryData, fetchData }: EditQueryProps) {
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (queryData) {
      setNewComment(queryData.comment || "");
    }
  }, [queryData]);

  const handleSave = async () => {
    if (!queryData?._id) {
      showError("Query ID is missing");
      return;
    }

    if (!newComment.trim()) {
      showError("Comment cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await QUERIES.Update({
        _id: queryData._id,
        comment: newComment,
      });

      if (response.success) {
        showSucccess(response.message || "Query updated successfully");
        fetchData?.();
        onClose();
      } else {
        showError(response.message || "Failed to update query");
      }
    } catch (error: any) {
      console.error("Error updating query:", error);
      showError(
        error.response?.data?.message || 
        error.response?.data?.status?.message ||
        "An error occurred while updating the query"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!queryData) {
    return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md font-outfit max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-inter">Edit Query</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 border border-gray-300 p-5 rounded-md">
          <div className="flex items-start gap-4">
            <label htmlFor="title" className="w-1/4 text-sm font-medium">
              Query:
            </label>
            <p className="text-sm font-inter text-gray-600">{queryData.query}</p>
          </div>
          <div className="flex flex-col space-y-2 border-2 border-gray-400 p-4 rounded-md">
            <label htmlFor="new-comment" className="text-sm font-medium">
              Add New Comment:
            </label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="rounded-md resize-none border-gray-300"
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-black border">
              Cancel
            </Button>
            <Button 
              className="text-white bg-[#253483] hover:bg-[#1d2963]" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
