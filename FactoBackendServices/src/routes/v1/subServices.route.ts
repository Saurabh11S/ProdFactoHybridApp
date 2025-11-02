import { controllers } from "@/controllers";
import { verifyToken } from "@/middlewares/auth";
import express from "express";
import { db } from "@/models";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { StatusCode } from "@/constants/constants";
import bigPromise from "@/middlewares/bigPromise";
import { createCustomError } from "@/errors/customAPIError";
import { Request, Response, NextFunction } from "express";

interface IRequests {
  name: string;
  priceModifier: number;
  needsQuotation: boolean;
  inputType: "dropdown" | "checkbox";
  isMultipleSelect?: boolean;
  options?: { 
    title: string;
    priceModifier: number;
    needsQuotation: boolean;
  }[];
}

const router = express.Router();


router.get('/service/:serviceId',controllers.subServiceController.getAllSubServicesbyServiceId);
router.get("/all",controllers.subServiceController.getAllSubServices);
router.get("/my-services",verifyToken,controllers.subServiceController.getYourServices);

// Add sample sub-services endpoint for testing
router.post('/seed', bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if sub-services already exist
      const existingSubServices = await db.SubService.find();
      if (existingSubServices.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Sub-services already exist in database",
          data: { subServices: existingSubServices }
        });
      }

      // Get all services first
      const services = await db.Service.find();
      if (services.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No services found. Please create services first."
        });
      }

      // Sample sub-services data
      const sampleSubServices = [
        {
          serviceCode: 'itr-1',
          serviceId: services.find(s => s.title === 'Tax Services')?._id,
          title: 'ITR-1 Filing',
          description: 'Salaried + 1 House property Plan',
          features: [
            'Error-free filing with government portal',
            'Priority CA consultation',
            'Express processing',
            'Document storage for 2 years',
            'Post-service support',
            'Tax planning advice'
          ],
          price: 500,
          period: 'one_time',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 500,
            period: 'one_time'
          }]
        },
        {
          serviceCode: 'itr-2',
          serviceId: services.find(s => s.title === 'Tax Services')?._id,
          title: 'ITR-2 Filing',
          description: 'Multiple House Properties + Capital Gains',
          features: [
            'Complex tax calculations',
            'Capital gains handling',
            'Multiple property management',
            'Expert CA support',
            'Audit support if required'
          ],
          price: 1500,
          period: 'one_time',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 1500,
            period: 'one_time'
          }]
        },
        {
          serviceCode: 'gst-reg',
          serviceId: services.find(s => s.title === 'Business Registration')?._id,
          title: 'GST Registration',
          description: 'Complete GST registration process',
          features: [
            'GST registration application',
            'Document preparation',
            'PAN verification',
            'Bank account linking',
            'GST certificate delivery'
          ],
          price: 2000,
          period: 'one_time',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 2000,
            period: 'one_time'
          }]
        },
        {
          serviceCode: 'company-reg',
          serviceId: services.find(s => s.title === 'Business Registration')?._id,
          title: 'Company Registration',
          description: 'Private Limited Company Registration',
          features: [
            'Company name approval',
            'DIN and DSC application',
            'MOA and AOA preparation',
            'ROC filing',
            'Certificate delivery'
          ],
          price: 8000,
          period: 'one_time',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 8000,
            period: 'one_time'
          }]
        },
        {
          serviceCode: 'investment-plan',
          serviceId: services.find(s => s.title === 'Financial Planning')?._id,
          title: 'Investment Planning',
          description: 'Personalized investment strategy',
          features: [
            'Risk assessment',
            'Portfolio analysis',
            'Investment recommendations',
            'Regular monitoring',
            'Performance tracking'
          ],
          price: 3000,
          period: 'yearly',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 3000,
            period: 'yearly'
          }]
        },
        {
          serviceCode: 'legal-consult',
          serviceId: services.find(s => s.title === 'Legal Services')?._id,
          title: 'Legal Consultation',
          description: 'Expert legal advice and consultation',
          features: [
            'Legal issue analysis',
            'Expert consultation',
            'Document review',
            'Legal strategy',
            'Follow-up support'
          ],
          price: 2500,
          period: 'one_time',
          isActive: true,
          requests: [] as IRequests[],
          pricingStructure: [{
            price: 2500,
            period: 'one_time'
          }]
        }
      ];

      // Filter out sub-services that don't have a valid serviceId
      const validSubServices = sampleSubServices.filter(sub => sub.serviceId);

      // Create sub-services
      const createdSubServices = await db.SubService.insertMany(validSubServices);

      const response = sendSuccessApiResponse(
        "Sample sub-services created successfully",
        { subServices: createdSubServices }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
));


export default router;