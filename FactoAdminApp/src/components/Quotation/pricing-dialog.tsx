import * as React from "react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// import { Quotation } from "@/api/";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  name: string;
  priceModifier: number;
  needsQuotation: boolean;
}

interface Request {
  name: string;
  needsQuotation: boolean;
  priceModifier: number;
  inputType: "dropdown" | "checkbox";
  isMultipleSelect?: boolean;
  options?: Option[];
}

interface PricingDialogProps {
  
  requests: Request[]|undefined;
 setRequests: React.Dispatch<React.SetStateAction<string[]>>;
}


export default function PricingDialog({

  requests,
  setRequests

}: PricingDialogProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<{
    [key: string]: string | boolean;
  }>({});

  React.useEffect(()=>{
    const selectedFeatures = Object.entries(selectedOptions)
        .filter(([_, value]) => value)
        .map(([key, value]) => (typeof value === "boolean" ? key : value));
    setRequests(selectedFeatures)
  },[selectedOptions])
 
  // const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>("monthly");

  const handleCheckboxChange = (
    requestName: string,
    checked: boolean,
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [requestName]: checked,
    }));
  };

  const handleDropdownChange = (
    requestName: string,
    value: string,
    options: Option[]
  ) => {
    const selectedOption = options.find((option) => option.name === value);
    if (selectedOption) {
      setSelectedOptions((prev) => ({
        ...prev,
        [requestName]: value,
      }));
      
    }
  };

  const renderInput = (request: Request) => {
    if (request.inputType === "checkbox") {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={request.name}
            checked={!!selectedOptions[request.name]}
            onCheckedChange={(checked) =>
              handleCheckboxChange(
                request.name,
                checked === true,
                
              )
            }
            className="h-4 w-4 border-[#3b4ba7] text-green-500"
          />
          <Label htmlFor={request.name}>
            {request.name}
            {request.needsQuotation && (
              <span className="ml-2 text-red-500">(Quotation Needed)</span>
            )}
          </Label>
        </div>
      );
    }
    if (request.inputType === "dropdown" && request.options) {
      return (
        <div className="space-y-2">
          <Label htmlFor={request.name}>{request.name}</Label>
          <Select
            onValueChange={(value) =>
              handleDropdownChange(request.name, value, request.options || [])
            }
            value={selectedOptions[request.name] as string}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {request.options.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.name}
                  {option.needsQuotation && " (Quotation Needed)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
        <Card className="border-0 shadow-none">
          <CardContent className="pt-0">
            <form className="space-y-4">
              {requests&&requests.map((request) => (
                <div
                  key={request.name}
                  className="p-2 rounded hover:bg-gray-50"
                >
                  {renderInput(request)}
                </div>
              ))}
            </form>
          </CardContent>
        </Card>
  );
}