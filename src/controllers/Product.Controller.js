import Product from "../models/product.model.js";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import User from "../models/User.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

export const addProduct = asyncHandler(async (req, res) => {
  const product = req.body;

  if (req.role !== "admin") {
    throw new ApiError(403, "You can't add Product");
  }

  console.log('product: ',product);
  // ✅ Basic validation
  const requiredFields = ['name', 'price', 'brand', 'productType', 'color', 'expiry'];
  for (let field of requiredFields) {
    if (!product[field]) {
      throw new ApiError(400, `Missing required field: ${field}`);
    }
  }

  // ✅ Get uploaded image from multer
  const imageFile = req.file;
  if (!imageFile) {
    throw new ApiError(400, "Product must have exactly 1 image");
  }

  // ✅ Upload to Cloudinary
  const result = await uploadOnCloudinary(imageFile.path);
  if (!result?.secure_url) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  // ✅ Check for duplicate product
  const isDuplicate = await Product.findOne({
    name: product.name,
    brand: product.brand,
    expiry: product.expiry,
    color: product.color
  });

  if (isDuplicate) {
    throw new ApiError(409, `Duplicate product found: ${product.name} (${product.brand}, ${product.color})`);
  }

  // ✅ Create and save product
  const newProduct = await Product.create({
    ...product,
    image: result.secure_url,
    imagePublicId: result.public_id,
    owner: req.user?._id
  });

  res.status(201).json(new ApiResponse(201, newProduct, "Product added successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { ids } = req.params;
  const role = req.role;

  if (role !== 'admin') {
    throw new ApiError(403, "Only admins are allowed to delete products");
  }

  if (!ids) {
    throw new ApiError(400, "No product IDs provided in params");
  }

  const productIds = ids.split(',').map(id => id.trim());

  if (productIds.length === 0) {
    throw new ApiError(400, "At least one product ID is required");
  }

  if (productIds.length > 10) {
    throw new ApiError(400, "Cannot delete more than 10 products at a time");
  }

  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length === 0) {
    throw new ApiError(404, "No matching products found for deletion");
  }

  const foundIds = products.map(p => p._id.toString());
  const notFoundIds = productIds.filter(id => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    throw new ApiError(404, `Some product IDs not found: ${notFoundIds.join(", ")}`);
  }

  // ✅ Delete associated images from Cloudinary
  for (const product of products) {
    if (product.imagePublicId && product.image) {
      await deleteFromCloudinary(product.imagePublicId, product.image);
    }
  }

  // ✅ Delete products from MongoDB
  const result = await Product.deleteMany({ _id: { $in: productIds } });

  res.status(200).json(new ApiResponse(200, result, "Products and images deleted successfully"));
});



export const getProducts = asyncHandler(async(req, res) => {
  try {
    const userId = req.user?._id;
    const role = req.role;

    // If the user is a farmer or buyer, filter products based on user ID
    if (role === 'farmer' || role === 'buyer' || role === 'admin') {
      // Check if user exists in the database
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        throw new ApiError(404, 'User not found');
      }
      let products;
      if(role === 'buyer'){
        products = await Product.find({productType: { $nin: ['seed', 'fertilizer'] }}).select('-owner');
      }else{
        products = await Product.find().select('-owner');
      }
      res.status(200).json(new ApiResponse(200, products, 'Products retrieved successfully'));
    } else{
      throw new ApiError(404, "You are not farmer or buyer")
    }
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
});


export const getSeedsAndFertilizers = asyncHandler(async(req, res) => {
  try {
    const userId = req.user?._id;
    const role = req.role;

    if (role === 'farmer' || role === 'buyer') {
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        throw new ApiError(404, 'User not found');
      }

      let query = {};
      if (role !== 'admin') {
        query.productType = { $in: ['seed', 'fertilizer'] };
      }

      const products = await Product.find(query).select('-owner');
      res
        .status(200)
        .json(new ApiResponse(200, products, 'Products retrieved successfully'));
    } else {
      throw new ApiError(404, 'You are not farmer or buyer');
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiResponse(500, null, error.message || 'Server Error'));
  }
});
