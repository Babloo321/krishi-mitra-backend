import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import FarmerDetail from '../models/farmerDetails.model.js';

export const farmerDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const { phone, address, location, landSize, cropsGrown } = req.body;
  
    if (!phone || !address || !location || !location.district || !location.state || !location.pincode) {
      throw new ApiError(400, "Missing required fields");
    }
  
    // Check if farmer details already exist
    const existingDetails = await FarmerDetail.findOne({ farmer: userId });
    if (existingDetails) {
      throw new ApiError(409, "Farmer details already submitted");
    }
  
    // Create new farmer details
    const newDetails = await FarmerDetail.create({
      name: req.user.name || req.user.userName,
      phone,
      address,
      location,
      landSize,
      cropsGrown,
      farmer: userId,
    });
    return res
    .status(201)
    .json(new ApiResponse(201, newDetails, "Farmer details submitted successfully"));
  } catch (error) {
    throw new ApiError(500, "❌Network Error❌")
  }

});

export const getFarmerDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    // Check if farmer details exist for this user
    const farmerDetails = await FarmerDetail.findOne({ farmer: userId });

    if (!farmerDetails) {
      throw new ApiError(404, "Farmer details not found");
    }

    return res.status(200).json(
      new ApiResponse(200, farmerDetails, "Farmer details fetched successfully")
    );
  } catch (error) {
    // Optional: add specific logging if needed
    throw new ApiError(500, "❌ Failed to fetch farmer details ❌");
  }
});
