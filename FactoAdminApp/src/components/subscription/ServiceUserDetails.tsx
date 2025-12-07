import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { useEffect, useState, useCallback } from "react";
  import { USERS } from "@/api/user";
  import { SERVICES } from "@/api/services";
  import { Package, FileText, MessageSquare, CheckCircle2, Clock, Download } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import axios from "axios";
  import { BASE_URL } from "@/utils/apiConstants";
  import { showSucccess, showError } from "@/utils/toast";
  
  interface ServiceUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    serviceId: string;
    serviceName: string;
    purchaseDate: string;
  }
  
  export function ServiceUserDetails({
    isOpen,
    onClose,
    userId,
    serviceId,
    serviceName,
    purchaseDate,
  }: ServiceUserDetailsProps) {
    const [activeTab, setActiveTab] = useState("profile");
    const [userProfile, setUserProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [allDocuments, setAllDocuments] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [loadingAllDocs, setLoadingAllDocs] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingConsultations, setLoadingConsultations] = useState(false);
    const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});
    const [activatingPayment, setActivatingPayment] = useState<string | null>(null);

    const fetchUserProfile = useCallback(async () => {
      try {
        setLoading(true);
        const response = await USERS.GetById(userId);
        if (response.data && response.data.user) {
          setUserProfile(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }, [userId]);

    const fetchDocuments = useCallback(async () => {
      try {
        setLoadingDocs(true);
        console.log("Fetching documents for userId:", userId, "serviceId:", serviceId);
        const response = await SERVICES.GetUserServiceDocuments(userId, serviceId);
        console.log("Documents response:", response);
        if (response.data && response.data.documents) {
          setDocuments(response.data.documents);
          console.log("Documents set:", response.data.documents.length);
        } else {
          console.warn("No documents in response:", response);
          setDocuments([]);
        }
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        console.error("Error details:", error.response?.data || error.message);
        setDocuments([]);
        // Show error to admin
        if (error.response?.status === 404) {
          console.warn("No documents found for this service");
        }
      } finally {
        setLoadingDocs(false);
      }
    }, [userId, serviceId]);

    const fetchAllDocuments = useCallback(async () => {
      try {
        setLoadingAllDocs(true);
        console.log("Fetching all documents for userId:", userId);
        const response = await SERVICES.GetAllUserDocuments(userId);
        console.log("All documents response:", response);
        if (response.data && response.data.documents) {
          setAllDocuments(response.data.documents);
          console.log("All documents set:", response.data.documents.length);
        } else {
          console.warn("No documents in response:", response);
          setAllDocuments([]);
        }
      } catch (error: any) {
        console.error("Error fetching all documents:", error);
        console.error("Error details:", error.response?.data || error.message);
        setAllDocuments([]);
      } finally {
        setLoadingAllDocs(false);
      }
    }, [userId]);

    const fetchAllServices = useCallback(async () => {
      try {
        setLoadingServices(true);
        const response = await USERS.GetUserServices(userId);
        console.log("User services response:", response);
        if (response.data && response.data.services) {
          setAllServices(response.data.services);
        } else {
          console.warn("No services found in response:", response);
          setAllServices([]);
        }
      } catch (error: any) {
        console.error("Error fetching user services:", error);
        console.error("Error details:", error.response?.data || error.message);
        setAllServices([]);
      } finally {
        setLoadingServices(false);
      }
    }, [userId]);

    const fetchConsultations = useCallback(async () => {
      try {
        setLoadingConsultations(true);
        // Fetch user consultations directly
        const response = await USERS.GetUserConsultations(userId);
        console.log("User consultations response:", response);
        if (response.data && response.data.consultations) {
          // Show all consultations for the user, optionally filter by service if serviceName is provided
          let consultationsToShow = response.data.consultations;
          
          // Show all consultations for the user
          // If serviceName is provided, optionally filter, but show all if no matches
          if (serviceName && consultationsToShow.length > 0) {
            const filtered = consultationsToShow.filter(
              (consultation: any) => {
                // Always include service category consultations
                if (consultation.category === 'service') {
                  return true;
                }
                // Include if consultation mentions this service name
                if (consultation.itemName && serviceName) {
                  const itemLower = consultation.itemName.toLowerCase();
                  const serviceLower = serviceName.toLowerCase();
                  if (itemLower.includes(serviceLower) || serviceLower.includes(itemLower)) {
                    return true;
                  }
                }
                // Include if query mentions service name
                if (consultation.query && serviceName) {
                  if (consultation.query.toLowerCase().includes(serviceName.toLowerCase())) {
                    return true;
                  }
                }
                return false;
              }
            );
            
            // If filtering found results, use them; otherwise show all
            if (filtered.length > 0) {
              consultationsToShow = filtered;
            }
            // If no matches, show all consultations anyway
          }
          
          setConsultations(consultationsToShow);
        } else {
          console.warn("No consultations found in response:", response);
          setConsultations([]);
        }
      } catch (error: any) {
        console.error("Error fetching consultations:", error);
        console.error("Error details:", error.response?.data || error.message);
        setConsultations([]);
      } finally {
        setLoadingConsultations(false);
      }
    }, [userId, serviceName]);

    // Handle activating payment for free consultation
    const handleActivatePayment = async (purchaseId: string) => {
      const price = parseFloat(priceInputs[purchaseId]);
      
      if (!price || price <= 0) {
        showError("Please enter a valid price");
        return;
      }

      try {
        setActivatingPayment(purchaseId);
        const token = localStorage.getItem("token");
        
        const response = await axios.put(
          `${BASE_URL}/admin/consultation/${purchaseId}/activate-payment`,
          { price },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          showSucccess("Payment activated successfully. User can now proceed with payment.");
          // Clear price input
          setPriceInputs((prev) => {
            const updated = { ...prev };
            delete updated[purchaseId];
            return updated;
          });
          // Refresh services to show updated status
          fetchAllServices();
        }
      } catch (error: any) {
        console.error("Error activating payment:", error);
        showError(error.response?.data?.message || "Failed to activate payment");
      } finally {
        setActivatingPayment(null);
      }
    };

    // Fetch all data when modal opens
    useEffect(() => {
      if (isOpen && userId) {
        // Fetch user profile first
        fetchUserProfile();
        
        // Fetch all data immediately when modal opens (don't wait for tab click)
        if (serviceId) {
          fetchDocuments();
        }
        fetchAllDocuments();
        fetchAllServices();
        fetchConsultations();
      } else {
        // Reset data when modal closes
        setUserProfile(null);
        setDocuments([]);
        setAllDocuments([]);
        setAllServices([]);
        setConsultations([]);
        setActiveTab("profile"); // Reset to profile tab
      }
    }, [isOpen, userId, serviceId, fetchUserProfile, fetchDocuments, fetchAllDocuments, fetchAllServices, fetchConsultations]);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User & Service Details</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8">Loading user profile...</div>
          ) : userProfile ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="documents">
                  Documents {loadingDocs || loadingAllDocs ? "(...)" : `(${allDocuments.length > 0 ? allDocuments.length : documents.length})`}
                </TabsTrigger>
                <TabsTrigger value="services">
                  All Services {loadingServices ? "(...)" : `(${allServices.length})`}
                </TabsTrigger>
                <TabsTrigger value="consultations">
                  Consultations {loadingConsultations ? "(...)" : `(${consultations.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-600">Full Name:</p>
                        <p className="text-gray-800">{userProfile.fullName || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-600">Email:</p>
                        <p className="text-gray-800">{userProfile.email || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-600">Phone Number:</p>
                        <p className="text-gray-800">{userProfile.phoneNumber || 'N/A'}</p>
                      </div>
                      {userProfile.aadharNumber && (
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-600">Aadhar Card:</p>
                          <p className="text-gray-800">{userProfile.aadharNumber}</p>
                        </div>
                      )}
                      {userProfile.panNumber && (
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-600">PAN Card:</p>
                          <p className="text-gray-800">{userProfile.panNumber}</p>
                        </div>
                      )}
                      {userProfile.dateOfBirth && (
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-600">Date of Birth:</p>
                          <p className="text-gray-800">
                            {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Service Details Tab */}
              <TabsContent value="service" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-600">Service Name:</p>
                        <p className="text-gray-800">{serviceName}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-600">Purchase Date:</p>
                        <p className="text-gray-800">
                          {new Date(purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Uploaded Documents Tab */}
              <TabsContent value="documents" className="mt-4">
                {loadingDocs || loadingAllDocs ? (
                  <div className="text-center py-8">Loading documents...</div>
                ) : (allDocuments.length === 0 && documents.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show all documents grouped by service if available, otherwise show service-specific documents */}
                    {allDocuments.length > 0 ? (
                      // Group documents by service
                      (() => {
                        const documentsByService = allDocuments.reduce((acc: any, doc: any) => {
                          const serviceName = doc.subServiceId?.title || doc.subServiceId || 'Unknown Service';
                          if (!acc[serviceName]) {
                            acc[serviceName] = [];
                          }
                          acc[serviceName].push(doc);
                          return acc;
                        }, {});

                        return Object.entries(documentsByService).map(([serviceName, docs]: [string, any]) => (
                          <Card key={serviceName} className="mb-4">
                            <CardHeader>
                              <CardTitle className="text-md font-semibold text-gray-700">
                                {serviceName} ({docs.length} {docs.length === 1 ? 'document' : 'documents'})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {docs.map((doc: any) => (
                                  <div key={doc._id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <p className="font-medium text-gray-800">{doc.title || doc.documentType}</p>
                                        {doc.documentType && (
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            doc.documentType === 'required' 
                                              ? 'bg-blue-100 text-blue-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {doc.documentType}
                                          </span>
                                        )}
                                      </div>
                                      {doc.description && (
                                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                      )}
                                      <p className="text-xs text-gray-500 mt-2">
                                        Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'short', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    {doc.documentUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(doc.documentUrl, '_blank')}
                                        className="ml-4"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        View
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ));
                      })()
                    ) : (
                      // Fallback to service-specific documents
                      <div className="space-y-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-md font-semibold text-gray-700">
                              {serviceName} ({documents.length} {documents.length === 1 ? 'document' : 'documents'})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {documents.map((doc) => (
                                <div key={doc._id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileText className="w-4 h-4 text-gray-500" />
                                      <p className="font-medium text-gray-800">{doc.title || doc.documentType}</p>
                                      {doc.documentType && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          doc.documentType === 'required' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {doc.documentType}
                                        </span>
                                      )}
                                    </div>
                                    {doc.description && (
                                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                      Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  {doc.documentUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(doc.documentUrl, '_blank')}
                                      className="ml-4"
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* All Services Tab */}
              <TabsContent value="services" className="mt-4">
                {loadingServices ? (
                  <div className="text-center py-8">Loading services...</div>
                ) : allServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No services purchased</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allServices.map((service) => (
                      <Card key={service._id}>
                        <CardContent className="p-4">
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
                            {service.amount && (
                              <div>
                                <span className="text-gray-600">Amount:</span>
                                <span className="ml-2 font-semibold">
                                  {service.currency} {service.amount}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Show price activation for free consultation requests */}
                          {service.paymentStatus === 'free_consultation' && !service.paymentActivatedByAdmin && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-600">Quote Pending - Set Price</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Enter price (₹)"
                                  value={priceInputs[service._id] || ""}
                                  onChange={(e) =>
                                    setPriceInputs((prev) => ({
                                      ...prev,
                                      [service._id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1"
                                  min="0"
                                  step="0.01"
                                />
                                <Button
                                  onClick={() => handleActivatePayment(service._id)}
                                  disabled={activatingPayment === service._id || !priceInputs[service._id]}
                                  className="bg-primary text-white"
                                >
                                  {activatingPayment === service._id ? "Activating..." : "Activate Payment"}
                                </Button>
                              </div>
                            </div>
                          )}
                          {/* Show activated status */}
                          {service.paymentStatus === 'free_consultation' && service.paymentActivatedByAdmin && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                  Payment Activated - ₹{service.consultationPrice || service.amount || 0}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Show documents for this service */}
                          {allDocuments.filter((doc: any) => {
                            const docServiceId = doc.subServiceId?._id || doc.subServiceId;
                            return docServiceId?.toString() === service.subServiceId?.toString();
                          }).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">Uploaded Documents</span>
                              </div>
                              <div className="space-y-2">
                                {allDocuments
                                  .filter((doc: any) => {
                                    const docServiceId = doc.subServiceId?._id || doc.subServiceId;
                                    return docServiceId?.toString() === service.subServiceId?.toString();
                                  })
                                  .map((doc: any) => (
                                    <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{doc.title || doc.documentType}</p>
                                        {doc.description && (
                                          <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {doc.documentUrl && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(doc.documentUrl, '_blank')}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          View
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
                    <p>No consultations for this service</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {consultations.map((consultation) => (
                      <Card key={consultation._id}>
                        <CardContent className="p-4">
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
                          <p className="text-sm text-gray-700 mt-2 mb-2">{consultation.query}</p>
                          {consultation.comment && (
                            <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                              <p className="text-xs font-medium text-green-800 mb-1">Admin Response:</p>
                              <p className="text-sm text-gray-700">{consultation.comment}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Requested: {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">User not found</div>
          )}
  
          <div className="flex justify-end mt-6 space-x-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  