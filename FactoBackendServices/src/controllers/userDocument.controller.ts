import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { deleteCloudinaryUserDocument } from "@/middlewares/upload";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const uploadDocument = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const {subServiceId} = req.params;
      const { documentType, title, description } =
        req.body;
        const documentUrl =  req.body.documentUrl
      // Check for required fields
        console.log('Upload Debug:', {
          userId,
          subServiceId,
          documentType,
          title,
          documentUrl,
          hasFile: !!req.file,
          fileInfo: req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
          } : null
        })
      if (!userId || !subServiceId || !documentType || !title) {
        return next(
          createCustomError("Missing required fields", StatusCode.BAD_REQ)
        );
      }

      // Validate ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(subServiceId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      // Validate documentType
      if (!["required", "additional"].includes(documentType)) {
        return next(
          createCustomError("Invalid document type", StatusCode.BAD_REQ)
        );
      }

      // Check if a file was uploaded
      let userDocument = await db.UserDocument.findOne({
        userId,
        subServiceId,
        documentType,
        title,
      });

      if (userDocument) {
        // If a document exists, update it
        const oldDocumentUrl = userDocument.documentUrl;

        userDocument.description = description;
        userDocument.documentUrl = documentUrl;
        await userDocument.save();

        // Delete the old document from Cloudinary if the URL has changed
        if (oldDocumentUrl !== documentUrl) {
          await deleteCloudinaryUserDocument(oldDocumentUrl);
        }

        const response = sendSuccessApiResponse(
          "Document updated successfully",
          { userDocument }
        );
        return res.status(StatusCode.OK).send(response);
      } else {
        // If no document exists, create a new one
        userDocument = await db.UserDocument.create({
          userId,
          subServiceId,
          documentType,
          title,
          description,
          documentUrl,
        });

        const response = sendSuccessApiResponse(
          "Document uploaded successfully",
          { userDocument }
        );
        return res.status(StatusCode.CREATED).send(response);
      }
    } catch (error: any) {
      // If there's an error, we should delete the uploaded file from Cloudinary
      if (req.body.documentUrl) {
        await deleteCloudinaryUserDocument(req.body.documentUrl);
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update the removeDocument function to delete the file from Cloudinary
export const removeDocument = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?._id; // Assuming we're getting the userId from the authenticated user

      if (
        !mongoose.Types.ObjectId.isValid(documentId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const userDocument = await db.UserDocument.findOneAndDelete({
        _id: documentId,
        userId,
      });

      if (!userDocument) {
        return next(
          createCustomError(
            "Document not found or you don't have permission to delete it",
            StatusCode.NOT_FOUND
          )
        );
      }

      // Delete the file from Cloudinary
      console.log('🗑️ Controller: About to delete document from Cloudinary');
      console.log('🗑️ Controller: Document URL:', userDocument.documentUrl);
      
      const deleteResult = await deleteCloudinaryUserDocument(userDocument.documentUrl);
      
      console.log('🗑️ Controller: Cloudinary delete completed, result:', deleteResult);

      const response = sendSuccessApiResponse("Document removed successfully", {
        userDocument,
        cloudinaryDeleteResult: deleteResult
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const fetchDocuments = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id; // Get the user ID from the authenticated user
      const { subServiceId, documentType } = req.query;

      // Validate query parameters
      console.log(userId)

      // Build the filter object
      const filter: any = { userId };

      
      // Fetch documents from the database
      const userDocuments = await db.UserDocument.find(filter);

      if (!userDocuments || userDocuments.length === 0) {
        return next(
          createCustomError("No documents found for the given filters", StatusCode.NOT_FOUND)
        );
      }

      // Return the documents in the response
      const response = sendSuccessApiResponse("Documents fetched successfully", { userDocuments });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const fetchDocumentsUser = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(
          createCustomError("User ID is required", StatusCode.NOT_FOUND)
        );
      }

      // Fetch documents from the database
      const userDocuments = await db.UserDocument.find({ userId }).populate("subServiceId");

      if (!userDocuments || userDocuments.length === 0) {
        return next(
          createCustomError("No documents found for the given filters", StatusCode.NOT_FOUND)
        );
      }

      // Return the documents in the response
      const response = sendSuccessApiResponse(
        "Documents fetched successfully",
        { userDocuments }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// New endpoint to fetch documents for a specific service
export const fetchDocumentsByService = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
      const { serviceId } = req.params;

      if (!serviceId) {
        return next(
          createCustomError("Service ID is required", StatusCode.BAD_REQ)
        );
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      // Fetch documents for the specific service
      const userDocuments = await db.UserDocument.find({ 
        userId, 
        subServiceId: serviceId 
      }).populate("subServiceId");

      const response = sendSuccessApiResponse(
        "Service documents fetched successfully",
        { userDocuments }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// New endpoint to fetch all user documents with service details
export const fetchAllUserDocuments = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;

      // Fetch all documents with service details
      const userDocuments = await db.UserDocument.find({ userId })
        .populate("subServiceId")
        .sort({ createdAt: -1 });

      // Group documents by service
      const documentsByService = userDocuments.reduce((acc: any, doc: any) => {
        const serviceId = doc.subServiceId._id.toString();
        if (!acc[serviceId]) {
          acc[serviceId] = {
            service: doc.subServiceId,
            documents: []
          };
        }
        acc[serviceId].documents.push(doc);
        return acc;
      }, {});

      const response = sendSuccessApiResponse(
        "All user documents fetched successfully",
        { 
          totalDocuments: userDocuments.length,
          documentsByService: Object.values(documentsByService)
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Fetch document requirements for a service from master table (user-facing endpoint)
export const fetchDocumentRequirements = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        return next(
          createCustomError("Service ID is required", StatusCode.BAD_REQ)
        );
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      // Fetch document requirements for this sub-service from master table
      const requirements = await db.SubServiceRequirement.find({
        subServiceId: serviceId
      })
      .sort({ createdAt: 1 }) // Sort by creation date
      .lean(); // Use lean() for better performance

      const response = sendSuccessApiResponse(
        "Document requirements fetched successfully",
        {
          requirements: requirements.map(req => ({
            _id: req._id.toString(),
            title: req.title,
            description: req.description || '',
            isMandatory: req.isMandatory !== false // Default to true if not set
          }))
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
