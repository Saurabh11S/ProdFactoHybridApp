import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllSubscriptions,
  getSubscriptionStats,
} from "@/controllers/newsletterSubscription.controller";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribeToNewsletter);
router.post("/unsubscribe", unsubscribeFromNewsletter);

// Admin routes (should be protected with auth middleware if needed)
router.get("/all", getAllSubscriptions);
router.get("/stats", getSubscriptionStats);

export default router;

