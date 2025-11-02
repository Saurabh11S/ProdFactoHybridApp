import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface EditQueryProps {
  isOpen: boolean;
  onClose: () => void;
  queryData: { _id: string; query: string; comment: string } | null;
}

export function EditQuery({ isOpen, onClose, queryData }: EditQueryProps) {
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    if (queryData) {
      setNewComment(queryData.comment);
    }
  }, [queryData]);

  const handleSave = () => {
    if (queryData) {
      console.log("Updated query:", { ...queryData, comment: newComment });
    }
    onClose();
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
            <Button className="text-white bg-[#253483] hover:bg-[#1d2963]" onClick={handleSave}>
              Save Comment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
