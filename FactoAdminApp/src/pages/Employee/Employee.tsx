import HeaderBar from '@/components/common/HeaderBar'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react';
import EmployeeTable from '@/components/Employe/EmployeeTable';
import { AddEmployee } from '@/components/Employe/AddEmployee';
import { EMPLOYEE } from '@/api/employee';
import { showError, showSucccess } from '@/utils/toast';
import { ThreeDots } from 'react-loader-spinner';

interface EmployeeType{
  _id:string,
  email: string,
  password?: string,
  fullName: string,
  phoneNumber: string | number
}

function Employee() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [employeesData, setEmployeesData] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(false);


  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchData= async()=>{
    try{
      setLoading(true);
      const response = await EMPLOYEE.GetEmployees();
      if (response.success && response.data?.employees) {
        setEmployeesData(response.data.employees);
        console.log("front",response.data.employees);
      } else {
        showError(response.message || "Failed to fetch employees");
      }
    }catch(error: any){
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch employees";
      showError(errorMessage);
    }finally{
      setLoading(false);
    }
  }
  useEffect(()=>{
    fetchData();
  },[])

  const handleDelete = async (id:string) => {
    try {
      const response = await EMPLOYEE.Delete(id); 
      if (response.success) {
        showSucccess(response.message || "Employee deleted successfully");
      } else {
        showError(response.message || "Failed to delete employee");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete employee";
      showError(errorMessage);
    } finally {
      fetchData();
    }
  };
  
  return (
    <div>    
        <div className='w-11/12 m-auto'>
        <HeaderBar pageTitle='Employees'/>
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
          <EmployeeTable employeesData={employeesData} fetchData={fetchData} handleDelete={handleDelete}/>
        )}
        </div>
        <AddEmployee isOpen={isOpen} onClose={closeModal} fetchData={fetchData}/>
        
        
    </div>
    
  )
}

export default Employee