import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { COURSES } from "@/api/courses";
import { toast } from "react-toastify";

interface Lecture {
  _id: string;
  title: string;
  lectureNumber: number;
  duration: {
    value: number;
    unit: string;
  };
  language: string;
  isFree: boolean;
  videoUrl: string;
  thumbnail: string;
}

interface CourseDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export function CourseDetails({
  isOpen,
  onClose,
  courseId,
}: CourseDetailsProps) {
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const data = await COURSES.GetCoursesById(courseId);
        if (data.success) {
          setCourse(data.data);
        } else {
          toast.error("Failed to fetch course details");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    };
    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    if (course) {
      setLectures(course.lectures);
      if (course.lectures.length > 0) {
        setCurrentLecture(course.lectures[0]);
      }
    }
  }, [course]);

  if (!course) {
    return null;
  }

  const handleLectureClick = (lecture: Lecture) => {
    setCurrentLecture(lecture);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{course.title}</DialogTitle>
          <p className="text-gray-600 mt-2">{course.description}</p>
          <p className="text-red-500 font-medium mt-4">Price: {course.price}</p>
        </DialogHeader>

        <div className="mt-6 flex gap-6">
          <div className="w-2/3">
            {currentLecture && (
              <div className="mb-4">
                <video
                  className="w-full aspect-video"
                  controls
                  poster={currentLecture.thumbnail}
                >
                  <source src={currentLecture.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <h3 className="text-xl font-semibold mt-2">{currentLecture.title}</h3>
                <p className="text-gray-600">Lecture {currentLecture.lectureNumber}</p>
              </div>
            )}
          </div>

          <ScrollArea className="w-1/3 h-[60vh]">
            {lectures.map((lecture) => (
              <Card 
                key={lecture._id} 
                className={`mb-4 cursor-pointer transition-colors ${
                  currentLecture?._id === lecture._id ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleLectureClick(lecture)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    {`Lecture ${lecture.lectureNumber}: ${lecture.title}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>Duration:</strong> {lecture.duration.value} {lecture.duration.unit}
                    </li>
                    <li>
                      <strong>Language:</strong> {lecture.language ?? "N/A"}
                    </li>
                    <li>
                      <strong className={lecture.isFree ? "text-green-500" : "text-red-500"}>
                        {lecture.isFree ? "Free" : "Paid"}
                      </strong>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>

        <div className="my-8">
          <h3 className="font-bold text-lg">Course Description</h3>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

