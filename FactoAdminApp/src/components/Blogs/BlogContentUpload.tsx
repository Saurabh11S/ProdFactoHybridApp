"use client"

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface BlogContentUploadProps {
  onContentChange: (content: { type: string; value: string | File }) => void
  initialContent?: { type: string; value: string | File }
}

export function BlogContentUpload({ onContentChange, initialContent }: BlogContentUploadProps) {
  const [contentType, setContentType] = useState<'image' | 'video'>(initialContent?.type as 'image' | 'video' || 'image')
  const [inputType, setInputType] = useState<'link' | 'file'>('link')
  const [linkValue, setLinkValue] = useState('')
  const [fileValue, setFileValue] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (initialContent) {
      setContentType(initialContent.type as 'image' | 'video')
      if (typeof initialContent.value === 'string') {
        setInputType('link')
        setLinkValue(initialContent.value)
      } else {
        setInputType('file')
        setFileValue(initialContent.value as File)
      }
    }
  }, [initialContent])

  useEffect(() => {
    if (inputType === 'link' && linkValue) {
      setPreview(linkValue)
    } else if (inputType === 'file' && fileValue) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(fileValue)
    } else {
      setPreview(null)
    }
  }, [inputType, linkValue, fileValue])

  const handleContentTypeChange = (value: string) => {
    setContentType(value as 'image' | 'video')
    setLinkValue('')
    setFileValue(null)
    setPreview(null)
  }

  const handleInputTypeChange = (value: string) => {
    setInputType(value as 'link' | 'file')
    setLinkValue('')
    setFileValue(null)
    setPreview(null)
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkValue(e.target.value)
    onContentChange({ type: contentType, value: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFileValue(file)
    if (file) {
      onContentChange({ type: contentType, value: file })
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select onValueChange={handleContentTypeChange} value={contentType}>
            <SelectTrigger id="content-type">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-type">Input Type</Label>
          <Select onValueChange={handleInputTypeChange} value={inputType}>
            <SelectTrigger id="input-type">
              <SelectValue placeholder="Select input type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {inputType === 'link' && (
          <div className="space-y-2">
            <Label htmlFor="link-input">Content Link</Label>
            <Input
              id="link-input"
              type="url"
              placeholder={`Enter ${contentType} link`}
              value={linkValue}
              onChange={handleLinkChange}
            />
          </div>
        )}

        {inputType === 'file' && (
          <div className="space-y-2">
            <Label htmlFor="file-input">Upload {contentType}</Label>
            <Input
              id="file-input"
              type="file"
              accept={contentType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
            />
          </div>
        )}

{preview && (
  <div className="mt-4">
    <Label>Preview</Label>
    {contentType === 'image' && (
      <img src={preview} alt="Preview" className="mt-2 max-w-full h-auto rounded-lg" />
    )}
    {contentType === 'video' && (
      <>
        {preview.includes('youtube.com') || preview.includes('youtu.be') ? (
          <iframe
            src={
              preview.includes('youtube.com')
                ? preview.replace('watch?v=', 'embed/')
                : `https://www.youtube.com/embed/${preview.split('/').pop()}`
            }
            title="YouTube Video"
            className="mt-2 max-w-full h-auto rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : preview.includes('twitter.com') ? (
          <blockquote
            className="twitter-tweet"
            data-lang="en"
          >
            <a href={preview}>View Twitter Video</a>
          </blockquote>
        ) : (
          <video
            src={preview}
            controls
            className="mt-2 max-w-full h-auto rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </>
    )}
  </div>
)}

      </CardContent>
    </Card>
  )
}

