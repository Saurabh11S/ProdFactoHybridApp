import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { SUBSERVICES } from "@/api/sub-services";
import { showError, showSucccess } from "@/utils/toast";
import { X } from "lucide-react";
interface DropdownOption {
  name: string;
  priceModifier: number;
  needsQuotation: boolean;
}

interface Request {
  name: string;
  inputType: "dropdown" | "checkbox";
  priceModifier: number;
  needsQuotation: boolean;
  options?: DropdownOption[];
}

interface Request {
  name: string;
  priceModifier: number;
  needsQuotation: boolean;
  inputType: "dropdown" | "checkbox";
  isMultipleSelect?: boolean;
  options?: DropdownOption[];
}

interface SubService {
  serviceCode: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  period: "monthly" | "quarterly" | "half_yearly" | "yearly" | "one_time";
  isActive: boolean;
  requests: Request[];
  pricingStructure: {
    price: number;
    period: "monthly" | "quarterly" | "half_yearly" | "yearly" | "one_time";
  }[];
}

interface AddSubServicesProps {
  isOpen: boolean;
  onClose: () => void;
  fetchSubServices: () => void;
  id: string;
  subServices?: any;
}

export function AddSubServices({
  isOpen,
  onClose,
  id,
  fetchSubServices,
  subServices,
}: AddSubServicesProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubService>({
    serviceCode: "",
    title: "",
    description: "",
    features: [],
    price: 0,
    period: "monthly",
    isActive: true,
    requests: [],
    pricingStructure: [],
  });

  const [featureInput, setFeatureInput] = useState<string>("");
  const [requestInput, setRequestInput] = useState<Request>({
    name: "",
    inputType: "checkbox",
    priceModifier: 0,
    needsQuotation: false,
    options: [],
  });

  const [optionInput, setOptionInput] = useState<DropdownOption>({
    name: "",
    priceModifier: 0,
    needsQuotation: false,
  });
  const [editingRequestIndex, setEditingRequestIndex] = useState<number | null>(null);

  const [isMonthlyBillingChecked, setIsMonthlyBillingChecked] =
    useState<boolean>(false);
  const [isQuarterlyBillingChecked, setIsQuarterlyBillingChecked] =
    useState<boolean>(false);
  const [isHalfYearlyBillingChecked, setIsHalfYearlyBillingChecked] =
    useState<boolean>(false);
  const [isYearlyBillingChecked, setIsYearlyBillingChecked] =
    useState<boolean>(false);
  const [isOneTimeBillingChecked, setIsOneTimeBillingChecked] =
    useState<boolean>(false);
  const [monthlyBillingPrice, setMonthlyBillingPrice] = useState<string>("");
  const [quarterlyBillingPrice, setQuarterlyBillingPrice] =
    useState<string>("");
  const [halfYearlyBillingPrice, setHalfYearlyBillingPrice] =
    useState<string>("");
  const [yearlyBillingPrice, setYearlyBillingPrice] = useState<string>("");
  const [oneTimeBillingPrice, setOneTimeBillingPrice] = useState<string>("");

  useEffect(() => {
    if (subServices) {
      // Ensure requests have inputType field when loading existing data
      const normalizedRequests = (subServices.requests || []).map((request: any) => ({
        ...request,
        inputType: request.inputType || 'checkbox', // Default to checkbox if missing
        options: (request.options || []).map((option: any) => ({
          // Ensure options use 'name' field (handle both 'name' and 'title' for backward compatibility)
          name: option.name || option.title || '',
          priceModifier: option.priceModifier || 0,
          needsQuotation: option.needsQuotation || false,
        })),
      }));

      setFormData({
        serviceCode: subServices.serviceCode || "",
        title: subServices.title || "",
        description: subServices.description || "",
        features: subServices.features || [],
        price: subServices.price || 0,
        period: subServices.period || "monthly",
        isActive: subServices.isActive ?? true,
        requests: normalizedRequests,
        pricingStructure: subServices.pricingStructure || [],
      });
      setIsEdit(true);

      subServices.pricingStructure.forEach(
        (pricing: { period: string; price: number }) => {
          switch (pricing.period) {
            case "monthly":
              setIsMonthlyBillingChecked(true);
              setMonthlyBillingPrice(pricing.price.toString());
              break;
            case "quarterly":
              setIsQuarterlyBillingChecked(true);
              setQuarterlyBillingPrice(pricing.price.toString());
              break;
            case "half_yearly":
              setIsHalfYearlyBillingChecked(true);
              setHalfYearlyBillingPrice(pricing.price.toString());
              break;
            case "yearly":
              setIsYearlyBillingChecked(true);
              setYearlyBillingPrice(pricing.price.toString());
              break;
            case "one_time":
              setIsOneTimeBillingChecked(true);
              setOneTimeBillingPrice(pricing.price.toString());
              break;
          }
        }
      );
    } else {
      resetForm();
    }
  }, [subServices]);

  const resetForm = () => {
    setFormData({
      serviceCode: "",
      title: "",
      description: "",
      features: [],
      price: 0,
      period: "monthly",
      isActive: true,
      requests: [],
      pricingStructure: [],
    });
    setIsMonthlyBillingChecked(false);
    setIsQuarterlyBillingChecked(false);
    setIsHalfYearlyBillingChecked(false);
    setIsYearlyBillingChecked(false);
    setIsOneTimeBillingChecked(false);
    setMonthlyBillingPrice("");
    setQuarterlyBillingPrice("");
    setHalfYearlyBillingPrice("");
    setYearlyBillingPrice("");
    setOneTimeBillingPrice("");
    setEditingRequestIndex(null);

    setIsEdit(false);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleFeatureAdd = () => {
    if (featureInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const handleFeatureRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleRequestInputChange = (name: string, value: any) => {
    setRequestInput((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      // Reset options when switching from dropdown to checkbox
      if (name === "inputType" && value === "checkbox") {
        updated.options = [];
      }
      // Ensure inputType is always set correctly
      if (name === "inputType") {
        updated.inputType = value as "dropdown" | "checkbox";
      }
      return updated;
    });
  };

  const handleOptionInputChange = (name: string, value: any) => {
    setOptionInput((prev) => ({
      ...prev,
      [name]: name === "priceModifier" ? parseFloat(value) : value,
    }));
  };

  const handleOptionAdd = () => {
    if (optionInput.name.trim() !== "") {
      setRequestInput((prev) => ({
        ...prev,
        options: [...(prev.options || []), optionInput],
      }));
      setOptionInput({
        name: "",
        priceModifier: 0,
        needsQuotation: false,
      });
    }
  };

  const handleOptionRemove = (index: number) => {
    setRequestInput((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  };

  const handleRequestAdd = () => {
    handleRequestUpdate();
  };

  const handleRequestRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requests: prev.requests.filter((_, i) => i !== index),
    }));
  };

  const handleRequestEdit = (index: number) => {
    const requestToEdit = formData.requests[index];
    setRequestInput({
      ...requestToEdit,
      options: requestToEdit.options || [],
    });
    setEditingRequestIndex(index);
  };

  const handleRequestUpdate = () => {
    if (requestInput.name.trim() === "") return;
    
    // Ensure inputType is always present and valid
    const requestToAdd: Request = {
      ...requestInput,
      inputType: requestInput.inputType || "checkbox",
      // Clear options if it's a checkbox type
      options: requestInput.inputType === "checkbox" ? [] : (requestInput.options || []),
    };
    
    if (editingRequestIndex !== null) {
      setFormData((prev) => {
        const newRequests = [...prev.requests];
        newRequests[editingRequestIndex] = requestToAdd;
        return { ...prev, requests: newRequests };
      });
    } else {
      // Add new request
      setFormData((prev) => ({
        ...prev,
        requests: [...prev.requests, requestToAdd],
      }));
    }
    // Reset requestInput and editing state
    setRequestInput({
      name: "",
      inputType: "checkbox",
      priceModifier: 0,
      needsQuotation: false,
      options: [],
    });
    setEditingRequestIndex(null);
  };

  const handleRequestToggleInputType = (index: number) => {
    setFormData((prev) => {
      const newRequests = [...prev.requests];
      const currentRequest = newRequests[index];
      const newInputType = currentRequest.inputType === "dropdown" ? "checkbox" : "dropdown";
      newRequests[index] = {
        ...currentRequest,
        inputType: newInputType,
        // Clear options if switching to checkbox, preserve if switching to dropdown
        options: newInputType === "checkbox" ? [] : (currentRequest.options || []),
      };
      return { ...prev, requests: newRequests };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(formData);
      await SUBSERVICES.PostSubService(id, formData);
      fetchSubServices();
      onClose();
      showSucccess("Sub-service successfully created");
    } catch (error: any) {
      console.error("Error creating sub-service:", error);
      showError(error.response?.data?.message || "Error creating sub-service");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!subServices?._id) {
      showError("Sub-service ID is missing.");
      setLoading(false);
      return;
    }

    try {
      // Ensure all requests have inputType and proper structure before sending
      const formDataToSend = {
        ...formData,
        requests: (formData.requests || []).map((request: any) => {
          const normalizedRequest = {
            ...request,
            inputType: request.inputType || 'checkbox', // Ensure inputType is always present
            // Ensure options array exists and is properly formatted
            options: request.inputType === 'dropdown' 
              ? (request.options || []).map((opt: any) => ({
                  name: opt.name || opt.title || '',
                  priceModifier: opt.priceModifier || 0,
                  needsQuotation: opt.needsQuotation || false,
                }))
              : [], // Clear options for checkbox type
          };
          return normalizedRequest;
        }),
      };
      const response = await SUBSERVICES.UpdateSubService({
        _id: subServices._id,
        ...formDataToSend,
      });

      if (response.success) {
        handleCloseModal();
        fetchSubServices();
        showSucccess(response.message || "Sub-service updated successfully");
      } else {
        showError(response.message || "Failed to update sub-service");
      }
    } catch (error: any) {
      console.error("Error during edit:", error);
      showError(
        error.response?.data?.message || "An error occurred while updating"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePricingStructureChange = (period: string, value: string) => {
    setFormData((prev) => {
      const newPricingStructure = prev.pricingStructure.filter(
        (pricing) => pricing.period !== period
      );
      if (value) {
        newPricingStructure.push({
          price: parseFloat(value),
          period: period as
            | "quarterly"
            | "monthly"
            | "half_yearly"
            | "yearly"
            | "one_time",
        });
      }
      console.log("new pricing structure", newPricingStructure);
      return { ...prev, pricingStructure: newPricingStructure };
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        resetForm();
        onClose();
      }}
    >
      <DialogContent className="rounded-md font-outfit max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-inter">
            {isEdit ? "Edit Sub Service" : "Add New Sub Service"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 border border-gray-300 p-5 rounded-md"
          onSubmit={isEdit ? handleEditSubmit : handleSubmit}
        >
          <ScrollArea className="h-[500px] p-2">
            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Sub Service Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Service Title"
                className="rounded-md"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="serviceCode" className="text-sm font-medium">
                Service Code
              </label>
              <Input
                id="serviceCode"
                name="serviceCode"
                placeholder="e.g., ITR-1-BASIC"
                className="rounded-md"
                value={formData.serviceCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add description"
                className="rounded-md resize-none"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="features" className="text-sm font-medium">
                Features
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  id="features"
                  placeholder="Add feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="rounded-md"
                />
                <Button
                  type="button"
                  onClick={handleFeatureAdd}
                  disabled={!featureInput.trim()}
                >
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5">
                {formData.features.map((feature, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeatureRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="requests" className="text-sm font-medium">
                Service Requests
              </label>
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Input
                    id="request-name"
                    name="name"
                    placeholder="Request Name"
                    value={requestInput.name}
                    onChange={(e) =>
                      handleRequestInputChange("name", e.target.value)
                    }
                    className="rounded-md"
                  />

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Input Type</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Checkbox</span>
                      <Switch
                        checked={requestInput.inputType === "dropdown"}
                        onCheckedChange={(checked) =>
                          handleRequestInputChange(
                            "inputType",
                            checked ? "dropdown" : "checkbox"
                          )
                        }
                      />
                      <span className="text-sm">Dropdown</span>
                    </div>
                  </div>

                  {requestInput.inputType === "checkbox" && (
                    <>
                      <Input
                        id="price-modifier"
                        name="priceModifier"
                        placeholder="Price Modifier"
                        type="number"
                        value={requestInput.priceModifier}
                        onChange={(e) =>
                          handleRequestInputChange(
                            "priceModifier",
                            parseFloat(e.target.value)
                          )
                        }
                        className="rounded-md"
                      />
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Needs Quotation
                        </label>
                        <Switch
                          checked={requestInput.needsQuotation}
                          onCheckedChange={(checked) =>
                            handleRequestInputChange("needsQuotation", checked)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                {requestInput.inputType === "dropdown" && (
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                      <Input
                        id="option-name"
                        name="name"
                        placeholder="Option Name"
                        value={optionInput.name}
                        onChange={(e) =>
                          handleOptionInputChange("name", e.target.value)
                        }
                        className="rounded-md"
                      />
                      <Input
                        id="option-price-modifier"
                        name="priceModifier"
                        placeholder="Option Price Modifier"
                        type="number"
                        value={optionInput.priceModifier}
                        onChange={(e) =>
                          handleOptionInputChange(
                            "priceModifier",
                            e.target.value
                          )
                        }
                        className="rounded-md"
                      />
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Option Needs Quotation
                        </label>
                        <Switch
                          checked={optionInput.needsQuotation}
                          onCheckedChange={(checked) =>
                            handleOptionInputChange("needsQuotation", checked)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleOptionAdd}
                        disabled={!optionInput.name.trim()}
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    </div>
                    <ul className="list-disc pl-5">
                      {requestInput.options?.map((option, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{option.name}</span>
                            <span className="ml-2">{`(Price Modifier: ${option.priceModifier})`}</span>
                            <span className="ml-2 text-sm text-gray-600">
                              {option.needsQuotation ? "(Needs Quotation)" : ""}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOptionRemove(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleRequestAdd}
                  disabled={
                    !requestInput.name.trim() ||
                    (requestInput.inputType === "dropdown" &&
                      (!requestInput.options ||
                        requestInput.options.length === 0))
                  }
                  className="w-full"
                >
                  {editingRequestIndex !== null ? "Update Request" : "Add Request"}
                </Button>
              </div>

              <ul className="list-disc pl-5 space-y-2 mt-4">
                {formData.requests.map((request, index) => (
                  <li key={index} className="flex justify-between items-center border-b pb-2">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">{request.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Checkbox</span>
                          <Switch
                            checked={request.inputType === "dropdown"}
                            onCheckedChange={() => handleRequestToggleInputType(index)}
                          />
                          <span className="text-xs text-gray-500">Dropdown</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {`Type: ${request.inputType || 'checkbox'}`}
                        {request.inputType === "checkbox" &&
                          `, Price Modifier: ${
                            request.priceModifier
                          }, Quotation: ${
                            request.needsQuotation ? "Yes" : "No"
                          }`}
                      </p>
                      {request.inputType === "dropdown" &&
                        request.options &&
                        request.options.length > 0 && (
                          <div className="ml-4 text-sm text-gray-500">
                            <p>Options:</p>
                            <ul className="list-disc ml-4">
                              {request.options.map((option, idx) => (
                                <li key={idx}>
                                  {`${option.name} - Price Modifier: ${
                                    option.priceModifier
                                  }${
                                    option.needsQuotation
                                      ? " (Needs Quotation)"
                                      : ""
                                  }`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRequestEdit(index)}
                        title="Edit request"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRequestRemove(index)}
                        title="Remove request"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleInputChange}
                className="rounded-md"
                required
              />
            </div> */}

            {/* Period Dropdown */}
            {/* <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="period" className="text-sm font-medium">
                Billing Period
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="rounded-md border p-2"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half-Yearly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One-Time</option>
              </select>
            </div> */}
            <div className="flex flex-col p-2 space-y-2">
              <label htmlFor="period" className="text-sm font-medium">
                Billing Period & Pricing
              </label>
              <div className="flex items-center">
                <Switch
                  checked={isMonthlyBillingChecked}
                  onCheckedChange={(checked) => {
                    setIsMonthlyBillingChecked(checked);
                    handlePricingStructureChange(
                      "monthly",
                      checked ? monthlyBillingPrice : ""
                    );
                  }}
                />
                <span className="ml-2">Monthly</span>
              </div>
              {isMonthlyBillingChecked && (
                <Input
                  id="monthly-price"
                  name="monthlyBillingPrice"
                  placeholder="Enter monthly price"
                  className="rounded-md"
                  type="number"
                  value={monthlyBillingPrice}
                  onChange={(e) => {
                    setMonthlyBillingPrice(e.target.value);
                    handlePricingStructureChange("monthly", e.target.value);
                  }}
                />
              )}
              <div className="flex items-center">
                <Switch
                  checked={isQuarterlyBillingChecked}
                  onCheckedChange={(checked) => {
                    setIsQuarterlyBillingChecked(checked);
                    handlePricingStructureChange(
                      "quarterly",
                      checked ? quarterlyBillingPrice : ""
                    );
                  }}
                />
                <span className="ml-2">Quarterly</span>
              </div>
              {isQuarterlyBillingChecked && (
                <Input
                  id="quarterly-price"
                  name="quarterlyBillingPrice"
                  placeholder="Enter quarterly price"
                  className="rounded-md"
                  type="number"
                  value={quarterlyBillingPrice}
                  onChange={(e) => {
                    setQuarterlyBillingPrice(e.target.value);
                    handlePricingStructureChange("quarterly", e.target.value);
                  }}
                />
              )}
              <div className="flex items-center">
                <Switch
                  checked={isHalfYearlyBillingChecked}
                  onCheckedChange={(checked) => {
                    setIsHalfYearlyBillingChecked(checked);
                    handlePricingStructureChange(
                      "half_yearly",
                      checked ? halfYearlyBillingPrice : ""
                    );
                  }}
                />
                <span className="ml-2">Half-Yearly</span>
              </div>
              {isHalfYearlyBillingChecked && (
                <Input
                  id="half-yearly-price"
                  name="halfYearlyBillingPrice"
                  placeholder="Enter half-yearly price"
                  className="rounded-md"
                  type="number"
                  value={halfYearlyBillingPrice}
                  onChange={(e) => {
                    setHalfYearlyBillingPrice(e.target.value);
                    handlePricingStructureChange("half_yearly", e.target.value);
                  }}
                />
              )}
              <div className="flex items-center">
                <Switch
                  checked={isYearlyBillingChecked}
                  onCheckedChange={(checked) => {
                    setIsYearlyBillingChecked(checked);
                    handlePricingStructureChange(
                      "yearly",
                      checked ? yearlyBillingPrice : ""
                    );
                  }}
                />
                <span className="ml-2">Yearly</span>
              </div>
              {isYearlyBillingChecked && (
                <Input
                  id="yearly-price"
                  name="yearlyBillingPrice"
                  placeholder="Enter yearly price"
                  className="rounded-md"
                  type="number"
                  value={yearlyBillingPrice}
                  onChange={(e) => {
                    setYearlyBillingPrice(e.target.value);
                    handlePricingStructureChange("yearly", e.target.value);
                  }}
                />
              )}
              <div className="flex items-center">
                <Switch
                  checked={isOneTimeBillingChecked}
                  onCheckedChange={(checked) => {
                    setIsOneTimeBillingChecked(checked);
                    handlePricingStructureChange(
                      "one_time",
                      checked ? oneTimeBillingPrice : ""
                    );
                  }}
                />
                <span className="ml-2">One-Time</span>
              </div>
              {isOneTimeBillingChecked && (
                <Input
                  id="one-time-price"
                  name="oneTimeBillingPrice"
                  placeholder="Enter one-time price"
                  className="rounded-md"
                  type="number"
                  value={oneTimeBillingPrice}
                  onChange={(e) => {
                    setOneTimeBillingPrice(e.target.value);
                    handlePricingStructureChange("one_time", e.target.value);
                  }}
                />
              )}
            </div>
          </ScrollArea>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Sub Service"
              : "Create Sub Service"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
