import { useState } from "react";
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
import SearchBar from "../common/Searchbar";
import { DatePicker } from "../ui/datepicker";
import { ViewBlog } from "./ViewBlog";

interface BlogsType {
  _id: string;
  title: string;
  content: string;
  contentType: string;
  contentUrl: string;
  author?: string;
  tags?: string[];
  createdAt: string;
}

export default function BlogsTable({
  blogsData,
  handleDelete,
}: {
  blogsData: BlogsType[];
  handleDelete: (id: string) => void;
}) {
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<BlogsType | null>(null);

  const handleCheckboxChange = (blogId: string) => {
    setSelectedBlogs((prev) =>
      prev.includes(blogId) ? prev.filter((id) => id !== blogId) : [...prev, blogId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBlogs(blogsData.map((blog) => blog._id));
    } else {
      setSelectedBlogs([]);
    }
  };

  const handleExport = () => {
    console.log("Exporting blogs:", selectedBlogs);
  };

  const handleViewDetails = (blog: BlogsType) => {
    setViewingBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setViewingBlog(null);
    setIsModalOpen(false);
  };

  // Filter blogs based on search query
  const filteredBlogs = Array.isArray(blogsData)
    ? blogsData.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center my-2 gap-4">
        <SearchBar onChange={(value) => setSearchQuery(value)} />

        <div className="flex space-x-1">
          <DatePicker body="From" />
          <DatePicker body="To" />
        </div>
      </div>

      <Table>
        <TableCaption>A list of blogs in your system.</TableCaption>
        <TableHeader className="bg-[#f4f0f0] p-5">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedBlogs.length === filteredBlogs.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                aria-label="Select all blogs"
              />
            </TableHead>
            <TableHead>Sr_No.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Created_At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBlogs.map((blog, index) => (
            <TableRow key={blog._id}>
              <TableCell>
                <Checkbox
                  checked={selectedBlogs.includes(blog._id)}
                  onCheckedChange={() => handleCheckboxChange(blog._id)}
                  aria-label={`Select blog ${blog.title}`}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{blog.title}</TableCell>
              <TableCell>
                <span className="line-clamp-1">{blog.content}</span>
              </TableCell>
              <TableCell>{new Date(blog.createdAt).toDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleViewDetails(blog)}>View</Button>
                  <Button variant="destructive" onClick={() => handleDelete(blog._id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              {selectedBlogs.length > 0 && (
                <div className="flex justify-between">
                  <span>
                    Selected Blogs: {selectedBlogs.length} of {filteredBlogs.length}
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

      {viewingBlog && (
        <ViewBlog
          isOpen={isModalOpen}
          onClose={closeModal}
          blogDetails={{
            title: viewingBlog.title,
            content: viewingBlog.content,
            contentType: viewingBlog.contentType,
            contentUrl: viewingBlog.contentUrl,
            tags: viewingBlog.tags || [],
            author: viewingBlog.author || "Unknown",
            createdAt: viewingBlog.createdAt,
          }}
        />
      )}
    </div>
  );
}
