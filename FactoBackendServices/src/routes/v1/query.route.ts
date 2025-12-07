import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { optionalVerifyToken } from "../../middlewares/auth";

// Use optional authentication - if user is logged in, validate their profile
router.route("/").post(optionalVerifyToken, controllers.queryController.addQuery);
router.route("/consultation").post(optionalVerifyToken, controllers.queryController.scheduleConsultation);
// router.route("/:id").get(controllers.blogController.getBlogById);

export default router;