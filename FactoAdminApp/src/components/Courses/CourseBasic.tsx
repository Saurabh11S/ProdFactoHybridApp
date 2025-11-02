import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CourseBasicProps {
  initialData?: {
    id?:string;
    title?: string;
    description?: string;
    category?: string;
    totalLectures?: number;
    language?: string;
    price?: number;
    subtitleLanguage?: string;
    duration?: {
      value?: number;
      unit?: string;
    };
   
  };
  onSave: (data: CourseBasicFormData) => Promise<void>;
}
interface CourseBasicFormData {
  title: string;
  description: string;
  category: string;
  totalLectures: number;
  language: string;
  subtitleLanguage: string;
  price: number;
  duration: {
    value: number;
    unit: string;
  };
}

function CourseBasic({initialData,onSave}: CourseBasicProps) {
  const [formData, setFormData] = useState<CourseBasicFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    totalLectures: initialData?.totalLectures || 0,
    language: initialData?.language || "",
    subtitleLanguage: initialData?.subtitleLanguage || "",
    price: initialData?.price || 0,
    duration: {
      value: initialData?.duration?.value || 0,
      unit: initialData?.duration?.unit || ""
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "duration") {
      setFormData(prevData => ({
        ...prevData,
        duration: {
          ...prevData.duration,
          value: Number(value)
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [id]: value
      }));
    }
  };

  const handleSelectChange = (id: string, value: string) => {
    if (id === "durationType") {
      setFormData(prevData => ({
        ...prevData,
        duration: {
          ...prevData.duration,
          unit: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [id]: value
      }));
    }
  };
  

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h2 className="text-lg font-medium mb-4">Basic Information</h2>

      <form className="space-y-4 text-gray-700" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col">
          <label htmlFor="title" className="text-sm font-medium mb-1">
            Course Title
          </label>
          <Input
            id="title"
            placeholder="Your course title"
            maxLength={80}
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="description" className="text-sm font-medium mb-1">
            Course Description
          </label>
          <Textarea
            id="description"
            placeholder="Your course description"
            maxLength={120}
            rows={2}
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="category" className="text-sm font-medium mb-1">
              Course Category
            </label>
            <Select 
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="totalLectures" className="text-sm font-medium mb-1">
              Total Number of Lectures
            </label>
            <Input
              id="totalLectures"
              type="number"
              placeholder="0"
              value={formData.totalLectures}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="price" className="text-sm font-medium mb-1">
              Price
            </label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="language" className="text-sm font-medium mb-1">
              Course Language
            </label>
            <Select 
              value={formData.language}
              onValueChange={(value) => handleSelectChange("language", value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="subtitleLanguage" className="text-sm font-medium mb-1">
              Subtitle Language (Optional)
            </label>
            <Select 
              value={formData.subtitleLanguage}
              onValueChange={(value) => handleSelectChange("subtitleLanguage", value)}
            >
              <SelectTrigger id="subtitleLanguage">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="duration" className="text-sm font-medium mb-1">
              Duration
            </label>
            <Input
              id="duration"
              placeholder="Course duration"
              value={formData.duration.value}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="durationType" className="text-sm font-medium mb-1">
              Duration Type
            </label>
            <Select 
              value={formData.duration.unit}
              onValueChange={(value) => handleSelectChange("durationType", value)}
            >
              <SelectTrigger id="durationType">
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

        <div className="flex justify-end">
          <div className="flex space-x-4">
            <Button onClick={()=>onSave(formData)}>Save & Next</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CourseBasic