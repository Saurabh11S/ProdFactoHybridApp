import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
import { configDotenv } from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

configDotenv({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️ Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET'
});

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "services", // folder name in cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "svg","svg+xml"], // allowed formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // optional transformations
  } as any, // Bypass TypeScript checks
});


// Create multer upload middleware
export const uploadIcon = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."));
    }
  },
}).single("icon");

export const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    if (!imageUrl || imageUrl === "http") return;

    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

export const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        createCustomError("File size is too large.", StatusCode.BAD_REQ)
      );
    }
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  if (error) {
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  next();
};

const userDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // Get user ID from authenticated request
    const userId = req.user?._id || 'unknown_user';
    
    console.log('📁 File upload params:', {
      originalName: file.originalname,
      userId: userId,
      mimetype: file.mimetype
    });
    
    // Clean the original filename (remove special characters but keep extension)
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    const extension = originalName.split('.').pop();
    
    // Check if filename already contains user ID to prevent duplication
    let publicId;
    const timestamp = Date.now();
    
    if (nameWithoutExt.startsWith(userId)) {
      console.log('⚠️ Filename already contains user ID, using as-is');
      publicId = `${nameWithoutExt}_${timestamp}`;
    } else {
      // Generate filename with user ID and timestamp for uniqueness
      publicId = `${userId}_${nameWithoutExt}_${timestamp}`;
    }
    
    console.log('📁 Generated public ID:', publicId);
    
    // Always use 'raw' resource type to preserve exact file format
    // This ensures no conversion or processing by Cloudinary
    return {
      folder: "user_documents",
      resource_type: "raw", // Always raw to preserve exact format
      public_id: publicId,
      format: extension, // Explicitly set the format to preserve original
      // Remove any transformations to keep file exactly as uploaded
      transformation: [],
    };
  },
} as any);

// Create multer upload middleware for user documents
export const uploadUserDocument = multer({
  storage: userDocumentStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB limit for user documents
  },
  fileFilter: (req, file, cb) => {
    // Define specific allowed formats only
    const allowedMimeTypes = [
      "image/jpeg",           // JPG files
      "image/png",            // PNG files
      "application/pdf",      // PDF files
      "application/msword",   // DOC files
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
    ];
    
    // Also check file extension as additional validation
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    console.log('📁 File upload validation:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extension: fileExtension,
      size: file.size
    });
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      console.log('✅ File validation passed');
      cb(null, true);
    } else {
      console.log('❌ File validation failed');
      cb(
        new Error(`Invalid file type. Allowed formats: JPG, PNG, PDF, DOC, DOCX. Received: ${file.mimetype}`)
      );
    }
  },
}).single("document");

export const deleteCloudinaryUserDocument = async (documentUrl: string) => {
  try {
    if (!documentUrl || documentUrl === "http") {
      console.log('❌ Invalid document URL provided');
      return;
    }

    console.log('🗑️ Attempting to delete document:', documentUrl);

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/[cloud]/raw/upload/v[timestamp]/user_documents/[publicId]
    const urlParts = documentUrl.split('/');
    const publicIdWithFolder = urlParts[urlParts.length - 1]; // Get the last part
    
    // Remove any file extension if present
    const publicId = publicIdWithFolder.split('.')[0];
    
    console.log('🔍 URL parts:', urlParts);
    console.log('🔍 Last part (with extension):', publicIdWithFolder);
    console.log('🔍 Extracted public ID:', publicId);
    console.log('🔍 Full public ID with folder:', `user_documents/${publicId}`);

    if (!publicId || publicId.length === 0) {
      console.log('❌ Could not extract valid public ID from URL');
      return;
    }

    // Try different resource types in case the file was uploaded as image instead of raw
    const resourceTypes = ['raw', 'image'];
    let deleteResult = null;

    for (const resourceType of resourceTypes) {
      try {
        console.log(`🔄 Attempting delete with resource_type: ${resourceType}`);
        deleteResult = await cloudinary.uploader.destroy(`user_documents/${publicId}`, {
          resource_type: resourceType
        });
        
        console.log(`✅ Delete result for ${resourceType}:`, deleteResult);
        
        if (deleteResult.result === 'ok') {
          console.log(`✅ Document successfully deleted from Cloudinary using ${resourceType}`);
          return deleteResult;
        } else if (deleteResult.result === 'not found') {
          console.log(`⚠️ File not found with ${resourceType}, trying next resource type...`);
          continue;
        }
      } catch (error) {
        console.log(`❌ Error deleting with ${resourceType}:`, error.message);
        continue;
      }
    }

    // If we get here, all resource types failed
    console.log('❌ Failed to delete document from Cloudinary with any resource type');
    console.log('❌ Final delete result:', deleteResult);
    
  } catch (error) {
    console.error("❌ Error in deleteCloudinaryUserDocument:", error);
  }
};

export const handleUserDocumentUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        createCustomError(
          "File size is too large. Max size is 10MB",
          StatusCode.BAD_REQ
        )
      );
    }
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  if (error) {
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  next();
};

// Middleware to handle the file upload and add the URL to the request body
export const processUserDocumentUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔍 processUserDocumentUpload called');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('Request file:', req.file);
  
  uploadUserDocument(req, res, (error) => {
    console.log('📁 uploadUserDocument callback executed');
    console.log('Error:', error);
    console.log('File after upload:', req.file);
    
    if (error) {
      console.log('❌ Upload error:', error.message);
      return handleUserDocumentUploadError(error, req, res, next);
    }

    if (req.file) {
      console.log('✅ File uploaded successfully:', req.file.path);
      // Add the Cloudinary URL to the request body
      req.body.documentUrl = req.file.path;
    } else {
      console.log('⚠️ No file found in request');
    }

    next();
  });
};

const courseThumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_COURSE_THUMBNAILS_FOLDER || "course_thumbnails",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ 
      width: parseInt(process.env.CLOUDINARY_THUMBNAIL_WIDTH || "1280"), 
      height: parseInt(process.env.CLOUDINARY_THUMBNAIL_HEIGHT || "720"), 
      crop: "limit" 
    }],
  } as any,
});

// Video Storage Configuration
const courseVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_COURSE_VIDEOS_FOLDER || "course_videos",
    allowed_formats: ["mp4", "mov", "avi"],
    resource_type: "video",
  } as any,
});

export const uploadCourseMaterials = multer({
  storage: multer.memoryStorage(), // Use memory storage to handle multiple files
  limits: {
    fileSize: 1024 * 1024 * parseInt(process.env.MAX_FILE_SIZE_MB || "505"), // File size limit from env
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else if (
      file.fieldname === "video" &&
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
const isFileDictionary = (
  files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
): files is { [fieldname: string]: Express.Multer.File[] } => {
  return typeof files === "object" && !Array.isArray(files);
};

export const processCourseMaterialsUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadCourseMaterials(req, res, async (error) => {
    if (error) {
      return handleMulterError(error, req, res, next);
    }

    try {
      const uploadPromises = [];

      // Thumbnail Upload
      if (req.files && isFileDictionary(req.files) && req.files["thumbnail"]) {
        const thumbnailFile = (req.files as { [fieldname: string]: Express.Multer.File[] })["thumbnail"][0];
        
        const thumbnailUploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: process.env.CLOUDINARY_COURSE_THUMBNAILS_FOLDER || "course_thumbnails",
              transformation: [{ 
                width: parseInt(process.env.CLOUDINARY_THUMBNAIL_WIDTH || "1280"), 
                height: parseInt(process.env.CLOUDINARY_THUMBNAIL_HEIGHT || "720"), 
                crop: "limit" 
              }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Write file buffer to stream
          uploadStream.end(thumbnailFile.buffer);
        });

        uploadPromises.push(
          thumbnailUploadPromise.then((result: any) => {
            req.body.thumbnailUrl = result.secure_url;
            console.log("hi",req.body.thumbnailUrl)
          })
        );
      }

      // Video Upload
      if (req.files&& isFileDictionary(req.files)  && req.files["video"]) {
        const videoFile = (req.files as { [fieldname: string]: Express.Multer.File[] })["video"][0];
        
        const videoUploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: process.env.CLOUDINARY_COURSE_VIDEOS_FOLDER || "course_videos",
              resource_type: "video",
              timeout: parseInt(process.env.CLOUDINARY_VIDEO_TIMEOUT || "180000") // Video timeout from env
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Write file buffer to stream
          uploadStream.end(videoFile.buffer);
        });

        uploadPromises.push(
          videoUploadPromise.then((result: any) => {
            req.body.videoUrl = result.secure_url;
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      next();
    } catch (uploadError) {
      await deleteUploadedFiles(req.body.thumbnailUrl, req.body.videoUrl);
      console.error("Upload error:", uploadError);
      return res.status(500).json({
        message: "Error uploading files",
        error: uploadError,
      });
    }
  });
};

export const deleteUploadedFiles = async (thumbnailUrl?: string, videoUrl?: string) => {
  try {
    // Delete thumbnail if uploaded
    if (thumbnailUrl) {
      const thumbnailPublicId = thumbnailUrl
        .split('/')
        .pop()
        ?.split('.')[0];
      
      if (thumbnailPublicId) {
        await cloudinary.uploader.destroy(`course_thumbnails/${thumbnailPublicId}`);
      }
    }

    // Delete video if uploaded
    if (videoUrl) {
      const videoPublicId = videoUrl
        .split('/')
        .pop()
        ?.split('.')[0];
      
      if (videoPublicId) {
        await cloudinary.uploader.destroy(`course_videos/${videoPublicId}`, { 
          resource_type: 'video' 
        });
      }
    }
  } catch (deleteError) {
    console.error('Error deleting uploaded files:', deleteError);
  }
};
