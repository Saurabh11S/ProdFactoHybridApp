import { DOCUMENTS } from "@/api/documents";
import { showError, showSucccess } from "@/utils/toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ReqDocModal } from "./ReqDocModal";
import { ToastContainer } from "react-toastify";

interface ReqDocType {
  _id: string;
  title: string;
  description: string;
  isMandatory: boolean;
}

const ReqDocCard = ({
  id,
  reqDocData,
  fetchDocuments,
}: {
  id: string;
  reqDocData: ReqDocType[];
  fetchDocuments?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [reqDoc, setReqDoc] = useState<ReqDocType>();

  const toggleActive = async (id: string) => {
    try {
       await DOCUMENTS.ToggleMandatory(id);
      fetchDocuments?.();
      showSucccess("Changed Successfully");
    } catch (error) {
      showError("Error in changing status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DOCUMENTS.DeleteSubServiceDoc(id);
      fetchDocuments?.();
      showSucccess("Service deleted successfully");
    } catch (error) {
      showError("There's an error in deleting the service");
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-start">
      {reqDocData.map((reqDoc, index) => (
        <div
          key={index}
          className="w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-base font-semibold text-gray-800">
              {reqDoc.title}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-black font-semibold text-sm"
                >
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setReqDoc(reqDoc);
                    openModal();
                  }}
                >
                  Update Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(reqDoc._id)}>
                  Delete Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleActive(reqDoc._id)}>
                  Toggle Mandatory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-sm text-gray-600 mb-4">{reqDoc.description}</div>

          <p
            className={`text-xs font-medium ${
              reqDoc.isMandatory ? "text-green-500" : "text-red-500"
            }`}
          >
            Is Mandatory: {reqDoc.isMandatory ? "Yes" : "No"}
          </p>
        </div>
      ))}
      <ToastContainer />
      <ReqDocModal
        fetchDocuments={fetchDocuments}
        id={id}
        reqDocData={reqDoc}
        onClose={closeModal}
        isOpen={isOpen}
      />
    </div>
  );
};

export default ReqDocCard;
