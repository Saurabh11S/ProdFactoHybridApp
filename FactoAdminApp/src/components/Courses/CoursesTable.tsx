import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseDetails } from "./CoursesDetails";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { COURSES } from "@/api/courses";
import { Badge } from "@/components/ui/badge";

// const courses = [
//   {
//     id: 1,
//     name: "React Basics",
//     category: "Web Development",
//     lectures: 20,
//     dateCreated: "2023-01-15",
//   },
//   {
//     id: 2,
//     name: "Advanced Python",
//     category: "Programming",
//     lectures: 35,
//     dateCreated: "2023-03-22",
//   },
//   {
//     id: 3,
//     name: "Data Science Fundamentals",
//     category: "Data Science",
//     lectures: 25,
//     dateCreated: "2023-02-10",
//   },
//   {
//     id: 4,
//     name: "UI/UX Design Principles",
//     category: "Design",
//     lectures: 15,
//     dateCreated: "2023-04-05",
//   },
//   {
//     id: 5,
//     name: "Machine Learning Basics",
//     category: "AI & ML",
//     lectures: 30,
//     dateCreated: "2023-05-12",
//   },
//   {
//     id: 6,
//     name: "Digital Marketing 101",
//     category: "Marketing",
//     lectures: 18,
//     dateCreated: "2023-06-08",
//   },
// ];
interface Course {
  _id: string; // Assuming MongoDB-style IDs
  title: string;
  category: string;
  totalLectures: number;
  createdAt: string;
  price: number;
  status: string; // ISO date string
}



export default function CourseTable() {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Type inferred
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const navigate = useNavigate();
  const fetchCourses = async () => {
    try {
      const data = await COURSES.GetCourses();
      console.log(data);
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    Object.values(course).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCheckboxChange = (courseName: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((name) => name !== courseName)
        : [...prev, courseName]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map((course) => course.title));
    }
  };

  const handleView = (course: any) => {
    setCurrentCourse(course);
    setIsViewOpen(true);
  };

  const handleEdit = (courseId: string) => {
    navigate(`/courses/${courseId}`); // Redirect to CourseEdit page with course ID
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
    }
  };

  const closeViewModal = () => setIsViewOpen(false);

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableCaption>A list of your available courses.</TableCaption>
        <TableHeader className=" bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  filteredCourses.length > 0 &&
                  selectedCourses.length === filteredCourses.length
                }
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-[50px]">Sr.No</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Total Lectures</TableHead>
            <TableHead>Price</TableHead>

            <TableHead>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>View</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.map((course, index) => (
            <TableRow key={course.title}>
              <TableCell>
                <Checkbox
                  checked={selectedCourses.includes(course.title)}
                  onCheckedChange={() => handleCheckboxChange(course.title)}
                  aria-label={`Select course ${course.title}`}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>{course.category}</TableCell>
              <TableCell>{course.totalLectures}</TableCell>
              <TableCell>₹{course.price.toLocaleString()}</TableCell>

              <TableCell>{new Date(course.createdAt).toDateString()}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(course.status)}>
                  {course.status.charAt(0).toUpperCase() +
                    course.status.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleView(course)}>View Details</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(course._id)}>
                  Edit Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-white">
          <TableRow>
            <TableCell colSpan={6}>Total Courses</TableCell>
            <TableCell>{filteredCourses.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {currentCourse && (
        <>
          <CourseDetails
            courseId={currentCourse._id}
            isOpen={isViewOpen}
            onClose={closeViewModal}
          />
        </>
      )}
    </div>
  );
}
