import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessTokenGenerator, googleAuthHandler, getCurrentUser } from '../controllers/User.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(upload.single("picture"),registerUser);
userRouter.route("/me").get(verifyJWT,getCurrentUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").patch(verifyJWT,logoutUser);
userRouter.route("/refresh-token").post(refreshAccessTokenGenerator)
userRouter.post("/google-auth", googleAuthHandler);
export default userRouter;