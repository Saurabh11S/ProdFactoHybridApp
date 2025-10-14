import express from "express";
import { 
  createConsultationRequest, 
  getConsultationRequests, 
  updateConsultationRequestStatus,
  getConsultationRequestAnalytics 
} from "@/controllers/consultationRequest.controller";
import { verifyToken } from "@/middlewares/auth";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", createConsultationRequest);

// Protected routes (authentication required)
router.get("/", verifyToken, getConsultationRequests);
router.put("/:id/status", verifyToken, updateConsultationRequestStatus);
router.get("/analytics", verifyToken, getConsultationRequestAnalytics);

export default router;
