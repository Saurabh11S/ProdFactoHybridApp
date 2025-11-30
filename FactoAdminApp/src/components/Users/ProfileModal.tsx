import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USERS } from "@/api/user";
import { showError, showSucccess } from "@/utils/toast";
import { Package, MessageSquare, CheckCircle2, Clock } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
  userId: string;
}

export function ProfileModal({
  isOpen,
  onClose,
  userId,
  fetchData,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [services, setServices] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    aadharNumber: "",
    panNumber: "",
    dateOfBirth: "",
  });

  const fetchUserData = async (id: string) => {
    try {
      const response = await USERS.GetById(id);
      if (response.data && response.data.user) {
        setFormData(response.data.user);
      } else {
        console.warn("No user data found for ID:", id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
      fetchUserServices(userId);
      fetchUserConsultations(userId);
    }
  }, [userId]);

  const fetchUserServices = async (id: string) => {
    try {
      setLoadingServices(true);
      const response = await USERS.GetUserServices(id);
      if (response.data && response.data.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Error fetching user services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchUserConsultations = async (id: string) => {
    try {
      setLoadingConsultations(true);
      const response = await USERS.GetUserConsultations(id);
      if (response.data && response.data.consultations) {
        setConsultations(response.data.consultations);
      }
    } catch (error) {
      console.error("Error fetching user consultations:", error);
    } finally {
      setLoadingConsultations(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await USERS.Update({
        _id: userId,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        dateOfBirth: formData.dateOfBirth,
      });

      if (response.success) {
        setIsEditing(false);
        showSucccess(response.message || "Profile updated successfully");
        fetchUserData(userId);
        fetchData();
      } else {
        showError(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error during update:", error);
      showError(
        error.response?.data?.message || "An error occurred while updating"
      );
    }
  };

  // if (!formData.fullName && !isEditing) {
  //   return <p>Loading...</p>;
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-11 font-poppins">
        <DialogTitle>Users Profile</DialogTitle>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{formData.fullName}</p>
                <p className="text-gray-500 text-base">{formData.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline">Payment History</Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs for Profile, Services, and Consultations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">
              Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="consultations">
              Consultations ({consultations.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <form className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              name="fullName"
              placeholder="Your Full Name"
              value={formData.fullName || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <Input
              name="email"
              placeholder="example@gmail.com"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <Input
              name="phoneNumber"
              placeholder="Phone number"
              value={formData.phoneNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <Input
              name="dateOfBirth"
              type="date"
              placeholder="Date of Birth"
              value={
                formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""
              }
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Aadhar Number
            </label>
            <Input
              name="aadharNumber"
              placeholder="Aadhar Number"
              value={formData.aadharNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">PAN Number</label>
            <Input
              name="panNumber"
              placeholder="PAN Number"
              value={formData.panNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </form>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-4">
            {loadingServices ? (
              <div className="text-center py-8">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No services purchased yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {services.map((service) => (
                  <div
                    key={service._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{service.subServiceTitle}</h3>
                        <p className="text-sm text-gray-600">{service.serviceTitle}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : service.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Purchase Date:</span>
                        <span className="ml-2">
                          {new Date(service.purchaseDate).toLocaleDateString()}
                        </span>
                      </div>
                      {service.expiryDate && (
                        <div>
                          <span className="text-gray-600">Expiry Date:</span>
                          <span className="ml-2">
                            {new Date(service.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {service.amount && (
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-semibold">
                            {service.currency} {service.amount}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Billing:</span>
                        <span className="ml-2">{service.billingPeriod}</span>
                      </div>
                    </div>
                    {service.selectedFeatures && service.selectedFeatures.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Features:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {service.selectedFeatures.map((feature: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="mt-4">
            {loadingConsultations ? (
              <div className="text-center py-8">Loading consultations...</div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No consultations requested yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {consultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.category === 'service'
                              ? 'bg-blue-100 text-blue-800'
                              : consultation.category === 'course'
                              ? 'bg-purple-100 text-purple-800'
                              : consultation.category === 'updated'
                              ? 'bg-green-100 text-green-800'
                              : consultation.category === 'consultation'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {consultation.category}
                        </span>
                        {consultation.itemName && (
                          <span className="text-sm font-medium text-gray-700">
                            {consultation.itemName}
                          </span>
                        )}
                      </div>
                      {consultation.isResponded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Responded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 mb-2">{consultation.query}</p>
                      {consultation.comment && (
                        <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                          <p className="text-xs font-medium text-green-800 mb-1">Admin Response:</p>
                          <p className="text-sm text-gray-700">{consultation.comment}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span>Requested: {new Date(consultation.createdAt).toLocaleDateString()}</span>
                      {consultation.respondedAt && (
                        <span className="ml-4">
                          Responded: {new Date(consultation.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isEditing ? (
            <Button onClick={handleEditClick}>Edit Profile</Button>
          ) : (
            <Button onClick={handleSaveClick}>Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
