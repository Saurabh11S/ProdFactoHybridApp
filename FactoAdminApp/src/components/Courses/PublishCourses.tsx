import  { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { FaClock, FaSignal, FaBook, FaLanguage, FaClosedCaptioning } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { COURSES } from "@/api/courses";

interface CourseData {
  _id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  price: number;
  status: string;
  totalLectures: number;
  lectures: {
    _id: string;
    lectureNumber: number;
    title: string;
    subtitle: string;
    courseLevel: string;
    duration: { value: number; unit: string };
    language: string;
    subtitleLanguage: string;
    thumbnail: string;
    videoUrl: string;
  }[];
}

const PublishCourse = ({ setTab }:{ setTab: (data: string) => void }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  const fetchCourse = async () => {
    try {
      if (!courseId) {
        toast.warning("Course ID is missing");
        setTab("basic");
        return;
      }

      const response = await COURSES.GetCoursesById(courseId);
      setCourseData(response.data);
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong while fetching course details");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handlePublish = async() => {
    // Implement publish logic
    try{
      const response = await COURSES.PublishCourse(courseId??"")
      if(response.success){
        toast.success("Course published successfully");
      }
    }catch(error){
      toast.error("Something Went Wrong");
    }
  };

  

  if (isLoading) return <p>Loading...</p>;

  if (!courseData) return <p>No course data found</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{courseData.title}</h1>
        <Button onClick={handlePublish}>Publish Course</Button>
      </div>

      <p className="text-lg font-semibold text-red-500">
        Price: ₹{courseData.price.toLocaleString()}
      </p>

      {courseData.lectures.map((lecture, index) => (
        <div key={lecture._id}>
          <h2 className="text-lg font-semibold mb-2">
            {index === 0 ? "Demo Lecture" : `Lecture ${lecture.lectureNumber}`}
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="aspect-video bg-gray-200 w-full md:w-2/3 flex items-center justify-center">
              {lecture.thumbnail ? (
                <img 
                  src={lecture.thumbnail} 
                  alt={`Lecture ${lecture.lectureNumber} thumbnail`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-gray-500">Video Placeholder</p>
              )}
            </div>

            <Card className="w-full md:w-1/3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaClock className="text-gray-500" />
                  Lecture No. {lecture.lectureNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaSignal className="text-gray-500" />
                  <p>
                    <strong>Course Level:</strong> {lecture.courseLevel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FaBook className="text-gray-500" />
                  <p>
                    <strong>Course Category:</strong> {courseData.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FaLanguage className="text-gray-500" />
                  <p>
                    <strong>Language:</strong> {lecture.language}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FaClosedCaptioning className="text-gray-500" />
                  <p>
                    <strong>Subtitle Language:</strong> {lecture.subtitleLanguage}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-500" />
                  <p>
                    <strong>Duration:</strong> {lecture.duration.value} {lecture.duration.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {index !== courseData.lectures.length - 1 && <Separator className="my-4" />}
        </div>
      ))}

      {/* Description Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-gray-600 mt-2">{courseData.description}</p>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={ () => {
    setTab("advance");
  }}>
          Back
        </Button>
        <Button onClick={handlePublish}>Publish Course</Button>
      </div>
    </div>
  );
};

export default PublishCourse;