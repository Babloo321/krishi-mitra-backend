import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
export const getFarmerAndBuyer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if(!userId){
    throw new ApiError(404,"You are not authorized");
  }
  const adminExists = await User.exists({ role: "admin" });

  if (adminExists) {
   try {
    const customers = await User.find({
      role: { $in: ["farmer", "buyer"] }
    }).select('-refreshToken -password -pictureId');
    
    
    if (!customers) {
      return res.status(404).json(new ApiResponse(404, null, "No matching user"));
    }
    return res.status(200).json(new ApiResponse(200, customers, "User fetched"));
    
   } catch (error) {
    throw new ApiError(501,"Data not found!");
   }
  } else {
    throw new ApiError(403,"You Are Not Verified for this Role");
  }
})


// export const deleteProduct = async (req, res) => {
//   if(!req.user?._id){
//     throw new ApiError(409, "You are unAuthorized.")
//   }
//   try {
//     // Get product IDs from params (expecting an array of IDs)
//     const productIds = req.params.ids.split(',');  // e.g., "productId1,productId2"
    
//     // Delete the products by IDs
//     const deletedProducts = await Product.deleteMany({
//       _id: { $in: productIds }
//     });

//     if (deletedProducts.deletedCount === 0) {
//       throw new ApiError(404, "No products found to delete");
//     }

//   } catch (error) {
//     throw new ApiError(500, "An error occurred while deleting products");
//   }
// };

import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export const sendWhatsAppMessage = asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    });
    // msg containe sid,message(in body) all message related information
    // console.log("message: ",msg.body)
    return res
    .status(200)
    .json(
      new ApiResponse(200, {sid: msg},"Message Send successfully")
    )
  } catch (err) {
    throw new ApiError(501,"Network error");
  }
});
