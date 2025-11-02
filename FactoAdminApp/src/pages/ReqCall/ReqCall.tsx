import { REQCALL } from "@/api/reqcall";
import HeaderBar from "@/components/common/HeaderBar";
import { ReqCallModal } from "@/components/ReqCall/ReqCallModal";
import ReqCallTable from "@/components/ReqCall/ReqCallTable";
import { Button } from "@/components/ui/button";
import { showError, showSucccess} from "@/utils/toast";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";


interface ReqCallsType{
  _id:string,
  phoneNo:number,
}

function ReqCall() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [callData, setCallData] = useState<ReqCallsType[]>([]);
    const [loading, setLoading] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const fetchData= async ()=>{
      try{
        setLoading(true);
        const response = await REQCALL.Get();
        console.log(response.data.requests);
        setCallData(response.data.requests );
        showSucccess("Data fetched successfully");
      }catch(error){
        console.error(error);
        showError("There's error in fetching data");
      }finally {
        setLoading(false);
      }
    }

    useEffect(()=>{
      fetchData();
    },[])

  
    return (
      <div className="w-11/12 m-auto">
        <HeaderBar pageTitle="Requests" />
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
          <ReqCallTable callData={callData} fetchRequest={fetchData}/>
        )}
  
        <ReqCallModal fetchData={fetchData} isOpen={isOpen} onClose={closeModal}/>
      
      </div>
    );
}

export default ReqCall