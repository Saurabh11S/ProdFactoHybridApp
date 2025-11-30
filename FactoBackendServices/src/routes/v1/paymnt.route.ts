import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.route("/initiate-payment").post(verifyToken,controllers.paymentOrderController.initiatePayment);
router.route("/verify-payment").post(verifyToken,controllers.paymentOrderController.verifyPayment);
router.route("/razorpay-webhook").post(controllers.paymentOrderController.handleWebhook);
router.route("/getAllPayments").get(controllers.paymentOrderController.getAllPayments);
router.route("/payment-orders").get(verifyToken,controllers.paymentOrderController.getUserPaymentOrders);
router.route("/payment-orders").post(verifyToken,controllers.paymentOrderController.createPaymentOrder);

export default router;