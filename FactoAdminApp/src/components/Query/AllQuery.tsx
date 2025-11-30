import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { RecentQuery } from "./RecentQuery";
import { CheckCircle2, Clock } from "lucide-react";

interface AllQueryProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
  queries: QueryType[];
}

interface QueryType {
  _id: string;
  email: string;
  name: string;
  phoneNo: number;
  query: string;
  createdAt?: string;
  comment?: string;
  category?: string;
  isResponded?: boolean;
  respondedAt?: string;
}

export function AllQuery({ isOpen, onClose, queries ,fetchData}: AllQueryProps) {
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<QueryType | null>(null);

  const handleEdit = (query: QueryType) => {
    setSelectedQuery(query);
    setOpenEditModal(true);
  };

  const closeEditModal = () => {
    setOpenEditModal(false);
    setSelectedQuery(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md font-outfit max-w-2xl w-full h-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-inter">All Queries</DialogTitle>
            <Button
              onClick={() => selectedQuery && handleEdit(selectedQuery)}
              className="mr-4 text-white border"
              disabled={!selectedQuery}
            >
              Edit
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="h-96 p-4">
          <div className="space-y-6">
            {queries && queries.length > 0 ? (
              queries.map((item) => (
                <div
                  key={item._id}
                  className={`grid grid-cols-1 p-4 rounded-md cursor-pointer hover:bg-[#DFDFDF] hover:text-gray-900 font-poppins ${
                    selectedQuery?._id === item._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedQuery(item)}
                >
                  <div className="flex items-start gap-4">
                    <label
                      htmlFor={`query-${item._id}`}
                      className="text-sm font-medium min-w-[80px] text-gray-900"
                    >
                      Query:
                    </label>
                    <p id={`query-${item._id}`} className="text-sm font-inter text-gray-500">
                      {item.query}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <label
                      htmlFor={`comment-${item._id}`}
                      className="text-sm font-medium min-w-[80px] text-gray-900"
                    >
                      Comment:
                    </label>
                    <p id={`comment-${item._id}`} className="text-sm font-inter text-gray-500">
                      {item.comment || "No comment yet"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.isResponded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Responded
                          {item.respondedAt && (
                            <span className="ml-1 text-xs opacity-75">
                              {new Date(item.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">No queries available</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      {selectedQuery && (
        <RecentQuery 
        isOpen={openEditModal}
        onClose={closeEditModal}
        query={selectedQuery}
        fetchData={fetchData}
        />
      )}
    </Dialog>
  );
}
