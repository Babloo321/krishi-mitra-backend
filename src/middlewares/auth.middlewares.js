import User from "../models/User.model.js";
import ApiError from '../utils/ApiError.js';
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.headers["authorization"];
    
    if (token?.startsWith("Bearer ")) {
      token = token.slice(7); // remove Bearer 
    }

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    try {
      const user = await User.findById(decodedToken?._id).select("-password -createdAt -isGoogleAuth");    
      req.user = user;
      req.role = user.role;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid Access Token");
    }
  } catch (error) {
    throw new ApiError(401, "Invalid Access Token");
  }
})
