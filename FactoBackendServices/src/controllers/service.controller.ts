import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";

export const getAllServices = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Filter only active services for public endpoint
        const services = await db.Service.find({ isActive: true });
  
        const response = sendSuccessApiResponse("Services retrieved successfully", {
          services,
        });
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );