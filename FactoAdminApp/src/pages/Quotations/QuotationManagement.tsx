import React, { useEffect, useState } from "react";
import HeaderBar from "@/components/common/HeaderBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThreeDots } from "react-loader-spinner";
import axios from "axios";
import { showError, showSucccess } from "@/utils/toast";
import MultiStepQuotationForm from "@/components/Quotation/AddQuotationForm";
import { BASE_URL } from "@/utils/apiConstants";

interface QuotationData {
  _id: string;
  userId: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  subServiceId: {
    title: string;
  };
  selectedFeatures: string[];
  price: number;
  createdAt: string;
}

const QuotationManagement: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [priceUpdates, setPriceUpdates] = useState<{ [key: string]: number }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchQuotations = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/admin/quotation?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { quotations, totalPages } = response.data.data;
      setQuotations(quotations);
      setFilteredQuotations(quotations);
      setTotalPages(totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      showError("Failed to fetch quotations");
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (quotationId: string) => {
    try {
      const token = localStorage.getItem("token");
      const totalPrice = priceUpdates[quotationId];

      if (!totalPrice || totalPrice <= 0) {
        showError("Please enter a valid price");
        return;
      }

      await axios.put(
        `${BASE_URL}/admin/quotation/${quotationId}`,
        { totalPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSucccess("Quotation price updated successfully");
      fetchQuotations(currentPage);

      // Reset price update input
      setPriceUpdates((prev) => {
        const updatedPrices = { ...prev };
        delete updatedPrices[quotationId];
        return updatedPrices;
      });
    } catch (error) {
      console.error("Error updating quotation price:", error);
      showError("Failed to update quotation price");
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    setPriceUpdates((prev) => ({
      ...prev,
      [id]: parseFloat(value),
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term) {
      setFilteredQuotations(quotations);
      return;
    }

    const lowerCaseTerm = term.toLowerCase();
    const filtered = quotations.filter(
      (q) =>
        q.userId.phoneNumber.includes(lowerCaseTerm) ||
        q.subServiceId?.title.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredQuotations(filtered);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const renderPagination = () => (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <Button
        onClick={() => {
          if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            fetchQuotations(currentPage - 1);
          }
        }}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => {
          if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchQuotations(currentPage + 1);
          }
        }}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Quotation Management" />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Input
          type="text"
          placeholder="Search by phone number or service title"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
        <Button onClick={() => setShowForm(!showForm)} className="mt-4 md:mt-0">
          {showForm ? "Hide Form" : "Create New Quotation"}
        </Button>
      </div>
      {showForm && <MultiStepQuotationForm setShowForm={setShowForm} />}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ThreeDots color="#253483" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredQuotations?.map((quotation) => (
              <div
                key={quotation._id}
                className="bg-white shadow-md rounded-lg p-4 border"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {quotation?.subServiceId?.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  Phone Number: {quotation?.userId?.phoneNumber}
                </p>
                <div className="mb-2">
                  <strong>Selected Features:</strong>
                  <ul className="list-disc list-inside text-sm">
                    {quotation.selectedFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-600 mb-2">
                  Current Price: ₹{quotation.price}
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <Input
                    type="number"
                    placeholder="New Price"
                    value={priceUpdates[quotation._id] || ""}
                    onChange={(e) =>
                      handlePriceChange(quotation._id, e.target.value)
                    }
                    className="flex-grow"
                  />
                  <Button
                    onClick={() => handlePriceUpdate(quotation._id)}
                    className="bg-primary text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default QuotationManagement;
