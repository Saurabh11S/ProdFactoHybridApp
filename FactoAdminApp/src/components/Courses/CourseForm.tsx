"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GoStack } from "react-icons/go";
import { RiTodoLine } from "react-icons/ri";
import { MdSlowMotionVideo } from "react-icons/md";
import CourseBasic from "./CourseBasic";
import AdvanceInformation from "./CourseAdvance";
import PublishCourse from "./PublishCourses";
import { toast } from "react-toastify";
import { COURSES } from "@/api/courses";
import { useNavigate, useParams } from "react-router-dom";

interface FormData {
  basic: {
    title: string;
    description: string;
    category: string;
    totalLectures: number;
    language: string;
    price: number;
    subtitleLanguage: string;
    duration: {
      value: number;
      unit: string;
    };
  };
  advance: {
    // Add advance form fields here
  };
  publish: {
    // Add publish form fields here
  };
}

export default function CourseForm() {
  const { courseId } = useParams<{ courseId: string }>();
  const [tab, setTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    basic: {
      title: "",
      description: "",
      category: "",
      totalLectures: 0,
      language: "",
      price: 0,
      subtitleLanguage: "",
      duration: {
        value: 0,
        unit: "",
      },
    },
    advance: {},
    publish: {},
  });
  const fetchCourse = async (courseId: string) => {
    try {
      const response = await COURSES.GetCoursesById(courseId);
      if (response.success) {
        const { data } = response;
        console.log(data);
        setFormData({
          basic: {
            title: data.title,
            description: data.description,
            category: data.category,
            totalLectures: data.totalLectures,
            language: data.language,
            price: data.price,
            subtitleLanguage: data.subtitleLanguage,
            duration: {
              value: data.duration.value,
              unit: data.duration.unit,
            },
          },
          advance: {},
          publish: {},
        });
      }
      // console.log(data);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    } else {
      setIsLoading(false);
    }
  }, [courseId]);
  const navigate = useNavigate();
  const handleBasicSave = async (basicData: FormData["basic"]) => {
    try {
      setFormData((prevData) => ({
        ...prevData,
        basic: basicData,
      }));
      console.log("hi");
      try {
        let data;
        if (!courseId) {
          data = await COURSES.PostCourse(basicData);
        } else {
          data = await COURSES.UpdateCourse(basicData, courseId ?? "");
        }

        if (data.success) {
          setFormData((prevData) => ({
            ...prevData,
            basic: { ...basicData },
          }));
          toast.success("Basic Details Saved");
          console.log(data);
          navigate(`/courses/${data.data.course._id}`);
          setTab("advance");
          console.log("Basic information saved:", data);
        } else {
          toast.error(data.status.message);
        }
      } catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      }
    } catch (error) {
      console.error("Error saving basic information:", error);
    }
  };

  const handleAdvanceSave = (advanceData: FormData["advance"]) => {
    try {
      setFormData((prevData) => ({
        ...prevData,
        advance: advanceData,
      }));
      console.log("Advance information saved:", advanceData);
      setTab("publish");
    } catch (error) {
      console.error("Error saving advance information:", error);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(courseId);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex flex-col md:flex-row md:justify-between border-b border-gray-200 mb-4">
          <TabsTrigger
            value="basic"
            className="flex items-center px-4 py-2 text-sm text-center hover:bg-gray-100 rounded-md md:mb-0"
          >
            <GoStack className="mr-2" /> Basic Information
          </TabsTrigger>
          <TabsTrigger
            value="advance"
            className="flex items-center px-4 py-2 text-sm text-center hover:bg-gray-100 rounded-md md:mb-0"
          >
            <RiTodoLine className="mr-2" /> Advance Information
          </TabsTrigger>
          <TabsTrigger
            value="publish"
            className="flex items-center px-4 py-2 text-sm text-center hover:bg-gray-100 rounded-md md:mb-0"
          >
            <MdSlowMotionVideo className="mr-2" /> Publish Course
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <CourseBasic initialData={formData.basic} onSave={handleBasicSave} />
        </TabsContent>

        <TabsContent value="advance">
          <AdvanceInformation
            onSave={handleAdvanceSave}
            setTab={setTab}
          />
        </TabsContent>

        <TabsContent value="publish">
          <PublishCourse setTab={setTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
