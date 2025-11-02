import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SERVICES } from "@/api/services";
import { showError, showSucccess } from "@/utils/toast";
import { useState } from "react";
import { ToastContainer } from "react-toastify";

export interface ServiceCardProps {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  frequency?: string;
  features?: string[];
  pricing?: string;
  handleDelete: (id: string) => void;
}

const DEFAULT_FREQUENCY = "Monthly/Annually";
const DEFAULT_FEATURES = ["Feature A", "Feature B", "Feature C"];
const DEFAULT_PRICING = "Rs__";

const toastCounter = new Map<string, number>();

export function ServiceCard({
  _id,
  title,
  description,
  isActive,
  frequency = DEFAULT_FREQUENCY,
  features = DEFAULT_FEATURES,
  pricing = DEFAULT_PRICING,
  handleDelete,
}: ServiceCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate("/details", {
      state: {
        service: { _id, title, description, frequency, features, pricing },
      },
    });
  };

  const [isServiceActive, setIsActive] = useState<boolean>(isActive);

  const onDelete = () => {
    console.log(`Attempting to delete service with ID: ${_id}`);
    handleDelete(_id);
  };

  const toggleActive = async () => {
    console.log(`Attempting to toggle service with ID: ${_id}`);
    try {
      const response = await SERVICES.ToggleService(_id);
      console.log(response.data);
      setIsActive(response.data.service.isActive);

      // Update the toast counter for this service
      const currentCount = toastCounter.get(_id) || 0;

      if (currentCount < 2) {
        // if (response.data.service.isActive) {
        //   showSucccess("Activated Successfully");
        // } else {
        showSucccess("Changed Successfully");
        // }
        toastCounter.set(_id, currentCount + 1);
      }
    } catch (error) {
      console.error(error);
      showError("Error in changing status");
    }
  };

  return (
    <Card className="p-4 shadow-md w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto flex flex-col justify-between h-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800">
          {title}
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-between items-stretch sm:items-center">
          <Button
            onClick={toggleActive}
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            {isServiceActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            onClick={handleViewDetails}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            View Details
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Delete
          </Button>
        </div>
      </CardContent>
      <ToastContainer />
    </Card>
  );
}
