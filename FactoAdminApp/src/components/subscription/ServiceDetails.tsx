import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import HeaderBar from "../common/HeaderBar";
import ServiceUserTable from "./ServiceUserTable";
import { AddSubServices } from "./AddSubServices";
import { Button } from "../ui/button";
import { SUBSERVICES } from "@/api/sub-services";
import { showError, showSucccess } from "@/utils/toast";
import { ReqDocModal } from "./ReqDocModal"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReqDocCard from "./ReqDocCard";
import { DOCUMENTS } from "@/api/documents";

interface SubService {
  _id: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  period: string;
  isActive: boolean;
}
interface ReqDocType {
  _id: string;
  title: string;
  description: string;
  isMandatory: boolean;
}

const ServiceDetails = () => {
  const { state } = useLocation();
  const { _id, title, description } = state.service;

  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [viewSubService, setViewSubService] = useState<SubService | null>(null);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false); //for add sub services
  const [reqDocModalOpen, setReqDocModalOpen] = useState(false);  //for req doc add
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string>(""); //post req doc 

  const openModal = () => {
    console.log("Opening modal");
    setIsOpen(true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setIsOpen(false);
    setViewSubService(null);
  };

  const openReqDocModal = (id: string) => {
    console.log("Opening Required Documents Modal for ID:", id);
    setSelectedSubServiceId(id);
    setReqDocModalOpen(true);
  };

  const closeReqDocModal = () => {
    console.log("Closing Required Documents Modal");
    // setSelectedSubServiceId("");
    setReqDocModalOpen(false);
  };

  // fetch sub-services use service id

  const fetchSubServices = async () => {
    try {
      console.log("Fetching subservices for service ID:", _id);
      const response = await SUBSERVICES.GetSubServices(_id);
      console.log("API response:", response.data.subServices);
      setSubServices(response.data.subServices);
      // showSucccess(response.message);
    } catch (error) {
      console.error("Error fetching subservices:", error);
      // showError("There's an error in fetching data");
    }
  };

  useEffect(() => {
    fetchSubServices();
  }, [_id]); 

  // delete sub service
  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting subservice with ID:", id);
      await SUBSERVICES.DeleteSubService(id);
      showSucccess("Deleted Successfully");
      fetchSubServices();
    } catch (error) {
      console.error("Error in deleting data:", error);
      showError("Error in deleting data");
    }
  };


  const [activeSubService, setActiveSubService] = useState<string>("");
  const [reqDocData, setReqDocData] = useState<ReqDocType[]>([]);

  // fetch doc need sub service id
    const fetchDocuments = async () => {
        try {
          console.log("Fetching Documents for sub service ID:", activeSubService);
          const response = await DOCUMENTS.GetDocumentsBySubServices(activeSubService);
          console.log("API response:", response.data.subServiceRequirements);
          setReqDocData(response.data.subServiceRequirements);
          // showSucccess(response.message);
        } catch (error) {
          console.error("Error fetching subservices:", error);
          // showError("There's an error in fetching data");
        }
      };
    
      useEffect(() => {
        fetchDocuments();
      }, [activeSubService]); 

  const handleView = (subService: SubService) => {
    console.log("Viewing subservice:", subService);
    setViewSubService(subService);
    setIsOpen(true);
  };

  return (
    <div className="p-6 space-y-8">
      <HeaderBar pageTitle={title} />
      <Button className="items-end" onClick={openModal}>
        Add Sub-Service
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="mt-4 list-disc pl-5 space-y-2">
            {subServices.map((subService: SubService, index: number) => (
              <li key={subService._id} className="cursor-pointer">
                <div className="flex justify-between items-center">
                  <div
                    className="text-primary font-semibold"
                    onClick={() =>{
                      setActiveFeature(activeFeature === index ? null : index)
                      setActiveSubService(subService._id);
                    }}
                  >
                    {subService.title}
                  </div>
                  {/* Three-dot menu for subservice actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="text-white bg-[#253483] font-extrabold" >
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openReqDocModal(subService._id)}
                      >
                        Add Required Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleView(subService)}>
                        Update Sub-Service
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(subService._id)}
                      >
                        Delete Sub-Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {activeFeature === index && (
                  <div className="mt-2 space-y-2 border-t pt-2">
                    <p className="text-sm text-gray-500">
                      <strong>Description:</strong> {subService.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Features:</strong>{" "}
                      {subService.features.join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Price:</strong> ${subService.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Period:</strong> {subService.period}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Is Active:</strong>{" "}
                      {subService.isActive ? "Yes" : "No"}
                    </p>
                    <ReqDocCard fetchDocuments={fetchDocuments} reqDocData={reqDocData} id={subService._id}/>
                  </div>
                  
                )}

              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <ServiceUserTable serviceId={_id} subServices={subServices} />
      </div>

      <AddSubServices
        subServices={viewSubService}
        isOpen={isOpen}
        onClose={closeModal}
        id={_id}
        fetchSubServices={fetchSubServices}
      />

      {/* Required Documents Modal */}
      <ReqDocModal fetchDocuments={fetchDocuments}  id={selectedSubServiceId} isOpen={reqDocModalOpen} onClose={closeReqDocModal} />
   
    </div>
  );
};

export default ServiceDetails;

