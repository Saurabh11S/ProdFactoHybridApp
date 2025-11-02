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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEE } from "@/api/employee";
import { REQCALL } from "@/api/reqcall";

interface ReqCallsType {
  _id: string;
  phoneNo: number;
  assignee?: any;
}

interface EmployeeType {
  _id: string;
  fullName: string;
}

export default function ReqCallTable({ callData,fetchRequest }: { callData: ReqCallsType[], fetchRequest:()=>void }) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [localCallData, setLocalCallData] = useState(callData);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await EMPLOYEE.GetEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (requestId: string, employeeId: string) => {
    try {
      setLoading(true);
      // Assuming there's an API endpoint to assign an employee
      await REQCALL.AssignEmployee(requestId,employeeId);
      fetchRequest();
      // Update local state to reflect the change
      setLocalCallData(prev =>
        prev.map(call =>
          call._id === requestId
            ? {
                ...call,
                assignedEmployee: employees.find(emp => emp._id === employeeId)?.fullName,
              }
            : call
        )
      );
    } catch (error) {
      console.error('Error assigning employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (queryId: string) => {
    setSelectedContacts(prev =>
      prev.includes(queryId)
        ? prev.filter(id => id !== queryId)
        : [...prev, queryId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(localCallData.map(phoneNo => phoneNo._id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleExport = () => {
    console.log("Exporting :", selectedContacts);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>A list of your queries.</TableCaption>
        <TableHeader className="bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px] text-black p-2">
              <Checkbox
                checked={selectedContacts.length === localCallData.length}
                onCheckedChange={checked => handleSelectAll(checked as boolean)}
                aria-label="Select all queries"
              />
            </TableHead>
            <TableHead className="text-black">Sr. No</TableHead>
            <TableHead className="text-black">Phone</TableHead>
            <TableHead className="text-black">Assigned Employee</TableHead>
            <TableHead className="text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localCallData.map((phoneNo, index) => (
            <TableRow key={phoneNo._id}>
              <TableCell>
                <Checkbox
                  checked={selectedContacts.includes(phoneNo._id)}
                  onCheckedChange={() => handleCheckboxChange(phoneNo._id)}
                  aria-label={`Select queries ${phoneNo._id}`}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{phoneNo.phoneNo}</TableCell>
              <TableCell>{phoneNo.assignee?.fullName || 'Unassigned'}</TableCell>
              <TableCell>
                <Select
                  disabled={loading}
                  onValueChange={(value) => handleAssignEmployee(phoneNo._id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Assign Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="bg-white" colSpan={5}>
              {selectedContacts.length > 0 && (
                <div className="flex justify-between">
                  <span>
                    Selected Queries: {selectedContacts.length} of{" "}
                    {localCallData.length}
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
    </div>
  );
}