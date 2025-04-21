import ProductRequest from '../models/productRequest.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const handleProductRequest = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const requestedUserId = req.params.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID not found in request.");
  }

  if (!requestedUserId) {
    throw new ApiError(400, "Requested user ID is missing in the URL.");
  }

  const { name, email, mobile, message } = req.body;

  if (!name || !email || !mobile || !message) {
    throw new ApiError(400, "All fields are required.");
  }

  const incomingMessage = typeof message === 'string' ? message : String(message);

  const user = await User.findById(requestedUserId);
  if (!user) {
    throw new ApiError(400, "Invalid request: User does not exist.");
  }

  // Find existing product request for this user
  const existingRequest = await ProductRequest.findOne({ owner: requestedUserId });

  if (existingRequest) {
    const isSameInfo =
      existingRequest.name === name &&
      existingRequest.email === email &&
      existingRequest.mobile === mobile;

    if (isSameInfo) {
      // If name, email, and mobile match → update message array
      existingRequest.message.push(incomingMessage);
      await existingRequest.save();

      return res.status(200).json(
        new ApiResponse(200, existingRequest, "Message added to existing request.")
      );
    } else {
      // Info has changed → create a new request
      const newRequest = new ProductRequest({
        name,
        email,
        mobile,
        message: [incomingMessage],
        owner: requestedUserId,
      });

      await newRequest.save();

      return res.status(201).json(
        new ApiResponse(201, newRequest, "New request created due to updated contact information.")
      );
    }
  } else {
    // No previous request → create new one
    const newRequest = new ProductRequest({
      name,
      email,
      mobile,
      message: [incomingMessage],
      owner: requestedUserId,
    });

    await newRequest.save();

    return res.status(201).json(
      new ApiResponse(201, newRequest, "New product request created successfully.")
    );
  }
});


export const handleProductRequestQuery = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const requestedUserId = req.params.id; // ✅ Correct usage
  console.log("requested: ",requestedUserId);
  if (!userId) {
    throw new ApiError(403, "You are not authorized");
  }

  if (!requestedUserId) {
    throw new ApiError(403, "Requested user ID missing");
  }

  const existsUser = await User.findById(requestedUserId); // ✅ Added await
  if (!existsUser) {
    throw new ApiError(403, "You are not authorized for this service");
  }

  const query = await ProductRequest.find({owner:requestedUserId});
  if (!query || query.length === 0) {
    // Better to use 200 with message if returning content
    return res.status(200).json(
      new ApiResponse(200, [], "No queries found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, query, "Query found")
  );
});
