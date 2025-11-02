import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogDetails: {
    title: string;
    contentUrl: string;
    contentType: string;
    content: string;
    tags: string[];
    author: string;
    createdAt: string;
  };
}

export function ViewBlog({ isOpen, onClose, blogDetails }: ViewBlogModalProps) {
  const renderMediaContent = () => {
    if (blogDetails.contentType === "image") {
      return (
        <img
          src={blogDetails.contentUrl || "https://via.placeholder.com/600x300"}
          alt="Blog"
          className="w-full h-auto object-cover rounded-md"
        />
      );
    } else if (blogDetails.contentType === "video") {
      if (blogDetails.contentUrl.includes("youtube.com") || blogDetails.contentUrl.includes("youtu.be")) {
        const embedUrl = blogDetails.contentUrl.includes("youtube.com")
          ? blogDetails.contentUrl.replace("watch?v=", "embed/")
          : `https://www.youtube.com/embed/${blogDetails.contentUrl.split("/").pop()?.split("?")[0]}`;
        return (
          <iframe
            src={embedUrl}
            title="YouTube Video"
            className="w-full h-[300px] rounded-md"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      }
      return (
        <video
          src={blogDetails.contentUrl}
          controls
          className="w-full h-auto rounded-md"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    return <p>No media content available.</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md font-outfit max-w-3xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-inter line-clamp-1">
              {blogDetails.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              <div className="relative w-full">
                {renderMediaContent()}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Content:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{blogDetails.content}</p>
                <p className="text-sm text-gray-500">Tags: {blogDetails.tags.join(", ")}</p>
                <p className="text-sm text-gray-500">Author: {blogDetails.author}</p>
                <p className="text-sm text-gray-500">
                  Created At: {new Date(blogDetails.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end mt-4 flex-shrink-0">
          <Button onClick={onClose} className="text-white bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
