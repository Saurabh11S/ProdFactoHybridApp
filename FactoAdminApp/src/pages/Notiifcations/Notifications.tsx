import HeaderBar from "@/components/common/HeaderBar";
import NotificationsTable from "@/components/Notification/NotificationTable";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { NotificationModal } from "@/components/Notification/NotificationModal";
import { showError, showSucccess } from "@/utils/toast";
import { NOTIFICATIONS } from "@/api/notifications";
import { ThreeDots } from "react-loader-spinner";

interface NotificationsType{
  _id:string
  title:string,
  content:string,
}
function Notifications() {
  const [notificationsData, setNotificationsData] = useState<NotificationsType[]>([]);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchData= async ()=>{
    try{
      setLoading(true);
      const response = await NOTIFICATIONS.Get();
      console.log(response.data.notifications);
      setNotificationsData(response.data.notifications );
      // showSucccess("Data fetched successfully");
    }catch(error){
      console.error(error);
      showError("There's error in fetching data");
    }finally {
      setLoading(false);
    }
  }
  const handleDelete = async (id:string) => {
    try {
      const response = await NOTIFICATIONS.Delete(id); 
      showSucccess("Notification deleted successfully");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      showError("Failed to delete notification");
    } finally {
      fetchData();
    }
  };
  


  useEffect(()=>{
    fetchData();
  },[])

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Notifications" />
      <div className="p-3 flex justify-end my-2">
        <Button onClick={openModal}>Add +</Button>
      </div>

      {loading?(
            <div
            style={{
                width: "100px",
                margin: "auto",
            }}
        >
            <ThreeDots color="#253483"   />
            </div>
        ):(
          <NotificationsTable notificationsData={notificationsData} handleDelete={handleDelete} fetchData={fetchData} />
        )}

      <NotificationModal isOpen={isOpen} onClose={closeModal} fetchData={fetchData} />
    </div>
  );
}

export default Notifications;
