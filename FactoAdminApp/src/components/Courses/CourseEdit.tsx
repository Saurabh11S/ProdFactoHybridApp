import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CourseForm from "./CourseForm";
import HeaderBar from "../common/HeaderBar";

const courses = [
  { id: 1, name: "React Basics", category: "Web Development", lectures: 20 },
  { id: 2, name: "Advanced Python", category: "Programming", lectures: 35 },
  { id: 3, name: "Data Science Fundamentals", category: "Data Science", lectures: 25 },
];

const CourseEdit = () => {
  const { courseId } = useParams(); // Get the course ID from the URL
  // const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const selectedCourse = courses.find(
      (course) => course.id === parseInt(courseId!)
    );
    setCourse(selectedCourse);
  }, [courseId]);

  if (!course) return <div>Loading...</div>;

  // const handleSave = () => {
  //   console.log("Course details saved");
  //   navigate("/courses"); 
  // };

  return (
    <div className='w-11/12 m-auto'>
      <HeaderBar pageTitle={`Edit Course : ${course.name}`}/>
      <CourseForm/>
    </div>
  );
};

export default CourseEdit;
