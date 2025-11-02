import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SERVICES } from "@/api/services";
import { showError } from "@/utils/toast";
import { Image, X } from "lucide-react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

export function ServiceModal({ isOpen, onClose, onServiceAdded }: ServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState<File | null>(null);
  const [currentFeature, setCurrentFeature] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    features: [] as string[]
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIcon(e.target.files[0]);
    }
  };

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData object
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('category', formData.category);
      
      // Append features array as JSON string
      submitFormData.append('features', JSON.stringify(formData.features));
      
      // Append icon if selected
      if (icon) {
        submitFormData.append('icon', icon);
      }
      console.log(icon)
      const response = await SERVICES.PostService(submitFormData);

      if (response.success) {
        onClose();
        onServiceAdded();
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          features: []
        });
        setIcon(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showError(response.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error during submit:", error);
      showError("An error occurred while creating the service");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md font-outfit max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-inter">
              Add New Service
            </DialogTitle>
          </div>
        </DialogHeader>
        <form
          className="space-y-4 border border-gray-300 p-5 rounded-md"
          onSubmit={handleSubmit}
        >
          {/* Service Title */}
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Service Title
            </label>
            <Input
              id="title"
              name="title" 
              value={formData.title}
              onChange={handleChange}
              placeholder="Service Title"
              className="rounded-md"
              required
            />
          </div>

          {/* Service Description */}
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description" 
              value={formData.description}
              onChange={handleChange}
              placeholder="Service Description"
              className="rounded-md resize-none"
              rows={2}
              required
            />
          </div>

          {/* Service Category */}
          <div className="flex flex-col p-2 space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Service Category
            </label>
            <Input
              id="category"
              name="category" 
              value={formData.category}
              onChange={handleChange}
              placeholder="Service Category"
              className="rounded-md"
              required
            />
          </div>

          {/* Features Input */}
          <div className="flex flex-col p-2 space-y-2">
            <label className="text-sm font-medium">
              Service Features
            </label>
            <div className="flex gap-2">
              <Input
                value={currentFeature}
                onChange={(e) => setCurrentFeature(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a feature"
                className="rounded-md"
              />
              <Button
                type="button"
                onClick={handleAddFeature}
                className="whitespace-nowrap"
              >
                Add Feature
              </Button>
            </div>
            
            {/* Features List */}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Icon Upload */}
          <div className="flex flex-col p-2 space-y-2">
            <label className="text-sm font-medium">
              Service Icon
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleIconChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="flex items-center justify-center gap-2"
            >
              <Image size={16} />
              {icon ? icon.name : "Upload Icon"}
            </Button>
          </div>

          {/* Loading or Submit Button */}
          <div className="flex justify-between m-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full mx-1 text-black border"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-1 text-white hover:bg-[#3449b4]"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}