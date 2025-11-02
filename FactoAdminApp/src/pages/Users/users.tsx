import HeaderBar from '@/components/common/HeaderBar'
import UsersTable from '@/components/Users/UsersTable'
import { Button } from '@/components/ui/button'
import { AddUserModal } from '@/components/Users/AddUserModal';
import { useEffect, useState } from 'react';
import { USERS } from '@/api/user';
import { showError, showSucccess } from '@/utils/toast';
import { ThreeDots } from "react-loader-spinner";



interface UserType {
  _id:string,
  email: string,
  fullName: string,
  phoneNumber: number,
  aadharNumber: number,
  panNumber: string,
  dateOfBirth: string
}


function Users() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [usersData, setUsersData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);



  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchData= async()=>{
    try{
      setLoading(true);
      const response = await USERS.GetUsers();
      setUsersData(response.data.users);
      console.log("front",response.data.users);
    }catch(error){
      console.error(error);
    }finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    fetchData();
  },[])
  
  const handleDelete = async (id:string) => {
    try {
      const response = await USERS.Delete(id); 
      showSucccess("User deleted successfully");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      showError("Failed to delete user");
    } finally {
      fetchData();
    }
  };

  return (
    <div>    
        <div className='w-11/12 m-auto'>
        <HeaderBar pageTitle='Users'/>
        <div className='p-3 flex justify-end my-2'>
          <Button onClick={()=>openModal()}>Add +</Button>
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
          <UsersTable usersData={usersData} fetchData={fetchData} handleDelete={handleDelete}/>
        )}
        </div>
        <AddUserModal isOpen={isOpen} onClose={closeModal} fetchData={fetchData}/>
        
        
    </div>
    
  )
}

export default Users