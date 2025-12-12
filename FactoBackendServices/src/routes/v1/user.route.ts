import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.get('/profile', verifyToken, controllers.userController.getUserDetails);
router.put('/profile', verifyToken, controllers.userController.editOwnProfile);
router.get("/documents",verifyToken, controllers.userController.getAllDocumentsByUserId);
router.get('/purchases', verifyToken, controllers.userController.getUserPurchases);
router.post('/save-service', verifyToken, controllers.userController.saveUserService);
router.post('/register-push-token', verifyToken, controllers.userController.registerPushToken);

export default router;