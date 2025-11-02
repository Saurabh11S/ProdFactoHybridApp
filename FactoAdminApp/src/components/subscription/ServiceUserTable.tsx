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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ServiceUserDetails } from "./ServiceUserDetails";
import { saveAs } from "file-saver";

const users = [
  {
    id: "USR001",
    name: "Alice Johnson",
    email: "alice@example.com",
    contact: "9876543210",
    subServices: ["GST1", "GST3"],
    assignedMember: "employee1",
  },
  {
    id: "USR002",
    name: "Bob Smith",
    email: "bob@example.com",
    contact: "9876543211",
    subServices: ["GST2", "GST4"],
    assignedMember: "employee2",
  },
  {
    id: "USR003",
    name: "Charlie Brown",
    email: "charlie@example.com",
    contact: "9876543212",
    subServices: ["GST1"],
    assignedMember: "employee1",
  },
  {
    id: "USR004",
    name: "Diana Prince",
    email: "diana@example.com",
    contact: "9876543213",
    subServices: ["GST5"],
    assignedMember: "employee3",
  },
  {
    id: "USR005",
    name: "Eve Taylor",
    email: "eve@example.com",
    contact: "9876543214",
    subServices: ["GST3", "GST4"],
    assignedMember: "employee1",
  },
];

const userProfile = {
  name: "John Doe",
  email: "johndoe@example.com",
  adharCard: "1234-5678-9012",
  panCard: "ABCDE1234F",
  mobile: "+91-9876543210",
  dob: "1990-01-01",
};

const serviceDetails = {
  serviceName: "GST Certification Course",
  purchaseDate: "2023-11-01",
  documents: ["AdharCard.pdf", "PanCard.pdf", "PaymentReceipt.pdf"],
};

const subServices = ["All Users", "GST1", "GST2", "GST3", "GST4", "GST5"];

// const employees = [{
//   name:"employee1"
// },
// {
//   name:"employee2"
// },
// {
//   name:"employee3"
// }]

export default function ServiceUserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeSubService, setActiveSubService] = useState("All Users");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openModal = () => setIsDialogOpen(true);
  const closeModal = () => setIsDialogOpen(false);

  // Filter users based on the search term and selected sub-service
  const filteredUsers = users.filter((user) => {
    // Convert all user field values to strings and check for a match
    const matchesSearch = Object.values(user)
      .map((value) => String(value).toLowerCase())
      .some((value) => value.includes(searchTerm.toLowerCase()));

    // Check if the user matches the selected sub-service
    const matchesSubService =
      activeSubService === "All Users" ||
      user.subServices.includes(activeSubService);

    return matchesSearch && matchesSubService;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleExport = () => {
    const selectedData = users.filter((user) =>
      selectedUsers.includes(user.id)
    );
    console.log("Exporting users:", selectedData);
    const headers = `"Email","Full Name","Phone Number","ID","Assigned Number"`;
    const rows = selectedData
      .map((user) => {
        const email = (user.email || "").replace(/"/g, '""');
        const fullName = (user.name || "").replace(/"/g, '""');
        const phoneNumber = (user.contact.toString() || "").replace(/"/g, '""');
        const id = user?.id || "";
        const assignedMember = user.assignedMember || "";

        return `"${email}","${fullName}","${phoneNumber}","${id}","${assignedMember}"`;
      })
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    saveAs(blob, "users.csv");
  };

  return (
    <div className="space-y-4">
      {/* Sub-services Filter */}
      <div className="flex space-x-2">
        {subServices.map((service) => (
          <div
            key={service}
            onClick={() => setActiveSubService(service)}
            className={`cursor-pointer rounded-lg px-3 py-2 ${
              activeSubService === service
                ? "bg-[#253483] text-white"
                : "bg-gray-200"
            }`}
          >
            {service}
          </div>
        ))}
      </div>

      {/* Search and Export */}
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleExport} disabled={selectedUsers.length === 0}>
          Export Selected Users
        </Button>
      </div>

      {/* User Details Table */}
      <Table className="mt-4">
        <TableCaption>
          A list of users associated with this service.
        </TableCaption>
        <TableHeader className=" bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  filteredUsers.length > 0 &&
                  selectedUsers.length === filteredUsers.length
                }
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Sr No</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Assigned Member</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectUser(user.id, checked)
                  }
                  aria-label={`Select user ${user.id}`}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.contact}</TableCell>
              <TableCell>{user.assignedMember}</TableCell>
              <TableCell>
                <Button onClick={() => openModal()}>View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right font-semibold">
              Total Users: {filteredUsers.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <ServiceUserDetails
        isOpen={isDialogOpen}
        onClose={closeModal}
        userProfile={userProfile}
        serviceDetails={serviceDetails}
      />
    </div>
  );
}
