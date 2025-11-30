import { BLOGS } from "@/api/blogs";
import { BlogDetails } from "@/components/Blogs/BlogDetails";
import BlogsTable from "@/components/Blogs/BlogTable";
import HeaderBar from "@/components/common/HeaderBar";
import { Button } from "@/components/ui/button";
import { showError, showSucccess } from "@/utils/toast";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
// import { ToastContainer } from "react-toastify";

interface BlogsType {
  _id: string;
  title: string;
  content: string;
  contentType: string;
  contentUrl: string;
  author?: string;
  tags?: string[];
  createdAt: string;
}

function Blogs() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [blogsData, setBlogsData] = useState<BlogsType[]>([]);
    const [loading, setLoading] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const fetchData= async ()=>{
      try{
        setLoading(true);
        const response = await BLOGS.GetBlogs();
        console.log(response.data.blogs);
        setBlogsData(response.data.blogs );
        showSucccess("Data fetched successfully");
      }catch(error){
        console.error(error);
        showError("There's error in fetching data");
      }finally{
        setLoading(false);
      }
    }

    useEffect(()=>{
      fetchData();
    },[])

    const handleDelete = async (id:string) => {
      try {
        const response = await BLOGS.Delete(id); 
        showSucccess("Blog deleted successfully");
        console.log(response.data);
      } catch (error) {
        console.error(error);
        showError("Failed to delete notification");
      } finally {
        fetchData();
      }
    };
    
  
    return (
      <div className="w-11/12 m-auto">
        <HeaderBar pageTitle="Blogs" />
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
        <BlogsTable blogsData={blogsData} handleDelete={handleDelete} />

        )}
  
        <BlogDetails isOpen={isOpen} onClose={closeModal}/>
        {/*  */}
      </div>
    );
}

export default Blogs