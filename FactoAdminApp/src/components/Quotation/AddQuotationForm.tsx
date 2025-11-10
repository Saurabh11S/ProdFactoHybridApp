"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/utils/apiConstants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { USERS } from "@/api/user";
import { SERVICES } from "@/api/services";
import { SUBSERVICES } from "@/api/sub-services";
import { showError, showSucccess } from "@/utils/toast";
import { FileText } from "lucide-react";
import PricingDialog from "@/components/Quotation/pricing-dialog";
import axios from "axios";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface Service {
  _id: string;
  title: string;
}

interface SubService {
  _id: string;
  title: string;
  price: number;
  requests: Request[];
}
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

type BillingPeriod =
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "yearly"
  | "one_time";

export default function MultiStepQuotationForm({setShowForm}:{setShowForm: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");
  //   const [selectedFeatures, setSelectedFeatures] = useState<{[key: string]: string | boolean}>({})
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [price, setPrice] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchSubServices(selectedService);
    }
  }, [selectedService]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await USERS.GetUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await SERVICES.GetServices();
      setServices(response.data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubServices = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await SUBSERVICES.GetSubServices(serviceId);
      console.log(response);
      setSubServices(response.data.subServices);
    } catch (error) {
      console.error("Error fetching sub-services:", error);
      showError("Failed to fetch sub-services");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Here you would typically send the data to your backend
    console.log({
      user: selectedUser,
      service: selectedService,
      subService: selectedSubService,
      selectedFeatures,
      billingPeriod,
      price: price,
    });
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/quotation`,
        {
          userId: selectedUser,
          subServiceId: selectedSubService,
          selectedFeatures: selectedFeatures,
          price: price,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if(response.data.success){
          showSucccess(response.data.message || "Quotation created successfully");
        setShowForm(false);
      } else {
        showError(response.data.message || "Failed to create quotation");
      }
    } catch (err: any) {
      console.error("Error creating quotation:", err);
      showError(
        err.response?.data?.message || 
        err.response?.data?.status?.message ||
        "Something went wrong while creating quotation"
      );
    }
    // Reset form
    setStep(1);
    setSelectedUser("");
    setSelectedService("");
    setSelectedSubService("");
    setSelectedFeatures([]);
    setBillingPeriod("monthly");
    setPrice("");
  };
 if(loading){
    return <>Loading</>
 }
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.phoneNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Label htmlFor="service">Select Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <Label htmlFor="subService">Select Sub-Service</Label>
            <Select
              value={selectedSubService}
              onValueChange={setSelectedSubService}
            >
              <SelectTrigger id="subService">
                <SelectValue placeholder="Select a sub-service" />
              </SelectTrigger>
              <SelectContent>
                {subServices.map((subService) => (
                  <SelectItem key={subService._id} value={subService._id}>
                    {subService.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 4 && selectedSubService && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-[#3b4ba7]" />
                <CardTitle>
                  {subServices.find((s) => s._id === selectedSubService)?.title}
                </CardTitle>
              </div>
              <Select
                value={billingPeriod}
                onValueChange={(value: BillingPeriod) =>
                  setBillingPeriod(value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select billing period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half_yearly">Half-Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one_time">One-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PricingDialog
              setRequests={setSelectedFeatures}
              requests={
                subServices.find((s) => s._id === selectedSubService)?.requests
              }
            />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <Label htmlFor="price">Set Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < 5 ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedUser) ||
              (step === 2 && !selectedService) ||
              (step === 3 && !selectedSubService) ||
              (step === 4 && Object.keys(selectedFeatures).length === 0)
            }
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!price}>
            Submit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
