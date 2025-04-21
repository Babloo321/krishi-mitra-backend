import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middlewares.js'
// import { upload } from "../middlewares/multer.middleware.js";
import { getFarmerAndBuyer, sendWhatsAppMessage } from '../controllers/Admin.controller.js';
const adminRouter = Router();
adminRouter.route("/get/allUsers").get(verifyJWT, getFarmerAndBuyer);
adminRouter.route("/user/message").post(verifyJWT, sendWhatsAppMessage);
export default adminRouter;