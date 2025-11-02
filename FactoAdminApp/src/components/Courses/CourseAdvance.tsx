import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "react-toastify";
import { COURSES } from "@/api/courses";
import { useParams } from "react-router-dom";

interface Lecture {
  id: number;
  title: string;
  isOpen: boolean;
  subtitle: string;
  language: string;
  subtitleLanguage: string;
  duration: {
    value: string;
    unit: string;
  };
  courseLevel: string;
  isFree: boolean;
  thumbnail?: File;
  video?: File;
  thumbnailUrl?: string;
  videoUrl?: string;
  _id?: string;
}

interface ServerLecture {
  title: string;
  subtitle: string;
  lectureNumber: number;
  language: string;
  subtitleLanguage: string;
  duration: {
    value: number;
    unit: string;
  };
  thumbnail: string;
  videoUrl: string;
  courseLevel: string;
  isFree: boolean;
  _id: string;
}

interface AdvanceInformationProps {
  
  onSave: (data: any) => void;
  setTab: (data: string) => void;
}

export default function AdvanceInformation({
  setTab,
  onSave,
}: AdvanceInformationProps) {
  const { courseId } = useParams<{ courseId: string }>();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentLectureId, setCurrentLectureId] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  console.log(currentLectureId)
  useEffect(() => {
    // if (!noOfLecture && !courseId) {
    //   toast.warning("Fill the Basic Form First");
    //   setTab("basic");
    //   return;
    // }
    
    // const initialLectures = Array.from({ length: noOfLecture }, (_, index) => ({
    //   id: index + 1,
    //   title: `Lecture ${index + 1}`,
    //   isOpen: index === 0,
    //   subtitle: "",
    //   language: "english",
    //   subtitleLanguage: "",
    //   duration: {
    //     value: "",
    //     unit: "minutes",
    //   },
    //   courseLevel: "beginner",
    //   isFree: false,
    // }));
    // setLectures(initialLectures);

    // Fetch existing lectures if courseId is available
    if (courseId) {
      fetchExistingLectures();
    }else{
      setIsLoading(false);
      toast.warning("Fill the Basic Form First");
      setTab("basic");
      return;
    }
     
    
  }, [courseId]);

  const fetchExistingLectures = async () => {
    try {
      const course = await COURSES.GetCoursesById(courseId??"");
      console.log(course)
      if(course.success){

        const response = await COURSES.GetLectures(courseId??"");
        if (response.success) {
          const existingLectures = response.data.lectures.map((lecture: ServerLecture) => ({
            id: lecture.lectureNumber,
            title: lecture.title,
            isOpen: false,
            subtitle: lecture.subtitle,
            language: lecture.language,
            subtitleLanguage: lecture.subtitleLanguage,
            duration: lecture.duration,
            courseLevel: lecture.courseLevel,
            isFree: lecture.isFree,
            thumbnailUrl: lecture.thumbnail,
            videoUrl: lecture.videoUrl,
            _id: lecture._id,
          }));
          // console.log(existingLectures.length < course.data.totalLectures)
          if (existingLectures.length < course.data.totalLectures) {
            const additionalLectures = Array.from(
              { length: course.data.totalLectures - existingLectures.length  },
              (_, index) => ({
                id: existingLectures.length + index + 1,
                title: `Lecture ${existingLectures.length + index + 1}`,
                isOpen: false,
                subtitle: "",
                language: "english",
                subtitleLanguage: "",
                duration: {
                  value: "",
                  unit: "minutes",
                },
                courseLevel: "beginner",
                isFree: false,
                thumbnailUrl: "",
                videoUrl: "",
                _id: null, // Placeholder for lectures not saved to the server yet
              })
            );
  
            console.log(additionalLectures)
    
            // Combine existing lectures with additional lectures
            setLectures([...existingLectures, ...additionalLectures]);
  
          } else {
            setLectures(existingLectures);
          }
          setCurrentLectureId(existingLectures.length+1)
          // setLectures(existingLectures);
        }
      }
    } catch (error) {
      console.error("Error fetching existing lectures:", error);
      toast.error("Failed to fetch existing lectures");
    }finally{
      setIsLoading(false);
    }
  };

  
  if (isLoading) return <p>Loading...</p>;

  const toggleLecture = (id: number) => {
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === id ? { ...lecture, isOpen: !lecture.isOpen } : lecture
      )
    );
  };

  const updateLecture = (id: number, data: Partial<Lecture>) => {
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === id ? { ...lecture, ...data } : lecture
      )
    );
  };

  const handleFileChange = (id: number, type: 'video' | 'thumbnail', file: File) => {
    updateLecture(id, { [type]: file });
  };

  const handleLectureSubmit = async (
    id: number,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      const lecture = lectures.find(l => l.id === id);
      if (!lecture) throw new Error("Lecture not found");

      const formData = new FormData();
      if (lecture.video) formData.append('video', lecture.video);
      if (lecture.thumbnail) formData.append('thumbnail', lecture.thumbnail);
      formData.append('title', lecture.title);
      formData.append('subtitle', lecture.subtitle);
      formData.append('lectureNumber', String(lecture.id));
      formData.append('language', lecture.language);
      formData.append('subtitleLanguage', lecture.subtitleLanguage);
      formData.append('duration', JSON.stringify(lecture.duration));
      formData.append('courseLevel', lecture.courseLevel);
      formData.append('isFree', String(lecture.isFree));

      let response;
      if (lecture._id) {
        // Update existing lecture
        response = await COURSES.UpdateLecture(formData, courseId??"", lecture._id);
      } else {
        // Add new lecture
        response = await COURSES.PostLecture(formData, courseId??"");
      }

      if (response.success) {
        const serverLecture: ServerLecture = response.data.lecture;
        
        // Update the lecture with server data
        updateLecture(id, {
          _id: serverLecture._id,
          thumbnailUrl: serverLecture.thumbnail,
          videoUrl: serverLecture.videoUrl,
        });

        toast.success(lecture._id ? "Lecture updated successfully" : "Lecture added successfully");
        toggleLecture(id);

        // Move to next lecture if available
       
          setCurrentLectureId(id + 1);
          toggleLecture(id + 1);
      } else {
        toast.error(response.status.message || "Failed to save lecture");
      }
    } catch (error) {
      console.error("Error saving lecture:", error);
      toast.error("Failed to save lecture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    id: number,
    field: string,
    value: string | { value: string; unit: string } | boolean
  ) => {
    updateLecture(id, { [field]: value });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-6">Advanced Information</h2>

      {lectures.map((lecture) => (
        <Collapsible key={lecture.id} open={lecture.isOpen} className="mb-6">
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md cursor-pointer">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={lecture._id !== undefined}
                  readOnly
                />
                <span className="text-base font-medium">{lecture.title}</span>
              </div>
              <Button size="sm" onClick={() => toggleLecture(lecture.id)}>
                {lecture.isOpen ? "Close" : "Edit Details"}
              </Button>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="p-4 bg-gray-50 rounded-md">
            <form
              className="space-y-6 text-gray-700"
              onSubmit={(e) => handleLectureSubmit(lecture.id, e)}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`lectureTitle-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Lecture Title
                  </label>
                  <Input
                    id={`lectureTitle-${lecture.id}`}
                    name="lectureTitle"
                    placeholder="Enter lecture title"
                    maxLength={80}
                    value={lecture.title}
                    onChange={(e) =>
                      handleInputChange(lecture.id, "title", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor={`lectureSubtitle-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Lecture Subtitle
                  </label>
                  <Textarea
                    id={`lectureSubtitle-${lecture.id}`}
                    name="lectureSubtitle"
                    placeholder="Enter lecture subtitle"
                    maxLength={120}
                    rows={2}
                    value={lecture.subtitle}
                    onChange={(e) =>
                      handleInputChange(lecture.id, "subtitle", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor={`lectureLanguage-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Lecture Language
                  </label>
                  <Select
                    name="lectureLanguage"
                    value={lecture.language}
                    onValueChange={(value) =>
                      handleInputChange(lecture.id, "language", value)
                    }
                  >
                    <SelectTrigger id={`lectureLanguage-${lecture.id}`}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor={`subtitleLanguage-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Subtitle Language (Optional)
                  </label>
                  <Select
                    name="subtitleLanguage"
                    value={lecture.subtitleLanguage}
                    onValueChange={(value) =>
                      handleInputChange(lecture.id, "subtitleLanguage", value)
                    }
                  >
                    <SelectTrigger id={`subtitleLanguage-${lecture.id}`}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor={`duration-${lecture.id}`}
                    className="text-sm font-medium mb-1"
                  >
                    Duration
                  </label>
                  <Input
                    id={`duration-${lecture.id}`}
                    name="duration"
                    type="number"
                    placeholder="Course duration"
                    value={lecture.duration.value}
                    onChange={(e) =>
                      handleInputChange(lecture.id, "duration", {
                        ...lecture.duration,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`durationType-${lecture.id}`}
                    className="text-sm font-medium mb-1"
                  >
                    Duration Type
                  </label>
                  <Select
                    name="durationType"
                    value={lecture.duration.unit}
                    onValueChange={(value) =>
                      handleInputChange(lecture.id, "duration", {
                        ...lecture.duration,
                        unit: value,
                      })
                    }
                  >
                    <SelectTrigger id={`durationType-${lecture.id}`}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`courseLevel-${lecture.id}`}
                  className="text-sm font-medium mb-1 block"
                >
                  Course Level
                </label>
                <Select
                  name="courseLevel"
                  value={lecture.courseLevel}
                  onValueChange={(value) =>
                    handleInputChange(lecture.id, "courseLevel", value)
                  }
                >
                  <SelectTrigger id={`courseLevel-${lecture.id}`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`isFree-${lecture.id}`}
                  checked={lecture.isFree}
                  onChange={(e) =>
                    handleInputChange(lecture.id, "isFree", e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`isFree-${lecture.id}`}
                  className="text-sm font-medium"
                >
                  Free Lecture
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`thumbnail-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Thumbnail Image
                  </label>
                  <Input
                    id={`thumbnail-${lecture.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(lecture.id, 'thumbnail', file);
                    }}
                    className="rounded-md border p-2"
                  />
                  {lecture.thumbnailUrl && (
                    <img
                      src={lecture.thumbnailUrl}
                      alt="Thumbnail"
                      className="mt-2 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`video-${lecture.id}`}
                    className="text-sm font-medium mb-1 block"
                  >
                    Upload Lecture Video
                  </label>
                  <Input
                    id={`video-${lecture.id}`}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(lecture.id, 'video', file);
                    }}
                    className="rounded-md border p-2"
                  />
                  {lecture.videoUrl && (
                    <video
                      src={lecture.videoUrl}
                      controls
                      className="mt-2 w-full aspect-video rounded"
                    />
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : lecture._id ? "Update Lecture" : "Save Lecture"}
              </Button>
            </form>
          </CollapsibleContent>
        </Collapsible>
      ))}

      <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
        <Button variant="outline" size="lg" className="w-full md:w-auto" onClick={()=>{setTab("basic")}}>
          Back
        </Button>
        <Button
          size="lg"
          className="w-full md:w-auto"
          onClick={() => onSave(lectures)}
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
}
