import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  
  interface QueryModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export function QueryModal({ isOpen, onClose }: QueryModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-md font-outfit">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-base font-inter">Add Query</DialogTitle>
            </div>
          </DialogHeader>
          <form className="space-y-4 border border-gray-300 p-5 rounded-md">
            <div className="flex flex-col space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
               Query
              </label>
              <Input id="title" placeholder="Query" className="rounded-md" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Comment
              </label>
              <Textarea
                id="comment"
                placeholder="Add"
                className="rounded-md resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-between m-auto">
              <Button variant="outline" onClick={onClose} className="w-full mx-1 text-black border">
                Cancel
              </Button>
              <Button className=" w-full mx-1 text-white hover:bg-[#3449b4]">
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  