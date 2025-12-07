import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderBar from "@/components/common/HeaderBar";
import { ThreeDots } from "react-loader-spinner";
import axios from "axios";
import { BASE_URL } from "@/utils/apiConstants";
import { showSucccess, showError } from "@/utils/toast";
import { Clock, CheckCircle2, DollarSign, User, Package } from "lucide-react";

interface ConsultationData {
  _id: string;
  purchaseId: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  service: {
    _id: string;
    title: string;
    description: string;
  };
  selectedFeatures: string[];
  billingPeriod: string;
  status: 'pending' | 'activated';
  consultationPrice: number;
  paymentActivatedByAdmin: boolean;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const ConsultationManagement: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activatingPayment, setActivatingPayment] = useState<string | null>(null);

  const fetchConsultations = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/admin/consultations/pending?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { consultations, pagination } = response.data.data;
      setConsultations(consultations);
      setFilteredConsultations(consultations);
      setTotalPages(pagination.totalPages);
      setCurrentPage(pagination.page);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      showError("Failed to fetch consultation requests");
      setLoading(false);
    }
  };

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
        // Refresh consultations
        fetchConsultations(currentPage);
      }
    } catch (error: any) {
      console.error("Error activating payment:", error);
      showError(error.response?.data?.message || "Failed to activate payment");
    } finally {
      setActivatingPayment(null);
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    setPriceInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term) {
      setFilteredConsultations(consultations);
      return;
    }

    const lowerCaseTerm = term.toLowerCase();
    const filtered = consultations.filter(
      (c) =>
        c.userId.fullName.toLowerCase().includes(lowerCaseTerm) ||
        c.userId.email.toLowerCase().includes(lowerCaseTerm) ||
        c.userId.phoneNumber.includes(lowerCaseTerm) ||
        c.service.title.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredConsultations(filtered);
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const renderPagination = () => (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        onClick={() => fetchConsultations(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => fetchConsultations(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Free Consultation Requests" />
      
      <div className="p-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by user name, email, phone, or service..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ThreeDots color="#253483" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredConsultations?.map((consultation) => (
              <Card key={consultation._id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {consultation.service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* User Information */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{consultation.userId.fullName}</p>
                        <p className="text-xs text-gray-600">{consultation.userId.email}</p>
                        <p className="text-xs text-gray-600">{consultation.userId.phoneNumber}</p>
                      </div>
                    </div>

                    {/* Selected Features */}
                    {consultation.selectedFeatures && consultation.selectedFeatures.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Selected Features:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600">
                          {consultation.selectedFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Billing Period */}
                    <div>
                      <span className="text-xs text-gray-600">Billing Period: </span>
                      <span className="text-xs font-medium capitalize">
                        {consultation.billingPeriod.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {consultation.status === 'pending' ? (
                        <>
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-600">Quote Pending</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Payment Activated</span>
                        </>
                      )}
                    </div>

                    {/* Price Activation Section */}
                    {consultation.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Set Price & Activate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Enter price (₹)"
                            value={priceInputs[consultation.purchaseId] || ""}
                            onChange={(e) =>
                              handlePriceChange(consultation.purchaseId, e.target.value)
                            }
                            className="flex-1"
                            min="0"
                            step="0.01"
                          />
                          <Button
                            onClick={() => handleActivatePayment(consultation.purchaseId)}
                            disabled={activatingPayment === consultation.purchaseId || !priceInputs[consultation.purchaseId]}
                            className="bg-primary text-white"
                            size="sm"
                          >
                            {activatingPayment === consultation.purchaseId ? "Activating..." : "Activate"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Activated Price Display */}
                    {consultation.status === 'activated' && consultation.consultationPrice > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Price Set: ₹{consultation.consultationPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {consultation.activatedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Activated: {new Date(consultation.activatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Request Date */}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested: {new Date(consultation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConsultations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No pending consultation requests found</p>
            </div>
          )}

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ConsultationManagement;

