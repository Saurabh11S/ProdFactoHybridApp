// import React, { useEffect, useState } from "react";
// import { ServiceCard } from "./serviceCard";
// import { SERVICES } from "../../api/services/index";

// export default function ServicesList() {
//   const [services, setServices] = useState([]); 
//   const [loading, setLoading] = useState(false);

//   const fetchServices = async () => {
//     setLoading(true);
//     try {
//       const data = await SERVICES.GetServices();
//       setServices(data); 
//     } catch (error) {
//       console.error("Error fetching services:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle delete action
//   // const handleDelete = async (id: number) => {
//   //   try {
//   //     setLoading(true);
//   //     console.log(`Attempting to delete service with ID: ${id}`);
//   //     const response = await SERVICES.DeleteService(id.toString());
//   //     console.log("Delete response:", response); 
//   //     fetchServices();

//   //     console.log(`Service with ID ${id} deleted successfully.`);
//   //   } catch (error) {
//   //     console.error("Error deleting service:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   useEffect(() => {
//     fetchServices(); 
//   }, []);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (services.length === 0) {
//     return <p>No services found.</p>;
//   }

//   return (
//     <div className="space-y-4">
//       {services.map((service: any) => (
//         <ServiceCard
//           key={service.id}
//           id={service.id}
//           title={service.title}
//           description={service.description}
//           frequency={service.frequency}
//           features={service.features}
//           pricing={service.pricing}
//           handleDelete={handleDelete} 
//         />
//       ))}
//     </div>
//   );
// }
