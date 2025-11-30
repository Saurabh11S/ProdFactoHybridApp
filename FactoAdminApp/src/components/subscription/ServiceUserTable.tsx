import { useState, useEffect } from "react";
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
import { SERVICES } from "@/api/services";
import { showError } from "@/utils/toast";

interface ServiceUserTableProps {
  serviceId: string;
  subServices: Array<{ _id: string; title: string }>;
}

export default function ServiceUserTable({ serviceId, subServices }: ServiceUserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeSubService, setActiveSubService] = useState("All Users");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openModal = (user: any, subServiceId: string) => {
    setSelectedUser(user);
    setSelectedSubServiceId(subServiceId);
    setIsDialogOpen(true);
  };
  const closeModal = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
    setSelectedSubServiceId("");
  };

  // Fetch users for each sub-service
  useEffect(() => {
    const fetchAllServiceUsers = async () => {
      if (!serviceId) return;
      
      setLoading(true);
      try {
        const allUsers: any[] = [];
        
        // Fetch users for each sub-service
        for (const subService of subServices) {
          try {
            const response = await SERVICES.GetServiceUsers(subService._id);
            if (response.data && response.data.users) {
              const usersWithSubService = response.data.users.map((user: any) => ({
                ...user,
                subServiceId: subService._id,
                subServiceTitle: subService.title,
              }));
              allUsers.push(...usersWithSubService);
            }
          } catch (error) {
            console.error(`Error fetching users for sub-service ${subService._id}:`, error);
          }
        }
        
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching service users:", error);
        showError("Failed to fetch service users");
      } finally {
        setLoading(false);
      }
    };

    fetchAllServiceUsers();
  }, [serviceId, subServices]);


  // Filter users based on the search term and selected sub-service
  const filteredUsers = users.filter((user) => {
    // Convert all user field values to strings and check for a match
    const matchesSearch = 
      (user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.userPhone?.includes(searchTerm));

    // Check if the user matches the selected sub-service
    const matchesSubService =
      activeSubService === "All Users" ||
      user.subServiceTitle === activeSubService;

    return matchesSearch && matchesSubService;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.userId));
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

  // Get unique sub-service titles for filter
  const uniqueSubServices = Array.from(
    new Set(users.map(u => u.subServiceTitle).filter(Boolean))
  );
  const subServiceFilters = ["All Users", ...uniqueSubServices];

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
      <div className="flex space-x-2 flex-wrap">
        {subServiceFilters.map((service) => (
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No users found for this service
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user, index) => (
              <TableRow key={user.userId || index}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.userId)}
                    onCheckedChange={(checked: boolean) =>
                      handleSelectUser(user.userId, checked)
                    }
                    aria-label={`Select user ${user.userId}`}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{user.userId?.slice(-6) || 'N/A'}</TableCell>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.userEmail}</TableCell>
                <TableCell>{user.userPhone}</TableCell>
                <TableCell>{user.subServiceTitle}</TableCell>
                <TableCell>
                  <Button onClick={() => openModal(user, user.subServiceId)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right font-semibold">
              Total Users: {filteredUsers.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {selectedUser && (
        <ServiceUserDetails
          isOpen={isDialogOpen}
          onClose={closeModal}
          userId={selectedUser.userId}
          serviceId={selectedSubServiceId}
          serviceName={selectedUser.subServiceTitle}
          purchaseDate={selectedUser.purchaseDate}
        />
      )}
    </div>
  );
}
