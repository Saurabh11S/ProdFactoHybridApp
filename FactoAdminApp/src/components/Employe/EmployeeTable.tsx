import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import SearchBar from "../common/Searchbar";
import { EmployeeProfile } from "./EmployeeProfile";
import { saveAs } from "file-saver";

// const usersData = [
//   {
//     id: "1",
//     name: "John Doe",
//     contact: "123-456-7890",
//     email: "john.doe@example.com",
//     createdAt: "2024-11-15",
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     contact: "987-654-3210",
//     email: "jane.smith@example.com",
//     createdAt: "2024-11-14",
//   },
//   {
//     id: "3",
//     name: "Alice Johnson",
//     contact: "456-789-0123",
//     email: "alice.j@example.com",
//     createdAt: "2024-11-13",
//   },
// ];

interface EmployeeType{
  _id:string,
  email: string,
  password: string,
  fullName: string,
  phoneNumber: number
}

export default function EmployeeTable({
  employeesData,
  handleDelete,
  fetchData,

}: {
  employeesData: EmployeeType[];
  handleDelete: (id: string) => void;
  fetchData: () => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewUser, setViewUser] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const closeModal = () => setIsOpen(false);

  const tableHeaders = [
    { label: "Name", key: "name" },
    { label: "Contact", key: "contact" },
    { label: "Email", key: "email" },
    { label: "Actions", key: "actions" },
  ];

  const handleCheckboxChange = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((employee) => employee._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleExport = () => {
    if (selectedUsers.length === 0) {
      alert("No users selected for export.");
      return;
    }
  
    const exportData = employeesData.filter((user) =>
      selectedUsers.includes(user._id)
    );
  
    const headers = `"Email","Full Name","Phone Number","Aadhar Number","PAN Number","Date of Birth"`;
    const rows = exportData
      .map((user) => {
        const email = (user.email || "").replace(/"/g, '""');
        const fullName = (user.fullName || "").replace(/"/g, '""');
        const phoneNumber = user.phoneNumber || ""; 
  
        return `"${email}","${fullName}",${phoneNumber}`;
      })
      .join("\n");
  
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  
    saveAs(blob, "employee.csv");
  };

  const handleViewDetails = (userId: string) => {
    console.log("Viewing details for user:", userId);
    setViewUser(userId);
    setIsOpen(true);
  };

 

  // Filter users based on search query
  const filteredUsers = employeesData.filter((employee) =>
    Object.values(employee)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SearchBar onChange={(value) => setSearchQuery(value)}/>

      <Table>
        <TableCaption>A list of your users.</TableCaption>
        <TableHeader className=" bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  filteredUsers.length > 0 &&
                  selectedUsers.length === filteredUsers.length
                }
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                aria-label="Select all users"
              />
            </TableHead>
            {tableHeaders.map((header) => (
              <TableHead key={header.key}>{header.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((employee) => (
            <TableRow key={employee._id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(employee._id)}
                  onCheckedChange={() => handleCheckboxChange(employee._id)}
                  aria-label={`Select user ${employee.fullName}`}
                />
              </TableCell>
              <TableCell>{employee.fullName}</TableCell>
              <TableCell>{employee.phoneNumber}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleViewDetails(employee._id)}>View</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(employee._id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              {selectedUsers.length > 0 && (
                <div className="flex justify-between">
                  <span>
                    Selected Users: {selectedUsers.length} of {filteredUsers.length}
                  </span>
                  <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <EmployeeProfile isOpen={isOpen} onClose={closeModal} fetchData={fetchData} userId={viewUser} />
    </div>
  );
}
