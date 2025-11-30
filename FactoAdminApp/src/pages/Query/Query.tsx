import HeaderBar from "@/components/common/HeaderBar";
import SearchBar from "@/components/common/Searchbar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import QueryTable from "@/components/Query/QueryTable";
// import { QueryModal } from "@/components/Query/AddQuery";
import { QUERIES } from "@/api/query";
import { showError, showSucccess } from "@/utils/toast";
import { AllQuery } from "@/components/Query/AllQuery";
import { ThreeDots } from "react-loader-spinner";

interface QueryType{
  _id:string
  email: string,
  name: string,
  phoneNo: number,
  query: string,
  createdAt?:string;
  comment?:string;
  category?: string;
  isResponded?: boolean;
  respondedAt?: string;
}

function Query() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [queries, setQueries] = useState<QueryType[]>([]);
  const [loading, setLoading] = useState(false);



  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchData= async ()=>{
    try{
      setLoading(true);
      const response = await QUERIES.Get();
      console.log(response.data.queries);
      setQueries(response.data.queries );
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
      <HeaderBar pageTitle="Query" />
      <div className="py-3 flex justify-between my-2">

          <SearchBar onChange={() => {}} />

        <Button onClick={openModal}>View All Queries</Button>
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
          <QueryTable queries={queries} fetchData={fetchData} />
        )}

      {/* <QueryModal isOpen={isOpen} onClose={closeModal} /> */}
      <AllQuery queries={queries} isOpen={isOpen} onClose={closeModal} fetchData={fetchData}/>

    </div>
  );
}

export default Query;
