import { controllers } from "@/controllers";
import express from "express";
import { db } from "@/models";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { StatusCode } from "@/constants/constants";
import bigPromise from "@/middlewares/bigPromise";
import { createCustomError } from "@/errors/customAPIError";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get('/',controllers.serviceController.getAllServices);

// Add sample services endpoint for testing
router.post('/seed', bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if services already exist
      const existingServices = await db.Service.find();
      if (existingServices.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Services already exist in database",
          data: { services: existingServices }
        });
      }

      // Sample services data
      const sampleServices = [
        {
          title: 'Tax Services',
          category: 'Tax',
          description: 'Comprehensive tax filing and consultation services',
          features: [
            'Expert tax consultation',
            'Error-free filing',
            'Document verification',
            'Post-filing support'
          ],
          isActive: true,
          icon: 'http'
        },
        {
          title: 'Business Registration',
          category: 'Business',
          description: 'Complete business registration and compliance services',
          features: [
            'Company registration',
            'GST registration',
            'Compliance management',
            'Annual filing'
          ],
          isActive: true,
          icon: 'http'
        },
        {
          title: 'Financial Planning',
          category: 'Finance',
          description: 'Personal and business financial planning services',
          features: [
            'Investment planning',
            'Retirement planning',
            'Insurance consultation',
            'Wealth management'
          ],
          isActive: true,
          icon: 'http'
        },
        {
          title: 'Legal Services',
          category: 'Legal',
          description: 'Legal consultation and documentation services',
          features: [
            'Legal consultation',
            'Document preparation',
            'Contract review',
            'Legal compliance'
          ],
          isActive: true,
          icon: 'http'
        }
      ];

      // Create services
      const createdServices = await db.Service.insertMany(sampleServices);

      const response = sendSuccessApiResponse(
        "Sample services created successfully",
        { services: createdServices }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
));

export default router;