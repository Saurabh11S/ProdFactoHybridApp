import {  useState } from "react";
import moment from "moment";
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
import { ProfileModal } from "./ProfileModal";
import SearchBar from "../common/Searchbar";
import { saveAs } from "file-saver";

interface UserType {
  _id:string,
  email: string,
  fullName: string,
  phoneNumber: number,
  aadharNumber: number,
  panNumber: string,
  dateOfBirth: string
}




  export default function UsersTable({
    usersData,
    handleDelete,
    fetchData,
  
  }: {
    usersData: UserType[];
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
    { label: "DOB", key: "createdAt" },
    { label: "Actions", key: "actions" },
  ];

  const formatDate = (isoDate: string) => {
    return moment(isoDate).format("DD/MM/YYYY");
  };

  const handleCheckboxChange = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  

  const handleViewDetails = (userId: string) => {
    console.log("Viewing details for user:", userId);
    setViewUser(userId);
    setIsOpen(true);
  };


  const handleExport = () => {
    if (selectedUsers.length === 0) {
      alert("No users selected for export.");
      return;
    }
  
    const exportData = usersData.filter((user) =>
      selectedUsers.includes(user._id)
    );
  
    const headers = `"Email","Full Name","Phone Number","Aadhar Number","PAN Number","Date of Birth"`;
    const rows = exportData
      .map((user) => {
        const email = (user.email || "").replace(/"/g, '""');
        const fullName = (user.fullName || "").replace(/"/g, '""');
        const phoneNumber = user.phoneNumber || ""; 
        const aadharNumber = (user.aadharNumber || "");
        const panNumber = (user.panNumber || "").replace(/"/g, '""');
        const dateOfBirth = (user.dateOfBirth || "").replace(/"/g, '""');
  
        return `"${email}","${fullName}",${phoneNumber},"${aadharNumber}","${panNumber}","${dateOfBirth}"`;
      })
      .join("\n");
  
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  
    saveAs(blob, "users.csv");
  };
  

  const filteredUsers = usersData.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 ">
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
          {filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onCheckedChange={() => handleCheckboxChange(user._id)}
                  aria-label={`Select user ${user.fullName}`}
                />
              </TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatDate(user.dateOfBirth)}</TableCell>

              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleViewDetails(user._id)}>View</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-white">
          <TableRow>
            <TableCell colSpan={5}>
              {selectedUsers.length > 0 && (
                <div className="flex justify-between">
                  <span>
                    Selected Users: {selectedUsers.length} of {filteredUsers.length}
                  </span>
                  <Button onClick={handleExport}>
                    <Download />
                    Export Selected
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <ProfileModal fetchData={fetchData} isOpen={isOpen} onClose={closeModal} userId={viewUser}/>
    </div>
  );
}
