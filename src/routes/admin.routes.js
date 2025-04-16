import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middlewares.js'
// import { upload } from "../middlewares/multer.middleware.js";
import { getFarmerAndBuyer } from '../controllers/Admin.controller.js';
const adminRouter = Router();
adminRouter.route("/get/allUsers").get(verifyJWT, getFarmerAndBuyer);
export default adminRouter;