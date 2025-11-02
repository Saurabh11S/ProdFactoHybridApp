import { useEffect, useState } from "react";
import HeaderBar from "@/components/common/HeaderBar";
import { ServiceCard } from "@/components/subscription/serviceCard";
import { Button } from "@/components/ui/button";
import { ServiceModal } from "@/components/subscription/ServicesModal";
import { SERVICES } from "@/api/services";
import { showError, showSucccess } from "@/utils/toast";
import { ThreeDots } from "react-loader-spinner";

interface ServiceType {
  _id: string;
  title: string;
  description: string;
  icon: File | string;
  isActive: boolean;
}

function Subscriptions() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [servicesData, setServicesData] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await SERVICES.GetServices();
      setServicesData(response.data.services);
      // showSucccess("Data fetched successfully");
    } catch (error) {
      console.error(error);
      showError("There's an error in fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await SERVICES.DeleteService(id);
      fetchData();
      showSucccess("Service deleted successfully");
    } catch (error) {
      console.error(error);
      showError("There's an error in deleting the service");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Services" />
      <div className="flex flex-wrap justify-end mt-10">
        <Button onClick={openModal}>Add +</Button>
      </div>
      {loading ? (
        <div
          style={{
            width: "100px",
            margin: "auto",
          }}
        >
          <ThreeDots color="#253483" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {servicesData.map((service) => (
            <ServiceCard
              key={service._id}
              _id={service._id}
              title={service.title}
              isActive={service.isActive}
              description={service.description}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ServiceModal
        onServiceAdded={fetchData}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default Subscriptions;
