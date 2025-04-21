
import { OurProduct } from '../models/ourProduct.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.model.js';
// Create Product
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, category, description } = req.body;

  const userId = req.user?._id;
  const admin = await User.findOne({ _id: userId, role: 'admin' });
if(!admin){
  throw new ApiError(401,"User not found");
}
  // Basic validation
  if (!name || !price) {
    throw new ApiError(400, 'Name and price are required');
  }

  // Check for duplicates
  const existingProduct = await OurProduct.findOne({ name: name.trim() });
  if (existingProduct) {
    throw new ApiError(409, 'Product with this name already exists');
  }

  const product = await OurProduct.create({
    name: name.trim(),
    price,
    category,
    description
  });

  return res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully')
  );
});

// Delete Product(s)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Product ID(s) are required for deletion');
  }

  const result = await Product.deleteMany({ _id: { $in: ids } });

  return res.status(200).json(
    new ApiResponse(200, result, `${result.deletedCount} product(s) deleted`)
  );
});
