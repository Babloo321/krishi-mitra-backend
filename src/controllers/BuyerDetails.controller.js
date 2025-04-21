import BuyerDetails from "../models/buyerdetails.model.js"; // adjust path if needed
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Submit or update buyer details
// @route   POST /api/v2/buyer/submit/info
// @access  Private
export const buyerDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // assuming auth middleware sets this
  const { name, phone, address, companyName, location } = req.body;

  try {
    if (!phone || !address || !companyName || !location?.district || !location?.state || !location?.pincode) {
      throw new ApiError(400, "All required fields must be filled");
    }
  
    // Check if buyer details already exist
    const existing = await BuyerDetails.findOne({ buyer: userId });
    if (existing) {
      throw new ApiError(409, "Buyer details already exist for this user");
    }
  
    const buyerInfo = await BuyerDetails.create({
      name,
      phone,
      address,
      companyName,
      location,
      buyer: userId,
    });
  
    return res.status(201).json(
      new ApiResponse(201, buyerInfo, "Buyer details submitted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Network Error")
  }
});
