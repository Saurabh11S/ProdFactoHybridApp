import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";


router.route("/sendOtp").post(controllers.authController.sendOtp);
router.route("/verifyOtp").post(controllers.authController.verifyOtp);
router.route("/signup").post(controllers.authController.signup);
router.route("/login").post(controllers.authController.loginWithPassword);
router.route("/refresh").post(controllers.authController.refreshToken);

// Test endpoint to check if auth routes are working
router.route("/test").get((req, res) => {
  res.json({ 
    success: true, 
    message: "Auth routes are working", 
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint to create a test user
router.route("/create-test-user").post(controllers.authController.createTestUser);

export default router;