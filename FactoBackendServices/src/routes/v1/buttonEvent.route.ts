import express from "express";
import { trackButtonEvent, getButtonEvents, getButtonEventAnalytics } from "@/controllers/buttonEvent.controller";
import { verifyToken } from "@/middlewares/auth";

const router = express.Router();

// Public routes (no authentication required)
router.post("/track", trackButtonEvent);

// Protected routes (authentication required)
router.get("/", verifyToken, getButtonEvents);
router.get("/analytics", verifyToken, getButtonEventAnalytics);

export default router;
