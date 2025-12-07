import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";
import { processUserDocumentUpload } from "@/middlewares/upload";

router.route("/upload/:subServiceId").post(verifyToken,processUserDocumentUpload,controllers.userDocumentController.uploadDocument);
router.route("/remove/:documentId").delete(verifyToken,controllers.userDocumentController.removeDocument);
router.route("/get").get(verifyToken,controllers.userDocumentController.fetchDocuments);
router.route("/getDocs/:userId").get(controllers.userDocumentController.fetchDocumentsUser);
router.route("/service/:serviceId").get(verifyToken,controllers.userDocumentController.fetchDocumentsByService);
router.route("/all").get(verifyToken,controllers.userDocumentController.fetchAllUserDocuments);
router.route("/requirements/service/:serviceId").get(verifyToken,controllers.userDocumentController.fetchDocumentRequirements);


export default router;