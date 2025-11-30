"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { BlogContentUpload } from './BlogContentUpload'
import { BLOGS } from "@/api/blogs"
import { showError, showSucccess } from "@/utils/toast"
import { BlogContentUpload } from '@/components/Blogs/BlogContentUpload'

interface BlogDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  fetchData?: () => void
  blogsData?: any
}

export function BlogDetails({ isOpen, onClose, fetchData, blogsData }: BlogDetailsModalProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    reference: {
      title: "",
      url: "",
    },
    author: "",
    tags: [] as string[],
  })
  const [blogContent, setBlogContent] = useState<{ type: string; value: string | File } | null>(null)

  useEffect(() => {
    if (blogsData) {
      setFormData({
        title: blogsData.title || "",
        content: blogsData.content || "",
        reference: {
          title: blogsData.reference?.title || "",
          url: blogsData.reference?.url || "",
        },
        author: blogsData.author || "",
        tags: blogsData.tags || [],
      })
      setBlogContent({
        type: blogsData.contentType || 'image',
        value: blogsData.contentUrl || '',
      })
      setIsEdit(true)
    } else {
      clearModal()
    }
  }, [blogsData])

  const clearModal = () => {
    setFormData({
      title: "",
      content: "",
      reference: {
        title: "",
        url: "",
      },
      author: "",
      tags: [],
    })
    setBlogContent(null)
    setIsEdit(false)
  }

  const handleCloseModal = () => {
    clearModal()
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof formData] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'reference' || key === 'tags') {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value as string)
        }
      })

      if (blogContent) {
        formDataToSend.append('contentType', blogContent.type)
        if (blogContent.type === 'image' && blogContent.value instanceof File) {
          formDataToSend.append('thumbnail', blogContent.value)
        } else {
          formDataToSend.append('contentUrl', blogContent.value as string)
        }
      }

      const response = isEdit
        ? await BLOGS.Update(formDataToSend)
        : await BLOGS.PostBlogs(formDataToSend)
        console.log(response)

      if (response.success) {
        handleCloseModal()
        fetchData?.()
        showSucccess(response.message || `Blog ${isEdit ? 'updated' : 'created'} successfully`)
      } else {
        showError(response.message || "An error occurred")
      }
    } catch (error) {
      console.error("Error during submit:", error)
      showError("An error occurred while saving the blog")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Blog" : "Add Blog"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="blog-title" className="text-sm font-medium">
                  Blog Title
                </label>
                <Input
                  id="blog-title"
                  name="title"
                  placeholder="Enter Blog Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <BlogContentUpload
                onContentChange={(content) => setBlogContent(content)}
                initialContent={blogContent || undefined}
              />

              <div>
                <label htmlFor="content" className="text-sm font-medium">
                  Blog Content
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your blog content here"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="text-sm font-medium">
                  Author
                </label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Author's Name"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="reference-title" className="text-sm font-medium">
                  Reference Title
                </label>
                <Input
                  id="reference-title"
                  name="reference.title"
                  placeholder="Reference's Title"
                  value={formData.reference.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="reference-url" className="text-sm font-medium">
                  Reference URL
                </label>
                <Input
                  id="reference-url"
                  name="reference.url"
                  placeholder="Reference's URL"
                  value={formData.reference.url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="blog-tags" className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  id="blog-tags"
                  name="tags"
                  placeholder="Enter tags, separated by commas"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    }))
                  }
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Blog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

